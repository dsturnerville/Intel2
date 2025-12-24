import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Disposition, DispositionProperty, Property, DispositionDefaults } from '@/types/disposition';
import { calculatePropertyUnderwriting, calculateDispositionAggregates } from '@/utils/calculations';
import { Tables } from '@/integrations/supabase/types';

// Transform database row to Disposition type
function transformDisposition(row: Tables<'dispositions'>): Disposition {
  const defaults = row.defaults as unknown as DispositionDefaults;
  
  return {
    id: row.id,
    name: row.name,
    status: row.status,
    type: row.type,
    createdAt: row.created_at,
    createdBy: row.created_by || 'Unknown',
    updatedAt: row.updated_at,
    updatedBy: row.updated_by || 'Unknown',
    targetListDate: row.target_list_date || undefined,
    targetCloseDate: row.target_close_date || undefined,
    exitStrategyNotes: row.exit_strategy_notes || undefined,
    investmentThesis: row.investment_thesis || undefined,
    defaults: defaults || {
      salePriceMethodology: 'Comp Based',
      capRate: 0.055,
      discountToMarketValue: 0.03,
      brokerFeePercent: 0.05,
      closingCostPercent: 0.02,
      sellerConcessionsPercent: 0.01,
      makeReadyCapexPercent: 0.015,
      holdingPeriodMonths: 3,
    },
    markets: row.markets || [],
    tags: row.tags || [],
  };
}

// Transform database row to Property type
function transformProperty(row: Tables<'properties'>): Property {
  return {
    id: row.id,
    address: row.address,
    city: row.city,
    state: row.state,
    zipCode: row.zip_code,
    market: row.market,
    beds: row.beds,
    baths: Number(row.baths),
    sqft: row.sqft,
    yearBuilt: row.year_built || 2000,
    lotSize: row.lot_size || 0,
    acquisitionDate: row.acquisition_date || '',
    acquisitionPrice: Number(row.acquisition_price) || 0,
    acquisitionBasis: Number(row.acquisition_basis) || 0,
    currentRent: Number(row.current_rent) || 0,
    occupancyStatus: row.occupancy_status,
    leaseEndDate: row.lease_end_date || undefined,
    estimatedMarketValue: Number(row.estimated_market_value) || 0,
    lastAppraisalDate: row.last_appraisal_date || undefined,
    lastAppraisalValue: row.last_appraisal_value ? Number(row.last_appraisal_value) : undefined,
  };
}

export interface DispositionWithAggregates {
  disposition: Disposition;
  aggregates: ReturnType<typeof calculateDispositionAggregates>;
  propertyCount: number;
}

export function useDispositions() {
  const [dispositions, setDispositions] = useState<Disposition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDispositions();
  }, []);

  async function fetchDispositions() {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('dispositions')
        .select('*')
        .order('updated_at', { ascending: false });

      if (fetchError) throw fetchError;

      const transformed = (data || []).map(transformDisposition);
      setDispositions(transformed);
    } catch (err) {
      console.error('Error fetching dispositions:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch dispositions');
    } finally {
      setLoading(false);
    }
  }

  return { dispositions, loading, error, refetch: fetchDispositions };
}

