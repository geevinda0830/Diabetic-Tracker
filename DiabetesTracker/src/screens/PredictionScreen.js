// src/screens/PredictionScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  FlatList,
  Alert,
  ActivityIndicator,
  Platform,
  SafeAreaView
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../utils/theme';
import { saveMeal, saveGlucoseReading, saveInsulinDose } from '../services/api';

// Enhanced Exercise Types with MET values
const EXERCISE_TYPES = {
  CARDIO: {
    WALKING_CASUAL: { name: 'Walking (Casual)', met: 3.0, category: 'Cardio' },
    WALKING_BRISK: { name: 'Walking (Brisk)', met: 4.5, category: 'Cardio' },
    JOGGING: { name: 'Jogging', met: 7.0, category: 'Cardio' },
    RUNNING: { name: 'Running', met: 9.0, category: 'Cardio' },
    CYCLING_LEISURE: { name: 'Cycling (Leisure)', met: 4.0, category: 'Cardio' },
    CYCLING_MODERATE: { name: 'Cycling (Moderate)', met: 6.8, category: 'Cardio' },
    CYCLING_VIGOROUS: { name: 'Cycling (Vigorous)', met: 10.0, category: 'Cardio' },
    SWIMMING_LEISURE: { name: 'Swimming (Leisure)', met: 6.0, category: 'Cardio' },
    SWIMMING_LAPS: { name: 'Swimming (Laps)', met: 8.0, category: 'Cardio' },
    DANCING: { name: 'Dancing', met: 5.0, category: 'Cardio' },
    AEROBICS: { name: 'Aerobics', met: 7.0, category: 'Cardio' }
  },
  STRENGTH: {
    WEIGHT_TRAINING_LIGHT: { name: 'Weight Training (Light)', met: 3.0, category: 'Strength' },
    WEIGHT_TRAINING_MODERATE: { name: 'Weight Training (Moderate)', met: 5.0, category: 'Strength' },
    WEIGHT_TRAINING_VIGOROUS: { name: 'Weight Training (Vigorous)', met: 6.0, category: 'Strength' },
    BODYWEIGHT: { name: 'Bodyweight Exercises', met: 4.0, category: 'Strength' },
    RESISTANCE_BANDS: { name: 'Resistance Bands', met: 3.5, category: 'Strength' }
  },
  FLEXIBILITY: {
    YOGA_HATHA: { name: 'Yoga (Hatha)', met: 2.5, category: 'Flexibility' },
    YOGA_VINYASA: { name: 'Yoga (Vinyasa)', met: 4.0, category: 'Flexibility' },
    YOGA_POWER: { name: 'Yoga (Power)', met: 5.0, category: 'Flexibility' },
    PILATES: { name: 'Pilates', met: 3.0, category: 'Flexibility' },
    STRETCHING: { name: 'Stretching', met: 2.3, category: 'Flexibility' },
    TAI_CHI: { name: 'Tai Chi', met: 3.0, category: 'Flexibility' }
  },
  SPORTS: {
    TENNIS: { name: 'Tennis', met: 7.0, category: 'Sports' },
    BASKETBALL: { name: 'Basketball', met: 8.0, category: 'Sports' },
    SOCCER: { name: 'Soccer', met: 10.0, category: 'Sports' },
    BADMINTON: { name: 'Badminton', met: 5.5, category: 'Sports' },
    TABLE_TENNIS: { name: 'Table Tennis', met: 4.0, category: 'Sports' },
    VOLLEYBALL: { name: 'Volleyball', met: 6.0, category: 'Sports' }
  }
};

