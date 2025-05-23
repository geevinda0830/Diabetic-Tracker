// // src/screens/InsulinDosagePredictionScreen.js
// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   TouchableOpacity,
//   TextInput,
//   Alert,
//   ActivityIndicator,
//   Modal,
//   FlatList
// } from 'react-native';
// import Icon from 'react-native-vector-icons/Ionicons';
// import { colors } from '../utils/theme';

// // Food database with carbs per 100g
// const foodDatabase = [
//   { id: 1, name: 'White Rice (cooked)', carbsPer100g: 28 },
//   { id: 2, name: 'Wheat Bread', carbsPer100g: 49 },
//   { id: 3, name: 'Potato', carbsPer100g: 17 },
//   { id: 4, name: 'Apple', carbsPer100g: 14 },
//   { id: 5, name: 'Banana', carbsPer100g: 23 },
//   { id: 6, name: 'Orange', carbsPer100g: 12 },
//   { id: 7, name: 'Pasta (cooked)', carbsPer100g: 25 },
//   { id: 8, name: 'Sweet Potato', carbsPer100g: 20 },
//   { id: 9, name: 'Milk', carbsPer100g: 5 },
//   { id: 10, name: 'Yogurt (plain)', carbsPer100g: 6 },
//   { id: 11, name: 'Chicken Breast', carbsPer100g: 0 },
//   { id: 12, name: 'Beef', carbsPer100g: 0 },
//   { id: 13, name: 'Broccoli', carbsPer100g: 7 },
//   { id: 14, name: 'Carrot', carbsPer100g: 10 },
//   { id: 15, name: 'White Sugar', carbsPer100g: 100 },
// ];

// const InsulinDosagePredictionScreen = ({ navigation }) => {
//   // State for inputs
//   const [bloodGlucose, setBloodGlucose] = useState('');
//   const [exerciseTime, setExerciseTime] = useState('');
//   const [currentInsulinDosage, setCurrentInsulinDosage] = useState('');
//   const [predictionResult, setPredictionResult] = useState(null);
//   const [isLoading, setIsLoading] = useState(false);
  
//   // Food selection state
//   const [foodItems, setFoodItems] = useState([]);
//   const [showFoodModal, setShowFoodModal] = useState(false);
//   const [selectedFood, setSelectedFood] = useState(null);
//   const [foodAmount, setFoodAmount] = useState('');
//   const [foodSearch, setFoodSearch] = useState('');
  
//   // Calculate total carbs from selected foods
//   const calculateTotalCarbs = () => {
//     return foodItems.reduce((total, item) => {
//       return total + (item.carbsPer100g * item.amount / 100);
//     }, 0).toFixed(1);
//   };
  
//   // Add food item to list
//   const addFoodItem = () => {
//     if (!selectedFood || !foodAmount || parseFloat(foodAmount) <= 0) {
//       Alert.alert('Error', 'Please select a food and enter a valid amount');
//       return;
//     }
    
//     const newItem = {
//       ...selectedFood,
//       amount: parseFloat(foodAmount),
//       carbs: (selectedFood.carbsPer100g * parseFloat(foodAmount) / 100).toFixed(1)
//     };
    
//     setFoodItems([...foodItems, newItem]);
//     setSelectedFood(null);
//     setFoodAmount('');
//     setShowFoodModal(false);
//   };
  
//   // Remove food item
//   const removeFoodItem = (id) => {
//     setFoodItems(foodItems.filter(item => item.id !== id));
//   };
  
//   // Filter foods based on search
//   const filteredFoods = foodSearch 
//     ? foodDatabase.filter(food => 
//         food.name.toLowerCase().includes(foodSearch.toLowerCase()))
//     : foodDatabase;

//   // ML-based Insulin Dosage Prediction
//   const predictInsulinDosage = async () => {
//     try {
//       setIsLoading(true);
      
//       const totalCarbs = parseFloat(calculateTotalCarbs());
      
//       // Prepare data for API
//       const data = {
//         bloodGlucose: parseFloat(bloodGlucose) || 0,
//         carbIntake: totalCarbs,
//         exerciseTime: parseFloat(exerciseTime) || 0,
//         currentInsulinDosage: parseFloat(currentInsulinDosage) || 0,
//         weight: 70 // Default weight
//       };
      
//       // Call API or use local prediction
//       try {
//         const response = await fetch('http://10.0.2.2:5002/api/predict-insulin', {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify(data)
//         });
        
//         if (!response.ok) throw new Error('API request failed');
        
//         const result = await response.json();
//         setPredictionResult({
//           recommendedDosage: result.recommendedDosage,
//           details: result.details,
//           method: result.method,
//           confidence: result.confidence
//         });
//       } catch (error) {
//         // Fallback to local calculation
//         console.error('API error:', error);
//         localPrediction(totalCarbs);
//       }
//     } catch (error) {
//       Alert.alert('Prediction Error', 'Unable to calculate insulin dosage');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Local fallback prediction 
//   const localPrediction = (carbs) => {
//     const glucose = parseFloat(bloodGlucose) || 0;
//     const exercise = parseFloat(exerciseTime) || 0;
//     const currentDosage = parseFloat(currentInsulinDosage) || 0;
//     const targetGlucose = 120;

//     const glucoseDifference = glucose - targetGlucose;
//     const carbEffect = carbs / 10;
//     const exerciseReduction = exercise * 0.2;
//     const glucoseAdjustment = glucoseDifference > 0 
//       ? Math.ceil(glucoseDifference / 30) 
//       : Math.floor(glucoseDifference / 30);

//     let recommendedDosage = currentDosage + glucoseAdjustment + carbEffect;
//     recommendedDosage = Math.max(0, recommendedDosage - exerciseReduction);
//     recommendedDosage = Math.round(recommendedDosage * 2) / 2;

//     setPredictionResult({
//       recommendedDosage,
//       details: {
//         currentGlucose: glucose,
//         glucoseDifference: glucoseDifference.toFixed(1),
//         carbEffect: carbEffect.toFixed(1),
//         exerciseReduction: exerciseReduction.toFixed(1)
//       },
//       method: 'local-fallback',
//       confidence: 0.6
//     });
//   };

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
//         <Text style={styles.headerTitle}>Insulin Dosage Prediction</Text>
//         <View style={styles.placeholder} />
//       </View>

