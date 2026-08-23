// Location Service - GPS coordinates capture
// This service automatically requests location permission from the browser
// On mobile devices, GPS works offline (no internet required)
// On desktop/Mac, location may require internet connection
export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser. Please use a mobile device or enable location services.'));
      return;
    }

    // Request location with high accuracy (uses GPS on mobile)
    // This will automatically prompt user for location permission if not granted
    const options = {
      enableHighAccuracy: true, // Use GPS on mobile devices (works offline)
      timeout: 15000, // Increased timeout for GPS
      maximumAge: 0 // Always get fresh location
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
            errorMessage += 'Location permission denied. Please allow location access in your browser settings. On iPhone: Settings → Safari → Location Services → Allow.';
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

// Fast location for emergency (SOS) - accepts cached location, shorter timeout
export const getFastLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported'));
      return;
    }

    // For emergency: accept cached location (up to 30 seconds old), shorter timeout
    const options = {
      enableHighAccuracy: false, // Faster, less accurate is OK for emergency
      timeout: 3000, // Only wait 3 seconds (emergency!)
      maximumAge: 30000 // Accept location up to 30 seconds old (much faster)
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
        // For emergency, try once more with cached location
        const fallbackOptions = {
          enableHighAccuracy: false,
          timeout: 2000,
          maximumAge: 60000 // Accept up to 1 minute old location
        };
        
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy
            });
          },
          (fallbackError) => {
            reject(new Error('Could not get location quickly. SOS sent anyway.'));
          },
          fallbackOptions
        );
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

