const cron = require('node-cron');
const { Op } = require('sequelize');
const { Booking, Driver } = require('./models');
const sequelize = require('./config/database');
const axios = require('axios');

// Run every minute
const scheduleDriverAllocation = () => {
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      // Target time is exactly 30 minutes from now (checking between 30 and 31 minutes ahead)
      const targetTimeStart = new Date(now.getTime() + 30 * 60000);
      const targetTimeEnd = new Date(now.getTime() + 31 * 60000);

      const upcomingBookings = await Booking.findAll({
        where: {
          status: 'pending',
          scheduledAt: {
            [Op.between]: [targetTimeStart, targetTimeEnd]
          }
        }
      });

      if (upcomingBookings.length > 0) {
        console.log(`[CRON] Found ${upcomingBookings.length} scheduled bookings needing driver allocation in 30 mins.`);
        
        for (const booking of upcomingBookings) {
          // 1. Geocode Pickup Address
          let pickupLat = 18.5204; // Default Pune
          let pickupLng = 73.8567;
          
          try {
            const geoRes = await axios.get(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(booking.pickupAddress)}&format=json&limit=1`, {
              headers: { 'User-Agent': 'Eminence-Logistics/1.0' }
            });
            if (geoRes.data && geoRes.data.length > 0) {
              pickupLat = parseFloat(geoRes.data[0].lat);
              pickupLng = parseFloat(geoRes.data[0].lon);
            }
          } catch (geoErr) {
            console.warn(`[CRON] Geocoding failed for ${booking.pickupAddress}, using default coordinates.`);
          }

          // 2. Find Nearest Active Driver (Geospatial Radius Query using Haversine Formula)
          const isPostgres = sequelize.getDialect() === 'postgres';
          let nearestDrivers = [];

          if (isPostgres) {
            nearestDrivers = await sequelize.query(`
              SELECT id, name, "currentLat", "currentLng",
              ( 6371 * acos( cos( radians(:lat) ) * cos( radians( "currentLat" ) ) * cos( radians( "currentLng" ) - radians(:lng) ) + sin( radians(:lat) ) * sin( radians( "currentLat" ) ) ) ) AS distance 
              FROM "Drivers" 
              WHERE status = 'active' AND "currentLat" IS NOT NULL 
              ORDER BY distance ASC 
              LIMIT 1
            `, {
              replacements: { lat: pickupLat, lng: pickupLng },
              type: sequelize.QueryTypes.SELECT
            });
          } else {
            // For SQLite and cross-dialect fallback without native trigonometric SQL math functions,
            // query active drivers and compute the Haversine distance reliably in application memory.
            const activeDrivers = await Driver.findAll({
              where: {
                status: 'active',
                currentLat: { [Op.ne]: null },
                currentLng: { [Op.ne]: null }
              },
              attributes: ['id', 'name', 'currentLat', 'currentLng']
            });

            const toRad = (val) => (val * Math.PI) / 180;
            const driversWithDist = activeDrivers.map((d) => {
              const dLat = toRad(d.currentLat - pickupLat);
              const dLng = toRad(d.currentLng - pickupLng);
              const a =
                Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(toRad(pickupLat)) * Math.cos(toRad(d.currentLat)) *
                Math.sin(dLng / 2) * Math.sin(dLng / 2);
              const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
              const distance = 6371 * c;
              return {
                id: d.id,
                name: d.name,
                currentLat: d.currentLat,
                currentLng: d.currentLng,
                distance
              };
            });
            driversWithDist.sort((a, b) => a.distance - b.distance);
            nearestDrivers = driversWithDist.slice(0, 1);
          }

          if (nearestDrivers && nearestDrivers.length > 0) {
            const nearestDriverData = nearestDrivers[0];
            const availableDriver = await Driver.findByPk(nearestDriverData.id);
            
            if (availableDriver) {
              booking.driverId = availableDriver.id;
              booking.status = 'driver_assigned';
              await booking.save();

              // Update driver status
              availableDriver.status = 'on_trip';
              await availableDriver.save();
              
              console.log(`[CRON] Assigned driver ${availableDriver.id} (${nearestDriverData.distance.toFixed(2)}km away) to booking ${booking.id}`);
            }
          } else {
            console.warn(`[CRON] No active drivers available in the vicinity for booking ${booking.id}`);
          }
        }
      }
    } catch (error) {
      console.error('[CRON] Error during driver allocation schedule:', error);
    }
  });
};

const initCronJobs = () => {
  console.log('Initializing background cron jobs...');
  scheduleDriverAllocation();
};

module.exports = {
  initCronJobs
};
