
// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   TextInput,
//   Modal,
//   FlatList,
//   Alert,
//   ActivityIndicator,
//   Platform
// } from 'react-native';
// import Icon from 'react-native-vector-icons/Ionicons';
// import { colors } from '../utils/theme';
// import { saveMeal, saveGlucoseReading, saveInsulinDose } from '../services/api';

// // Comprehensive Food Database with Detailed Carb Content
// const FOOD_DATABASE = [
//   { id: 1, name: 'White Rice', carbsPer100g: 28.2, category: 'Grains' },
//   { id: 2, name: 'Brown Rice', carbsPer100g: 25.6, category: 'Grains' },
//   { id: 3, name: 'White Bread', carbsPer100g: 49.6, category: 'Grains' },
//   { id: 4, name: 'Whole Wheat Bread', carbsPer100g: 43.1, category: 'Grains' },
//   { id: 5, name: 'Apple', carbsPer100g: 13.8, category: 'Fruits' },
//   { id: 6, name: 'Banana', carbsPer100g: 22.8, category: 'Fruits' },
//   { id: 7, name: 'Potato', carbsPer100g: 17.0, category: 'Vegetables' },
//   { id: 8, name: 'Sweet Potato', carbsPer100g: 20.7, category: 'Vegetables' },
//   { id: 9, name: 'Pasta', carbsPer100g: 31.5, category: 'Grains' }
// ];

// const GlucosePredictionScreen = ({ navigation }) => {
//   // State Management
//   const [currentGlucose, setCurrentGlucose] = useState('');
//   const [insulinDose, setInsulinDose] = useState('');
//   const [exerciseDuration, setExerciseDuration] = useState('');
//   const [exerciseIntensity, setExerciseIntensity] = useState('2');
  
//   // Food-related States
//   const [foodItems, setFoodItems] = useState([]);
//   const [isFoodModalVisible, setIsFoodModalVisible] = useState(false);
//   const [selectedFood, setSelectedFood] = useState(null);
//   const [foodWeight, setFoodWeight] = useState('');
//   const [tempSelectedFood, setTempSelectedFood] = useState(null);
  
//   // Prediction State
//   const [predictionResult, setPredictionResult] = useState(null);
//   const [isLoading, setIsLoading] = useState(false);

//   // Calculate Total Carbohydrates
//   const calculateTotalCarbs = () => {
//     return foodItems.reduce((total, item) => 
//       total + (item.carbsPer100g * item.weight / 100), 0
//     ).toFixed(1);
//   };

//   // Remove Food Item
//   const removeFoodItem = (index) => {
//     const updatedItems = [...foodItems];
//     updatedItems.splice(index, 1);
//     setFoodItems(updatedItems);
//   };

//   // Save meal data to database
//   const saveMealData = async () => {
//     if (foodItems.length === 0) return;
    
//     try {
//       const totalCarbs = parseFloat(calculateTotalCarbs());
      
//       const mealData = {
//         totalCarbs,
//         foodItems: foodItems.map(item => ({
//           name: item.name,
//           carbsPer100g: item.carbsPer100g,
//           weight: item.weight,
//           carbs: (item.carbsPer100g * item.weight / 100).toFixed(1)
//         })),
//         timestamp: new Date().toISOString()
//       };
      
//       await saveMeal(mealData);
//       console.log("Meal data saved successfully");
//     } catch (error) {
//       console.error("Error saving meal data:", error);
//     }
//   };
  
//   // Save insulin dose to database
//   const saveInsulinData = async () => {
//     if (!insulinDose || parseFloat(insulinDose) <= 0) return;
    
//     try {
//       const insulinData = {
//         units: parseFloat(insulinDose),
//         type: 'rapid', // Default type
//         bloodGlucose: parseFloat(currentGlucose) || 0,
//         timestamp: new Date().toISOString(),
//         notes: `Manual entry for glucose prediction. Carbs: ${calculateTotalCarbs()}g`
//       };
      
//       await saveInsulinDose(insulinData);
//       console.log("Insulin data saved successfully");
//     } catch (error) {
//       console.error("Error saving insulin data:", error);
//     }
//   };
  
