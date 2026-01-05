// Acquisition underwriting calculations

import { Property } from '@/types/disposition';
import {
  AcquisitionDefaults,
  AcquisitionPropertyInputs,
  AcquisitionPropertyOutputs,
  AcquisitionProperty,
  AcquisitionAggregates,
} from '@/types/acquisition';

// Get effective inputs (property-level overrides or defaults)
export function getEffectiveAcquisitionInputs(
  inputs: AcquisitionPropertyInputs,
  defaults: AcquisitionDefaults
): AcquisitionDefaults {
  if (inputs.useAcquisitionDefaults) {
    return defaults;
  }

  return {
    miscIncomePercent: inputs.miscIncomePercent ?? defaults.miscIncomePercent,
    vacancyBadDebtPercent: inputs.vacancyBadDebtPercent ?? defaults.vacancyBadDebtPercent,
    pmFeePercent: inputs.pmFeePercent ?? defaults.pmFeePercent,
    insPremiumRate: inputs.insPremiumRate ?? defaults.insPremiumRate,
    insFactorRate: inputs.insFactorRate ?? defaults.insFactorRate,
    insLiabilityPremium: inputs.insLiabilityPremium ?? defaults.insLiabilityPremium,
    replacementCostPerSF: inputs.replacementCostPerSF ?? defaults.replacementCostPerSF,
    lostRent: inputs.lostRent ?? defaults.lostRent,
    leasingFeePercent: inputs.leasingFeePercent ?? defaults.leasingFeePercent,
    utilities: inputs.utilities ?? defaults.utilities,
    turnoverCost: inputs.turnoverCost ?? defaults.turnoverCost,
    turnoverRatePercent: inputs.turnoverRatePercent ?? defaults.turnoverRatePercent,
    blendedTurnover: inputs.blendedTurnover ?? defaults.blendedTurnover,
    effectiveTaxRatePercent: inputs.effectiveTaxRatePercent ?? defaults.effectiveTaxRatePercent,
    taxIncreasePercent: inputs.taxIncreasePercent ?? defaults.taxIncreasePercent,
    rmPercent: inputs.rmPercent ?? defaults.rmPercent,
    turnCost: inputs.turnCost ?? defaults.turnCost,
    cmFeePercent: inputs.cmFeePercent ?? defaults.cmFeePercent,
    closingCostsPercent: inputs.closingCostsPercent ?? defaults.closingCostsPercent,
  };
}

// Calculate projected NOI for a property
export function calculateAcquisitionNOI(
  property: Property,
  effective: AcquisitionDefaults
): number {
  const annualRent = property.currentRent * 12;
  const miscIncome = annualRent * effective.miscIncomePercent;
  const grossIncome = annualRent + miscIncome;
  
  const vacancyLoss = grossIncome * effective.vacancyBadDebtPercent;
  const effectiveGrossIncome = grossIncome - vacancyLoss;
  
  // Operating expenses
  const pmFee = effectiveGrossIncome * effective.pmFeePercent;
  const insurance = property.estimatedMarketValue * effective.insPremiumRate * effective.insFactorRate + effective.insLiabilityPremium;
  const taxes = property.estimatedMarketValue * effective.effectiveTaxRatePercent;
  const rmCost = annualRent * effective.rmPercent;
  const leasingFee = annualRent * effective.leasingFeePercent;
  const turnoverCost = effective.blendedTurnover;
  const cmFee = effectiveGrossIncome * effective.cmFeePercent;
  
  const totalExpenses = pmFee + insurance + taxes + rmCost + leasingFee + turnoverCost + cmFee + effective.utilities + effective.lostRent;
  
  return effectiveGrossIncome - totalExpenses;
}

// Calculate all underwriting outputs for a property
export function calculateAcquisitionUnderwriting(
  property: Property,
  inputs: AcquisitionPropertyInputs,
  defaults: AcquisitionDefaults
): AcquisitionPropertyOutputs {
  const effective = getEffectiveAcquisitionInputs(inputs, defaults);
  
  const projectedNOI = calculateAcquisitionNOI(property, effective);
  
  // Use a target cap rate of 6% for offer price calculation
  const targetCapRate = 0.06;
  const offerPrice = projectedNOI / targetCapRate;
  
  const closingCosts = offerPrice * effective.closingCostsPercent;
  const totalAcquisitionCost = offerPrice + closingCosts;
  
  const projectedCapRate = offerPrice > 0 ? projectedNOI / offerPrice : 0;
  const projectedAnnualReturn = totalAcquisitionCost > 0 ? projectedNOI / totalAcquisitionCost : 0;
  
  return {
    offerPrice: Math.round(offerPrice),
    projectedNOI: Math.round(projectedNOI),
    projectedCapRate,
    totalAcquisitionCost: Math.round(totalAcquisitionCost),
    projectedAnnualReturn,
  };
}

// Calculate portfolio-level aggregates
export function calculateAcquisitionAggregates(
  acquisitionProperties: AcquisitionProperty[]
): AcquisitionAggregates {
  if (acquisitionProperties.length === 0) {
    return {
      propertyCount: 0,
      totalOfferPrice: 0,
      totalProjectedNOI: 0,
      avgProjectedCapRate: 0,
      totalAcquisitionCost: 0,
      avgProjectedAnnualReturn: 0,
    };
  }

  const totals = acquisitionProperties.reduce(
    (acc, ap) => {
      return {
        totalOfferPrice: acc.totalOfferPrice + ap.outputs.offerPrice,
        totalProjectedNOI: acc.totalProjectedNOI + ap.outputs.projectedNOI,
        totalAcquisitionCost: acc.totalAcquisitionCost + ap.outputs.totalAcquisitionCost,
        sumCapRate: acc.sumCapRate + ap.outputs.projectedCapRate,
        sumAnnualReturn: acc.sumAnnualReturn + ap.outputs.projectedAnnualReturn,
      };
    },
    {
      totalOfferPrice: 0,
      totalProjectedNOI: 0,
      totalAcquisitionCost: 0,
      sumCapRate: 0,
      sumAnnualReturn: 0,
    }
  );

  return {
    propertyCount: acquisitionProperties.length,
    totalOfferPrice: totals.totalOfferPrice,
    totalProjectedNOI: totals.totalProjectedNOI,
    avgProjectedCapRate: totals.sumCapRate / acquisitionProperties.length,
    totalAcquisitionCost: totals.totalAcquisitionCost,
    avgProjectedAnnualReturn: totals.sumAnnualReturn / acquisitionProperties.length,
  };
}

// Formatting utilities
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPercent(value: number, decimals: number = 2): string {
  return `${(value * 100).toFixed(decimals)}%`;
}
