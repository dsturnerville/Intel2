import { forwardRef } from 'react';
import { DispositionProperty, DispositionAggregates, DispositionDefaults } from '@/types/disposition';
import { PortfolioSummary } from './PortfolioSummary';
import { PropertyTable } from './PropertyTable';
import { PropertyMap } from './PropertyMap';

interface SummaryPdfContentProps {
  dispositionName: string;
  status: string;
  properties: DispositionProperty[];
  aggregates: DispositionAggregates;
  defaults: DispositionDefaults;
}

export const SummaryPdfContent = forwardRef<HTMLDivElement, SummaryPdfContentProps>(
  ({ dispositionName, status, properties, aggregates, defaults }, ref) => {
    return (
      <div 
        ref={ref}
        data-pdf-content
        className="bg-white p-6 space-y-8"
        style={{ width: '1200px' }}
      >
        {/* Header */}
        <div className="border-b border-gray-200 pb-4">
          <h1 className="text-2xl font-bold text-gray-900">{dispositionName}</h1>
          <p className="text-sm text-gray-500 mt-1">Status: {status}</p>
        </div>

        {/* Portfolio Summary */}
        <div>
          <PortfolioSummary aggregates={aggregates} />
        </div>

        {/* Property List */}
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-4">
            Properties ({properties.length})
          </h3>
          <PropertyTable
            properties={properties}
            defaults={defaults}
            onRemoveProperty={() => {}}
            onUpdateProperty={() => {}}
            readOnly={true}
          />
        </div>

        {/* Property Map */}
        {properties.some(p => p.property.latitude && p.property.longitude) && (
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-4">
              Property Map
            </h3>
            <div style={{ height: '500px' }}>
              <PropertyMap properties={properties} />
            </div>
          </div>
        )}
      </div>
    );
  }
);

SummaryPdfContent.displayName = 'SummaryPdfContent';
