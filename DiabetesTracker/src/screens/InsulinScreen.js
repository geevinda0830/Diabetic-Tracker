// src/screens/InsulinScreen.js
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
  FlatList,
  Alert,
  ActivityIndicator
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

// Define colors
const colors = {
  primary: '#5191FA',
  accent: '#F06292',
  success: '#4CAF50',
  danger: '#F44336',
  warning: '#FFC107',
  background: '#F5F7FA',
  text: {
    primary: '#263238',
    secondary: '#607D8B'
  }
};

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

// Enhanced Food database with carbs per 100g
const foodDatabase = [
  { id: 1, name: 'White Rice (cooked)', carbsPer100g: 28 },
  { id: 2, name: 'Wheat Bread', carbsPer100g: 49 },
  { id: 3, name: 'Potato', carbsPer100g: 17 },
  { id: 4, name: 'Apple', carbsPer100g: 14 },
  { id: 5, name: 'Banana', carbsPer100g: 23 },
  { id: 6, name: 'Orange', carbsPer100g: 12 },
  { id: 7, name: 'Pasta (cooked)', carbsPer100g: 25 },
  { id: 8, name: 'Sweet Potato', carbsPer100g: 20 },
  { id: 9, name: 'Milk', carbsPer100g: 5 },
  { id: 10, name: 'Yogurt (plain)', carbsPer100g: 6 },
  { id: 11, name: 'Chicken Breast', carbsPer100g: 0 },
  { id: 12, name: 'Beef', carbsPer100g: 0 },
  { id: 13, name: 'Broccoli', carbsPer100g: 7 },
  { id: 14, name: 'Carrot', carbsPer100g: 10 },
  { id: 15, name: 'White Sugar', carbsPer100g: 100 },
  { id: 16, name: 'Oatmeal', carbsPer100g: 66 },
  { id: 17, name: 'Quinoa', carbsPer100g: 64 },
  { id: 18, name: 'Brown Rice', carbsPer100g: 26 },
  { id: 19, name: 'Whole Wheat Bread', carbsPer100g: 43 },
  { id: 20, name: 'Corn', carbsPer100g: 19 },
];

