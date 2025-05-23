# glucose_prediction_model.py
# Enhanced ML model for glucose level prediction with time series analysis

import os
import math
import logging
import pickle
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, List, Tuple, Optional, Union

# Machine learning imports
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler, OneHotEncoder, MinMaxScaler, PolynomialFeatures
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.model_selection import train_test_split, GridSearchCV, TimeSeriesSplit
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import joblib

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("glucose_model.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Define paths
MODEL_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'models')
MODEL_PATH = os.path.join(MODEL_DIR, 'glucose_model.joblib')
SCALER_PATH = os.path.join(MODEL_DIR, 'glucose_scaler.joblib')
FEATURE_IMPORTANCE_PATH = os.path.join(MODEL_DIR, 'glucose_feature_importance.csv')

class GlucosePredictionModel:
    """Advanced machine learning model for glucose level prediction."""
    
    def __init__(self, model_path: str = MODEL_PATH, scaler_path: str = SCALER_PATH,
                 prediction_horizon: int = 60):
        """
        Initialize the glucose prediction model.
        
        Args:
            model_path: Path to save/load the model
            scaler_path: Path to save/load the scaler
            prediction_horizon: Time horizon to predict in minutes (default: 60)
        """
        self.model_path = model_path
        self.scaler_path = scaler_path
        self.prediction_horizon = prediction_horizon
        self.model = None
        self.pipeline = None
        self.feature_names = None
        self.feature_importances = None
        self.is_trained = False
        
        # Define feature groups
        self.time_features = [
            'hour', 'day_of_week', 'is_morning', 'is_afternoon', 
            'is_evening', 'is_night', 'is_weekend'
        ]
        
        self.glucose_features = [
            'current_glucose', 'glucose_lag_1', 'glucose_lag_2', 'glucose_lag_3',
            'glucose_velocity', 'glucose_rolling_mean', 'glucose_rolling_std'
        ]
        
        self.insulin_features = [
            'recent_insulin_dose', 'minutes_since_insulin', 'active_insulin'
        ]
        
        self.carb_features = [
            'recent_carb_intake', 'minutes_since_carbs', 'active_carbs'
        ]
        
        self.exercise_features = [
            'recent_exercise_intensity', 'recent_exercise_duration',
            'minutes_since_exercise'
        ]
        
        self.patient_features = [
            'weight', 'insulin_sensitivity_factor', 'insulin_to_carb_ratio'
        ]
        
        # Aggregate all feature groups
        self.all_features = (
            self.time_features + 
            self.glucose_features + 
            self.insulin_features + 
            self.carb_features + 
            self.exercise_features + 
            self.patient_features
        )
        
        # Create model directory if it doesn't exist
        os.makedirs(os.path.dirname(self.model_path), exist_ok=True)
    
    def build_pipeline(self) -> Pipeline:
        """
        Build the ML pipeline with preprocessing steps.
        
        Returns:
            Scikit-learn pipeline
        """
        # Create feature groups for pipeline
        categorical_features = [
            'is_morning', 'is_afternoon', 'is_evening', 'is_night', 'is_weekend'
        ]
        
        numerical_features = [f for f in self.all_features if f not in categorical_features]
        
        # Get available features
        available_numerical = [f for f in numerical_features if f in self.feature_names]
        available_categorical = [f for f in categorical_features if f in self.feature_names]
        
        # Create preprocessors for different feature types
        numerical_transformer = Pipeline(steps=[
            ('scaler', StandardScaler())
        ])
        
        categorical_transformer = Pipeline(steps=[
            ('onehot', OneHotEncoder(handle_unknown='ignore'))
        ])
        
        # Column transformer to apply different preprocessing to different feature types
        transformers = []
        
        if available_numerical:
            transformers.append(('num', numerical_transformer, available_numerical))
            
        if available_categorical:
            transformers.append(('cat', categorical_transformer, available_categorical))
        
        if not transformers:
            logger.error("No valid features available for preprocessing")
            raise ValueError("No valid features available for preprocessing")
            
        preprocessor = ColumnTransformer(transformers=transformers)
        
        # Create the full pipeline with random forest regressor
        # Random Forest works well for glucose prediction due to its ability to
        # capture non-linear relationships and feature interactions
        pipeline = Pipeline(steps=[
            ('preprocessor', preprocessor),
            ('poly', PolynomialFeatures(degree=2, include_bias=False, interaction_only=True)),
            ('regressor', RandomForestRegressor(
                n_estimators=100,
                max_depth=15,
                min_samples_split=5,
                min_samples_leaf=2,
                random_state=42,
                n_jobs=-1
            ))
        ])
        
        return pipeline
    
    def preprocess_data(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Preprocess the data for training or prediction.
        
        Args:
            df: DataFrame with features
            
        Returns:
            Preprocessed DataFrame
        """
        # Create a copy to avoid modifying the original
        df_copy = df.copy()
        
        # Add time-based features if hour is available
        if 'hour' in df_copy.columns:
            # Add time of day category if not present
            if 'is_morning' not in df_copy.columns:
                df_copy['is_morning'] = ((df_copy['hour'] >= 5) & (df_copy['hour'] <= 11)).astype(int)
            if 'is_afternoon' not in df_copy.columns:
                df_copy['is_afternoon'] = ((df_copy['hour'] >= 12) & (df_copy['hour'] <= 17)).astype(int)
            if 'is_evening' not in df_copy.columns:
                df_copy['is_evening'] = ((df_copy['hour'] >= 18) & (df_copy['hour'] <= 23)).astype(int)
            if 'is_night' not in df_copy.columns:
                df_copy['is_night'] = ((df_copy['hour'] >= 0) & (df_copy['hour'] <= 4)).astype(int)
        else:
            # Default to zeros if hour not available
            for time_feature in ['is_morning', 'is_afternoon', 'is_evening', 'is_night']:
                if time_feature not in df_copy.columns:
                    df_copy[time_feature] = 0
                    
        # Add weekend indicator if day_of_week is available
        if 'day_of_week' in df_copy.columns and 'is_weekend' not in df_copy.columns:
            df_copy['is_weekend'] = df_copy['day_of_week'].isin([5, 6]).astype(int)
        elif 'is_weekend' not in df_copy.columns:
            df_copy['is_weekend'] = 0
        
        # Calculate active insulin if needed data is available
        if ('recent_insulin_dose' in df_copy.columns and 
            'minutes_since_insulin' in df_copy.columns and
            'active_insulin' not in df_copy.columns):
            
            # Calculate active insulin using a biexponential model
            def calc_active_insulin(row):
                dose = row['recent_insulin_dose']
                minutes = row['minutes_since_insulin']
                
                if pd.isna(dose) or pd.isna(minutes) or dose == 0 or minutes >= 300:  # 5 hours
                    return 0.0
                
                # Biexponential model for insulin action
                peak_time = 75  # minutes
                duration = 300  # minutes
                
                if minutes < peak_time:
                    # Rising phase
                    activity = (minutes / peak_time) * np.exp(-(minutes - peak_time) / 50)
                else:
                    # Falling phase
                    activity = np.exp(-(minutes - peak_time) / 50)
                
                # Scale by dose
                return dose * activity
            
            df_copy['active_insulin'] = df_copy.apply(calc_active_insulin, axis=1)
        
        # Calculate active carbs if needed data is available
        if ('recent_carb_intake' in df_copy.columns and 
            'minutes_since_carbs' in df_copy.columns and
            'active_carbs' not in df_copy.columns):
            
            # Calculate active carbs using a model of carb absorption
            def calc_active_carbs(row):
                carbs = row['recent_carb_intake']
                minutes = row['minutes_since_carbs']
                
                if pd.isna(carbs) or pd.isna(minutes) or carbs == 0 or minutes >= 240:  # 4 hours
                    return 0.0
                
                # Carb absorption model
                peak_time = 30  # minutes
                duration = 240  # minutes
                
                if minutes < peak_time:
                    # Rising phase (linear)
                    activity = minutes / peak_time
                elif minutes < duration:
                    # Falling phase (exponential)
                    activity = np.exp(-(minutes - peak_time) / 150)
                else:
                    activity = 0
                
                # Scale by carbs
                return carbs * activity
            
            df_copy['active_carbs'] = df_copy.apply(calc_active_carbs, axis=1)
        
        # Handle missing values for all features
        for feature in self.all_features:
            if feature in df_copy.columns and df_copy[feature].isna().any():
                if feature in self.glucose_features:
                    # For glucose features, use forward fill then backward fill
                    df_copy[feature] = df_copy[feature].fillna(method='ffill').fillna(method='bfill')
                elif feature in self.time_features:
                    # For categorical time features, fill with 0
                    df_copy[feature] = df_copy[feature].fillna(0)
                else:
                    # For other features, fill with 0
                    df_copy[feature] = df_copy[feature].fillna(0)
        
        return df_copy
    
    def extract_features_and_target(self, df: pd.DataFrame, prediction_horizon: int = None) -> Tuple[pd.DataFrame, Optional[pd.Series]]:
        """
        Extract features and target from the DataFrame.
        
        Args:
            df: Input DataFrame
            prediction_horizon: Time horizon to predict in minutes
            
        Returns:
            Tuple of (features DataFrame, target Series or None)
        """
        # Use instance prediction horizon if not specified
        prediction_horizon = prediction_horizon or self.prediction_horizon
        
        # Determine target column based on prediction horizon
        if prediction_horizon == 30:
            target_col = 'glucose_future_30min'
        else:  # Default to 60 min
            target_col = 'glucose_future_60min'
        
        # Check for target column
        has_target = target_col in df.columns and not df[target_col].isna().all()
        
        # Get available features
        available_features = [f for f in self.all_features if f in df.columns]
        
        if not available_features:
            logger.error("No valid features found in DataFrame")
            raise ValueError("No valid features found in DataFrame")
        
        # Extract features
        X = df[available_features]
        
        # Extract target if available
        y = df[target_col] if has_target else None
        
        # Save feature names
        self.feature_names = available_features
        
        return X, y
    
    def train(self, df: pd.DataFrame, prediction_horizon: int = None) -> Dict[str, float]:
        """
        Train the glucose prediction model.
        
        Args:
            df: DataFrame with features and target
            prediction_horizon: Time horizon to predict in minutes
            
        Returns:
            Dictionary with training metrics
        """
        logger.info("Training glucose prediction model")
        
        # Use instance prediction horizon if not specified
        prediction_horizon = prediction_horizon or self.prediction_horizon
        logger.info(f"Training for prediction horizon of {prediction_horizon} minutes")
        
        # Preprocess data
        df_processed = self.preprocess_data(df)
        
        # Extract features and target
        X, y = self.extract_features_and_target(df_processed, prediction_horizon)
        
        if y is None:
            logger.error("No target variable found for training")
            raise ValueError("No target variable found for training")
        
        logger.info(f"Training with {len(X)} samples and {len(X.columns)} features")
        
        # Train-test split with time ordering if timestamp is available
        if 'timestamp' in df_processed.columns:
            # Sort by timestamp for proper time series split
            df_processed = df_processed.sort_values('timestamp')
            X = df_processed[X.columns]
            y = df_processed[y.name]
            
            # Use a proper time series split
            train_size = int(len(X) * 0.8)
            X_train, X_test = X.iloc[:train_size], X.iloc[train_size:]
            y_train, y_test = y.iloc[:train_size], y.iloc[train_size:]
        else:
            # Regular train-test split if no timestamp
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=0.2, random_state=42
            )
        
        # Build pipeline
        self.pipeline = self.build_pipeline()
        
        # Train the model
        self.pipeline.fit(X_train, y_train)
        
        # Evaluate on test set
        y_pred = self.pipeline.predict(X_test)
        
        # Calculate metrics
        mae = mean_absolute_error(y_test, y_pred)
        rmse = np.sqrt(mean_squared_error(y_test, y_pred))
        r2 = r2_score(y_test, y_pred)
        
        # Calculate clinical metrics
        within_20 = np.mean(np.abs(y_test - y_pred) <= 20) * 100  # % within 20 mg/dL
        within_30 = np.mean(np.abs(y_test - y_pred) <= 30) * 100  # % within 30 mg/dL
        
        # Extract feature importances
        try:
            # Get feature names after one-hot encoding
            feature_names = self.get_feature_names_from_pipeline()
            
            # Get feature importances from the regressor
            importances = self.pipeline.named_steps['regressor'].feature_importances_
            
            # Create DataFrame with feature importances
            if len(feature_names) == len(importances):
                feature_importance_df = pd.DataFrame({
                    'feature': feature_names,
                    'importance': importances
                }).sort_values('importance', ascending=False)
                
                # Save feature importances
                os.makedirs(os.path.dirname(FEATURE_IMPORTANCE_PATH), exist_ok=True)
                feature_importance_df.to_csv(FEATURE_IMPORTANCE_PATH, index=False)
                
                self.feature_importances = feature_importance_df
                logger.info(f"Top 5 important features: {feature_importance_df.head(5).to_dict('records')}")
        except Exception as e:
            logger.warning(f"Could not extract feature importances: {str(e)}")
        
        # Save the model
        self.save_model()
        
        self.is_trained = True
        
        # Return metrics
        metrics = {
            'mae': mae,
            'rmse': rmse,
            'r2': r2,
            'within_20_mgdl': within_20,
            'within_30_mgdl': within_30,
            'samples': len(X),
            'features': len(X.columns),
            'prediction_horizon': prediction_horizon
        }
        
        logger.info(f"Training metrics: {metrics}")
        
        return metrics
    
    def get_feature_names_from_pipeline(self) -> List[str]:
        """
        Get feature names after preprocessing.
        
        Returns:
            List of feature names
        """
        # Get the preprocessor
        preprocessor = self.pipeline.named_steps['preprocessor']
        
        # Get all transformers
        transformers = preprocessor.transformers_
        
        # Collect all feature names
        feature_names = []
        
        for name, trans, cols in transformers:
            if name == 'num':
                # Numerical features - names don't change
                feature_names.extend(cols)
            elif name == 'cat':
                # Categorical features - get one-hot encoder feature names
                try:
                    # Get the one-hot encoder
                    ohe = trans.named_steps['onehot']
                    # Get categories
                    categories = ohe.categories_
                    # Generate feature names
                    for i, col in enumerate(cols):
                        for cat in categories[i]:
                            feature_names.append(f"{col}_{cat}")
                except Exception as e:
                    logger.warning(f"Could not get one-hot encoder feature names: {str(e)}")
                    # Fallback to generic names
                    feature_names.extend([f"{col}_encoded" for col in cols])
        
        return feature_names
    
    def tune_hyperparameters(self, df: pd.DataFrame, prediction_horizon: int = None) -> Dict[str, float]:
        """
        Tune hyperparameters using grid search.
        
        Args:
            df: DataFrame with features and target
            prediction_horizon: Time horizon to predict in minutes
            
        Returns:
            Dictionary with best parameters and metrics
        """
        logger.info("Tuning hyperparameters for glucose prediction model")
        
        # Use instance prediction horizon if not specified
        prediction_horizon = prediction_horizon or self.prediction_horizon
        
        # Preprocess data
        df_processed = self.preprocess_data(df)
        
        # Extract features and target
        X, y = self.extract_features_and_target(df_processed, prediction_horizon)
        
        if y is None:
            logger.error("No target variable found for hyperparameter tuning")
            raise ValueError("No target variable found for hyperparameter tuning")
        
        # Build base pipeline
        self.pipeline = self.build_pipeline()
        
        # Define parameter grid
        param_grid = {
            'regressor__n_estimators': [50, 100, 200],
            'regressor__max_depth': [10, 15, 20],
            'regressor__min_samples_split': [2, 5, 10],
            'regressor__min_samples_leaf': [1, 2, 4]
        }
        
        # Set up time series cross-validation
        if 'timestamp' in df_processed.columns:
            cv = TimeSeriesSplit(n_splits=5)
        else:
            cv = 5  # Regular 5-fold cross-validation
        
        # Create grid search
        grid_search = GridSearchCV(
            self.pipeline,
            param_grid,
            cv=cv,
            scoring='neg_mean_absolute_error',
            n_jobs=-1,
            verbose=1
        )
        
        # Fit grid search
        grid_search.fit(X, y)
        
        # Get best parameters
        best_params = grid_search.best_params_
        best_score = -grid_search.best_score_  # Convert back to MAE
        
        logger.info(f"Best parameters: {best_params}")
        logger.info(f"Best cross-validation MAE: {best_score:.4f}")
        
        # Update pipeline with best parameters
        self.pipeline = grid_search.best_estimator_
        
        # Train on full dataset
        self.pipeline.fit(X, y)
        
        # Save model
        self.save_model()
        
        self.is_trained = True
        
        # Return results
        return {
            'best_params': best_params,
            'best_cv_mae': best_score,
            'samples': len(X),
            'features': len(X.columns),
            'prediction_horizon': prediction_horizon
        }
    
    def save_model(self) -> None:
        """Save the trained model and preprocessing pipeline to disk."""
        try:
            os.makedirs(os.path.dirname(self.model_path), exist_ok=True)
            joblib.dump(self.pipeline, self.model_path)
            logger.info(f"Model saved to {self.model_path}")
        except Exception as e:
            logger.error(f"Error saving model: {str(e)}")
    
    def load_model(self) -> bool:
        """
        Load a trained model from disk.
        
        Returns:
            True if model loaded successfully, False otherwise
        """
        try:
            if os.path.exists(self.model_path):
                self.pipeline = joblib.load(self.model_path)
                self.is_trained = True
                logger.info(f"Model loaded from {self.model_path}")
                return True
            else:
                logger.warning(f"Model file not found at {self.model_path}")
                return False
        except Exception as e:
            logger.error(f"Error loading model: {str(e)}")
            return False
    
    def predict(self, current_glucose: float, insulin_dose: float = 0, 
                carb_intake: float = 0, exercise_duration: float = 0, 
                exercise_intensity: float = 0, **kwargs) -> Dict[str, Union[float, Dict[str, float]]]:
        """
        Predict future glucose level.
        
        Args:
            current_glucose: Current glucose level (mg/dL)
            insulin_dose: Recent insulin dose (units)
            carb_intake: Recent carb intake (grams)
            exercise_duration: Recent exercise duration (minutes)
            exercise_intensity: Recent exercise intensity (1-3)
            **kwargs: Additional features
            
        Returns:
            Dictionary with prediction results
        """
        # Try to load model if not trained
        if not self.is_trained and not self.load_model():
            logger.warning("Model not trained. Using fallback calculation.")
            return self._rule_based_calculation(
                current_glucose, insulin_dose, carb_intake, 
                exercise_duration, exercise_intensity
            )
        
        try:
            # Create input data for prediction
            input_data = {
                'current_glucose': current_glucose,
                'recent_insulin_dose': insulin_dose,
                'recent_carb_intake': carb_intake,
                'recent_exercise_duration': exercise_duration,
                'recent_exercise_intensity': exercise_intensity
            }
            
            # Add time-based features if available
            if 'hour' in kwargs:
                hour = kwargs['hour']
                input_data['hour'] = hour
                input_data['is_morning'] = 1 if 5 <= hour <= 11 else 0
                input_data['is_afternoon'] = 1 if 12 <= hour <= 17 else 0
                input_data['is_evening'] = 1 if 18 <= hour <= 23 else 0
                input_data['is_night'] = 1 if 0 <= hour <= 4 else 0
            
            # Add time since events if available
            if 'minutes_since_insulin' in kwargs:
                input_data['minutes_since_insulin'] = kwargs['minutes_since_insulin']
            elif insulin_dose > 0:
                input_data['minutes_since_insulin'] = 0  # Just taken
            else:
                input_data['minutes_since_insulin'] = 300  # Default to 5 hours
                
            if 'minutes_since_carbs' in kwargs:
                input_data['minutes_since_carbs'] = kwargs['minutes_since_carbs']
            elif carb_intake > 0:
                input_data['minutes_since_carbs'] = 0  # Just eaten
            else:
                input_data['minutes_since_carbs'] = 240  # Default to 4 hours
                
            if 'minutes_since_exercise' in kwargs:
                input_data['minutes_since_exercise'] = kwargs['minutes_since_exercise']
            elif exercise_duration > 0:
                input_data['minutes_since_exercise'] = 0  # Just exercised
            else:
                input_data['minutes_since_exercise'] = 360  # Default to 6 hours
            
            # Add trending data if available
            if 'glucose_lag_1' in kwargs:
                input_data['glucose_lag_1'] = kwargs['glucose_lag_1']
            else:
                input_data['glucose_lag_1'] = current_glucose
                
            if 'glucose_lag_2' in kwargs:
                input_data['glucose_lag_2'] = kwargs['glucose_lag_2']
            else:
                input_data['glucose_lag_2'] = current_glucose
                
            if 'glucose_lag_3' in kwargs:
                input_data['glucose_lag_3'] = kwargs['glucose_lag_3']
            else:
                input_data['glucose_lag_3'] = current_glucose
            
            # Calculate glucose velocity if not provided
            if 'glucose_velocity' not in kwargs and 'glucose_lag_1' in input_data:
                input_data['glucose_velocity'] = (current_glucose - input_data['glucose_lag_1']) / 5  # Assuming 5 min intervals
            
            # Add any other provided features
            for key, value in kwargs.items():
                if key not in input_data:
                    input_data[key] = value
            
            # Create DataFrame
            input_df = pd.DataFrame([input_data])
            
            # Preprocess input data
            preprocessed_input = self.preprocess_data(input_df)
            
            # Make prediction
            prediction = self.pipeline.predict(preprocessed_input)[0]
            
            # Ensure realistic range
            prediction = max(40, min(400, prediction))
            
            # Round to whole number
            prediction = round(prediction)
            
            # Calculate effect components for explanation
            insulin_effect = insulin_dose * -3  # Each unit reduces glucose by ~3 mg/dL per hour
            carb_effect = carb_intake * 0.2  # Each gram increases glucose by ~0.2 mg/dL
            exercise_effect = exercise_duration * exercise_intensity * -0.1  # Exercise reduces glucose
            
            return {
                'predictedGlucose': prediction,
                'details': {
                    'insulinEffect': round(insulin_effect, 1),
                    'carbEffect': round(carb_effect, 1),
                    'exerciseEffect': round(exercise_effect, 1)
                },
                'predictionHorizon': self.prediction_horizon,
                'method': 'ml-model'
            }
        except Exception as e:
            logger.error(f"Error in ML prediction: {str(e)}")
            logger.info("Falling back to rule-based calculation")
            
            # Fallback to rule-based calculation
            return self._rule_based_calculation(
                current_glucose, insulin_dose, carb_intake, 
                exercise_duration, exercise_intensity
            )
    
    def _rule_based_calculation(self, current_glucose: float, insulin_dose: float = 0, 
                              carb_intake: float = 0, exercise_duration: float = 0, 
                              exercise_intensity: float = 0) -> Dict[str, Union[float, Dict[str, float]]]:
        """
        Rule-based glucose prediction as fallback.
        
        Args:
            current_glucose: Current glucose level (mg/dL)
            insulin_dose: Insulin dose (units)
            carb_intake: Carbohydrate intake (grams)
            exercise_duration: Exercise duration (minutes)
            exercise_intensity: Exercise intensity (1-3)
            
        Returns:
            Dictionary with calculation results
        """
        # Calculate impact of insulin (each unit lowers glucose by ~50 mg/dL)
        # For 1 hour prediction, assume 75% of insulin effect is realized
        insulin_effect = insulin_dose * -3 * (self.prediction_horizon / 60)
        
        # Calculate impact of carbs (each 10g raises glucose by ~40 mg/dL)
        # For 1 hour prediction, assume 80% of carb effect is realized
        carb_effect = carb_intake * 0.2 * (self.prediction_horizon / 60)
        
        # Calculate impact of exercise
        # Exercise intensity ranges from 1-3
        exercise_effect = exercise_duration * exercise_intensity * -0.1 * (self.prediction_horizon / 60)
        
        # Calculate predicted glucose
        predicted_glucose = current_glucose + insulin_effect + carb_effect + exercise_effect
        
        # Ensure realistic range
        predicted_glucose = max(40, min(400, predicted_glucose))
        
        # Round to whole number
        predicted_glucose = round(predicted_glucose)
        
        return {
            'predictedGlucose': predicted_glucose,
            'details': {
                'insulinEffect': round(insulin_effect, 1),
                'carbEffect': round(carb_effect, 1),
                'exerciseEffect': round(exercise_effect, 1)
            },
            'predictionHorizon': self.prediction_horizon,
            'method': 'rule-based'
        }