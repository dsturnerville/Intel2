import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Property } from '@/types/disposition';
import {
  Acquisition,
  AcquisitionProperty,
  AcquisitionDefaults,
  AcquisitionPropertyInputs,
} from '@/types/acquisition';
import {
  calculateAcquisitionUnderwriting,
  calculateAcquisitionAggregates,
} from '@/utils/acquisitionCalculations';
import { Tables, TablesUpdate } from '@/integrations/supabase/types';

const DEFAULT_ACQUISITION_DEFAULTS: AcquisitionDefaults = {
  miscIncomePercent: 0.02,
  vacancyBadDebtPercent: 0.05,
  pmFeePercent: 0.08,
  insPremiumRate: 0.004,
  insFactorRate: 1.0,
  insLiabilityPremium: 150,
  replacementCostPerSF: 150,
  lostRent: 0,
  leasingFeePercent: 0.005,
  utilities: 0,
  turnoverCost: 2500,
  turnoverRatePercent: 0.25,
  blendedTurnover: 625,
  effectiveTaxRatePercent: 0.012,
  taxIncreasePercent: 0.03,
  rmPercent: 0.05,
  turnCost: 2500,
  cmFeePercent: 0.02,
  closingCostsPercent: 0.02,
};

// Transform database row to Acquisition type
function transformAcquisition(row: Tables<'acquisitions'>): Acquisition {
  const defaults = row.defaults as unknown as AcquisitionDefaults;

  return {
    id: row.id,
    name: row.name,
    status: row.status,
    type: row.type,
    createdAt: row.created_at,
    createdBy: row.created_by || 'Unknown',
    updatedAt: row.updated_at,
    updatedBy: row.updated_by || 'Unknown',
    targetCloseDate: row.target_close_date || undefined,
    strategyNotes: row.strategy_notes || undefined,
    investmentThesis: row.investment_thesis || undefined,
    defaults: defaults || DEFAULT_ACQUISITION_DEFAULTS,
    markets: row.markets || [],
    tags: row.tags || [],
  };
}

// Transform database row to Property type
function transformProperty(row: Tables<'properties'>): Property {
  let images: { title: string; url: string }[] | undefined;
  if (row.images && Array.isArray(row.images)) {
    images = row.images as { title: string; url: string }[];
  }

  return {
    id: row.id,
    address: row.address,
    city: row.city,
    state: row.state,
    zipCode: row.zip_code,
    market: row.market,
    yearBuilt: row.year_built || 2000,
    lotSize: row.lot_size || 0,
    latitude: row.latitude ? Number(row.latitude) : undefined,
    longitude: row.longitude ? Number(row.longitude) : undefined,
    acquisitionDate: row.acquisition_date || '',
    acquisitionPrice: Number(row.acquisition_price) || 0,
    acquisitionBasis: Number(row.acquisition_basis) || 0,
    currentRent: Number(row.current_rent) || 0,
    occupancyStatus: row.occupancy_status,
    leaseEndDate: row.lease_end_date || undefined,
    estimatedMarketValue: Number(row.estimated_market_value) || 0,
    lastAppraisalDate: row.last_appraisal_date || undefined,
    lastAppraisalValue: row.last_appraisal_value ? Number(row.last_appraisal_value) : undefined,
    images,
  };
}

export interface AcquisitionWithAggregates {
  acquisition: Acquisition;
  aggregates: ReturnType<typeof calculateAcquisitionAggregates>;
  propertyCount: number;
}

// Hook to fetch all acquisitions
export function useAcquisitions() {
  const [acquisitions, setAcquisitions] = useState<Acquisition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAcquisitions();
  }, []);

  async function fetchAcquisitions() {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('acquisitions')
        .select('*')
        .order('updated_at', { ascending: false });

      if (fetchError) throw fetchError;

      const transformed = (data || []).map(transformAcquisition);
      setAcquisitions(transformed);
    } catch (err) {
      console.error('Error fetching acquisitions:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch acquisitions');
    } finally {
      setLoading(false);
    }
  }

  return { acquisitions, loading, error, refetch: fetchAcquisitions };
}