const InsulinScreen = ({ navigation }) => {
  // State for inputs
  const [bloodGlucose, setBloodGlucose] = useState('');
  const [exerciseDuration, setExerciseDuration] = useState('');
  const [currentInsulinDosage, setCurrentInsulinDosage] = useState('');
  const [bodyWeight, setBodyWeight] = useState('70');
  const [predictionResult, setPredictionResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Food selection state
  const [foodItems, setFoodItems] = useState([]);
  const [showFoodModal, setShowFoodModal] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const [foodAmount, setFoodAmount] = useState('');
  const [foodSearch, setFoodSearch] = useState('');
  
  // Enhanced Exercise state
  const [selectedExerciseType, setSelectedExerciseType] = useState('WALKING_CASUAL');
  const [exerciseCategory, setExerciseCategory] = useState('CARDIO');
  const [exerciseMetValue, setExerciseMetValue] = useState(3.0);
  const [exerciseIntensity, setExerciseIntensity] = useState('1.0');
  const [selectedEnvironment, setSelectedEnvironment] = useState('INDOOR_GYM');
  
  // Ref for ScrollView
  const scrollViewRef = useRef(null);
  
  // Calculate total carbs from selected foods
  const calculateTotalCarbs = () => {
    return foodItems.reduce((total, item) => {
      return total + (item.carbsPer100g * item.amount / 100);
    }, 0).toFixed(1);
  };
  
  // Add food item to list
  const addFoodItem = () => {
    if (!selectedFood || !foodAmount || parseFloat(foodAmount) <= 0) {
      Alert.alert('Error', 'Please select a food and enter a valid amount');
      return;
    }
    
    const newItem = {
      ...selectedFood,
      amount: parseFloat(foodAmount),
      carbs: (selectedFood.carbsPer100g * parseFloat(foodAmount) / 100).toFixed(1)
    };
    
    setFoodItems([...foodItems, newItem]);
    setSelectedFood(null);
    setFoodAmount('');
    setShowFoodModal(false);
    
    // Scroll down after adding food
    setTimeout(() => {
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollToEnd({ animated: true });
      }
    }, 300);
  };
  
  // Remove food item
  const removeFoodItem = (index) => {
    const updatedItems = [...foodItems];
    updatedItems.splice(index, 1);
    setFoodItems(updatedItems);
  };
  
  // Filter foods based on search
  const filteredFoods = foodSearch 
    ? foodDatabase.filter(food => 
        food.name.toLowerCase().includes(foodSearch.toLowerCase()))
    : foodDatabase;

  // Enhanced Exercise modal functions
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

  // Enhanced insulin prediction calculation
  const predictInsulinDosage = async () => {
    try {
      setIsLoading(true);
      
      // Validate inputs
      if (!bloodGlucose) {
        Alert.alert('Error', 'Please enter current blood glucose level');
        setIsLoading(false);
        return;
      }
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const totalCarbs = parseFloat(calculateTotalCarbs());
      const glucose = parseFloat(bloodGlucose) || 0;
      const exercise = parseFloat(exerciseDuration) || 0;
      const currentDosage = parseFloat(currentInsulinDosage) || 0;
      const weight = parseFloat(bodyWeight) || 70;
      const targetGlucose = 120;
      const intensity = parseFloat(exerciseIntensity);
      const environmentFactor = ENVIRONMENTS[selectedEnvironment]?.factor || 1.0;

      // Enhanced calculation considering exercise type and environment
      const glucoseDifference = glucose - targetGlucose;
      const carbEffect = totalCarbs / 10;
      
      // Enhanced exercise reduction calculation
      const baseExerciseReduction = exercise * intensity * 0.1;
      const metAdjustment = (exerciseMetValue - 3.0) * 0.05; // Adjust based on MET value
      const environmentAdjustment = (environmentFactor - 1.0) * 0.1;
      
      // Calculate exercise effectiveness
      const exerciseEffectiveness = (exercise / 60) * intensity * (exerciseMetValue / 5.0) * environmentFactor;
      const effectivenessBonus = Math.min(exerciseEffectiveness * 0.1, 0.5);
      
      const exerciseReduction = baseExerciseReduction * (1 + metAdjustment + environmentAdjustment + effectivenessBonus);
      
      const glucoseAdjustment = glucoseDifference > 0 
        ? Math.ceil(glucoseDifference / 30) 
        : Math.floor(glucoseDifference / 30);

      let recommendedDosage = currentDosage + glucoseAdjustment + carbEffect;
      recommendedDosage = Math.max(0, recommendedDosage - exerciseReduction);
      recommendedDosage = Math.round(recommendedDosage * 2) / 2;

      // Calculate calories burned
      const caloriesBurned = Math.round(exerciseMetValue * weight * exercise / 60);
      
      setPredictionResult({
        recommendedDosage,
        details: {
          currentGlucose: glucose,
          glucoseDifference: glucoseDifference.toFixed(1),
          carbEffect: carbEffect.toFixed(1),
          exerciseReduction: exerciseReduction.toFixed(1),
          exerciseType: getExerciseDisplayName(),
          environment: getEnvironmentDisplayName(),
          metValue: exerciseMetValue,
          environmentFactor: environmentFactor,
          exerciseEffectiveness: exerciseEffectiveness.toFixed(2),
          caloriesBurned: caloriesBurned
        },
        method: 'enhanced-calculation',
        confidence: 0.87
      });
      
      // Simulate successful save
      setTimeout(() => {
        Alert.alert(
          'Success',
          'Enhanced insulin dosage prediction completed with advanced exercise analysis!',
          [
            { text: 'Stay Here', style: 'cancel' },
            { 
              text: 'Go to Home', 
              onPress: () => navigation && navigation.navigate && navigation.navigate('Home', { refresh: new Date().getTime() })
            }
          ]
        );
      }, 500);
      
    } catch (error) {
      Alert.alert('Error', 'Unable to calculate insulin dosage');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation && navigation.goBack && navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Enhanced Insulin Prediction</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
      >
        {/* Blood Glucose Input */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Blood Glucose Level</Text>
          <View style={styles.inputContainer}>
            <Icon name="analytics-outline" size={20} color={colors.text.secondary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={bloodGlucose}
              onChangeText={setBloodGlucose}
              keyboardType="numeric"
              placeholder="Enter current blood glucose (mg/dL)"
              placeholderTextColor="#999"
            />
          </View>
        </View>

        {/* Current Insulin Dosage */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Current Insulin Dosage</Text>
          <View style={styles.inputContainer}>
            <Icon name="fitness-outline" size={20} color={colors.text.secondary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={currentInsulinDosage}
              onChangeText={setCurrentInsulinDosage}
              keyboardType="numeric"
              placeholder="Enter current insulin dosage (units)"
              placeholderTextColor="#999"
            />
          </View>
        </View>

        {/* Body Weight Input */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Body Weight</Text>
          <View style={styles.inputContainer}>
            <Icon name="body-outline" size={20} color={colors.text.secondary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={bodyWeight}
              onChangeText={setBodyWeight}
              keyboardType="numeric"
              placeholder="Enter body weight (kg)"
              placeholderTextColor="#999"
            />
          </View>
        </View>

        {/* Enhanced Food Selection */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Carbohydrate Intake</Text>
            <Text style={styles.totalCarbs}>Total: {calculateTotalCarbs()} g</Text>
          </View>
          
          {foodItems.length > 0 && (
            <View style={styles.foodList}>
              {foodItems.map((item, index) => (
                <View key={`${item.id}-${item.amount}-${index}`} style={styles.foodItem}>
                  <View style={styles.foodItemInfo}>
                    <Text style={styles.foodName}>{item.name}</Text>
                    <Text style={styles.foodDetails}>{item.amount}g = {item.carbs}g carbs</Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.removeButton}
                    onPress={() => removeFoodItem(index)}
                  >
                    <Icon name="trash-outline" size={18} color={colors.danger} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
          
          <TouchableOpacity 
            style={styles.addFoodButton}
            onPress={() => setShowFoodModal(true)}
          >
            <Icon name="add-circle-outline" size={20} color={colors.accent} />
            <Text style={styles.addFoodText}>Add Food Item</Text>
          </TouchableOpacity>
        </View>

        {/* Enhanced Exercise Section */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Enhanced Exercise Analysis</Text>
          
          {/* Exercise Category & Type */}
          <View style={styles.formGroup}>
            <Text style={styles.inputLabel}>Exercise Category & Type</Text>
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={showExerciseTypeModal}
            >
              <View style={styles.pickerContent}>
                <Icon name="fitness-outline" size={20} color={colors.text.secondary} />
                <View style={styles.pickerTextContainer}>
                  <Text style={styles.pickerText}>{getExerciseDisplayName()}</Text>
                  {selectedExerciseType !== 'WALKING_CASUAL' && (
                    <Text style={styles.pickerSubtext}>
                      {exerciseCategory.charAt(0) + exerciseCategory.slice(1).toLowerCase()} • MET: {exerciseMetValue}
                    </Text>
                  )}
                </View>
                <Icon name="chevron-down" size={20} color={colors.text.secondary} />
              </View>
            </TouchableOpacity>
          </View>
          
          {/* Exercise Intensity */}
          <View style={styles.formGroup}>
            <Text style={styles.inputLabel}>Exercise Intensity Level</Text>
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
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={showEnvironmentModal}
            >
              <View style={styles.pickerContent}>
                <Icon name="earth-outline" size={20} color={colors.text.secondary} />
                <View style={styles.pickerTextContainer}>
                  <Text style={styles.pickerText}>{getEnvironmentDisplayName()}</Text>
                  {selectedEnvironment !== 'INDOOR_GYM' && ENVIRONMENTS[selectedEnvironment] && (
                    <Text style={styles.pickerSubtext}>
                      {ENVIRONMENTS[selectedEnvironment].description}
                    </Text>
                  )}
                </View>
                <Icon name="chevron-down" size={20} color={colors.text.secondary} />
              </View>
            </TouchableOpacity>
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
                  {Math.round(exerciseMetValue * parseFloat(bodyWeight || 70) * parseFloat(exerciseDuration) / 60)} cal
                </Text>
              </View>
              <View style={styles.exercisePreviewRow}>
                <Text style={styles.exercisePreviewLabel}>Insulin Reduction:</Text>
                <Text style={styles.exercisePreviewValue}>
                  ~{(parseFloat(exerciseDuration) * parseFloat(exerciseIntensity) * 0.1 * 
                    (ENVIRONMENTS[selectedEnvironment]?.factor || 1.0)).toFixed(1)} units
                </Text>
              </View>
              <View style={styles.exercisePreviewRow}>
                <Text style={styles.exercisePreviewLabel}>Environment Factor:</Text>
                <Text style={styles.exercisePreviewValue}>
                  {(ENVIRONMENTS[selectedEnvironment]?.factor || 1.0).toFixed(1)}x
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Enhanced Predict Button */}
        <TouchableOpacity 
          style={styles.predictButton}
          onPress={predictInsulinDosage}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Icon name="analytics" size={20} color="#fff" style={styles.buttonIcon} />
              <Text style={styles.predictButtonText}>Predict Enhanced Insulin Dosage</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Enhanced Prediction Result */}
        {predictionResult && (
          <View style={styles.resultContainer}>
            <Text style={styles.resultTitle}>Enhanced Insulin Recommendation</Text>
            <Text style={styles.resultValue}>
              {predictionResult.recommendedDosage.toFixed(1)} units
            </Text>
            
            <View style={styles.predictionMethod}>
              <Text style={styles.methodText}>
                Method: Enhanced Calculation with Exercise Analysis
              </Text>
              <Text style={styles.confidenceText}>
                Confidence: {(predictionResult.confidence * 100).toFixed(0)}%
              </Text>
            </View>
            
            <View style={styles.resultDetailsContainer}>
              <Text style={styles.detailText}>Current Glucose: {predictionResult.details.currentGlucose} mg/dL</Text>
              <Text style={styles.detailText}>Glucose Difference: {predictionResult.details.glucoseDifference} mg/dL</Text>
              <Text style={styles.detailText}>Carb Effect: +{predictionResult.details.carbEffect} units</Text>
              <Text style={styles.detailText}>Exercise Reduction: -{predictionResult.details.exerciseReduction} units</Text>
              
              {/* Enhanced Exercise Analysis Section */}
              <View style={styles.enhancedAnalysisSection}>
                <Text style={styles.enhancedAnalysisTitle}>🏃‍♂️ Exercise Analysis</Text>
                <Text style={styles.enhancedDetailText}>Type: {predictionResult.details.exerciseType}</Text>
                <Text style={styles.enhancedDetailText}>Environment: {predictionResult.details.environment}</Text>
                <Text style={styles.enhancedDetailText}>MET Value: {predictionResult.details.metValue}</Text>
                <Text style={styles.enhancedDetailText}>Environment Factor: {predictionResult.details.environmentFactor}x</Text>
                <Text style={styles.enhancedDetailText}>Exercise Effectiveness: {predictionResult.details.exerciseEffectiveness}</Text>
                <Text style={styles.enhancedDetailText}>Calories Burned: {predictionResult.details.caloriesBurned} cal</Text>
              </View>
              
              <View style={styles.disclaimerContainer}>
                <Icon name="information-circle-outline" size={16} color={colors.text.secondary} />
                <Text style={styles.disclaimerText}>
                  Enhanced calculation considers exercise type, intensity, environment, and MET values. Always consult your healthcare provider before adjusting insulin doses.
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Food Selection Modal */}
      <Modal
        visible={showFoodModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFoodModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Food</Text>
              <TouchableOpacity onPress={() => setShowFoodModal(false)}>
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
                    styles.foodOption,
                    selectedFood?.id === item.id && styles.selectedFoodOption
                  ]}
                  onPress={() => setSelectedFood(item)}
                >
                  <Text style={styles.foodOptionName}>{item.name}</Text>
                  <Text style={styles.foodOptionCarbs}>{item.carbsPer100g}g per 100g</Text>
                </TouchableOpacity>
              )}
              style={styles.foodModalList}
            />
            
            {selectedFood && (
              <View style={styles.amountContainer}>
                <Text style={styles.amountLabel}>Amount (grams):</Text>
                <TextInput
                  style={styles.amountInput}
                  value={foodAmount}
                  onChangeText={setFoodAmount}
                  keyboardType="numeric"
                  placeholder="Enter grams"
                  placeholderTextColor="#999"
                />
              </View>
            )}
            
            <View style={styles.modalButtonsContainer}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => {
                  setSelectedFood(null);
                  setFoodAmount('');
                  setShowFoodModal(false);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.addButton,
                  (!selectedFood || !foodAmount) && styles.addButtonDisabled
                ]}
                onPress={addFoodItem}
                disabled={!selectedFood || !foodAmount}
              >
                <Text style={styles.addButtonText}>Add to Meal</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.accent,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 4,
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
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
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
    color: colors.accent,
    fontSize: 15,
  },
  // Enhanced food items
  foodList: {
    marginBottom: 12,
  },
  foodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    marginBottom: 8,
  },
  foodItemInfo: {
    flex: 1,
  },
  foodName: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.primary,
  },
  foodDetails: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 2,
  },
  removeButton: {
    padding: 8,
  },
  addFoodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: 8,
    borderStyle: 'dashed',
    backgroundColor: 'rgba(240, 98, 146, 0.05)',
  },
  addFoodText: {
    color: colors.accent,
    fontWeight: '500',
    marginLeft: 8,
  },
  // Enhanced form elements
  formGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 6,
  },
  pickerButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  pickerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pickerTextContainer: {
    flex: 1,
    marginLeft: 10,
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
  // Enhanced intensity selector
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
    backgroundColor: colors.accent,
    borderColor: colors.accent,
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
    borderColor: colors.accent,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  durationChipText: {
    color: colors.accent,
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
    color: colors.accent,
  },
  // Enhanced Predict Button
  predictButton: {
    backgroundColor: colors.accent,
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 16,
    elevation: 2,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  buttonIcon: {
    marginRight: 8,
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
    color: colors.accent,
    marginBottom: 15,
  },
  predictionMethod: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  methodText: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  confidenceText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.accent,
  },
  resultDetailsContainer: {
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 15,
  },
  detailText: {
    fontSize: 14,
    color: colors.text.primary,
    marginBottom: 8,
  },
  enhancedAnalysisSection: {
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    marginBottom: 12,
  },
  enhancedAnalysisTitle: {
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
    paddingBottom: 30,
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
  foodOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  selectedFoodOption: {
    backgroundColor: 'rgba(240, 98, 146, 0.1)',
  },
  foodOptionName: {
    fontSize: 16,
    color: colors.text.primary,
  },
  foodOptionCarbs: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 4,
  },
  amountContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  amountLabel: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 8,
  },
  amountInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    marginRight: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: colors.text.secondary,
  },
  addButton: {
    flex: 2,
    backgroundColor: colors.accent,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonDisabled: {
    backgroundColor: '#ccc',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default InsulinScreen;