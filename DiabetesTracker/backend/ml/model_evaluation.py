# model_evaluation.py
# Script to evaluate trained models

import os
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from insulin_prediction import InsulinPredictionModel
from glucose_prediction_model import GlucosePredictionModel

def evaluate_insulin_model(test_data_path=None):
    """
    Evaluate insulin prediction model on test data.
    
    Args:
        test_data_path: Path to test data CSV
        
    Returns:
        Dictionary with evaluation metrics
    """
    # Load insulin model
    insulin_model = InsulinPredictionModel()
    model_loaded = insulin_model.load_model()
    
    if not model_loaded:
        print("Insulin model not found. Training a new model with example data...")
        
        # Create synthetic example data
        np.random.seed(42)
        n_samples = 100
        
        blood_glucose = np.random.uniform(70, 300, n_samples)
        carb_intake = np.random.uniform(0, 100, n_samples)
        exercise_time = np.random.uniform(0, 60, n_samples)
        weight = np.random.uniform(50, 100, n_samples)
        
        # Calculate target based on rule-based calculation
        target_glucose = 120
        glucose_difference = blood_glucose - target_glucose
        glucose_adjustment = np.where(
            glucose_difference > 0,
            np.ceil(glucose_difference / 30),
            np.floor(glucose_difference / 30)
        )
        carb_effect = carb_intake / 10
        exercise_reduction = exercise_time * 0.2
        insulin_dosage = np.maximum(0, glucose_adjustment + carb_effect - exercise_reduction)
        
        # Add some noise
        insulin_dosage += np.random.normal(0, 0.5, n_samples)
        
        # Train model
        insulin_model.train(blood_glucose, carb_intake, exercise_time, weight, insulin_dosage)
    
    # Use provided test data or create test data
    if test_data_path and os.path.exists(test_data_path):
        test_df = pd.read_csv(test_data_path)
        
        # Extract test features
        blood_glucose = test_df['blood_glucose'].values
        carb_intake = test_df['carb_intake'].values
        exercise_time = test_df['exercise_duration'].values if 'exercise_duration' in test_df.columns else test_df['exercise_time'].values
        weight = test_df['weight'].values
        actual_insulin = test_df['insulin_dosage'].values
    else:
        # Create synthetic test data
        np.random.seed(43)  # Different seed for test data
        n_samples = 50
        
        blood_glucose = np.random.uniform(70, 300, n_samples)
        carb_intake = np.random.uniform(0, 100, n_samples)
        exercise_time = np.random.uniform(0, 60, n_samples)
        weight = np.random.uniform(50, 100, n_samples)
        
        # Calculate target based on rule-based calculation
        target_glucose = 120
        glucose_difference = blood_glucose - target_glucose
        glucose_adjustment = np.where(
            glucose_difference > 0,
            np.ceil(glucose_difference / 30),
            np.floor(glucose_difference / 30)
        )
        carb_effect = carb_intake / 10
        exercise_reduction = exercise_time * 0.2
        actual_insulin = np.maximum(0, glucose_adjustment + carb_effect - exercise_reduction)
        
        # Add some noise
        actual_insulin += np.random.normal(0, 0.5, n_samples)
    
    # Make predictions
    predicted_insulin = []
    for i in range(len(blood_glucose)):
        prediction = insulin_model.predict(
            # blood_glucose[i], carb_intake[i], exercise_time[i], weight[i]
            blood_glucose=blood_glucose[i], 
       carb_intake=carb_intake[i], 
       exercise_time=exercise_time[i], 
       weight=weight[i]
        )
        predicted_insulin.append(prediction['recommendedDosage'])
    
    predicted_insulin = np.array(predicted_insulin)
    
    # Calculate metrics
    mae = mean_absolute_error(actual_insulin, predicted_insulin)
    rmse = np.sqrt(mean_squared_error(actual_insulin, predicted_insulin))
    r2 = r2_score(actual_insulin, predicted_insulin)
    
    # Create visualization
    plt.figure(figsize=(10, 6))
    plt.scatter(actual_insulin, predicted_insulin, alpha=0.7)
    plt.plot([min(actual_insulin), max(actual_insulin)], 
             [min(actual_insulin), max(actual_insulin)], 
             'r--', linewidth=2)
    plt.xlabel('Actual Insulin Dosage (units)')
    plt.ylabel('Predicted Insulin Dosage (units)')
    plt.title('Insulin Prediction Model Evaluation')
    plt.grid(True, linestyle='--', alpha=0.7)
    
    # Add metrics to plot
    plt.text(0.05, 0.95, f'MAE: {mae:.2f} units\nRMSE: {rmse:.2f} units\nR²: {r2:.2f}',
             transform=plt.gca().transAxes, fontsize=12,
             verticalalignment='top', bbox=dict(boxstyle='round', alpha=0.1))
    
    # Save plot
    os.makedirs('evaluation', exist_ok=True)
    plt.savefig('evaluation/insulin_model_evaluation.png')
    plt.close()
    
    # Print metrics
    print(f"Insulin Model Evaluation:")
    print(f"MAE: {mae:.2f} units")
    print(f"RMSE: {rmse:.2f} units")
    print(f"R²: {r2:.2f}")
    
    # Calculate clinical metrics
    within_0_5_units = np.mean(np.abs(actual_insulin - predicted_insulin) <= 0.5) * 100
    within_1_unit = np.mean(np.abs(actual_insulin - predicted_insulin) <= 1.0) * 100
    
    print(f"Predictions within 0.5 units: {within_0_5_units:.1f}%")
    print(f"Predictions within 1.0 unit: {within_1_unit:.1f}%")
    
    return {
        'mae': mae,
        'rmse': rmse,
        'r2': r2,
        'within_0_5_units': within_0_5_units,
        'within_1_unit': within_1_unit
    }

