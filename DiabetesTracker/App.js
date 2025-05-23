// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';

const App = () => {
  return (
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
  );
};

export default App;

// App.js
// import React from 'react';
// import { StatusBar } from 'react-native';
// import { NavigationContainer } from '@react-navigation/native';
// import AppNavigator from './src/navigation/AppNavigator';
// import { AuthProvider } from './src/contexts/AuthContext';
// import { colors } from './src/utils/theme';

// const App = () => {
//   return (
//     <AuthProvider>
//       <StatusBar backgroundColor={colors.primary} barStyle="light-content" />
//       <NavigationContainer>
//         <AppNavigator />
//       </NavigationContainer>
//     </AuthProvider>
//   );
// };

// export default App;