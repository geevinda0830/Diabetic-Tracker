// // src/services/api.js
// import axios from 'axios';

// const API_URL = 'http://10.0.2.2:5001/api'; // For Android emulator
// // const API_URL = 'http://localhost:5001/api'; // For iOS simulator

// // Set default user ID (replace with authentication later)
// const DEFAULT_USER_ID = 'default';

// // Add timeout to prevent infinite loading
// const axiosInstance = axios.create({
//   baseURL: API_URL,
//   timeout: 10000, // 10 second timeout
// });

// // Glucose Readings
// export const fetchGlucoseReadings = async () => {
//   try {
//     const response = await axios.get(`${API_URL}/glucose?userId=${DEFAULT_USER_ID}`);
//     return response.data;
//   } catch (error) {
//     console.error('API Error fetching glucose readings:', error);
//     throw error;
//   }
// };

// // Update this function in src/services/api.js

// export const saveGlucoseReading = async (reading) => {
//     try {
//       // Make sure userId is included
//       const readingWithUser = {
//         ...reading,
//         userId: DEFAULT_USER_ID
//       };
//       const response = await axiosInstance.post(`${API_URL}/glucose`, readingWithUser);
//       return response.data;
//     } catch (error) {
//       console.error('API Error saving glucose reading:', error);
//       throw error;
//     }
//   };

// // Insulin Doses
// export const fetchInsulinDoses = async () => {
//   try {
//     const response = await axios.get(`${API_URL}/insulin?userId=${DEFAULT_USER_ID}`);
//     return response.data;
//   } catch (error) {
//     console.error('API Error fetching insulin doses:', error);
//     throw error;
//   }
// };

// export const saveInsulinDose = async (dose) => {
//     try {
//       // Make sure userId is included
//       const doseWithUser = {
//         ...dose,
//         userId: DEFAULT_USER_ID
//       };
//       console.log("Sending insulin data to API:", doseWithUser);
//       const response = await axiosInstance.post(`${API_URL}/insulin`, doseWithUser);
//       return response.data;
//     } catch (error) {
//       console.error('API Error saving insulin dose:', error);
//       throw error;
//     }
//   };

// // Meals
// export const fetchMeals = async () => {
//   try {
//     const response = await axios.get(`${API_URL}/meals?userId=${DEFAULT_USER_ID}`);
//     return response.data;
//   } catch (error) {
//     console.error('API Error fetching meals:', error);
//     throw error;
//   }
// };

// export const saveMeal = async (meal) => {
//     try {
//       // Make sure userId is included
//       const mealWithUser = {
//         ...meal,
//         userId: DEFAULT_USER_ID
//       };
//       console.log("Sending meal data to API:", mealWithUser);
//       const response = await axiosInstance.post(`${API_URL}/meals`, mealWithUser);
//       return response.data;
//     } catch (error) {
//       console.error('API Error saving meal:', error);
//       throw error;
//     }
//   };
  

// // Predictions
// export const fetchPredictions = async () => {
//   try {
//     const response = await axios.get(`${API_URL}/predictions?userId=${DEFAULT_USER_ID}`);
//     return response.data;
//   } catch (error) {
//     console.error('API Error fetching predictions:', error);
//     throw error;
//   }
// };

// export const predictInsulin = async (data) => {
//   try {
//     const dataWithUser = {
//       ...data,
//       userId: DEFAULT_USER_ID
//     };
//     const response = await axiosInstance.post(`${API_URL}/predict-insulin`, dataWithUser);
//     return response.data;
//   } catch (error) {
//     console.error('API Error predicting insulin:', error);
//     throw error;
//   }
// };

// // Analysis API calls
// export const getCarbGlucoseAnalysis = async (days = 30) => {
//   try {
//     const response = await axiosInstance.get(`${API_URL}/analysis/carb-glucose`, {
//       params: { userId: DEFAULT_USER_ID, days }
//     });
//     return response.data;
//   } catch (error) {
//     console.error('API Error fetching carb-glucose analysis:', error);
//     throw error;
//   }
// };

// export const getGlucoseByMealState = async (days = 14) => {
//   try {
//     const response = await axiosInstance.get(`${API_URL}/analysis/glucose-by-meal-state`, {
//       params: { userId: DEFAULT_USER_ID, days }
//     });
//     return response.data;
//   } catch (error) {
//     console.error('API Error fetching glucose by meal state:', error);
//     throw error;
//   }
// };

// export const getDailyCarbIntake = async (days = 14) => {
//   try {
//     const response = await axiosInstance.get(`${API_URL}/analysis/daily-carb-intake`, {
//       params: { userId: DEFAULT_USER_ID, days }
//     });
//     return response.data;
//   } catch (error) {
//     console.error('API Error fetching daily carb intake:', error);
//     throw error;
//   }
// };

