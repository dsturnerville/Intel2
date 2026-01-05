import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Upload, FileSpreadsheet, Download, AlertCircle } from 'lucide-react';
import { useOpportunityMutations } from '@/hooks/useOpportunities';
import { OpportunityCSVRow } from '@/types/opportunity';
import { toast } from 'sonner';

interface OpportunityUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  acquisitionId: string;
}

const REQUIRED_COLUMNS = ['address1', 'city', 'state', 'zip_code'];
const OPTIONAL_COLUMNS = [
  'address2', 'msa', 'bedrooms', 'bathrooms', 'square_feet', 'year_built',
  'included', 'type', 'occupancy', 'current_rent', 'lease_start', 'lease_end',
  'annual_hoa', 'property_tax', 'rent_avm', 'sales_avm'
];

function parseCSV(text: string): OpportunityCSVRow[] {
  const lines = text.split('\n').filter(line => line.trim());
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/\s+/g, '_'));
  
  return lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim());
    const row: Record<string, string> = {};
    
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    
    return row as unknown as OpportunityCSVRow;
  });
}

export function OpportunityUploadDialog({ open, onOpenChange, acquisitionId }: OpportunityUploadDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<OpportunityCSVRow[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadOpportunities } = useOpportunityMutations();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setErrors([]);

    try {
      const text = await selectedFile.text();
      const rows = parseCSV(text);
      
      // Validate required columns
      if (rows.length > 0) {
        const firstRow = rows[0];
        const missingColumns = REQUIRED_COLUMNS.filter(col => !(col in firstRow) || !firstRow[col as keyof OpportunityCSVRow]);
        
        if (missingColumns.length > 0) {
          setErrors([`Missing required columns: ${missingColumns.join(', ')}`]);
          setPreview([]);
          return;
        }
      }
      
      setPreview(rows.slice(0, 5)); // Show first 5 rows as preview
    } catch (error) {
      setErrors(['Failed to parse file. Please ensure it is a valid CSV file.']);
      setPreview([]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    try {
      const text = await file.text();
      const rows = parseCSV(text);
      
      const result = await uploadOpportunities(acquisitionId, rows);
      
      if (result.success) {
        toast.success(`Successfully uploaded ${result.count} opportunities`);
        handleClose();
      } else {
        toast.error(result.error || 'Failed to upload opportunities');
      }
    } catch (error) {
      toast.error('Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setPreview([]);
    setErrors([]);
    onOpenChange(false);
  };

  const downloadTemplate = () => {
    const headers = [...REQUIRED_COLUMNS, ...OPTIONAL_COLUMNS].join(',');
    const sampleRow = '123 Main St,,Austin,TX,78701,Austin-Round Rock,3,2,1500,2010,true,SFR,Occupied,2000,2024-01-01,2025-01-01,500,3500,2100,350000';
    const csv = `${headers}\n${sampleRow}`;
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'opportunities_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Upload Opportunities</DialogTitle>
          <DialogDescription>
            Upload a CSV or Excel file containing property opportunities for this acquisition.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={downloadTemplate}>
              <Download className="h-4 w-4 mr-2" />
              Download Template
            </Button>
          </div>

          <div
            className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileSelect}
              className="hidden"
            />
            {file ? (
              <div className="flex items-center justify-center gap-2">
                <FileSpreadsheet className="h-8 w-8 text-primary" />
                <div className="text-left">
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                <p className="text-muted-foreground">
                  Click to upload or drag and drop
                </p>
                <p className="text-sm text-muted-foreground">
                  CSV or Excel files supported
                </p>
              </div>
            )}
          </div>

          {errors.length > 0 && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-4 w-4" />
                <span className="font-medium">Validation Errors</span>
              </div>
              <ul className="mt-2 text-sm text-destructive list-disc list-inside">
                {errors.map((error, i) => (
                  <li key={i}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          {preview.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Preview (first 5 rows)</p>
              <div className="overflow-x-auto border rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-3 py-2 text-left">Address</th>
                      <th className="px-3 py-2 text-left">City</th>
                      <th className="px-3 py-2 text-left">State</th>
                      <th className="px-3 py-2 text-left">Type</th>
                      <th className="px-3 py-2 text-right">Rent</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((row, i) => (
                      <tr key={i} className="border-t">
                        <td className="px-3 py-2">{row.address1}</td>
                        <td className="px-3 py-2">{row.city}</td>
                        <td className="px-3 py-2">{row.state}</td>
                        <td className="px-3 py-2">{row.type || '-'}</td>
                        <td className="px-3 py-2 text-right">
                          {row.current_rent ? `$${parseFloat(row.current_rent).toLocaleString()}` : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleUpload} 
            disabled={!file || errors.length > 0 || isUploading}
          >
            {isUploading ? 'Uploading...' : 'Upload'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
