// // src/screens/auth/ProfileSetupScreen.js
// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TextInput,
//   TouchableOpacity,
//   ScrollView,
//   Alert,
//   ActivityIndicator
// } from 'react-native';
// import { Picker } from '@react-native-picker/picker';
// import Icon from 'react-native-vector-icons/Ionicons';
// import { useAuth } from '../../contexts/AuthContext';
// import { updateUserProfile } from '../../services/authService';
// import { colors } from '../../utils/theme';

// const ProfileSetupScreen = () => {
//   const { currentUser, updateLocalProfile } = useAuth();
//   const [step, setStep] = useState(1);
//   const [loading, setLoading] = useState(false);
  
//   // Form state
//   const [profileData, setProfileData] = useState({
//     name: '',
//     weight: '',
//     height: '',
//     diabetesType: 'Type 1',
//     diagnosisYear: new Date().getFullYear().toString(),
//     targetRange: {
//       min: '70',
//       max: '180'
//     }
//   });

//   const updateProfile = (key, value) => {
//     if (key.includes('.')) {
//       const [parent, child] = key.split('.');
//       setProfileData(prev => ({
//         ...prev,
//         [parent]: {
//           ...prev[parent],
//           [child]: value
//         }
//       }));
//     } else {
//       setProfileData(prev => ({
//         ...prev,
//         [key]: value
//       }));
//     }
//   };

//   const handleContinue = () => {
//     if (step === 1) {
//       // Validate step 1
//       if (!profileData.name) {
//         Alert.alert('Error', 'Please enter your name');
//         return;
//       }
//       setStep(2);
//     } else if (step === 2) {
//       // Validate step 2
//       if (!profileData.weight || !profileData.height) {
//         Alert.alert('Error', 'Please enter both your weight and height');
//         return;
//       }
//       setStep(3);
//     } else {
//       handleSubmit();
//     }
//   };

//   const handleSubmit = async () => {
//     try {
//       setLoading(true);
      
//       // Convert string values to numbers
//       const formattedData = {
//         ...profileData,
//         weight: parseFloat(profileData.weight),
//         height: parseFloat(profileData.height),
//         diagnosisYear: parseInt(profileData.diagnosisYear),
//         targetRange: {
//           min: parseInt(profileData.targetRange.min),
//           max: parseInt(profileData.targetRange.max)
//         }
//       };
      
//       const result = await updateUserProfile(currentUser.uid, formattedData);
      
//       if (result.success) {
//         updateLocalProfile(formattedData);
//         Alert.alert('Success', 'Your profile has been set up successfully');
//       } else {
//         Alert.alert('Error', result.error || 'Failed to set up profile');
//       }
//     } catch (error) {
//       Alert.alert('Error', error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const renderStep1 = () => (
//     <View style={styles.formSection}>
//       <Text style={styles.stepTitle}>Step 1: Basic Information</Text>
      
//       <View style={styles.inputGroup}>
//         <Text style={styles.label}>Full Name</Text>
//         <View style={styles.inputContainer}>
//           <Icon name="person-outline" size={20} color={colors.text.secondary} style={styles.inputIcon} />
//           <TextInput
//             style={styles.input}
//             value={profileData.name}
//             onChangeText={(value) => updateProfile('name', value)}
//             placeholder="Enter your full name"
//             placeholderTextColor="#999"
//           />
//         </View>
//       </View>
      
//       <View style={styles.inputGroup}>
//         <Text style={styles.label}>Diabetes Type</Text>
//         <View style={styles.pickerContainer}>
//           <Picker
//             selectedValue={profileData.diabetesType}
//             onValueChange={(value) => updateProfile('diabetesType', value)}
//             style={styles.picker}
//           >
//             <Picker.Item label="Type 1" value="Type 1" />
//             <Picker.Item label="Type 2" value="Type 2" />
//             <Picker.Item label="Gestational" value="Gestational" />
//             <Picker.Item label="Other" value="Other" />
//           </Picker>
//         </View>
//       </View>
      
//       <View style={styles.inputGroup}>
//         <Text style={styles.label}>Year Diagnosed</Text>
//         <View style={styles.inputContainer}>
//           <Icon name="calendar-outline" size={20} color={colors.text.secondary} style={styles.inputIcon} />
//           <TextInput
//             style={styles.input}
//             value={profileData.diagnosisYear}
//             onChangeText={(value) => updateProfile('diagnosisYear', value)}
//             keyboardType="numeric"
//             placeholder="Year of diagnosis"
//             placeholderTextColor="#999"
//             maxLength={4}
//           />
//         </View>
//       </View>
//     </View>
//   );

//   const renderStep2 = () => (
//     <View style={styles.formSection}>
//       <Text style={styles.stepTitle}>Step 2: Physical Information</Text>
      
//       <View style={styles.inputGroup}>
//         <Text style={styles.label}>Weight (kg)</Text>
//         <View style={styles.inputContainer}>
//           <Icon name="fitness-outline" size={20} color={colors.text.secondary} style={styles.inputIcon} />
//           <TextInput
//             style={styles.input}
//             value={profileData.weight}
//             onChangeText={(value) => updateProfile('weight', value)}
//             keyboardType="numeric"
//             placeholder="Enter your weight in kg"
//             placeholderTextColor="#999"
//           />
//         </View>
//       </View>
      
