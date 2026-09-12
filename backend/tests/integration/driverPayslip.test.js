const request = require('supertest');
const app = require('../../src/app');
const jwt = require('jsonwebtoken');
const { Driver, syncDatabase } = require('../../src/models');

describe('Driver Payslip Integration Tests (TC-022)', () => {
  let driverToken;
  let testDriver;

  beforeAll(async () => {
    await syncDatabase();

    const [driver] = await Driver.findOrCreate({
      where: { phone: '9876543210' },
      defaults: {
        name: 'Ramesh Kumar',
        licenseNumber: 'MH12AB1234',
        status: 'active',
        rating: 4.8
      }
    });

    testDriver = driver;

    driverToken = jwt.sign(
      { id: testDriver.id, role: 'driver' },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '1h' }
    );
  }, 30000);

  it('should reject unauthenticated request to payslip endpoint with 401', async () => {
    const res = await request(app).get(`/api/drivers/${testDriver.id}/payslip`);
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should return payslip breakdown when authenticated with Bearer token', async () => {
    const res = await request(app)
      .get(`/api/drivers/${testDriver.id}/payslip`)
      .set('Authorization', `Bearer ${driverToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.payslip).toBeDefined();

    const payslip = res.body.payslip;
    expect(payslip.driverName).toBe(testDriver.name);
    expect(payslip.grossEarnings).toBe(15000);
    expect(payslip.platformFee).toBe(2250);
    expect(payslip.tdsTax).toBe(150);
    expect(payslip.netPayout).toBe(12600);
    expect(payslip.pdfUrl).toMatch(/\/api\/drivers\/.*\/payslip\/download/);
  });

  it('should download generated PDF statement via download endpoint', async () => {
    const res = await request(app)
      .get(`/api/drivers/${testDriver.id}/payslip/download`)
      .responseType('blob');

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/application\/pdf/);
    expect(res.headers['content-disposition']).toMatch(/attachment; filename="payslip-driver-/);
  });
});
