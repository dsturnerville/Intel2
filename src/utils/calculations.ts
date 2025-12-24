/**
 * Disposition Underwriting Calculations
 * 
 * All underwriting calculations are centralized here to ensure
 * deterministic results and easy maintenance.
 */

import {
  Property,
  Disposition,
  DispositionProperty,
  PropertyUnderwritingInputs,
  PropertyUnderwritingOutputs,
  DispositionAggregates,
  DispositionDefaults,
  SalePriceMethodology,
} from '@/types/disposition';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate Net Operating Income (NOI) for a property
 * Uses annual rent as a simplified proxy
 */
export function calculateNOI(property: Property): number {
  // Simplified: Annual rent minus estimated operating expenses (~40%)
  const annualRent = property.currentRent * 12;
  const operatingExpenseRatio = 0.40;
  return annualRent * (1 - operatingExpenseRatio);
}

/**
 * Get effective inputs for a property, resolving defaults vs custom
 */
export function getEffectiveInputs(
  inputs: PropertyUnderwritingInputs,
  defaults: DispositionDefaults
): Required<Omit<PropertyUnderwritingInputs, 'useDispositionDefaults' | 'flatSalePrice'>> & { flatSalePrice?: number } {
  if (inputs.useDispositionDefaults) {
    return {
      salePriceMethodology: defaults.salePriceMethodology,
      capRate: defaults.capRate,
      discountToMarketValue: defaults.discountToMarketValue,
      brokerFeePercent: defaults.brokerFeePercent,
      closingCostPercent: defaults.closingCostPercent,
      sellerConcessionsPercent: defaults.sellerConcessionsPercent,
      makeReadyCapexPercent: defaults.makeReadyCapexPercent,
      holdingPeriodMonths: defaults.holdingPeriodMonths,
      flatSalePrice: inputs.flatSalePrice,
    };
  }
  
  return {
    salePriceMethodology: inputs.salePriceMethodology ?? defaults.salePriceMethodology,
    capRate: inputs.capRate ?? defaults.capRate,
    discountToMarketValue: inputs.discountToMarketValue ?? defaults.discountToMarketValue,
    brokerFeePercent: inputs.brokerFeePercent ?? defaults.brokerFeePercent,
    closingCostPercent: inputs.closingCostPercent ?? defaults.closingCostPercent,
    sellerConcessionsPercent: inputs.sellerConcessionsPercent ?? defaults.sellerConcessionsPercent,
    makeReadyCapexPercent: inputs.makeReadyCapexPercent ?? defaults.makeReadyCapexPercent,
    holdingPeriodMonths: inputs.holdingPeriodMonths ?? defaults.holdingPeriodMonths,
    flatSalePrice: inputs.flatSalePrice,
  };
}

// ============================================================================
// SALE PRICE CALCULATIONS
// ============================================================================

/**
 * Calculate projected sale price based on methodology
 */
export function calculateProjectedSalePrice(
  property: Property,
  methodology: SalePriceMethodology,
  capRate: number,
  discountToMarketValue: number,
  flatSalePrice?: number
): number {
  switch (methodology) {
    case 'Cap Rate Based': {
      // Price = NOI / Cap Rate
      const noi = calculateNOI(property);
      return Math.round(noi / capRate);
    }
    
    case 'Comp Based': {
      // Use estimated market value with optional discount
      return Math.round(property.estimatedMarketValue * (1 - discountToMarketValue));
    }
    
    case 'Flat Price Input': {
      // Use manually entered price
      return flatSalePrice ?? property.estimatedMarketValue;
    }
    
    default:
      return property.estimatedMarketValue;
  }
}

// ============================================================================
// SELLING COSTS CALCULATIONS
// ============================================================================

/**
 * Calculate all selling costs for a property
 */
