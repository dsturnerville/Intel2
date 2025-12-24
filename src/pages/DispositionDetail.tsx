import { useState, useMemo, useCallback, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatusBadge } from '@/components/disposition/StatusBadge';
import { PropertyTable } from '@/components/disposition/PropertyTable';
import { UnderwritingDefaults } from '@/components/disposition/UnderwritingDefaults';
import { PortfolioSummary } from '@/components/disposition/PortfolioSummary';
import { AddPropertyDialog } from '@/components/disposition/AddPropertyDialog';
import { LinkedDeal } from '@/components/disposition/LinkedDeal';
import {
  useDisposition,
  useDispositionProperties,
  useAvailableProperties,
  useDispositionMutations,
} from '@/hooks/useDispositions';
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
  Loader2,
  LayoutDashboard,
  Settings,
  Handshake,
} from 'lucide-react';
import { toast } from 'sonner';

export default function DispositionDetail() {
  const { id } = useParams<{ id: string }>();

  // Fetch data from database
  const { disposition: dbDisposition, loading: dispositionLoading, refetch: refetchDisposition } = useDisposition(id);
  const { properties: dbProperties, loading: propertiesLoading, refetch: refetchProperties } = useDispositionProperties(id);
  
  // Local state for editing
  const [disposition, setDisposition] = useState<Disposition | null>(null);
  const [properties, setProperties] = useState<DispositionProperty[]>([]);
  const [isAddPropertyOpen, setIsAddPropertyOpen] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Mutations
  const { 
    saving, 
    updateDisposition, 
    addPropertiesToDisposition, 
    removePropertyFromDisposition,
    updateDispositionProperty,
    applyDefaultsToAllProperties 
  } = useDispositionMutations();

  // Available properties for add dialog
  const existingPropertyIds = useMemo(() => properties.map(p => p.propertyId), [properties]);
  const { properties: availableProperties } = useAvailableProperties(existingPropertyIds);

  // Sync database data to local state
  useEffect(() => {
    if (dbDisposition) {
      setDisposition(dbDisposition);
    }
  }, [dbDisposition]);

  useEffect(() => {
    if (dbProperties) {
      setProperties(dbProperties);
    }
  }, [dbProperties]);

  // Calculate aggregates whenever properties change
  const aggregates = useMemo(() => {
    return calculateDispositionAggregates(properties);
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

  const handleApplyDefaultsToAll = useCallback(async () => {
    if (!disposition || !id) return;

    const result = await applyDefaultsToAllProperties(id);
    if (result.success) {
      // Recalculate all properties with defaults
      const updatedProperties = properties.map((dp) => {
        const newInputs = { ...dp.inputs, useDispositionDefaults: true };
        const newOutputs = calculatePropertyUnderwriting(dp.property, newInputs, disposition.defaults);
        return { ...dp, inputs: newInputs, outputs: newOutputs };
      });
      setProperties(updatedProperties);
      toast.success('Applied defaults to all properties');
    } else {
      toast.error(result.error || 'Failed to apply defaults');
    }
  }, [disposition, properties, id, applyDefaultsToAllProperties]);

  const handleRemoveProperty = useCallback(async (propertyId: string) => {
    const dp = properties.find(p => p.propertyId === propertyId);
    if (!dp) return;

    const result = await removePropertyFromDisposition(dp.id);
    if (result.success) {
      setProperties((prev) => prev.filter((p) => p.propertyId !== propertyId));
      toast.success('Property removed from disposition');
    } else {
      toast.error(result.error || 'Failed to remove property');
    }
  }, [properties, removePropertyFromDisposition]);

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
    async (propertyIds: string[]) => {
      if (!disposition || !id) return;

      const result = await addPropertiesToDisposition(id, propertyIds);
      if (result.success) {
        await refetchProperties();
        toast.success(`Added ${propertyIds.length} properties`);
      } else {
        toast.error(result.error || 'Failed to add properties');
      }
    },
    [disposition, id, addPropertiesToDisposition, refetchProperties]
  );

  const handleSave = async () => {
    if (!disposition || !id) return;

    // Save disposition level changes
    const result = await updateDisposition(id, {
      status: disposition.status,
      defaults: disposition.defaults,
      name: disposition.name,
      investmentThesis: disposition.investmentThesis,
      exitStrategyNotes: disposition.exitStrategyNotes,
      targetListDate: disposition.targetListDate,
      targetCloseDate: disposition.targetCloseDate,
    });

    if (!result.success) {
      toast.error(result.error || 'Failed to save disposition');
      return;
    }

    // Save property-level underwriting changes
    const propertyUpdatePromises = properties.map(async (dp) => {
      return updateDispositionProperty(dp.id, dp.inputs);
    });

    const propertyResults = await Promise.all(propertyUpdatePromises);
    const failedUpdates = propertyResults.filter(r => !r.success);

    if (failedUpdates.length > 0) {
      toast.warning(`Saved disposition but ${failedUpdates.length} property update(s) failed`);
    } else {
      setHasChanges(false);
      toast.success('Disposition saved successfully');
    }
  };

  const handleCreateDeal = () => {
    toast.info('Create Deal functionality would be implemented here');
  };

  // Loading state
  if (dispositionLoading || propertiesLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground">Loading disposition...</p>
        </div>
      </div>
    );
  }

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
      <header className="sticky top-0 z-10 h-20 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container h-full">
          <div className="flex h-full items-center justify-between">
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
                  {disposition.type} • {disposition.markets.join(', ') || 'No markets'}
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
                disabled={!hasChanges || isReadOnly || saving}
                className="gap-2"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container py-6">
        <Tabs defaultValue="portfolio" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="portfolio" className="gap-2">
              <LayoutDashboard className="h-4 w-4" />
              Portfolio
            </TabsTrigger>
            <TabsTrigger value="underwriting" className="gap-2">
              <Settings className="h-4 w-4" />
              Underwriting
            </TabsTrigger>
            <TabsTrigger value="details" className="gap-2">
              <FileText className="h-4 w-4" />
              Details
            </TabsTrigger>
            <TabsTrigger value="deals" className="gap-2">
              <Handshake className="h-4 w-4" />
              Deals
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Portfolio Summary & Properties */}
          <TabsContent value="portfolio" className="space-y-6">
            <PortfolioSummary aggregates={aggregates} />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Properties ({properties.length})
                </h3>
                {!isReadOnly && (
                  <Button
                    variant="outline"
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
          </TabsContent>

          {/* Tab 2: Underwriting Defaults */}
          <TabsContent value="underwriting" className="space-y-6">
            <UnderwritingDefaults
              defaults={disposition.defaults}
              onUpdate={handleDefaultsUpdate}
              onApplyToAll={handleApplyDefaultsToAll}
              readOnly={isReadOnly}
            />
          </TabsContent>

          {/* Tab 3: Dates, Investment Thesis & Strategy */}
          <TabsContent value="details" className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Key Dates
              </h3>
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
                      <span className="text-xs">Created</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(disposition.createdAt).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
                <Card className="border-border bg-card">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <User className="h-3 w-3" />
                      <span className="text-xs">Last Updated</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(disposition.updatedAt).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Card className="border-border bg-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    Investment Thesis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {disposition.investmentThesis || 'No investment thesis provided'}
                  </p>
                </CardContent>
              </Card>
              <Card className="border-border bg-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    Exit Strategy
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {disposition.exitStrategyNotes || 'No exit strategy notes provided'}
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tab 4: Deals */}
          <TabsContent value="deals" className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Deal Linkage
              </h3>
              <LinkedDeal deal={undefined} onCreateDeal={handleCreateDeal} />
            </div>
          </TabsContent>
        </Tabs>
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
