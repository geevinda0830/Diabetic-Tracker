# import pandas as pd
# import numpy as np
# from sklearn.ensemble import RandomForestRegressor
# from sklearn.preprocessing import StandardScaler
# from sklearn.model_selection import train_test_split
# import joblib
# import os

# def train_insulin_model():
#     # Load and combine data from CSV files
#     csv_files = ['1.csv', '2.csv', '3.csv', '4.csv', '5.csv', '6.csv']
#     dataframes = []
    
#     for file in csv_files:
#         path = os.path.join('data', file)
#         if os.path.exists(path):
#             df = pd.read_csv(path, low_memory=False)
#             dataframes.append(df)
    
#     if not dataframes:
#         print("No data files found")
#         return
        
#     # Combine all dataframes
#     combined_df = pd.concat(dataframes, ignore_index=True)
    
#     # Extract relevant features for insulin prediction
#     # Assuming columns in the dataset are mapped appropriately
#     features = ['value', 'carbs', 'duration', 'weight']  # blood glucose, carbs, exercise, weight
#     target = 'dose'  # insulin dose
    
#     # Filter rows with valid insulin dose data
#     filtered_df = combined_df.dropna(subset=[target])
    
#     # Select only required columns and drop missing values
#     model_df = filtered_df[features + [target]].dropna()
    
#     if len(model_df) < 10:
#         print("Not enough data points for training")
#         return
    
#     # Split features and target
#     X = model_df[features]
#     y = model_df[target]
    
#     # Normalize features
#     scaler = StandardScaler()
#     X_scaled = scaler.fit_transform(X)
    
#     # Split training and test data
#     X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.2, random_state=42)
    
#     # Train Random Forest model
#     rf_model = RandomForestRegressor(n_estimators=100, random_state=42)
#     rf_model.fit(X_train, y_train)
    
#     # Evaluate model
#     train_score = rf_model.score(X_train, y_train)
#     test_score = rf_model.score(X_test, y_test)
    
#     print(f"Model R² score: {test_score:.4f}")
    
#     # Save model and scaler
#     model_dir = "models"
#     os.makedirs(model_dir, exist_ok=True)
    
#     joblib.dump(rf_model, os.path.join(model_dir, "insulin_model.joblib"))
#     joblib.dump(scaler, os.path.join(model_dir, "insulin_scaler.joblib"))
#     joblib.dump(features, os.path.join(model_dir, "insulin_features.joblib"))
    
#     print("Model trained and saved successfully")
#     return rf_model, scaler, features

# if __name__ == "__main__":
#     train_insulin_model()

# insulin_prediction.py
# Enhanced ML model for insulin dosage prediction with proper time series handling

import os
import math
import pickle
import logging
import numpy as np
import pandas as pd
from datetime import datetime
from typing import Dict, List, Optional, Tuple, Union

# Machine learning imports
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler, OneHotEncoder, MinMaxScaler
from sklearn.model_selection import train_test_split, GridSearchCV, TimeSeriesSplit
from sklearn.ensemble import GradientBoostingRegressor, RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import joblib

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("insulin_model.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Define paths
MODEL_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'models')
MODEL_PATH = os.path.join(MODEL_DIR, 'insulin_model.joblib')
SCALER_PATH = os.path.join(MODEL_DIR, 'insulin_scaler.joblib')
FEATURE_IMPORTANCE_PATH = os.path.join(MODEL_DIR, 'insulin_feature_importance.csv')

