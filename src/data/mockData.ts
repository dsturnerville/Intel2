/**
 * Mock Data for Disposition Underwriting Module
 * 
 * This provides realistic sample data for development and demonstration.
 */

import {
  Property,
  Disposition,
  DispositionProperty,
  Deal,
} from '@/types/disposition';
import { calculatePropertyUnderwriting } from '@/utils/calculations';

// ============================================================================
// MOCK PROPERTIES
// ============================================================================

export const mockProperties: Property[] = [
  {
    id: 'prop-001',
    address: '1234 Oak Lane',
    city: 'Dallas',
    state: 'TX',
    zipCode: '75201',
    market: 'Dallas-Fort Worth',
    beds: 3,
    baths: 2,
    sqft: 1850,
    yearBuilt: 2015,
    lotSize: 6500,
    acquisitionDate: '2021-03-15',
    acquisitionPrice: 285000,
    acquisitionBasis: 298500, // Including closing costs and initial capex
    currentRent: 2100,
    occupancyStatus: 'Occupied',
    leaseEndDate: '2025-06-30',
    estimatedMarketValue: 365000,
    lastAppraisalDate: '2024-09-15',
    lastAppraisalValue: 358000,
  },
  {
    id: 'prop-002',
    address: '567 Maple Drive',
    city: 'Plano',
    state: 'TX',
    zipCode: '75024',
    market: 'Dallas-Fort Worth',
    beds: 4,
    baths: 2.5,
    sqft: 2200,
    yearBuilt: 2018,
    lotSize: 7200,
    acquisitionDate: '2022-01-10',
    acquisitionPrice: 375000,
    acquisitionBasis: 392000,
    currentRent: 2650,
    occupancyStatus: 'Occupied',
    leaseEndDate: '2025-12-31',
    estimatedMarketValue: 445000,
    lastAppraisalDate: '2024-10-01',
    lastAppraisalValue: 440000,
  },
  {
    id: 'prop-003',
    address: '890 Cedar Street',
    city: 'Frisco',
    state: 'TX',
    zipCode: '75034',
    market: 'Dallas-Fort Worth',
    beds: 3,
    baths: 2,
    sqft: 1650,
    yearBuilt: 2012,
    lotSize: 5800,
    acquisitionDate: '2020-08-22',
    acquisitionPrice: 245000,
    acquisitionBasis: 262000,
    currentRent: 1950,
    occupancyStatus: 'Vacant',
    estimatedMarketValue: 335000,
    lastAppraisalDate: '2024-08-10',
    lastAppraisalValue: 330000,
  },
  {
    id: 'prop-004',
    address: '2100 Elm Boulevard',
    city: 'Richardson',
    state: 'TX',
    zipCode: '75080',
    market: 'Dallas-Fort Worth',
    beds: 4,
    baths: 3,
    sqft: 2400,
    yearBuilt: 2020,
    lotSize: 8000,
    acquisitionDate: '2022-06-15',
    acquisitionPrice: 420000,
    acquisitionBasis: 438000,
    currentRent: 2900,
    occupancyStatus: 'Occupied',
    leaseEndDate: '2025-09-15',
    estimatedMarketValue: 485000,
    lastAppraisalDate: '2024-11-01',
    lastAppraisalValue: 480000,
  },
  {
    id: 'prop-005',
    address: '3456 Pine Avenue',
    city: 'Phoenix',
    state: 'AZ',
    zipCode: '85001',
    market: 'Phoenix',
    beds: 3,
    baths: 2,
    sqft: 1750,
    yearBuilt: 2016,
    lotSize: 6000,
    acquisitionDate: '2021-11-20',
    acquisitionPrice: 295000,
    acquisitionBasis: 310000,
    currentRent: 2200,
    occupancyStatus: 'Occupied',
    leaseEndDate: '2025-04-30',
    estimatedMarketValue: 385000,
    lastAppraisalDate: '2024-07-15',
    lastAppraisalValue: 380000,
  },
  {
    id: 'prop-006',
    address: '7890 Birch Road',
    city: 'Scottsdale',
    state: 'AZ',
    zipCode: '85251',
    market: 'Phoenix',
    beds: 4,
    baths: 2.5,
    sqft: 2100,
    yearBuilt: 2019,
    lotSize: 7500,
    acquisitionDate: '2023-02-28',
    acquisitionPrice: 425000,
    acquisitionBasis: 445000,
    currentRent: 3100,
    occupancyStatus: 'Occupied',
    leaseEndDate: '2026-02-28',
    estimatedMarketValue: 465000,
    lastAppraisalDate: '2024-10-20',
    lastAppraisalValue: 460000,
  },
  {
    id: 'prop-007',
    address: '4567 Walnut Circle',
    city: 'Atlanta',
    state: 'GA',
    zipCode: '30301',
    market: 'Atlanta',
    beds: 3,
    baths: 2,
    sqft: 1600,
    yearBuilt: 2014,
    lotSize: 5500,
    acquisitionDate: '2020-05-10',
    acquisitionPrice: 225000,
    acquisitionBasis: 240000,
    currentRent: 1800,
    occupancyStatus: 'Notice Given',
    leaseEndDate: '2025-03-15',
    estimatedMarketValue: 315000,
    lastAppraisalDate: '2024-06-01',
    lastAppraisalValue: 310000,
  },
  {
    id: 'prop-008',
    address: '9012 Spruce Lane',
    city: 'Marietta',
    state: 'GA',
    zipCode: '30060',
    market: 'Atlanta',
    beds: 4,
    baths: 2,
    sqft: 1900,
    yearBuilt: 2011,
    lotSize: 6800,
    acquisitionDate: '2019-09-05',
    acquisitionPrice: 215000,
    acquisitionBasis: 230000,
    currentRent: 1750,
    occupancyStatus: 'Occupied',
    leaseEndDate: '2025-08-31',
    estimatedMarketValue: 295000,
    lastAppraisalDate: '2024-09-01',
    lastAppraisalValue: 290000,
  },
];

