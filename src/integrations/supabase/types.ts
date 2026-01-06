export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      acquisition_properties: {
        Row: {
          acquisition_id: string
          address1: string
          address2: string | null
          annual_hoa: number | null
          asking_price: number | null
          bathrooms: number | null
          bedrooms: number | null
          blended_turnover: number | null
          city: string
          closing_costs_percent: number | null
          cm_fee_percent: number | null
          created_at: string
          current_rent: number | null
          effective_tax_rate_percent: number | null
          id: string
          included: boolean
          ins_factor_rate: number | null
          ins_liability_premium: number | null
          ins_premium_rate: number | null
          latitude: number | null
          lease_end: string | null
          lease_start: string | null
          leasing_fee_percent: number | null
          longitude: number | null
          lost_rent: number | null
          market_id: string | null
          misc_income_percent: number | null
          msa: string | null
          occupancy: Database["public"]["Enums"]["opportunity_occupancy"] | null
          offer_price: number | null
          pm_fee_percent: number | null
          projected_annual_return: number | null
          projected_cap_rate: number | null
          projected_noi: number | null
          property_tax: number | null
          rent_avm: number | null
          replacement_cost_per_sf: number | null
          rm_percent: number | null
          sales_avm: number | null
          square_feet: number | null
          state: string
          tax_increase_percent: number | null
          total_acquisition_cost: number | null
          turn_cost: number | null
          turnover_cost: number | null
          turnover_rate_percent: number | null
          type: Database["public"]["Enums"]["opportunity_type"] | null
          updated_at: string
          use_acquisition_defaults: boolean
          utilities: number | null
          vacancy_bad_debt_percent: number | null
          year_built: number | null
          zip_code: string
        }
        Insert: {
          acquisition_id: string
          address1: string
          address2?: string | null
          annual_hoa?: number | null
          asking_price?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          blended_turnover?: number | null
          city: string
          closing_costs_percent?: number | null
          cm_fee_percent?: number | null
          created_at?: string
          current_rent?: number | null
          effective_tax_rate_percent?: number | null
          id?: string
          included?: boolean
          ins_factor_rate?: number | null
          ins_liability_premium?: number | null
          ins_premium_rate?: number | null
          latitude?: number | null
          lease_end?: string | null
          lease_start?: string | null
          leasing_fee_percent?: number | null
          longitude?: number | null
          lost_rent?: number | null
          market_id?: string | null
          misc_income_percent?: number | null
          msa?: string | null
          occupancy?:
            | Database["public"]["Enums"]["opportunity_occupancy"]
            | null
          offer_price?: number | null
          pm_fee_percent?: number | null
          projected_annual_return?: number | null
          projected_cap_rate?: number | null
          projected_noi?: number | null
          property_tax?: number | null
          rent_avm?: number | null
          replacement_cost_per_sf?: number | null
          rm_percent?: number | null
          sales_avm?: number | null
          square_feet?: number | null
          state: string
          tax_increase_percent?: number | null
          total_acquisition_cost?: number | null
          turn_cost?: number | null
          turnover_cost?: number | null
          turnover_rate_percent?: number | null
          type?: Database["public"]["Enums"]["opportunity_type"] | null
          updated_at?: string
          use_acquisition_defaults?: boolean
          utilities?: number | null
          vacancy_bad_debt_percent?: number | null
          year_built?: number | null
          zip_code: string
        }
        Update: {
          acquisition_id?: string
          address1?: string
          address2?: string | null
          annual_hoa?: number | null
          asking_price?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          blended_turnover?: number | null
          city?: string
          closing_costs_percent?: number | null
          cm_fee_percent?: number | null
          created_at?: string
          current_rent?: number | null
          effective_tax_rate_percent?: number | null
          id?: string
          included?: boolean
          ins_factor_rate?: number | null
          ins_liability_premium?: number | null
          ins_premium_rate?: number | null
          latitude?: number | null
          lease_end?: string | null
          lease_start?: string | null
          leasing_fee_percent?: number | null
          longitude?: number | null
          lost_rent?: number | null
          market_id?: string | null
          misc_income_percent?: number | null
          msa?: string | null
          occupancy?:
            | Database["public"]["Enums"]["opportunity_occupancy"]
            | null
          offer_price?: number | null
          pm_fee_percent?: number | null
          projected_annual_return?: number | null
          projected_cap_rate?: number | null
          projected_noi?: number | null
          property_tax?: number | null
          rent_avm?: number | null
          replacement_cost_per_sf?: number | null
          rm_percent?: number | null
          sales_avm?: number | null
          square_feet?: number | null
          state?: string
          tax_increase_percent?: number | null
          total_acquisition_cost?: number | null
          turn_cost?: number | null
          turnover_cost?: number | null
          turnover_rate_percent?: number | null
          type?: Database["public"]["Enums"]["opportunity_type"] | null
          updated_at?: string
          use_acquisition_defaults?: boolean
          utilities?: number | null
          vacancy_bad_debt_percent?: number | null
          year_built?: number | null
          zip_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "acquisition_properties_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "markets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunities_acquisition_id_fkey"
            columns: ["acquisition_id"]
            isOneToOne: false
            referencedRelation: "acquisitions"
            referencedColumns: ["id"]
          },
        ]
      }
      acquisitions: {
        Row: {
          created_at: string
          created_by: string | null
          defaults: Json
          id: string
          investment_thesis: string | null
          markets: string[] | null
          name: string
          status: Database["public"]["Enums"]["acquisition_status"]
          strategy_notes: string | null
          tags: string[] | null
          target_close_date: string | null
          type: Database["public"]["Enums"]["acquisition_type"]
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          defaults?: Json
          id?: string
          investment_thesis?: string | null
          markets?: string[] | null
          name: string
          status?: Database["public"]["Enums"]["acquisition_status"]
          strategy_notes?: string | null
          tags?: string[] | null
          target_close_date?: string | null
          type?: Database["public"]["Enums"]["acquisition_type"]
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          defaults?: Json
          id?: string
          investment_thesis?: string | null
          markets?: string[] | null
          name?: string
          status?: Database["public"]["Enums"]["acquisition_status"]
          strategy_notes?: string | null
          tags?: string[] | null
          target_close_date?: string | null
          type?: Database["public"]["Enums"]["acquisition_type"]
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      deal_properties: {
        Row: {
          acquisition_property_id: string | null
          created_at: string
          deal_id: string
          id: string
          property_id: string | null
        }
        Insert: {
          acquisition_property_id?: string | null
          created_at?: string
          deal_id: string
          id?: string
          property_id?: string | null
        }
        Update: {
          acquisition_property_id?: string | null
          created_at?: string
          deal_id?: string
          id?: string
          property_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deal_properties_acquisition_property_id_fkey"
            columns: ["acquisition_property_id"]
            isOneToOne: false
            referencedRelation: "acquisition_properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_properties_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_properties_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      deals: {
        Row: {
          acquisition_id: string | null
          actual_close_date: string | null
          actual_close_price: number | null
          asking_price: number | null
          close_probability: number | null
          created_at: string
          created_by: string | null
          deal_type: Database["public"]["Enums"]["deal_type"]
          disposition_id: string | null
          earnest_money: number | null
          earnest_money_date: string | null
          expected_close_date: string | null
          financing_contingency_date: string | null
          id: string
          inspection_end_date: string | null
          inspection_period_days: number | null
          list_date: string | null
          name: string
          notes: string | null
          offer_date: string | null
          purchase_price: number | null
          status: Database["public"]["Enums"]["deal_status"]
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          acquisition_id?: string | null
          actual_close_date?: string | null
          actual_close_price?: number | null
          asking_price?: number | null
          close_probability?: number | null
          created_at?: string
          created_by?: string | null
          deal_type?: Database["public"]["Enums"]["deal_type"]
          disposition_id?: string | null
          earnest_money?: number | null
          earnest_money_date?: string | null
          expected_close_date?: string | null
          financing_contingency_date?: string | null
          id?: string
          inspection_end_date?: string | null
          inspection_period_days?: number | null
          list_date?: string | null
          name: string
          notes?: string | null
          offer_date?: string | null
          purchase_price?: number | null
          status?: Database["public"]["Enums"]["deal_status"]
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          acquisition_id?: string | null
          actual_close_date?: string | null
          actual_close_price?: number | null
          asking_price?: number | null
          close_probability?: number | null
          created_at?: string
          created_by?: string | null
          deal_type?: Database["public"]["Enums"]["deal_type"]
          disposition_id?: string | null
          earnest_money?: number | null
          earnest_money_date?: string | null
          expected_close_date?: string | null
          financing_contingency_date?: string | null
          id?: string
          inspection_end_date?: string | null
          inspection_period_days?: number | null
          list_date?: string | null
          name?: string
          notes?: string | null
          offer_date?: string | null
          purchase_price?: number | null
          status?: Database["public"]["Enums"]["deal_status"]
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deals_acquisition_id_fkey"
            columns: ["acquisition_id"]
            isOneToOne: false
            referencedRelation: "acquisitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_disposition_id_fkey"
            columns: ["disposition_id"]
            isOneToOne: false
            referencedRelation: "dispositions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      disposition_properties: {
        Row: {
          annualized_return: number | null
          broker_commission: number | null
          broker_fee_percent: number | null
          cap_rate: number | null
          closing_cost_percent: number | null
          closing_costs: number | null
          created_at: string
          discount_to_market_value: number | null
          disposition_id: string
          flat_sale_price: number | null
          gain_loss_percent: number | null
          gain_loss_vs_basis: number | null
          gross_sale_proceeds: number | null
          hold_period_years: number | null
          holding_period_months: number | null
          id: string
          make_ready_capex: number | null
          make_ready_capex_percent: number | null
          net_sale_proceeds: number | null
          projected_sale_price: number | null
          property_id: string
          sale_price_methodology:
            | Database["public"]["Enums"]["sale_price_methodology"]
            | null
          seller_concessions: number | null
          seller_concessions_percent: number | null
          simple_return: number | null
          total_selling_costs: number | null
          updated_at: string
          use_disposition_defaults: boolean
        }
        Insert: {
          annualized_return?: number | null
          broker_commission?: number | null
          broker_fee_percent?: number | null
          cap_rate?: number | null
          closing_cost_percent?: number | null
          closing_costs?: number | null
          created_at?: string
          discount_to_market_value?: number | null
          disposition_id: string
          flat_sale_price?: number | null
          gain_loss_percent?: number | null
          gain_loss_vs_basis?: number | null
          gross_sale_proceeds?: number | null
          hold_period_years?: number | null
          holding_period_months?: number | null
          id?: string
          make_ready_capex?: number | null
          make_ready_capex_percent?: number | null
          net_sale_proceeds?: number | null
          projected_sale_price?: number | null
          property_id: string
          sale_price_methodology?:
            | Database["public"]["Enums"]["sale_price_methodology"]
            | null
          seller_concessions?: number | null
          seller_concessions_percent?: number | null
          simple_return?: number | null
          total_selling_costs?: number | null
          updated_at?: string
          use_disposition_defaults?: boolean
        }
        Update: {
          annualized_return?: number | null
          broker_commission?: number | null
          broker_fee_percent?: number | null
          cap_rate?: number | null
          closing_cost_percent?: number | null
          closing_costs?: number | null
          created_at?: string
          discount_to_market_value?: number | null
          disposition_id?: string
          flat_sale_price?: number | null
          gain_loss_percent?: number | null
          gain_loss_vs_basis?: number | null
          gross_sale_proceeds?: number | null
          hold_period_years?: number | null
          holding_period_months?: number | null
          id?: string
          make_ready_capex?: number | null
          make_ready_capex_percent?: number | null
          net_sale_proceeds?: number | null
          projected_sale_price?: number | null
          property_id?: string
          sale_price_methodology?:
            | Database["public"]["Enums"]["sale_price_methodology"]
            | null
          seller_concessions?: number | null
          seller_concessions_percent?: number | null
          simple_return?: number | null
          total_selling_costs?: number | null
          updated_at?: string
          use_disposition_defaults?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "disposition_properties_disposition_id_fkey"
            columns: ["disposition_id"]
            isOneToOne: false
            referencedRelation: "dispositions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "disposition_properties_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      dispositions: {
        Row: {
          created_at: string
          created_by: string | null
          defaults: Json
          exit_strategy_notes: string | null
          id: string
          investment_thesis: string | null
          markets: string[] | null
          name: string
          status: Database["public"]["Enums"]["disposition_status"]
          tags: string[] | null
          target_close_date: string | null
          target_list_date: string | null
          type: Database["public"]["Enums"]["disposition_type"]
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          defaults?: Json
          exit_strategy_notes?: string | null
          id?: string
          investment_thesis?: string | null
          markets?: string[] | null
          name: string
          status?: Database["public"]["Enums"]["disposition_status"]
          tags?: string[] | null
          target_close_date?: string | null
          target_list_date?: string | null
          type?: Database["public"]["Enums"]["disposition_type"]
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          defaults?: Json
          exit_strategy_notes?: string | null
          id?: string
          investment_thesis?: string | null
          markets?: string[] | null
          name?: string
          status?: Database["public"]["Enums"]["disposition_status"]
          tags?: string[] | null
          target_close_date?: string | null
          target_list_date?: string | null
          type?: Database["public"]["Enums"]["disposition_type"]
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dispositions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dispositions_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      markets: {
        Row: {
          bad_debt_percent: number | null
          blended_turnover: number | null
          closing_costs_percent: number | null
          cm_fee_percent: number | null
          created_at: string
          created_by: string | null
          id: string
          ins_factor_rate_percent: number | null
          ins_liability_premium: number | null
          ins_premium_rate_percent: number | null
          latitude: number | null
          leasing_fee_percent: number | null
          longitude: number | null
          lost_rent: number | null
          market_code: string | null
          market_name: string
          misc_income_percent: number | null
          pm_fee_percent: number | null
          repairs_maintenance_percent: number | null
          replacement_cost_sf: number | null
          turnover_costs: number | null
          turnover_rate_percent: number | null
          updated_at: string
          updated_by: string | null
          utilities: number | null
          vacancy_percent: number | null
        }
        Insert: {
          bad_debt_percent?: number | null
          blended_turnover?: number | null
          closing_costs_percent?: number | null
          cm_fee_percent?: number | null
          created_at?: string
          created_by?: string | null
          id?: string
          ins_factor_rate_percent?: number | null
          ins_liability_premium?: number | null
          ins_premium_rate_percent?: number | null
          latitude?: number | null
          leasing_fee_percent?: number | null
          longitude?: number | null
          lost_rent?: number | null
          market_code?: string | null
          market_name: string
          misc_income_percent?: number | null
          pm_fee_percent?: number | null
          repairs_maintenance_percent?: number | null
          replacement_cost_sf?: number | null
          turnover_costs?: number | null
          turnover_rate_percent?: number | null
          updated_at?: string
          updated_by?: string | null
          utilities?: number | null
          vacancy_percent?: number | null
        }
        Update: {
          bad_debt_percent?: number | null
          blended_turnover?: number | null
          closing_costs_percent?: number | null
          cm_fee_percent?: number | null
          created_at?: string
          created_by?: string | null
          id?: string
          ins_factor_rate_percent?: number | null
          ins_liability_premium?: number | null
          ins_premium_rate_percent?: number | null
          latitude?: number | null
          leasing_fee_percent?: number | null
          longitude?: number | null
          lost_rent?: number | null
          market_code?: string | null
          market_name?: string
          misc_income_percent?: number | null
          pm_fee_percent?: number | null
          repairs_maintenance_percent?: number | null
          replacement_cost_sf?: number | null
          turnover_costs?: number | null
          turnover_rate_percent?: number | null
          updated_at?: string
          updated_by?: string | null
          utilities?: number | null
          vacancy_percent?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          default_department: string | null
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          default_department?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          default_department?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      properties: {
        Row: {
          acquisition_basis: number | null
          acquisition_date: string | null
          acquisition_price: number | null
          address: string
          asset_id: string | null
          asset_id_counter: number | null
          brown_water: string | null
          category: string | null
          city: string
          cost_basis: number | null
          county: string | null
          created_at: string
          created_by: string | null
          current_rent: number | null
          date_purchased: string | null
          date_sold: string | null
          deals_id: string[] | null
          estimated_market_value: number | null
          funds_id: number | null
          has_pool: boolean | null
          hoa_id: number | null
          id: string
          images: Json | null
          last_appraisal_date: string | null
          last_appraisal_value: number | null
          latitude: number | null
          lease_end_date: string | null
          legal_description: string | null
          longitude: number | null
          lot_size: number | null
          market: string
          market_id: string | null
          markets_id: number | null
          occupancy_status: Database["public"]["Enums"]["occupancy_status"]
          portfolios_id: number | null
          property_type: string | null
          purchase_price: number | null
          renovation_date: string | null
          school_score: number | null
          source: string | null
          source_name: string | null
          state: string
          subdivision: string | null
          updated_at: string
          uw_arv: number | null
          uw_capex: number | null
          uw_rent: number | null
          year_built: number | null
          zip_code: string
        }
        Insert: {
          acquisition_basis?: number | null
          acquisition_date?: string | null
          acquisition_price?: number | null
          address: string
          asset_id?: string | null
          asset_id_counter?: number | null
          brown_water?: string | null
          category?: string | null
          city: string
          cost_basis?: number | null
          county?: string | null
          created_at?: string
          created_by?: string | null
          current_rent?: number | null
          date_purchased?: string | null
          date_sold?: string | null
          deals_id?: string[] | null
          estimated_market_value?: number | null
          funds_id?: number | null
          has_pool?: boolean | null
          hoa_id?: number | null
          id?: string
          images?: Json | null
          last_appraisal_date?: string | null
          last_appraisal_value?: number | null
          latitude?: number | null
          lease_end_date?: string | null
          legal_description?: string | null
          longitude?: number | null
          lot_size?: number | null
          market: string
          market_id?: string | null
          markets_id?: number | null
          occupancy_status?: Database["public"]["Enums"]["occupancy_status"]
          portfolios_id?: number | null
          property_type?: string | null
          purchase_price?: number | null
          renovation_date?: string | null
          school_score?: number | null
          source?: string | null
          source_name?: string | null
          state: string
          subdivision?: string | null
          updated_at?: string
          uw_arv?: number | null
          uw_capex?: number | null
          uw_rent?: number | null
          year_built?: number | null
          zip_code: string
        }
        Update: {
          acquisition_basis?: number | null
          acquisition_date?: string | null
          acquisition_price?: number | null
          address?: string
          asset_id?: string | null
          asset_id_counter?: number | null
          brown_water?: string | null
          category?: string | null
          city?: string
          cost_basis?: number | null
          county?: string | null
          created_at?: string
          created_by?: string | null
          current_rent?: number | null
          date_purchased?: string | null
          date_sold?: string | null
          deals_id?: string[] | null
          estimated_market_value?: number | null
          funds_id?: number | null
          has_pool?: boolean | null
          hoa_id?: number | null
          id?: string
          images?: Json | null
          last_appraisal_date?: string | null
          last_appraisal_value?: number | null
          latitude?: number | null
          lease_end_date?: string | null
          legal_description?: string | null
          longitude?: number | null
          lot_size?: number | null
          market?: string
          market_id?: string | null
          markets_id?: number | null
          occupancy_status?: Database["public"]["Enums"]["occupancy_status"]
          portfolios_id?: number | null
          property_type?: string | null
          purchase_price?: number | null
          renovation_date?: string | null
          school_score?: number | null
          source?: string | null
          source_name?: string | null
          state?: string
          subdivision?: string | null
          updated_at?: string
          uw_arv?: number | null
          uw_capex?: number | null
          uw_rent?: number | null
          year_built?: number | null
          zip_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "properties_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "properties_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "markets"
            referencedColumns: ["id"]
          },
        ]
      }
      units: {
        Row: {
          access_code: string | null
          bathrooms: number | null
          bedrooms: number | null
          building: string | null
          created_at: string
          created_by: string | null
          garage_spaces: number | null
          id: string
          square_feet: number | null
          stories: number | null
          unit: string | null
          updated_at: string
          updated_by_type: string | null
          updated_by_user_id: string | null
        }
        Insert: {
          access_code?: string | null
          bathrooms?: number | null
          bedrooms?: number | null
          building?: string | null
          created_at?: string
          created_by?: string | null
          garage_spaces?: number | null
          id?: string
          square_feet?: number | null
          stories?: number | null
          unit?: string | null
          updated_at?: string
          updated_by_type?: string | null
          updated_by_user_id?: string | null
        }
        Update: {
          access_code?: string | null
          bathrooms?: number | null
          bedrooms?: number | null
          building?: string | null
          created_at?: string
          created_by?: string | null
          garage_spaces?: number | null
          id?: string
          square_feet?: number | null
          stories?: number | null
          unit?: string | null
          updated_at?: string
          updated_by_type?: string | null
          updated_by_user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      acquisition_status:
        | "Draft"
        | "In Review"
        | "Approved"
        | "Under Contract"
        | "Closed"
        | "Archived"
      acquisition_type: "Single Property" | "Portfolio" | "Bulk Purchase"
      deal_status:
        | "Pre-Listing"
        | "Listed"
        | "LOI Submitted"
        | "LOI Accepted"
        | "Under Contract"
        | "PSA Executed"
        | "Due Diligence"
        | "Pending Close"
        | "Closed"
        | "Terminated"
      deal_type: "Acquisition" | "Disposition"
      disposition_status:
        | "Draft"
        | "Under Review"
        | "Approved to List"
        | "Archived"
      disposition_type: "Single Property" | "Portfolio"
      occupancy_status: "Occupied" | "Vacant" | "Notice Given"
      opportunity_occupancy: "Occupied" | "Vacant"
      opportunity_type: "SFR" | "BTR" | "MF"
      sale_price_methodology:
        | "Cap Rate Based"
        | "Comp Based"
        | "Flat Price Input"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      acquisition_status: [
        "Draft",
        "In Review",
        "Approved",
        "Under Contract",
        "Closed",
        "Archived",
      ],
      acquisition_type: ["Single Property", "Portfolio", "Bulk Purchase"],
      deal_status: [
        "Pre-Listing",
        "Listed",
        "LOI Submitted",
        "LOI Accepted",
        "Under Contract",
        "PSA Executed",
        "Due Diligence",
        "Pending Close",
        "Closed",
        "Terminated",
      ],
      deal_type: ["Acquisition", "Disposition"],
      disposition_status: [
        "Draft",
        "Under Review",
        "Approved to List",
        "Archived",
      ],
      disposition_type: ["Single Property", "Portfolio"],
      occupancy_status: ["Occupied", "Vacant", "Notice Given"],
      opportunity_occupancy: ["Occupied", "Vacant"],
      opportunity_type: ["SFR", "BTR", "MF"],
      sale_price_methodology: [
        "Cap Rate Based",
        "Comp Based",
        "Flat Price Input",
      ],
    },
  },
} as const
