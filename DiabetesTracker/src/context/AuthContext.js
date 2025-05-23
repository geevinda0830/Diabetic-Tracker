// // src/contexts/AuthContext.js
// import React, { createContext, useState, useEffect, useContext } from 'react';
// import { auth } from '../config/firebase';
// import { onAuthStateChanged } from 'firebase/auth';
// import { getUserProfile, isProfileComplete } from '../services/authService';

// const AuthContext = createContext();

// export const useAuth = () => {
//   return useContext(AuthContext);
// };

// export const AuthProvider = ({ children }) => {
//   const [currentUser, setCurrentUser] = useState(null);
//   const [userProfile, setUserProfile] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, async (user) => {
//       setCurrentUser(user);
      
//       if (user) {
//         try {
//           // Check if profile is complete
//           const profileComplete = await isProfileComplete(user.uid);
          
//           // Get user profile data
//           const profileResponse = await getUserProfile(user.uid);
//           if (profileResponse.success) {
//             setUserProfile({
//               ...profileResponse.data,
//               profileComplete
//             });
//           }
//         } catch (error) {
//           console.error('Error fetching user profile:', error);
//         }
//       } else {
//         setUserProfile(null);
//       }
      
//       setLoading(false);
//     });

//     return unsubscribe;
//   }, []);

//   // Update local user profile state when profile is updated
//   const updateLocalProfile = (profileData) => {
//     setUserProfile(prevProfile => ({
//       ...prevProfile,
//       ...profileData,
//       profileComplete: true
//     }));
//   };

//   const value = {
//     currentUser,
//     userProfile,
//     updateLocalProfile,
//     isAuthenticated: !!currentUser,
//     isProfileComplete: userProfile?.profileComplete
//   };

//   return (
//     <AuthContext.Provider value={value}>
//       {!loading && children}
//     </AuthContext.Provider>
//   );
// };