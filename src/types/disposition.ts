/**
 * Disposition Underwriting Module - Type Definitions
 * 
 * This module supports underwriting potential sales of single-family homes
 * before listing them on the market. Supports both single-property and
 * portfolio dispositions.
 */

// ============================================================================
// PROPERTY TYPES
// ============================================================================

/**
 * Property - Represents a single-family home in the portfolio
 * This is an existing object in the system with core attributes
 */
export interface PropertyImage {
  title: string;
  url: string;
}

export interface Property {
  id: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  market: string; // Metro area or market name (e.g., "Dallas-Fort Worth")
  
  // Physical attributes
  beds: number;
  baths: number;
  sqft: number;
  yearBuilt: number;
  lotSize: number; // in sq ft
  latitude?: number;
  longitude?: number;
  
  // Financial attributes
  acquisitionDate: string; // ISO date
  acquisitionPrice: number; // Original purchase price
  acquisitionBasis: number; // Cost basis including closing costs and initial capex
  currentRent: number; // Monthly rent
  
  // Occupancy
  occupancyStatus: 'Occupied' | 'Vacant' | 'Notice Given';
  leaseEndDate?: string; // ISO date, if occupied
  
  // Current valuation estimates
  estimatedMarketValue: number;
  lastAppraisalDate?: string;
  lastAppraisalValue?: number;
  
  // Images
  images?: PropertyImage[];
}

// ============================================================================
// DISPOSITION TYPES
// ============================================================================

/**
 * DispositionStatus - Workflow states for a disposition
 */
export type DispositionStatus = 'Draft' | 'Under Review' | 'Approved to List' | 'Archived';

/**
 * DispositionType - Single property or portfolio sale
 */
export type DispositionType = 'Single Property' | 'Portfolio';

/**
 * SalePriceMethodology - How the projected sale price is calculated
 */
export type SalePriceMethodology = 
  | 'Cap Rate Based'      // Price = NOI / Cap Rate
  | 'Comp Based'          // Based on comparable sales (uses estimatedMarketValue)
  | 'Flat Price Input';   // Manual price entry

/**
 * DispositionDefaults - Portfolio-level default assumptions
 * These can be applied to all properties or overridden per property
 */
export interface DispositionDefaults {
  salePriceMethodology: SalePriceMethodology;
  capRate: number; // e.g., 0.055 for 5.5%
  discountToMarketValue: number; // e.g., 0.05 for 5% discount
  brokerFeePercent: number; // e.g., 0.05 for 5%
  closingCostPercent: number; // e.g., 0.02 for 2%
  sellerConcessionsPercent: number; // e.g., 0.01 for 1%
  makeReadyCapexPercent: number; // e.g., 0.02 for 2%
  holdingPeriodMonths: number; // Months until expected sale
}

/**
 * Disposition - A potential sale scenario for one or more properties
 */
export interface Disposition {
  id: string;
  name: string; // e.g., "Q2 2026 Dallas Portfolio Sale"
  status: DispositionStatus;
  type: DispositionType;
  
  // Metadata
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
  
  // Timeline
  targetListDate?: string;
  targetCloseDate?: string;
  
  // Strategy
  exitStrategyNotes?: string;
  investmentThesis?: string;
  
  // Default underwriting assumptions (applied to all properties unless overridden)
  defaults: DispositionDefaults;
  
  // Tags for filtering
  markets: string[]; // Derived from property locations
  tags: string[];
  
  // Linked deal (if this disposition becomes an actual listing)
  linkedDealId?: string;
}

// ============================================================================
// DISPOSITION PROPERTY TYPES (Join table with underwriting details)
// ============================================================================

/**
 * PropertyUnderwritingInputs - Per-property underwriting assumptions
 * Can use disposition defaults or custom values
 */
export interface PropertyUnderwritingInputs {
  useDispositionDefaults: boolean;
  
  // Custom overrides (only used if useDispositionDefaults is false)
  salePriceMethodology?: SalePriceMethodology;
  capRate?: number;
  discountToMarketValue?: number;
  flatSalePrice?: number; // Used when methodology is 'Flat Price Input'
  brokerFeePercent?: number;
  closingCostPercent?: number;
  sellerConcessionsPercent?: number;
  makeReadyCapexPercent?: number;
  holdingPeriodMonths?: number;
}

/**
 * PropertyUnderwritingOutputs - Calculated values per property
 * These are computed from inputs and property data
 */
export interface PropertyUnderwritingOutputs {
  // Sale price calculation
  projectedSalePrice: number;
  grossSaleProceeds: number;
  
  // Selling costs breakdown
  brokerCommission: number;
  closingCosts: number;
  sellerConcessions: number;
  makeReadyCapex: number;
  totalSellingCosts: number;
  
  // Net proceeds and returns
  netSaleProceeds: number;
  gainLossVsBasis: number;
  gainLossPercent: number;
  
  // Return metrics
  simpleReturn: number; // (Net Proceeds - Basis) / Basis
  annualizedReturn?: number; // IRR approximation if hold period known
  holdPeriodYears: number;
}

/**
 * DispositionProperty - Links a Disposition to a Property with underwriting details
 */
export interface DispositionProperty {
  id: string;
  dispositionId: string;
  propertyId: string;
  
  // The property data (joined from Property table)
  property: Property;
  
  // Underwriting inputs (editable)
  inputs: PropertyUnderwritingInputs;
  
  // Underwriting outputs (calculated, read-only)
  outputs: PropertyUnderwritingOutputs;
}

// ============================================================================
// PORTFOLIO AGGREGATE TYPES
// ============================================================================

/**
 * DispositionAggregates - Portfolio-level calculated totals
 */
export interface DispositionAggregates {
  propertyCount: number;
  
  // Totals
  totalProjectedSalePrice: number;
  totalGrossSaleProceeds: number;
  
  // Costs breakdown
  totalBrokerCommission: number;
  totalClosingCosts: number;
  totalSellerConcessions: number;
  totalMakeReadyCapex: number;
  totalSellingCosts: number;
  
  // Net proceeds and returns
  totalNetSaleProceeds: number;
  totalGainLossVsBasis: number;
  totalAcquisitionBasis: number;
  
  // Portfolio metrics
  weightedAverageROI: number;
  portfolioIRR?: number;
  averageHoldPeriodYears: number;
}

// ============================================================================
// DEAL TYPES (for linking dispositions to actual listings)
// ============================================================================

/**
 * DealStatus - Status of an actual listing/offer
 */
export type DealStatus = 
  | 'Pre-Listing'
  | 'Listed'
  | 'Under Contract'
  | 'Due Diligence'
  | 'Pending Close'
  | 'Closed'
  | 'Terminated';

/**
 * Deal - Represents an actual listing and/or accepted offer
 */
export interface Deal {
  id: string;
  dispositionId?: string; // Link back to the underwriting disposition
  name: string;
  status: DealStatus;
  
  // Listing details
  listPrice?: number;
  listDate?: string;
  
  // Offer details
  offerPrice?: number;
  offerDate?: string;
  closeProbability?: number; // 0-100%
  expectedCloseDate?: string;
  
  // Actual close details
  actualClosePrice?: number;
  actualCloseDate?: string;
  
  // Property references
  propertyIds: string[];
}

// ============================================================================
// UI STATE TYPES
// ============================================================================

/**
 * DispositionFilters - Filter options for the list view
 */
export interface DispositionFilters {
  status?: DispositionStatus[];
  type?: DispositionType[];
  markets?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  propertyCountRange?: {
    min: number;
    max: number;
  };
  searchQuery?: string;
}

/**
 * SortConfig - Sorting configuration
 */
export interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}
