const { Customer, B2BContract, Invoice, Booking } = require('../models');
const sequelize = require('../config/database');

const registerBusiness = async (req, res) => {
  try {
    const customerId = req.user.id;
    const { companyName, businessName, gstNumber } = req.body;
    const resolvedCompanyName = companyName || businessName;

    if (!resolvedCompanyName || !gstNumber) {
      return res.status(400).json({ success: false, message: 'Company Name and GST Number are required' });
    }

    const customer = await Customer.findByPk(customerId);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    // Set to pending business state, grant business access but no postpaid credit yet.
    customer.isBusiness = true;
    customer.companyName = resolvedCompanyName;
    customer.gstNumber = gstNumber;
    customer.billingMode = 'prepaid';
    customer.creditLimit = 0;
    customer.creditUsed = 0;
    customer.b2bStatus = 'pending_verification';
    await customer.save();

    return res.status(200).json({
      success: true,
      message: 'Corporate Account request submitted. Pending admin verification.',
      data: customer
    });
  } catch (error) {
    console.error('B2B Register Error:', error);
    return res.status(500).json({ success: false, message: 'Server error registering business' });
  }
};

const requestContract = async (req, res) => {
  try {
    const customerId = req.user.id;
    const { vehicleType, vehicleCount, startDate, endDate } = req.body;

    const customer = await Customer.findByPk(customerId);
    if (!customer || !customer.isBusiness) {
      return res.status(403).json({ success: false, message: 'Only verified businesses can request contracts' });
    }

    const contract = await B2BContract.create({
      customerId,
      vehicleType,
      vehicleCount,
      startDate,
      endDate,
      status: 'pending' // Admin must approve and set daily rate
    });

    return res.status(201).json({
      success: true,
      message: 'Contract requested successfully. Our team will contact you with the daily rate.',
      contract
    });
  } catch (error) {
    console.error('Request Contract Error:', error);
    return res.status(500).json({ success: false, message: 'Server error requesting contract' });
  }
};

const getContracts = async (req, res) => {
  try {
    const customerId = req.user.id;
    const contracts = await B2BContract.findAll({
      where: { customerId },
      order: [['createdAt', 'DESC']]
    });

    return res.status(200).json({ success: true, contracts });
  } catch (error) {
    console.error('Get Contracts Error:', error);
    return res.status(500).json({ success: false, message: 'Server error fetching contracts' });
  }
};

const getInvoices = async (req, res) => {
  try {
    const customerId = req.user.id;
    const invoices = await Invoice.findAll({
      where: { customerId },
      order: [['year', 'DESC'], ['month', 'DESC']]
    });

    return res.status(200).json({ success: true, invoices });
  } catch (error) {
    console.error('Fetch Invoices Error:', error);
    return res.status(500).json({ success: false, message: 'Server error fetching invoices' });
  }
};

const batchBookings = async (req, res) => {
  try {
    const customerId = req.user.id;
    const customer = await Customer.findByPk(customerId);

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    let rawRecords = [];

    if (req.file) {
      const fileContent = req.file.buffer.toString('utf-8').trim();
      if (fileContent.startsWith('[') || fileContent.startsWith('{')) {
        try {
          const parsed = JSON.parse(fileContent);
          rawRecords = Array.isArray(parsed) ? parsed : [parsed];
        } catch {
          return res.status(400).json({ success: false, message: 'Invalid JSON file content' });
        }
      } else {
        // Parse CSV
        const lines = fileContent.split(/\r?\n/).filter(line => line.trim().length > 0);
        if (lines.length <= 1) {
          return res.status(400).json({ success: false, message: 'CSV file contains no data rows' });
        }
        const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim().replace(/^["']|["']$/g, ''));
          const record = {};
          headers.forEach((header, idx) => {
            record[header] = values[idx] !== undefined ? values[idx] : '';
          });
          rawRecords.push(record);
        }
      }
    } else if (req.body.bookings) {
      rawRecords = Array.isArray(req.body.bookings) ? req.body.bookings : (typeof req.body.bookings === 'string' ? JSON.parse(req.body.bookings) : []);
    } else {
      return res.status(400).json({
        success: false,
        message: 'No batch booking data provided. Upload a CSV/JSON file or send bookings array in request body.'
      });
    }

    if (!rawRecords.length) {
      return res.status(400).json({ success: false, message: 'No records to process' });
    }

    const validRows = [];
    const failedRows = [];
    const validTempoTypes = ['small', 'medium', 'large'];

    rawRecords.forEach((item, index) => {
      const rowNum = index + 1;
      const pickupAddress = item.pickupAddress || item.pickup;
      const dropAddress = item.dropAddress || item.drop;
      const tempoType = (item.tempoType || 'medium').toLowerCase();
      const estimatedFare = parseFloat(item.estimatedFare || item.fare);
      const weight = parseFloat(item.weight) || 50;
      const goodsType = item.goodsType || 'General Cargo';
      const date = item.date || new Date().toISOString().split('T')[0];
      const time = item.time || '10:00:00';

      if (!pickupAddress || !dropAddress) {
        failedRows.push({ row: rowNum, error: 'Missing pickup or drop address' });
        return;
      }
      if (!validTempoTypes.includes(tempoType)) {
        failedRows.push({ row: rowNum, error: `Invalid tempoType '${tempoType}'. Must be small, medium, or large` });
        return;
      }
      if (isNaN(estimatedFare) || estimatedFare <= 0) {
        failedRows.push({ row: rowNum, error: 'Invalid or non-positive estimatedFare' });
        return;
      }

      validRows.push({
        customerId,
        pickupAddress,
        dropAddress,
        tempoType,
        estimatedFare,
        weight,
        goodsType,
        date,
        time,
        status: 'pending',
        isB2B: true,
        paymentMethod: customer.billingMode === 'postpaid' ? 'corporate_credit' : 'online',
        paymentStatus: 'pending'
      });
    });

    if (validRows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'All batch booking records failed validation',
        errors: failedRows
      });
    }

    // Execute bulk creation inside a database transaction
    const t = await sequelize.transaction();
    let createdBookings = [];
    try {
      createdBookings = await Booking.bulkCreate(validRows, { transaction: t });
      await t.commit();
    } catch (dbErr) {
      await t.rollback();
      throw dbErr;
    }

    return res.status(200).json({
      success: true,
      message: `Batch bookings processed successfully: ${createdBookings.length} created, ${failedRows.length} failed`,
      processedCount: createdBookings.length,
      failedCount: failedRows.length,
      errors: failedRows.length > 0 ? failedRows : undefined
    });
  } catch (error) {
    console.error('Batch Bookings Error:', error);
    return res.status(500).json({ success: false, message: 'Server error processing batch bookings' });
  }
};

module.exports = {
  registerBusiness,
  requestContract,
  getContracts,
  getInvoices,
  batchBookings
};
