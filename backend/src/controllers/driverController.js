const { Driver } = require('../models');

// Get all drivers
const getAllDrivers = async (_req, res) => {
  try {
    const drivers = await Driver.findAll();
    res.status(200).json({ success: true, drivers });
  } catch (error) {
    console.error('Error fetching drivers:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Create a driver
const createDriver = async (req, res) => {
  try {
    const driver = await Driver.create(req.body);
    res.status(201).json({ success: true, driver });
  } catch (error) {
    console.error('Error creating driver:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const toggleAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const driver = await Driver.findByPk(id);
    
    if (!driver) {
      return res.status(404).json({ success: false, message: 'Driver not found' });
    }

    if (driver.status === 'on_trip') {
      return res.status(400).json({ success: false, message: 'Cannot change availability while on a trip' });
    }

    // Toggle between active and inactive
    driver.status = driver.status === 'active' ? 'inactive' : 'active';
    await driver.save();

    res.status(200).json({ success: true, status: driver.status, driver });
  } catch (error) {
    console.error('Error toggling availability:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const PDFDocument = require('pdfkit');

const generatePayslip = async (req, res) => {
  try {
    const { id } = req.params;
    let driver = await Driver.findByPk(id);
    
    if (!driver) {
      // In development or demo mode, fallback to first available driver or mock
      driver = await Driver.findOne();
    }

    if (!driver) {
      return res.status(404).json({ success: false, message: 'Driver not found' });
    }

    // Mock Aggregation
    const weeklyEarnings = 15000;
    const platformFee = weeklyEarnings * 0.15;
    const tdsTax = weeklyEarnings * 0.01;
    const netPayout = weeklyEarnings - platformFee - tdsTax;

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const payslipData = {
      driverId: String(id),
      driverName: driver.name || 'Ramesh Kumar',
      weekEnding: new Date().toISOString().split('T')[0],
      grossEarnings: weeklyEarnings,
      platformFee: parseFloat(platformFee.toFixed(2)),
      tdsTax: parseFloat(tdsTax.toFixed(2)),
      netPayout: parseFloat(netPayout.toFixed(2)),
      pdfUrl: `${baseUrl}/api/drivers/${id}/payslip/download`
    };

    res.status(200).json({ success: true, payslip: payslipData });
  } catch (error) {
    console.error('Error generating payslip:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const downloadPayslip = async (req, res) => {
  try {
    const { id } = req.params;
    let driver = await Driver.findByPk(id);
    if (!driver) {
      driver = await Driver.findOne();
    }
    const driverName = driver ? driver.name : 'Ramesh Kumar';

    const weeklyEarnings = 15000;
    const platformFee = weeklyEarnings * 0.15;
    const tdsTax = weeklyEarnings * 0.01;
    const netPayout = weeklyEarnings - platformFee - tdsTax;
    const weekEnding = new Date().toISOString().split('T')[0];

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="payslip-driver-${id}.pdf"`);

    doc.pipe(res);

    doc.fontSize(22).font('Helvetica-Bold').text('EMINENCE LOGISTICS', { align: 'center' });
    doc.fontSize(12).font('Helvetica').text('Driver Weekly Payout Statement', { align: 'center' });
    doc.moveDown();
    doc.strokeColor('#aaaaaa').lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown();

    doc.fontSize(12).font('Helvetica-Bold').text('Driver ID: ', { continued: true }).font('Helvetica').text(`${id}`);
    doc.fontSize(12).font('Helvetica-Bold').text('Driver Name: ', { continued: true }).font('Helvetica').text(`${driverName}`);
    doc.fontSize(12).font('Helvetica-Bold').text('Statement Date: ', { continued: true }).font('Helvetica').text(`${weekEnding}`);
    doc.moveDown();

    doc.strokeColor('#aaaaaa').lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown();

    doc.fontSize(14).font('Helvetica-Bold').text('Earnings & Deductions Breakdown');
    doc.moveDown(0.5);

    const startX = 50;
    const valX = 400;

    doc.fontSize(11).font('Helvetica').text('Gross Earnings (Completed Trips)', startX, doc.y, { continued: false });
    doc.text(`INR ${weeklyEarnings.toFixed(2)}`, valX, doc.y - 14, { align: 'right' });
    doc.moveDown(0.5);

    doc.text('Platform Commission Fee (15%)', startX, doc.y, { continued: false });
    doc.text(`- INR ${platformFee.toFixed(2)}`, valX, doc.y - 14, { align: 'right' });
    doc.moveDown(0.5);

    doc.text('TDS Tax Deduction (1%)', startX, doc.y, { continued: false });
    doc.text(`- INR ${tdsTax.toFixed(2)}`, valX, doc.y - 14, { align: 'right' });
    doc.moveDown();

    doc.strokeColor('#e86331').lineWidth(2).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown();

    doc.fontSize(14).font('Helvetica-Bold').text('Net Payout Amount', startX, doc.y, { continued: false });
    doc.fillColor('#10b981').text(`INR ${netPayout.toFixed(2)}`, valX, doc.y - 18, { align: 'right' });
    doc.fillColor('#000000');
    doc.moveDown(2);

    doc.fontSize(10).font('Helvetica-Oblique').text('This is an electronically generated statement and does not require a physical signature.', { align: 'center' });

    doc.end();
  } catch (error) {
    console.error('Error generating payslip PDF:', error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: 'Server error generating PDF' });
    }
  }
};

module.exports = {
  getAllDrivers,
  createDriver,
  toggleAvailability,
  generatePayslip,
  downloadPayslip
};