export function calculateSellingCosts(
  salePrice: number,
  brokerFeePercent: number,
  closingCostPercent: number,
  sellerConcessionsPercent: number,
  makeReadyCapexPercent: number
): {
  brokerCommission: number;
  closingCosts: number;
  sellerConcessions: number;
  makeReadyCapex: number;
  totalSellingCosts: number;
} {
  const brokerCommission = Math.round(salePrice * brokerFeePercent);
  const closingCosts = Math.round(salePrice * closingCostPercent);
  const sellerConcessions = Math.round(salePrice * sellerConcessionsPercent);
  const makeReadyCapex = Math.round(salePrice * makeReadyCapexPercent);
  
  const totalSellingCosts = brokerCommission + closingCosts + sellerConcessions + makeReadyCapex;
  
  return {
    brokerCommission,
    closingCosts,
    sellerConcessions,
    makeReadyCapex,
    totalSellingCosts,
  };
}

// ============================================================================
// RETURN CALCULATIONS
// ============================================================================

/**
 * Calculate hold period in years from acquisition date to projected sale
 */
export function calculateHoldPeriodYears(
  acquisitionDate: string,
  holdingPeriodMonths: number
): number {
  const acquisition = new Date(acquisitionDate);
  const now = new Date();
  const yearsHeld = (now.getTime() - acquisition.getTime()) / (1000 * 60 * 60 * 24 * 365);
  const additionalYears = holdingPeriodMonths / 12;
  return Math.round((yearsHeld + additionalYears) * 100) / 100;
}

/**
 * Calculate simple return (total return, not annualized)
 */
export function calculateSimpleReturn(
  netProceeds: number,
  basis: number
): number {
  if (basis === 0) return 0;
  return (netProceeds - basis) / basis;
}

/**
 * Calculate approximate annualized return (simplified IRR)
 * Using the formula: (1 + total_return)^(1/years) - 1
 */
export function calculateAnnualizedReturn(
  netProceeds: number,
  basis: number,
  holdPeriodYears: number
): number | undefined {
  if (basis === 0 || holdPeriodYears <= 0) return undefined;
  
  const totalReturn = netProceeds / basis;
  if (totalReturn <= 0) return undefined;
  
  return Math.pow(totalReturn, 1 / holdPeriodYears) - 1;
}

// ============================================================================
// MAIN CALCULATION FUNCTION - PER PROPERTY
// ============================================================================

/**
 * Calculate all underwriting outputs for a single property
 */
export function calculatePropertyUnderwriting(
  property: Property,
  inputs: PropertyUnderwritingInputs,
  defaults: DispositionDefaults
): PropertyUnderwritingOutputs {
  const effective = getEffectiveInputs(inputs, defaults);
  
  // Calculate projected sale price
  const projectedSalePrice = calculateProjectedSalePrice(
    property,
    effective.salePriceMethodology,
    effective.capRate,
    effective.discountToMarketValue,
    effective.flatSalePrice
  );
  
  // Gross proceeds equal sale price for these purposes
  const grossSaleProceeds = projectedSalePrice;
  
  // Calculate selling costs
  const costs = calculateSellingCosts(
    projectedSalePrice,
    effective.brokerFeePercent,
    effective.closingCostPercent,
    effective.sellerConcessionsPercent,
    effective.makeReadyCapexPercent
  );
  
  // Net proceeds
  const netSaleProceeds = grossSaleProceeds - costs.totalSellingCosts;
  
  // Gain/loss vs basis
  const gainLossVsBasis = netSaleProceeds - property.acquisitionBasis;
  const gainLossPercent = property.acquisitionBasis > 0 
    ? gainLossVsBasis / property.acquisitionBasis 
    : 0;
  
  // Hold period and returns
  const holdPeriodYears = calculateHoldPeriodYears(
    property.acquisitionDate,
    effective.holdingPeriodMonths
  );
  
  const simpleReturn = calculateSimpleReturn(netSaleProceeds, property.acquisitionBasis);
  const annualizedReturn = calculateAnnualizedReturn(
    netSaleProceeds,
    property.acquisitionBasis,
    holdPeriodYears
  );
  
  return {
    projectedSalePrice,
    grossSaleProceeds,
    brokerCommission: costs.brokerCommission,
    closingCosts: costs.closingCosts,
    sellerConcessions: costs.sellerConcessions,
    makeReadyCapex: costs.makeReadyCapex,
    totalSellingCosts: costs.totalSellingCosts,
    netSaleProceeds,
    gainLossVsBasis,
    gainLossPercent,
    simpleReturn,
    annualizedReturn,
    holdPeriodYears,
  };
}

