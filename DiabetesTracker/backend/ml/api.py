# # api.py
# from flask import Flask, request, jsonify
# from flask_cors import CORS
# import joblib
# import pandas as pd
# import numpy as np

# app = Flask(__name__)
# CORS(app)

# @app.route('/predict', methods=['POST'])
# def predict():
#     try:
#         # Simple ruleset-based prediction for now
#         data = request.json
#         insulin = float(data.get('insulin', 0))
#         carbs = float(data.get('carbs', 0))
#         exercise = float(data.get('exercise', 0))
#         prev_glucose = float(data.get('prevGlucose', 120))
        
#         # Simple formula-based prediction
#         prediction = prev_glucose - (insulin * 15) + (carbs * 3) - (exercise * 2)
#         prediction = max(70, min(300, prediction))  # Keep in reasonable range
        
#         return jsonify({"prediction": float(prediction), "confidence": 0.8})
#     except Exception as e:
#         return jsonify({"error": str(e)}), 400

# if __name__ == '__main__':
#     app.run(port=5002)

# api.py
# Enhanced Flask API for diabetes tracking system

import os
import sys
import time
import json
import logging
import traceback
from datetime import datetime
from typing import Dict, Any, List, Optional, Union

from flask import Flask, request, jsonify, Response
from flask_cors import CORS

# Import custom modules
from insulin_prediction import InsulinPredictionModel
from glucose_prediction_model import GlucosePredictionModel

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("api.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Define paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, 'models')
INSULIN_MODEL_PATH = os.path.join(MODELS_DIR, 'insulin_model.joblib')
GLUCOSE_MODEL_30MIN_PATH = os.path.join(MODELS_DIR, 'glucose_model.joblib')
GLUCOSE_MODEL_60MIN_PATH = os.path.join(MODELS_DIR, 'glucose_model_60min.joblib')

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Initialize models
insulin_model = InsulinPredictionModel(model_path=INSULIN_MODEL_PATH)
glucose_model_30min = GlucosePredictionModel(model_path=GLUCOSE_MODEL_30MIN_PATH, prediction_horizon=30)
glucose_model_60min = GlucosePredictionModel(model_path=GLUCOSE_MODEL_60MIN_PATH, prediction_horizon=60)

# Load models
try:
    insulin_model_loaded = insulin_model.load_model()
    logger.info(f"Insulin model loaded: {insulin_model_loaded}")
except Exception as e:
    logger.error(f"Error loading insulin model: {str(e)}")
    insulin_model_loaded = False

try:
    glucose_model_30min_loaded = glucose_model_30min.load_model()
    logger.info(f"30-min glucose model loaded: {glucose_model_30min_loaded}")
except Exception as e:
    logger.error(f"Error loading 30-min glucose model: {str(e)}")
    glucose_model_30min_loaded = False

try:
    glucose_model_60min_loaded = glucose_model_60min.load_model()
    logger.info(f"60-min glucose model loaded: {glucose_model_60min_loaded}")
except Exception as e:
    logger.error(f"Error loading 60-min glucose model: {str(e)}")
    glucose_model_60min_loaded = False

@app.before_request
def log_request_info() -> None:
    """Log API request details."""
    logger.info(f"Request: {request.method} {request.path}")
    logger.info(f"Headers: {dict(request.headers)}")
    if request.is_json:
        logger.info(f"JSON Body: {request.json}")

@app.after_request
def log_response_info(response: Response) -> Response:
    """Log API response details."""
    logger.info(f"Response: {response.status}")
    return response

@app.route('/', methods=['GET'])
def home() -> Response:
    """Home endpoint to check if API is running."""
    return jsonify({
        'status': 'ok',
        'message': 'Diabetes prediction API is running',
        'version': '2.0',
        'timestamp': datetime.now().isoformat(),
        'models': {
            'insulin_model': {
                'loaded': insulin_model_loaded,
                'path': INSULIN_MODEL_PATH
            },
            'glucose_model_30min': {
                'loaded': glucose_model_30min_loaded,
                'path': GLUCOSE_MODEL_30MIN_PATH
            },
            'glucose_model_60min': {
                'loaded': glucose_model_60min_loaded,
                'path': GLUCOSE_MODEL_60MIN_PATH
            }
        }
    })

@app.route('/api/health', methods=['GET'])
def health_check() -> Response:
    """Health check endpoint for monitoring."""
    return jsonify({
        'status': 'healthy',
        'uptime': time.time(),
        'models': {
            'insulin_model': insulin_model_loaded,
            'glucose_model_30min': glucose_model_30min_loaded,
            'glucose_model_60min': glucose_model_60min_loaded
        }
    })

@app.route('/api/predict-insulin', methods=['POST'])
def predict_insulin() -> Response:
    """
    Predict insulin dosage based on input parameters.
    
    Input JSON parameters:
    - bloodGlucose: Current blood glucose level (mg/dL)
    - carbIntake: Carbohydrate intake (grams)
    - exerciseTime: Planned exercise duration (minutes)
    - weight: Body weight (kg)
    - currentInsulinDosage: Current insulin dosage (units)
    - Optional: Additional parameters for more accurate prediction
    
    Returns:
    - JSON with recommended insulin dosage and details
    """
    try:
        # Start timer for performance tracking
        start_time = time.time()
        
        # Get data from request
        data = request.json
        logger.info(f"Received insulin prediction request: {data}")
        
        # Validate required parameters
        required_params = ['bloodGlucose']
        missing_params = [param for param in required_params if param not in data]
        
        if missing_params:
            return jsonify({
                'error': f"Missing required parameters: {', '.join(missing_params)}"
            }), 400
        
        # Extract parameters with defaults
        blood_glucose = float(data.get('bloodGlucose', 0))
        carb_intake = float(data.get('carbIntake', 0))
        exercise_time = float(data.get('exerciseTime', 0))
        weight = float(data.get('weight', 70))  # Default to 70kg if not provided
        current_insulin_dosage = float(data.get('currentInsulinDosage', 0))
        
        # Validate inputs
        if blood_glucose <= 0:
            return jsonify({
                'error': 'Blood glucose must be greater than 0'
            }), 400
        
        # Extract any additional parameters
        additional_params = {k: v for k, v in data.items() 
                          if k not in ['bloodGlucose', 'carbIntake', 'exerciseTime', 'weight', 'currentInsulinDosage']}
        
        # Make prediction
        prediction_args = {
            'blood_glucose': blood_glucose,
            'carb_intake': carb_intake,
            'exercise_time': exercise_time,
            'weight': weight,
            'current_insulin_dosage': current_insulin_dosage,
            **additional_params
        }
        
        prediction_result = insulin_model.predict(**prediction_args)
        
        # Add timing information
        elapsed_time = time.time() - start_time
        prediction_result['processingTime'] = round(elapsed_time * 1000)  # Convert to milliseconds
        
        logger.info(f"Insulin prediction result: {prediction_result}")
        return jsonify(prediction_result)
    
    except Exception as e:
        logger.error(f"Error in insulin prediction: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({
            'error': 'An error occurred during prediction',
            'message': str(e)
        }), 500