export function useDispositionProperties(dispositionId: string) {
  const [properties, setProperties] = useState<DispositionProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (dispositionId) {
      fetchDispositionProperties();
    }
  }, [dispositionId]);

  async function fetchDispositionProperties() {
    try {
      setLoading(true);
      setError(null);

      // Fetch disposition with its defaults
      const { data: dispositionData, error: dispError } = await supabase
        .from('dispositions')
        .select('*')
        .eq('id', dispositionId)
        .maybeSingle();

      if (dispError) throw dispError;
      if (!dispositionData) {
        setProperties([]);
        return;
      }

      const disposition = transformDisposition(dispositionData);

      // Fetch disposition_properties with related property data
      const { data: dpData, error: dpError } = await supabase
        .from('disposition_properties')
        .select(`
          *,
          properties (*)
        `)
        .eq('disposition_id', dispositionId);

      if (dpError) throw dpError;

      const transformed: DispositionProperty[] = (dpData || []).map((dp) => {
        const propertyRow = dp.properties as Tables<'properties'>;
        const property = transformProperty(propertyRow);
        
        const inputs = {
          useDispositionDefaults: dp.use_disposition_defaults,
          salePriceMethodology: dp.sale_price_methodology || undefined,
          capRate: dp.cap_rate ? Number(dp.cap_rate) : undefined,
          discountToMarketValue: dp.discount_to_market_value ? Number(dp.discount_to_market_value) : undefined,
          flatSalePrice: dp.flat_sale_price ? Number(dp.flat_sale_price) : undefined,
          brokerFeePercent: dp.broker_fee_percent ? Number(dp.broker_fee_percent) : undefined,
          closingCostPercent: dp.closing_cost_percent ? Number(dp.closing_cost_percent) : undefined,
          sellerConcessionsPercent: dp.seller_concessions_percent ? Number(dp.seller_concessions_percent) : undefined,
          makeReadyCapexPercent: dp.make_ready_capex_percent ? Number(dp.make_ready_capex_percent) : undefined,
          holdingPeriodMonths: dp.holding_period_months || undefined,
        };

        const outputs = calculatePropertyUnderwriting(property, inputs, disposition.defaults);

        return {
          id: dp.id,
          dispositionId: dp.disposition_id,
          propertyId: dp.property_id,
          property,
          inputs,
          outputs,
        };
      });

      setProperties(transformed);
    } catch (err) {
      console.error('Error fetching disposition properties:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch properties');
    } finally {
      setLoading(false);
    }
  }

  return { properties, loading, error, refetch: fetchDispositionProperties };
}

export function useMarkets() {
  const [markets, setMarkets] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMarkets();
  }, []);

  async function fetchMarkets() {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('market');

      if (error) throw error;

      const uniqueMarkets = [...new Set((data || []).map(p => p.market))];
      setMarkets(uniqueMarkets.sort());
    } catch (err) {
      console.error('Error fetching markets:', err);
    } finally {
      setLoading(false);
    }
  }

  return { markets, loading };
}

export function useDispositionsWithAggregates() {
  const { dispositions, loading: dispositionsLoading, error, refetch } = useDispositions();
  const [dispositionsWithAggregates, setDispositionsWithAggregates] = useState<DispositionWithAggregates[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!dispositionsLoading && dispositions.length >= 0) {
      fetchAggregates();
    }
  }, [dispositions, dispositionsLoading]);

  async function fetchAggregates() {
    if (dispositions.length === 0) {
      setDispositionsWithAggregates([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Fetch all disposition_properties with property data for aggregates
      const { data: allDpData, error: dpError } = await supabase
        .from('disposition_properties')
        .select(`
          *,
          properties (*)
        `)
        .in('disposition_id', dispositions.map(d => d.id));

      if (dpError) throw dpError;

      const result: DispositionWithAggregates[] = dispositions.map(disposition => {
        const dispProperties = (allDpData || []).filter(dp => dp.disposition_id === disposition.id);
        
        const transformedProperties: DispositionProperty[] = dispProperties.map(dp => {
          const propertyRow = dp.properties as Tables<'properties'>;
          const property = transformProperty(propertyRow);
          
          const inputs = {
            useDispositionDefaults: dp.use_disposition_defaults,
            flatSalePrice: dp.flat_sale_price ? Number(dp.flat_sale_price) : undefined,
          };

          const outputs = calculatePropertyUnderwriting(property, inputs, disposition.defaults);

          return {
            id: dp.id,
            dispositionId: dp.disposition_id,
            propertyId: dp.property_id,
            property,
            inputs,
            outputs,
          };
        });

        const aggregates = calculateDispositionAggregates(transformedProperties);

        return {
          disposition,
          aggregates,
          propertyCount: transformedProperties.length,
        };
      });

      setDispositionsWithAggregates(result);
    } catch (err) {
      console.error('Error fetching aggregates:', err);
    } finally {
      setLoading(false);
    }
  }

  return { 
    dispositionsWithAggregates, 
    loading: dispositionsLoading || loading, 
    error,
    refetch 
  };
}
