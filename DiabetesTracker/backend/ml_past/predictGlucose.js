// // backend/ml/predictGlucose.js
// const { spawn } = require('child_process');
// const path = require('path');

// /**
//  * Make a glucose prediction using the Python ML model
//  * @param {Object} data - Input data for prediction
//  * @returns {Promise<Object>} Prediction result
//  */
// const predictGlucose = (data) => {
//   return new Promise((resolve, reject) => {
//     const pythonProcess = spawn('python3', [
//       path.join(__dirname, 'predict.py'),
//       JSON.stringify(data)
//     ]);
    
//     let result = '';
//     let error = '';
    
//     pythonProcess.stdout.on('data', (data) => {
//       result += data.toString();
//     });
    
//     pythonProcess.stderr.on('data', (data) => {
//       error += data.toString();
//     });
    
//     pythonProcess.on('close', (code) => {
//       if (code !== 0) {
//         console.error(`Python process exited with code ${code}`);
//         console.error(`Error: ${error}`);
        
//         // Fallback to formula-based prediction
//         const { insulin, carbs, exercise, prevGlucose } = data;
//         const prediction = (prevGlucose || 120) - (insulin * 15) + (carbs * 3) - (exercise * 2);
        
//         resolve({
//           prediction: Math.max(70, Math.min(300, prediction)),
//           confidence: 0.5,
//           method: 'fallback-formula'
//         });
//       } else {
//         try {
//           const resultObj = JSON.parse(result);
//           resolve(resultObj);
//         } catch (e) {
//           reject(new Error(`Failed to parse prediction result: ${e.message}`));
//         }
//       }
//     });
//   });
// };

// module.exports = { predictGlucose };