//   // Save glucose prediction to database
//   const saveGlucosePrediction = async (predictedValue) => {
//     try {
//       // We'll save this as a regular glucose reading with a note indicating it's a prediction
//       const glucoseData = {
//         value: predictedValue,
//         timestamp: new Date().toISOString(),
//         notes: 'Predicted glucose value'
//       };
      
//       await saveGlucoseReading(glucoseData);
//       console.log("Glucose prediction saved successfully");
//     } catch (error) {
//       console.error("Error saving glucose prediction:", error);
//     }
//   };
//   Alert.alert(
//     'Prediction Complete',
//     `Predicted glucose: ${predictedGlucose} mg/dL`,
//     [
//       {
//         text: 'Stay on this screen',
//         style: 'cancel'
//       },
//       {
//         text: 'Return to Home',
//         onPress: () => {
//           navigation.navigate('Home', { refresh: new Date().getTime() });
//         }
//       }
//     ]
//   );
//   // Predict Glucose Level
//   const predictGlucose = async () => {
//     try {
//       // Validate inputs
//       if (!currentGlucose) {
//         Alert.alert('Error', 'Please enter current glucose level');
//         return;
//       }

//       setIsLoading(true);

//       // Save the entered data first
//       await saveMealData();
//       await saveInsulinData();

//       // Prediction Calculation
//       const glucose = parseFloat(currentGlucose);
//       const insulin = parseFloat(insulinDose) || 0;
//       const totalCarbs = parseFloat(calculateTotalCarbs());
//       const exercise = parseFloat(exerciseDuration) || 0;
//       const intensity = parseFloat(exerciseIntensity);

//       // Advanced Prediction Algorithm
//       const insulinEffect = insulin * -3; // Each unit reduces glucose
//       const carbEffect = totalCarbs * 0.2; // Carbs increase glucose
//       const exerciseEffect = exercise * intensity * -0.1; // Exercise reduces glucose

//       const predictedGlucose = Math.round(
//         glucose + insulinEffect + carbEffect + exerciseEffect
//       );

//       // Save the prediction result
//       await saveGlucosePrediction(predictedGlucose);

//       // Set Prediction Result
//       setPredictionResult({
//         predictedGlucose,
//         details: {
//           insulinEffect: insulinEffect.toFixed(1),
//           carbEffect: carbEffect.toFixed(1),
//           exerciseEffect: exerciseEffect.toFixed(1)
//         }
//       });
//     } catch (error) {
//       console.error('Error:', error);
//       Alert.alert('Prediction Error', 'Unable to calculate glucose level');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Food Selection Modal
//   const renderFoodModal = () => (
//     <Modal
//       animationType="slide"
//       transparent={true}
//       visible={isFoodModalVisible}
//       onRequestClose={() => setIsFoodModalVisible(false)}
//     >
//       <View style={styles.modalContainer}>
//         <View style={styles.modalContent}>
//           <Text style={styles.modalTitle}>Select Food</Text>
          
//           {/* Food Selection List */}
//           <FlatList
//             data={FOOD_DATABASE}
//             keyExtractor={(item) => item.id.toString()}
//             renderItem={({ item }) => (
//               <TouchableOpacity
//                 style={[
//                   styles.foodSelectItem,
//                   tempSelectedFood?.id === item.id && styles.selectedFoodItem
//                 ]}
//                 onPress={() => setTempSelectedFood(item)}
//               >
//                 <View>
//                   <Text style={styles.foodName}>{item.name}</Text>
//                   <Text style={styles.foodCategory}>{item.category}</Text>
//                 </View>
//                 <Text style={styles.foodCarbs}>{item.carbsPer100g}g carbs/100g</Text>
//               </TouchableOpacity>
//             )}
//           />