const ENVIRONMENTS = {
  INDOOR_GYM: { name: 'Indoor Gym', factor: 1.0, description: 'Controlled temperature, equipment available' },
  INDOOR_HOME: { name: 'Home Indoor', factor: 0.9, description: 'Limited space, basic equipment' },
  OUTDOOR_PARK: { name: 'Outdoor Park', factor: 1.1, description: 'Fresh air, varied terrain' },
  OUTDOOR_TRACK: { name: 'Outdoor Track', factor: 1.0, description: 'Flat surface, measured distance' },
  OUTDOOR_TRAIL: { name: 'Outdoor Trail', factor: 1.2, description: 'Uneven terrain, natural obstacles' },
  OUTDOOR_BEACH: { name: 'Beach/Sand', factor: 1.3, description: 'Soft surface, increased resistance' },
  POOL_INDOOR: { name: 'Indoor Pool', factor: 1.0, description: 'Controlled temperature, chlorinated' },
  POOL_OUTDOOR: { name: 'Outdoor Pool', factor: 1.1, description: 'Natural light, variable temperature' },
  HOT_WEATHER: { name: 'Hot Weather (>30°C)', factor: 1.2, description: 'Increased sweat rate, higher intensity' },
  COLD_WEATHER: { name: 'Cold Weather (<10°C)', factor: 0.9, description: 'Body works harder to maintain temperature' }
};

// Comprehensive Food Database with Detailed Carb Content
const FOOD_DATABASE = [
  { id: 1, name: 'White Rice', carbsPer100g: 28.2, category: 'Grains' },
  { id: 2, name: 'Brown Rice', carbsPer100g: 25.6, category: 'Grains' },
  { id: 3, name: 'White Bread', carbsPer100g: 49.6, category: 'Grains' },
  { id: 4, name: 'Whole Wheat Bread', carbsPer100g: 43.1, category: 'Grains' },
  { id: 5, name: 'Apple', carbsPer100g: 13.8, category: 'Fruits' },
  { id: 6, name: 'Banana', carbsPer100g: 22.8, category: 'Fruits' },
  { id: 7, name: 'Orange', carbsPer100g: 12.2, category: 'Fruits' },
  { id: 8, name: 'Grapes', carbsPer100g: 16.8, category: 'Fruits' },
  { id: 9, name: 'Mango', carbsPer100g: 15.0, category: 'Fruits' },
  { id: 10, name: 'Potato', carbsPer100g: 17.0, category: 'Vegetables' },
  { id: 11, name: 'Sweet Potato', carbsPer100g: 20.7, category: 'Vegetables' },
  { id: 12, name: 'Pasta (cooked)', carbsPer100g: 31.5, category: 'Grains' },
  { id: 13, name: 'Oatmeal', carbsPer100g: 66.3, category: 'Grains' },
  { id: 14, name: 'Quinoa', carbsPer100g: 64.2, category: 'Grains' },
  { id: 15, name: 'Milk (1%)', carbsPer100g: 5.0, category: 'Dairy' },
  { id: 16, name: 'Yogurt (plain)', carbsPer100g: 6.0, category: 'Dairy' },
  { id: 17, name: 'Cheese', carbsPer100g: 1.3, category: 'Dairy' },
  { id: 18, name: 'Chicken Breast', carbsPer100g: 0, category: 'Protein' },
  { id: 19, name: 'Salmon', carbsPer100g: 0, category: 'Protein' },
  { id: 20, name: 'Beans (black)', carbsPer100g: 23.0, category: 'Legumes' }
];

