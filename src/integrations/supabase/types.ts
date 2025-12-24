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
      deals: {
        Row: {
          actual_close_date: string | null
          actual_close_price: number | null
          close_probability: number | null
          created_at: string
          created_by: string | null
          disposition_id: string | null
          expected_close_date: string | null
          id: string
          list_date: string | null
          list_price: number | null
          name: string
          offer_date: string | null
          offer_price: number | null
          property_ids: string[] | null
          status: Database["public"]["Enums"]["deal_status"]
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          actual_close_date?: string | null
          actual_close_price?: number | null
          close_probability?: number | null
          created_at?: string
          created_by?: string | null
          disposition_id?: string | null
          expected_close_date?: string | null
          id?: string
          list_date?: string | null
          list_price?: number | null
          name: string
          offer_date?: string | null
          offer_price?: number | null
          property_ids?: string[] | null
          status?: Database["public"]["Enums"]["deal_status"]
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          actual_close_date?: string | null
          actual_close_price?: number | null
          close_probability?: number | null
          created_at?: string
          created_by?: string | null
          disposition_id?: string | null
          expected_close_date?: string | null
          id?: string
          list_date?: string | null
          list_price?: number | null
          name?: string
          offer_date?: string | null
          offer_price?: number | null
          property_ids?: string[] | null
          status?: Database["public"]["Enums"]["deal_status"]
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
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
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
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
          baths: number
          beds: number
          city: string
          created_at: string
          created_by: string | null
          current_rent: number | null
          estimated_market_value: number | null
          id: string
          images: Json | null
          last_appraisal_date: string | null
          last_appraisal_value: number | null
          latitude: number | null
          lease_end_date: string | null
          longitude: number | null
          lot_size: number | null
          market: string
          occupancy_status: Database["public"]["Enums"]["occupancy_status"]
          sqft: number
          state: string
          updated_at: string
          year_built: number | null
          zip_code: string
        }
        Insert: {
          acquisition_basis?: number | null
          acquisition_date?: string | null
          acquisition_price?: number | null
          address: string
          baths?: number
          beds?: number
          city: string
          created_at?: string
          created_by?: string | null
          current_rent?: number | null
          estimated_market_value?: number | null
          id?: string
          images?: Json | null
          last_appraisal_date?: string | null
          last_appraisal_value?: number | null
          latitude?: number | null
          lease_end_date?: string | null
          longitude?: number | null
          lot_size?: number | null
          market: string
          occupancy_status?: Database["public"]["Enums"]["occupancy_status"]
          sqft?: number
          state: string
          updated_at?: string
          year_built?: number | null
          zip_code: string
        }
        Update: {
          acquisition_basis?: number | null
          acquisition_date?: string | null
          acquisition_price?: number | null
          address?: string
          baths?: number
          beds?: number
          city?: string
          created_at?: string
          created_by?: string | null
          current_rent?: number | null
          estimated_market_value?: number | null
          id?: string
          images?: Json | null
          last_appraisal_date?: string | null
          last_appraisal_value?: number | null
          latitude?: number | null
          lease_end_date?: string | null
          longitude?: number | null
          lot_size?: number | null
          market?: string
          occupancy_status?: Database["public"]["Enums"]["occupancy_status"]
          sqft?: number
          state?: string
          updated_at?: string
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
      deal_status:
        | "Pre-Listing"
        | "Listed"
        | "Under Contract"
        | "Due Diligence"
        | "Pending Close"
        | "Closed"
        | "Terminated"
      disposition_status:
        | "Draft"
        | "Under Review"
        | "Approved to List"
        | "Archived"
      disposition_type: "Single Property" | "Portfolio"
      occupancy_status: "Occupied" | "Vacant" | "Notice Given"
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
      deal_status: [
        "Pre-Listing",
        "Listed",
        "Under Contract",
        "Due Diligence",
        "Pending Close",
        "Closed",
        "Terminated",
      ],
      disposition_status: [
        "Draft",
        "Under Review",
        "Approved to List",
        "Archived",
      ],
      disposition_type: ["Single Property", "Portfolio"],
      occupancy_status: ["Occupied", "Vacant", "Notice Given"],
      sale_price_methodology: [
        "Cap Rate Based",
        "Comp Based",
        "Flat Price Input",
      ],
    },
  },
} as const
