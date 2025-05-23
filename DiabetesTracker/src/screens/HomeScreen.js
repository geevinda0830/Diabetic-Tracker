// import React, { useState, useCallback } from 'react';
// import { 
//   View, 
//   Text, 
//   StyleSheet, 
//   ScrollView, 
//   StatusBar, 
//   TouchableOpacity,
//   RefreshControl,
//   ActivityIndicator
// } from 'react-native';
// import { useFocusEffect } from '@react-navigation/native';
// import Icon from 'react-native-vector-icons/Ionicons';
// import GlucoseChart from '../components/charts/GlucoseChart';
// import TileButton from '../components/common/TileButton';
// import { fetchGlucoseReadings } from '../services/api';
// import { colors } from '../utils/theme';

// const HomeScreen = ({ navigation ,route}) => {
//   const [glucoseData, setGlucoseData] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [lastUpdated, setLastUpdated] = useState(new Date());

//   // Load data when screen is focused
//   useEffect(() => {
//     if (route.params?.refresh) {
//       console.log('HomeScreen - Refresh triggered from params:', route.params.refresh);
//       loadData();
//     }
//   }, [route.params?.refresh]);
  
//   const loadData = async () => {
//     try {
//       setLoading(true);
//       const data = await fetchGlucoseReadings();
      
//       // Format the data for the app
//       const formattedData = data.map(reading => ({
//         value: reading.value,
//         timestamp: new Date(reading.timestamp),
//         notes: reading.notes,
//         id: reading._id
//       }));
      
//       setGlucoseData(formattedData);
//       setLastUpdated(new Date());
//     } catch (error) {
//       console.error('Error fetching glucose readings:', error);
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   };
  
//   const onRefresh = () => {
//     setRefreshing(true);
//     loadData();
//   };
  
//   const getStats = () => {
//     if (!glucoseData.length) return { avg: 0, min: 0, max: 0 };
    
//     const values = glucoseData.map(r => r.value);
//     return {
//       avg: Math.round(values.reduce((a, b) => a + b, 0) / values.length),
//       min: Math.min(...values),
//       max: Math.max(...values)
//     };
//   };
  
//   const stats = getStats();
  
//   // Get time since last update in user-friendly format
//   const getLastUpdatedText = () => {
//     const now = new Date();
//     const diffMs = now - lastUpdated;
//     const diffMins = Math.floor(diffMs / 60000);
    
//     if (diffMins < 1) return 'Just now';
//     if (diffMins === 1) return '1m ago';
//     if (diffMins < 60) return `${diffMins}m ago`;
    
//     const diffHours = Math.floor(diffMins / 60);
//     if (diffHours === 1) return '1h ago';
//     if (diffHours < 24) return `${diffHours}h ago`;
    
//     return 'Over a day ago';
//   };

//   const renderStatCard = (title, value, color, unit = 'mg/dL') => (
//     <View style={[styles.statCard, { borderLeftColor: color }]}>
//       <Text style={styles.statTitle}>{title}</Text>
//       <Text style={styles.statValue}>
//         {value}<Text style={styles.statUnit}> {unit}</Text>
//       </Text>
//     </View>
//   );

//   return (
//     <View style={styles.container}>
//       <StatusBar backgroundColor={colors.primary} barStyle="light-content" />
      
//       {/* Header */}
//       <View style={styles.header}>
//         <View style={styles.headerContent}>
//           <View style={styles.headerTop}>
//             <Text style={styles.headerTitle}>Diabetes Management</Text>
//             <TouchableOpacity 
//               onPress={() => navigation.navigate('Profile')}
//               style={styles.profileButton}
//             >
//               <View style={styles.profileCircle}>
//                 <Text style={styles.profileInitial}>J</Text>
//               </View>
//             </TouchableOpacity>
//           </View>
          
