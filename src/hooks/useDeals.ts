import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Deal, DealProperty, DealType, DealStatus } from '@/types/deal';

// Transform database row to Deal type
function transformDeal(row: any): Deal {
  return {
    id: row.id,
    name: row.name,
    dealType: row.deal_type as DealType,
    status: row.status as DealStatus,
    acquisitionId: row.acquisition_id,
    dispositionId: row.disposition_id,
    askingPrice: row.asking_price ? Number(row.asking_price) : undefined,
    purchasePrice: row.purchase_price ? Number(row.purchase_price) : undefined,
    listDate: row.list_date,
    offerDate: row.offer_date,
    expectedCloseDate: row.expected_close_date,
    actualCloseDate: row.actual_close_date,
    actualClosePrice: row.actual_close_price ? Number(row.actual_close_price) : undefined,
    earnestMoney: row.earnest_money ? Number(row.earnest_money) : undefined,
    earnestMoneyDate: row.earnest_money_date,
    inspectionPeriodDays: row.inspection_period_days,
    inspectionEndDate: row.inspection_end_date,
    financingContingencyDate: row.financing_contingency_date,
    closeProbability: row.close_probability,
    notes: row.notes,
    createdAt: row.created_at,
    createdBy: row.created_by,
    updatedAt: row.updated_at,
    updatedBy: row.updated_by,
  };
}

// Transform Deal to database format
function transformDealToDb(deal: Partial<Deal>): Record<string, any> {
  const result: Record<string, any> = {};
  
  if (deal.name !== undefined) result.name = deal.name;
  if (deal.dealType !== undefined) result.deal_type = deal.dealType;
  if (deal.status !== undefined) result.status = deal.status;
  if (deal.acquisitionId !== undefined) result.acquisition_id = deal.acquisitionId;
  if (deal.dispositionId !== undefined) result.disposition_id = deal.dispositionId;
  if (deal.askingPrice !== undefined) result.asking_price = deal.askingPrice;
  if (deal.purchasePrice !== undefined) result.purchase_price = deal.purchasePrice;
  if (deal.listDate !== undefined) result.list_date = deal.listDate;
  if (deal.offerDate !== undefined) result.offer_date = deal.offerDate;
  if (deal.expectedCloseDate !== undefined) result.expected_close_date = deal.expectedCloseDate;
  if (deal.actualCloseDate !== undefined) result.actual_close_date = deal.actualCloseDate;
  if (deal.actualClosePrice !== undefined) result.actual_close_price = deal.actualClosePrice;
  if (deal.earnestMoney !== undefined) result.earnest_money = deal.earnestMoney;
  if (deal.earnestMoneyDate !== undefined) result.earnest_money_date = deal.earnestMoneyDate;
  if (deal.inspectionPeriodDays !== undefined) result.inspection_period_days = deal.inspectionPeriodDays;
  if (deal.inspectionEndDate !== undefined) result.inspection_end_date = deal.inspectionEndDate;
  if (deal.financingContingencyDate !== undefined) result.financing_contingency_date = deal.financingContingencyDate;
  if (deal.closeProbability !== undefined) result.close_probability = deal.closeProbability;
  if (deal.notes !== undefined) result.notes = deal.notes;
  
  return result;
}