//           {/* Weight Input and Add Button */}
//           {tempSelectedFood && (
//             <View style={styles.weightInputContainer}>
//               <Text style={styles.selectedFoodName}>
//                 Selected: {tempSelectedFood.name}
//               </Text>
//               <View style={styles.weightRow}>
//                 <Text style={styles.weightLabel}>Weight (g):</Text>
//                 <TextInput
//                   style={styles.weightInput}
//                   value={foodWeight}
//                   onChangeText={setFoodWeight}
//                   keyboardType="numeric"
//                   placeholder="Enter food weight"
//                   placeholderTextColor="#999"
//                 />
//               </View>
//               <TouchableOpacity 
//                 style={[
//                   styles.addFoodButtonModal,
//                   (!tempSelectedFood || !foodWeight) && styles.addFoodButtonDisabled
//                 ]} 
//                 onPress={() => {
//                   if (tempSelectedFood && foodWeight) {
//                     const newItem = {
//                       ...tempSelectedFood,
//                       weight: parseFloat(foodWeight)
//                     };
//                     setFoodItems([...foodItems, newItem]);
//                     setTempSelectedFood(null);
//                     setFoodWeight('');
//                     setIsFoodModalVisible(false);
//                   } else {
//                     Alert.alert('Error', 'Please select a food and enter its weight');
//                   }
//                 }}
//                 disabled={!tempSelectedFood || !foodWeight}
//               >
//                 <Text style={styles.addFoodButtonText}>Add to Meal</Text>
//               </TouchableOpacity>
//             </View>
//           )}

//           <TouchableOpacity 
//             style={styles.modalCloseButton}
//             onPress={() => {
//               setTempSelectedFood(null);
//               setFoodWeight('');
//               setIsFoodModalVisible(false);
//             }}
//           >
//             <Text style={styles.modalCloseButtonText}>Cancel</Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     </Modal>
//   );

//   return (
//     <View style={styles.container}>
//       {/* Header */}
//       <View style={styles.header}>
//         <TouchableOpacity 
//           style={styles.backButton} 
//           onPress={() => navigation.goBack()}
//         >
//           <Icon name="arrow-back" size={24} color="#fff" />
//         </TouchableOpacity>
//         <Text style={styles.headerTitle}>Glucose Prediction</Text>
//         <View style={styles.placeholder} />
//       </View>

//       {/* MAIN CHANGE: Replace ScrollView with FlatList for the main content */}
//       <FlatList
//         data={[1]} // Just need one item to render the content once
//         keyExtractor={() => "main-content"}
//         renderItem={() => (
//           <View style={styles.content}>
//             {/* Current Glucose Input */}
//             <View style={styles.inputGroup}>
//               <Text style={styles.label}>Current Glucose Level (mg/dL)</Text>
//               <View style={styles.inputContainer}>
//                 <Icon name="analytics-outline" size={20} color={colors.text.secondary} style={styles.inputIcon} />
//                 <TextInput
//                   style={styles.input}
//                   value={currentGlucose}
//                   onChangeText={setCurrentGlucose}
//                   keyboardType="numeric"
//                   placeholder="Enter current glucose level"
//                   placeholderTextColor="#999"
//                 />
//               </View>
//             </View>

//             {/* Insulin Dose Input */}
//             <View style={styles.inputGroup}>
//               <Text style={styles.label}>Insulin Dose (units)</Text>
//               <View style={styles.inputContainer}>
//                 <Icon name="fitness-outline" size={20} color={colors.text.secondary} style={styles.inputIcon} />
//                 <TextInput
//                   style={styles.input}
//                   value={insulinDose}
//                   onChangeText={setInsulinDose}
//                   keyboardType="numeric"
//                   placeholder="Enter insulin dose"
//                   placeholderTextColor="#999"
//                 />
//               </View>
//             </View>

//             {/* Food Intake Section */}
//             <View style={styles.inputGroup}>
//               <Text style={styles.label}>Food Intake</Text>
//               <TouchableOpacity 
//                 style={styles.addFoodButton}
//                 onPress={() => {
//                   setIsFoodModalVisible(true);
//                   setTempSelectedFood(null);
//                   setFoodWeight('');
//                 }}
//               >
//                 <Icon name="add-circle-outline" size={20} color={colors.accent} />
//                 <Text style={styles.addFoodButtonText}>Add Food Item</Text>
//               </TouchableOpacity>

//               {/* Food Items List - Rendered directly, no need for nested FlatList */}
//               {foodItems.length === 0 ? (
//                 <Text style={styles.emptyFoodText}>No food items added</Text>
//               ) : (
//                 foodItems.map((item, index) => (
//                   <View key={index} style={styles.foodItemContainer}>
//                     <View style={styles.foodItemDetails}>
//                       <Text style={styles.foodItemName}>{item.name}</Text>
//                       <Text style={styles.foodItemWeight}>{item.weight}g</Text>
//                     </View>
//                     <Text style={styles.foodItemCarbs}>
//                       {((item.carbsPer100g * item.weight) / 100).toFixed(1)}g carbs
//                     </Text>
//                     <TouchableOpacity onPress={() => removeFoodItem(index)}>
//                       <Icon name="trash-outline" size={20} color={colors.danger} />
//                     </TouchableOpacity>
//                   </View>
//                 ))
//               )}

