import jsPDF from 'jspdf';
import { format } from 'date-fns';

export const generateInvoice = (booking, type = 'a4', businessDetails = {}) => {
    const doc = new jsPDF({
        orientation: type === 'thermal' ? 'p' : 'p',
        unit: 'mm',
        format: type === 'thermal' ? [80, 200] : type
    });

    const { turfName, address, phone } = businessDetails;
    const { customerName, customerMobile, date, slots, totalAmount, paidAmount, space } = booking;
    const spaceName = space?.name || booking.spaceName || 'Turf Space';
    const invoiceDate = format(new Date(), 'dd MMM yyyy');
    const invoiceTime = format(new Date(), 'hh:mm a');

    // --- THERMAL 80MM LAYOUT ---
    if (type === 'thermal') {
        let y = 10;
        const centerX = 40; // 80mm / 2

        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text(turfName || "Turf Invoice", centerX, y, { align: "center" });
        y += 6;

        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        if (address) {
            doc.text(address, centerX, y, { align: "center" });
            y += 5;
        }
        if (phone) {
            doc.text(`Ph: ${phone}`, centerX, y, { align: "center" });
            y += 6;
        }

        doc.text("------------------------------------------------", centerX, y, { align: "center" });
        y += 5;

        doc.setFontSize(9);
        doc.text(`Date: ${invoiceDate} ${invoiceTime}`, 5, y);
        y += 5;
        doc.text(`Customer: ${customerName}`, 5, y);
        y += 5;
        doc.text(`Mobile: ${customerMobile}`, 5, y);
        y += 7;

        doc.setFont("helvetica", "bold");
        doc.text("Description", 5, y);
        doc.text("Amount", 75, y, { align: "right" });
        y += 5;
        doc.setFont("helvetica", "normal");
        doc.text("------------------------------------------------", centerX, y, { align: "center" });
        y += 5;

        // Item Details
        doc.text(`${spaceName} (${date})`, 5, y);
        y += 5;
        // Split slots if too many
        const slotsStr = slots.join(', ');
        const splitSlots = doc.splitTextToSize(slotsStr, 70);
        doc.text(splitSlots, 5, y);
        y += (splitSlots.length * 4);

        doc.setFont("helvetica", "bold");
        doc.text(`${totalAmount.toFixed(2)}`, 75, y - (splitSlots.length * 4), { align: "right" }); // Align amount with start of item

        y += 5;
        doc.text("------------------------------------------------", centerX, y, { align: "center" });
        y += 5;

        // Totals
        doc.text("Total:", 40, y, { align: "right" });
        doc.text(`${totalAmount.toFixed(2)}`, 75, y, { align: "right" });
        y += 5;
        if (paidAmount !== undefined) {
            doc.text("Paid:", 40, y, { align: "right" });
            doc.text(`${paidAmount.toFixed(2)}`, 75, y, { align: "right" });
            y += 5;
            doc.text("Balance:", 40, y, { align: "right" });
            doc.text(`${(totalAmount - paidAmount).toFixed(2)}`, 75, y, { align: "right" });
            y += 8;
        }

        doc.setFontSize(8);
        doc.setFont("helvetica", "italic");
        doc.text("Thank you for booking!", centerX, y, { align: "center" });
    }

    // --- A4 / A5 LAYOUT ---
    else {
        const width = doc.internal.pageSize.getWidth();
        const centerX = width / 2;
        let y = 20;

        // Header
        doc.setFillColor(245, 247, 250); // Light gray background for header
        doc.rect(0, 0, width, 40, 'F');

        doc.setFontSize(24);
        doc.setTextColor(40, 40, 40);
        doc.setFont("helvetica", "bold");
        doc.text(turfName || "INVOICE", 20, 25);

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100, 100, 100);
        if (address) doc.text(address, width - 20, 15, { align: "right" });
        if (phone) doc.text(`Phone: ${phone}`, width - 20, 20, { align: "right" });
        doc.text(`Date: ${invoiceDate}`, width - 20, 25, { align: "right" });

        y = 55;

        // Bill To
        doc.setFontSize(12);
        doc.setTextColor(150, 150, 150);
        doc.text("BILL TO", 20, y);
        y += 8;
        doc.setFontSize(14);
        doc.setTextColor(40, 40, 40);
        doc.setFont("helvetica", "bold");
        doc.text(customerName, 20, y);
        y += 6;
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(80, 80, 80);
        doc.text(customerMobile, 20, y);
        if (booking.customerEmail) {
            y += 5;
            doc.text(booking.customerEmail, 20, y);
        }

        y += 15;

        // Table Header
        doc.setFillColor(240, 240, 240);
        doc.rect(20, y, width - 40, 10, 'F');
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(60, 60, 60);
        doc.text("DESCRIPTION", 25, y + 7);
        doc.text("SLOTS", 90, y + 7);
        doc.text("AMOUNT", width - 25, y + 7, { align: "right" });
        y += 12;

        // Item
        doc.setFont("helvetica", "normal");
        doc.setTextColor(40, 40, 40);

        doc.text(`${spaceName} | ${date}`, 25, y + 5);

        const slotsStr = slots.join(', ');
        const splitSlots = doc.splitTextToSize(slotsStr, 60); // Wrap slots
        doc.text(splitSlots, 90, y + 5);

        doc.setFont("helvetica", "bold");
        doc.text(Number(totalAmount).toFixed(2), width - 25, y + 5, { align: "right" });

        // Draw line below item
        y += Math.max(15, splitSlots.length * 5 + 5);
        doc.setDrawColor(230, 230, 230);
        doc.line(20, y, width - 20, y);
        y += 10;

        // Totals Section using coordinates relative to width
        const rightColX = width - 60;

        doc.setFont("helvetica", "normal");
        doc.text("Total Amount:", rightColX, y);
        doc.setFont("helvetica", "bold");
        doc.text(Number(totalAmount).toFixed(2), width - 25, y, { align: "right" });
        y += 8;

        if (paidAmount !== undefined) {
            doc.setFont("helvetica", "normal");
            doc.text("Paid Amount:", rightColX, y);
            doc.setFont("helvetica", "bold");
            doc.text(Number(paidAmount).toFixed(2), width - 25, y, { align: "right" });
            y += 8;

            doc.setFont("helvetica", "normal");
            doc.text("Balance Due:", rightColX, y);
            doc.setFillColor(255, 240, 240); // Highlight background for due?
            doc.setTextColor(200, 50, 50); // Red color for balance
            doc.setFont("helvetica", "bold");
            doc.text(Number(totalAmount - paidAmount).toFixed(2), width - 25, y, { align: "right" });
            doc.setTextColor(40, 40, 40); // Reset
            y += 20;
        }

        // Footer
        const footerY = doc.internal.pageSize.getHeight() - 30;
        doc.setFontSize(10);
        doc.setTextColor(150, 150, 150);
        doc.setFont("helvetica", "normal");
        doc.text("Thank you for your business!", 20, footerY);
        doc.text("Terms & Conditions Apply", 20, footerY + 5);

        doc.text("Authorized Signatory", width - 20, footerY + 15, { align: "right" });

    }

    doc.save(`Invoice_${customerName.replace(/\s+/g, '_')}_${format(new Date(), 'yyyyMMdd')}.pdf`);
};