// Fetch all deals with optional filters
export function useDeals(filters?: { dealType?: DealType; status?: DealStatus[] }) {
  return useQuery({
    queryKey: ['deals', filters],
    queryFn: async () => {
      let query = supabase.from('deals').select('*').order('updated_at', { ascending: false });
      
      if (filters?.dealType) {
        query = query.eq('deal_type', filters.dealType);
      }
      if (filters?.status && filters.status.length > 0) {
        query = query.in('status', filters.status);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return (data || []).map(transformDeal);
    },
  });
}

// Fetch a single deal by ID
export function useDeal(dealId: string | undefined) {
  return useQuery({
    queryKey: ['deal', dealId],
    queryFn: async () => {
      if (!dealId) return null;
      const { data, error } = await supabase
        .from('deals')
        .select('*')
        .eq('id', dealId)
        .single();
      if (error) throw error;
      return transformDeal(data);
    },
    enabled: !!dealId,
  });
}

// Fetch deals by acquisition ID
export function useDealsByAcquisition(acquisitionId: string | undefined) {
  return useQuery({
    queryKey: ['deals', 'acquisition', acquisitionId],
    queryFn: async () => {
      if (!acquisitionId) return [];
      const { data, error } = await supabase
        .from('deals')
        .select('*')
        .eq('acquisition_id', acquisitionId)
        .order('updated_at', { ascending: false });
      if (error) throw error;
      return (data || []).map(transformDeal);
    },
    enabled: !!acquisitionId,
  });
}

// Fetch deals by disposition ID
export function useDealsByDisposition(dispositionId: string | undefined) {
  return useQuery({
    queryKey: ['deals', 'disposition', dispositionId],
    queryFn: async () => {
      if (!dispositionId) return [];
      const { data, error } = await supabase
        .from('deals')
        .select('*')
        .eq('disposition_id', dispositionId)
        .order('updated_at', { ascending: false });
      if (error) throw error;
      return (data || []).map(transformDeal);
    },
    enabled: !!dispositionId,
  });
}

// Fetch deal properties for a deal
export function useDealProperties(dealId: string | undefined) {
  return useQuery({
    queryKey: ['deal-properties', dealId],
    queryFn: async () => {
      if (!dealId) return [];
      const { data, error } = await supabase
        .from('deal_properties')
        .select('*')
        .eq('deal_id', dealId);
      if (error) throw error;
      return (data || []).map((row): DealProperty => ({
        id: row.id,
        dealId: row.deal_id,
        propertyId: row.property_id,
        acquisitionPropertyId: row.acquisition_property_id,
        createdAt: row.created_at,
      }));
    },
    enabled: !!dealId,
  });
}

// Deal mutations
export function useDealMutations() {
  const queryClient = useQueryClient();

  const createDeal = useMutation({
    mutationFn: async (deal: Partial<Deal> & { name: string; dealType: DealType }) => {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;

      const { data, error } = await supabase
        .from('deals')
        .insert({
          name: deal.name,
          deal_type: deal.dealType,
          status: deal.status || 'Pre-Listing',
          acquisition_id: deal.acquisitionId || null,
          disposition_id: deal.dispositionId || null,
          asking_price: deal.askingPrice || null,
          purchase_price: deal.purchasePrice || null,
          list_date: deal.listDate || null,
          offer_date: deal.offerDate || null,
          expected_close_date: deal.expectedCloseDate || null,
          actual_close_date: deal.actualCloseDate || null,
          actual_close_price: deal.actualClosePrice || null,
          earnest_money: deal.earnestMoney || null,
          earnest_money_date: deal.earnestMoneyDate || null,
          inspection_period_days: deal.inspectionPeriodDays || null,
          inspection_end_date: deal.inspectionEndDate || null,
          financing_contingency_date: deal.financingContingencyDate || null,
          close_probability: deal.closeProbability || null,
          notes: deal.notes || null,
          created_by: userId,
          updated_by: userId,
        })
        .select()
        .single();
      if (error) throw error;
      return transformDeal(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
    },
  });

  const updateDeal = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Deal> }) => {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;

      const { data, error } = await supabase
        .from('deals')
        .update({
          ...transformDealToDb(updates),
          updated_by: userId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return transformDeal(data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      queryClient.invalidateQueries({ queryKey: ['deal', data.id] });
    },
  });

  const deleteDeal = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('deals')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
    },
  });

  const addPropertiesToDeal = useMutation({
    mutationFn: async ({ 
      dealId, 
      propertyIds, 
      acquisitionPropertyIds 
    }: { 
      dealId: string; 
      propertyIds?: string[]; 
      acquisitionPropertyIds?: string[];
    }) => {
      const rows: { deal_id: string; property_id?: string; acquisition_property_id?: string }[] = [];
      
      if (propertyIds) {
        propertyIds.forEach(propertyId => {
          rows.push({ deal_id: dealId, property_id: propertyId });
        });
      }
      
      if (acquisitionPropertyIds) {
        acquisitionPropertyIds.forEach(acqPropId => {
          rows.push({ deal_id: dealId, acquisition_property_id: acqPropId });
        });
      }
      
      if (rows.length === 0) return;
      
      const { error } = await supabase
        .from('deal_properties')
        .insert(rows);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['deal-properties', variables.dealId] });
    },
  });

  const removePropertyFromDeal = useMutation({
    mutationFn: async ({ dealId, dealPropertyId }: { dealId: string; dealPropertyId: string }) => {
      const { error } = await supabase
        .from('deal_properties')
        .delete()
        .eq('id', dealPropertyId);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['deal-properties', variables.dealId] });
    },
  });

  return {
    createDeal,
    updateDeal,
    deleteDeal,
    addPropertiesToDeal,
    removePropertyFromDeal,
  };
}
