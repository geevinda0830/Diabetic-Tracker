
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { saveGlucoseReading } from '../services/api';
import { colors } from '../utils/theme';

const DataEntryScreen = ({ navigation }) => {
  const [glucoseValue, setGlucoseValue] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mealState, setMealState] = useState('fasting'); // fasting, before, after

  // Update this function in src/screens/DataEntryScreen.js

// In DataEntryScreen.js
// Modify the handleSubmit function:

// const handleSubmit = async () => {
//   if (!glucoseValue) {
//     Alert.alert('Error', 'Please enter a glucose value');
//     return;
//   }

//   setIsSubmitting(true);
//   try {
//     const reading = {
//       value: parseFloat(glucoseValue),
//       timestamp: new Date().toISOString(),
//       notes: notes || '',
//       mealState: mealState
//     };
    
//     const result = await saveGlucoseReading(reading);
    
//     if (result) {
//       Alert.alert(
//         'Success', 
//         'Reading saved successfully',
//         [
//           { 
//             text: 'OK', 
//             onPress: () => {
//               // Navigate back to HomeScreen with a refresh param
//               navigation.navigate('Home', { refresh: new Date().getTime() });
//             }
//           }
//         ]
//       );
//     } else {
//       Alert.alert('Error', 'Failed to save reading');
//     }
//   } catch (error) {
//     console.error('Error saving reading:', error);
//     Alert.alert('Error', `An error occurred: ${error.message || 'Unknown error'}`);
//   } finally {
//     setIsSubmitting(false);
//   }
// };
// In DataEntryScreen.js
// Modify the handleSubmit function:

const handleSubmit = async () => {
  if (!glucoseValue) {
    Alert.alert('Error', 'Please enter a glucose value');
    return;
  }

  setIsSubmitting(true);
  try {
    const reading = {
      value: parseFloat(glucoseValue),
      timestamp: new Date().toISOString(),
      notes: notes || '',
      mealState: mealState
    };
    
    console.log('Saving glucose reading:', reading);
    const result = await saveGlucoseReading(reading);
    
    if (result) {
      Alert.alert(
        'Success', 
        'Reading saved successfully',
        [
          { 
            text: 'OK', 
            onPress: () => {
              // Navigate back to HomeScreen with a refresh param
              navigation.navigate('Home', { refresh: new Date().getTime() });
            }
          }
        ]
      );
    } else {
      Alert.alert('Error', 'Failed to save reading');
    }
  } catch (error) {
    console.error('Error saving reading:', error);
    Alert.alert('Error', `An error occurred: ${error.message || 'Unknown error'}`);
  } finally {
    setIsSubmitting(false);
  }
};
  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Blood Glucose</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.card}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Glucose Reading (mg/dL)</Text>
            <View style={styles.valueContainer}>
              <TextInput
                style={styles.valueInput}
                value={glucoseValue}
                onChangeText={setGlucoseValue}
                keyboardType="numeric"
                placeholder="Enter value"
                placeholderTextColor="#999"
              />
              <Text style={styles.unit}>mg/dL</Text>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Time</Text>
            <View style={styles.timeDisplay}>
              <Icon name="time-outline" size={18} color={colors.text.secondary} />
              <Text style={styles.timeText}>{new Date().toLocaleTimeString()}</Text>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Meal State</Text>
            <View style={styles.mealStateContainer}>
              <TouchableOpacity
                style={[
                  styles.mealStateOption,
                  mealState === 'fasting' && styles.mealStateOptionActive
                ]}
                onPress={() => setMealState('fasting')}
              >
                <Text style={[
                  styles.mealStateText,
                  mealState === 'fasting' && styles.mealStateTextActive
                ]}>Fasting</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.mealStateOption,
                  mealState === 'before' && styles.mealStateOptionActive
                ]}
                onPress={() => setMealState('before')}
              >
                <Text style={[
                  styles.mealStateText,
                  mealState === 'before' && styles.mealStateTextActive
                ]}>Before Meal</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.mealStateOption,
                  mealState === 'after' && styles.mealStateOptionActive
                ]}
                onPress={() => setMealState('after')}
              >
                <Text style={[
                  styles.mealStateText,
                  mealState === 'after' && styles.mealStateTextActive
                ]}>After Meal</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Notes</Text>
            <TextInput
              style={styles.notesInput}
              value={notes}
              onChangeText={setNotes}
              placeholder="Add notes (optional)"
              placeholderTextColor="#999"
              multiline
            />
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[
            styles.submitButton, 
            !glucoseValue ? styles.submitButtonDisabled : {}
          ]}
          onPress={handleSubmit}
          disabled={!glucoseValue || isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.submitText}>Save Reading</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: colors.text.primary,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  valueInput: {
    flex: 1,
    height: 50,
    fontSize: 18,
    color: colors.text.primary,
  },
  unit: {
    fontSize: 16,
    color: colors.text.secondary,
  },
  timeDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  timeText: {
    marginLeft: 8,
    fontSize: 16,
    color: colors.text.primary,
  },
  mealStateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  mealStateOption: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    marginHorizontal: 4,
    borderRadius: 8,
  },
  mealStateOptionActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  mealStateText: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  mealStateTextActive: {
    color: '#fff',
    fontWeight: '500',
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    height: 100,
    fontSize: 16,
    textAlignVertical: 'top',
    color: colors.text.primary,
  },
  footer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  submitButton: {
    backgroundColor: colors.primary,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  }
});

export default DataEntryScreen;