//           <View style={styles.glucoseContainer}>
//             <View>
//               <Text style={styles.currentGlucoseLabel}>Current Glucose</Text>
//               <View style={styles.valueRow}>
//                 <Text style={styles.currentGlucoseValue}>{stats.avg}</Text>
//                 <Text style={styles.currentGlucoseUnit}>mg/dL</Text>
//               </View>
//             </View>
//             <View style={styles.lastUpdate}>
//               <Text style={styles.lastUpdateText}>Updated {getLastUpdatedText()}</Text>
//             </View>
//           </View>
//         </View>
//       </View>
      
//       <ScrollView 
//         style={styles.scrollView}
//         refreshControl={
//           <RefreshControl
//             refreshing={refreshing}
//             onRefresh={onRefresh}
//             colors={[colors.primary]}
//           />
//         }
//       >
//         {loading && !refreshing ? (
//           <View style={styles.loadingContainer}>
//             <ActivityIndicator size="large" color={colors.primary} />
//             <Text style={styles.loadingText}>Loading data...</Text>
//           </View>
//         ) : (
//           <>
//             {/* Stats Cards */}
//             <View style={styles.statsRow}>
//               {renderStatCard('Average', stats.avg, colors.primary)}
//               {renderStatCard('Highest', stats.max, colors.danger)}
//             </View>
            
//             <View style={styles.statsRow}>
//               {renderStatCard('Lowest', stats.min, colors.warning)}
//               {renderStatCard('Readings', glucoseData.length, colors.success, 'today')}
//             </View>
            
//             {/* Glucose Chart */}
//             <View style={styles.chartCard}>
//               <Text style={styles.chartTitle}>Glucose Trend</Text>
//               {glucoseData.length > 0 ? (
//                 <GlucoseChart data={glucoseData} />
//               ) : (
//                 <View style={styles.noDataContainer}>
//                   <Icon name="analytics" size={40} color={colors.text.secondary} />
//                   <Text style={styles.noDataText}>No glucose data available</Text>
//                   <Text style={styles.noDataSubtext}>Add your first reading to see trends</Text>
//                 </View>
//               )}
//             </View>
//           </>
//         )}
        
//         {/* Action Buttons */}
//         <View style={styles.tileRow}>
//           <TileButton 
//             title="Add Reading" 
//             icon="add-circle-outline" 
//             onPress={() => navigation.navigate('DataEntry')} 
//             color={colors.primary}
//           />
//           <TileButton 
//             title="Predict Insulin" 
//             icon="fitness-outline" 
//             onPress={() => navigation.navigate('Insulin')} 
//             color={colors.secondary}
//           />
//         </View>
        
//         <View style={styles.tileRow}>
//           <TileButton 
//             title="Predict Glucose" 
//             icon="analytics-outline" 
//             onPress={() => navigation.navigate('Prediction')} 
//             color={colors.accent}
//           />
//           <TileButton 
//             title="Reports" 
//             icon="document-text-outline" 
//             onPress={() => navigation.navigate('Reports')} 
//             color={colors.info || '#64D2FF'}
//           />
//         </View>
        
