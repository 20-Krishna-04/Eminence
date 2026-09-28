/**
 * Smart Pricing Engine
 * Calculates a dynamic surge multiplier based on time of day, weather, and traffic conditions.
 */

const calculateSurgeMultiplier = () => {
  let multiplier = 1.0;
  
  // Simulated factors
  const currentHour = new Date().getHours();
  const isRaining = Math.random() > 0.8; // 20% chance of rain
  const highTraffic = Math.random() > 0.7; // 30% chance of high traffic
  
  // 1. Time-based surge (Rush Hour: 9am-11am & 6pm-8pm)
  if ((currentHour >= 9 && currentHour <= 11) || (currentHour >= 18 && currentHour <= 20)) {
    multiplier += 0.4; // 1.4x during rush hour
  } else if (currentHour >= 23 || currentHour <= 4) {
    multiplier += 0.2; // 1.2x late night fee
  }
  
  // 2. Weather surge
  if (isRaining) {
    multiplier += 0.3; // 1.3x during rain
  }
  
  // 3. Traffic surge
  if (highTraffic) {
    multiplier += 0.2; // 1.2x during heavy traffic
  }
  
  // Cap the maximum surge at 2.5x
  return Math.min(Number(multiplier.toFixed(2)), 2.5);
};

/**
 * Calculates fare with corporate contract volume discounts and surge waiving.
 */
const calculateCorporateFare = (baseFare, contract) => {
  let fare = parseFloat(baseFare) || 0;
  if (!contract || contract.status !== 'active') return fare;

  if (contract.discountPercentage && contract.discountPercentage > 0) {
    const discountRate = parseFloat(contract.discountPercentage) / 100;
    fare -= fare * discountRate;
  }
  return parseFloat(fare.toFixed(2));
};

module.exports = {
  calculateSurgeMultiplier,
  calculateCorporateFare
};
