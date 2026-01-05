// Types for Acquisitions Module

import { Property } from './disposition';

// Acquisition status options
export type AcquisitionStatus = 'Draft' | 'In Review' | 'Approved' | 'Under Contract' | 'Closed' | 'Archived';

// Acquisition type options
export type AcquisitionType = 'Single Property' | 'Portfolio' | 'Bulk Purchase';

// Acquisition-level underwriting defaults
export interface AcquisitionDefaults {
  miscIncomePercent: number;
  vacancyBadDebtPercent: number;
  pmFeePercent: number;
  insPremiumRate: number;
  insFactorRate: number;
  insLiabilityPremium: number;
  replacementCostPerSF: number;
  lostRent: number;
  leasingFeePercent: number;
  utilities: number;
  turnoverCost: number;
  turnoverRatePercent: number;
  blendedTurnover: number;
  effectiveTaxRatePercent: number;
  taxIncreasePercent: number;
  rmPercent: number;
  turnCost: number;
  cmFeePercent: number;
  closingCostsPercent: number;
}

// Main Acquisition interface
export interface Acquisition {
  id: string;
  name: string;
  status: AcquisitionStatus;
  type: AcquisitionType;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
  targetCloseDate?: string;
  strategyNotes?: string;
  investmentThesis?: string;
  defaults: AcquisitionDefaults;
  markets: string[];
  tags: string[];
}

// Property-level underwriting inputs (override defaults)
export interface AcquisitionPropertyInputs {
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
}

// Property-level calculated outputs
export interface AcquisitionPropertyOutputs {
  offerPrice: number;
  projectedNOI: number;
  projectedCapRate: number;
  totalAcquisitionCost: number;
  projectedAnnualReturn: number;
}

// Acquisition Property (linking acquisition to property with underwriting)
export interface AcquisitionProperty {
  id: string;
  acquisitionId: string;
  propertyId: string;
  property: Property;
  inputs: AcquisitionPropertyInputs;
  outputs: AcquisitionPropertyOutputs;
}

// Acquisition aggregates for portfolio view
export interface AcquisitionAggregates {
  propertyCount: number;
  totalOfferPrice: number;
  totalProjectedNOI: number;
  avgProjectedCapRate: number;
  totalAcquisitionCost: number;
  avgProjectedAnnualReturn: number;
}

// Filters for acquisition list
export interface AcquisitionFilters {
  status: AcquisitionStatus[];
  type: AcquisitionType[];
  markets: string[];
}