// ============================================================================
// MOCK DISPOSITIONS
// ============================================================================

const defaultDispositionDefaults = {
  salePriceMethodology: 'Comp Based' as const,
  capRate: 0.055,
  discountToMarketValue: 0.03,
  brokerFeePercent: 0.05,
  closingCostPercent: 0.02,
  sellerConcessionsPercent: 0.01,
  makeReadyCapexPercent: 0.015,
  holdingPeriodMonths: 3,
};

export const mockDispositions: Disposition[] = [
  {
    id: 'disp-001',
    name: 'Q2 2025 Dallas Portfolio Sale',
    status: 'Draft',
    type: 'Portfolio',
    createdAt: '2024-12-15T10:30:00Z',
    createdBy: 'John Smith',
    updatedAt: '2024-12-20T14:45:00Z',
    updatedBy: 'Sarah Johnson',
    targetListDate: '2025-04-01',
    targetCloseDate: '2025-06-30',
    exitStrategyNotes: 'Strategic exit from older Dallas assets to redeploy capital into growth markets.',
    investmentThesis: 'Market appreciation has exceeded expectations. Optimal exit timing given interest rate environment.',
    defaults: {
      ...defaultDispositionDefaults,
      discountToMarketValue: 0.02,
    },
    markets: ['Dallas-Fort Worth'],
    tags: ['strategic-exit', 'capital-redeploy'],
  },
  {
    id: 'disp-002',
    name: 'Phoenix Single-Family Exit',
    status: 'Under Review',
    type: 'Single Property',
    createdAt: '2024-11-28T09:15:00Z',
    createdBy: 'Mike Chen',
    updatedAt: '2024-12-18T11:20:00Z',
    updatedBy: 'Mike Chen',
    targetListDate: '2025-02-15',
    targetCloseDate: '2025-04-15',
    exitStrategyNotes: 'Single asset exit to capture market peak before projected slowdown.',
    investmentThesis: 'Strong appreciation combined with upcoming lease expiry creates optimal exit window.',
    defaults: {
      ...defaultDispositionDefaults,
      salePriceMethodology: 'Cap Rate Based',
      capRate: 0.052,
    },
    markets: ['Phoenix'],
    tags: ['market-timing'],
  },
  {
    id: 'disp-003',
    name: 'Atlanta Legacy Portfolio',
    status: 'Approved to List',
    type: 'Portfolio',
    createdAt: '2024-10-05T08:00:00Z',
    createdBy: 'Sarah Johnson',
    updatedAt: '2024-12-10T16:30:00Z',
    updatedBy: 'John Smith',
    targetListDate: '2025-01-15',
    targetCloseDate: '2025-03-31',
    exitStrategyNotes: 'Divesting legacy Atlanta assets acquired pre-2020 to reset portfolio vintage.',
    investmentThesis: 'Older assets require significant capex. Better returns available in newer construction.',
    defaults: {
      ...defaultDispositionDefaults,
      brokerFeePercent: 0.045,
      makeReadyCapexPercent: 0.025,
    },
    markets: ['Atlanta'],
    tags: ['legacy-exit', 'capex-avoidance'],
    linkedDealId: 'deal-001',
  },
  {
    id: 'disp-004',
    name: 'Scottsdale Premium Exit',
    status: 'Archived',
    type: 'Single Property',
    createdAt: '2024-08-20T14:00:00Z',
    createdBy: 'Mike Chen',
    updatedAt: '2024-11-30T10:00:00Z',
    updatedBy: 'Sarah Johnson',
    exitStrategyNotes: 'Scenario analysis for premium Scottsdale asset. Decision: hold for additional appreciation.',
    defaults: defaultDispositionDefaults,
    markets: ['Phoenix'],
    tags: ['hold-decision', 'scenario-analysis'],
  },
];

