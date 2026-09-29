import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatCurrency } from './currency';

export const generateReceipt = (booking: any) => {
  const doc = new jsPDF();
  const date = new Date().toLocaleDateString();
  const amount = booking.total_amount ?? booking.totalAmount ?? 0;
  const receiptId = String(booking.id || "booking").split('-')[0].toUpperCase();

  // --- Header ---
  doc.setFontSize(20);
  doc.setTextColor(40);
  doc.text("FAMOUS HAVEN", 14, 22);
  
  doc.setFontSize(10);
  doc.text("Hotel Management & Luxury Suites", 14, 28);
  doc.text(`Date: ${date}`, 160, 22);
  doc.text(`Receipt #: ${receiptId}`, 196, 28, { align: "right" });

  // --- Horizontal Line ---
  doc.setLineWidth(0.5);
  doc.line(14, 35, 196, 35);

  // --- Guest Info ---
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("GUEST INFORMATION", 14, 45);
  
  doc.setFont("helvetica", "normal");
  doc.text(`Name: ${booking.guests?.full_name || booking.guestName}`, 14, 52);
  doc.text(`Email: ${booking.guests?.email || 'N/A'}`, 14, 58);
  doc.text(`Phone: ${booking.guests?.phone || 'N/A'}`, 14, 64);

  // --- Booking Table ---
  autoTable(doc, {
    startY: 75,
    head: [['Description', 'Check-in', 'Check-out', 'Amount']],
    body: [[
      `Room ${booking.rooms?.room_number || booking.roomNumber} (${booking.rooms?.type || 'Standard'})`,
      booking.check_in || booking.checkIn,
      booking.check_out || booking.checkOut,
      formatCurrency(amount)
    ]],
    headStyles: { fillColor: [38, 50, 56] },
  });

  // --- Total & Status ---
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(`TOTAL PAID: ${formatCurrency(amount)}`, 196, finalY + 10, { align: "right" });

  // Add a "PAID" Stamp if applicable
  doc.setTextColor(34, 197, 94);
  doc.setFontSize(30);
  doc.text("PAID", 14, finalY + 15, { angle: 10 });

  // --- Footer ---
  doc.setTextColor(100);
  doc.setFontSize(10);
  doc.text("Thank you for choosing Famous Haven!", 105, 280, { align: "center" });

  // Save the PDF
  doc.save(`Receipt_${receiptId}.pdf`);
};
