/**
 * poolingEngine.js
 * 
 * Simulates a Dynamic Load Pooling (Less Than Truckload - LTL) Engine.
 * Matches a new LTL booking with an existing active truck that has similar
 * routes and remaining capacity.
 */

const { Booking } = require('../models');

/**
 * Attempts to pool a new booking into an existing shared vehicle.
 * @param {Object} newBookingData The incoming LTL booking payload
 * @returns {String|null} existingBookingId if pooled, null if new truck needed
 */
const findPoolMatch = async (newBookingData) => {
  try {
    // In a real system, we would query the database for active 'shared' bookings
    // where status is 'pending' or 'driver_assigned', check the route geometry,
    // and verify the total volume/weight constraint.

    // Here we simulate the pooling check
    const { Op } = require('sequelize');
    const activePools = await Booking.findAll({
      where: {
        bookingMode: 'shared',
        status: {
          [Op.in]: ['pending', 'driver_assigned']
        },
        date: newBookingData.date,
        pickupAddress: newBookingData.pickupAddress,
        dropAddress: newBookingData.dropAddress
      },
      limit: 10
    });

    for (let pool of activePools) {
      // 1. Route geometry and date is already verified by the database query above
      
      // 2. Check remaining capacity
      // Determine max capacity based on tempoType
      let maxCapacity = 500; // default
      if (pool.tempoType === 'small') maxCapacity = 500;
      else if (pool.tempoType === 'medium') maxCapacity = 1000;
      else if (pool.tempoType === 'large') maxCapacity = 2000;

      const isCapacityAvailable = (pool.weight + newBookingData.weight) <= maxCapacity;

      // 3. Match if capacity constraints are satisfied
      if (isCapacityAvailable) {
        return pool.id;
      }
    }

    return null; // No match found, dispatch a new truck
  } catch (error) {
    console.error("Error in pooling engine:", error);
    return null;
  }
};

module.exports = {
  findPoolMatch
};