//       <ScrollView style={styles.content}>
//         {/* Blood Glucose Input */}
//         <View style={styles.inputGroup}>
//           <Text style={styles.label}>Current Blood Glucose (mg/dL)</Text>
//           <View style={styles.inputContainer}>
//             <Icon name="analytics-outline" size={20} color={colors.text.secondary} style={styles.inputIcon} />
//             <TextInput
//               style={styles.input}
//               value={bloodGlucose}
//               onChangeText={setBloodGlucose}
//               keyboardType="numeric"
//               placeholder="Enter current blood glucose"
//               placeholderTextColor="#999"
//             />
//           </View>
//         </View>

//         {/* Current Insulin Dosage */}
//         <View style={styles.inputGroup}>
//           <Text style={styles.label}>Current Insulin Dosage (units)</Text>
//           <View style={styles.inputContainer}>
//             <Icon name="fitness-outline" size={20} color={colors.text.secondary} style={styles.inputIcon} />
//             <TextInput
//               style={styles.input}
//               value={currentInsulinDosage}
//               onChangeText={setCurrentInsulinDosage}
//               keyboardType="numeric"
//               placeholder="Enter current insulin dosage"
//               placeholderTextColor="#999"
//             />
//           </View>
//         </View>

//         {/* Food Selection */}
//         <View style={styles.inputGroup}>
//           <View style={styles.sectionHeader}>
//             <Text style={styles.label}>Carbohydrate Intake</Text>
//             <Text style={styles.totalCarbs}>Total: {calculateTotalCarbs()} g</Text>
//           </View>
          
//           {foodItems.map(item => (
//             <View key={`${item.id}-${item.amount}`} style={styles.foodItem}>
//               <View style={styles.foodItemInfo}>
//                 <Text style={styles.foodName}>{item.name}</Text>
//                 <Text style={styles.foodDetails}>{item.amount}g = {item.carbs}g carbs</Text>
//               </View>
//               <TouchableOpacity 
//                 style={styles.removeButton}
//                 onPress={() => removeFoodItem(item.id)}
//               >
//                 <Icon name="close-circle" size={22} color={colors.danger} />
//               </TouchableOpacity>
//             </View>
//           ))}
          
//           <TouchableOpacity 
//             style={styles.addFoodButton}
//             onPress={() => setShowFoodModal(true)}
//           >
//             <Icon name="add-circle-outline" size={18} color={colors.primary} />
//             <Text style={styles.addFoodText}>Add Food Item</Text>
//           </TouchableOpacity>
//         </View>

//         {/* Exercise Time Input */}
//         <View style={styles.inputGroup}>
//           <Text style={styles.label}>Exercise Time (minutes)</Text>
//           <View style={styles.inputContainer}>
//             <Icon name="walk-outline" size={20} color={colors.text.secondary} style={styles.inputIcon} />
//             <TextInput
//               style={styles.input}
//               value={exerciseTime}
//               onChangeText={setExerciseTime}
//               keyboardType="numeric"
//               placeholder="Enter exercise duration"
//               placeholderTextColor="#999"
//             />
//           </View>
//         </View>

//         {/* Predict Button */}
//         <TouchableOpacity 
//           style={styles.predictButton}
//           onPress={predictInsulinDosage}
//           disabled={isLoading}
//         >
//           {isLoading ? (
//             <ActivityIndicator color="#fff" size="small" />
//           ) : (
//             <Text style={styles.predictButtonText}>Predict Insulin Dosage</Text>
//           )}
//         </TouchableOpacity>

//         {/* Prediction Result */}
//         {predictionResult && (
//           <View style={styles.resultContainer}>
//             <Text style={styles.resultTitle}>Recommended Insulin Dosage</Text>
//             <Text style={styles.resultValue}>
//               {predictionResult.recommendedDosage.toFixed(1)} units
//             </Text>
//             <View style={styles.resultDetailsContainer}>
//               <Text style={styles.detailText}>Current Glucose: {predictionResult.details.currentGlucose} mg/dL</Text>
//               <Text style={styles.detailText}>Glucose Difference: {predictionResult.details.glucoseDifference} mg/dL</Text>
//               <Text style={styles.detailText}>Carb Effect: +{predictionResult.details.carbEffect} units</Text>
//               <Text style={styles.detailText}>Exercise Reduction: -{predictionResult.details.exerciseReduction} units</Text>
              
//               <View style={styles.disclaimerContainer}>
//                 <Icon name="information-circle-outline" size={16} color={colors.text.secondary} />
//                 <Text style={styles.disclaimerText}>
//                   Always consult healthcare provider before adjusting insulin doses.
//                 </Text>
//               </View>
//             </View>
//           </View>
//         )}
//       </ScrollView>

//       {/* Food Selection Modal */}
//       <Modal
//         visible={showFoodModal}
//         animationType="slide"
//         transparent={true}
//       >
//         <View style={styles.modalContainer}>
//           <View style={styles.modalContent}>
//             <View style={styles.modalHeader}>
//               <Text style={styles.modalTitle}>Select Food</Text>
//               <TouchableOpacity onPress={() => setShowFoodModal(false)}>
//                 <Icon name="close" size={24} color={colors.text.primary} />
//               </TouchableOpacity>
//             </View>
            
//             <View style={styles.searchContainer}>
//               <Icon name="search" size={20} color={colors.text.secondary} />
//               <TextInput
//                 style={styles.searchInput}
//                 placeholder="Search foods..."
//                 value={foodSearch}
//                 onChangeText={setFoodSearch}
//               />
//             </View>
            
//             <FlatList
//               data={filteredFoods}
//               keyExtractor={(item) => item.id.toString()}
//               renderItem={({ item }) => (
//                 <TouchableOpacity 
//                   style={[
//                     styles.foodOption,
//                     selectedFood?.id === item.id && styles.selectedFoodOption
//                   ]}
//                   onPress={() => setSelectedFood(item)}
//                 >
//                   <Text style={styles.foodOptionName}>{item.name}</Text>
//                   <Text style={styles.foodOptionCarbs}>{item.carbsPer100g}g per 100g</Text>
//                 </TouchableOpacity>
//               )}
//               style={styles.foodList}
//             />
            
//             <View style={styles.amountContainer}>
//               <Text style={styles.amountLabel}>Amount (grams):</Text>
//               <TextInput
//                 style={styles.amountInput}
//                 value={foodAmount}
//                 onChangeText={setFoodAmount}
//                 keyboardType="numeric"
//                 placeholder="Enter grams"
//               />
//             </View>
            
