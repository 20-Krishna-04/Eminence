const PDFDocument = require('pdfkit');
const { Booking, Customer } = require('../models');

const generateInvoice = async (req, res) => {
  try {
    const { bookingId } = req.params;
    
    const booking = await Booking.findByPk(bookingId, {
      include: [{ model: Customer, as: 'customer' }]
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Authorization check: must be the booking owner, assigned driver, or admin
    if (req.user) {
      const isOwner = req.user.id === booking.customerId;
      const isDriver = req.user.id === booking.driverId;
      const isAdmin = req.user.role === 'admin';
      if (!isOwner && !isDriver && !isAdmin) {
        return res.status(403).json({ success: false, message: 'Forbidden: You are not authorized to view this invoice' });
      }
    }

    const customerName = booking.customer?.name || 'Valued Customer';
    const amount = parseFloat(booking.estimatedFare) || 0;
    const bookingDate = booking.date || new Date(booking.createdAt).toLocaleDateString();

    const doc = new PDFDocument({ margin: 50 });
    
    // Set response headers
    res.setHeader('Content-disposition', `attachment; filename=invoice_${booking.id}.pdf`);
    res.setHeader('Content-type', 'application/pdf');

    doc.pipe(res);

    // Header
    doc
      .fillColor('#444444')
      .fontSize(20)
      .text('EMINENCE TRANSPORTS', 50, 57)
      .fontSize(10)
      .text('123 Main Street', 200, 50, { align: 'right' })
      .text('Pune, MH 411001', 200, 65, { align: 'right' })
      .text('Phone: 1800-123-4567', 200, 80, { align: 'right' })
      .moveDown();

    // Line
    doc.moveTo(50, 110).lineTo(550, 110).stroke();

    // Invoice details
    doc
      .fontSize(14)
      .text('INVOICE', 50, 130)
      .fontSize(10)
      .text(`Invoice Number: INV-${booking.id}`, 50, 150)
      .text(`Invoice Date: ${bookingDate}`, 50, 165)
      .text(`Payment Status: ${(booking.paymentStatus || 'pending').toUpperCase()}`, 50, 180)
      .moveDown();

    // Customer details
    doc
      .text(`Billed To:`, 300, 150)
      .font('Helvetica-Bold')
      .text(customerName, 300, 165)
      .font('Helvetica')
      .text('Pune, Maharashtra', 300, 180);

    // Table header
    doc.moveTo(50, 220).lineTo(550, 220).stroke();
    doc
      .font('Helvetica-Bold')
      .text('Description', 50, 230)
      .text('Amount', 450, 230, { width: 100, align: 'right' });
    doc.moveTo(50, 250).lineTo(550, 250).stroke();

    // Table row
    doc
      .font('Helvetica')
      .text(`Transport Services (Pickup: ${booking.pickupAddress || 'N/A'} - Drop: ${booking.dropAddress || 'N/A'})`, 50, 270, { width: 350 })
      .text(`₹${amount.toFixed(2)}`, 450, 270, { width: 100, align: 'right' });

    // Total
    doc.moveTo(50, 320).lineTo(550, 320).stroke();
    doc
      .font('Helvetica-Bold')
      .text('Total:', 350, 340)
      .text(`₹${amount.toFixed(2)}`, 450, 340, { width: 100, align: 'right' });

    // Footer
    doc
      .font('Helvetica')
      .fontSize(10)
      .text('Payment is due within 15 days. Thank you for your business.', 50, 700, { align: 'center', width: 500 });

    doc.end();

    return;
  } catch (error) {
    console.error('Error generating invoice:', error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
};

module.exports = {
  generateInvoice
};