// Hook to fetch a single acquisition by ID
export function useAcquisition(acquisitionId: string | undefined) {
  const [acquisition, setAcquisition] = useState<Acquisition | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAcquisition = useCallback(async () => {
    if (!acquisitionId || acquisitionId === 'new') {
      setAcquisition(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('acquisitions')
        .select('*')
        .eq('id', acquisitionId)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (data) {
        setAcquisition(transformAcquisition(data));
      } else {
        setAcquisition(null);
      }
    } catch (err) {
      console.error('Error fetching acquisition:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch acquisition');
    } finally {
      setLoading(false);
    }
  }, [acquisitionId]);

  useEffect(() => {
    fetchAcquisition();
  }, [fetchAcquisition]);

  return { acquisition, loading, error, refetch: fetchAcquisition };
}

// Hook to fetch acquisition properties
export function useAcquisitionProperties(acquisitionId: string | undefined) {
  const [properties, setProperties] = useState<AcquisitionProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAcquisitionProperties = useCallback(async () => {
    if (!acquisitionId || acquisitionId === 'new') {
      setProperties([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch acquisition with its defaults
      const { data: acquisitionData, error: acqError } = await supabase
        .from('acquisitions')
        .select('*')
        .eq('id', acquisitionId)
        .maybeSingle();

      if (acqError) throw acqError;
      if (!acquisitionData) {
        setProperties([]);
        return;
      }

      const acquisition = transformAcquisition(acquisitionData);

      // Fetch acquisition_properties with related property data
      const { data: apData, error: apError } = await supabase
        .from('acquisition_properties')
        .select(`
          *,
          properties (*)
        `)
        .eq('acquisition_id', acquisitionId);

      if (apError) throw apError;

      const transformed: AcquisitionProperty[] = (apData || []).map((ap) => {
        const propertyRow = ap.properties as Tables<'properties'>;
        const property = transformProperty(propertyRow);

        const inputs: AcquisitionPropertyInputs = {
          useAcquisitionDefaults: ap.use_acquisition_defaults,
          miscIncomePercent: ap.misc_income_percent ? Number(ap.misc_income_percent) : undefined,
          vacancyBadDebtPercent: ap.vacancy_bad_debt_percent ? Number(ap.vacancy_bad_debt_percent) : undefined,
          pmFeePercent: ap.pm_fee_percent ? Number(ap.pm_fee_percent) : undefined,
          insPremiumRate: ap.ins_premium_rate ? Number(ap.ins_premium_rate) : undefined,
          insFactorRate: ap.ins_factor_rate ? Number(ap.ins_factor_rate) : undefined,
          insLiabilityPremium: ap.ins_liability_premium ? Number(ap.ins_liability_premium) : undefined,
          replacementCostPerSF: ap.replacement_cost_per_sf ? Number(ap.replacement_cost_per_sf) : undefined,
          lostRent: ap.lost_rent ? Number(ap.lost_rent) : undefined,
          leasingFeePercent: ap.leasing_fee_percent ? Number(ap.leasing_fee_percent) : undefined,
          utilities: ap.utilities ? Number(ap.utilities) : undefined,
          turnoverCost: ap.turnover_cost ? Number(ap.turnover_cost) : undefined,
          turnoverRatePercent: ap.turnover_rate_percent ? Number(ap.turnover_rate_percent) : undefined,
          blendedTurnover: ap.blended_turnover ? Number(ap.blended_turnover) : undefined,
          effectiveTaxRatePercent: ap.effective_tax_rate_percent ? Number(ap.effective_tax_rate_percent) : undefined,
          taxIncreasePercent: ap.tax_increase_percent ? Number(ap.tax_increase_percent) : undefined,
          rmPercent: ap.rm_percent ? Number(ap.rm_percent) : undefined,
          turnCost: ap.turn_cost ? Number(ap.turn_cost) : undefined,
          cmFeePercent: ap.cm_fee_percent ? Number(ap.cm_fee_percent) : undefined,
          closingCostsPercent: ap.closing_costs_percent ? Number(ap.closing_costs_percent) : undefined,
        };

        const outputs = calculateAcquisitionUnderwriting(property, inputs, acquisition.defaults);

        return {
          id: ap.id,
          acquisitionId: ap.acquisition_id,
          propertyId: ap.property_id,
          property,
          inputs,
          outputs,
        };
      });

      setProperties(transformed);
    } catch (err) {
      console.error('Error fetching acquisition properties:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch properties');
    } finally {
      setLoading(false);
    }
  }, [acquisitionId]);

  useEffect(() => {
    fetchAcquisitionProperties();
  }, [fetchAcquisitionProperties]);

  return { properties, loading, error, refetch: fetchAcquisitionProperties, setProperties };
}

// Hook to fetch acquisitions with aggregates
export function useAcquisitionsWithAggregates() {
  const { acquisitions, loading: acquisitionsLoading, error, refetch } = useAcquisitions();
  const [acquisitionsWithAggregates, setAcquisitionsWithAggregates] = useState<AcquisitionWithAggregates[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!acquisitionsLoading && acquisitions.length >= 0) {
      fetchAggregates();
    }
  }, [acquisitions, acquisitionsLoading]);

  async function fetchAggregates() {
    if (acquisitions.length === 0) {
      setAcquisitionsWithAggregates([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Fetch opportunities for all acquisitions
      const { data: allOpportunities, error: oppError } = await supabase
        .from('opportunities')
        .select('*')
        .in('acquisition_id', acquisitions.map(a => a.id));

      if (oppError) throw oppError;

      const result: AcquisitionWithAggregates[] = acquisitions.map(acquisition => {
        const opportunities = (allOpportunities || []).filter(o => o.acquisition_id === acquisition.id);
        const includedOpportunities = opportunities.filter(o => o.included);

        // Calculate aggregates from included opportunities
        const totalOfferPrice = includedOpportunities.reduce((sum, o) => sum + (Number(o.offer_price) || 0), 0);
        const totalProjectedNOI = includedOpportunities.reduce((sum, o) => sum + (Number(o.projected_noi) || 0), 0);
        const totalAcquisitionCost = includedOpportunities.reduce((sum, o) => sum + (Number(o.total_acquisition_cost) || 0), 0);
        const avgProjectedCapRate = includedOpportunities.length > 0
          ? includedOpportunities.reduce((sum, o) => sum + (Number(o.projected_cap_rate) || 0), 0) / includedOpportunities.length
          : 0;
        const avgProjectedAnnualReturn = includedOpportunities.length > 0
          ? includedOpportunities.reduce((sum, o) => sum + (Number(o.projected_annual_return) || 0), 0) / includedOpportunities.length
          : 0;

        const aggregates = {
          propertyCount: includedOpportunities.length,
          totalOfferPrice,
          totalProjectedNOI,
          totalAcquisitionCost,
          avgProjectedCapRate,
          avgProjectedAnnualReturn,
        };

        return {
          acquisition,
          aggregates,
          propertyCount: includedOpportunities.length,
        };
      });

      setAcquisitionsWithAggregates(result);
    } catch (err) {
      console.error('Error fetching aggregates:', err);
    } finally {
      setLoading(false);
    }
  }

  return {
    acquisitionsWithAggregates,
    loading: acquisitionsLoading || loading,
    error,
    refetch,
  };
}

// Mutation hooks for saving acquisition data
export function useAcquisitionMutations() {
  const [saving, setSaving] = useState(false);

  const createAcquisition = async (
    data: {
      name: string;
      type: 'Single Property' | 'Portfolio' | 'Bulk Purchase';
      markets?: string[];
      targetCloseDate?: string;
      investmentThesis?: string;
      strategyNotes?: string;
      defaults?: AcquisitionDefaults;
    }
  ): Promise<{ success: boolean; id?: string; error?: string }> => {
    try {
      setSaving(true);

      const { data: result, error } = await supabase
        .from('acquisitions')
        .insert({
          name: data.name,
          type: data.type,
          status: 'Draft',
          markets: data.markets || [],
          target_close_date: data.targetCloseDate || null,
          investment_thesis: data.investmentThesis || null,
          strategy_notes: data.strategyNotes || null,
          defaults: JSON.parse(JSON.stringify(data.defaults || DEFAULT_ACQUISITION_DEFAULTS)),
        })
        .select('id')
        .single();

      if (error) throw error;

      return { success: true, id: result.id };
    } catch (err) {
      console.error('Error creating acquisition:', err);
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to create acquisition',
      };
    } finally {
      setSaving(false);
    }
  };

  const updateAcquisition = async (
    acquisitionId: string,
    updates: Partial<Acquisition>
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setSaving(true);

      const dbUpdates: TablesUpdate<'acquisitions'> = {};

      if (updates.status !== undefined) dbUpdates.status = updates.status;
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.defaults !== undefined) dbUpdates.defaults = JSON.parse(JSON.stringify(updates.defaults));
      if (updates.targetCloseDate !== undefined) dbUpdates.target_close_date = updates.targetCloseDate || null;
      if (updates.investmentThesis !== undefined) dbUpdates.investment_thesis = updates.investmentThesis || null;
      if (updates.strategyNotes !== undefined) dbUpdates.strategy_notes = updates.strategyNotes || null;
      if (updates.markets !== undefined) dbUpdates.markets = updates.markets;
      if (updates.tags !== undefined) dbUpdates.tags = updates.tags;

      dbUpdates.updated_at = new Date().toISOString();

      const { error } = await supabase
        .from('acquisitions')
        .update(dbUpdates)
        .eq('id', acquisitionId);

      if (error) throw error;

      return { success: true };
    } catch (err) {
      console.error('Error updating acquisition:', err);
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to update acquisition',
      };
    } finally {
      setSaving(false);
    }
  };

  const addPropertiesToAcquisition = async (
    acquisitionId: string,
    propertyIds: string[]
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setSaving(true);

      const inserts = propertyIds.map(propertyId => ({
        acquisition_id: acquisitionId,
        property_id: propertyId,
        use_acquisition_defaults: true,
      }));

      const { error } = await supabase
        .from('acquisition_properties')
        .insert(inserts);

      if (error) throw error;

      return { success: true };
    } catch (err) {
      console.error('Error adding properties:', err);
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to add properties',
      };
    } finally {
      setSaving(false);
    }
  };

  const removePropertyFromAcquisition = async (
    acquisitionPropertyId: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setSaving(true);

      const { error } = await supabase
        .from('acquisition_properties')
        .delete()
        .eq('id', acquisitionPropertyId);

      if (error) throw error;

      return { success: true };
    } catch (err) {
      console.error('Error removing property:', err);
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to remove property',
      };
    } finally {
      setSaving(false);
    }
  };

  const updateAcquisitionProperty = async (
    acquisitionPropertyId: string,
    inputs: AcquisitionPropertyInputs
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setSaving(true);

      const { error } = await supabase
        .from('acquisition_properties')
        .update({
          use_acquisition_defaults: inputs.useAcquisitionDefaults,
          misc_income_percent: inputs.miscIncomePercent ?? null,
          vacancy_bad_debt_percent: inputs.vacancyBadDebtPercent ?? null,
          pm_fee_percent: inputs.pmFeePercent ?? null,
          ins_premium_rate: inputs.insPremiumRate ?? null,
          ins_factor_rate: inputs.insFactorRate ?? null,
          ins_liability_premium: inputs.insLiabilityPremium ?? null,
          replacement_cost_per_sf: inputs.replacementCostPerSF ?? null,
          lost_rent: inputs.lostRent ?? null,
          leasing_fee_percent: inputs.leasingFeePercent ?? null,
          utilities: inputs.utilities ?? null,
          turnover_cost: inputs.turnoverCost ?? null,
          turnover_rate_percent: inputs.turnoverRatePercent ?? null,
          blended_turnover: inputs.blendedTurnover ?? null,
          effective_tax_rate_percent: inputs.effectiveTaxRatePercent ?? null,
          tax_increase_percent: inputs.taxIncreasePercent ?? null,
          rm_percent: inputs.rmPercent ?? null,
          turn_cost: inputs.turnCost ?? null,
          cm_fee_percent: inputs.cmFeePercent ?? null,
          closing_costs_percent: inputs.closingCostsPercent ?? null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', acquisitionPropertyId);

      if (error) throw error;

      return { success: true };
    } catch (err) {
      console.error('Error updating property:', err);
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to update property',
      };
    } finally {
      setSaving(false);
    }
  };

  return {
    saving,
    createAcquisition,
    updateAcquisition,
    addPropertiesToAcquisition,
    removePropertyFromAcquisition,
    updateAcquisitionProperty,
  };
}
