import jsPDF from 'jspdf';
import { Story } from '../hooks/useStoryGenerator';

export class PDFService {
  async generateStoryPDF(story: Story): Promise<void> {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);
    
    let yPosition = margin;
    
    // Add title
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    const title = this.truncateText(story.prompt, contentWidth, pdf);
    pdf.text(title, margin, yPosition);
    yPosition += 15;
    
    // Add date
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    const dateStr = story.timestamp.toLocaleDateString();
    pdf.text(`Generado el: ${dateStr}`, margin, yPosition);
    yPosition += 20;
    
    // Process each page
    for (let i = 0; i < story.pages.length; i++) {
      const page = story.pages[i];
      
      // Check if we need a new page
      if (yPosition > pageHeight - 100) {
        pdf.addPage();
        yPosition = margin;
      }
      
      // Add page number
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`Página ${i + 1}`, margin, yPosition);
      yPosition += 15;
      
      // Add paragraph text
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'normal');
      const lines = pdf.splitTextToSize(page.paragraph, contentWidth);
      pdf.text(lines, margin, yPosition);
      yPosition += (lines.length * 6) + 10;
      
      // Add image if available
      if (page.imageUrl) {
        try {
          // Check if we need a new page for the image
          if (yPosition > pageHeight - 150) {
            pdf.addPage();
            yPosition = margin;
          }
          
          // Load and add image
          const img = new Image();
          img.crossOrigin = 'anonymous';
          
          await new Promise<void>((resolve, reject) => {
            img.onload = () => {
              try {
                // Calculate image dimensions to fit within content width
                const maxImageWidth = contentWidth;
                const maxImageHeight = 120;
                
                let imgWidth = img.width;
                let imgHeight = img.height;
                
                // Scale image to fit
                if (imgWidth > maxImageWidth) {
                  const ratio = maxImageWidth / imgWidth;
                  imgWidth = maxImageWidth;
                  imgHeight = imgHeight * ratio;
                }
                
                if (imgHeight > maxImageHeight) {
                  const ratio = maxImageHeight / imgHeight;
                  imgHeight = maxImageHeight;
                  imgWidth = imgWidth * ratio;
                }
                
                // Center the image
                const xPosition = margin + (contentWidth - imgWidth) / 2;
                
                pdf.addImage(img, 'JPEG', xPosition, yPosition, imgWidth, imgHeight);
                yPosition += imgHeight + 15;
                resolve();
              } catch (error) {
                console.error('Error adding image to PDF:', error);
                resolve(); // Continue without image
              }
            };
            
            img.onerror = () => {
              console.error('Error loading image for PDF:', page.imageUrl);
              resolve(); // Continue without image
            };
            
            img.src = page.imageUrl!;
          });
        } catch (error) {
          console.error('Error processing image for PDF:', error);
          // Continue without image
        }
      }
      
      // Add some space between pages
      yPosition += 10;
    }
    
    // Generate filename
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `historia_${timestamp}.pdf`;
    
    // Save the PDF
    pdf.save(filename);
  }
  
  private truncateText(text: string, maxWidth: number, pdf: jsPDF): string {
    const words = text.split(' ');
    let line = '';
    let result = '';
    
    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i] + ' ';
      const testWidth = pdf.getTextWidth(testLine);
      
      if (testWidth > maxWidth && i > 0) {
        result = line;
        break;
      } else {
        line = testLine;
        result = line;
      }
    }
    
    return result.trim();
  }
}

export const pdfService = new PDFService();
