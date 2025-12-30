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
    let currentY = 15;

    // --- EMPIRE THEME COLORS ---
    const DARK = [40, 40, 40];
    const GOLD = [180, 150, 80];

    // 1. Dark Header Block (Luxury Feel)
    doc.setFillColor(...DARK);
    doc.rect(0, 0, 210, 45, 'F');

    // Logo / Business Name in white on dark
    if (settings.logoUrl) {
        try {
            const img = await loadImage(settings.logoUrl);
            doc.addImage(img, 'PNG', margin, 10, 25, 25);
        } catch (e) {
            console.warn('[PDFService] Logo fail, fallback to text');
        }
    }

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('times', 'bold');
    doc.text(settings.businessName.toUpperCase(), 190, 25, { align: 'right' });

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const tagline = settings.businessName === 'Luminel' ? 'PROVVEDERE ALL\'ECCELLENZA' : 'LUMINEL EMPIRE ECOSYSTEM';
    doc.text(tagline, 190, 32, { align: 'right' });

    currentY = 60;

    // 2. Receipt Header Info
    doc.setTextColor(...DARK);
    doc.setDrawColor(...GOLD);
    doc.setLineWidth(0.8);
    doc.line(margin, currentY, 60, currentY);

    currentY += 10;
    doc.setFontSize(18);
    doc.setFont('times', 'bold');
    doc.text('DOCUMENTO DI VENDITA', margin, currentY);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(`N. DOCUMENTO:`, 140, currentY - 5);
    doc.setFont('helvetica', 'normal');
    doc.text(receipt.receiptNumber, 190, currentY - 5, { align: 'right' });

    doc.setFont('helvetica', 'bold');
    doc.text(`DATA EMISSIONE:`, 140, currentY);
    doc.setFont('helvetica', 'normal');
    doc.text(new Date(receipt.date).toLocaleDateString('it-IT'), 190, currentY, { align: 'right' });

    currentY += 25;

    // 3. Addresses Section
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text('EMESSO DA:', margin, currentY);
    doc.text('FATTURATO A:', 120, currentY);

    currentY += 5;
    doc.setFontSize(10);
    doc.setTextColor(...DARK);
    doc.text(settings.businessName, margin, currentY);
    doc.text(receipt.clientName, 120, currentY);

    currentY += 5;
    doc.setFontSize(9);
    doc.setTextColor(80);
    doc.text(settings.address || '', margin, currentY, { maxWidth: 80 });
    doc.text('Cliente Privato', 120, currentY);

    if (settings.taxId) {
        currentY += 10;
        doc.text(`P.IVA/VAT: ${settings.taxId}`, margin, currentY);
    }

    currentY += 20;

    // 4. Items Table
    const tableRows = receipt.items.map(item => [
        item.description,
        item.quantity.toString(),
        `€ ${item.price.toFixed(2)}`,
        `€ ${item.total.toFixed(2)}`
    ]);

    doc.autoTable({
        startY: currentY,
        head: [['DESCRIZIONE', 'QTÀ', 'PREZZO UN.', 'TOTALE']],
        body: tableRows,
        theme: 'plain',
        headStyles: {
            fillColor: DARK,
            textColor: 255,
            fontStyle: 'bold',
            fontSize: 9,
            cellPadding: 4
        },
        bodyStyles: {
            fontSize: 9,
            cellPadding: 5
        },
        columnStyles: {
            2: { halign: 'right' },
            3: { halign: 'right', fontStyle: 'bold' }
        },
        margin: { left: margin, right: margin }
    });

    currentY = doc.lastAutoTable.finalY + 15;

    // 5. Totals Area
    doc.setDrawColor(230);
    doc.line(130, currentY - 5, 190, currentY - 5);

    doc.setFont('helvetica', 'normal');
    doc.text('SUBTOTALE:', 140, currentY);
    doc.text(`€ ${(receipt.totalAmount / 1.22).toFixed(2)}`, 190, currentY, { align: 'right' });

    currentY += 6;
    doc.text('IVA (22%):', 140, currentY);
    doc.text(`€ ${(receipt.totalAmount - (receipt.totalAmount / 1.22)).toFixed(2)}`, 190, currentY, { align: 'right' });

    currentY += 10;
    doc.setFontSize(14);
    doc.setFont('times', 'bold');
    doc.setTextColor(...DARK);
    doc.text('TOTALE:', 140, currentY);
    doc.text(`€ ${receipt.totalAmount.toFixed(2)}`, 190, currentY, { align: 'right' });

    // 6. Footer (Branded)
    doc.setFontSize(8);
    doc.setTextColor(150);
    const footerText = `Questo documento è stato generato tramite Luminel Empire - Il sistema di comando per i professionisti del benessere.`;
    doc.text(footerText, 105, 280, { align: 'center' });
    doc.text(`Metodo di pagamento: ${receipt.paymentMethod}`, 105, 285, { align: 'center' });

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