@app.route('/api/predict-glucose', methods=['POST'])
def predict_glucose() -> Response:
    """
    Predict future glucose level based on input parameters.
    
    Input JSON parameters:
    - currentGlucose: Current glucose level (mg/dL)
    - insulinDose: Insulin dose (units)
    - totalCarbs: Carbohydrate intake (grams)
    - exerciseDuration: Exercise duration (minutes)
    - exerciseIntensity: Exercise intensity (1-3)
    - predictionHorizon: Prediction horizon in minutes (30 or 60)
    - Optional: Additional parameters for more accurate prediction
    
    Returns:
    - JSON with predicted glucose level and details
    """
    try:
        # Start timer for performance tracking
        start_time = time.time()
        
        # Get data from request
        data = request.json
        logger.info(f"Received glucose prediction request: {data}")
        
        # Validate required parameters
        required_params = ['currentGlucose']
        missing_params = [param for param in required_params if param not in data]
        
        if missing_params:
            return jsonify({
                'error': f"Missing required parameters: {', '.join(missing_params)}"
            }), 400
        
        # Extract parameters with defaults
        current_glucose = float(data.get('currentGlucose', 0))
        insulin_dose = float(data.get('insulinDose', 0))
        carb_intake = float(data.get('totalCarbs', 0))
        exercise_duration = float(data.get('exerciseDuration', 0))
        exercise_intensity = float(data.get('exerciseIntensity', 2))  # Default to medium intensity
        prediction_horizon = int(data.get('predictionHorizon', 60))  # Default to 60 min prediction
        
        # Validate inputs
        if current_glucose <= 0:
            return jsonify({
                'error': 'Current glucose must be greater than 0'
            }), 400
        
        # Clamp prediction horizon to supported values
        if prediction_horizon not in [30, 60]:
            prediction_horizon = 60 if prediction_horizon > 45 else 30
        
        # Extract any additional parameters
        additional_params = {k: v for k, v in data.items() 
                          if k not in ['currentGlucose', 'insulinDose', 'totalCarbs', 
                                        'exerciseDuration', 'exerciseIntensity', 'predictionHorizon']}
        
        # Select the appropriate model based on prediction horizon
        if prediction_horizon == 30:
            model = glucose_model_30min
        else:
            model = glucose_model_60min
        
        # Make prediction
        prediction_args = {
            'current_glucose': current_glucose,
            'insulin_dose': insulin_dose,
            'carb_intake': carb_intake,
            'exercise_duration': exercise_duration,
            'exercise_intensity': exercise_intensity,
            **additional_params
        }
        
        prediction_result = model.predict(**prediction_args)
        
        # Add timing information
        elapsed_time = time.time() - start_time
        prediction_result['processingTime'] = round(elapsed_time * 1000)  # Convert to milliseconds
        
        logger.info(f"Glucose prediction result: {prediction_result}")
        return jsonify(prediction_result)
    
    except Exception as e:
        logger.error(f"Error in glucose prediction: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({
            'error': 'An error occurred during prediction',
            'message': str(e)
        }), 500