// ============================================================================
// AGGREGATE CALCULATIONS - PORTFOLIO LEVEL
// ============================================================================

/**
 * Calculate portfolio-level aggregates from all disposition properties
 */
export function calculateDispositionAggregates(
  dispositionProperties: DispositionProperty[]
): DispositionAggregates {
  const propertyCount = dispositionProperties.length;
  
  if (propertyCount === 0) {
    return {
      propertyCount: 0,
      totalProjectedSalePrice: 0,
      totalGrossSaleProceeds: 0,
      totalBrokerCommission: 0,
      totalClosingCosts: 0,
      totalSellerConcessions: 0,
      totalMakeReadyCapex: 0,
      totalSellingCosts: 0,
      totalNetSaleProceeds: 0,
      totalGainLossVsBasis: 0,
      totalAcquisitionBasis: 0,
      weightedAverageROI: 0,
      averageHoldPeriodYears: 0,
    };
  }
  
  // Sum all values
  const totals = dispositionProperties.reduce(
    (acc, dp) => {
      const outputs = dp.outputs;
      return {
        projectedSalePrice: acc.projectedSalePrice + outputs.projectedSalePrice,
        grossSaleProceeds: acc.grossSaleProceeds + outputs.grossSaleProceeds,
        brokerCommission: acc.brokerCommission + outputs.brokerCommission,
        closingCosts: acc.closingCosts + outputs.closingCosts,
        sellerConcessions: acc.sellerConcessions + outputs.sellerConcessions,
        makeReadyCapex: acc.makeReadyCapex + outputs.makeReadyCapex,
        totalSellingCosts: acc.totalSellingCosts + outputs.totalSellingCosts,
        netSaleProceeds: acc.netSaleProceeds + outputs.netSaleProceeds,
        gainLossVsBasis: acc.gainLossVsBasis + outputs.gainLossVsBasis,
        acquisitionBasis: acc.acquisitionBasis + dp.property.acquisitionBasis,
        holdPeriodYears: acc.holdPeriodYears + outputs.holdPeriodYears,
      };
    },
    {
      projectedSalePrice: 0,
      grossSaleProceeds: 0,
      brokerCommission: 0,
      closingCosts: 0,
      sellerConcessions: 0,
      makeReadyCapex: 0,
      totalSellingCosts: 0,
      netSaleProceeds: 0,
      gainLossVsBasis: 0,
      acquisitionBasis: 0,
      holdPeriodYears: 0,
    }
  );
  
  // Calculate weighted average ROI
  const weightedAverageROI = totals.acquisitionBasis > 0
    ? totals.gainLossVsBasis / totals.acquisitionBasis
    : 0;
  
  // Average hold period
  const averageHoldPeriodYears = totals.holdPeriodYears / propertyCount;
  
  // Approximate portfolio IRR (simplified: using weighted average)
  const portfolioIRR = averageHoldPeriodYears > 0
    ? calculateAnnualizedReturn(
        totals.netSaleProceeds,
        totals.acquisitionBasis,
        averageHoldPeriodYears
      )
    : undefined;
  
  return {
    propertyCount,
    totalProjectedSalePrice: totals.projectedSalePrice,
    totalGrossSaleProceeds: totals.grossSaleProceeds,
    totalBrokerCommission: totals.brokerCommission,
    totalClosingCosts: totals.closingCosts,
    totalSellerConcessions: totals.sellerConcessions,
    totalMakeReadyCapex: totals.makeReadyCapex,
    totalSellingCosts: totals.totalSellingCosts,
    totalNetSaleProceeds: totals.netSaleProceeds,
    totalGainLossVsBasis: totals.gainLossVsBasis,
    totalAcquisitionBasis: totals.acquisitionBasis,
    weightedAverageROI,
    portfolioIRR,
    averageHoldPeriodYears: Math.round(averageHoldPeriodYears * 100) / 100,
  };
}

// ============================================================================
// FORMATTING UTILITIES
// ============================================================================

/**
 * Format a number as currency
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Format a number as a percentage
 */
export function formatPercent(value: number, decimals: number = 1): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Format a number with commas
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value);
}
