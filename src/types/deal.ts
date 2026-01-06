// Unified Deal Types - supports both Acquisitions and Dispositions

// Deal type discriminator
export type DealType = 'Acquisition' | 'Disposition';

// Unified deal status (covers both workflows)
export type DealStatus = 
  | 'Pre-Listing'      // Initial draft
  | 'LOI Submitted'    // Acquisition: LOI sent
  | 'LOI Accepted'     // Acquisition: LOI countersigned
  | 'Listed'           // Disposition: On market
  | 'Under Contract'   // Both: Contract in negotiation
  | 'PSA Executed'     // Acquisition: PSA signed
  | 'Due Diligence'    // Both: Inspection period
  | 'Pending Close'    // Both: Awaiting closing
  | 'Closed'           // Both: Deal complete
  | 'Terminated';      // Both: Deal fell through

// Unified Deal interface
export interface Deal {
  id: string;
  name: string;
  dealType: DealType;
  status: DealStatus;
  
  // Parent references (one must be set)
  acquisitionId?: string;
  dispositionId?: string;
  
  // Pricing (unified terminology)
  askingPrice?: number;      // Listing/asking price
  purchasePrice?: number;    // Working/negotiated price
  
  // Key dates
  listDate?: string;
  offerDate?: string;
  expectedCloseDate?: string;
  actualCloseDate?: string;
  actualClosePrice?: number;
  
  // Contract details
  earnestMoney?: number;
  earnestMoneyDate?: string;
  inspectionPeriodDays?: number;
  inspectionEndDate?: string;
  financingContingencyDate?: string;
  
  // Probability and notes
  closeProbability?: number;
  notes?: string;
  
  // Metadata
  createdAt: string;
  createdBy?: string;
  updatedAt: string;
  updatedBy?: string;
}

// Deal property association
export interface DealProperty {
  id: string;
  dealId: string;
  propertyId?: string;
  acquisitionPropertyId?: string;
  createdAt: string;
}

// Helper arrays for status workflow
export const ACQUISITION_STATUSES: DealStatus[] = [
  'Pre-Listing', 'LOI Submitted', 'LOI Accepted', 
  'Under Contract', 'PSA Executed', 'Due Diligence', 
  'Pending Close', 'Closed', 'Terminated'
];

export const DISPOSITION_STATUSES: DealStatus[] = [
  'Pre-Listing', 'Listed', 'Under Contract', 
  'Due Diligence', 'Pending Close', 'Closed', 'Terminated'
];

// All possible statuses
export const ALL_DEAL_STATUSES: DealStatus[] = [
  'Pre-Listing', 'LOI Submitted', 'LOI Accepted', 'Listed',
  'Under Contract', 'PSA Executed', 'Due Diligence', 
  'Pending Close', 'Closed', 'Terminated'
];

// Helper to get valid statuses for a deal type
export function getStatusesForDealType(dealType: DealType): DealStatus[] {
  return dealType === 'Acquisition' ? ACQUISITION_STATUSES : DISPOSITION_STATUSES;
}