//         <View style={styles.bottomSpacer} />
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
//   },
//   headerContent: {
//     paddingHorizontal: 20,
//   },
//   headerTop: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 20,
//   },
//   headerTitle: {
//     fontSize: 22,
//     fontWeight: 'bold',
//     color: 'white',
//   },
//   profileButton: {
//     width: 40,
//     height: 40,
//   },
//   profileCircle: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: 'rgba(255,255,255,0.3)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   profileInitial: {
//     color: 'white',
//     fontSize: 18,
//     fontWeight: 'bold',
//   },
//   glucoseContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'flex-end',
//   },
//   currentGlucoseLabel: {
//     fontSize: 14,
//     color: 'rgba(255,255,255,0.8)',
//   },
//   valueRow: {
//     flexDirection: 'row',
//     alignItems: 'baseline',
//   },
//   currentGlucoseValue: {
//     fontSize: 42,
//     fontWeight: 'bold',
//     color: 'white',
//   },
//   currentGlucoseUnit: {
//     fontSize: 16,
//     color: 'rgba(255,255,255,0.8)',
//     marginLeft: 5,
//   },
//   lastUpdate: {
//     backgroundColor: 'rgba(255,255,255,0.2)',
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 20,
//   },
//   lastUpdateText: {
//     color: 'white',
//     fontSize: 12,
//   },
//   scrollView: {
//     flex: 1,
//     padding: 15,
//   },
//   loadingContainer: {
//     alignItems: 'center',
//     justifyContent: 'center',
//     padding: 50,
//   },
//   loadingText: {
//     marginTop: 10,
//     color: colors.text.secondary,
//   },
//   statsRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 15,
//   },
//   statCard: {
//     backgroundColor: 'white',
//     width: '48%',
//     padding: 15,
//     borderRadius: 12,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 2,
//     borderLeftWidth: 4,
//   },
//   statTitle: {
//     fontSize: 14,
//     color: colors.text.secondary,
//     marginBottom: 8,
//   },
//   statValue: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: colors.text.primary,
//   },
//   statUnit: {
//     fontSize: 14,
//     color: colors.text.secondary,
//   },
//   chartCard: {
//     backgroundColor: 'white',
//     borderRadius: 12,
//     padding: 15,
//     marginBottom: 20,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   chartTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: colors.text.primary,
//     marginBottom: 10,
//   },
//   noDataContainer: {
//     alignItems: 'center',
//     justifyContent: 'center',
//     padding: 30,
//   },
//   noDataText: {
//     marginTop: 10,
//     fontSize: 16,
//     fontWeight: '500',
//     color: colors.text.secondary,
//   },
//   noDataSubtext: {
//     marginTop: 5,
//     fontSize: 14,
//     color: colors.text.secondary,
//     textAlign: 'center',
//   },
//   tileRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 10,
//   },
//   bottomSpacer: {
//     height: 20,
//   }
// });

// export default HomeScreen;