//             <TouchableOpacity 
//               style={[
//                 styles.addButton,
//                 (!selectedFood || !foodAmount) && styles.addButtonDisabled
//               ]}
//               onPress={addFoodItem}
//               disabled={!selectedFood || !foodAmount}
//             >
//               <Text style={styles.addButtonText}>Add to Meal</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </Modal>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: colors.background,
//   },
//   header: {
//     backgroundColor: colors.accent,
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
//   backButton: { padding: 5 },
//   placeholder: { width: 24 },
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
//   sectionHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 10,
//   },
//   label: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: colors.text.primary,
//   },
//   totalCarbs: {
//     fontWeight: 'bold',
//     color: colors.accent,
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
//   // Food items
//   foodItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     padding: 10,
//     backgroundColor: '#f8f8f8',
//     borderRadius: 6,
//     marginBottom: 8,
//   },
//   foodItemInfo: {
//     flex: 1,
//   },
//   foodName: {
//     fontSize: 14,
//     fontWeight: '500',
//   },
//   foodDetails: {
//     fontSize: 12,
//     color: colors.text.secondary,
//   },
//   removeButton: {
//     padding: 5,
//   },
//   addFoodButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     padding: 10,
//     borderWidth: 1,
//     borderColor: colors.primary,
//     borderRadius: 6,
//     borderStyle: 'dashed',
//   },
//   addFoodText: {
//     color: colors.primary,
//     marginLeft: 6,
//   },
//   // Prediction
//   predictButton: {
//     backgroundColor: colors.accent,
//     padding: 15,
//     borderRadius: 8,
//     alignItems: 'center',
//     marginVertical: 15,
//     height: 54,
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
//     color: colors.accent,
//     marginBottom: 15,
//   },
//   resultDetailsContainer: {
//     width: '100%',
//     borderTopWidth: 1,
//     borderTopColor: '#eee',
//     paddingTop: 15,
//   },
//   detailText: {
//     fontSize: 14,
//     color: colors.text.primary,
//     marginBottom: 5,
//   },
//   disclaimerContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 15,
//     padding: 10,
//     backgroundColor: '#f9f9f9',
//     borderRadius: 5,
//   },
//   disclaimerText: {
//     fontSize: 12,
//     color: colors.text.secondary,
//     marginLeft: 5,
//     flex: 1,
//   },
//   // Modal
//   modalContainer: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.5)',
//     justifyContent: 'flex-end',
//   },
//   modalContent: {
//     backgroundColor: '#fff',
//     borderTopLeftRadius: 15,
//     borderTopRightRadius: 15,
//     paddingBottom: 30,
//     maxHeight: '80%',
//   },
//   modalHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     padding: 15,
//     borderBottomWidth: 1,
//     borderBottomColor: '#eee',
//   },
//   modalTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//   },
//   searchContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 10,
//     margin: 10,
//     backgroundColor: '#f0f0f0',
//     borderRadius: 8,
//   },
//   searchInput: {
//     flex: 1,
//     marginLeft: 10,
//     fontSize: 16,
//   },
//   foodList: {
//     maxHeight: 300,
//   },
//   foodOption: {
//     padding: 15,
//     borderBottomWidth: 1,
//     borderBottomColor: '#eee',
//   },
//   selectedFoodOption: {
//     backgroundColor: '#e6f7ff',
//   },
//   foodOptionName: {
//     fontSize: 16,
//   },
//   foodOptionCarbs: {
//     fontSize: 14,
//     color: colors.text.secondary,
//   },
//   amountContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 15,
//     borderTopWidth: 1,
//     borderTopColor: '#eee',
//   },
//   amountLabel: {
//     width: 120,
//     fontSize: 16,
//   },
//   amountInput: {
//     flex: 1,
//     height: 40,
//     borderWidth: 1,
//     borderColor: '#ddd',
//     borderRadius: 6,
//     paddingHorizontal: 10,
//   },
//   addButton: {
//     backgroundColor: colors.primary,
//     margin: 15,
//     padding: 15,
//     borderRadius: 8,
//     alignItems: 'center',
//   },
//   addButtonDisabled: {
//     backgroundColor: '#ccc',
//   },
//   addButtonText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: 'bold',
//   }
// });

// export default InsulinDosagePredictionScreen;

// src/screens/InsulinDosagePredictionScreen.js

// import React, { useState, useRef } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   TextInput,
//   Alert,
//   ActivityIndicator,
//   Modal,
//   FlatList,
//   KeyboardAvoidingView,
//   Platform,
//   ScrollView
// } from 'react-native';
// import Icon from 'react-native-vector-icons/Ionicons';
// import { colors } from '../utils/theme';
// import { Alert } from 'react-native';

// // Food database with carbs per 100g
// const foodDatabase = [
//   { id: 1, name: 'White Rice (cooked)', carbsPer100g: 28 },
//   { id: 2, name: 'Wheat Bread', carbsPer100g: 49 },
//   { id: 3, name: 'Potato', carbsPer100g: 17 },
//   { id: 4, name: 'Apple', carbsPer100g: 14 },
//   { id: 5, name: 'Banana', carbsPer100g: 23 },
//   { id: 6, name: 'Orange', carbsPer100g: 12 },
//   { id: 7, name: 'Pasta (cooked)', carbsPer100g: 25 },
//   { id: 8, name: 'Sweet Potato', carbsPer100g: 20 },
//   { id: 9, name: 'Milk', carbsPer100g: 5 },
//   { id: 10, name: 'Yogurt (plain)', carbsPer100g: 6 },
//   { id: 11, name: 'Chicken Breast', carbsPer100g: 0 },
//   { id: 12, name: 'Beef', carbsPer100g: 0 },
//   { id: 13, name: 'Broccoli', carbsPer100g: 7 },
//   { id: 14, name: 'Carrot', carbsPer100g: 10 },
//   { id: 15, name: 'White Sugar', carbsPer100g: 100 },
// ];

// // API URL for insulin prediction
// const API_URL = 'http://10.0.2.2:5002/api/predict-insulin';

// const InsulinDosagePredictionScreen = ({ navigation }) => {
//   // State for inputs
//   const [bloodGlucose, setBloodGlucose] = useState('');
//   const [exerciseTime, setExerciseTime] = useState('');
//   const [currentInsulinDosage, setCurrentInsulinDosage] = useState('');
//   const [bodyWeight, setBodyWeight] = useState('70');
//   const [predictionResult, setPredictionResult] = useState(null);
//   const [isLoading, setIsLoading] = useState(false);
  
