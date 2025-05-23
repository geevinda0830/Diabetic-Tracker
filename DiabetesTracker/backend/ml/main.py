# # ml_model/main.py
# from data_preprocessing import load_data, clean_data
# from feature_engineering import engineer_features
# from model_training import prepare_model_data, train_models
# from model_evaluation import evaluate_model

# def run_pipeline():
#     # File paths
#     file_paths = ['data/1.csv', 'data/2.csv', 'data/3.csv', 
#                  'data/4.csv', 'data/5.csv', 'data/6.csv']
    
#     # Load data
#     print("Loading data...")
#     raw_data = load_data(file_paths)
    
#     # Clean data
#     print("Cleaning data...")
#     cleaned_data = [clean_data(df) for df in raw_data]
    
#     # Feature engineering
#     print("Engineering features...")
#     featured_data = [engineer_features(df) for df in cleaned_data]
    
#     # Prepare for modeling
#     print("Preparing for modeling...")
#     X, y, feature_names = prepare_model_data(featured_data)
    
#     # Train models
#     print("Training models...")
#     model, X_test, y_test = train_models(X, y)
    
#     # Evaluate
#     print("Evaluating model...")
#     metrics = evaluate_model(model, X_test, y_test, feature_names)
    
#     print("Pipeline complete!")
#     return model

# if __name__ == "__main__":
#     run_pipeline()

# main.py
# Main script for diabetes tracking system with ML capabilities

import os
import sys
import argparse
import logging
import glob
import pandas as pd
import numpy as np
from typing import Dict, List, Optional, Union