const GlucosePredictionScreen = ({ navigation }) => {
  // State Management
  const [currentGlucose, setCurrentGlucose] = useState('');
  const [insulinDose, setInsulinDose] = useState('');
  const [exerciseDuration, setExerciseDuration] = useState('');
  
  // Food-related States
  const [foodItems, setFoodItems] = useState([]);
  const [isFoodModalVisible, setIsFoodModalVisible] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const [foodWeight, setFoodWeight] = useState('');
  const [tempSelectedFood, setTempSelectedFood] = useState(null);
  const [foodSearch, setFoodSearch] = useState('');

  // Enhanced Exercise states
  const [selectedExerciseType, setSelectedExerciseType] = useState('WALKING_CASUAL');
  const [exerciseCategory, setExerciseCategory] = useState('CARDIO');
  const [exerciseMetValue, setExerciseMetValue] = useState(3.0);
  const [exerciseIntensity, setExerciseIntensity] = useState('1.0');
  const [selectedEnvironment, setSelectedEnvironment] = useState('INDOOR_GYM');
  const [userWeight, setUserWeight] = useState('70');
  
  // Prediction State
  const [predictionResult, setPredictionResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Calculate Total Carbohydrates
  const calculateTotalCarbs = () => {
    return foodItems.reduce((total, item) => 
      total + (item.carbsPer100g * item.weight / 100), 0
    ).toFixed(1);
  };

  // Remove Food Item
  const removeFoodItem = (index) => {
    const updatedItems = [...foodItems];
    updatedItems.splice(index, 1);
    setFoodItems(updatedItems);
  };

  // Exercise modal functions
  const showExerciseTypeModal = () => {
    const categoryOptions = Object.keys(EXERCISE_TYPES).map(category => ({
      text: category.charAt(0) + category.slice(1).toLowerCase(),
      onPress: () => showExercisesByCategory(category)
    }));
    
    categoryOptions.push({ text: "Cancel", style: "cancel" });
    Alert.alert("Select Exercise Category", "Choose a category first", categoryOptions);
  };

  const showExercisesByCategory = (category) => {
    const exercises = EXERCISE_TYPES[category];
    const exerciseOptions = Object.keys(exercises).map(key => ({
      text: exercises[key].name,
      onPress: () => {
        setSelectedExerciseType(key);
        setExerciseCategory(category);
        setExerciseMetValue(exercises[key].met);
      }
    }));
    
    exerciseOptions.push({ text: "Back", onPress: () => showExerciseTypeModal() });
    Alert.alert(
      `${category.charAt(0) + category.slice(1).toLowerCase()} Exercises`,
      "Select your exercise type",
      exerciseOptions
    );
  };

  const showEnvironmentModal = () => {
    const environmentOptions = Object.keys(ENVIRONMENTS).map(key => ({
      text: ENVIRONMENTS[key].name,
      onPress: () => setSelectedEnvironment(key)
    }));
    
    environmentOptions.push({ text: "Cancel", style: "cancel" });
    Alert.alert("Select Environment", "Choose your exercise environment", environmentOptions);
  };

  // Helper functions
  const getExerciseDisplayName = () => {
    for (const category of Object.keys(EXERCISE_TYPES)) {
      if (EXERCISE_TYPES[category][selectedExerciseType]) {
        return EXERCISE_TYPES[category][selectedExerciseType].name;
      }
    }
    return "Select Exercise Type";
  };

  const getEnvironmentDisplayName = () => {
    return ENVIRONMENTS[selectedEnvironment]?.name || "Select Environment";
  };

  // Save meal data to database
  const saveMealData = async () => {
    if (foodItems.length === 0) return;
    
    try {
      const mealData = {
        totalCarbs: parseFloat(calculateTotalCarbs()),
        foodItems: foodItems.map(item => ({
          name: item.name,
          carbsPer100g: item.carbsPer100g,
          weight: item.weight,
          carbs: (item.carbsPer100g * item.weight / 100).toFixed(1)
        })),
        timestamp: new Date().toISOString()
      };
      
      await saveMeal(mealData);
      console.log("Meal data saved successfully");
      return true;
    } catch (error) {
      console.error("Error saving meal data:", error);
      return false;
    }
  };
  
  // Save insulin dose to database
  const saveInsulinData = async () => {
    if (!insulinDose || parseFloat(insulinDose) <= 0) return;
    
    try {
      const insulinData = {
        units: parseFloat(insulinDose),
        type: 'rapid',
        bloodGlucose: parseFloat(currentGlucose) || 0,
        timestamp: new Date().toISOString(),
        notes: `Manual entry for glucose prediction. Carbs: ${calculateTotalCarbs()}g`
      };
      
      await saveInsulinDose(insulinData);
      console.log("Insulin data saved successfully");
      return true;
    } catch (error) {
      console.error("Error saving insulin data:", error);
      return false;
    }
  };
  
  // Save glucose prediction to database
  const saveGlucosePrediction = async (predictedValue) => {
    try {
      const glucoseData = {
        value: predictedValue,
        timestamp: new Date(Date.now() + 60*60*1000).toISOString(),
        notes: 'Predicted glucose value',
        mealState: 'after'
      };
      
      await saveGlucoseReading(glucoseData);
      console.log("Glucose prediction saved successfully");
      return true;
    } catch (error) {
      console.error("Error saving glucose prediction:", error);
      return false;
    }
  };

  // Filter foods based on search
  const filteredFoods = foodSearch 
    ? FOOD_DATABASE.filter(food => 
        food.name.toLowerCase().includes(foodSearch.toLowerCase()))
    : FOOD_DATABASE;

  // Enhanced Predict Glucose Level
  const predictGlucose = async () => {
    try {
      if (!currentGlucose) {
        Alert.alert('Error', 'Please enter current glucose level');
        return;
      }

      setIsLoading(true);

      await saveMealData();
      await saveInsulinData();

      const glucose = parseFloat(currentGlucose);
      const insulin = parseFloat(insulinDose) || 0;
      const totalCarbs = parseFloat(calculateTotalCarbs());
      const exercise = parseFloat(exerciseDuration) || 0;
      const intensity = parseFloat(exerciseIntensity);
      const weight = parseFloat(userWeight) || 70;
      const environmentFactor = ENVIRONMENTS[selectedEnvironment]?.factor || 1.0;

      // Enhanced prediction data
      const data = {
        currentGlucose: glucose,
        insulinDose: insulin,
        totalCarbs: totalCarbs,
        exerciseDuration: exercise,
        exerciseIntensity: intensity,
        exerciseType: selectedExerciseType,
        exerciseCategory: exerciseCategory,
        exerciseMetValue: exerciseMetValue,
        environment: selectedEnvironment,
        environmentFactor: environmentFactor,
        weight: weight
      };

      // Try API call first
      try {
        const response = await fetch('http://10.0.2.2:5002/api/predict-glucose', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        
        if (!response.ok) throw new Error('API request failed');
        
        const result = await response.json();
        await saveGlucosePrediction(result.predictedGlucose);
        setPredictionResult(result);
        
      } catch (error) {
        console.error('API Error:', error);
        
        // Enhanced fallback calculation
        const insulinEffect = insulin * -3;
        const carbEffect = totalCarbs * 0.2;
        const baseExerciseEffect = exercise * intensity * -0.1;
        
        // Enhanced exercise calculation
        const metMultiplier = exerciseMetValue / 5.0;
        const envMultiplier = environmentFactor;
        const exerciseEffectiveness = (exercise / 60) * intensity * (exerciseMetValue / 5.0) * environmentFactor;
        const effectivenessBonus = 1 + (exerciseEffectiveness * 0.2);
        
        const enhancedExerciseEffect = baseExerciseEffect * metMultiplier * envMultiplier * effectivenessBonus;

        const predictedGlucose = Math.round(
          Math.max(40, Math.min(400, glucose + insulinEffect + carbEffect + enhancedExerciseEffect))
        );

        await saveGlucosePrediction(predictedGlucose);

        const caloriesBurned = Math.round(exerciseMetValue * weight * exercise / 60);

        setPredictionResult({
          predictedGlucose,
          details: {
            insulinEffect: insulinEffect.toFixed(1),
            carbEffect: carbEffect.toFixed(1),
            exerciseEffect: enhancedExerciseEffect.toFixed(1),
            exerciseType: getExerciseDisplayName(),
            metValue: exerciseMetValue,
            environment: getEnvironmentDisplayName(),
            environmentFactor: environmentFactor,
            exerciseEffectiveness: exerciseEffectiveness.toFixed(2),
            caloriesBurned: caloriesBurned
          },
          method: 'enhanced-fallback'
        });
      }
      
      Alert.alert(
        'Prediction Complete',
        `Enhanced glucose prediction completed!`,
        [
          { text: 'Stay on this screen', style: 'cancel' },
          { text: 'Return to Home', onPress: () => navigation.navigate('Home', { refresh: new Date().getTime() }) }
        ]
      );
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Prediction Error', 'Unable to calculate glucose level');
    } finally {
      setIsLoading(false);
    }
  };

  // Add Food Item
  const addFoodItem = () => {
    if (!tempSelectedFood || !foodWeight || parseFloat(foodWeight) <= 0) {
      Alert.alert('Error', 'Please select a food and enter a valid weight');
      return;
    }
    
    const newItem = {
      ...tempSelectedFood,
      weight: parseFloat(foodWeight)
    };
    
    setFoodItems([...foodItems, newItem]);
    setTempSelectedFood(null);
    setFoodWeight('');
    setIsFoodModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Enhanced Glucose Prediction</Text>
        <View style={styles.placeholder} />
      </View>

      <FlatList
        data={[1]} 
        keyExtractor={() => "main-content"}
        showsVerticalScrollIndicator={true}
        renderItem={() => (
          <View style={styles.content}>
            {/* Current Glucose Input */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Current Glucose Level</Text>
              <View style={styles.inputContainer}>
                <Icon name="analytics-outline" size={20} color={colors.text.secondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={currentGlucose}
                  onChangeText={setCurrentGlucose}
                  keyboardType="numeric"
                  placeholder="Enter current glucose (mg/dL)"
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            {/* Insulin Dose Input */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Insulin Dose</Text>
              <View style={styles.inputContainer}>
                <Icon name="fitness-outline" size={20} color={colors.text.secondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={insulinDose}
                  onChangeText={setInsulinDose}
                  keyboardType="numeric"
                  placeholder="Enter insulin dose (units)"
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            {/* Food Intake Section */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Food Intake</Text>
                <Text style={styles.totalCarbs}>Total: {calculateTotalCarbs()} g</Text>
              </View>
              
              <TouchableOpacity 
                style={styles.addFoodButton}
                onPress={() => {
                  setIsFoodModalVisible(true);
                  setTempSelectedFood(null);
                  setFoodWeight('');
                  setFoodSearch('');
                }}
              >
                <Icon name="add-circle-outline" size={20} color={colors.primary} />
                <Text style={styles.addFoodText}>Add Food Item</Text>
              </TouchableOpacity>

              {/* Food Items List */}
              {foodItems.length === 0 ? (
                <Text style={styles.emptyFoodText}>No food items added</Text>
              ) : (
                <View style={styles.foodItemsList}>
                  {foodItems.map((item, index) => (
                    <View key={index} style={styles.foodItemContainer}>
                      <View style={styles.foodItemDetails}>
                        <Text style={styles.foodItemName}>{item.name}</Text>
                        <Text style={styles.foodItemWeight}>{item.weight}g</Text>
                      </View>
                      <Text style={styles.foodItemCarbs}>
                        {((item.carbsPer100g * item.weight) / 100).toFixed(1)}g carbs
                      </Text>
                      <TouchableOpacity 
                        style={styles.removeFoodButton} 
                        onPress={() => removeFoodItem(index)}
                      >
                        <Icon name="trash-outline" size={20} color={colors.danger} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* Enhanced Exercise Section */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Enhanced Exercise Details</Text>
              
              {/* Exercise Category & Type */}
              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Exercise Category & Type</Text>
                <View style={styles.pickerContainer}>
                  <Icon name="fitness-outline" size={20} color={colors.text.secondary} style={styles.inputIcon} />
                  <View style={styles.pickerWrapper}>
                    <TouchableOpacity 
                      style={styles.pickerButton}
                      onPress={showExerciseTypeModal}
                    >
                      <View>
                        <Text style={styles.pickerText}>{getExerciseDisplayName()}</Text>
                        {selectedExerciseType !== 'WALKING_CASUAL' && (
                          <Text style={styles.pickerSubtext}>
                            {exerciseCategory.charAt(0) + exerciseCategory.slice(1).toLowerCase()} • MET: {exerciseMetValue}
                          </Text>
                        )}
                      </View>
                      <Icon name="chevron-down" size={20} color={colors.text.secondary} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
              
              {/* Exercise Intensity */}
              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Exercise Intensity</Text>
                <View style={styles.intensitySelector}>
                  <TouchableOpacity
                    style={[
                      styles.intensityOption,
                      exerciseIntensity === "0.7" && styles.intensityOptionSelected
                    ]}
                    onPress={() => setExerciseIntensity("0.7")}
                  >
                    <Text style={[
                      styles.intensityText,
                      exerciseIntensity === "0.7" && styles.intensityTextSelected
                    ]}>Light</Text>
                    <Text style={[
                      styles.intensitySubtext,
                      exerciseIntensity === "0.7" && styles.intensityTextSelected
                    ]}>Easy pace</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.intensityOption,
                      exerciseIntensity === "1.0" && styles.intensityOptionSelected
                    ]}
                    onPress={() => setExerciseIntensity("1.0")}
                  >
                    <Text style={[
                      styles.intensityText,
                      exerciseIntensity === "1.0" && styles.intensityTextSelected
                    ]}>Moderate</Text>
                    <Text style={[
                      styles.intensitySubtext,
                      exerciseIntensity === "1.0" && styles.intensityTextSelected
                    ]}>Can talk</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.intensityOption,
                      exerciseIntensity === "1.3" && styles.intensityOptionSelected
                    ]}
                    onPress={() => setExerciseIntensity("1.3")}
                  >
                    <Text style={[
                      styles.intensityText,
                      exerciseIntensity === "1.3" && styles.intensityTextSelected
                    ]}>Vigorous</Text>
                    <Text style={[
                      styles.intensitySubtext,
                      exerciseIntensity === "1.3" && styles.intensityTextSelected
                    ]}>Hard effort</Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              {/* Exercise Environment */}
              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Environment & Conditions</Text>
                <View style={styles.pickerContainer}>
                  <Icon name="earth-outline" size={20} color={colors.text.secondary} style={styles.inputIcon} />
                  <View style={styles.pickerWrapper}>
                    <TouchableOpacity 
                      style={styles.pickerButton}
                      onPress={showEnvironmentModal}
                    >
                      <View>
                        <Text style={styles.pickerText}>{getEnvironmentDisplayName()}</Text>
                        {selectedEnvironment !== 'INDOOR_GYM' && ENVIRONMENTS[selectedEnvironment] && (
                          <Text style={styles.pickerSubtext}>
                            {ENVIRONMENTS[selectedEnvironment].description}
                          </Text>
                        )}
                      </View>
                      <Icon name="chevron-down" size={20} color={colors.text.secondary} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
              
              {/* Exercise Duration */}
              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Exercise Duration (minutes)</Text>
                <View style={styles.inputContainer}>
                  <Icon name="time-outline" size={20} color={colors.text.secondary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={exerciseDuration}
                    onChangeText={setExerciseDuration}
                    keyboardType="numeric"
                    placeholder="Enter exercise duration"
                    placeholderTextColor="#999"
                  />
                </View>
                {/* Duration recommendations */}
                <View style={styles.durationRecommendations}>
                  <TouchableOpacity 
                    style={styles.durationChip}
                    onPress={() => setExerciseDuration('15')}
                  >
                    <Text style={styles.durationChipText}>15 min</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.durationChip}
                    onPress={() => setExerciseDuration('30')}
                  >
                    <Text style={styles.durationChipText}>30 min</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.durationChip}
                    onPress={() => setExerciseDuration('45')}
                  >
                    <Text style={styles.durationChipText}>45 min</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.durationChip}
                    onPress={() => setExerciseDuration('60')}
                  >
                    <Text style={styles.durationChipText}>60 min</Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              {/* Exercise Impact Preview */}
              {exerciseDuration && parseFloat(exerciseDuration) > 0 && (
                <View style={styles.exercisePreview}>
                  <Text style={styles.exercisePreviewTitle}>Estimated Exercise Impact</Text>
                  <View style={styles.exercisePreviewRow}>
                    <Text style={styles.exercisePreviewLabel}>Calories Burned:</Text>
                    <Text style={styles.exercisePreviewValue}>
                      {Math.round(exerciseMetValue * parseFloat(userWeight || 70) * parseFloat(exerciseDuration) / 60)} cal
                    </Text>
                  </View>
                  <View style={styles.exercisePreviewRow}>
                    <Text style={styles.exercisePreviewLabel}>Glucose Reduction:</Text>
                    <Text style={styles.exercisePreviewValue}>
                      ~{Math.round(parseFloat(exerciseDuration) * parseFloat(exerciseIntensity) * (ENVIRONMENTS[selectedEnvironment]?.factor || 1.0) * 0.8)} mg/dL
                    </Text>
                  </View>
                </View>
              )}
            </View>

            {/* Weight Input */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Body Weight</Text>
              <View style={styles.inputContainer}>
                <Icon name="body-outline" size={20} color={colors.text.secondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={userWeight}
                  onChangeText={setUserWeight}
                  keyboardType="numeric"
                  placeholder="Enter your weight (kg)"
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            {/* Enhanced Predict Button */}
            <TouchableOpacity 
              style={styles.predictButton}
              onPress={predictGlucose}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.predictButtonText}>🔮 Predict Glucose Level</Text>
              )}
            </TouchableOpacity>

            {/* Enhanced Prediction Result */}
            {predictionResult && (
              <View style={styles.resultContainer}>
                <Text style={styles.resultTitle}>Enhanced Glucose Prediction</Text>
                <Text style={styles.resultValue}>
                  {predictionResult.predictedGlucose} mg/dL
                </Text>
                
                <View style={styles.resultDetailsContainer}>
                  <View style={styles.detailItem}>
                    <View style={styles.detailIconContainer}>
                      <Icon name="fitness-outline" size={18} color="#fff" />
                    </View>
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>Insulin Effect</Text>
                      <Text style={styles.detailValue}>{predictionResult.details.insulinEffect} mg/dL</Text>
                    </View>
                  </View>
                  
                  <View style={styles.detailItem}>
                    <View style={[styles.detailIconContainer, { backgroundColor: colors.accent }]}>
                      <Icon name="restaurant-outline" size={18} color="#fff" />
                    </View>
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>Carb Effect</Text>
                      <Text style={styles.detailValue}>{predictionResult.details.carbEffect} mg/dL</Text>
                    </View>
                  </View>
                  
                  <View style={styles.detailItem}>
                    <View style={[styles.detailIconContainer, { backgroundColor: colors.success }]}>
                      <Icon name="walk-outline" size={18} color="#fff" />
                    </View>
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>Enhanced Exercise Effect</Text>
                      <Text style={styles.detailValue}>{predictionResult.details.exerciseEffect} mg/dL</Text>
                    </View>
                  </View>

                  {/* Enhanced Exercise Details */}
                  <View style={styles.enhancedDetailsSection}>
                    <Text style={styles.enhancedDetailsTitle}>Exercise Analysis</Text>
                    <Text style={styles.enhancedDetailText}>Type: {predictionResult.details.exerciseType}</Text>
                    <Text style={styles.enhancedDetailText}>MET Value: {predictionResult.details.metValue}</Text>
                    <Text style={styles.enhancedDetailText}>Environment: {predictionResult.details.environment}</Text>
                    <Text style={styles.enhancedDetailText}>Environment Factor: {predictionResult.details.environmentFactor}x</Text>
                    <Text style={styles.enhancedDetailText}>Exercise Effectiveness: {predictionResult.details.exerciseEffectiveness}</Text>
                    <Text style={styles.enhancedDetailText}>Calories Burned: {predictionResult.details.caloriesBurned} cal</Text>
                  </View>
                  
                  <View style={styles.disclaimerContainer}>
                    <Icon name="information-circle-outline" size={16} color={colors.text.secondary} />
                    <Text style={styles.disclaimerText}>
                      Enhanced prediction considers exercise type, intensity, and environment. Results may vary based on individual factors.
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        )}
      />

      {/* Food Selection Modal */}
      <Modal
        visible={isFoodModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsFoodModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Food</Text>
              <TouchableOpacity onPress={() => setIsFoodModalVisible(false)}>
                <Icon name="close" size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.searchContainer}>
              <Icon name="search" size={20} color={colors.text.secondary} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search foods..."
                value={foodSearch}
                onChangeText={setFoodSearch}
                placeholderTextColor="#999"
              />
            </View>
            
            <FlatList
              data={filteredFoods}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.foodSelectItem,
                    tempSelectedFood?.id === item.id && styles.selectedFoodItem
                  ]}
                  onPress={() => setTempSelectedFood(item)}
                >
                  <View>
                    <Text style={styles.foodName}>{item.name}</Text>
                    <Text style={styles.foodCategory}>{item.category}</Text>
                  </View>
                  <Text style={styles.foodCarbs}>{item.carbsPer100g}g carbs/100g</Text>
                </TouchableOpacity>
              )}
              style={styles.foodModalList}
            />

            {/* Weight Input and Add Button */}
            {tempSelectedFood && (
              <View style={styles.weightInputContainer}>
                <Text style={styles.selectedFoodName}>
                  Selected: {tempSelectedFood.name}
                </Text>
                <View style={styles.weightRow}>
                  <Text style={styles.weightLabel}>Weight (g):</Text>
                  <TextInput
                    style={styles.weightInput}
                    value={foodWeight}
                    onChangeText={setFoodWeight}
                    keyboardType="numeric"
                    placeholder="Enter food weight"
                    placeholderTextColor="#999"
                  />
                </View>
                <TouchableOpacity 
                  style={[
                    styles.addFoodButtonModal,
                    (!tempSelectedFood || !foodWeight) && styles.addFoodButtonDisabled
                  ]} 
                  onPress={addFoodItem}
                  disabled={!tempSelectedFood || !foodWeight}
                >
                  <Text style={styles.addFoodButtonText}>Add to Meal</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  backButton: {
    padding: 5,
  },
  placeholder: {
    width: 24,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f9f9f9',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: colors.text.primary,
  },
  totalCarbs: {
    fontWeight: 'bold',
    color: colors.primary,
    fontSize: 15,
  },
  addFoodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 8,
    borderStyle: 'dashed',
    backgroundColor: 'rgba(81, 145, 250, 0.05)',
    marginBottom: 12,
  },
  addFoodText: {
    color: colors.primary,
    marginLeft: 8,
    fontWeight: '500',
  },
  emptyFoodText: {
    textAlign: 'center',
    color: colors.text.secondary,
    marginVertical: 10,
    fontStyle: 'italic',
  },
  foodItemsList: {
    marginBottom: 8,
  },
  foodItemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  foodItemDetails: {
    flex: 1,
  },
  foodItemName: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.primary,
  },
  foodItemWeight: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 2,
  },
  foodItemCarbs: {
    color: colors.primary,
    fontWeight: '500',
    marginRight: 12,
  },
  removeFoodButton: {
    padding: 6,
  },
  // Enhanced Exercise Form elements
  formGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 6,
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f9f9f9',
  },
  pickerWrapper: {
    flex: 1,
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 50,
  },
  pickerText: {
    fontSize: 16,
    color: colors.text.primary,
  },
  pickerSubtext: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 2,
  },
  // Enhanced Intensity selector
  intensitySelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  intensityOption: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
  intensityOptionSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  intensityText: {
    color: colors.text.secondary,
    fontWeight: '500',
  },
  intensityTextSelected: {
    color: '#fff',
    fontWeight: '500',
  },
  intensitySubtext: {
    fontSize: 10,
    color: colors.text.secondary,
    marginTop: 2,
  },
  durationRecommendations: {
    flexDirection: 'row',
    marginTop: 8,
    flexWrap: 'wrap',
  },
  durationChip: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  durationChipText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '500',
  },
  exercisePreview: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
  },
  exercisePreviewTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 8,
  },
  exercisePreviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  exercisePreviewLabel: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  exercisePreviewValue: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.primary,
  },
  // Enhanced Predict Button
  predictButton: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  predictButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Enhanced Results
  resultContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 30,
  },
  resultTitle: {
    fontSize: 16,
    color: colors.text.secondary,
    marginBottom: 10,
  },
  resultValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 20,
  },
  resultDetailsContainer: {
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 15,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  enhancedDetailsSection: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
  },
  enhancedDetailsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 8,
  },
  enhancedDetailText: {
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: 3,
  },
  disclaimerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  disclaimerText: {
    fontSize: 12,
    color: colors.text.secondary,
    marginLeft: 8,
    flex: 1,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    paddingHorizontal: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    marginLeft: 8,
    fontSize: 16,
    color: colors.text.primary,
  },
  foodModalList: {
    maxHeight: 300,
  },
  foodSelectItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  selectedFoodItem: {
    backgroundColor: 'rgba(81, 145, 250, 0.1)',
  },
  foodName: {
    fontSize: 16,
    color: colors.text.primary,
    fontWeight: '500',
  },
  foodCategory: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 2,
  },
  foodCarbs: {
    color: colors.primary,
    fontWeight: '500',
  },
  weightInputContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  selectedFoodName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: colors.primary,
  },
  weightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  weightLabel: {
    fontSize: 14,
    width: 80,
    color: colors.text.secondary,
  },
  weightInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#f9f9f9',
  },
  addFoodButtonModal: {
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  addFoodButtonDisabled: {
    backgroundColor: '#ccc',
  },
  addFoodButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default GlucosePredictionScreen;