//   // Food selection state
//   const [foodItems, setFoodItems] = useState([]);
//   const [showFoodModal, setShowFoodModal] = useState(false);
//   const [selectedFood, setSelectedFood] = useState(null);
//   const [foodAmount, setFoodAmount] = useState('');
//   const [foodSearch, setFoodSearch] = useState('');
  
//   // Ref for ScrollView
//   const scrollViewRef = useRef(null);
  
//   // Calculate total carbs from selected foods
//   const calculateTotalCarbs = () => {
//     return foodItems.reduce((total, item) => {
//       return total + (item.carbsPer100g * item.amount / 100);
//     }, 0).toFixed(1);
//   };
  
//   // Add food item to list
//   const addFoodItem = () => {
//     if (!selectedFood || !foodAmount || parseFloat(foodAmount) <= 0) {
//       Alert.alert('Error', 'Please select a food and enter a valid amount');
//       return;
//     }
    
//     const newItem = {
//       ...selectedFood,
//       amount: parseFloat(foodAmount),
//       carbs: (selectedFood.carbsPer100g * parseFloat(foodAmount) / 100).toFixed(1)
//     };
    
//     setFoodItems([...foodItems, newItem]);
//     setSelectedFood(null);
//     setFoodAmount('');
//     setShowFoodModal(false);
    
//     // Scroll down to see exercise input after adding food
//     setTimeout(() => {
//       if (scrollViewRef.current) {
//         scrollViewRef.current.scrollToEnd({ animated: true });
//       }
//     }, 300);
//   };
  
//   // Remove food item
//   const removeFoodItem = (id) => {
//     setFoodItems(foodItems.filter(item => item.id !== id));
//   };
  
//   // Filter foods based on search
//   const filteredFoods = foodSearch 
//     ? foodDatabase.filter(food => 
//         food.name.toLowerCase().includes(foodSearch.toLowerCase()))
//     : foodDatabase;

//   // Local fallback prediction 
//   const localPrediction = (totalCarbs) => {
//     const glucose = parseFloat(bloodGlucose) || 0;
//     const exercise = parseFloat(exerciseTime) || 0;
//     const currentDosage = parseFloat(currentInsulinDosage) || 0;
//     const targetGlucose = 120;

//     const glucoseDifference = glucose - targetGlucose;
//     const carbEffect = totalCarbs / 10;
//     const exerciseReduction = exercise * 0.2;
//     const glucoseAdjustment = glucoseDifference > 0 
//       ? Math.ceil(glucoseDifference / 30) 
//       : Math.floor(glucoseDifference / 30);

//     let recommendedDosage = currentDosage + glucoseAdjustment + carbEffect;
//     recommendedDosage = Math.max(0, recommendedDosage - exerciseReduction);
//     recommendedDosage = Math.round(recommendedDosage * 2) / 2;

//     setPredictionResult({
//       recommendedDosage,
//       details: {
//         currentGlucose: glucose,
//         glucoseDifference: glucoseDifference.toFixed(1),
//         carbEffect: carbEffect.toFixed(1),
//         exerciseReduction: exerciseReduction.toFixed(1)
//       },
//       method: 'local-fallback',
//       confidence: 0.6
//     });
//     setIsLoading(false);
//   };

//   // ML-based Insulin Dosage Prediction
//   const predictInsulinDosage = async () => {
//     try {
//       setIsLoading(true);
      
//       // Validate inputs
//       if (!bloodGlucose) {
//         Alert.alert('Error', 'Please enter current blood glucose level');
//         setIsLoading(false);
//         return;
//       }
      
//       const totalCarbs = parseFloat(calculateTotalCarbs());
      
//       // Prepare data for API
//       const data = {
//         bloodGlucose: parseFloat(bloodGlucose) || 0,
//         carbIntake: totalCarbs,
//         exerciseTime: parseFloat(exerciseTime) || 0,
//         currentInsulinDosage: parseFloat(currentInsulinDosage) || 0,
//         weight: parseFloat(bodyWeight) || 70
//       };
      
//       console.log("Prediction data:", data);
      
//       // Use timeout to prevent waiting too long for API
//       const timeoutPromise = new Promise((_, reject) =>
//         setTimeout(() => reject(new Error('Request timeout')), 5000)
//       );
      
//       // Call API with timeout
//       // try {
//       //   const response = await Promise.race([
//       //     fetch(API_URL, {
//       //       method: 'POST',
//       //       headers: { 'Content-Type': 'application/json' },
//       //       body: JSON.stringify(data)
//       //     }),
//       //     timeoutPromise
//       //   ]);
        
//       //   if (!response.ok) {
//       //     throw new Error(`API response error: ${response.status}`);
//       //   }
        
//       //   const result = await response.json();
//       // Add this to InsulinScreen.js
// // In the predictInsulinDosage function, modify the API call section:

// try {
//   // Call the backend API
//   const result = await predictInsulin(data);
  
//   console.log("API result:", result);
  
//   setPredictionResult({
//     recommendedDosage: result.recommendedDosage,
//     details: result.details,
//     method: result.method,
//     confidence: result.confidence
//   });
  
//   // Save the meal data
//   if (foodItems.length > 0) {
//     const mealData = {
//       totalCarbs: parseFloat(calculateTotalCarbs()),
//       foodItems: foodItems.map(item => ({
//         name: item.name,
//         carbsPer100g: item.carbsPer100g,
//         weight: item.amount,
//         carbs: parseFloat(item.carbs)
//       })),
//       timestamp: new Date().toISOString()
//     };
//     console.log("Saving meal data:", mealData);
//     try {
//       const mealResult = await saveMeal(mealData);
//       console.log("Meal saved successfully:", mealResult);
//     } catch (mealError) {
//       console.error("Error saving meal:", mealError);
//     }
//   }

//   setTimeout(() => {
//     navigation.navigate('Home', { refresh: new Date().getTime() });
//   }, 2000);
  
//   // Save the insulin dose prediction
//   try {
//     const insulinData = {
//       units: result.recommendedDosage,
//       type: 'rapid',
//       bloodGlucose: parseFloat(bloodGlucose) || 0,
//       timestamp: new Date().toISOString(),
//       notes: `Predicted dose. Carbs: ${calculateTotalCarbs()}g, Exercise: ${exerciseTime || 0}min`
//     };
//     console.log("Saving insulin data:", insulinData);
//     const insulinResult = await saveInsulinDose(insulinData);
//     console.log("Insulin saved successfully:", insulinResult);
//   } catch (insulinError) {
//     console.error("Error saving insulin:", insulinError);
//   }
// } catch (apiError) {
//   console.error('API error:', apiError);
//   Alert.alert(
//     'Connection Error',
//     'Could not connect to prediction service. Using local calculation instead.'
//   );
//   // Local calculation is handled by the backend now
// }