import React, { useState, useCallback, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  StatusBar, 
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import GlucoseChart from '../components/charts/GlucoseChart';
import TileButton from '../components/common/TileButton';
import { fetchGlucoseReadings } from '../services/api';
import { colors } from '../utils/theme';

const HomeScreen = ({ navigation, route }) => {
  const [glucoseData, setGlucoseData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // This effect handles refresh parameter from navigation
  useEffect(() => {
    if (route.params?.refresh) {
      console.log('HomeScreen - Refresh triggered from params:', route.params.refresh);
      loadData();
    }
  }, [route.params?.refresh]);
  
  // This effect reloads data every time the screen gains focus
  useFocusEffect(
    useCallback(() => {
      console.log('HomeScreen - Screen focused, loading data');
      loadData();
      
      return () => {
        // Optional cleanup when screen loses focus
        console.log('HomeScreen - Screen unfocused');
      };
    }, [])
  );
  
  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchGlucoseReadings();
      
      // Format the data for the app
      const formattedData = data.map(reading => ({
        value: reading.value,
        timestamp: new Date(reading.timestamp),
        notes: reading.notes,
        id: reading._id
      }));
      
      setGlucoseData(formattedData);
      setLastUpdated(new Date());
      console.log(`HomeScreen - Loaded ${formattedData.length} glucose readings`);
    } catch (error) {
      console.error('Error fetching glucose readings:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };
  
  const getStats = () => {
    if (!glucoseData.length) return { avg: 0, min: 0, max: 0 };
    
    const values = glucoseData.map(r => r.value);
    return {
      avg: Math.round(values.reduce((a, b) => a + b, 0) / values.length),
      min: Math.min(...values),
      max: Math.max(...values)
    };
  };
  
  const stats = getStats();
  
  // Get time since last update in user-friendly format
  const getLastUpdatedText = () => {
    const now = new Date();
    const diffMs = now - lastUpdated;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins === 1) return '1m ago';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return '1h ago';
    if (diffHours < 24) return `${diffHours}h ago`;
    
    return 'Over a day ago';
  };

  const renderStatCard = (title, value, color, unit = 'mg/dL') => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <Text style={styles.statTitle}>{title}</Text>
      <Text style={styles.statValue}>
        {value}<Text style={styles.statUnit}> {unit}</Text>
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={colors.primary} barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <Text style={styles.headerTitle}>Diabetes Management</Text>
            <TouchableOpacity 
              onPress={() => navigation.navigate('Profile')}
              style={styles.profileButton}
            >
              <View style={styles.profileCircle}>
                <Text style={styles.profileInitial}>J</Text>
              </View>
            </TouchableOpacity>
          </View>
          
          <View style={styles.glucoseContainer}>
            <View>
              <Text style={styles.currentGlucoseLabel}>Current Glucose</Text>
              <View style={styles.valueRow}>
                <Text style={styles.currentGlucoseValue}>{stats.avg}</Text>
                <Text style={styles.currentGlucoseUnit}>mg/dL</Text>
              </View>
            </View>
            <View style={styles.lastUpdate}>
              <Text style={styles.lastUpdateText}>Updated {getLastUpdatedText()}</Text>
            </View>
          </View>
        </View>
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
          />
        }
      >
        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading data...</Text>
          </View>
        ) : (
          <>
            {/* Stats Cards */}
            <View style={styles.statsRow}>
              {renderStatCard('Average', stats.avg, colors.primary)}
              {renderStatCard('Highest', stats.max, colors.danger)}
            </View>
            
            <View style={styles.statsRow}>
              {renderStatCard('Lowest', stats.min, colors.warning)}
              {renderStatCard('Readings', glucoseData.length, colors.success, 'today')}
            </View>
            
            {/* Glucose Chart */}
            <View style={styles.chartCard}>
              <Text style={styles.chartTitle}>Glucose Trend</Text>
              {glucoseData.length > 0 ? (
                <GlucoseChart data={glucoseData} />
              ) : (
                <View style={styles.noDataContainer}>
                  <Icon name="analytics" size={40} color={colors.text.secondary} />
                  <Text style={styles.noDataText}>No glucose data available</Text>
                  <Text style={styles.noDataSubtext}>Add your first reading to see trends</Text>
                </View>
              )}
            </View>
          </>
        )}
        
        {/* Action Buttons */}
        <View style={styles.tileRow}>
          <TileButton 
            title="Add Reading" 
            icon="add-circle-outline" 
            onPress={() => navigation.navigate('DataEntry')} 
            color={colors.primary}
          />
          <TileButton 
            title="Predict Insulin" 
            icon="fitness-outline" 
            onPress={() => navigation.navigate('Insulin')} 
            color={colors.secondary}
          />
        </View>
        
        <View style={styles.tileRow}>
          <TileButton 
            title="Predict Glucose" 
            icon="analytics-outline" 
            onPress={() => navigation.navigate('Prediction')} 
            color={colors.accent}
          />
          <TileButton 
            title="Reports" 
            icon="document-text-outline" 
            onPress={() => navigation.navigate('Reports')} 
            color={colors.info || '#64D2FF'}
          />
        </View>
        
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
};

// Styles remain the same...
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  headerContent: {
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
  },
  profileButton: {
    width: 40,
    height: 40,
  },
  profileCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitial: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  glucoseContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  currentGlucoseLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  currentGlucoseValue: {
    fontSize: 42,
    fontWeight: 'bold',
    color: 'white',
  },
  currentGlucoseUnit: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginLeft: 5,
  },
  lastUpdate: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  lastUpdateText: {
    color: 'white',
    fontSize: 12,
  },
  scrollView: {
    flex: 1,
    padding: 15,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 50,
  },
  loadingText: {
    marginTop: 10,
    color: colors.text.secondary,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  statCard: {
    backgroundColor: 'white',
    width: '48%',
    padding: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderLeftWidth: 4,
  },
  statTitle: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  statUnit: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  chartCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 10,
  },
  noDataContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  noDataText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: '500',
    color: colors.text.secondary,
  },
  noDataSubtext: {
    marginTop: 5,
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  tileRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  bottomSpacer: {
    height: 20,
  }
});

export default HomeScreen;