import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import type { Transaction } from '../types';

/**
 * LUMINA EMPIRE - PDF Receipt Generator
 * Generates an "Elite" branded receipt for transactions.
 */
export const generateReceiptPDF = (transaction: Transaction, userName: string = 'Founder') => {
    const doc = new jsPDF() as any;

    // --- BRANDING COLORS ---
    const GOLD = [180, 150, 80]; // Amber-ish
    const DARK = [40, 40, 40];

    // --- HEADER ---
    doc.setFillColor(...DARK);
    doc.rect(0, 0, 210, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('times', 'bold');
    doc.text('LUMINEL EMPIRE', 105, 20, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Digital Wellness Architecture for Elite Professionals', 105, 28, { align: 'center' });

    // --- RECEIPT INFO ---
    doc.setTextColor(...DARK);
    doc.setFontSize(18);
    doc.setFont('times', 'bold');
    doc.text('RICEVUTA DI PAGAMENTO', 20, 60);

    doc.setDrawColor(...GOLD);
    doc.setLineWidth(0.5);
    doc.line(20, 65, 80, 65);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(`ID TRANSAZIONE:`, 20, 75);
    doc.setFont('helvetica', 'normal');
    doc.text(transaction.id.toUpperCase(), 60, 75);

    doc.setFont('helvetica', 'bold');
    doc.text(`DATA:`, 20, 82);
    doc.setFont('helvetica', 'normal');
    doc.text(new Date(transaction.date).toLocaleDateString('it-IT'), 60, 82);

    // --- CUSTOMER / SELLER ---
    doc.setFont('helvetica', 'bold');
    doc.text('CLIENTE:', 20, 100);
    doc.setFont('helvetica', 'normal');
    doc.text(userName, 20, 106);

    doc.setFont('helvetica', 'bold');
    doc.text('EMESSO DA:', 130, 100);
    doc.setFont('helvetica', 'normal');
    doc.text('VirtualBNB / Luminel', 130, 106);
    doc.text('info@virtualbnb.it', 130, 111);

    // --- TABLE ---
    const tableData = [
        [
            transaction.description,
            transaction.category,
            `€ ${transaction.amount.toFixed(2)}`
        ]
    ];

    doc.autoTable({
        startY: 125,
        head: [['Descrizione', 'Categoria', 'Importo']],
        body: tableData,
        headStyles: {
            fillColor: DARK,
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            halign: 'center'
        },
        styles: {
            font: 'helvetica',
            fontSize: 10,
            cellPadding: 6
        },
        columnStyles: {
            2: { halign: 'right', fontStyle: 'bold' }
        }
    });

    // --- TOTAL ---
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(14);
    doc.setFont('times', 'bold');
    doc.text('TOTALE:', 140, finalY);
    doc.text(`€ ${transaction.amount.toFixed(2)}`, 190, finalY, { align: 'right' });

    // --- FOOTER ---
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('Grazie per aver scelto l\'eccellenza gestionale di Luminel.', 105, 280, { align: 'center' });
    doc.text('Questa è una ricevuta generata elettronicamente.', 105, 285, { align: 'center' });

    // --- SAVE ---
    doc.save(`Ricevuta_Luminel_${transaction.id.substring(0, 8)}.pdf`);
};