//       try {
//         const response = await fetch('http://10.0.2.2:5002/api/predict-insulin', {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify(data)
//         });
        
//         if (!response.ok) throw new Error('API request failed');
        
//         const result = await response.json();
//         console.log("API result:", result);
        
//         setPredictionResult({
//           recommendedDosage: result.recommendedDosage,
//           details: result.details,
//           method: result.method,
//           confidence: result.confidence
//         });
//       } catch (apiError) {
//         console.error('API error:', apiError);
//         // Fallback to local calculation
//         Alert.alert(
//           'Connection Error',
//           'Could not connect to prediction service. Using local calculation instead.',
//           [{ text: 'OK' }]
//         );
//         localPrediction(totalCarbs);
//       }
//     } catch (error) {
//       console.error('Prediction error:', error);
//       Alert.alert('Prediction Error', 'Unable to calculate insulin dosage');
//       setIsLoading(false);
//     }
//   };

  

//   return (
//     <KeyboardAvoidingView 
//       style={styles.container}
//       behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//       keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
//     >
//       {/* Header */}
//       <View style={styles.header}>
//         <TouchableOpacity 
//           style={styles.backButton} 
//           onPress={() => navigation.goBack()}
//         >
//           <Icon name="arrow-back" size={24} color="#fff" />
//         </TouchableOpacity>
//         <Text style={styles.headerTitle}>Insulin Dosage Prediction</Text>
//         <View style={styles.placeholder} />
//       </View>

//       <ScrollView 
//         ref={scrollViewRef} 
//         style={styles.scrollView}
//         contentContainerStyle={styles.scrollViewContent}
//         keyboardShouldPersistTaps="handled"
//         showsVerticalScrollIndicator={true}
//       >
//         {/* Blood Glucose Input */}
//         <View style={styles.inputGroup}>
//           <Text style={styles.label}>Current Blood Glucose (mg/dL)</Text>
//           <View style={styles.inputContainer}>
//             <Icon name="analytics-outline" size={20} color={colors.text.secondary} style={styles.inputIcon} />
//             <TextInput
//               style={styles.input}
//               value={bloodGlucose}
//               onChangeText={setBloodGlucose}
//               keyboardType="numeric"
//               placeholder="Enter current blood glucose"
//               placeholderTextColor="#999"
//             />
//           </View>
//         </View>

//         {/* Current Insulin Dosage */}
//         <View style={styles.inputGroup}>
//           <Text style={styles.label}>Current Insulin Dosage (units)</Text>
//           <View style={styles.inputContainer}>
//             <Icon name="fitness-outline" size={20} color={colors.text.secondary} style={styles.inputIcon} />
//             <TextInput
//               style={styles.input}
//               value={currentInsulinDosage}
//               onChangeText={setCurrentInsulinDosage}
//               keyboardType="numeric"
//               placeholder="Enter current insulin dosage"
//               placeholderTextColor="#999"
//             />
//           </View>
//         </View>

//         {/* Body Weight Input */}
//         <View style={styles.inputGroup}>
//           <Text style={styles.label}>Body Weight (kg)</Text>
//           <View style={styles.inputContainer}>
//             <Icon name="body-outline" size={20} color={colors.text.secondary} style={styles.inputIcon} />
//             <TextInput
//               style={styles.input}
//               value={bodyWeight}
//               onChangeText={setBodyWeight}
//               keyboardType="numeric"
//               placeholder="Enter body weight"
//               placeholderTextColor="#999"
//             />
//           </View>
//         </View>

//         {/* Food Selection */}
//         <View style={styles.inputGroup}>
//           <View style={styles.sectionHeader}>
//             <Text style={styles.label}>Carbohydrate Intake</Text>
//             <Text style={styles.totalCarbs}>Total: {calculateTotalCarbs()} g</Text>
//           </View>
          
//           {foodItems.length > 0 && (
//             <View style={styles.foodList}>
//               {foodItems.map(item => (
//                 <View key={`${item.id}-${item.amount}`} style={styles.foodItem}>
//                   <View style={styles.foodItemInfo}>
//                     <Text style={styles.foodName}>{item.name}</Text>
//                     <Text style={styles.foodDetails}>{item.amount}g = {item.carbs}g carbs</Text>
//                   </View>
//                   <TouchableOpacity 
//                     style={styles.removeButton}
//                     onPress={() => removeFoodItem(item.id)}
//                   >
//                     <Icon name="close-circle" size={22} color={colors.danger} />
//                   </TouchableOpacity>
//                 </View>
//               ))}
//             </View>
//           )}
          
//           <TouchableOpacity 
//             style={styles.addFoodButton}
//             onPress={() => setShowFoodModal(true)}
//           >
//             <Icon name="add-circle-outline" size={18} color={colors.primary} />
//             <Text style={styles.addFoodText}>Add Food Item</Text>
//           </TouchableOpacity>
//         </View>

//         {/* Exercise Time Input */}
//         <View style={styles.inputGroup}>
//           <Text style={styles.label}>Exercise Time (minutes)</Text>
//           <View style={styles.inputContainer}>
//             <Icon name="walk-outline" size={20} color={colors.text.secondary} style={styles.inputIcon} />
//             <TextInput
//               style={styles.input}
//               value={exerciseTime}
//               onChangeText={setExerciseTime}
//               keyboardType="numeric"
//               placeholder="Enter exercise duration"
//               placeholderTextColor="#999"
//             />
//           </View>
//         </View>

//         {/* Predict Button */}
//         <TouchableOpacity 
//           style={styles.predictButton}
//           onPress={predictInsulinDosage}
//           disabled={isLoading}
//         >
//           {isLoading ? (
//             <ActivityIndicator color="#fff" size="small" />
//           ) : (
//             <Text style={styles.predictButtonText}>Predict Insulin Dosage</Text>
//           )}
//         </TouchableOpacity>

//         {/* Prediction Result */}
//         {predictionResult && (
//           <View style={styles.resultContainer}>
//             <Text style={styles.resultTitle}>Recommended Insulin Dosage</Text>
//             <Text style={styles.resultValue}>
//               {predictionResult.recommendedDosage.toFixed(1)} units
//             </Text>
            
