// // src/screens/auth/SignupScreen.js
// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TextInput,
//   TouchableOpacity,
//   Image,
//   KeyboardAvoidingView,
//   Platform,
//   ScrollView,
//   Alert,
//   ActivityIndicator
// } from 'react-native';
// import Icon from 'react-native-vector-icons/Ionicons';
// import { registerUser } from '../../services/authService';
// import { colors } from '../../utils/theme';

// const SignupScreen = ({ navigation }) => {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [confirmPassword, setConfirmPassword] = useState('');
//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);
//   const [loading, setLoading] = useState(false);

//   const validateEmail = (email) => {
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     return emailRegex.test(email);
//   };

//   const validatePassword = (password) => {
//     // At least 8 characters, with at least one uppercase letter, one lowercase letter, and one number
//     const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
//     return passwordRegex.test(password);
//   };

//   const handleSignup = async () => {
//     // Validate inputs
//     if (!email || !password || !confirmPassword) {
//       Alert.alert('Error', 'Please fill in all fields');
//       return;
//     }

//     if (!validateEmail(email)) {
//       Alert.alert('Error', 'Please enter a valid email address');
//       return;
//     }

//     if (!validatePassword(password)) {
//       Alert.alert(
//         'Error',
//         'Password must be at least 8 characters and include uppercase, lowercase, and numbers'
//       );
//       return;
//     }

//     if (password !== confirmPassword) {
//       Alert.alert('Error', 'Passwords do not match');
//       return;
//     }

//     setLoading(true);
//     try {
//       const result = await registerUser(email, password);
//       if (result.success) {
//         // Signup successful - navigation will be handled by auth listener
//       } else {
//         Alert.alert('Signup Failed', result.error);
//       }
//     } catch (error) {
//       Alert.alert('Error', error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <KeyboardAvoidingView
//       behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//       style={styles.container}
//     >
//       <ScrollView
//         contentContainerStyle={styles.scrollContent}
//         keyboardShouldPersistTaps="handled"
//       >
//         <View style={styles.logoContainer}>
//           <Image
//             source={require('../../assets/logo.png')}
//             style={styles.logo}
//             resizeMode="contain"
//           />
//           <Text style={styles.appName}>DiabetesManager</Text>
//           <Text style={styles.tagline}>Manage your diabetes with ease</Text>
//         </View>

//         <View style={styles.formContainer}>
//           <Text style={styles.title}>Create Account</Text>

//           <View style={styles.inputContainer}>
//             <Icon name="mail-outline" size={20} color={colors.text.secondary} style={styles.inputIcon} />
//             <TextInput
//               style={styles.input}
//               placeholder="Email"
//               value={email}
//               onChangeText={setEmail}
//               keyboardType="email-address"
//               autoCapitalize="none"
//               placeholderTextColor="#999"
//             />
//           </View>

//           <View style={styles.inputContainer}>
//             <Icon name="lock-closed-outline" size={20} color={colors.text.secondary} style={styles.inputIcon} />
//             <TextInput
//               style={styles.input}
//               placeholder="Password"
//               value={password}
//               onChangeText={setPassword}
//               secureTextEntry={!showPassword}
//               placeholderTextColor="#999"
//             />
//             <TouchableOpacity
//               style={styles.passwordToggle}
//               onPress={() => setShowPassword(!showPassword)}
//             >
//               <Icon
//                 name={showPassword ? 'eye-off-outline' : 'eye-outline'}
//                 size={20}
//                 color={colors.text.secondary}
//               />
//             </TouchableOpacity>
//           </View>

//           <View style={styles.inputContainer}>
//             <Icon name="lock-closed-outline" size={20} color={colors.text.secondary} style={styles.inputIcon} />
//             <TextInput
//               style={styles.input}
//               placeholder="Confirm Password"
//               value={confirmPassword}
//               onChangeText={setConfirmPassword}
//               secureTextEntry={!showConfirmPassword}
//               placeholderTextColor="#999"
//             />
//             <TouchableOpacity
//               style={styles.passwordToggle}
//               onPress={() => setShowConfirmPassword(!showConfirmPassword)}
//             >
//               <Icon
//                 name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
//                 size={20}
//                 color={colors.text.secondary}
//               />
//             </TouchableOpacity>
//           </View>

//           <Text style={styles.passwordHint}>
//             Password must be at least 8 characters and include uppercase, lowercase, and numbers
//           </Text>

//           <TouchableOpacity
//             style={styles.signupButton}
//             onPress={handleSignup}
//             disabled={loading}
//           >
//             {loading ? (
//               <ActivityIndicator color="#fff" size="small" />
//             ) : (
//               <Text style={styles.signupButtonText}>Sign Up</Text>
//             )}
//           </TouchableOpacity>

//           <View style={styles.loginContainer}>
//             <Text style={styles.loginText}>Already have an account? </Text>
//             <TouchableOpacity onPress={() => navigation.navigate('Login')}>
//               <Text style={styles.loginLink}>Login</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </ScrollView>
//     </KeyboardAvoidingView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: colors.background,
//   },
//   scrollContent: {
//     flexGrow: 1,
//     padding: 20,
//     justifyContent: 'center',
//   },
//   logoContainer: {
//     alignItems: 'center',
//     marginBottom: 40,
//   },
//   logo: {
//     width: 100,
//     height: 100,
//     marginBottom: 10,
//   },
//   appName: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: colors.primary,
//     marginBottom: 5,
//   },
//   tagline: {
//     fontSize: 14,
//     color: colors.text.secondary,
//   },
//   formContainer: {
//     backgroundColor: '#fff',
//     borderRadius: 12,
//     padding: 20,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   title: {
//     fontSize: 22,
//     fontWeight: 'bold',
//     color: colors.text.primary,
//     marginBottom: 20,
//     textAlign: 'center',
//   },
//   inputContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: '#ddd',
//     borderRadius: 8,
//     paddingHorizontal: 12,
//     marginBottom: 15,
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
//   passwordToggle: {
//     padding: 8,
//   },
//   passwordHint: {
//     fontSize: 12,
//     color: colors.text.secondary,
//     marginBottom: 20,
//   },
//   signupButton: {
//     backgroundColor: colors.primary,
//     borderRadius: 8,
//     height: 50,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: 15,
//   },
//   signupButtonText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   loginContainer: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     marginTop: 10,
//   },
//   loginText: {
//     color: colors.text.secondary,
//   },
//   loginLink: {
//     color: colors.primary,
//     fontWeight: '600',
//   },
// });

// export default SignupScreen;