import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AcquisitionStatusBadge } from '@/components/acquisition/AcquisitionStatusBadge';
import { AcquisitionUnderwritingDefaults } from '@/components/acquisition/AcquisitionUnderwritingDefaults';
import { OpportunityUploadDialog } from '@/components/acquisition/OpportunityUploadDialog';
import { AddPropertyManualDialog } from '@/components/acquisition/AddPropertyManualDialog';
import { OpportunityTable } from '@/components/acquisition/OpportunityTable';
import { AcquisitionPropertyMap } from '@/components/acquisition/AcquisitionPropertyMap';
import {
  useAcquisition,
  useAcquisitionMutations,
} from '@/hooks/useAcquisitions';
import { useOpportunities, useOpportunityMutations, calculateOpportunityAggregates } from '@/hooks/useOpportunities';
import {
  Acquisition,
  AcquisitionDefaults,
  AcquisitionStatus,
  AcquisitionType,
} from '@/types/acquisition';
import { ArrowLeft, Upload, Save, Loader2, Building2, DollarSign, TrendingUp, Home, List, Map, MapPin, Plus } from 'lucide-react';
import { toast } from 'sonner';

const STATUSES: AcquisitionStatus[] = ['Draft', 'In Review', 'Approved', 'Under Contract', 'Closed', 'Archived'];
const TYPES: AcquisitionType[] = ['Single Property', 'Portfolio', 'Bulk Purchase'];