//             <View style={styles.predictionMethod}>
//               <Text style={styles.methodText}>
//                 Method: {predictionResult.method === 'ml-model' ? 'AI Model' : 'Local Calculation'}
//               </Text>
//               <Text style={styles.confidenceText}>
//                 Confidence: {(predictionResult.confidence * 100).toFixed(0)}%
//               </Text>
//             </View>
            
//             <View style={styles.resultDetailsContainer}>
//               <Text style={styles.detailText}>Current Glucose: {predictionResult.details.currentGlucose} mg/dL</Text>
//               <Text style={styles.detailText}>Glucose Difference: {predictionResult.details.glucoseDifference} mg/dL</Text>
//               <Text style={styles.detailText}>Carb Effect: +{predictionResult.details.carbEffect} units</Text>
//               <Text style={styles.detailText}>Exercise Reduction: -{predictionResult.details.exerciseReduction} units</Text>
              
//               <View style={styles.disclaimerContainer}>
//                 <Icon name="information-circle-outline" size={16} color={colors.text.secondary} />
//                 <Text style={styles.disclaimerText}>
//                   Always consult healthcare provider before adjusting insulin doses.
//                 </Text>
//               </View>
//             </View>
//           </View>
//         )}
        
//         {/* Extra padding at bottom to ensure scroll works */}
//         <View style={{ height: 30 }} />
//       </ScrollView>

//       {/* Food Selection Modal */}
//       <Modal
//         visible={showFoodModal}
//         animationType="slide"
//         transparent={true}
//       >
//         <View style={styles.modalContainer}>
//           <View style={styles.modalContent}>
//             <View style={styles.modalHeader}>
//               <Text style={styles.modalTitle}>Select Food</Text>
//               <TouchableOpacity onPress={() => setShowFoodModal(false)}>
//                 <Icon name="close" size={24} color={colors.text.primary} />
//               </TouchableOpacity>
//             </View>
            
//             <View style={styles.searchContainer}>
//               <Icon name="search" size={20} color={colors.text.secondary} />
//               <TextInput
//                 style={styles.searchInput}
//                 placeholder="Search foods..."
//                 value={foodSearch}
//                 onChangeText={setFoodSearch}
//               />
//             </View>
            
//             <FlatList
//               data={filteredFoods}
//               keyExtractor={(item) => item.id.toString()}
//               renderItem={({ item }) => (
//                 <TouchableOpacity 
//                   style={[
//                     styles.foodOption,
//                     selectedFood?.id === item.id && styles.selectedFoodOption
//                   ]}
//                   onPress={() => setSelectedFood(item)}
//                 >
//                   <Text style={styles.foodOptionName}>{item.name}</Text>
//                   <Text style={styles.foodOptionCarbs}>{item.carbsPer100g}g per 100g</Text>
//                 </TouchableOpacity>
//               )}
//               style={styles.foodModalList}
//             />
            
//             <View style={styles.amountContainer}>
//               <Text style={styles.amountLabel}>Amount (grams):</Text>
//               <TextInput
//                 style={styles.amountInput}
//                 value={foodAmount}
//                 onChangeText={setFoodAmount}
//                 keyboardType="numeric"
//                 placeholder="Enter grams"
//               />
//             </View>
            
//             <TouchableOpacity 
//               style={[
//                 styles.addButton,
//                 (!selectedFood || !foodAmount) && styles.addButtonDisabled
//               ]}
//               onPress={addFoodItem}
//               disabled={!selectedFood || !foodAmount}
//             >
//               <Text style={styles.addButtonText}>Add to Meal</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </Modal>
//     </KeyboardAvoidingView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: colors.background,
//   },
//   header: {
//     backgroundColor: colors.accent,
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
//   backButton: { padding: 5 },
//   placeholder: { width: 24 },
//   scrollView: {
//     flex: 1,
//   },
//   scrollViewContent: {
//     padding: 16,
//     paddingBottom: 100, // Extra padding to ensure scrolling works
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
//   sectionHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 10,
//   },
//   label: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: colors.text.primary,
//   },
//   totalCarbs: {
//     fontWeight: 'bold',
//     color: colors.accent,
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
//   // Food items
//   foodList: {
//     marginBottom: 10,
//   },
//   foodItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     padding: 10,
//     backgroundColor: '#f8f8f8',
//     borderRadius: 6,
//     marginBottom: 8,
//   },
//   foodItemInfo: {
//     flex: 1,
//   },
//   foodName: {
//     fontSize: 14,
//     fontWeight: '500',
//   },
//   foodDetails: {
//     fontSize: 12,
//     color: colors.text.secondary,
//   },
//   removeButton: {
//     padding: 5,
//   },
//   addFoodButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     padding: 10,
//     borderWidth: 1,
//     borderColor: colors.primary,
//     borderRadius: 6,
//     borderStyle: 'dashed',
//   },
//   addFoodText: {
//     color: colors.primary,
//     marginLeft: 6,
//   },
//   // Prediction
//   predictButton: {
//     backgroundColor: colors.accent,
//     padding: 15,
//     borderRadius: 8,
//     alignItems: 'center',
//     marginVertical: 15,
//     height: 54,
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
//     color: colors.accent,
//     marginBottom: 15,
//   },
//   predictionMethod: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     width: '100%',
//     marginBottom: 15,
//     padding: 8,
//     backgroundColor: '#f5f5f5',
//     borderRadius: 6,
//   },
//   methodText: {
//     fontSize: 12,
//     color: colors.text.secondary,
//   },
//   confidenceText: {
//     fontSize: 12,
//     fontWeight: '500',
//     color: colors.accent,
//   },
//   resultDetailsContainer: {
//     width: '100%',
//     borderTopWidth: 1,
//     borderTopColor: '#eee',
//     paddingTop: 15,
//   },
//   detailText: {
//     fontSize: 14,
//     color: colors.text.primary,
//     marginBottom: 5,
//   },
//   disclaimerContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 15,
//     padding: 10,
//     backgroundColor: '#f9f9f9',
//     borderRadius: 5,
//   },
//   disclaimerText: {
//     fontSize: 12,
//     color: colors.text.secondary,
//     marginLeft: 5,
//     flex: 1,
//   },
//   // Modal
//   modalContainer: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.5)',
//     justifyContent: 'flex-end',
//   },
//   modalContent: {
//     backgroundColor: '#fff',
//     borderTopLeftRadius: 15,
//     borderTopRightRadius: 15,
//     paddingBottom: 30,
//     maxHeight: '80%',
//   },
//   modalHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     padding: 15,
//     borderBottomWidth: 1,
//     borderBottomColor: '#eee',
//   },
//   modalTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//   },
//   searchContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 10,
//     margin: 10,
//     backgroundColor: '#f0f0f0',
//     borderRadius: 8,
//   },
//   searchInput: {
//     flex: 1,
//     marginLeft: 10,
//     fontSize: 16,
//   },
//   foodModalList: {
//     maxHeight: 300,
//   },
//   foodOption: {
//     padding: 15,
//     borderBottomWidth: 1,
//     borderBottomColor: '#eee',
//   },
//   selectedFoodOption: {
//     backgroundColor: '#e6f7ff',
//   },
//   foodOptionName: {
//     fontSize: 16,
//   },
//   foodOptionCarbs: {
//     fontSize: 14,
//     color: colors.text.secondary,
//   },
//   amountContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 15,
//     borderTopWidth: 1,
//     borderTopColor: '#eee',
//   },
//   amountLabel: {
//     width: 120,
//     fontSize: 16,
//   },
//   amountInput: {
//     flex: 1,
//     height: 40,
//     borderWidth: 1,
//     borderColor: '#ddd',
//     borderRadius: 6,
//     paddingHorizontal: 10,
//   },
//   addButton: {
//     backgroundColor: colors.primary,
//     margin: 15,
//     padding: 15,
//     borderRadius: 8,
//     alignItems: 'center',
//   },
//   addButtonDisabled: {
//     backgroundColor: '#ccc',
//   },
//   addButtonText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: 'bold',
//   }
// });