// ============================================================================
// MOCK DISPOSITION PROPERTIES (with calculations)
// ============================================================================

function createDispositionProperty(
  id: string,
  dispositionId: string,
  property: Property,
  disposition: Disposition,
  customInputs?: Partial<{
    useDispositionDefaults: boolean;
    flatSalePrice: number;
  }>
): DispositionProperty {
  const inputs = {
    useDispositionDefaults: customInputs?.useDispositionDefaults ?? true,
    flatSalePrice: customInputs?.flatSalePrice,
  };
  
  const outputs = calculatePropertyUnderwriting(property, inputs, disposition.defaults);
  
  return {
    id,
    dispositionId,
    propertyId: property.id,
    property,
    inputs,
    outputs,
  };
}

export const mockDispositionProperties: DispositionProperty[] = [
  // Dallas Portfolio (disp-001): 4 properties
  createDispositionProperty('dp-001', 'disp-001', mockProperties[0], mockDispositions[0]),
  createDispositionProperty('dp-002', 'disp-001', mockProperties[1], mockDispositions[0]),
  createDispositionProperty('dp-003', 'disp-001', mockProperties[2], mockDispositions[0]),
  createDispositionProperty('dp-004', 'disp-001', mockProperties[3], mockDispositions[0]),
  
  // Phoenix Single (disp-002): 1 property
  createDispositionProperty('dp-005', 'disp-002', mockProperties[4], mockDispositions[1]),
  
  // Atlanta Portfolio (disp-003): 2 properties
  createDispositionProperty('dp-006', 'disp-003', mockProperties[6], mockDispositions[2]),
  createDispositionProperty('dp-007', 'disp-003', mockProperties[7], mockDispositions[2]),
  
  // Scottsdale (disp-004): 1 property (archived)
  createDispositionProperty('dp-008', 'disp-004', mockProperties[5], mockDispositions[3]),
];

// ============================================================================
// MOCK DEALS
// ============================================================================

export const mockDeals: Deal[] = [
  {
    id: 'deal-001',
    dispositionId: 'disp-003',
    name: 'Atlanta Legacy Portfolio - Listing',
    status: 'Listed',
    listPrice: 595000,
    listDate: '2025-01-15',
    closeProbability: 75,
    expectedCloseDate: '2025-03-31',
    propertyIds: ['prop-007', 'prop-008'],
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getDispositionProperties(dispositionId: string): DispositionProperty[] {
  return mockDispositionProperties.filter(dp => dp.dispositionId === dispositionId);
}

export function getDispositionById(id: string): Disposition | undefined {
  return mockDispositions.find(d => d.id === id);
}

export function getPropertyById(id: string): Property | undefined {
  return mockProperties.find(p => p.id === id);
}

export function getDealByDispositionId(dispositionId: string): Deal | undefined {
  return mockDeals.find(d => d.dispositionId === dispositionId);
}

export function getAvailableProperties(excludeIds: string[] = []): Property[] {
  return mockProperties.filter(p => !excludeIds.includes(p.id));
}

export function getAllMarkets(): string[] {
  return [...new Set(mockProperties.map(p => p.market))];
}