def evaluate_glucose_model(test_data_path=None):
    """
    Evaluate glucose prediction model on test data.
    
    Args:
        test_data_path: Path to test data CSV
        
    Returns:
        Dictionary with evaluation metrics
    """
    # Load glucose model
    glucose_model = GlucosePredictionModel()
    model_loaded = glucose_model.load_model()
    
    if not model_loaded:
        print("Glucose model not found. Training a new model with example data...")
        
        # Create synthetic example data
        np.random.seed(42)
        n_samples = 100
        
        current_glucose = np.random.uniform(70, 300, n_samples)
        insulin_dose = np.random.uniform(0, 15, n_samples)
        carb_intake = np.random.uniform(0, 100, n_samples)
        exercise_duration = np.random.uniform(0, 60, n_samples)
        exercise_intensity = np.random.randint(1, 4, n_samples)
        
        # Calculate target based on rule-based calculation
        insulin_effect = insulin_dose * -3
        carb_effect = carb_intake * 0.2
        exercise_effect = exercise_duration * exercise_intensity * -0.1
        future_glucose = current_glucose + insulin_effect + carb_effect + exercise_effect
        
        # Add some noise
        future_glucose += np.random.normal(0, 15, n_samples)
        
        # Ensure glucose is in reasonable range
        future_glucose = np.maximum(40, np.minimum(400, future_glucose))
        
        # Train model
        glucose_model.train(
            current_glucose, insulin_dose, carb_intake,
            exercise_duration, exercise_intensity, future_glucose
        )
    
    # Use provided test data or create test data
    if test_data_path and os.path.exists(test_data_path):
        test_df = pd.read_csv(test_data_path)
        
        # Extract test features
        current_glucose = test_df['current_glucose'].values
        insulin_dose = test_df['insulin_dose'].values
        carb_intake = test_df['carb_intake'].values
        exercise_duration = test_df['exercise_duration'].values
        exercise_intensity = test_df['exercise_intensity'].values
        actual_glucose = test_df['future_glucose'].values
    else:
        # Create synthetic test data
        np.random.seed(43)  # Different seed for test data
        n_samples = 50
        
        current_glucose = np.random.uniform(70, 300, n_samples)
        insulin_dose = np.random.uniform(0, 15, n_samples)
        carb_intake = np.random.uniform(0, 100, n_samples)
        exercise_duration = np.random.uniform(0, 60, n_samples)
        exercise_intensity = np.random.randint(1, 4, n_samples)
        
        # Calculate target based on rule-based calculation
        insulin_effect = insulin_dose * -3
        carb_effect = carb_intake * 0.2
        exercise_effect = exercise_duration * exercise_intensity * -0.1
        actual_glucose = current_glucose + insulin_effect + carb_effect + exercise_effect
        
        # Add some noise
        actual_glucose += np.random.normal(0, 15, n_samples)
        
        # Ensure glucose is in reasonable range
        actual_glucose = np.maximum(40, np.minimum(400, actual_glucose))
    
    # Make predictions
    predicted_glucose = []
    for i in range(len(current_glucose)):
        prediction = glucose_model.predict(
            current_glucose[i], insulin_dose[i], carb_intake[i],
            exercise_duration[i], exercise_intensity[i]
        )
        predicted_glucose.append(prediction['predictedGlucose'])
    
    predicted_glucose = np.array(predicted_glucose)
    
    # Calculate metrics
    mae = mean_absolute_error(actual_glucose, predicted_glucose)
    rmse = np.sqrt(mean_squared_error(actual_glucose, predicted_glucose))
    r2 = r2_score(actual_glucose, predicted_glucose)
    
    # Create visualization
    plt.figure(figsize=(10, 6))
    plt.scatter(actual_glucose, predicted_glucose, alpha=0.7)
    plt.plot([min(actual_glucose), max(actual_glucose)], 
             [min(actual_glucose), max(actual_glucose)], 
             'r--', linewidth=2)
    plt.xlabel('Actual Glucose Level (mg/dL)')
    plt.ylabel('Predicted Glucose Level (mg/dL)')
    plt.title('Glucose Prediction Model Evaluation')
    plt.grid(True, linestyle='--', alpha=0.7)
    
    # Add metrics to plot
    plt.text(0.05, 0.95, f'MAE: {mae:.2f} mg/dL\nRMSE: {rmse:.2f} mg/dL\nR²: {r2:.2f}',
             transform=plt.gca().transAxes, fontsize=12,
             verticalalignment='top', bbox=dict(boxstyle='round', alpha=0.1))
    
    # Save plot
    os.makedirs('evaluation', exist_ok=True)
    plt.savefig('evaluation/glucose_model_evaluation.png')
    plt.close()
    
    # Print metrics
    print(f"Glucose Model Evaluation:")
    print(f"MAE: {mae:.2f} mg/dL")
    print(f"RMSE: {rmse:.2f} mg/dL")
    print(f"R²: {r2:.2f}")
    
    # Calculate clinical metrics
    within_20_mgdl = np.mean(np.abs(actual_glucose - predicted_glucose) <= 20) * 100
    within_30_mgdl = np.mean(np.abs(actual_glucose - predicted_glucose) <= 30) * 100
    
    print(f"Predictions within 20 mg/dL: {within_20_mgdl:.1f}%")
    print(f"Predictions within 30 mg/dL: {within_30_mgdl:.1f}%")
    
    return {
        'mae': mae,
        'rmse': rmse,
        'r2': r2,
        'within_20_mgdl': within_20_mgdl,
        'within_30_mgdl': within_30_mgdl
    }

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='Evaluate diabetes prediction models')
    parser.add_argument('--insulin', action='store_true', help='Evaluate insulin model')
    parser.add_argument('--glucose', action='store_true', help='Evaluate glucose model')
    parser.add_argument('--insulin-test', type=str, help='Path to insulin test data CSV')
    parser.add_argument('--glucose-test', type=str, help='Path to glucose test data CSV')
    
    args = parser.parse_args()
    
    if args.insulin or (not args.insulin and not args.glucose):
        insulin_results = evaluate_insulin_model(args.insulin_test)
    
    if args.glucose or (not args.insulin and not args.glucose):
        glucose_results = evaluate_glucose_model(args.glucose_test)