# Import custom modules
from feature_engineering import DiabetesDataProcessor
from insulin_prediction import InsulinPredictionModel
from glucose_prediction_model import GlucosePredictionModel

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("diabetes_ml.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Define paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, 'data')
RAW_DATA_DIR = os.path.join(DATA_DIR, 'raw')
PROCESSED_DATA_DIR = os.path.join(DATA_DIR, 'processed')
MODELS_DIR = os.path.join(BASE_DIR, 'models')

# Define processed data paths
PROCESSED_GLUCOSE_DATA = os.path.join(PROCESSED_DATA_DIR, 'glucose_data.csv')
PROCESSED_INSULIN_DATA = os.path.join(PROCESSED_DATA_DIR, 'insulin_data.csv')
TRAINING_GLUCOSE_DATA = os.path.join(PROCESSED_DATA_DIR, 'training_glucose_data.csv')
TRAINING_INSULIN_DATA = os.path.join(PROCESSED_DATA_DIR, 'training_insulin_data.csv')

# Define model paths
INSULIN_MODEL_PATH = os.path.join(MODELS_DIR, 'insulin_model.joblib')
GLUCOSE_MODEL_PATH = os.path.join(MODELS_DIR, 'glucose_model.joblib')

def setup_directories() -> None:
    """Create necessary directories for the project."""
    dirs = [DATA_DIR, RAW_DATA_DIR, PROCESSED_DATA_DIR, MODELS_DIR]
    for directory in dirs:
        os.makedirs(directory, exist_ok=True)
        logger.info(f"Created directory: {directory}")

def process_data(data_dir: str = RAW_DATA_DIR, use_example_data: bool = False) -> Dict[str, pd.DataFrame]:
    """
    Process CSV files and create training datasets.
    
    Args:
        data_dir: Directory containing raw CSV files
        use_example_data: Whether to use example data instead of real data
        
    Returns:
        Dictionary with processed datasets
    """
    logger.info("Starting data processing...")
    
    # Create data processor
    processor = DiabetesDataProcessor(output_dir=PROCESSED_DATA_DIR)
    
    if use_example_data:
        logger.info("Using example data")
        # Generate synthetic data
        example_datasets = processor.create_example_dataset()
        glucose_df = example_datasets['glucose']
        insulin_df = example_datasets['insulin']
    else:
        logger.info(f"Processing CSV files from {data_dir}")
        # Get all CSV files
        csv_files = glob.glob(os.path.join(data_dir, '*.csv'))
        
        if not csv_files:
            logger.error(f"No CSV files found in {data_dir}")
            raise FileNotFoundError(f"No CSV files found in {data_dir}")
        
        # Process CSV files
        glucose_df, insulin_df = processor.process_csv_files(csv_files)
    
    # Create training datasets
    datasets = processor.create_training_datasets(glucose_df, insulin_df)
    
    # Save datasets
    paths = processor.save_datasets(datasets, 'training')
    
    logger.info("Data processing completed")
    
    return datasets

def train_models(datasets: Dict[str, pd.DataFrame], tune_hyperparams: bool = False) -> Dict[str, Dict[str, float]]:
    """
    Train glucose and insulin prediction models.
    
    Args:
        datasets: Dictionary with training datasets
        tune_hyperparams: Whether to tune hyperparameters
        
    Returns:
        Dictionary with training results
    """
    results = {}
    
    # Train insulin prediction model if data is available
    if 'insulin' in datasets and not datasets['insulin'].empty:
        logger.info("Training insulin prediction model...")
        
        # Initialize model
        insulin_model = InsulinPredictionModel(model_path=INSULIN_MODEL_PATH)
        
        # Train or tune model
        if tune_hyperparams:
            results['insulin_model'] = insulin_model.tune_hyperparameters(datasets['insulin'])
        else:
            results['insulin_model'] = insulin_model.train(datasets['insulin'])
    else:
        logger.warning("No insulin data available for training")
    
    # Train glucose prediction model if data is available
    if 'glucose' in datasets and not datasets['glucose'].empty:
        logger.info("Training glucose prediction model...")
        
        # Initialize model
        glucose_model = GlucosePredictionModel(model_path=GLUCOSE_MODEL_PATH)
        
        # Train or tune model
        if tune_hyperparams:
            # Train for both 30-min and 60-min predictions
            results['glucose_model_30min'] = glucose_model.tune_hyperparameters(datasets['glucose'], 30)
            
            # Reinitialize with 60-min horizon
            glucose_model = GlucosePredictionModel(model_path=GLUCOSE_MODEL_PATH.replace('.joblib', '_60min.joblib'), prediction_horizon=60)
            results['glucose_model_60min'] = glucose_model.tune_hyperparameters(datasets['glucose'], 60)
        else:
            # Train for both 30-min and 60-min predictions
            results['glucose_model_30min'] = glucose_model.train(datasets['glucose'], 30)
            
            # Reinitialize with 60-min horizon
            glucose_model = GlucosePredictionModel(model_path=GLUCOSE_MODEL_PATH.replace('.joblib', '_60min.joblib'), prediction_horizon=60)
            results['glucose_model_60min'] = glucose_model.train(datasets['glucose'], 60)
    else:
        logger.warning("No glucose data available for training")
    
    logger.info("Model training completed")
    
    return results

def test_insulin_prediction(blood_glucose: float = 180, carb_intake: float = 50, 
                          exercise_time: float = 30, weight: float = 70) -> None:
    """
    Test insulin prediction with sample inputs.
    
    Args:
        blood_glucose: Blood glucose level in mg/dL
        carb_intake: Carbohydrate intake in grams
        exercise_time: Exercise time in minutes
        weight: Weight in kg
    """
    logger.info("Testing insulin prediction...")
    
    # Initialize model
    insulin_model = InsulinPredictionModel(model_path=INSULIN_MODEL_PATH)
    
    # Load model
    model_loaded = insulin_model.load_model()
    
    if not model_loaded:
        logger.warning("Could not load insulin model. Using rule-based calculation.")
    
    # Make prediction
    result = insulin_model.predict(
        blood_glucose=blood_glucose,
        carb_intake=carb_intake,
        exercise_time=exercise_time,
        weight=weight
    )
    
    # Print results
    logger.info(f"Insulin prediction test result: {result}")
    
    print("\n=== Insulin Prediction Test ===")
    print(f"Input: Blood Glucose={blood_glucose} mg/dL, Carbs={carb_intake}g, Exercise={exercise_time} min, Weight={weight} kg")
    print(f"Recommended Insulin Dose: {result['recommendedDosage']} units")
    print(f"Prediction Method: {result['method']}")
    print(f"Confidence: {result['confidence']:.2f}")
    print("\nPrediction Details:")
    for key, value in result['details'].items():
        print(f"  {key}: {value}")
    print("===============================\n")

def test_glucose_prediction(current_glucose: float = 140, insulin_dose: float = 4, 
                          carb_intake: float = 30, exercise_duration: float = 20,
                          exercise_intensity: float = 2, prediction_horizon: int = 60) -> None:
    """
    Test glucose prediction with sample inputs.
    
    Args:
        current_glucose: Current glucose level in mg/dL
        insulin_dose: Insulin dose in units
        carb_intake: Carbohydrate intake in grams
        exercise_duration: Exercise duration in minutes
        exercise_intensity: Exercise intensity (1-3)
        prediction_horizon: Prediction horizon in minutes (30 or 60)
    """
    logger.info(f"Testing glucose prediction for {prediction_horizon} min horizon...")
    
    # Select model path based on prediction horizon
    model_path = GLUCOSE_MODEL_PATH if prediction_horizon == 30 else GLUCOSE_MODEL_PATH.replace('.joblib', '_60min.joblib')
    
    # Initialize model
    glucose_model = GlucosePredictionModel(model_path=model_path, prediction_horizon=prediction_horizon)
    
    # Load model
    model_loaded = glucose_model.load_model()
    
    if not model_loaded:
        logger.warning("Could not load glucose model. Using rule-based calculation.")
    
    # Make prediction
    result = glucose_model.predict(
        current_glucose=current_glucose,
        insulin_dose=insulin_dose,
        carb_intake=carb_intake,
        exercise_duration=exercise_duration,
        exercise_intensity=exercise_intensity
    )
    
    # Print results
    logger.info(f"Glucose prediction test result: {result}")
    
    print(f"\n=== Glucose Prediction Test ({prediction_horizon} min) ===")
    print(f"Input: Current Glucose={current_glucose} mg/dL, Insulin={insulin_dose} units, Carbs={carb_intake}g")
    print(f"       Exercise: {exercise_duration} min at intensity {exercise_intensity}")
    print(f"Predicted Glucose: {result['predictedGlucose']} mg/dL")
    print(f"Prediction Method: {result['method']}")
    print("\nPrediction Details:")
    for key, value in result['details'].items():
        print(f"  {key}: {value}")
    print("===============================\n")

def start_api_server(port: int = 5002) -> None:
    """
    Start the Flask API server.
    
    Args:
        port: Port to run the server on
    """
    logger.info(f"Starting API server on port {port}...")
    
    try:
        # Import API module
        from api import app
        
        # Set environment variables
        os.environ['PORT'] = str(port)
        
        # Run Flask app
        app.run(host='0.0.0.0', port=port, debug=False)
    except Exception as e:
        logger.error(f"Error starting API server: {str(e)}")
        sys.exit(1)

def main() -> None:
    """Main function to run the diabetes tracking system."""
    # Parse command line arguments
    parser = argparse.ArgumentParser(description='Diabetes Tracking System with ML')
    
    # Data processing arguments
    parser.add_argument('--process', action='store_true', help='Process raw data')
    parser.add_argument('--data-dir', type=str, default=RAW_DATA_DIR, help='Directory with raw CSV files')
    parser.add_argument('--example-data', action='store_true', help='Use example data instead of real data')
    
    # Model training arguments
    parser.add_argument('--train', action='store_true', help='Train prediction models')
    parser.add_argument('--tune', action='store_true', help='Tune model hyperparameters')
    
    # Model testing arguments
    parser.add_argument('--test-insulin', action='store_true', help='Test insulin prediction')
    parser.add_argument('--test-glucose', action='store_true', help='Test glucose prediction')
    
    # API server arguments
    parser.add_argument('--api', action='store_true', help='Start API server')
    parser.add_argument('--port', type=int, default=5002, help='API server port')
    
    # Parse arguments
    args = parser.parse_args()
    
    # Setup directories
    setup_directories()
    
    # Process data if requested
    datasets = None
    if args.process:
        datasets = process_data(args.data_dir, args.example_data)
    
    # Train models if requested
    if args.train:
        if datasets is None:
            # Try to load processed data
            try:
                datasets = {}
                if os.path.exists(TRAINING_GLUCOSE_DATA):
                    datasets['glucose'] = pd.read_csv(TRAINING_GLUCOSE_DATA)
                    logger.info(f"Loaded glucose data from {TRAINING_GLUCOSE_DATA}")
                
                if os.path.exists(TRAINING_INSULIN_DATA):
                    datasets['insulin'] = pd.read_csv(TRAINING_INSULIN_DATA)
                    logger.info(f"Loaded insulin data from {TRAINING_INSULIN_DATA}")
                
                if not datasets:
                    logger.warning("No processed data found. Using example data.")
                    processor = DiabetesDataProcessor(output_dir=PROCESSED_DATA_DIR)
                    example_datasets = processor.create_example_dataset()
                    datasets = processor.create_training_datasets(example_datasets['glucose'], example_datasets['insulin'])
            except Exception as e:
                logger.error(f"Error loading processed data: {str(e)}")
                logger.warning("Using example data for training.")
                processor = DiabetesDataProcessor(output_dir=PROCESSED_DATA_DIR)
                example_datasets = processor.create_example_dataset()
                datasets = processor.create_training_datasets(example_datasets['glucose'], example_datasets['insulin'])
        
        # Train models
        train_models(datasets, args.tune)
    
    # Test insulin prediction if requested
    if args.test_insulin:
        test_insulin_prediction()
    
    # Test glucose prediction if requested
    if args.test_glucose:
        test_glucose_prediction(prediction_horizon=30)
        test_glucose_prediction(prediction_horizon=60)
    
    # Start API server if requested
    if args.api:
        start_api_server(args.port)
    
    # If no action specified, provide usage information
    if not any([args.process, args.train, args.test_insulin, args.test_glucose, args.api]):
        parser.print_help()
        print("\nExample usage:")
        print("  # Process real data and train models")
        print("  python main.py --process --train")
        print()
        print("  # Use example data and train models")
        print("  python main.py --process --example-data --train")
        print()
        print("  # Start API server")
        print("  python main.py --api --port 5002")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        logger.info("Program interrupted by user")
        sys.exit(0)
    except Exception as e:
        logger.error(f"Unhandled exception: {str(e)}", exc_info=True)
        sys.exit(1)