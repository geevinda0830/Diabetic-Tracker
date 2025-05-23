# from flask import Flask, request, jsonify
# import joblib
# import numpy as np
# import os

# app = Flask(__name__)

# # Load models
# model_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'ml_model', 'models')
# model_path = os.path.join(model_dir, 'insulin_model.joblib')
# scaler_path = os.path.join(model_dir, 'insulin_scaler.joblib')
# features_path = os.path.join(model_dir, 'insulin_features.joblib')

# # Try to load model, fall back to heuristic calculation if not available
# try:
#     model = joblib.load(model_path)
#     scaler = joblib.load(scaler_path)
#     features = joblib.load(features_path)
#     use_ml = True
#     print("ML model loaded successfully")
# except Exception as e:
#     use_ml = False
#     print(f"Could not load ML model: {e}")
#     print("Using heuristic calculation instead")

# @app.route('/api/predict-insulin', methods=['POST'])
# def predict_insulin():
#     data = request.json
    
#     # Extract values with defaults
#     glucose = float(data.get('bloodGlucose', 0))
#     carbs = float(data.get('carbIntake', 0))
#     exercise = float(data.get('exerciseTime', 0))
#     current_dosage = float(data.get('currentInsulinDosage', 0))
#     weight = float(data.get('weight', 70))  # Default weight if not provided
    
#     if use_ml:
#         try:
#             # Prepare input features in the correct order
#             feature_values = []
#             for feature in features:
#                 if feature == 'value':
#                     feature_values.append(glucose)
#                 elif feature == 'carbs':
#                     feature_values.append(carbs)
#                 elif feature == 'duration':
#                     feature_values.append(exercise)
#                 elif feature == 'weight':
#                     feature_values.append(weight)
#                 else:
#                     feature_values.append(0)  # Default value for missing features
            
#             # Scale features
#             input_scaled = scaler.transform([feature_values])
            
#             # Get prediction
#             prediction = model.predict(input_scaled)[0]
            
#             # Round to nearest 0.5 units
#             prediction = round(prediction * 2) / 2
            
#             # Ensure prediction is positive
#             prediction = max(0, prediction)
            
#             # Return prediction and confidence
#             return jsonify({
#                 'recommendedDosage': float(prediction),
#                 'method': 'ml-model',
#                 'confidence': 0.85,
#                 'details': {
#                     'currentGlucose': glucose,
#                     'carbEffect': round(carbs / 10, 1),
#                     'exerciseReduction': round(exercise * 0.2, 1)
#                 }
#             })
        
#         except Exception as e:
#             print(f"Error during ML prediction: {e}")
#             # Fall back to heuristic calculation
#             use_ml = False
    
#     # Heuristic calculation if ML not available or failed
#     if not use_ml:
#         targetGlucose = 120
#         glucoseDifference = glucose - targetGlucose
#         carbEffect = carbs / 10
#         exerciseReduction = exercise * 0.2
#         glucoseAdjustment = (glucoseDifference / 30)
        
#         if glucoseDifference > 0:
#             glucoseAdjustment = np.ceil(glucoseAdjustment)
#         else:
#             glucoseAdjustment = np.floor(glucoseAdjustment)
        
#         recommendedDosage = current_dosage + glucoseAdjustment + carbEffect - exerciseReduction
#         recommendedDosage = max(0, recommendedDosage)
#         recommendedDosage = round(recommendedDosage * 2) / 2
        
#         return jsonify({
#             'recommendedDosage': float(recommendedDosage),
#             'method': 'heuristic',
#             'confidence': 0.7,
#             'details': {
#                 'currentGlucose': glucose,
#                 'glucoseDifference': round(glucoseDifference, 1),
#                 'carbEffect': round(carbEffect, 1),
#                 'exerciseReduction': round(exerciseReduction, 1)
#             }
#         })

# if __name__ == '__main__':
#     app.run(host='0.0.0.0', port=5002)