//       <View style={styles.inputGroup}>
//         <Text style={styles.label}>Height (cm)</Text>
//         <View style={styles.inputContainer}>
//           <Icon name="resize-outline" size={20} color={colors.text.secondary} style={styles.inputIcon} />
//           <TextInput
//             style={styles.input}
//             value={profileData.height}
//             onChangeText={(value) => updateProfile('height', value)}
//             keyboardType="numeric"
//             placeholder="Enter your height in cm"
//             placeholderTextColor="#999"
//           />
//         </View>
//       </View>
//     </View>
//   );

//   const renderStep3 = () => (
//     <View style={styles.formSection}>
//       <Text style={styles.stepTitle}>Step 3: Target Range</Text>
      
//       <Text style={styles.infoText}>
//         Set your target blood glucose range. This will help us provide better insights.
//       </Text>
      
//       <View style={styles.rangeContainer}>
//         <View style={styles.rangeInput}>
//           <Text style={styles.label}>Min (mg/dL)</Text>
//           <View style={styles.inputContainer}>
//             <Icon name="arrow-down-outline" size={20} color={colors.text.secondary} style={styles.inputIcon} />
//             <TextInput
//               style={styles.input}
//               value={profileData.targetRange.min}
//               onChangeText={(value) => updateProfile('targetRange.min', value)}
//               keyboardType="numeric"
//               placeholder="Minimum"
//               placeholderTextColor="#999"
//             />
//           </View>
//         </View>
        
//         <View style={styles.rangeInput}>
//           <Text style={styles.label}>Max (mg/dL)</Text>
//           <View style={styles.inputContainer}>
//             <Icon name="arrow-up-outline" size={20} color={colors.text.secondary} style={styles.inputIcon} />
//             <TextInput
//               style={styles.input}
//               value={profileData.targetRange.max}
//               onChangeText={(value) => updateProfile('targetRange.max', value)}
//               keyboardType="numeric"
//               placeholder="Maximum"
//               placeholderTextColor="#999"
//             />
//           </View>
//         </View>
//       </View>
      
//       <Text style={styles.hintText}>
//         Typical target range is 70-180 mg/dL but may vary based on individual needs. Consult your healthcare provider for personalized recommendations.
//       </Text>
//     </View>
//   );

//   return (
//     <View style={styles.container}>
//       <View style={styles.header}>
//         <Text style={styles.headerTitle}>Profile Setup</Text>
//       </View>
      
//       <ScrollView style={styles.content}>
//         <View style={styles.progressContainer}>
//           <View style={styles.progressBar}>
//             <View 
//               style={[
//                 styles.progressFill,
//                 { width: `${(step / 3) * 100}%` }
//               ]} 
//             />
//           </View>
//           <Text style={styles.progressText}>Step {step} of 3</Text>
//         </View>
        
//         {step === 1 && renderStep1()}
//         {step === 2 && renderStep2()}
//         {step === 3 && renderStep3()}
        
//         <TouchableOpacity
//           style={styles.continueButton}
//           onPress={handleContinue}
//           disabled={loading}
//         >
//           {loading ? (
//             <ActivityIndicator color="#fff" size="small" />
//           ) : (
//             <Text style={styles.continueButtonText}>
//               {step === 3 ? 'Complete Setup' : 'Continue'}
//             </Text>
//           )}
//         </TouchableOpacity>
        
//         {step > 1 && (
//           <TouchableOpacity
//             style={styles.backButton}
//             onPress={() => setStep(step - 1)}
//             disabled={loading}
//           >
//             <Text style={styles.backButtonText}>Back</Text>
//           </TouchableOpacity>
//         )}
//       </ScrollView>
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
//     alignItems: 'center',
//   },
//   headerTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#fff',
//   },
//   content: {
//     flex: 1,
//     padding: 16,
//   },
//   progressContainer: {
//     marginBottom: 20,
//   },
//   progressBar: {
//     height: 8,
//     backgroundColor: '#E0E0E0',
//     borderRadius: 4,
//     marginBottom: 8,
//     overflow: 'hidden',
//   },
//   progressFill: {
//     height: '100%',
//     backgroundColor: colors.primary,
//     borderRadius: 4,
//   },
//   progressText: {
//     fontSize: 12,
//     color: colors.text.secondary,
//     textAlign: 'right',
//   },
//   formSection: {
//     backgroundColor: '#fff',
//     borderRadius: 12,
//     padding: 20,
//     marginBottom: 20,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   stepTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: colors.text.primary,
//     marginBottom: 20,
//   },
//   inputGroup: {
//     marginBottom: 15,
//   },
//   label: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: colors.text.primary,
//     marginBottom: 8,
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
//   pickerContainer: {
//     borderWidth: 1,
//     borderColor: '#ddd',
//     borderRadius: 8,
//     marginBottom: 10,
//   },
//   picker: {
//     height: 50,
//   },
//   rangeContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//   },
//   rangeInput: {
//     width: '48%',
//   },
//   infoText: {
//     fontSize: 14,
//     color: colors.text.secondary,
//     marginBottom: 20,
//     lineHeight: 20,
//   },
//   hintText: {
//     fontSize: 12,
//     color: colors.text.secondary,
//     marginTop: 15,
//     fontStyle: 'italic',
//   },
//   continueButton: {
//     backgroundColor: colors.primary,
//     borderRadius: 8,
//     height: 50,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: 15,
//   },
//   continueButtonText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   backButton: {
//     backgroundColor: '#fff',
//     borderRadius: 8,
//     height: 50,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: 30,
//     borderWidth: 1,
//     borderColor: colors.primary,
//   },
//   backButtonText: {
//     color: colors.primary,
//     fontSize: 16,
//     fontWeight: '600',
//   },
// });

// export default ProfileSetupScreen;