//               {/* Total Carbs Display */}
//               <View style={styles.totalCarbContainer}>
//                 <Text style={styles.totalCarbText}>
//                   Total Carbs: {calculateTotalCarbs()}g
//                 </Text>
//               </View>
//             </View>

//             {/* Exercise Duration Input */}
//             <View style={styles.inputGroup}>
//               <Text style={styles.label}>Exercise Duration (minutes)</Text>
//               <View style={styles.inputContainer}>
//                 <Icon name="walk-outline" size={20} color={colors.text.secondary} style={styles.inputIcon} />
//                 <TextInput
//                   style={styles.input}
//                   value={exerciseDuration}
//                   onChangeText={setExerciseDuration}
//                   keyboardType="numeric"
//                   placeholder="Enter exercise duration"
//                   placeholderTextColor="#999"
//                 />
//               </View>
//             </View>

//             {/* Exercise Intensity Selection */}
//             <View style={styles.inputGroup}>
//               <Text style={styles.label}>Exercise Intensity</Text>
//               <View style={styles.intensityContainer}>
//                 {['Low', 'Medium', 'High'].map((intensity, index) => (
//                   <TouchableOpacity 
//                     key={intensity}
//                     style={[
//                       styles.intensityButton,
//                       exerciseIntensity === `${index + 1}` && styles.intensityButtonActive
//                     ]}
//                     onPress={() => setExerciseIntensity(`${index + 1}`)}
//                   >
//                     <Text style={[
//                       styles.intensityText,
//                       exerciseIntensity === `${index + 1}` && styles.intensityTextActive
//                     ]}>
//                       {intensity}
//                     </Text>
//                   </TouchableOpacity>
//                 ))}
//               </View>
//             </View>

//             {/* Predict Button */}
//             <TouchableOpacity 
//               style={styles.predictButton}
//               onPress={predictGlucose}
//               disabled={isLoading}
//             >
//               {isLoading ? (
//                 <ActivityIndicator color="#fff" />
//               ) : (
//                 <Text style={styles.predictButtonText}>Predict Glucose Level</Text>
//               )}
//             </TouchableOpacity>

//             {/* Prediction Result */}
//             {predictionResult && (
//               <View style={styles.resultContainer}>
//                 <Text style={styles.resultTitle}>Predicted Glucose Level</Text>
//                 <Text style={styles.resultValue}>
//                   {predictionResult.predictedGlucose} mg/dL
//                 </Text>
                
//                 <View style={styles.resultDetailsContainer}>
//                   <Text>Insulin Effect: {predictionResult.details.insulinEffect} mg/dL</Text>
//                   <Text>Carb Effect: {predictionResult.details.carbEffect} mg/dL</Text>
//                   <Text>Exercise Effect: {predictionResult.details.exerciseEffect} mg/dL</Text>
//                 </View>
//               </View>
//             )}
//           </View>
//         )}
//       />

