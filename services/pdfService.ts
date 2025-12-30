import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { UserSettings } from './settingsService';

export interface ReceiptData {
    receiptNumber: string;
    date: string;
    clientName: string;
    clientEmail?: string;
    items: Array<{
        description: string;
        quantity: number;
        price: number;
        total: number;
    }>;
    taxAmount?: number;
    totalAmount: number;
    paymentMethod: string;
}

/**
 * PDF Service - Generates branded PDF documents
 */
export const generateReceiptPDF = async (receipt: ReceiptData, settings: UserSettings): Promise<Blob> => {
    const doc = new jsPDF() as any;
    const margin = 20;
    let currentY = 20;

    // 1. Header (Logo & Business Name)
    if (settings.logoUrl) {
        try {
            // Load image and convert to base64 for PDF embedding
            const img = await loadImage(settings.logoUrl);
            doc.addImage(img, 'PNG', margin, currentY, 30, 30);
            currentY += 35;
        } catch (e) {
            console.warn('[PDFService] Could not load logo for PDF:', e);
            // Fallback to text business name if logo fails
            doc.setFontSize(22);
            doc.setFont('helvetica', 'bold');
            doc.text(settings.businessName, margin, currentY);
            currentY += 15;
        }
    } else {
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text(settings.businessName, margin, currentY);
        currentY += 15;
    }

    // Business Info (under logo/name)
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100);
    if (settings.address) {
        doc.text(settings.address, margin, currentY);
        currentY += 5;
    }
    if (settings.taxId) {
        doc.text(`P.IVA/VAT: ${settings.taxId}`, margin, currentY);
        currentY += 5;
    }
    doc.text(settings.email || '', margin, currentY);
    currentY += 15;

    // 2. Receipt Title & Info
    doc.setTextColor(0);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('RICEVUTA DI PAGAMENTO', margin, currentY);
    currentY += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`N. Ricevuta: ${receipt.receiptNumber}`, margin, currentY);
    doc.text(`Data: ${receipt.date}`, 140, currentY);
    currentY += 15;

    // 3. Client Info
    doc.setFont('helvetica', 'bold');
    doc.text('CLIENTE:', margin, currentY);
    doc.setFont('helvetica', 'normal');
    doc.text(receipt.clientName, margin + 20, currentY);
    if (receipt.clientEmail) {
        currentY += 5;
        doc.text(receipt.clientEmail, margin + 20, currentY);
    }
    currentY += 15;

    // 4. Items Table
    const tableRows = receipt.items.map(item => [
        item.description,
        item.quantity.toString(),
        `${item.price.toFixed(2)} ${settings.currency}`,
        `${item.total.toFixed(2)} ${settings.currency}`
    ]);

    doc.autoTable({
        startY: currentY,
        head: [['Descrizione', 'Qtà', 'Prezzo', 'Totale']],
        body: tableRows,
        theme: 'striped',
        headStyles: { fillColor: [206, 147, 65] }, // Gold color
        margin: { left: margin, right: margin }
    });

    currentY = doc.lastAutoTable.finalY + 15;

    // 5. Totals
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(`METODO DI PAGAMENTO: ${receipt.paymentMethod}`, margin, currentY);

    const totalText = `TOTALE: ${receipt.totalAmount.toFixed(2)} ${settings.currency}`;
    const totalWidth = doc.getTextWidth(totalText);
    doc.text(totalText, 190 - totalWidth, currentY);

    // 6. Footer
    doc.setFontSize(8);
    doc.setTextColor(150);
    const footerText = `Grazie per aver scelto ${settings.businessName}. Powered by Luminel Elite.`;
    doc.text(footerText, 105, 280, { align: 'center' });

    return doc.output('blob');
};

/**
 * Utility to load image for PDF embedding
 */
const loadImage = (url: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = () => resolve(img);
        img.onerror = (e) => reject(e);
        img.src = url;
    });
};
