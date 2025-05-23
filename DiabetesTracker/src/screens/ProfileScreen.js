// src/screens/ProfileScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Switch,
  TextInput,
  Alert
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../utils/theme';

const ProfileScreen = ({ navigation }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    weight: '70',
    height: '175',
    diabetesType: 'Type 1',
    diagnosisYear: '2018',
    targetRange: { min: 70, max: 180 },
    notifications: true
  });

  const handleSave = () => {
    // Here you would save the data to your backend
    Alert.alert('Success', 'Profile updated successfully');
    setIsEditing(false);
  };

  const renderField = (label, value, key, keyboardType = 'default') => {
    return (
      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>{label}</Text>
        {isEditing ? (
          <TextInput
            style={styles.input}
            value={value}
            onChangeText={(text) => setUserData({...userData, [key]: text})}
            keyboardType={keyboardType}
          />
        ) : (
          <Text style={styles.fieldValue}>{value}</Text>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Profile</Text>
        <TouchableOpacity onPress={() => isEditing ? handleSave() : setIsEditing(true)}>
          <Text style={styles.editButton}>{isEditing ? 'Save' : 'Edit'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Image 
              source={{ uri: 'https://randomuser.me/api/portraits/men/32.jpg' }} 
              style={styles.avatar} 
            />
            {isEditing && (
              <TouchableOpacity style={styles.changePhotoButton}>
                <Icon name="camera" size={16} color="#fff" />
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.profileName}>{userData.name}</Text>
          <View style={styles.diabetesTypeTag}>
            <Text style={styles.diabetesTypeText}>{userData.diabetesType}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <View style={styles.card}>
            {renderField('Name', userData.name, 'name')}
            {renderField('Email', userData.email, 'email', 'email-address')}
            {renderField('Weight (kg)', userData.weight, 'weight', 'numeric')}
            {renderField('Height (cm)', userData.height, 'height', 'numeric')}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Diabetes Information</Text>
          <View style={styles.card}>
            {renderField('Diabetes Type', userData.diabetesType, 'diabetesType')}
            {renderField('Year Diagnosed', userData.diagnosisYear, 'diagnosisYear', 'numeric')}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Target Range</Text>
              <View style={styles.rangeContainer}>
                <TextInput
                  style={[styles.rangeInput, !isEditing && styles.readOnly]}
                  value={userData.targetRange.min.toString()}
                  onChangeText={(text) => setUserData({
                    ...userData, 
                    targetRange: {...userData.targetRange, min: parseInt(text) || 0}
                  })}
                  keyboardType="numeric"
                  editable={isEditing}
                />
                <Text style={styles.rangeSeparator}>-</Text>
                <TextInput
                  style={[styles.rangeInput, !isEditing && styles.readOnly]}
                  value={userData.targetRange.max.toString()}
                  onChangeText={(text) => setUserData({
                    ...userData, 
                    targetRange: {...userData.targetRange, max: parseInt(text) || 0}
                  })}
                  keyboardType="numeric"
                  editable={isEditing}
                />
                <Text style={styles.rangeUnit}>mg/dL</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <View style={styles.card}>
            <View style={styles.settingContainer}>
              <Text style={styles.settingLabel}>Push Notifications</Text>
              <Switch
                value={userData.notifications}
                onValueChange={(value) => setUserData({...userData, notifications: value})}
                disabled={!isEditing}
                trackColor={{ false: '#ddd', true: colors.primaryLight }}
                thumbColor={userData.notifications ? colors.primary : '#f4f3f4'}
              />
            </View>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.logoutButton}>
            <Icon name="log-out-outline" size={20} color={colors.danger} />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  editButton: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  profileHeader: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 10,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#fff',
  },
  changePhotoButton: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: colors.primary,
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  diabetesTypeTag: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 5,
  },
  diabetesTypeText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.secondary,
    marginBottom: 10,
    marginLeft: 5,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  fieldContainer: {
    marginBottom: 15,
  },
  fieldLabel: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 5,
  },
  fieldValue: {
    fontSize: 16,
    color: colors.text.primary,
  },
  input: {
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    color: colors.text.primary,
  },
  rangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rangeInput: {
    width: 60,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    textAlign: 'center',
    color: colors.text.primary,
  },
  readOnly: {
    borderWidth: 0,
    padding: 0,
  },
  rangeSeparator: {
    marginHorizontal: 10,
    fontSize: 16,
    color: colors.text.secondary,
  },
  rangeUnit: {
    marginLeft: 10,
    fontSize: 16,
    color: colors.text.secondary,
  },
  settingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: 16,
    color: colors.text.primary,
  },
  buttonContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: 8,
  },
  logoutText: {
    color: colors.danger,
    marginLeft: 8,
    fontWeight: '600',
  }
});

export default ProfileScreen;