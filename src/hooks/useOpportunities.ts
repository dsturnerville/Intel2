import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Opportunity, OpportunityCSVRow, OpportunityAggregates } from '@/types/opportunity';
import { Tables } from '@/integrations/supabase/types';

// Transform database row to Opportunity type
function transformOpportunity(row: Tables<'opportunities'>): Opportunity {
  return {
    id: row.id,
    acquisitionId: row.acquisition_id,
    address1: row.address1,
    address2: row.address2 || undefined,
    city: row.city,
    state: row.state,
    zipCode: row.zip_code,
    msa: row.msa || undefined,
    bedrooms: row.bedrooms || undefined,
    bathrooms: row.bathrooms ? Number(row.bathrooms) : undefined,
    squareFeet: row.square_feet || undefined,
    yearBuilt: row.year_built || undefined,
    included: row.included,
    type: row.type as Opportunity['type'],
    occupancy: (row.occupancy || 'Vacant') as Opportunity['occupancy'],
    currentRent: row.current_rent ? Number(row.current_rent) : undefined,
    leaseStart: row.lease_start || undefined,
    leaseEnd: row.lease_end || undefined,
    annualHoa: row.annual_hoa ? Number(row.annual_hoa) : undefined,
    propertyTax: row.property_tax ? Number(row.property_tax) : undefined,
    rentAvm: row.rent_avm ? Number(row.rent_avm) : undefined,
    salesAvm: row.sales_avm ? Number(row.sales_avm) : undefined,
    useAcquisitionDefaults: row.use_acquisition_defaults,
    miscIncomePercent: row.misc_income_percent ? Number(row.misc_income_percent) : undefined,
    vacancyBadDebtPercent: row.vacancy_bad_debt_percent ? Number(row.vacancy_bad_debt_percent) : undefined,
    pmFeePercent: row.pm_fee_percent ? Number(row.pm_fee_percent) : undefined,
    insPremiumRate: row.ins_premium_rate ? Number(row.ins_premium_rate) : undefined,
    insFactorRate: row.ins_factor_rate ? Number(row.ins_factor_rate) : undefined,
    insLiabilityPremium: row.ins_liability_premium ? Number(row.ins_liability_premium) : undefined,
    replacementCostPerSF: row.replacement_cost_per_sf ? Number(row.replacement_cost_per_sf) : undefined,
    lostRent: row.lost_rent ? Number(row.lost_rent) : undefined,
    leasingFeePercent: row.leasing_fee_percent ? Number(row.leasing_fee_percent) : undefined,
    utilities: row.utilities ? Number(row.utilities) : undefined,
    turnoverCost: row.turnover_cost ? Number(row.turnover_cost) : undefined,
    turnoverRatePercent: row.turnover_rate_percent ? Number(row.turnover_rate_percent) : undefined,
    blendedTurnover: row.blended_turnover ? Number(row.blended_turnover) : undefined,
    effectiveTaxRatePercent: row.effective_tax_rate_percent ? Number(row.effective_tax_rate_percent) : undefined,
    taxIncreasePercent: row.tax_increase_percent ? Number(row.tax_increase_percent) : undefined,
    rmPercent: row.rm_percent ? Number(row.rm_percent) : undefined,
    turnCost: row.turn_cost ? Number(row.turn_cost) : undefined,
    cmFeePercent: row.cm_fee_percent ? Number(row.cm_fee_percent) : undefined,
    closingCostsPercent: row.closing_costs_percent ? Number(row.closing_costs_percent) : undefined,
    offerPrice: row.offer_price ? Number(row.offer_price) : undefined,
    projectedNoi: row.projected_noi ? Number(row.projected_noi) : undefined,
    projectedCapRate: row.projected_cap_rate ? Number(row.projected_cap_rate) : undefined,
    totalAcquisitionCost: row.total_acquisition_cost ? Number(row.total_acquisition_cost) : undefined,
    projectedAnnualReturn: row.projected_annual_return ? Number(row.projected_annual_return) : undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// Fetch opportunities for an acquisition
export function useOpportunities(acquisitionId: string | undefined) {
  return useQuery({
    queryKey: ['opportunities', acquisitionId],
    queryFn: async () => {
      if (!acquisitionId) return [];
      
      const { data, error } = await supabase
        .from('opportunities')
        .select('*')
        .eq('acquisition_id', acquisitionId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return (data || []).map(transformOpportunity);
    },
    enabled: !!acquisitionId,
  });
}

// Calculate aggregates for opportunities
export function calculateOpportunityAggregates(opportunities: Opportunity[]): OpportunityAggregates {
  const included = opportunities.filter(o => o.included);
  
  return {
    totalCount: opportunities.length,
    includedCount: included.length,
    excludedCount: opportunities.length - included.length,
    totalOfferPrice: included.reduce((sum, o) => sum + (o.offerPrice || 0), 0),
    totalProjectedNOI: included.reduce((sum, o) => sum + (o.projectedNoi || 0), 0),
    avgProjectedCapRate: included.length > 0
      ? included.reduce((sum, o) => sum + (o.projectedCapRate || 0), 0) / included.length
      : 0,
  };
}

// Mutations for opportunities
export function useOpportunityMutations() {
  const queryClient = useQueryClient();

  const uploadOpportunities = async (
    acquisitionId: string,
    rows: OpportunityCSVRow[]
  ): Promise<{ success: boolean; count?: number; error?: string }> => {
    try {
      const opportunitiesToInsert = rows.map(row => ({
        acquisition_id: acquisitionId,
        address1: row.address1,
        address2: row.address2 || null,
        city: row.city,
        state: row.state,
        zip_code: row.zip_code,
        msa: row.msa || null,
        bedrooms: row.bedrooms ? parseInt(row.bedrooms) : null,
        bathrooms: row.bathrooms ? parseFloat(row.bathrooms) : null,
        square_feet: row.square_feet ? parseInt(row.square_feet) : null,
        year_built: row.year_built ? parseInt(row.year_built) : null,
        included: row.included?.toLowerCase() === 'false' ? false : true,
        type: ['SFR', 'BTR', 'MF'].includes(row.type?.toUpperCase() || '') 
          ? row.type?.toUpperCase() as 'SFR' | 'BTR' | 'MF' 
          : null,
        occupancy: row.occupancy?.toLowerCase() === 'occupied' ? 'Occupied' as const : 'Vacant' as const,
        current_rent: row.current_rent ? parseFloat(row.current_rent.replace(/[^0-9.-]/g, '')) : null,
        lease_start: row.lease_start || null,
        lease_end: row.lease_end || null,
        annual_hoa: row.annual_hoa ? parseFloat(row.annual_hoa.replace(/[^0-9.-]/g, '')) : null,
        property_tax: row.property_tax ? parseFloat(row.property_tax.replace(/[^0-9.-]/g, '')) : null,
        rent_avm: row.rent_avm ? parseFloat(row.rent_avm.replace(/[^0-9.-]/g, '')) : null,
        sales_avm: row.sales_avm ? parseFloat(row.sales_avm.replace(/[^0-9.-]/g, '')) : null,
        use_acquisition_defaults: true,
      }));

      const { data, error } = await supabase
        .from('opportunities')
        .insert(opportunitiesToInsert)
        .select();

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['opportunities', acquisitionId] });
      return { success: true, count: data?.length || 0 };
    } catch (error: any) {
      console.error('Error uploading opportunities:', error);
      return { success: false, error: error.message };
    }
  };

  const updateOpportunity = async (
    opportunityId: string,
    updates: Partial<Opportunity>
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const dbUpdates: Record<string, any> = {};
      
      if (updates.included !== undefined) dbUpdates.included = updates.included;
      if (updates.useAcquisitionDefaults !== undefined) dbUpdates.use_acquisition_defaults = updates.useAcquisitionDefaults;
      if (updates.miscIncomePercent !== undefined) dbUpdates.misc_income_percent = updates.miscIncomePercent;
      if (updates.vacancyBadDebtPercent !== undefined) dbUpdates.vacancy_bad_debt_percent = updates.vacancyBadDebtPercent;
      if (updates.pmFeePercent !== undefined) dbUpdates.pm_fee_percent = updates.pmFeePercent;
      if (updates.offerPrice !== undefined) dbUpdates.offer_price = updates.offerPrice;
      if (updates.projectedNoi !== undefined) dbUpdates.projected_noi = updates.projectedNoi;
      if (updates.projectedCapRate !== undefined) dbUpdates.projected_cap_rate = updates.projectedCapRate;

      const { error } = await supabase
        .from('opportunities')
        .update(dbUpdates)
        .eq('id', opportunityId);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      return { success: true };
    } catch (error: any) {
      console.error('Error updating opportunity:', error);
      return { success: false, error: error.message };
    }
  };

  const deleteOpportunity = async (
    opportunityId: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase
        .from('opportunities')
        .delete()
        .eq('id', opportunityId);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      return { success: true };
    } catch (error: any) {
      console.error('Error deleting opportunity:', error);
      return { success: false, error: error.message };
    }
  };

  const deleteAllOpportunities = async (
    acquisitionId: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase
        .from('opportunities')
        .delete()
        .eq('acquisition_id', acquisitionId);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['opportunities', acquisitionId] });
      return { success: true };
    } catch (error: any) {
      console.error('Error deleting opportunities:', error);
      return { success: false, error: error.message };
    }
  };

  return {
    uploadOpportunities,
    updateOpportunity,
    deleteOpportunity,
    deleteAllOpportunities,
  };
}
