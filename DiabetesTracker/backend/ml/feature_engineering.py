# # ml_model/feature_engineering.py
# import pandas as pd
# import numpy as np

# def engineer_features(df):
#     """Extract meaningful features from the cleaned data"""
#     df_new = df.copy()
    
#     # Extract time-based features
#     for col in [c for c in df_new.columns if 'ts' in c and pd.api.types.is_datetime64_dtype(df_new[c])]:
#         df_new[f'{col}_hour'] = df_new[col].dt.hour
#         df_new[f'{col}_day'] = df_new[col].dt.day
#         df_new[f'{col}_weekday'] = df_new[col].dt.weekday
    
#     # Calculate insulin to carb ratio
#     if 'dose' in df_new.columns and 'carbs' in df_new.columns:
#         df_new['insulin_to_carb_ratio'] = df_new['dose'] / df_new['carbs'].replace(0, np.nan)
#         df_new['insulin_to_carb_ratio'] = df_new['insulin_to_carb_ratio'].fillna(0)
    
#     # Exercise impact features
#     if 'intensity' in df_new.columns and 'duration' in df_new.columns:
#         df_new['exercise_impact'] = df_new['intensity'] * df_new['duration']
    
#     # One-hot encode insulin type
#     if 'insulin_type' in df_new.columns:
#         df_new = pd.get_dummies(df_new, columns=['insulin_type'], prefix='insulin')
    
#     # Final check for NaN values
#     numeric_cols = df_new.select_dtypes(include=['float64', 'int64']).columns
#     for col in numeric_cols:
#         df_new[col] = df_new[col].fillna(0)
    
#     return df_new


# feature_engineering.py
# Enhanced data preprocessing for diabetes tracking with proper time series handling

