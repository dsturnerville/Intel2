import { useState, useCallback } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface PdfExportOptions {
  filename?: string;
  title?: string;
  subtitle?: string;
}

export function usePdfExport() {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePdf = useCallback(async (
    contentRef: HTMLElement | null,
    options: PdfExportOptions = {}
  ) => {
    if (!contentRef) {
      console.error('Content ref is not available');
      return false;
    }

    setIsGenerating(true);

    try {
      const { filename = 'summary.pdf', title, subtitle } = options;

      // Capture the content as canvas
      const canvas = await html2canvas(contentRef, {
        scale: 2, // Higher resolution
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        // Wait for images to load
        onclone: (clonedDoc) => {
          // Ensure all elements are visible in the clone
          const clonedContent = clonedDoc.body.querySelector('[data-pdf-content]');
          if (clonedContent) {
            (clonedContent as HTMLElement).style.display = 'block';
          }
        },
      });

      const imgData = canvas.toDataURL('image/png');
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;

      // Create PDF with appropriate dimensions
      // Use Letter size (8.5 x 11 inches = 612 x 792 points)
      const pdf = new jsPDF({
        orientation: imgWidth > imgHeight ? 'landscape' : 'portrait',
        unit: 'pt',
        format: 'letter',
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Header margin
      const headerHeight = title ? 60 : 20;
      const footerHeight = 30;
      const margin = 20;
      
      // Calculate available space for content
      const availableWidth = pageWidth - (margin * 2);
      const availableHeight = pageHeight - headerHeight - footerHeight;
      
      // Scale image to fit page
      const scaleX = availableWidth / imgWidth;
      const scaleY = availableHeight / imgHeight;
      const scale = Math.min(scaleX, scaleY);
      
      const scaledWidth = imgWidth * scale;
      const scaledHeight = imgHeight * scale;
      
      // Center the image horizontally
      const xPos = (pageWidth - scaledWidth) / 2;
      const yPos = headerHeight;

      // Add header
      if (title) {
        pdf.setFontSize(18);
        pdf.setFont('helvetica', 'bold');
        pdf.text(title, margin, 30);
        
        if (subtitle) {
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(128, 128, 128);
          pdf.text(subtitle, margin, 45);
          pdf.setTextColor(0, 0, 0);
        }
      }

      // Add content image
      pdf.addImage(imgData, 'PNG', xPos, yPos, scaledWidth, scaledHeight);

      // Add footer
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(128, 128, 128);
      const dateStr = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
      pdf.text(`Generated on ${dateStr}`, margin, pageHeight - 15);

      // Handle multi-page if content is too tall
      if (scaledHeight > availableHeight) {
        let remainingHeight = imgHeight;
        let currentY = 0;
        let pageNum = 1;

        while (remainingHeight > 0) {
          if (pageNum > 1) {
            pdf.addPage();
            // Add page content
            const sourceY = currentY;
            const sourceHeight = Math.min(
              (availableHeight / scale),
              remainingHeight
            );
            
            // Create a cropped version for this page
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = imgWidth;
            tempCanvas.height = sourceHeight;
            const ctx = tempCanvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(
                canvas,
                0, sourceY,
                imgWidth, sourceHeight,
                0, 0,
                imgWidth, sourceHeight
              );
              const pageImgData = tempCanvas.toDataURL('image/png');
              pdf.addImage(
                pageImgData, 
                'PNG', 
                xPos, 
                margin, 
                scaledWidth, 
                sourceHeight * scale
              );
            }
          }
          
          currentY += availableHeight / scale;
          remainingHeight -= availableHeight / scale;
          pageNum++;
        }
      }

      // Save the PDF
      pdf.save(filename);
      
      return true;
    } catch (error) {
      console.error('Error generating PDF:', error);
      return false;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return { generatePdf, isGenerating };
}