@app.route('/api/model-info', methods=['GET'])
def model_info() -> Response:
    """Get detailed information about the ML models."""
    model_type = request.args.get('type', 'all')
    
    info = {}
    
    if model_type in ['all', 'insulin']:
        # Insulin model info
        info['insulin_model'] = {
            'loaded': insulin_model_loaded,
            'type': 'Gradient Boosting Regressor',
            'features': [
                'blood_glucose', 'carb_intake', 'exercise_time', 'weight',
                'insulin_sensitivity_factor', 'insulin_to_carb_ratio',
                'previous_insulin_dose', 'hours_since_last_insulin',
                'is_morning', 'is_afternoon', 'is_evening', 'is_night',
                'is_weekend', 'is_correction_dose'
            ],
            'path': INSULIN_MODEL_PATH,
            'prediction_type': 'regression'
        }
    
    if model_type in ['all', 'glucose']:
        # Glucose model info (30 min)
        info['glucose_model_30min'] = {
            'loaded': glucose_model_30min_loaded,
            'type': 'Random Forest Regressor',
            'features': [
                'current_glucose', 'recent_insulin_dose', 'recent_carb_intake',
                'recent_exercise_intensity', 'recent_exercise_duration',
                'minutes_since_insulin', 'minutes_since_carbs', 'minutes_since_exercise',
                'glucose_lag_1', 'glucose_lag_2', 'glucose_lag_3',
                'glucose_velocity', 'glucose_rolling_mean', 'glucose_rolling_std',
                'hour', 'is_morning', 'is_afternoon', 'is_evening', 'is_night'
            ],
            'path': GLUCOSE_MODEL_30MIN_PATH,
            'prediction_horizon': 30,
            'prediction_type': 'regression'
        }
        
        # Glucose model info (60 min)
        info['glucose_model_60min'] = {
            'loaded': glucose_model_60min_loaded,
            'type': 'Random Forest Regressor',
            'features': [
                'current_glucose', 'recent_insulin_dose', 'recent_carb_intake',
                'recent_exercise_intensity', 'recent_exercise_duration',
                'minutes_since_insulin', 'minutes_since_carbs', 'minutes_since_exercise',
                'glucose_lag_1', 'glucose_lag_2', 'glucose_lag_3',
                'glucose_velocity', 'glucose_rolling_mean', 'glucose_rolling_std',
                'hour', 'is_morning', 'is_afternoon', 'is_evening', 'is_night'
            ],
            'path': GLUCOSE_MODEL_60MIN_PATH,
            'prediction_horizon': 60,
            'prediction_type': 'regression'
        }
    
    return jsonify(info)

@app.errorhandler(404)
def not_found(error) -> Response:
    """Handle 404 errors."""
    return jsonify({
        'error': 'Not found',
        'message': 'The requested endpoint does not exist'
    }), 404

@app.errorhandler(405)
def method_not_allowed(error) -> Response:
    """Handle 405 errors."""
    return jsonify({
        'error': 'Method not allowed',
        'message': 'The method is not allowed for the requested URL'
    }), 405

@app.errorhandler(500)
def internal_server_error(error) -> Response:
    """Handle 500 errors."""
    logger.error(f"Internal server error: {str(error)}")
    return jsonify({
        'error': 'Internal server error',
        'message': 'An internal server error occurred'
    }), 500

if __name__ == '__main__':
    # Get port from environment or use default
    port = int(os.environ.get('PORT', 5002))
    
    # Check if models are loaded
    if not insulin_model_loaded:
        logger.warning("Insulin model not loaded. API will use fallback calculation.")
        
    if not glucose_model_30min_loaded or not glucose_model_60min_loaded:
        logger.warning("One or more glucose models not loaded. API will use fallback calculation.")
    
    logger.info(f"Starting API server on port {port}")
    
    # Run Flask app
    app.run(host='0.0.0.0', port=port, debug=False)