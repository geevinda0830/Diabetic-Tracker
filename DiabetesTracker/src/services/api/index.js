// src/services/api/index.js
// This will handle API requests to our backend


// src/services/api/index.js
const API_URL = 'http://10.0.2.2:5001/api'; // Points to your localhost:5001 from Android emulator

export const fetchGlucoseReadings = async () => {
  try {
    console.log('Fetching data from:', `${API_URL}/glucose`);
    const response = await fetch(`${API_URL}/glucose`);
    const data = await response.json();
    console.log('Received data:', data);
    return data;
  } catch (error) {
    console.error('Error fetching glucose readings:', error);
    return [];
  }
};

export const saveGlucoseReading = async (reading) => {
  try {
    console.log('Saving reading to:', `${API_URL}/glucose`, reading);
    const response = await fetch(`${API_URL}/glucose`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reading)
    });
    const result = await response.json();
    console.log('Save result:', result);
    return result;
  } catch (error) {
    console.error('Error saving glucose reading:', error);
    return null;
  }
};

// src/services/api/index.js
// Add this function
// src/services/api/index.js - update getPrediction function
export const getPrediction = async (data) => {
    try {
      const response = await fetch('http://10.0.2.2:5002/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await response.json();
    } catch (error) {
      console.error('Error getting prediction:', error);
      return null;
    }
  };