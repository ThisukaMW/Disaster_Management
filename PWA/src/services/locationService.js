// Location Service - GPS coordinates capture
export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser. Please use a mobile device or enable location services.'));
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 15000, // Increased timeout for GPS
      maximumAge: 0
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
      },
      (error) => {
        let errorMessage = 'Failed to get location. ';
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += 'Location permission denied. Please allow location access in your browser settings.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage += 'Location information unavailable. On desktop/Mac, GPS requires internet. Please test on a mobile device for true offline GPS.';
            break;
          case error.TIMEOUT:
            errorMessage += 'Location request timed out. Please try again or test on a mobile device with GPS.';
            break;
          default:
            errorMessage += 'Unknown error occurred. For offline GPS testing, please use a mobile device.';
            break;
        }
        reject(new Error(errorMessage));
      },
      options
    );
  });
};

// Watch location (for continuous updates)
export const watchLocation = (callback) => {
  if (!navigator.geolocation) {
    throw new Error('Geolocation is not supported');
  }

  const options = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 0
  };

  return navigator.geolocation.watchPosition(
    (position) => {
      callback({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy
      });
    },
    (error) => {
      console.error('Location error:', error);
    },
    options
  );
};

