import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Disposition, DispositionProperty, Property, DispositionDefaults, PropertyUnderwritingInputs } from '@/types/disposition';
import { calculatePropertyUnderwriting, calculateDispositionAggregates } from '@/utils/calculations';
import { Tables, TablesUpdate } from '@/integrations/supabase/types';

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

// Hook to fetch a single disposition by ID
export function useDisposition(dispositionId: string | undefined) {
  const [disposition, setDisposition] = useState<Disposition | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDisposition = useCallback(async () => {
    if (!dispositionId || dispositionId === 'new') {
      setDisposition(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('dispositions')
        .select('*')
        .eq('id', dispositionId)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (data) {
        setDisposition(transformDisposition(data));
      } else {
        setDisposition(null);
      }
    } catch (err) {
      console.error('Error fetching disposition:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch disposition');
    } finally {
      setLoading(false);
    }
  }, [dispositionId]);

  useEffect(() => {
    fetchDisposition();
  }, [fetchDisposition]);

  return { disposition, loading, error, refetch: fetchDisposition };
}

export function useDispositionProperties(dispositionId: string | undefined) {
  const [properties, setProperties] = useState<DispositionProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDispositionProperties = useCallback(async () => {
    if (!dispositionId || dispositionId === 'new') {
      setProperties([]);
      setLoading(false);
      return;
    }

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
        
        const inputs: PropertyUnderwritingInputs = {
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
  }, [dispositionId]);

  useEffect(() => {
    fetchDispositionProperties();
  }, [fetchDispositionProperties]);

  return { properties, loading, error, refetch: fetchDispositionProperties, setProperties };
}

// Hook to fetch available properties (not already in the disposition)
export function useAvailableProperties(existingPropertyIds: string[]) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAvailableProperties();
  }, [existingPropertyIds.join(',')]);

  async function fetchAvailableProperties() {
    try {
      setLoading(true);

      let query = supabase.from('properties').select('*');
      
      if (existingPropertyIds.length > 0) {
        query = query.not('id', 'in', `(${existingPropertyIds.join(',')})`);
      }

      const { data, error } = await query.order('address');

      if (error) throw error;

      const transformed = (data || []).map(transformProperty);
      setProperties(transformed);
    } catch (err) {
      console.error('Error fetching available properties:', err);
    } finally {
      setLoading(false);
    }
  }

  return { properties, loading, refetch: fetchAvailableProperties };
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
          
          const inputs: PropertyUnderwritingInputs = {
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

// Mutation hooks for saving disposition data
export function useDispositionMutations() {
  const [saving, setSaving] = useState(false);

  const createDisposition = async (
    data: {
      name: string;
      type: 'Single Property' | 'Portfolio';
      markets?: string[];
      targetListDate?: string;
      targetCloseDate?: string;
      investmentThesis?: string;
      exitStrategyNotes?: string;
      defaults?: DispositionDefaults;
    }
  ): Promise<{ success: boolean; id?: string; error?: string }> => {
    try {
      setSaving(true);

      const defaultDefaults: DispositionDefaults = {
        salePriceMethodology: 'Comp Based',
        capRate: 0.055,
        discountToMarketValue: 0.03,
        brokerFeePercent: 0.05,
        closingCostPercent: 0.02,
        sellerConcessionsPercent: 0.01,
        makeReadyCapexPercent: 0.015,
        holdingPeriodMonths: 3,
      };

      const { data: result, error } = await supabase
        .from('dispositions')
        .insert({
          name: data.name,
          type: data.type,
          status: 'Draft',
          markets: data.markets || [],
          target_list_date: data.targetListDate || null,
          target_close_date: data.targetCloseDate || null,
          investment_thesis: data.investmentThesis || null,
          exit_strategy_notes: data.exitStrategyNotes || null,
          defaults: JSON.parse(JSON.stringify(data.defaults || defaultDefaults)),
        })
        .select('id')
        .single();

      if (error) throw error;

      return { success: true, id: result.id };
    } catch (err) {
      console.error('Error creating disposition:', err);
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Failed to create disposition' 
      };
    } finally {
      setSaving(false);
    }
  };

  const updateDisposition = async (
    dispositionId: string, 
    updates: Partial<Disposition>
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setSaving(true);

      const dbUpdates: TablesUpdate<'dispositions'> = {};
      
      if (updates.status !== undefined) dbUpdates.status = updates.status;
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.defaults !== undefined) dbUpdates.defaults = JSON.parse(JSON.stringify(updates.defaults));
      if (updates.targetListDate !== undefined) dbUpdates.target_list_date = updates.targetListDate || null;
      if (updates.targetCloseDate !== undefined) dbUpdates.target_close_date = updates.targetCloseDate || null;
      if (updates.investmentThesis !== undefined) dbUpdates.investment_thesis = updates.investmentThesis || null;
      if (updates.exitStrategyNotes !== undefined) dbUpdates.exit_strategy_notes = updates.exitStrategyNotes || null;
      if (updates.markets !== undefined) dbUpdates.markets = updates.markets;
      if (updates.tags !== undefined) dbUpdates.tags = updates.tags;
      
      dbUpdates.updated_at = new Date().toISOString();

      const { error } = await supabase
        .from('dispositions')
        .update(dbUpdates)
        .eq('id', dispositionId);

      if (error) throw error;

      return { success: true };
    } catch (err) {
      console.error('Error updating disposition:', err);
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Failed to update disposition' 
      };
    } finally {
      setSaving(false);
    }
  };

  const addPropertiesToDisposition = async (
    dispositionId: string,
    propertyIds: string[]
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setSaving(true);

      const inserts = propertyIds.map(propertyId => ({
        disposition_id: dispositionId,
        property_id: propertyId,
        use_disposition_defaults: true,
      }));

      const { error } = await supabase
        .from('disposition_properties')
        .insert(inserts);

      if (error) throw error;

      return { success: true };
    } catch (err) {
      console.error('Error adding properties:', err);
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Failed to add properties' 
      };
    } finally {
      setSaving(false);
    }
  };

  const removePropertyFromDisposition = async (
    dispositionPropertyId: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setSaving(true);

      const { error } = await supabase
        .from('disposition_properties')
        .delete()
        .eq('id', dispositionPropertyId);

      if (error) throw error;

      return { success: true };
    } catch (err) {
      console.error('Error removing property:', err);
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Failed to remove property' 
      };
    } finally {
      setSaving(false);
    }
  };

  const updateDispositionProperty = async (
    dispositionPropertyId: string,
    inputs: PropertyUnderwritingInputs
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setSaving(true);

      const dbUpdates: TablesUpdate<'disposition_properties'> = {
        use_disposition_defaults: inputs.useDispositionDefaults,
        sale_price_methodology: inputs.salePriceMethodology || null,
        cap_rate: inputs.capRate ?? null,
        discount_to_market_value: inputs.discountToMarketValue ?? null,
        flat_sale_price: inputs.flatSalePrice ?? null,
        broker_fee_percent: inputs.brokerFeePercent ?? null,
        closing_cost_percent: inputs.closingCostPercent ?? null,
        seller_concessions_percent: inputs.sellerConcessionsPercent ?? null,
        make_ready_capex_percent: inputs.makeReadyCapexPercent ?? null,
        holding_period_months: inputs.holdingPeriodMonths ?? null,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('disposition_properties')
        .update(dbUpdates)
        .eq('id', dispositionPropertyId);

      if (error) throw error;

      return { success: true };
    } catch (err) {
      console.error('Error updating property:', err);
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Failed to update property' 
      };
    } finally {
      setSaving(false);
    }
  };

  const applyDefaultsToAllProperties = async (
    dispositionId: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setSaving(true);

      const { error } = await supabase
        .from('disposition_properties')
        .update({ 
          use_disposition_defaults: true,
          updated_at: new Date().toISOString()
        })
        .eq('disposition_id', dispositionId);

      if (error) throw error;

      return { success: true };
    } catch (err) {
      console.error('Error applying defaults:', err);
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Failed to apply defaults' 
      };
    } finally {
      setSaving(false);
    }
  };

  return {
    saving,
    createDisposition,
    updateDisposition,
    addPropertiesToDisposition,
    removePropertyFromDisposition,
    updateDispositionProperty,
    applyDefaultsToAllProperties,
  };
}
