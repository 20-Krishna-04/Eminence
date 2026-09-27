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
    const { name, phone, email, licenseNumber } = req.body;
    if (!name || !phone || !licenseNumber) {
      return res.status(400).json({ success: false, message: 'Missing required fields: name, phone, licenseNumber' });
    }
    const driver = await Driver.create({ name, phone, email, licenseNumber });
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

const generatePayslip = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (req.user.role !== 'admin' && String(req.user.id) !== String(id)) {
      return res.status(403).json({ success: false, message: 'Unauthorized access to payslip' });
    }

    const driver = await Driver.findByPk(id);
    
    if (!driver) {
      return res.status(404).json({ success: false, message: 'Driver not found' });
    }

    // Mock Aggregation
    const weeklyEarnings = 15000;
    const platformFee = weeklyEarnings * 0.15;
    const tdsTax = weeklyEarnings * 0.01;
    const netPayout = weeklyEarnings - platformFee - tdsTax;

    const payslipData = {
      driverName: driver.name,
      weekEnding: new Date().toISOString().split('T')[0],
      grossEarnings: weeklyEarnings,
      platformFee: parseFloat(platformFee.toFixed(2)),
      tdsTax: parseFloat(tdsTax.toFixed(2)),
      netPayout: parseFloat(netPayout.toFixed(2)),
      pdfUrl: `https://eminence.com/api/drivers/${id}/payslip/download`
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
    const driver = await Driver.findByPk(id);
    if (!driver) return res.status(404).json({ success: false, message: 'Driver not found' });
    
    const weeklyEarnings = 15000;
    const platformFee = weeklyEarnings * 0.15;
    const tdsTax = weeklyEarnings * 0.01;
    const netPayout = weeklyEarnings - platformFee - tdsTax;

    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument({ margin: 50 });

    res.setHeader('Content-disposition', `attachment; filename=payslip_${id}.pdf`);
    res.setHeader('Content-type', 'application/pdf');

    doc.pipe(res);

    doc.fillColor('#444444').fontSize(20).text('EMINENCE TRANSPORTS', 50, 57);
    doc.fontSize(10).text('123 Main Street', 200, 50, { align: 'right' });
    doc.text('Pune, MH 411001', 200, 65, { align: 'right' });
    doc.moveDown();

    doc.moveTo(50, 110).lineTo(550, 110).stroke();

    doc.fontSize(14).text('DRIVER PAYSLIP', 50, 130);
    doc.fontSize(10).text(`Driver: ${driver.name}`, 50, 150);
    doc.text(`Week Ending: ${new Date().toISOString().split('T')[0]}`, 50, 165);
    doc.moveDown();

    doc.moveTo(50, 220).lineTo(550, 220).stroke();
    doc.font('Helvetica-Bold').text('Description', 50, 230).text('Amount', 450, 230, { width: 100, align: 'right' });
    doc.moveTo(50, 250).lineTo(550, 250).stroke();

    doc.font('Helvetica').text('Gross Earnings', 50, 270).text(`Rs. ${weeklyEarnings.toFixed(2)}`, 450, 270, { width: 100, align: 'right' });
    doc.text('Platform Fee (15%)', 50, 290).text(`- Rs. ${platformFee.toFixed(2)}`, 450, 290, { width: 100, align: 'right' });
    doc.text('TDS Tax (1%)', 50, 310).text(`- Rs. ${tdsTax.toFixed(2)}`, 450, 310, { width: 100, align: 'right' });

    doc.moveTo(50, 340).lineTo(550, 340).stroke();
    doc.font('Helvetica-Bold').text('Net Payout:', 350, 360).text(`Rs. ${netPayout.toFixed(2)}`, 450, 360, { width: 100, align: 'right' });

    doc.end();
  } catch (error) {
    console.error('Error downloading payslip:', error);
    if (!res.headersSent) res.status(500).json({ success: false, message: 'Server error' });
  }
};

const updateLocation = async (req, res) => {
  try {
    const { lat, lng } = req.body;
    const driverId = req.user.id;
    if (lat && lng) {
      await Driver.update({ currentLat: lat, currentLng: lng }, { where: { id: driverId } });
      // In a real scenario, we'd also emit a socket event here so customers tracking the driver get the update
      // req.app.get('io').to(driverId).emit('trip:location_update', { lat, lng });
    }
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error updating driver location:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getAllDrivers,
  createDriver,
  toggleAvailability,
  generatePayslip,
  downloadPayslip,
  updateLocation
};