export default function AcquisitionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { acquisition, loading: acquisitionLoading, refetch: refetchAcquisition } = useAcquisition(id);
  const { data: opportunities = [], isLoading: opportunitiesLoading, refetch: refetchOpportunities } = useOpportunities(id);
  const { saving, updateAcquisition } = useAcquisitionMutations();
  const { geocodeAllProperties } = useOpportunityMutations();

  const [localAcquisition, setLocalAcquisition] = useState<Acquisition | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [addPropertyDialogOpen, setAddPropertyDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [isGeocoding, setIsGeocoding] = useState(false);

  // Sync fetched data to local state
  useEffect(() => {
    if (acquisition) {
      setLocalAcquisition(acquisition);
    }
  }, [acquisition]);

  const aggregates = useMemo(() => {
    return calculateOpportunityAggregates(opportunities);
  }, [opportunities]);

  const handleStatusChange = (status: AcquisitionStatus) => {
    if (localAcquisition) {
      setLocalAcquisition({ ...localAcquisition, status });
      setHasChanges(true);
    }
  };

  const handleDefaultsUpdate = (defaults: AcquisitionDefaults) => {
    if (localAcquisition) {
      setLocalAcquisition({ ...localAcquisition, defaults });
      setHasChanges(true);
    }
  };

  const handleApplyToAll = () => {
    if (!localAcquisition) return;
    // TODO: Apply defaults to all opportunities
    toast.success('Defaults applied to all opportunities');
  };

  const handleGeocodeAll = async () => {
    if (!id) return;
    
    setIsGeocoding(true);
    try {
      const result = await geocodeAllProperties(id);
      
      if (result.success) {
        if (result.geocoded === 0 && result.total === 0) {
          toast.info('All properties already have coordinates');
        } else {
          toast.success(`Geocoded ${result.geocoded} of ${result.total} properties`);
          refetchOpportunities();
        }
      } else {
        toast.error(result.error || 'Failed to geocode properties');
      }
    } catch (error) {
      toast.error('Failed to geocode properties');
    } finally {
      setIsGeocoding(false);
    }
  };

  // Count properties missing coordinates
  const propertiesMissingCoords = opportunities.filter(
    o => o.latitude === undefined || o.latitude === null
  ).length;

  const handleSave = async () => {
    if (!localAcquisition || !id) return;

    const result = await updateAcquisition(id, localAcquisition);
    if (result.success) {
      setHasChanges(false);
      refetchAcquisition();
      toast.success('Acquisition saved');
    } else {
      toast.error(result.error || 'Failed to save');
    }
  };

  if (acquisitionLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!localAcquisition) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">Acquisition not found.</p>
        <Button variant="outline" onClick={() => navigate('/acquisitions')}>
          Back to Acquisitions
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 md:top-0 z-10 h-16 md:h-20 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="h-full px-4 md:px-6">
          <div className="flex h-full items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate('/acquisitions')}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-xl md:text-2xl font-semibold tracking-tight">{localAcquisition.name}</h1>
                  <AcquisitionStatusBadge status={localAcquisition.status} />
                </div>
                <p className="text-xs md:text-sm text-muted-foreground mt-0.5 md:mt-1">
                  {localAcquisition.type} • {localAcquisition.markets.join(', ') || 'No markets'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Select value={localAcquisition.status} onValueChange={handleStatusChange}>
                <SelectTrigger className="w-[140px] md:w-[160px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={handleSave} disabled={saving || !hasChanges} size="sm">
                {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                <span className="hidden sm:inline">Save</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="px-4 md:px-6 py-4 md:py-6 space-y-4 md:space-y-6">
        {/* Tabs */}
        <Tabs defaultValue="summary" className="space-y-4 md:space-y-6">
          <TabsList>
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="assumptions">Assumptions</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="space-y-6">
            {/* Portfolio Summary */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
                  <Home className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{aggregates.includedCount}</div>
                  <p className="text-xs text-muted-foreground">
                    {aggregates.excludedCount} excluded
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Offer Price</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${aggregates.totalOfferPrice.toLocaleString()}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Projected NOI</CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${aggregates.totalProjectedNOI.toLocaleString()}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Cap Rate</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {(aggregates.avgProjectedCapRate * 100).toFixed(2)}%
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Opportunities */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Properties ({aggregates.includedCount})</CardTitle>
                <div className="flex items-center gap-2">
                  {propertiesMissingCoords > 0 && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={handleGeocodeAll}
                      disabled={isGeocoding}
                    >
                      {isGeocoding ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <MapPin className="h-4 w-4 mr-2" />
                      )}
                      Geocode All ({propertiesMissingCoords})
                    </Button>
                  )}
                  <Button size="sm" variant="outline" onClick={() => setAddPropertyDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Property
                  </Button>
                  <Button size="sm" onClick={() => setUploadDialogOpen(true)}>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Properties
                  </Button>
                  <div className="flex border border-border rounded-md">
                    <Button
                      variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                      className="rounded-r-none border-r border-border"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'map' ? 'secondary' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('map')}
                      className="rounded-l-none"
                    >
                      <Map className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {viewMode === 'list' ? (
                  <OpportunityTable
                    opportunities={opportunities}
                    isLoading={opportunitiesLoading}
                  />
                ) : (
                  <AcquisitionPropertyMap opportunities={opportunities} />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="assumptions" className="space-y-6">
            <AcquisitionUnderwritingDefaults
              defaults={localAcquisition.defaults}
              onUpdate={handleDefaultsUpdate}
              onApplyToAll={handleApplyToAll}
            />
          </TabsContent>

          <TabsContent value="details" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Acquisition Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Acquisition Name</Label>
                    <Input
                      value={localAcquisition.name}
                      onChange={(e) => {
                        setLocalAcquisition({ ...localAcquisition, name: e.target.value });
                        setHasChanges(true);
                      }}
                      placeholder="Enter acquisition name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Acquisition Type</Label>
                    <Select 
                      value={localAcquisition.type} 
                      onValueChange={(value: AcquisitionType) => {
                        setLocalAcquisition({ ...localAcquisition, type: value });
                        setHasChanges(true);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Target Close Date</Label>
                    <Input
                      type="date"
                      value={localAcquisition.targetCloseDate || ''}
                      onChange={(e) => {
                        setLocalAcquisition({ ...localAcquisition, targetCloseDate: e.target.value });
                        setHasChanges(true);
                      }}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Investment Thesis</Label>
                  <Textarea
                    placeholder="Describe the investment thesis..."
                    value={localAcquisition.investmentThesis || ''}
                    onChange={(e) => {
                      setLocalAcquisition({ ...localAcquisition, investmentThesis: e.target.value });
                      setHasChanges(true);
                    }}
                    rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Strategy Notes</Label>
                  <Textarea
                    placeholder="Additional notes..."
                    value={localAcquisition.strategyNotes || ''}
                    onChange={(e) => {
                      setLocalAcquisition({ ...localAcquisition, strategyNotes: e.target.value });
                      setHasChanges(true);
                    }}
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {id && (
          <>
            <OpportunityUploadDialog
              open={uploadDialogOpen}
              onOpenChange={setUploadDialogOpen}
              acquisitionId={id}
            />
            <AddPropertyManualDialog
              open={addPropertyDialogOpen}
              onOpenChange={setAddPropertyDialogOpen}
              acquisitionId={id}
              onSuccess={() => refetchOpportunities()}
            />
          </>
        )}
      </main>
    </div>
  );
}