//       {/* Food Selection Modal */}
//       {renderFoodModal()}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: colors.background,
//   },
//   header: {
//     backgroundColor: colors.primary,
//     paddingVertical: 16,
//     paddingHorizontal: 20,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//   },
//   headerTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#fff',
//   },
//   backButton: {
//     padding: 5,
//   },
//   placeholder: {
//     width: 24,
//   },
//   content: {
//     flex: 1,
//     padding: 16,
//   },
//   inputGroup: {
//     marginBottom: 15,
//     backgroundColor: '#fff',
//     borderRadius: 8,
//     padding: 15,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.1,
//     shadowRadius: 2,
//     elevation: 2,
//   },
//   label: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: colors.text.primary,
//     marginBottom: 10,
//   },
//   inputContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: '#ddd',
//     borderRadius: 8,
//     paddingHorizontal: 12,
//   },
//   inputIcon: {
//     marginRight: 10,
//   },
//   input: {
//     flex: 1,
//     height: 50,
//     fontSize: 16,
//     color: colors.text.primary,
//   },
//   intensityContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//   },
//   intensityButton: {
//     flex: 1,
//     paddingVertical: 12,
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: '#ddd',
//     marginHorizontal: 4,
//     borderRadius: 8,
//   },
//   intensityButtonActive: {
//     backgroundColor: colors.primary,
//     borderColor: colors.primary,
//   },
//   intensityText: {
//     color: colors.text.secondary,
//     fontWeight: '500',
//   },
//   intensityTextActive: {
//     color: '#fff',
//   },
//   addFoodButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#f0f0f0',
//     padding: 12,
//     borderRadius: 8,
//     marginBottom: 10,
//   },
//   addFoodButtonText: {
//     marginLeft: 10,
//     color: colors.accent,
//     fontWeight: '600',
//   },
//   foodItemContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     backgroundColor: '#f8f8f8',
//     padding: 12,
//     borderRadius: 8,
//     marginBottom: 8,
//   },
//   foodItemDetails: {
//     flex: 1,
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//   },
//   foodItemName: {
//     fontSize: 16,
//     fontWeight: '500',
//   },
//   foodItemWeight: {
//     color: colors.text.secondary,
//   },
//   foodItemCarbs: {
//     color: colors.accent,
//     marginRight: 10,
//   },
//   emptyFoodText: {
//     textAlign: 'center',
//     color: colors.text.secondary,
//     marginVertical: 10,
//   },
//   totalCarbContainer: {
//     backgroundColor: '#f0f0f0',
//     padding: 10,
//     borderRadius: 8,
//     alignItems: 'center',
//     marginTop: 10,
//   },
//   totalCarbText: {
//     fontWeight: '600',
//     color: colors.text.primary,
//   },
//   predictButton: {
//     backgroundColor: colors.primary,
//     padding: 15,
//     borderRadius: 8,
//     alignItems: 'center',
//     marginVertical: 15,
//   },
//   predictButtonText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   resultContainer: {
//     backgroundColor: '#fff',
//     borderRadius: 8,
//     padding: 15,
//     alignItems: 'center',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   resultTitle: {
//     fontSize: 16,
//     color: colors.text.secondary,
//     marginBottom: 10,
//   },
//   resultValue: {
//     fontSize: 36,
//     fontWeight: 'bold',
//     marginBottom: 15,
//   },
//   resultDetailsContainer: {
//     width: '100%',
//     alignItems: 'center',
//   },
//   modalContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     backgroundColor: 'rgba(0,0,0,0.5)',
//     padding: 20,
//   },
//   modalContent: {
//     backgroundColor: '#fff',
//     borderRadius: 12,
//     padding: 20,
//     maxHeight: '80%',
//   },
//   modalTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     textAlign: 'center',
//     marginBottom: 15,
//   },
//   foodSelectItem: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingVertical: 15,
//     borderBottomWidth: 1,
//     borderBottomColor: '#eee',
//   },
//   selectedFoodItem: {
//     backgroundColor: '#f0f8ff',
//   },
//   foodName: {
//     fontSize: 16,
//     fontWeight: '500',
//   },
//   foodCategory: {
//     fontSize: 12,
//     color: colors.text.secondary,
//   },
//   foodCarbs: {
//     color: colors.accent,
//   },
//   weightInputContainer: {
//     marginTop: 15,
//     borderTopWidth: 1,
//     borderTopColor: '#eee',
//     paddingTop: 15,
//   },
//   selectedFoodName: {
//     fontSize: 16,
//     fontWeight: '600',
//     marginBottom: 10,
//     color: colors.primary,
//   },
//   weightRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 15,
//   },
//   weightLabel: {
//     fontSize: 14,
//     width: 80,
//   },
//   weightInput: {
//     flex: 1,
//     borderWidth: 1,
//     borderColor: '#ddd',
//     borderRadius: 8,
//     padding: 10,
//   },
//   addFoodButtonModal: {
//     backgroundColor: colors.accent,
//     padding: 12,
//     borderRadius: 8,
//     alignItems: 'center',
//     marginTop: 10,
//   },
//   addFoodButtonDisabled: {
//     backgroundColor: '#cccccc',
//   },
//   modalCloseButton: {
//     marginTop: 15,
//     padding: 10,
//     backgroundColor: colors.danger,
//     borderRadius: 8,
//   },
//   modalCloseButtonText: {
//     color: 'white',
//     textAlign: 'center',
//   }
// });