class InsulinPredictionModel:
    """Advanced machine learning model for insulin dosage prediction."""
    
    def __init__(self, model_path: str = MODEL_PATH, scaler_path: str = SCALER_PATH):
        """
        Initialize the insulin prediction model.
        
        Args:
            model_path: Path to save/load the model
            scaler_path: Path to save/load the scaler
        """
        self.model_path = model_path
        self.scaler_path = scaler_path
        self.model = None
        self.pipeline = None
        self.feature_names = None
        self.feature_importances = None
        self.is_trained = False
        self.categorical_features = [
            'is_morning', 'is_afternoon', 'is_evening', 'is_night',
            'is_weekend', 'is_correction_dose'
        ]
        self.numerical_features = [
            'blood_glucose', 'carb_intake', 'exercise_time', 'weight',
            'insulin_sensitivity_factor', 'insulin_to_carb_ratio',
            'previous_insulin_dose', 'hours_since_last_insulin',
            'total_insulin_past_24h', 'active_insulin'
        ]
        
        # Create model directory if it doesn't exist
        os.makedirs(os.path.dirname(self.model_path), exist_ok=True)
    
    def build_pipeline(self) -> Pipeline:
        """
        Build the ML pipeline with preprocessing steps.
        
        Returns:
            Scikit-learn pipeline
        """
        # Create preprocessors for different feature types
        numerical_transformer = Pipeline(steps=[
            ('scaler', StandardScaler())
        ])
        
        categorical_transformer = Pipeline(steps=[
            ('onehot', OneHotEncoder(handle_unknown='ignore'))
        ])
        
        # Column transformer to apply different preprocessing to different feature types
        preprocessor = ColumnTransformer(
            transformers=[
                ('num', numerical_transformer, self.numerical_features),
                ('cat', categorical_transformer, self.categorical_features)
            ]
        )
        
        # Get available features
        available_numerical = [f for f in self.numerical_features if f in self.feature_names]
        available_categorical = [f for f in self.categorical_features if f in self.feature_names]
        
        if not available_numerical and not available_categorical:
            logger.error("No valid features available for preprocessing")
            raise ValueError("No valid features available for preprocessing")
            
        # Update transformers with available features
        preprocessor = ColumnTransformer(
            transformers=[
                ('num', numerical_transformer, available_numerical),
                ('cat', categorical_transformer, available_categorical)
            ] if available_categorical else [
                ('num', numerical_transformer, available_numerical)
            ]
        )
        
        # Create the full pipeline
        pipeline = Pipeline(steps=[
            ('preprocessor', preprocessor),
            ('regressor', GradientBoostingRegressor(
                n_estimators=100,
                learning_rate=0.1,
                max_depth=3,
                random_state=42,
                subsample=0.8,
                loss='huber'  # Robust to outliers
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
        
        # Add derived features for insulin prediction
        
        # Time-based feature: time of day
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
        
        # Time-based feature: weekend
        if 'day_of_week' in df_copy.columns:
            if 'is_weekend' not in df_copy.columns:
                df_copy['is_weekend'] = df_copy['day_of_week'].isin([5, 6]).astype(int)
        else:
            if 'is_weekend' not in df_copy.columns:
                df_copy['is_weekend'] = 0
        
        # Dose type
        if 'carb_intake' in df_copy.columns and 'is_correction_dose' not in df_copy.columns:
            df_copy['is_correction_dose'] = (df_copy['carb_intake'] == 0).astype(int)
        elif 'is_correction_dose' not in df_copy.columns:
            df_copy['is_correction_dose'] = 0
        
        # Calculate insulin sensitivity factor if not present
        if 'insulin_sensitivity_factor' not in df_copy.columns and 'weight' in df_copy.columns:
            # Standard formula: 1800 ÷ Total Daily Insulin (TDI)
            # Estimated TDI as % of body weight (typical range 0.5-0.8 U/kg)
            estimated_tdi = df_copy['weight'] * 0.55  # Use mid-range estimate
            df_copy['insulin_sensitivity_factor'] = 1800 / estimated_tdi
        
        # Calculate insulin-to-carb ratio if not present
        if 'insulin_to_carb_ratio' not in df_copy.columns and 'weight' in df_copy.columns:
            # Standard formula: 500 ÷ Total Daily Insulin (TDI)
            estimated_tdi = df_copy['weight'] * 0.55  # Use mid-range estimate
            df_copy['insulin_to_carb_ratio'] = 500 / estimated_tdi
        
        # Calculate active insulin (insulin on board)
        if ('previous_insulin_dose' in df_copy.columns and 
            'hours_since_last_insulin' in df_copy.columns and 
            'active_insulin' not in df_copy.columns):
            
            # Calculate active insulin using biexponential model
            def calc_active_insulin(row):
                prev_dose = row['previous_insulin_dose']
                hours = row['hours_since_last_insulin']
                
                if pd.isna(prev_dose) or pd.isna(hours) or prev_dose == 0 or hours >= 5:
                    return 0.0
                
                # Simple biexponential model (approximate)
                if hours <= 1:
                    factor = 1.0 - 0.05 * hours  # Mostly still active
                elif hours <= 3:
                    factor = 0.95 - 0.25 * (hours - 1)  # Linear decay in mid-phase
                else:
                    factor = 0.45 * math.exp(-(hours - 3))  # Exponential tail
                
                return prev_dose * factor
            
            df_copy['active_insulin'] = df_copy.apply(calc_active_insulin, axis=1)
        
        # Handle missing values
        for col in df_copy.columns:
            # Numerical columns
            if col in self.numerical_features:
                df_copy[col] = df_copy[col].fillna(0)
            # Categorical columns
            elif col in self.categorical_features:
                df_copy[col] = df_copy[col].fillna(0)
        
        return df_copy
    
    def extract_features_and_target(self, df: pd.DataFrame) -> Tuple[pd.DataFrame, pd.Series]:
        """
        Extract features and target from the DataFrame.
        
        Args:
            df: Input DataFrame
            
        Returns:
            Tuple of (features DataFrame, target Series)
        """
        # Identify target column
        target_col = 'insulin_dosage' if 'insulin_dosage' in df.columns else 'dose'
        
        if target_col not in df.columns:
            logger.error(f"Target column '{target_col}' not found in DataFrame")
            raise ValueError(f"Target column '{target_col}' not found in DataFrame")
        
        # Select feature columns
        all_features = self.numerical_features + self.categorical_features
        
        # Get available features
        available_features = [f for f in all_features if f in df.columns]
        
        if not available_features:
            logger.error("No valid features found in DataFrame")
            raise ValueError("No valid features found in DataFrame")
        
        # Extract features and target
        X = df[available_features]
        y = df[target_col]
        
        # Save feature names
        self.feature_names = available_features
        
        return X, y
    
    def train(self, df: pd.DataFrame) -> Dict[str, float]:
        """
        Train the insulin prediction model.
        
        Args:
            df: DataFrame with features and target
            
        Returns:
            Dictionary with training metrics
        """
        logger.info("Training insulin prediction model")
        
        # Preprocess data
        df_processed = self.preprocess_data(df)
        
        # Extract features and target
        X, y = self.extract_features_and_target(df_processed)
        
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
        within_05 = np.mean(np.abs(y_test - y_pred) <= 0.5) * 100  # % within 0.5 units
        within_10 = np.mean(np.abs(y_test - y_pred) <= 1.0) * 100  # % within 1.0 units
        
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
            'within_0.5_units': within_05,
            'within_1.0_units': within_10,
            'samples': len(X),
            'features': len(X.columns)
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
    
    def tune_hyperparameters(self, df: pd.DataFrame) -> Dict[str, float]:
        """
        Tune hyperparameters using grid search.
        
        Args:
            df: DataFrame with features and target
            
        Returns:
            Dictionary with best parameters and metrics
        """
        logger.info("Tuning hyperparameters for insulin prediction model")
        
        # Preprocess data
        df_processed = self.preprocess_data(df)
        
        # Extract features and target
        X, y = self.extract_features_and_target(df_processed)
        
        # Build base pipeline
        self.pipeline = self.build_pipeline()
        
        # Define parameter grid
        param_grid = {
            'regressor__n_estimators': [50, 100, 200],
            'regressor__learning_rate': [0.05, 0.1, 0.2],
            'regressor__max_depth': [2, 3, 4],
            'regressor__subsample': [0.7, 0.8, 0.9],
            'regressor__loss': ['squared_error', 'huber']
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
            'features': len(X.columns)
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
    
    def predict(self, **kwargs) -> Dict[str, Union[float, Dict[str, float]]]:
        """
        Predict insulin dosage based on input parameters.
        
        Args:
            blood_glucose: Current blood glucose level (mg/dL)
            carb_intake: Carbohydrate intake (grams)
            exercise_time: Planned exercise duration (minutes)
            weight: Body weight (kg)
            **kwargs: Additional features like time of day, previous_insulin_dose, etc.
            
        Returns:
            Dictionary with prediction results
        """
        # Try to load model if not trained
        if not self.is_trained and not self.load_model():
            logger.warning("Model not trained. Using fallback calculation.")
            return self._rule_based_calculation(**kwargs)
        
        try:
            # Create input DataFrame
            input_data = pd.DataFrame([kwargs])
            
            # Preprocess data
            preprocessed_data = self.preprocess_data(input_data)
            
            # Make prediction
            prediction = self.pipeline.predict(preprocessed_data)[0]
            
            # Round to nearest 0.5 units for realistic dosing
            prediction = round(prediction * 2) / 2
            
            # Ensure dosage is positive
            prediction = max(0, prediction)
            
            # Extract prediction components for explanation
            explanation = self._extract_prediction_components(**kwargs)
            
            # Return result with confidence score and explanation
            return {
                'recommendedDosage': prediction,
                'details': explanation,
                'method': 'ml-model',
                'confidence': 0.85  # Higher confidence for ML model
            }
        except Exception as e:
            logger.error(f"Error in ML prediction: {str(e)}")
            logger.info("Falling back to rule-based calculation")
            
            # Fallback to rule-based calculation
            return self._rule_based_calculation(**kwargs)
    
    def _extract_prediction_components(self, **kwargs) -> Dict[str, float]:
        """
        Extract components that contribute to the insulin prediction.
        
        Args:
            **kwargs: Input parameters
            
        Returns:
            Dictionary with prediction components
        """
        # Extract key parameters
        blood_glucose = kwargs.get('blood_glucose', 0)
        carb_intake = kwargs.get('carb_intake', 0)
        exercise_time = kwargs.get('exercise_time', 0)
        weight = kwargs.get('weight', 70)
        
        # Get standard factors
        target_glucose = 120
        glucose_difference = blood_glucose - target_glucose
        
        # Calculate insulin sensitivity factor
        insulin_sensitivity_factor = kwargs.get('insulin_sensitivity_factor')
        if insulin_sensitivity_factor is None:
            # Estimate ISF: 1800 ÷ Total Daily Insulin (TDI)
            estimated_tdi = weight * 0.55  # Use mid-range estimate
            insulin_sensitivity_factor = 1800 / estimated_tdi
            
        # Calculate insulin-to-carb ratio
        insulin_to_carb_ratio = kwargs.get('insulin_to_carb_ratio')
        if insulin_to_carb_ratio is None:
            # Estimate ICR: 500 ÷ Total Daily Insulin (TDI)
            estimated_tdi = weight * 0.55  # Use mid-range estimate
            insulin_to_carb_ratio = 500 / estimated_tdi
            
        # Calculate components
        # Carb component: carbs ÷ insulin-to-carb ratio
        carb_effect = carb_intake / insulin_to_carb_ratio
        
        # Glucose correction component: (current glucose - target) ÷ (insulin sensitivity factor)
        glucose_correction = glucose_difference / insulin_sensitivity_factor if glucose_difference > 0 else 0
        
        # Exercise reduction component
        exercise_reduction = exercise_time * 0.2 if exercise_time > 0 else 0
        
        return {
            'currentGlucose': blood_glucose,
            'glucoseDifference': round(glucose_difference, 1),
            'carbEffect': round(carb_effect, 1),
            'exerciseReduction': round(exercise_reduction, 1)
        }
    
    def _rule_based_calculation(self, **kwargs) -> Dict[str, Union[float, Dict[str, float]]]:
        """
        Rule-based insulin calculation as fallback.
        
        Args:
            blood_glucose: Current blood glucose level (mg/dL)
            carb_intake: Carbohydrate intake (grams)
            exercise_time: Planned exercise duration (minutes)
            weight: Body weight (kg)
            **kwargs: Additional parameters
            
        Returns:
            Dictionary with calculation results
        """
        # Extract key parameters with defaults
        blood_glucose = kwargs.get('blood_glucose', 0)
        carb_intake = kwargs.get('carb_intake', 0)
        exercise_time = kwargs.get('exercise_time', 0)
        weight = kwargs.get('weight', 70)
        current_insulin_dosage = kwargs.get('current_insulin_dosage', 0)
        
        # Define target glucose
        target_glucose = 120
        
        # Calculate glucose difference
        glucose_difference = blood_glucose - target_glucose
        
        # Calculate insulin sensitivity factor
        insulin_sensitivity_factor = kwargs.get('insulin_sensitivity_factor')
        if insulin_sensitivity_factor is None:
            # Estimate ISF: 1800 ÷ Total Daily Insulin (TDI)
            estimated_tdi = weight * 0.55  # Use mid-range estimate
            insulin_sensitivity_factor = 1800 / estimated_tdi
            
        # Calculate insulin-to-carb ratio
        insulin_to_carb_ratio = kwargs.get('insulin_to_carb_ratio')
        if insulin_to_carb_ratio is None:
            # Estimate ICR: 500 ÷ Total Daily Insulin (TDI)
            estimated_tdi = weight * 0.55  # Use mid-range estimate
            insulin_to_carb_ratio = 500 / estimated_tdi
        
        # Calculate correction factor based on glucose difference and ISF
        if glucose_difference > 0:
            glucose_adjustment = math.ceil(glucose_difference / insulin_sensitivity_factor)
        else:
            glucose_adjustment = 0  # Don't correct for low glucose
        
        # Calculate carbohydrate factor: carbs ÷ insulin-to-carb ratio
        carb_effect = carb_intake / insulin_to_carb_ratio
        
        # Exercise reduces insulin needs
        exercise_reduction = exercise_time * 0.2 if exercise_time > 0 else 0
        
        # Calculate recommended dosage
        recommended_dosage = current_insulin_dosage + glucose_adjustment + carb_effect
        
        # Apply exercise reduction
        recommended_dosage = max(0, recommended_dosage - exercise_reduction)
        
        # Round to nearest 0.5 units for realistic dosing
        recommended_dosage = round(recommended_dosage * 2) / 2
        
        # Return calculation results
        return {
            'recommendedDosage': recommended_dosage,
            'details': {
                'currentGlucose': blood_glucose,
                'glucoseDifference': round(glucose_difference, 1),
                'carbEffect': round(carb_effect, 1),
                'exerciseReduction': round(exercise_reduction, 1)
            },
            'method': 'rule-based',
            'confidence': 0.6  # Lower confidence for rule-based
        }