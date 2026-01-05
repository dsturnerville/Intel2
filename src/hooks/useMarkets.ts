import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Market {
  id: string;
  market_name: string;
  market_code: string | null;
  latitude: number | null;
  longitude: number | null;
  misc_income_percent: number | null;
  vacancy_percent: number | null;
  bad_debt_percent: number | null;
  pm_fee_percent: number | null;
  leasing_fee_percent: number | null;
  cm_fee_percent: number | null;
  closing_costs_percent: number | null;
  ins_premium_rate_percent: number | null;
  ins_factor_rate_percent: number | null;
  ins_liability_premium: number | null;
  replacement_cost_sf: number | null;
  lost_rent: number | null;
  utilities: number | null;
  repairs_maintenance_percent: number | null;
  turnover_costs: number | null;
  turnover_rate_percent: number | null;
  blended_turnover: number | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
}

export type MarketInsert = Omit<Market, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'updated_by'>;
export type MarketUpdate = Partial<MarketInsert>;

export function useMarkets() {
  return useQuery({
    queryKey: ['markets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('markets')
        .select('*')
        .order('market_name');

      if (error) throw error;
      return data as Market[];
    },
  });
}

export function useMarket(id: string | undefined) {
  return useQuery({
    queryKey: ['markets', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('markets')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data as Market | null;
    },
    enabled: !!id,
  });
}

export function useMarketMutations() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createMarket = useMutation({
    mutationFn: async (market: MarketInsert) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('markets')
        .insert({
          ...market,
          created_by: user?.id,
          updated_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['markets'] });
      toast({
        title: 'Market created',
        description: 'The market has been created successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error creating market',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateMarket = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: MarketUpdate }) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('markets')
        .update({
          ...updates,
          updated_by: user?.id,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['markets'] });
      toast({
        title: 'Market updated',
        description: 'The market has been updated successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error updating market',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteMarket = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('markets')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['markets'] });
      toast({
        title: 'Market deleted',
        description: 'The market has been deleted successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error deleting market',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return { createMarket, updateMarket, deleteMarket };
}
