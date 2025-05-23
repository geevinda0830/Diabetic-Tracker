// // src/screens/auth/LoginScreen.js
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
// import { loginUser, resetPassword } from '../../services/authService';
// import { colors } from '../../utils/theme';

// const LoginScreen = ({ navigation }) => {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [resetEmailSent, setResetEmailSent] = useState(false);

//   const handleLogin = async () => {
//     if (!email || !password) {
//       Alert.alert('Error', 'Please enter both email and password');
//       return;
//     }

//     setLoading(true);
//     try {
//       const result = await loginUser(email, password);
//       if (result.success) {
//         // Login successful - navigation will be handled by the auth listener
//       } else {
//         Alert.alert('Login Failed', result.error);
//       }
//     } catch (error) {
//       Alert.alert('Error', error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleForgotPassword = async () => {
//     if (!email) {
//       Alert.alert('Error', 'Please enter your email address');
//       return;
//     }

//     setLoading(true);
//     try {
//       const result = await resetPassword(email);
//       if (result.success) {
//         setResetEmailSent(true);
//         Alert.alert('Password Reset', 'Check your email for password reset instructions');
//       } else {
//         Alert.alert('Error', result.error);
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
//           <Text style={styles.title}>Login</Text>

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

//           <TouchableOpacity
//             style={styles.forgotPassword}
//             onPress={handleForgotPassword}
//           >
//             <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={styles.loginButton}
//             onPress={handleLogin}
//             disabled={loading}
//           >
//             {loading ? (
//               <ActivityIndicator color="#fff" size="small" />
//             ) : (
//               <Text style={styles.loginButtonText}>Login</Text>
//             )}
//           </TouchableOpacity>

//           {resetEmailSent && (
//             <Text style={styles.resetSentText}>
//               Password reset email has been sent!
//             </Text>
//           )}

//           <View style={styles.signupContainer}>
//             <Text style={styles.signupText}>Don't have an account? </Text>
//             <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
//               <Text style={styles.signupLink}>Sign Up</Text>
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
//   forgotPassword: {
//     alignSelf: 'flex-end',
//     marginBottom: 20,
//   },
//   forgotPasswordText: {
//     color: colors.primary,
//     fontWeight: '600',
//   },
//   loginButton: {
//     backgroundColor: colors.primary,
//     borderRadius: 8,
//     height: 50,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: 15,
//   },
//   loginButtonText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   resetSentText: {
//     color: colors.success,
//     textAlign: 'center',
//     marginBottom: 15,
//   },
//   signupContainer: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     marginTop: 10,
//   },
//   signupText: {
//     color: colors.text.secondary,
//   },
//   signupLink: {
//     color: colors.primary,
//     fontWeight: '600',
//   },
// });

// export default LoginScreen;