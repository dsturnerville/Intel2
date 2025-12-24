import { useState, useMemo, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { StatusBadge } from '@/components/disposition/StatusBadge';
import { PropertyTable } from '@/components/disposition/PropertyTable';
import { UnderwritingDefaults } from '@/components/disposition/UnderwritingDefaults';
import { PortfolioSummary } from '@/components/disposition/PortfolioSummary';
import { AddPropertyDialog } from '@/components/disposition/AddPropertyDialog';
import { LinkedDeal } from '@/components/disposition/LinkedDeal';
import {
  getDispositionById,
  getDispositionProperties,
  getAvailableProperties,
  getDealByDispositionId,
  mockProperties,
} from '@/data/mockData';
import {
  calculateDispositionAggregates,
  calculatePropertyUnderwriting,
} from '@/utils/calculations';
import {
  Disposition,
  DispositionProperty,
  DispositionStatus,
  DispositionDefaults,
} from '@/types/disposition';
import {
  ArrowLeft,
  Save,
  Plus,
  Calendar,
  User,
  FileText,
  Building2,
} from 'lucide-react';
import { toast } from 'sonner';

export default function DispositionDetail() {
  const { id } = useParams<{ id: string }>();

  // Get initial data
  const initialDisposition = id ? getDispositionById(id) : undefined;
  const initialProperties = id ? getDispositionProperties(id) : [];
  const linkedDeal = id ? getDealByDispositionId(id) : undefined;

  // Local state for editing
  const [disposition, setDisposition] = useState<Disposition | undefined>(initialDisposition);
  const [properties, setProperties] = useState<DispositionProperty[]>(initialProperties);
  const [isAddPropertyOpen, setIsAddPropertyOpen] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Calculate aggregates whenever properties change
  const aggregates = useMemo(() => {
    return calculateDispositionAggregates(properties);
  }, [properties]);

  // Available properties (not already in this disposition)
  const availableProperties = useMemo(() => {
    const existingIds = properties.map((p) => p.propertyId);
    return getAvailableProperties(existingIds);
  }, [properties]);

  // Handlers
  const handleStatusChange = (status: DispositionStatus) => {
    if (!disposition) return;
    setDisposition({ ...disposition, status });
    setHasChanges(true);
  };

  const handleDefaultsUpdate = (defaults: DispositionDefaults) => {
    if (!disposition) return;
    setDisposition({ ...disposition, defaults });
    setHasChanges(true);
  };

  const handleApplyDefaultsToAll = useCallback(() => {
    if (!disposition) return;

    const updatedProperties = properties.map((dp) => {
      const newInputs = { ...dp.inputs, useDispositionDefaults: true };
      const newOutputs = calculatePropertyUnderwriting(dp.property, newInputs, disposition.defaults);
      return { ...dp, inputs: newInputs, outputs: newOutputs };
    });

    setProperties(updatedProperties);
    setHasChanges(true);
    toast.success('Applied defaults to all properties');
  }, [disposition, properties]);

  const handleRemoveProperty = useCallback((propertyId: string) => {
    setProperties((prev) => prev.filter((p) => p.propertyId !== propertyId));
    setHasChanges(true);
    toast.success('Property removed from disposition');
  }, []);

  const handleUpdateProperty = useCallback(
    (propertyId: string, updates: Partial<DispositionProperty>) => {
      setProperties((prev) =>
        prev.map((p) => (p.propertyId === propertyId ? { ...p, ...updates } : p))
      );
      setHasChanges(true);
    },
    []
  );

  const handleAddProperties = useCallback(
    (propertyIds: string[]) => {
      if (!disposition) return;

      const newProperties: DispositionProperty[] = propertyIds
        .map((propId) => {
          const property = mockProperties.find((p) => p.id === propId);
          if (!property) return null;

          const inputs = { useDispositionDefaults: true };
          const outputs = calculatePropertyUnderwriting(property, inputs, disposition.defaults);

          return {
            id: `dp-${Date.now()}-${propId}`,
            dispositionId: disposition.id,
            propertyId: propId,
            property,
            inputs,
            outputs,
          };
        })
        .filter((p): p is DispositionProperty => p !== null);

      setProperties((prev) => [...prev, ...newProperties]);
      setHasChanges(true);
      toast.success(`Added ${newProperties.length} properties`);
    },
    [disposition]
  );

  const handleSave = () => {
    // In a real app, this would save to the backend
    setHasChanges(false);
    toast.success('Disposition saved successfully');
  };

  const handleCreateDeal = () => {
    toast.info('Create Deal functionality would be implemented here');
  };

  if (!disposition) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Building2 className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground">Disposition not found</p>
          <Link to="/dispositions">
            <Button variant="link" className="mt-2">
              Back to Dispositions
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const isReadOnly = disposition.status === 'Archived';

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/dispositions">
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-semibold tracking-tight">{disposition.name}</h1>
                  <StatusBadge status={disposition.status} />
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {disposition.type} • {disposition.markets.join(', ')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!isReadOnly && (
                <Select
                  value={disposition.status}
                  onValueChange={(value) => handleStatusChange(value as DispositionStatus)}
                >
                  <SelectTrigger className="w-[160px] bg-input border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="Under Review">Under Review</SelectItem>
                    <SelectItem value="Approved to List">Approved to List</SelectItem>
                    <SelectItem value="Archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              )}
              <Button
                onClick={handleSave}
                disabled={!hasChanges || isReadOnly}
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container py-6 space-y-8">
        {/* Metadata */}
        <div className="grid grid-cols-4 gap-4">
          <Card className="border-border bg-card">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Calendar className="h-3 w-3" />
                <span className="text-xs">Target List Date</span>
              </div>
              <p className="font-mono text-sm">
                {disposition.targetListDate
                  ? new Date(disposition.targetListDate).toLocaleDateString()
                  : 'Not set'}
              </p>
            </CardContent>
          </Card>
          <Card className="border-border bg-card">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Calendar className="h-3 w-3" />
                <span className="text-xs">Target Close Date</span>
              </div>
              <p className="font-mono text-sm">
                {disposition.targetCloseDate
                  ? new Date(disposition.targetCloseDate).toLocaleDateString()
                  : 'Not set'}
              </p>
            </CardContent>
          </Card>
          <Card className="border-border bg-card">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <User className="h-3 w-3" />
                <span className="text-xs">Created By</span>
              </div>
              <p className="text-sm">{disposition.createdBy}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(disposition.createdAt).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
          <Card className="border-border bg-card">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <User className="h-3 w-3" />
                <span className="text-xs">Last Updated By</span>
              </div>
              <p className="text-sm">{disposition.updatedBy}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(disposition.updatedAt).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Investment Thesis & Notes */}
        {(disposition.investmentThesis || disposition.exitStrategyNotes) && (
          <div className="grid grid-cols-2 gap-4">
            {disposition.investmentThesis && (
              <Card className="border-border bg-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    Investment Thesis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{disposition.investmentThesis}</p>
                </CardContent>
              </Card>
            )}
            {disposition.exitStrategyNotes && (
              <Card className="border-border bg-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    Exit Strategy
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{disposition.exitStrategyNotes}</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        <Separator />

        {/* Portfolio Summary */}
        <PortfolioSummary aggregates={aggregates} />

        <Separator />

        {/* Underwriting Defaults */}
        <UnderwritingDefaults
          defaults={disposition.defaults}
          onUpdate={handleDefaultsUpdate}
          onApplyToAll={handleApplyDefaultsToAll}
          readOnly={isReadOnly}
        />

        <Separator />

        {/* Properties Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Properties ({properties.length})
            </h3>
            {!isReadOnly && (
              <Button
                variant="subtle"
                size="sm"
                onClick={() => setIsAddPropertyOpen(true)}
                className="gap-2"
              >
                <Plus className="h-3 w-3" />
                Add Properties
              </Button>
            )}
          </div>

          {properties.length > 0 ? (
            <PropertyTable
              properties={properties}
              defaults={disposition.defaults}
              onRemoveProperty={handleRemoveProperty}
              onUpdateProperty={handleUpdateProperty}
              readOnly={isReadOnly}
            />
          ) : (
            <Card className="border-border border-dashed bg-muted/20">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Building2 className="h-10 w-10 text-muted-foreground/50 mb-4" />
                <p className="text-sm text-muted-foreground mb-4">
                  No properties in this disposition
                </p>
                {!isReadOnly && (
                  <Button onClick={() => setIsAddPropertyOpen(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Properties
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <Separator />

        {/* Linked Deal */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Deal Linkage
          </h3>
          <LinkedDeal deal={linkedDeal} onCreateDeal={handleCreateDeal} />
        </div>
      </main>

      {/* Add Property Dialog */}
      <AddPropertyDialog
        open={isAddPropertyOpen}
        onOpenChange={setIsAddPropertyOpen}
        availableProperties={availableProperties}
        onAddProperties={handleAddProperties}
      />
    </div>
  );
}
