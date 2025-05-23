# # backend/ml/predict.py
# import sys
# import json
# import os
# import joblib
# import numpy as np
# import pandas as pd

# def load_model():
#     """Load the trained model"""
#     model_path = os.path.join(os.path.dirname(__file__), '../../ml_model/models/glucose_prediction_model.joblib')
#     feature_path = os.path.join(os.path.dirname(__file__), '../../ml_model/models/feature_names.json')
    
#     try:
#         model = joblib.load(model_path)
        
#         with open(feature_path, 'r') as f:
#             feature_names = json.load(f)
        
#         return model, feature_names
#     except Exception as e:
#         raise Exception(f"Failed to load model: {e}")

# def predict(input_data):
#     """Make a prediction using the trained model"""
#     try:
#         # Load model and feature names
#         model, feature_names = load_model()
        
#         # Create a DataFrame with all features initialized to 0
#         features = pd.DataFrame(0, index=[0], columns=feature_names)
        
#         # Update features with available input values
#         if 'insulin' in input_data:
#             features['dose'] = input_data['insulin']
        
#         if 'carbs' in input_data:
#             features['carbs'] = input_data['carbs']
        
#         if 'exercise' in input_data:
#             if 'duration' in feature_names:
#                 features['duration'] = input_data['exercise']
#             if 'intensity' in feature_names:
#                 features['intensity'] = 3  # Moderate intensity as default
        
#         if 'prevGlucose' in input_data:
#             if 'value' in feature_names:
#                 features['value'] = input_data['prevGlucose']
        
#         # Make prediction
#         prediction = model.predict(features)[0]
        
#         # Ensure prediction is within reasonable range
#         prediction = max(70, min(300, prediction))
        
#         # Calculate confidence (this is simplified)
#         confidence = 0.85
        
#         return {
#             'prediction': float(prediction),
#             'confidence': confidence,
#             'method': 'ml-model'
#         }
#     except Exception as e:
#         # Fallback to formula-based prediction
#         insulin = input_data.get('insulin', 0)
#         carbs = input_data.get('carbs', 0)
#         exercise = input_data.get('exercise', 0)
#         prev_glucose = input_data.get('prevGlucose', 120)
        
#         prediction = prev_glucose - (insulin * 15) + (carbs * 3) - (exercise * 2)
#         prediction = max(70, min(300, prediction))
        
#         return {
#             'prediction': float(prediction),
#             'confidence': 0.5,
#             'method': 'formula-fallback',
#             'error': str(e)
#         }

# def main():
#     """Main function that reads input and returns prediction"""
#     if len(sys.argv) < 2:
#         print(json.dumps({
#             'error': 'No input data provided',
#             'prediction': 120,
#             'confidence': 0.1
#         }))
#         return
    
#     try:
#         # Parse input data
#         input_data = json.loads(sys.argv[1])
        
#         # Make prediction
#         result = predict(input_data)
        
#         # Return result
#         print(json.dumps(result))
#     except Exception as e:
#         print(json.dumps({
#             'error': str(e),
#             'prediction': 120,
#             'confidence': 0.1
#         }))

# if __name__ == "__main__":
#     main()