// src/utils/generateReceipt.js
// Builds a device drop-off / job receipt PDF for a repair ticket, client-side (no backend).
import jsPDF from 'jspdf';

function formatDate(ts) {
  const d = ts?.toDate ? ts.toDate() : ts ? new Date(ts) : new Date();
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

/** Build a jsPDF document for a repair ticket receipt. Caller decides how to output it. */
export function buildTicketReceipt(ticket, storeSettings = {}) {
  const doc = new jsPDF({ unit: 'pt', format: 'a5' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 36;
  let y = 48;

  // Renders wrapped, centered text and advances y by however many lines it actually took.
  const centered = (text, size = 11, style = 'normal', lineHeight = 12) => {
    doc.setFontSize(size);
    doc.setFont('helvetica', style);
    const lines = doc.splitTextToSize(text, pageWidth - margin * 2);
    doc.text(lines, pageWidth / 2, y, { align: 'center' });
    y += lines.length * lineHeight;
  };

  centered(storeSettings.shopName || 'Repair Shop', 17, 'bold', 20);
  y += 4;
  if (storeSettings.address) centered(storeSettings.address, 9, 'normal', 12);
  centered(`Phone: ${storeSettings.phone || storeSettings.contactWhatsApp || '—'}`, 9);
  y += 12;

  doc.setLineWidth(1);
  doc.line(margin, y, pageWidth - margin, y);
  y += 26;

  centered('Device Receiving Receipt', 13, 'bold');
  y += 28;

  const valueColumnX     = margin + 110;
  const valueColumnWidth = pageWidth - margin - valueColumnX;

  const row = (label, value) => {
    doc.setFontSize(10.5);
    doc.setFont('helvetica', 'bold');
    doc.text(`${label}:`, margin, y);
    doc.setFont('helvetica', 'normal');
    const lines = doc.splitTextToSize(String(value ?? '—'), valueColumnWidth);
    doc.text(lines, valueColumnX, y);
    y += Math.max(lines.length, 1) * 16 + 4;
  };

  row('Ticket ID',      ticket.ticketId);
  row('Date Received',  formatDate(ticket.createdAt));
  row('Customer Name',  ticket.customerName);
  row('Phone Number',   ticket.customerPhone);
  row('Device Model',   ticket.deviceModel);
  row('Issue',          ticket.issue);
  row('Cost Estimate',  ticket.costEstimate ? `Rs. ${Number(ticket.costEstimate).toLocaleString('en-IN')}` : 'To be confirmed after diagnosis');
  row('Status',         ticket.status);
  if (storeSettings.warrantyDays) row('Warranty', `${storeSettings.warrantyDays} days on repair work`);

  y += 10;
  doc.line(margin, y, pageWidth - margin, y);
  y += 22;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'italic');
  doc.text(
    'Please retain this receipt and present your Ticket ID to collect your device.',
    pageWidth / 2, y, { align: 'center', maxWidth: pageWidth - margin * 2 }
  );

  return doc;
}

export function receiptFileName(ticket) {
  return `${ticket.ticketId}-receipt.pdf`;
}
