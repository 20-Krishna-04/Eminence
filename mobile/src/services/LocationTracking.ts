import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import api from './api';

const LOCATION_TASK_NAME = 'BACKGROUND_LOCATION_TASK';

// Define the background task globally
TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.error('Background location task error:', error);
    return;
  }
  
  if (data) {
    const { locations } = data as { locations: Location.LocationObject[] };
    if (locations && locations.length > 0) {
      const { latitude, longitude } = locations[0].coords;
      
      try {
        // We do not have user.id here contextually, so we rely on the JWT token 
        // stored in SecureStore to identify the driver on the backend.
        // We'll call a location update endpoint. 
        // In this demo, we'll hit /api/drivers/location 
        await api.post('/api/drivers/location', {
          lat: latitude,
          lng: longitude,
          timestamp: new Date().toISOString()
        });
        console.log(`[Background Location] Synced: ${latitude}, ${longitude}`);
      } catch (err) {
        console.log('[Background Location] Sync failed (might be offline/unauthorized)', err);
      }
    }
  }
});

/**
 * Request permissions and start tracking the location in the background
 */
export const startBackgroundLocation = async () => {
  const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
  if (foregroundStatus !== 'granted') {
    console.warn('Foreground location permission denied');
    return false;
  }

  const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
  if (backgroundStatus !== 'granted') {
    console.warn('Background location permission denied');
    return false;
  }

  const isRegistered = await TaskManager.isTaskRegisteredAsync(LOCATION_TASK_NAME);
  if (!isRegistered) {
    await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
      accuracy: Location.Accuracy.High,
      distanceInterval: 50, // update every 50 meters
      deferredUpdatesInterval: 10000, // update every 10 seconds minimum
      foregroundService: {
        notificationTitle: 'Eminence Driver Tracking',
        notificationBody: 'Your location is being shared with the dispatcher for incoming trips.',
        notificationColor: '#e86331',
      },
    });
    console.log('Background location tracking started.');
  }
  
  return true;
};

/**
 * Stop background location tracking
 */
export const stopBackgroundLocation = async () => {
  const isRegistered = await TaskManager.isTaskRegisteredAsync(LOCATION_TASK_NAME);
  if (isRegistered) {
    await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
    console.log('Background location tracking stopped.');
  }
};