// export default InsulinDosagePredictionScreen;

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../utils/theme';
import { saveMeal, saveInsulinDose, predictInsulin } from '../services/api';

// Food database with carbs per 100g
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
];

const InsulinDosagePredictionScreen = ({ navigation }) => {
  // State for inputs
  const [bloodGlucose, setBloodGlucose] = useState('');
  const [exerciseTime, setExerciseTime] = useState('');
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
    
    // Scroll down to see exercise input after adding food
    setTimeout(() => {
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollToEnd({ animated: true });
      }
    }, 300);
  };
  
  // Remove food item
  const removeFoodItem = (id) => {
    setFoodItems(foodItems.filter(item => item.id !== id));
  };
  
  // Filter foods based on search
  const filteredFoods = foodSearch 
    ? foodDatabase.filter(food => 
        food.name.toLowerCase().includes(foodSearch.toLowerCase()))
    : foodDatabase;

  // Local fallback prediction 
  const localPrediction = (totalCarbs) => {
    const glucose = parseFloat(bloodGlucose) || 0;
    const exercise = parseFloat(exerciseTime) || 0;
    const currentDosage = parseFloat(currentInsulinDosage) || 0;
    const targetGlucose = 120;

    const glucoseDifference = glucose - targetGlucose;
    const carbEffect = totalCarbs / 10;
    const exerciseReduction = exercise * 0.2;
    const glucoseAdjustment = glucoseDifference > 0 
      ? Math.ceil(glucoseDifference / 30) 
      : Math.floor(glucoseDifference / 30);

    let recommendedDosage = currentDosage + glucoseAdjustment + carbEffect;
    recommendedDosage = Math.max(0, recommendedDosage - exerciseReduction);
    recommendedDosage = Math.round(recommendedDosage * 2) / 2;

    setPredictionResult({
      recommendedDosage,
      details: {
        currentGlucose: glucose,
        glucoseDifference: glucoseDifference.toFixed(1),
        carbEffect: carbEffect.toFixed(1),
        exerciseReduction: exerciseReduction.toFixed(1)
      },
      method: 'local-fallback',
      confidence: 0.6
    });
    setIsLoading(false);
  };

  const predictInsulinDosage = async () => {
    try {
      setIsLoading(true);
      
      // Validate inputs
      if (!bloodGlucose) {
        Alert.alert('Error', 'Please enter current blood glucose level');
        setIsLoading(false);
        return;
      }
      
      const totalCarbs = parseFloat(calculateTotalCarbs());
      
      // Prepare data for API
      const data = {
        bloodGlucose: parseFloat(bloodGlucose) || 0,
        carbIntake: totalCarbs,
        exerciseTime: parseFloat(exerciseTime) || 0,
        currentInsulinDosage: parseFloat(currentInsulinDosage) || 0,
        weight: parseFloat(bodyWeight) || 70
      };
      
      console.log("Prediction data:", data);
      
      try {
        // Call the backend API using the predictInsulin function from api.js
        const result = await predictInsulin(data);
        
        console.log("API result:", result);
        
        setPredictionResult({
          recommendedDosage: result.recommendedDosage,
          details: result.details,
          method: result.method,
          confidence: result.confidence
        });
        
        // Save the meal data
        if (foodItems.length > 0) {
          const mealData = {
            totalCarbs: parseFloat(calculateTotalCarbs()),
            foodItems: foodItems.map(item => ({
              name: item.name,
              carbsPer100g: item.carbsPer100g,
              weight: item.amount,
              carbs: parseFloat(item.carbs)
            })),
            timestamp: new Date().toISOString()
          };
          console.log("Saving meal data:", mealData);
          try {
            const mealResult = await saveMeal(mealData);
            console.log("Meal saved successfully:", mealResult);
          } catch (mealError) {
            console.error("Error saving meal:", mealError);
          }
        }
        
        // Save the insulin dose prediction
        try {
          const insulinData = {
            units: result.recommendedDosage,
            type: 'rapid',
            bloodGlucose: parseFloat(bloodGlucose) || 0,
            timestamp: new Date().toISOString(),
            notes: `Predicted dose. Carbs: ${calculateTotalCarbs()}g, Exercise: ${exerciseTime || 0}min`
          };
          console.log("Saving insulin data:", insulinData);
          const insulinResult = await saveInsulinDose(insulinData);
          console.log("Insulin saved successfully:", insulinResult);
          
          // Navigate home after successful save
          setTimeout(() => {
            navigation.navigate('Home', { refresh: new Date().getTime() });
          }, 2000);
        } catch (insulinError) {
          console.error("Error saving insulin:", insulinError);
        }
        
      } catch (apiError) {
        console.error('API error:', apiError);
        Alert.alert(
          'Connection Error',
          'Could not connect to prediction service. Using local calculation instead.'
        );
        
        // Local calculation fallback
        localPrediction(totalCarbs);
      }
    } catch (error) {
      console.error('Prediction error:', error);
      Alert.alert('Prediction Error', 'Unable to calculate insulin dosage');
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Insulin Dosage Prediction</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        ref={scrollViewRef} 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={true}
      >
        {/* Blood Glucose Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Current Blood Glucose (mg/dL)</Text>
          <View style={styles.inputContainer}>
            <Icon name="analytics-outline" size={20} color={colors.text.secondary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={bloodGlucose}
              onChangeText={setBloodGlucose}
              keyboardType="numeric"
              placeholder="Enter current blood glucose"
              placeholderTextColor="#999"
            />
          </View>
        </View>

        {/* Current Insulin Dosage */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Current Insulin Dosage (units)</Text>
          <View style={styles.inputContainer}>
            <Icon name="fitness-outline" size={20} color={colors.text.secondary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={currentInsulinDosage}
              onChangeText={setCurrentInsulinDosage}
              keyboardType="numeric"
              placeholder="Enter current insulin dosage"
              placeholderTextColor="#999"
            />
          </View>
        </View>

        {/* Body Weight Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Body Weight (kg)</Text>
          <View style={styles.inputContainer}>
            <Icon name="body-outline" size={20} color={colors.text.secondary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={bodyWeight}
              onChangeText={setBodyWeight}
              keyboardType="numeric"
              placeholder="Enter body weight"
              placeholderTextColor="#999"
            />
          </View>
        </View>

        {/* Food Selection */}
        <View style={styles.inputGroup}>
          <View style={styles.sectionHeader}>
            <Text style={styles.label}>Carbohydrate Intake</Text>
            <Text style={styles.totalCarbs}>Total: {calculateTotalCarbs()} g</Text>
          </View>
          
          {foodItems.length > 0 && (
            <View style={styles.foodList}>
              {foodItems.map(item => (
                <View key={`${item.id}-${item.amount}`} style={styles.foodItem}>
                  <View style={styles.foodItemInfo}>
                    <Text style={styles.foodName}>{item.name}</Text>
                    <Text style={styles.foodDetails}>{item.amount}g = {item.carbs}g carbs</Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.removeButton}
                    onPress={() => removeFoodItem(item.id)}
                  >
                    <Icon name="close-circle" size={22} color={colors.danger} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
          
          <TouchableOpacity 
            style={styles.addFoodButton}
            onPress={() => setShowFoodModal(true)}
          >
            <Icon name="add-circle-outline" size={18} color={colors.primary} />
            <Text style={styles.addFoodText}>Add Food Item</Text>
          </TouchableOpacity>
        </View>

        {/* Exercise Time Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Exercise Time (minutes)</Text>
          <View style={styles.inputContainer}>
            <Icon name="walk-outline" size={20} color={colors.text.secondary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={exerciseTime}
              onChangeText={setExerciseTime}
              keyboardType="numeric"
              placeholder="Enter exercise duration"
              placeholderTextColor="#999"
            />
          </View>
        </View>

        {/* Predict Button */}
        <TouchableOpacity 
          style={styles.predictButton}
          onPress={predictInsulinDosage}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.predictButtonText}>Predict Insulin Dosage</Text>
          )}
        </TouchableOpacity>

        {/* Prediction Result */}
        {predictionResult && (
          <View style={styles.resultContainer}>
            <Text style={styles.resultTitle}>Recommended Insulin Dosage</Text>
            <Text style={styles.resultValue}>
              {predictionResult.recommendedDosage.toFixed(1)} units
            </Text>
            
            <View style={styles.predictionMethod}>
              <Text style={styles.methodText}>
                Method: {predictionResult.method === 'ml-model' ? 'AI Model' : 'Local Calculation'}
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
              
              <View style={styles.disclaimerContainer}>
                <Icon name="information-circle-outline" size={16} color={colors.text.secondary} />
                <Text style={styles.disclaimerText}>
                  Always consult healthcare provider before adjusting insulin doses.
                </Text>
              </View>
            </View>
          </View>
        )}
        
        {/* Extra padding at bottom to ensure scroll works */}
        <View style={{ height: 30 }} />
      </ScrollView>

      {/* Food Selection Modal */}
      <Modal
        visible={showFoodModal}
        animationType="slide"
        transparent={true}
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
            
            <View style={styles.amountContainer}>
              <Text style={styles.amountLabel}>Amount (grams):</Text>
              <TextInput
                style={styles.amountInput}
                value={foodAmount}
                onChangeText={setFoodAmount}
                keyboardType="numeric"
                placeholder="Enter grams"
              />
            </View>
            
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
      </Modal>
    </KeyboardAvoidingView>
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
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  backButton: { padding: 5 },
  placeholder: { width: 24 },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    padding: 16,
    paddingBottom: 100, // Extra padding to ensure scrolling works
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
  },
  totalCarbs: {
    fontWeight: 'bold',
    color: colors.accent,
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
  // Food items
  foodList: {
    marginBottom: 10,
  },
  foodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: '#f8f8f8',
    borderRadius: 6,
    marginBottom: 8,
  },
  foodItemInfo: {
    flex: 1,
  },
  foodName: {
    fontSize: 14,
    fontWeight: '500',
  },
  foodDetails: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  removeButton: {
    padding: 5,
  },
  addFoodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 6,
    borderStyle: 'dashed',
  },
  addFoodText: {
    color: colors.primary,
    marginLeft: 6,
  },
  // Prediction
  predictButton: {
    backgroundColor: colors.accent,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 15,
    height: 54,
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
    color: colors.accent,
    marginBottom: 15,
  },
  predictionMethod: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 15,
    padding: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 6,
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
    marginBottom: 5,
  },
  disclaimerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 5,
  },
  disclaimerText: {
    fontSize: 12,
    color: colors.text.secondary,
    marginLeft: 5,
    flex: 1,
  },
  // Modal
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    paddingBottom: 30,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    margin: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  foodModalList: {
    maxHeight: 300,
  },
  foodOption: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  selectedFoodOption: {
    backgroundColor: '#e6f7ff',
  },
  foodOptionName: {
    fontSize: 16,
  },
  foodOptionCarbs: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  amountLabel: {
    width: 120,
    fontSize: 16,
  },
  amountInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    paddingHorizontal: 10,
  },
  addButton: {
    backgroundColor: colors.primary,
    margin: 15,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonDisabled: {
    backgroundColor: '#ccc',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  }
});

export default InsulinDosagePredictionScreen;