import os
import logging
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from sklearn.preprocessing import StandardScaler
from typing import Dict, List, Tuple, Optional, Union

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("preprocessing.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class DiabetesDataProcessor:
    """Class for preprocessing diabetes data with proper time series handling."""
    
    def __init__(self, output_dir: str = 'data'):
        """
        Initialize the data processor.
        
        Args:
            output_dir: Directory to save processed data
        """
        self.output_dir = output_dir
        self.glucose_scaler = StandardScaler()
        self.carb_scaler = StandardScaler()
        self.insulin_scaler = StandardScaler()
        self.exercise_scaler = StandardScaler()
        
        # Create output directory if it doesn't exist
        os.makedirs(self.output_dir, exist_ok=True)
    
    def parse_datetime(self, date_str: str) -> Optional[pd.Timestamp]:
        """
        Parse datetime from string in multiple formats.
        
        Args:
            date_str: Date string to parse
            
        Returns:
            Parsed timestamp or None if parsing fails
        """
        if pd.isna(date_str) or date_str is None or date_str == '':
            return None
            
        # Try multiple date formats
        formats = [
            '%d-%m-%Y %H:%M:%S',  # Standard format in dataset
            '%Y-%m-%d %H:%M:%S',  # ISO format
            '%m/%d/%Y %H:%M:%S',  # US format
            '%d/%m/%Y %H:%M:%S'   # European format
        ]
        
        for fmt in formats:
            try:
                return pd.to_datetime(date_str, format=fmt)
            except (ValueError, TypeError):
                continue
        
        # If all formats fail, try pandas default parser
        try:
            return pd.to_datetime(date_str)
        except (ValueError, TypeError):
            logger.warning(f"Could not parse datetime: {date_str}")
            return None

    def process_csv_files(self, file_paths: List[str]) -> Tuple[pd.DataFrame, pd.DataFrame]:
        """
        Process multiple CSV files and extract glucose and insulin data.
        
        Args:
            file_paths: List of paths to CSV files
            
        Returns:
            Tuple of (glucose_df, insulin_df)
        """
        all_glucose_data = []
        all_insulin_data = []
        
        for file_path in file_paths:
            try:
                logger.info(f"Processing file: {file_path}")
                file_name = os.path.basename(file_path)
                
                # Read CSV file
                df = pd.read_csv(file_path)
                
                # Process each patient's data separately
                patient_ids = df['id'].unique()
                
                for patient_id in patient_ids:
                    logger.info(f"Processing patient ID: {patient_id} from file {file_name}")
                    patient_df = df[df['id'] == patient_id].copy()
                    
                    # Get patient weight
                    weight = patient_df['weight'].iloc[0]
                    
                    # Process glucose readings
                    glucose_df = self.extract_glucose_readings(patient_df, patient_id, weight, file_name)
                    if glucose_df is not None and not glucose_df.empty:
                        all_glucose_data.append(glucose_df)
                        logger.info(f"Extracted {len(glucose_df)} glucose readings for patient {patient_id}")
                    
                    # Process insulin doses
                    insulin_df = self.extract_insulin_doses(patient_df, patient_id, weight, file_name)
                    if insulin_df is not None and not insulin_df.empty:
                        all_insulin_data.append(insulin_df)
                        logger.info(f"Extracted {len(insulin_df)} insulin doses for patient {patient_id}")
                
            except Exception as e:
                logger.error(f"Error processing file {file_path}: {str(e)}")
                raise
        
        # Combine all patient data
        if all_glucose_data:
            combined_glucose = pd.concat(all_glucose_data, ignore_index=True)
            logger.info(f"Combined glucose data: {len(combined_glucose)} rows")
        else:
            combined_glucose = pd.DataFrame()
            logger.warning("No glucose data extracted")
        
        if all_insulin_data:
            combined_insulin = pd.concat(all_insulin_data, ignore_index=True)
            logger.info(f"Combined insulin data: {len(combined_insulin)} rows")
        else:
            combined_insulin = pd.DataFrame()
            logger.warning("No insulin data extracted")
        
        return combined_glucose, combined_insulin

    def extract_glucose_readings(self, df: pd.DataFrame, patient_id: int, 
                                weight: float, source_file: str) -> Optional[pd.DataFrame]:
        """
        Extract glucose readings with time series features.
        
        Args:
            df: DataFrame for a single patient
            patient_id: Patient ID
            weight: Patient weight
            source_file: Source file name for tracking
        
        Returns:
            DataFrame with processed glucose readings
        """
        # Filter rows with glucose readings
        glucose_df = df[df['value'].notna()].copy()
        
        if glucose_df.empty:
            logger.warning(f"No glucose readings found for patient {patient_id}")
            return None
        
        # Convert timestamp to datetime
        glucose_df['original_timestamp'] = glucose_df['ts'].copy()
        glucose_df['timestamp'] = glucose_df['ts'].apply(self.parse_datetime)
        
        # Drop rows with invalid timestamps
        valid_rows = glucose_df['timestamp'].notna()
        if not valid_rows.all():
            logger.warning(f"Dropping {(~valid_rows).sum()} rows with invalid timestamps")
            glucose_df = glucose_df[valid_rows]
        
        if glucose_df.empty:
            logger.warning(f"No valid glucose readings after timestamp parsing for patient {patient_id}")
            return None
        
        # Sort by timestamp
        glucose_df = glucose_df.sort_values('timestamp')
        
        # Calculate time differences between readings (in minutes)
        glucose_df['time_diff'] = glucose_df['timestamp'].diff().dt.total_seconds() / 60
        
        # Add time-based features
        glucose_df['hour'] = glucose_df['timestamp'].dt.hour
        glucose_df['day_of_week'] = glucose_df['timestamp'].dt.dayofweek
        glucose_df['month'] = glucose_df['timestamp'].dt.month
        glucose_df['day'] = glucose_df['timestamp'].dt.day
        glucose_df['week_of_year'] = glucose_df['timestamp'].dt.isocalendar().week
        glucose_df['quarter'] = glucose_df['timestamp'].dt.quarter
        
        # Time of day categories (one-hot encoded)
        glucose_df['is_morning'] = ((glucose_df['hour'] >= 5) & (glucose_df['hour'] <= 11)).astype(int)
        glucose_df['is_afternoon'] = ((glucose_df['hour'] >= 12) & (glucose_df['hour'] <= 17)).astype(int)
        glucose_df['is_evening'] = ((glucose_df['hour'] >= 18) & (glucose_df['hour'] <= 23)).astype(int)
        glucose_df['is_night'] = ((glucose_df['hour'] >= 0) & (glucose_df['hour'] <= 4)).astype(int)
        
        # Create lag features for time series analysis
        for lag in [1, 2, 3, 6, 12]:  # Lags representing 5min, 10min, 15min, 30min, 1hr if readings are 5min apart
            glucose_df[f'glucose_lag_{lag}'] = glucose_df['value'].shift(lag)
        
        # Calculate glucose rate of change (mg/dL per minute)
        glucose_df['glucose_velocity'] = glucose_df['value'].diff() / glucose_df['time_diff']
        
        # Calculate rolling statistics (last 1 hour, assuming 5min readings = 12 points)
        glucose_df['glucose_rolling_mean'] = glucose_df['value'].rolling(window=12, min_periods=1).mean()
        glucose_df['glucose_rolling_std'] = glucose_df['value'].rolling(window=12, min_periods=1).std()
        
        # Create future glucose values (target for prediction)
        # 30 minutes ahead (assuming 5min intervals = 6 points ahead)
        glucose_df['glucose_future_30min'] = glucose_df['value'].shift(-6)
        
        # 60 minutes ahead (assuming 5min intervals = 12 points ahead)
        glucose_df['glucose_future_60min'] = glucose_df['value'].shift(-12)
        
        # Merge with insulin data
        insulin_df = df[df['dose'].notna()].copy()
        if not insulin_df.empty:
            insulin_df['insulin_timestamp'] = insulin_df['ts'].apply(self.parse_datetime)
            
            # Keep only valid timestamps
            insulin_df = insulin_df[insulin_df['insulin_timestamp'].notna()]
            
            if not insulin_df.empty:
                # Sort insulin data by timestamp
                insulin_df = insulin_df.sort_values('insulin_timestamp')
                
                # For each glucose reading, find the most recent insulin dose
                prior_insulin_doses = []
                insulin_carbs = []
                insulin_times = []
                
                for i, row in glucose_df.iterrows():
                    # Find insulin doses before this glucose reading
                    prior_insulin = insulin_df[insulin_df['insulin_timestamp'] <= row['timestamp']]
                    
                    if not prior_insulin.empty:
                        # Get the most recent insulin dose
                        most_recent = prior_insulin.iloc[-1]
                        prior_insulin_doses.append(most_recent['dose'])
                        
                        # Get carb input if available
                        carb_input = most_recent['bwz_carb_input'] if 'bwz_carb_input' in most_recent and not pd.isna(most_recent['bwz_carb_input']) else 0
                        insulin_carbs.append(carb_input)
                        
                        # Calculate time since insulin dose (in minutes)
                        time_diff = (row['timestamp'] - most_recent['insulin_timestamp']).total_seconds() / 60
                        insulin_times.append(time_diff)
                    else:
                        prior_insulin_doses.append(0)
                        insulin_carbs.append(0)
                        insulin_times.append(np.nan)
                
                glucose_df['recent_insulin_dose'] = prior_insulin_doses
                glucose_df['recent_insulin_carbs'] = insulin_carbs
                glucose_df['minutes_since_insulin'] = insulin_times
            else:
                glucose_df['recent_insulin_dose'] = 0
                glucose_df['recent_insulin_carbs'] = 0
                glucose_df['minutes_since_insulin'] = np.nan
        else:
            glucose_df['recent_insulin_dose'] = 0
            glucose_df['recent_insulin_carbs'] = 0
            glucose_df['minutes_since_insulin'] = np.nan
        
        # Merge with carb data (if separate from insulin data)
        carb_df = df[df['carbs'].notna()].copy()
        if not carb_df.empty and 'ts9' in carb_df.columns:
            carb_df['carb_timestamp'] = carb_df['ts9'].apply(self.parse_datetime)
            
            # Keep only valid timestamps
            carb_df = carb_df[carb_df['carb_timestamp'].notna()]
            
            if not carb_df.empty:
                # Sort carb data by timestamp
                carb_df = carb_df.sort_values('carb_timestamp')
                
                # For each glucose reading, find the most recent carb intake
                prior_carbs = []
                carb_times = []
                
                for i, row in glucose_df.iterrows():
                    # Find carb intakes before this glucose reading
                    prior_carb_intake = carb_df[carb_df['carb_timestamp'] <= row['timestamp']]
                    
                    if not prior_carb_intake.empty:
                        # Get the most recent carb intake
                        most_recent = prior_carb_intake.iloc[-1]
                        prior_carbs.append(most_recent['carbs'])
                        
                        # Calculate time since carb intake (in minutes)
                        time_diff = (row['timestamp'] - most_recent['carb_timestamp']).total_seconds() / 60
                        carb_times.append(time_diff)
                    else:
                        prior_carbs.append(0)
                        carb_times.append(np.nan)
                
                glucose_df['recent_carb_intake'] = prior_carbs
                glucose_df['minutes_since_carbs'] = carb_times
            else:
                glucose_df['recent_carb_intake'] = 0
                glucose_df['minutes_since_carbs'] = np.nan
        else:
            # If no separate carb data, use the carbs from insulin data
            glucose_df['recent_carb_intake'] = glucose_df['recent_insulin_carbs']
            glucose_df['minutes_since_carbs'] = glucose_df['minutes_since_insulin']
        
        # Merge with exercise data
        exercise_columns = ['intensity', 'duration']
        if all(col in df.columns for col in exercise_columns) and df['intensity'].notna().any():
            exercise_df = df[df['intensity'].notna()].copy()
            
            # Find timestamp columns for exercise
            timestamp_cols = [col for col in exercise_df.columns if 'ts_begin' in col.lower()]
            if timestamp_cols:
                # Use the first available timestamp column
                ts_col = timestamp_cols[0]
                exercise_df['exercise_timestamp'] = exercise_df[ts_col].apply(self.parse_datetime)
                
                # Keep only valid timestamps
                exercise_df = exercise_df[exercise_df['exercise_timestamp'].notna()]
                
                if not exercise_df.empty:
                    # Sort exercise data by timestamp
                    exercise_df = exercise_df.sort_values('exercise_timestamp')
                    
                    # For each glucose reading, find the most recent exercise
                    prior_exercise_intensity = []
                    prior_exercise_duration = []
                    exercise_times = []
                    
                    for i, row in glucose_df.iterrows():
                        # Find exercise before this glucose reading (within 12 hours)
                        twelve_hours_ago = row['timestamp'] - timedelta(hours=12)
                        recent_exercise = exercise_df[
                            (exercise_df['exercise_timestamp'] <= row['timestamp']) & 
                            (exercise_df['exercise_timestamp'] >= twelve_hours_ago)
                        ]
                        
                        if not recent_exercise.empty:
                            # Get the most recent exercise
                            most_recent = recent_exercise.iloc[-1]
                            prior_exercise_intensity.append(most_recent['intensity'])
                            
                            # Get duration if available
                            duration = most_recent['duration'] if 'duration' in most_recent and not pd.isna(most_recent['duration']) else 0
                            prior_exercise_duration.append(duration)
                            
                            # Calculate time since exercise (in minutes)
                            time_diff = (row['timestamp'] - most_recent['exercise_timestamp']).total_seconds() / 60
                            exercise_times.append(time_diff)
                        else:
                            prior_exercise_intensity.append(0)
                            prior_exercise_duration.append(0)
                            exercise_times.append(np.nan)
                    
                    glucose_df['recent_exercise_intensity'] = prior_exercise_intensity
                    glucose_df['recent_exercise_duration'] = prior_exercise_duration
                    glucose_df['minutes_since_exercise'] = exercise_times
                else:
                    glucose_df['recent_exercise_intensity'] = 0
                    glucose_df['recent_exercise_duration'] = 0
                    glucose_df['minutes_since_exercise'] = np.nan
            else:
                glucose_df['recent_exercise_intensity'] = 0
                glucose_df['recent_exercise_duration'] = 0
                glucose_df['minutes_since_exercise'] = np.nan
        else:
            glucose_df['recent_exercise_intensity'] = 0
            glucose_df['recent_exercise_duration'] = 0
            glucose_df['minutes_since_exercise'] = np.nan
        
        # Fill missing values with appropriate strategies
        glucose_df['recent_insulin_dose'] = glucose_df['recent_insulin_dose'].fillna(0)
        glucose_df['recent_carb_intake'] = glucose_df['recent_carb_intake'].fillna(0)
        glucose_df['recent_exercise_intensity'] = glucose_df['recent_exercise_intensity'].fillna(0)
        glucose_df['recent_exercise_duration'] = glucose_df['recent_exercise_duration'].fillna(0)
        
        # Time since events - fill with large value if missing (indicating it was a long time ago)
        glucose_df['minutes_since_insulin'] = glucose_df['minutes_since_insulin'].fillna(1440)  # 24 hours
        glucose_df['minutes_since_carbs'] = glucose_df['minutes_since_carbs'].fillna(1440)
        glucose_df['minutes_since_exercise'] = glucose_df['minutes_since_exercise'].fillna(1440)
        
        # Fill missing lag values with forward fill then backward fill
        lag_columns = [col for col in glucose_df.columns if 'lag' in col]
        glucose_df[lag_columns] = glucose_df[lag_columns].fillna(method='ffill').fillna(method='bfill')
        
        # Add patient info and source tracking
        glucose_df['patient_id'] = patient_id
        glucose_df['weight'] = weight
        glucose_df['source_file'] = source_file
        
        # Calculate insulin sensitivity factor (ISF)
        glucose_df['insulin_sensitivity_factor'] = 1800 / (glucose_df['weight'] * 0.453592)  # Convert lbs to kg if needed
        
        # Calculate insulin-to-carb ratio (ICR)
        glucose_df['insulin_to_carb_ratio'] = 500 / (glucose_df['weight'] * 0.453592)
        
        # Add timestamp string for model output
        glucose_df['timestamp_str'] = glucose_df['timestamp'].dt.strftime('%Y-%m-%d %H:%M:%S')
        
        return glucose_df

    def extract_insulin_doses(self, df: pd.DataFrame, patient_id: int, 
                             weight: float, source_file: str) -> Optional[pd.DataFrame]:
        """
        Extract insulin doses with time series features.
        
        Args:
            df: DataFrame for a single patient
            patient_id: Patient ID
            weight: Patient weight
            source_file: Source file name for tracking
        
        Returns:
            DataFrame with processed insulin doses
        """
        # Filter rows with insulin doses
        insulin_df = df[df['dose'].notna()].copy()
        
        if insulin_df.empty:
            logger.warning(f"No insulin doses found for patient {patient_id}")
            return None
        
        # Get timestamp
        timestamp_fields = [col for col in insulin_df.columns if 'ts' in col.lower() and not col.startswith(('ts_begin', 'ts_end'))]
        
        valid_timestamp = False
        for field in timestamp_fields:
            if insulin_df[field].notna().any():
                insulin_df['original_timestamp'] = insulin_df[field]
                insulin_df['timestamp'] = insulin_df[field].apply(self.parse_datetime)
                valid_timestamp = True
                logger.info(f"Using timestamp field {field} for insulin data")
                break
        
        if not valid_timestamp:
            logger.warning(f"No valid timestamp field found for insulin data for patient {patient_id}")
            return None
        
        # Drop rows with invalid timestamps
        valid_rows = insulin_df['timestamp'].notna()
        if not valid_rows.all():
            logger.warning(f"Dropping {(~valid_rows).sum()} insulin rows with invalid timestamps")
            insulin_df = insulin_df[valid_rows]
        
        if insulin_df.empty:
            logger.warning(f"No valid insulin doses after timestamp parsing for patient {patient_id}")
            return None
        
        # Sort by timestamp
        insulin_df = insulin_df.sort_values('timestamp')
        
        # Calculate time differences between doses (in hours)
        insulin_df['time_diff_hours'] = insulin_df['timestamp'].diff().dt.total_seconds() / 3600
        
        # Add time-based features
        insulin_df['hour'] = insulin_df['timestamp'].dt.hour
        insulin_df['day_of_week'] = insulin_df['timestamp'].dt.dayofweek
        insulin_df['month'] = insulin_df['timestamp'].dt.month
        insulin_df['day'] = insulin_df['timestamp'].dt.day
        insulin_df['is_weekend'] = insulin_df['day_of_week'].isin([5, 6]).astype(int)
        
        # Time of day categories (one-hot encoded)
        insulin_df['is_morning'] = ((insulin_df['hour'] >= 5) & (insulin_df['hour'] <= 11)).astype(int)
        insulin_df['is_afternoon'] = ((insulin_df['hour'] >= 12) & (insulin_df['hour'] <= 17)).astype(int)
        insulin_df['is_evening'] = ((insulin_df['hour'] >= 18) & (insulin_df['hour'] <= 23)).astype(int)
        insulin_df['is_night'] = ((insulin_df['hour'] >= 0) & (insulin_df['hour'] <= 4)).astype(int)
        
        # Meal identification based on carb input
        if 'bwz_carb_input' in insulin_df.columns:
            insulin_df['meal_carbs'] = insulin_df['bwz_carb_input'].fillna(0)
            insulin_df['is_meal_bolus'] = (insulin_df['meal_carbs'] > 0).astype(int)
        else:
            insulin_df['meal_carbs'] = 0
            insulin_df['is_meal_bolus'] = 0
        
        # Create lag features for insulin doses
        insulin_df['previous_insulin_dose'] = insulin_df['dose'].shift(1)
        insulin_df['previous_meal_carbs'] = insulin_df['meal_carbs'].shift(1)
        insulin_df['hours_since_last_insulin'] = insulin_df['time_diff_hours']
        
        # Calculate daily total insulin (rolling 24h window)
        insulin_df = insulin_df.sort_values('timestamp')
        
        # Initialize daily totals
        daily_totals = []
        
        for i, row in insulin_df.iterrows():
            current_time = row['timestamp']
            past_24h = current_time - timedelta(hours=24)
            
            # Find doses in the past 24 hours
            past_doses = insulin_df[
                (insulin_df['timestamp'] < current_time) &
                (insulin_df['timestamp'] >= past_24h)
            ]
            
            if not past_doses.empty:
                daily_totals.append(past_doses['dose'].sum())
            else:
                daily_totals.append(0)
        
        insulin_df['total_insulin_past_24h'] = daily_totals
        
        # Get glucose reading prior to insulin dose
        glucose_df = df[df['value'].notna()].copy()
        
        if not glucose_df.empty:
            glucose_df['glucose_timestamp'] = glucose_df['ts'].apply(self.parse_datetime)
            glucose_df = glucose_df[glucose_df['glucose_timestamp'].notna()]
            
            if not glucose_df.empty:
                glucose_df = glucose_df.sort_values('glucose_timestamp')
                
                # For each insulin dose, find the most recent glucose reading
                prior_glucose_values = []
                glucose_times = []
                
                for i, row in insulin_df.iterrows():
                    # Find glucose readings before this insulin dose (within 30 minutes)
                    thirty_min_ago = row['timestamp'] - timedelta(minutes=30)
                    recent_glucose = glucose_df[
                        (glucose_df['glucose_timestamp'] <= row['timestamp']) & 
                        (glucose_df['glucose_timestamp'] >= thirty_min_ago)
                    ]
                    
                    if not recent_glucose.empty:
                        # Get the most recent glucose reading
                        most_recent = recent_glucose.iloc[-1]
                        prior_glucose_values.append(most_recent['value'])
                        
                        # Calculate time since glucose reading (in minutes)
                        time_diff = (row['timestamp'] - most_recent['glucose_timestamp']).total_seconds() / 60
                        glucose_times.append(time_diff)
                    else:
                        # Look for any glucose reading before this insulin dose
                        earlier_glucose = glucose_df[glucose_df['glucose_timestamp'] <= row['timestamp']]
                        
                        if not earlier_glucose.empty:
                            most_recent = earlier_glucose.iloc[-1]
                            prior_glucose_values.append(most_recent['value'])
                            
                            # Calculate time since glucose reading (in minutes)
                            time_diff = (row['timestamp'] - most_recent['glucose_timestamp']).total_seconds() / 60
                            glucose_times.append(time_diff)
                        else:
                            prior_glucose_values.append(np.nan)
                            glucose_times.append(np.nan)
                
                insulin_df['blood_glucose'] = prior_glucose_values
                insulin_df['minutes_since_glucose'] = glucose_times
            else:
                insulin_df['blood_glucose'] = np.nan
                insulin_df['minutes_since_glucose'] = np.nan
        else:
            insulin_df['blood_glucose'] = np.nan
            insulin_df['minutes_since_glucose'] = np.nan
        
        # Get exercise information
        exercise_columns = ['intensity', 'duration']
        if all(col in df.columns for col in exercise_columns) and df['intensity'].notna().any():
            exercise_df = df[df['intensity'].notna()].copy()
            
            # Find timestamp columns for exercise
            timestamp_cols = [col for col in exercise_df.columns if 'ts_begin' in col.lower()]
            if timestamp_cols:
                # Use the first available timestamp column
                ts_col = timestamp_cols[0]
                exercise_df['exercise_timestamp'] = exercise_df[ts_col].apply(self.parse_datetime)
                
                # Keep only valid timestamps
                exercise_df = exercise_df[exercise_df['exercise_timestamp'].notna()]
                
                if not exercise_df.empty:
                    # Sort exercise data by timestamp
                    exercise_df = exercise_df.sort_values('exercise_timestamp')
                    
                    # For each insulin dose, find the most recent exercise
                    prior_exercise_intensity = []
                    prior_exercise_duration = []
                    exercise_times = []
                    
                    for i, row in insulin_df.iterrows():
                        # Find exercise before this insulin dose (within 6 hours)
                        six_hours_ago = row['timestamp'] - timedelta(hours=6)
                        recent_exercise = exercise_df[
                            (exercise_df['exercise_timestamp'] <= row['timestamp']) & 
                            (exercise_df['exercise_timestamp'] >= six_hours_ago)
                        ]
                        
                        if not recent_exercise.empty:
                            # Get the most recent exercise
                            most_recent = recent_exercise.iloc[-1]
                            prior_exercise_intensity.append(most_recent['intensity'])
                            
                            # Get duration if available
                            duration = most_recent['duration'] if 'duration' in most_recent and not pd.isna(most_recent['duration']) else 0
                            prior_exercise_duration.append(duration)
                            
                            # Calculate time since exercise (in minutes)
                            time_diff = (row['timestamp'] - most_recent['exercise_timestamp']).total_seconds() / 60
                            exercise_times.append(time_diff)
                        else:
                            prior_exercise_intensity.append(0)
                            prior_exercise_duration.append(0)
                            exercise_times.append(np.nan)
                    
                    insulin_df['exercise_intensity'] = prior_exercise_intensity
                    insulin_df['exercise_duration'] = prior_exercise_duration
                    insulin_df['minutes_since_exercise'] = exercise_times
                else:
                    insulin_df['exercise_intensity'] = 0
                    insulin_df['exercise_duration'] = 0
                    insulin_df['minutes_since_exercise'] = np.nan
            else:
                insulin_df['exercise_intensity'] = 0
                insulin_df['exercise_duration'] = 0
                insulin_df['minutes_since_exercise'] = np.nan
        else:
            insulin_df['exercise_intensity'] = 0
            insulin_df['exercise_duration'] = 0
            insulin_df['minutes_since_exercise'] = np.nan
        
        # Clean up and handle missing values
        insulin_df['blood_glucose'] = insulin_df['blood_glucose'].fillna(method='ffill').fillna(120)  # Default to 120 if unknown
        insulin_df['minutes_since_glucose'] = insulin_df['minutes_since_glucose'].fillna(60)  # Default to 60 min if unknown
        insulin_df['previous_insulin_dose'] = insulin_df['previous_insulin_dose'].fillna(0)
        insulin_df['previous_meal_carbs'] = insulin_df['previous_meal_carbs'].fillna(0)
        insulin_df['hours_since_last_insulin'] = insulin_df['hours_since_last_insulin'].fillna(8)  # Default to 8 hours if unknown
        
        # Exercise features
        insulin_df['exercise_intensity'] = insulin_df['exercise_intensity'].fillna(0)
        insulin_df['exercise_duration'] = insulin_df['exercise_duration'].fillna(0)
        insulin_df['minutes_since_exercise'] = insulin_df['minutes_since_exercise'].fillna(360)  # Default to 6 hours if unknown
        
        # Add calculated features
        insulin_df['insulin_sensitivity_factor'] = 1800 / (insulin_df['weight'] * 0.453592)
        insulin_df['insulin_to_carb_ratio'] = 500 / (insulin_df['weight'] * 0.453592)
        
        # Target glucose level
        insulin_df['target_glucose'] = 120
        
        # Calculate insulin need based on glucose correction
        insulin_df['glucose_correction'] = (insulin_df['blood_glucose'] - insulin_df['target_glucose']) / (insulin_df['insulin_sensitivity_factor'] * 100)
        insulin_df['glucose_correction'] = insulin_df['glucose_correction'].apply(lambda x: max(0, x))  # Only positive corrections
        
        # Calculate insulin need based on carbohydrates
        insulin_df['carb_insulin'] = insulin_df['meal_carbs'] / insulin_df['insulin_to_carb_ratio']
        
        # Exercise effect on insulin sensitivity (increased sensitivity)
        insulin_df['exercise_factor'] = 1.0 - (
            (insulin_df['exercise_intensity'] * insulin_df['exercise_duration'] / 60) / 10
        ).clip(0, 0.5)  
        
        # Adjust for recency of exercise
        insulin_df['exercise_recency_factor'] = 1.0
        recent_exercise = insulin_df['minutes_since_exercise'] < 240  
        insulin_df.loc[recent_exercise, 'exercise_recency_factor'] = 0.8  # 20% reduction if recent exercise
        
        # Calculate theoretical insulin need (before safety adjustments)
        insulin_df['theoretical_insulin_need'] = (
            insulin_df['glucose_correction'] +
            insulin_df['carb_insulin']
        ) * insulin_df['exercise_recency_factor']
        
        # Calculate insulin on board (IOB) based on previous dose and time elapsed
        insulin_df['insulin_on_board'] = 0.0
        for i, row in insulin_df.iterrows():
            hours_since = row['hours_since_last_insulin']
            prev_dose = row['previous_insulin_dose']
            
            if not pd.isna(hours_since) and not pd.isna(prev_dose) and hours_since < 4:
                # Simple IOB calculation assuming linear decay over 4 hours
                iob_factor = max(0, 1 - (hours_since / 4))
                insulin_df.at[i, 'insulin_on_board'] = prev_dose * iob_factor
        
        # Add patient info and source tracking
        insulin_df['patient_id'] = patient_id
        insulin_df['weight'] = weight
        insulin_df['source_file'] = source_file
        
        # Add timestamp string for model output
        insulin_df['timestamp_str'] = insulin_df['timestamp'].dt.strftime('%Y-%m-%d %H:%M:%S')
        
        return insulin_df

    def create_training_datasets(self, glucose_df: pd.DataFrame, insulin_df: pd.DataFrame) -> Dict[str, pd.DataFrame]:
        """
        Create training datasets for glucose and insulin prediction models.
        
        Args:
            glucose_df: DataFrame with glucose readings
            insulin_df: DataFrame with insulin doses
            
        Returns:
            Dictionary with training datasets
        """
        datasets = {}
        
        # Process glucose prediction dataset
        if not glucose_df.empty:
            logger.info("Creating glucose prediction training dataset")
            
            # Select features for glucose prediction
            glucose_features = [
                'patient_id', 'weight', 'hour', 'day_of_week', 'is_morning', 
                'is_afternoon', 'is_evening', 'is_night', 'value', 'glucose_lag_1', 
                'glucose_lag_2', 'glucose_lag_3', 'glucose_velocity', 
                'glucose_rolling_mean', 'glucose_rolling_std', 'recent_insulin_dose',
                'minutes_since_insulin', 'recent_carb_intake', 'minutes_since_carbs',
                'recent_exercise_intensity', 'recent_exercise_duration', 
                'minutes_since_exercise', 'insulin_sensitivity_factor',
                'insulin_to_carb_ratio', 'timestamp_str'
            ]
            
            # Target variables
            target_vars = ['glucose_future_30min', 'glucose_future_60min']
            
            # Filter available columns
            available_columns = [col for col in glucose_features + target_vars if col in glucose_df.columns]
            
            # Check if we have the minimum required columns
            required_cols = ['value', 'timestamp_str']
            missing_cols = [col for col in required_cols if col not in available_columns]
            
            if missing_cols:
                logger.error(f"Missing required columns for glucose dataset: {missing_cols}")
                glucose_train_df = None
            else:
                # Create training dataset
                glucose_train_df = glucose_df[available_columns].copy()
                
                # Rename 'value' to 'current_glucose' for clarity
                glucose_train_df = glucose_train_df.rename(columns={'value': 'current_glucose'})
                
                # Drop rows with NaN in target variables
                target_vars_available = [col for col in target_vars if col in glucose_train_df.columns]
                if target_vars_available:
                    glucose_train_df = glucose_train_df.dropna(subset=target_vars_available)
                
                # Fill remaining NaN values
                glucose_train_df = glucose_train_df.fillna(0)
                
                # Additional feature engineering
                if 'recent_insulin_dose' in glucose_train_df.columns and 'minutes_since_insulin' in glucose_train_df.columns:
                    # Calculate insulin activity curve (biexponential model)
                    def insulin_activity(mins, peak_time=75):
                        if pd.isna(mins) or mins <= 0:
                            return 0
                        # Approximate activity curve
                        if mins < peak_time:
                            return (mins / peak_time) * np.exp(-(mins - peak_time) / 50)
                        else:
                            return np.exp(-(mins - peak_time) / 50)
                    
                    glucose_train_df['insulin_activity'] = glucose_train_df['minutes_since_insulin'].apply(insulin_activity)
                    glucose_train_df['active_insulin'] = glucose_train_df['recent_insulin_dose'] * glucose_train_df['insulin_activity']
                
                if 'recent_carb_intake' in glucose_train_df.columns and 'minutes_since_carbs' in glucose_train_df.columns:
                    # Calculate carb activity curve
                    def carb_activity(mins):
                        if pd.isna(mins) or mins <= 0:
                            return 0
                        # Approximate carb absorption curve
                        if mins < 30:
                            return mins / 30
                        elif mins < 180:
                            return np.exp(-(mins - 30) / 150)
                        else:
                            return 0
                    
                    glucose_train_df['carb_activity'] = glucose_train_df['minutes_since_carbs'].apply(carb_activity)
                    glucose_train_df['active_carbs'] = glucose_train_df['recent_carb_intake'] * glucose_train_df['carb_activity']
                
                # Save the training dataset
                datasets['glucose'] = glucose_train_df
                logger.info(f"Created glucose training dataset with {len(glucose_train_df)} rows and {len(glucose_train_df.columns)} features")
        else:
            logger.warning("No glucose data available for training dataset creation")
        
        # Process insulin prediction dataset
        if not insulin_df.empty:
            logger.info("Creating insulin prediction training dataset")
            
            # Select features for insulin prediction
            insulin_features = [
                'patient_id', 'weight', 'hour', 'day_of_week', 'is_morning', 
                'is_afternoon', 'is_evening', 'is_night', 'blood_glucose', 
                'meal_carbs', 'exercise_intensity', 'exercise_duration',
                'minutes_since_exercise', 'insulin_sensitivity_factor',
                'insulin_to_carb_ratio', 'glucose_correction', 'carb_insulin',
                'exercise_factor', 'exercise_recency_factor', 'insulin_on_board',
                'previous_insulin_dose', 'timestamp_str'
            ]
            
            # Target variable
            target_var = 'dose'
            
            # Filter available columns
            available_columns = [col for col in insulin_features if col in insulin_df.columns] + [target_var]
            
            # Check if we have the minimum required columns
            required_cols = ['blood_glucose', 'meal_carbs', target_var, 'timestamp_str']
            missing_cols = [col for col in required_cols if col not in available_columns]
            
            if missing_cols:
                logger.error(f"Missing required columns for insulin dataset: {missing_cols}")
                insulin_train_df = None
            else:
                # Create training dataset
                insulin_train_df = insulin_df[available_columns].copy()
                
                # Rename columns for clarity
                insulin_train_df = insulin_train_df.rename(columns={
                    target_var: 'insulin_dosage',
                    'meal_carbs': 'carb_intake',
                    'exercise_duration': 'exercise_time'
                })
                
                # Fill missing values
                insulin_train_df = insulin_train_df.fillna(0)
                
                # Save the training dataset
                datasets['insulin'] = insulin_train_df
                logger.info(f"Created insulin training dataset with {len(insulin_train_df)} rows and {len(insulin_train_df.columns)} features")
        else:
            logger.warning("No insulin data available for training dataset creation")
        
        return datasets
    
    def save_datasets(self, datasets: Dict[str, pd.DataFrame], prefix: str = "") -> Dict[str, str]:
        """
        Save datasets to CSV files.
        
        Args:
            datasets: Dictionary with datasets to save
            prefix: Prefix for filenames
            
        Returns:
            Dictionary with paths to saved files
        """
        paths = {}
        
        for name, df in datasets.items():
            if df is not None and not df.empty:
                # Create directory if it doesn't exist
                os.makedirs(self.output_dir, exist_ok=True)
                
                # Create filename
                filename = f"{prefix}_{name}_data.csv" if prefix else f"{name}_data.csv"
                file_path = os.path.join(self.output_dir, filename)
                
                # Save to CSV
                df.to_csv(file_path, index=False)
                paths[name] = file_path
                logger.info(f"Saved {name} dataset to {file_path}")
        
        return paths
    
    def create_example_dataset(self) -> Dict[str, pd.DataFrame]:
        """
        Create an example dataset for testing when real data is not available.
        
        Returns:
            Dictionary with example datasets
        """
        logger.info("Creating example datasets")
        
        # Set random seed for reproducibility
        np.random.seed(42)
        
        # Create example glucose dataset
        glucose_data = []
        
        # Create timestamps with 5-minute intervals
        start_date = datetime(2023, 1, 1, 0, 0)
        timestamps = [start_date + timedelta(minutes=5*i) for i in range(1000)]
        
        # Generate glucose values with realistic patterns
        base_glucose = 120
        for i, ts in enumerate(timestamps):
            # Time of day variations
            hour = ts.hour
            
            # Morning rise (dawn phenomenon)
            if 4 <= hour < 8:
                time_factor = 30
            # Post-meal rises
            elif 8 <= hour < 10 or 13 <= hour < 15 or 19 <= hour < 21:
                time_factor = 40
            # Late night
            elif 0 <= hour < 4:
                time_factor = -10
            else:
                time_factor = 0
            
            # Random variations
            random_var = np.random.normal(0, 15)
            
            # Trend components
            trend = 5 * np.sin(i / 100)
            
            # Calculate glucose value
            glucose = base_glucose + time_factor + random_var + trend
            glucose = max(40, min(400, glucose))  # Keep in realistic range
            
            # Record values for autocorrelation
            if i > 0:
                lag1 = glucose_data[i-1]['value']
            else:
                lag1 = glucose
                
            if i > 1:
                lag2 = glucose_data[i-2]['value']
            else:
                lag2 = glucose
                
            if i > 2:
                lag3 = glucose_data[i-3]['value']
            else:
                lag3 = glucose
            
            # Store data
            glucose_data.append({
                'timestamp': ts,
                'timestamp_str': ts.strftime('%Y-%m-%d %H:%M:%S'),
                'value': glucose,
                'glucose_lag_1': lag1,
                'glucose_lag_2': lag2,
                'glucose_lag_3': lag3,
                'patient_id': 1,
                'weight': 70,
                'hour': hour,
                'day_of_week': ts.weekday(),
                'is_morning': 1 if 5 <= hour <= 11 else 0,
                'is_afternoon': 1 if 12 <= hour <= 17 else 0,
                'is_evening': 1 if 18 <= hour <= 23 else 0,
                'is_night': 1 if 0 <= hour <= 4 else 0
            })
        
        # Add 30-min and 60-min future glucose as target
        for i in range(len(glucose_data)):
            if i + 6 < len(glucose_data):  # 30 min ahead (6 readings at 5-min intervals)
                glucose_data[i]['glucose_future_30min'] = glucose_data[i + 6]['value']
            else:
                glucose_data[i]['glucose_future_30min'] = None
                
            if i + 12 < len(glucose_data):  # 60 min ahead (12 readings at 5-min intervals)
                glucose_data[i]['glucose_future_60min'] = glucose_data[i + 12]['value']
            else:
                glucose_data[i]['glucose_future_60min'] = None
        
        # Create insulin and meal events
        insulin_data = []
        
        # Breakfast, lunch, dinner times
        meal_times = [
            # Breakfast times
            datetime(2023, 1, 1, 7, 30),
            datetime(2023, 1, 2, 7, 45),
            datetime(2023, 1, 3, 8, 0),
            datetime(2023, 1, 4, 7, 15),
            # Lunch times
            datetime(2023, 1, 1, 12, 30),
            datetime(2023, 1, 2, 13, 0),
            datetime(2023, 1, 3, 12, 45),
            datetime(2023, 1, 4, 13, 15),
            # Dinner times
            datetime(2023, 1, 1, 18, 30),
            datetime(2023, 1, 2, 19, 0),
            datetime(2023, 1, 3, 18, 45),
            datetime(2023, 1, 4, 19, 15),
        ]
        
        # Correction doses
        correction_times = [
            datetime(2023, 1, 1, 10, 30),
            datetime(2023, 1, 2, 15, 0),
            datetime(2023, 1, 3, 22, 45),
        ]
        
        # Generate insulin doses for each meal
        for meal_time in meal_times:
            # Get glucose level near this time
            glucose_at_meal = next(
                (g['value'] for g in glucose_data 
                 if abs((g['timestamp'] - meal_time).total_seconds()) < 900),  # Within 15 minutes
                120  # Default if not found
            )
            
            # Determine meal type based on hour
            hour = meal_time.hour
            if hour < 11:  # Breakfast
                carbs = np.random.randint(30, 60)
            elif hour < 16:  # Lunch
                carbs = np.random.randint(45, 75)
            else:  # Dinner
                carbs = np.random.randint(60, 90)
            
            # Calculate insulin components
            carb_ratio = 10  # 1 unit per 10g of carbs
            correction_factor = 50  # 1 unit drops glucose by 50 mg/dL
            target_glucose = 120
            
            # Carb insulin
            carb_insulin = carbs / carb_ratio
            
            # Correction insulin
            correction = max(0, (glucose_at_meal - target_glucose) / correction_factor)
            
            # Total insulin dose
            total_dose = carb_insulin + correction
            
            # Add some variation
            total_dose = total_dose * np.random.uniform(0.9, 1.1)
            
            # Round to realistic dose
            total_dose = round(total_dose * 2) / 2  # Round to nearest 0.5
            
            insulin_data.append({
                'timestamp': meal_time,
                'timestamp_str': meal_time.strftime('%Y-%m-%d %H:%M:%S'),
                'meal_carbs': carbs,
                'blood_glucose': glucose_at_meal,
                'dose': total_dose,
                'is_meal_bolus': 1,
                'patient_id': 1,
                'weight': 70,
                'hour': hour,
                'day_of_week': meal_time.weekday(),
                'is_morning': 1 if 5 <= hour <= 11 else 0,
                'is_afternoon': 1 if 12 <= hour <= 17 else 0,
                'is_evening': 1 if 18 <= hour <= 23 else 0,
                'is_night': 1 if 0 <= hour <= 4 else 0,
                'insulin_sensitivity_factor': 50,
                'insulin_to_carb_ratio': 10
            })
        
        # Generate correction doses
        for correction_time in correction_times:
            # Get glucose level at this time
            glucose_at_correction = next(
                (g['value'] for g in glucose_data 
                 if abs((g['timestamp'] - correction_time).total_seconds()) < 900),  # Within 15 minutes
                200  # Default if not found (high glucose triggering correction)
            )
            
            # Ensure glucose is high enough to warrant correction
            if glucose_at_correction < 150:
                glucose_at_correction = np.random.randint(150, 250)
            
            # Calculate correction insulin
            correction_factor = 50
            target_glucose = 120
            correction = (glucose_at_correction - target_glucose) / correction_factor
            
            # Round to realistic dose
            correction = round(correction * 2) / 2  # Round to nearest 0.5
            
            hour = correction_time.hour
            insulin_data.append({
                'timestamp': correction_time,
                'timestamp_str': correction_time.strftime('%Y-%m-%d %H:%M:%S'),
                'meal_carbs': 0,  # No carbs for correction
                'blood_glucose': glucose_at_correction,
                'dose': correction,
                'is_meal_bolus': 0,
                'patient_id': 1,
                'weight': 70,
                'hour': hour,
                'day_of_week': correction_time.weekday(),
                'is_morning': 1 if 5 <= hour <= 11 else 0,
                'is_afternoon': 1 if 12 <= hour <= 17 else 0,
                'is_evening': 1 if 18 <= hour <= 23 else 0,
                'is_night': 1 if 0 <= hour <= 4 else 0,
                'insulin_sensitivity_factor': 50,
                'insulin_to_carb_ratio': 10
            })
        
        # Sort insulin data by timestamp
        insulin_data = sorted(insulin_data, key=lambda x: x['timestamp'])
        
        # Create DataFrames
        glucose_df = pd.DataFrame(glucose_data)
        insulin_df = pd.DataFrame(insulin_data)
        
        # Add exercise effects to glucose data
        exercise_times = [
            datetime(2023, 1, 1, 16, 0),  # Afternoon exercise
            datetime(2023, 1, 2, 7, 0),   # Morning exercise
            datetime(2023, 1, 3, 18, 0),  # Evening exercise
        ]
        
        for ex_time in exercise_times:
            # Find glucose indices around exercise time
            exercise_start_idx = next(
                (i for i, g in enumerate(glucose_data) 
                 if g['timestamp'] >= ex_time),
                None
            )
            
            if exercise_start_idx is not None:
                # Exercise duration in 5-min intervals
                duration_intervals = np.random.randint(6, 18)  # 30-90 minutes
                intensity = np.random.randint(1, 4)  # 1-3 intensity
                
                # Apply exercise effect to glucose
                for i in range(exercise_start_idx, min(exercise_start_idx + duration_intervals + 24, len(glucose_data))):
                    # Duration effect
                    if i < exercise_start_idx + duration_intervals:
                        # During exercise
                        effect = -intensity * 2 * np.random.uniform(0.8, 1.2)
                    else:
                        # After exercise (continued effect)
                        time_since = i - (exercise_start_idx + duration_intervals)
                        effect = -intensity * np.exp(-time_since / 12) * np.random.uniform(0.8, 1.2)
                    
                    # Apply effect
                    glucose_df.at[i, 'value'] += effect
                    
                    # Update future glucose targets
                    future_30 = i + 6
                    if future_30 < len(glucose_data) and 'glucose_future_30min' in glucose_df.columns:
                        glucose_df.at[i, 'glucose_future_30min'] = glucose_df.at[future_30, 'value']
                        
                    future_60 = i + 12
                    if future_60 < len(glucose_data) and 'glucose_future_60min' in glucose_df.columns:
                        glucose_df.at[i, 'glucose_future_60min'] = glucose_df.at[future_60, 'value']
                
                # Add exercise info to relevant glucose readings
                for i in range(exercise_start_idx, min(exercise_start_idx + duration_intervals + 36, len(glucose_data))):
                    if i < exercise_start_idx + duration_intervals:
                        # During exercise
                        glucose_df.at[i, 'recent_exercise_intensity'] = intensity
                        glucose_df.at[i, 'recent_exercise_duration'] = 5 * (i - exercise_start_idx + 1)  # 5 min intervals
                        glucose_df.at[i, 'minutes_since_exercise'] = 0
                    else:
                        # After exercise
                        glucose_df.at[i, 'recent_exercise_intensity'] = intensity
                        glucose_df.at[i, 'recent_exercise_duration'] = 5 * duration_intervals
                        glucose_df.at[i, 'minutes_since_exercise'] = 5 * (i - (exercise_start_idx + duration_intervals))
        
        # Add insulin and carb info to glucose data
        glucose_df['recent_insulin_dose'] = 0
        glucose_df['recent_carb_intake'] = 0
        glucose_df['minutes_since_insulin'] = 1440  # Default to 24 hours
        glucose_df['minutes_since_carbs'] = 1440    # Default to 24 hours
        
        for insulin_row in insulin_data:
            insulin_time = insulin_time = insulin_row['timestamp']
            
            # Find glucose readings after this insulin dose
            for i, glucose_row in glucose_df.iterrows():
                glucose_time = glucose_row['timestamp']
                
                # Only process if glucose reading is after insulin
                if glucose_time >= insulin_time:
                    # Minutes since insulin
                    minutes_diff = (glucose_time - insulin_time).total_seconds() / 60
                    
                    # Update if this is the most recent insulin dose
                    if minutes_diff < glucose_df.at[i, 'minutes_since_insulin']:
                        glucose_df.at[i, 'recent_insulin_dose'] = insulin_row['dose']
                        glucose_df.at[i, 'minutes_since_insulin'] = minutes_diff
                        
                        # Carb intake
                        glucose_df.at[i, 'recent_carb_intake'] = insulin_row['meal_carbs']
                        glucose_df.at[i, 'minutes_since_carbs'] = minutes_diff
        
        # Fill in missing exercise data
        if 'recent_exercise_intensity' not in glucose_df.columns:
            glucose_df['recent_exercise_intensity'] = 0
            
        if 'recent_exercise_duration' not in glucose_df.columns:
            glucose_df['recent_exercise_duration'] = 0
            
        if 'minutes_since_exercise' not in glucose_df.columns:
            glucose_df['minutes_since_exercise'] = 1440  # Default to 24 hours
        
        # Ensure no NaN values
        glucose_df = glucose_df.fillna(0)
        insulin_df = insulin_df.fillna(0)
        
        logger.info(f"Created example glucose dataset with {len(glucose_df)} rows")
        logger.info(f"Created example insulin dataset with {len(insulin_df)} rows")
        
        return {
            'glucose': glucose_df,
            'insulin': insulin_df
        }