// export default GlucosePredictionScreen;

import React, { useState } from 'react';
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
  Platform
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../utils/theme';
import { saveMeal, saveGlucoseReading, saveInsulinDose } from '../services/api';

// Comprehensive Food Database with Detailed Carb Content
const FOOD_DATABASE = [
  { id: 1, name: 'White Rice', carbsPer100g: 28.2, category: 'Grains' },
  { id: 2, name: 'Brown Rice', carbsPer100g: 25.6, category: 'Grains' },
  { id: 3, name: 'White Bread', carbsPer100g: 49.6, category: 'Grains' },
  { id: 4, name: 'Whole Wheat Bread', carbsPer100g: 43.1, category: 'Grains' },
  { id: 5, name: 'Apple', carbsPer100g: 13.8, category: 'Fruits' },
  { id: 6, name: 'Banana', carbsPer100g: 22.8, category: 'Fruits' },
  { id: 7, name: 'Potato', carbsPer100g: 17.0, category: 'Vegetables' },
  { id: 8, name: 'Sweet Potato', carbsPer100g: 20.7, category: 'Vegetables' },
  { id: 9, name: 'Pasta', carbsPer100g: 31.5, category: 'Grains' }
];

const GlucosePredictionScreen = ({ navigation }) => {
  // State Management
  const [currentGlucose, setCurrentGlucose] = useState('');
  const [insulinDose, setInsulinDose] = useState('');
  const [exerciseDuration, setExerciseDuration] = useState('');
  const [exerciseIntensity, setExerciseIntensity] = useState('2');
  
  // Food-related States
  const [foodItems, setFoodItems] = useState([]);
  const [isFoodModalVisible, setIsFoodModalVisible] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const [foodWeight, setFoodWeight] = useState('');
  const [tempSelectedFood, setTempSelectedFood] = useState(null);
  
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

  // Predict Glucose Level
  const predictGlucose = async () => {
    try {
      // Validate inputs
      if (!currentGlucose) {
        Alert.alert('Error', 'Please enter current glucose level');
        return;
      }

      setIsLoading(true);

      // Save the meal data if there are food items
      if (foodItems.length > 0) {
        try {
          const totalCarbs = parseFloat(calculateTotalCarbs());
          
          const mealData = {
            totalCarbs,
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
        } catch (error) {
          console.error("Error saving meal data:", error);
        }
      }
      
      // Save insulin dose data if entered
      if (insulinDose && parseFloat(insulinDose) > 0) {
        try {
          const insulinData = {
            units: parseFloat(insulinDose),
            type: 'rapid', // Default type
            bloodGlucose: parseFloat(currentGlucose) || 0,
            timestamp: new Date().toISOString(),
            notes: `Manual entry for glucose prediction. Carbs: ${calculateTotalCarbs()}g`
          };
          
          await saveInsulinDose(insulinData);
          console.log("Insulin data saved successfully");
        } catch (error) {
          console.error("Error saving insulin data:", error);
        }
      }

      // Prediction Calculation
      const glucose = parseFloat(currentGlucose);
      const insulin = parseFloat(insulinDose) || 0;
      const totalCarbs = parseFloat(calculateTotalCarbs());
      const exercise = parseFloat(exerciseDuration) || 0;
      const intensity = parseFloat(exerciseIntensity);

      // Advanced Prediction Algorithm
      const insulinEffect = insulin * -3; // Each unit reduces glucose
      const carbEffect = totalCarbs * 0.2; // Carbs increase glucose
      const exerciseEffect = exercise * intensity * -0.1; // Exercise reduces glucose

      const predictedGlucose = Math.round(
        glucose + insulinEffect + carbEffect + exerciseEffect
      );

      // Save the prediction result as a glucose reading
      try {
        // We'll save this as a regular glucose reading with a note indicating it's a prediction
        const glucoseData = {
          value: predictedGlucose,
          timestamp: new Date(Date.now() + 60*60*1000).toISOString(), // Set timestamp 1 hour in future
          notes: 'Predicted glucose value',
          mealState: 'after' // Assume it's after a meal since we're dealing with carbs
        };
        
        await saveGlucoseReading(glucoseData);
        console.log("Glucose prediction saved successfully");
      } catch (error) {
        console.error("Error saving glucose prediction:", error);
      }

      // Set Prediction Result
      setPredictionResult({
        predictedGlucose,
        details: {
          insulinEffect: insulinEffect.toFixed(1),
          carbEffect: carbEffect.toFixed(1),
          exerciseEffect: exerciseEffect.toFixed(1)
        }
      });

      // Show alert with option to navigate back
      Alert.alert(
        'Prediction Complete',
        `Predicted glucose: ${predictedGlucose} mg/dL`,
        [
          {
            text: 'Stay on this screen',
            style: 'cancel'
          },
          {
            text: 'Return to Home',
            onPress: () => {
              navigation.navigate('Home', { refresh: new Date().getTime() });
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Prediction Error', 'Unable to calculate glucose level');
    } finally {
      setIsLoading(false);
    }
  };

  // Food Selection Modal
  const renderFoodModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isFoodModalVisible}
      onRequestClose={() => setIsFoodModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Select Food</Text>
          
          {/* Food Selection List */}
          <FlatList
            data={FOOD_DATABASE}
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
                onPress={() => {
                  if (tempSelectedFood && foodWeight) {
                    const newItem = {
                      ...tempSelectedFood,
                      weight: parseFloat(foodWeight)
                    };
                    setFoodItems([...foodItems, newItem]);
                    setTempSelectedFood(null);
                    setFoodWeight('');
                    setIsFoodModalVisible(false);
                  } else {
                    Alert.alert('Error', 'Please select a food and enter its weight');
                  }
                }}
                disabled={!tempSelectedFood || !foodWeight}
              >
                <Text style={styles.addFoodButtonText}>Add to Meal</Text>
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity 
            style={styles.modalCloseButton}
            onPress={() => {
              setTempSelectedFood(null);
              setFoodWeight('');
              setIsFoodModalVisible(false);
            }}
          >
            <Text style={styles.modalCloseButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Glucose Prediction</Text>
        <View style={styles.placeholder} />
      </View>

      {/* MAIN CHANGE: Replace ScrollView with FlatList for the main content */}
      <FlatList
        data={[1]} // Just need one item to render the content once
        keyExtractor={() => "main-content"}
        renderItem={() => (
          <View style={styles.content}>
            {/* Current Glucose Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Current Glucose Level (mg/dL)</Text>
              <View style={styles.inputContainer}>
                <Icon name="analytics-outline" size={20} color={colors.text.secondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={currentGlucose}
                  onChangeText={setCurrentGlucose}
                  keyboardType="numeric"
                  placeholder="Enter current glucose level"
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            {/* Insulin Dose Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Insulin Dose (units)</Text>
              <View style={styles.inputContainer}>
                <Icon name="fitness-outline" size={20} color={colors.text.secondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={insulinDose}
                  onChangeText={setInsulinDose}
                  keyboardType="numeric"
                  placeholder="Enter insulin dose"
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            {/* Food Intake Section */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Food Intake</Text>
              <TouchableOpacity 
                style={styles.addFoodButton}
                onPress={() => {
                  setIsFoodModalVisible(true);
                  setTempSelectedFood(null);
                  setFoodWeight('');
                }}
              >
                <Icon name="add-circle-outline" size={20} color={colors.accent} />
                <Text style={styles.addFoodButtonText}>Add Food Item</Text>
              </TouchableOpacity>

              {/* Food Items List - Rendered directly, no need for nested FlatList */}
              {foodItems.length === 0 ? (
                <Text style={styles.emptyFoodText}>No food items added</Text>
              ) : (
                foodItems.map((item, index) => (
                  <View key={index} style={styles.foodItemContainer}>
                    <View style={styles.foodItemDetails}>
                      <Text style={styles.foodItemName}>{item.name}</Text>
                      <Text style={styles.foodItemWeight}>{item.weight}g</Text>
                    </View>
                    <Text style={styles.foodItemCarbs}>
                      {((item.carbsPer100g * item.weight) / 100).toFixed(1)}g carbs
                    </Text>
                    <TouchableOpacity onPress={() => removeFoodItem(index)}>
                      <Icon name="trash-outline" size={20} color={colors.danger} />
                    </TouchableOpacity>
                  </View>
                ))
              )}

              {/* Total Carbs Display */}
              <View style={styles.totalCarbContainer}>
                <Text style={styles.totalCarbText}>
                  Total Carbs: {calculateTotalCarbs()}g
                </Text>
              </View>
            </View>

            {/* Exercise Duration Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Exercise Duration (minutes)</Text>
              <View style={styles.inputContainer}>
                <Icon name="walk-outline" size={20} color={colors.text.secondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={exerciseDuration}
                  onChangeText={setExerciseDuration}
                  keyboardType="numeric"
                  placeholder="Enter exercise duration"
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            {/* Exercise Intensity Selection */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Exercise Intensity</Text>
              <View style={styles.intensityContainer}>
                {['Low', 'Medium', 'High'].map((intensity, index) => (
                  <TouchableOpacity 
                    key={intensity}
                    style={[
                      styles.intensityButton,
                      exerciseIntensity === `${index + 1}` && styles.intensityButtonActive
                    ]}
                    onPress={() => setExerciseIntensity(`${index + 1}`)}
                  >
                    <Text style={[
                      styles.intensityText,
                      exerciseIntensity === `${index + 1}` && styles.intensityTextActive
                    ]}>
                      {intensity}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Predict Button */}
            <TouchableOpacity 
              style={styles.predictButton}
              onPress={predictGlucose}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.predictButtonText}>Predict Glucose Level</Text>
              )}
            </TouchableOpacity>

            {/* Prediction Result */}
            {predictionResult && (
              <View style={styles.resultContainer}>
                <Text style={styles.resultTitle}>Predicted Glucose Level</Text>
                <Text style={styles.resultValue}>
                  {predictionResult.predictedGlucose} mg/dL
                </Text>
                
                <View style={styles.resultDetailsContainer}>
                  <Text>Insulin Effect: {predictionResult.details.insulinEffect} mg/dL</Text>
                  <Text>Carb Effect: {predictionResult.details.carbEffect} mg/dL</Text>
                  <Text>Exercise Effect: {predictionResult.details.exerciseEffect} mg/dL</Text>
                </View>
              </View>
            )}
          </View>
        )}
      />

      {/* Food Selection Modal */}
      {renderFoodModal()}
    </View>
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
    flex: 1,
    padding: 16,
  },
  inputGroup: {
    marginBottom: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
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
  intensityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  intensityButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    marginHorizontal: 4,
    borderRadius: 8,
  },
  intensityButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  intensityText: {
    color: colors.text.secondary,
    fontWeight: '500',
  },
  intensityTextActive: {
    color: '#fff',
  },
  addFoodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  addFoodButtonText: {
    marginLeft: 10,
    color: colors.accent,
    fontWeight: '600',
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
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  foodItemName: {
    fontSize: 16,
    fontWeight: '500',
  },
  foodItemWeight: {
    color: colors.text.secondary,
  },
  foodItemCarbs: {
    color: colors.accent,
    marginRight: 10,
  },
  emptyFoodText: {
    textAlign: 'center',
    color: colors.text.secondary,
    marginVertical: 10,
  },
  totalCarbContainer: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  totalCarbText: {
    fontWeight: '600',
    color: colors.text.primary,
  },
  predictButton: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 15,
  },
  predictButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultTitle: {
    fontSize: 16,
    color: colors.text.secondary,
    marginBottom: 10,
  },
  resultValue: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  resultDetailsContainer: {
    width: '100%',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
  },
  foodSelectItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  selectedFoodItem: {
    backgroundColor: '#f0f8ff',
  },
  foodName: {
    fontSize: 16,
    fontWeight: '500',
  },
  foodCategory: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  foodCarbs: {
    color: colors.accent,
  },
  weightInputContainer: {
    marginTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 15,
  },
  selectedFoodName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: colors.primary,
  },
  weightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  weightLabel: {
    fontSize: 14,
    width: 80,
  },
  weightInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
  },
  addFoodButtonModal: {
    backgroundColor: colors.accent,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  addFoodButtonDisabled: {
    backgroundColor: '#cccccc',
  },
  modalCloseButton: {
    marginTop: 15,
    padding: 10,
    backgroundColor: colors.danger,
    borderRadius: 8,
  },
  modalCloseButtonText: {
    color: 'white',
    textAlign: 'center',
  }
});

export default GlucosePredictionScreen;