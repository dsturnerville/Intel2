// Types for Opportunities (Acquisition Properties from CSV/Excel upload)

export type OpportunityType = 'SFR' | 'BTR' | 'MF';
export type OpportunityOccupancy = 'Occupied' | 'Vacant';

export interface Opportunity {
  id: string;
  acquisitionId: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zipCode: string;
  msa?: string;
  bedrooms?: number;
  bathrooms?: number;
  squareFeet?: number;
  yearBuilt?: number;
  included: boolean;
  type?: OpportunityType;
  occupancy: OpportunityOccupancy;
  currentRent?: number;
  leaseStart?: string;
  leaseEnd?: string;
  annualHoa?: number;
  askingPrice?: number;
  propertyTax?: number;
  rentAvm?: number;
  salesAvm?: number;
  latitude?: number;
  longitude?: number;
  // Underwriting inputs
  useAcquisitionDefaults: boolean;
  miscIncomePercent?: number;
  vacancyBadDebtPercent?: number;
  pmFeePercent?: number;
  insPremiumRate?: number;
  insFactorRate?: number;
  insLiabilityPremium?: number;
  replacementCostPerSF?: number;
  lostRent?: number;
  leasingFeePercent?: number;
  utilities?: number;
  turnoverCost?: number;
  turnoverRatePercent?: number;
  blendedTurnover?: number;
  effectiveTaxRatePercent?: number;
  taxIncreasePercent?: number;
  rmPercent?: number;
  turnCost?: number;
  cmFeePercent?: number;
  closingCostsPercent?: number;
  // Calculated outputs
  offerPrice?: number;
  projectedNoi?: number;
  projectedCapRate?: number;
  totalAcquisitionCost?: number;
  projectedAnnualReturn?: number;
  createdAt: string;
  updatedAt: string;
}

export interface OpportunityCSVRow {
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zip_code: string;
  msa?: string;
  bedrooms?: string;
  bathrooms?: string;
  square_feet?: string;
  year_built?: string;
  included?: string;
  type?: string;
  occupancy?: string;
  current_rent?: string;
  lease_start?: string;
  lease_end?: string;
  annual_hoa?: string;
  asking_price?: string;
  property_tax?: string;
  rent_avm?: string;
  sales_avm?: string;
}

export interface OpportunityAggregates {
  totalCount: number;
  includedCount: number;
  excludedCount: number;
  totalOfferPrice: number;
  totalProjectedNOI: number;
  avgProjectedCapRate: number;
}