// src/services/api.js - Updated API Service Functions

import axios from 'axios';

const API_URL = 'http://10.0.2.2:5001/api'; // For Android emulator
// const API_URL = 'http://localhost:5001/api'; // For iOS simulator

// Set default user ID (replace with authentication later)
const DEFAULT_USER_ID = 'default';

// Add timeout to prevent infinite loading
const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 15000, // Increase timeout to 15 seconds
});

// Add interceptor to handle common errors
axiosInstance.interceptors.response.use(
  response => response,
  error => {
    // Log detailed error information
    if (error.response) {
      console.error('API Error Response:', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('API No Response:', error.request);
    } else {
      console.error('API Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// Helper function to ensure userId is included
const addUserIdToData = (data) => ({
  ...data,
  userId: DEFAULT_USER_ID
});

// Prediction API
export const predictInsulin = async (data) => {
  try {
    const dataWithUser = addUserIdToData(data);
    console.log('Sending to predict-insulin API:', dataWithUser);
    const response = await axiosInstance.post(`${API_URL}/predict-insulin`, dataWithUser);
    return response.data;
  } catch (error) {
    console.error('API Error predicting insulin:', error);
    
    // Fallback to local calculation
    const glucose = parseFloat(data.bloodGlucose) || 0;
    const totalCarbs = parseFloat(data.carbIntake) || 0;
    const exercise = parseFloat(data.exerciseTime) || 0;
    const currentDosage = parseFloat(data.currentInsulinDosage) || 0;
    const targetGlucose = 120;

    const glucoseDifference = glucose - targetGlucose;
    const carbEffect = totalCarbs / 10;
    const exerciseReduction = exercise * 0.2;
    const glucoseAdjustment = glucoseDifference > 0 
      ? Math.ceil(glucoseDifference / 30) 
      : Math.floor(glucoseDifference / 30);

    let recommendedDosage = currentDosage + glucoseAdjustment + carbEffect;
    recommendedDosage = Math.max(0, recommendedDosage - exerciseReduction);
    recommendedDosage = Math.round(recommendedDosage * 2) / 2;

    return {
      recommendedDosage,
      details: {
        currentGlucose: glucose,
        glucoseDifference: glucoseDifference.toFixed(1),
        carbEffect: carbEffect.toFixed(1),
        exerciseReduction: exerciseReduction.toFixed(1)
      },
      method: 'local-fallback',
      confidence: 0.6
    };
  }
};

// Glucose Readings
export const fetchGlucoseReadings = async () => {
  try {
    const response = await axiosInstance.get(`${API_URL}/glucose`, {
      params: { userId: DEFAULT_USER_ID }
    });
    return response.data;
  } catch (error) {
    console.error('API Error fetching glucose readings:', error);
    return []; // Return empty array instead of throwing
  }
};

export const saveGlucoseReading = async (reading) => {
  try {
    const readingWithUser = addUserIdToData(reading);
    console.log('Saving glucose reading:', readingWithUser);
    const response = await axiosInstance.post(`${API_URL}/glucose`, readingWithUser);
    return response.data;
  } catch (error) {
    console.error('API Error saving glucose reading:', error);
    throw error;
  }
};

// Insulin Doses
export const fetchInsulinDoses = async () => {
  try {
    const response = await axiosInstance.get(`${API_URL}/insulin`, {
      params: { userId: DEFAULT_USER_ID }
    });
    return response.data;
  } catch (error) {
    console.error('API Error fetching insulin doses:', error);
    return []; // Return empty array instead of throwing
  }
};

export const saveInsulinDose = async (dose) => {
  try {
    const doseWithUser = addUserIdToData(dose);
    console.log("Sending insulin data to API:", doseWithUser);
    const response = await axiosInstance.post(`${API_URL}/insulin`, doseWithUser);
    return response.data;
  } catch (error) {
    console.error('API Error saving insulin dose:', error);
    throw error;
  }
};

// Meals
export const fetchMeals = async () => {
  try {
    const response = await axiosInstance.get(`${API_URL}/meals`, {
      params: { userId: DEFAULT_USER_ID }
    });
    return response.data;
  } catch (error) {
    console.error('API Error fetching meals:', error);
    return []; // Return empty array instead of throwing
  }
};

export const saveMeal = async (meal) => {
  try {
    const mealWithUser = addUserIdToData(meal);
    console.log("Sending meal data to API:", mealWithUser);
    const response = await axiosInstance.post(`${API_URL}/meals`, mealWithUser);
    return response.data;
  } catch (error) {
    console.error('API Error saving meal:', error);
    throw error;
  }
};