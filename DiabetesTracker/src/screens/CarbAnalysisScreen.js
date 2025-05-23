// src/screens/CarbAnalysisScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import CarbAnalysisChart from '../components/charts/CarbAnalysisChart';
import { getCarbGlucoseAnalysis, getDailyCarbIntake, getGlucoseByMealState } from '../services/api';
import { colors } from '../utils/theme';

const CarbAnalysisScreen = ({ navigation }) => {
  const [analysisData, setAnalysisData] = useState(null);
  const [mealStateData, setMealStateData] = useState(null);
  const [carbIntakeData, setCarbIntakeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeFrame, setTimeFrame] = useState('week'); // 'week', 'month', 'quarter'
  const [chartType, setChartType] = useState('line'); // 'line', 'bar'

  // Load data when screen is focused
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [timeFrame])
  );

  const getDaysForTimeFrame = () => {
    switch (timeFrame) {
      case 'week': return 7;
      case 'month': return 30;
      case 'quarter': return 90;
      default: return 7;
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const days = getDaysForTimeFrame();
      
      // Fetch all data in parallel
      const [analysisResponse, mealStateResponse, carbIntakeResponse] = await Promise.all([
        getCarbGlucoseAnalysis(days),
        getGlucoseByMealState(days),
        getDailyCarbIntake(days)
      ]);
      
      setAnalysisData(analysisResponse);
      setMealStateData(mealStateResponse);
      setCarbIntakeData(carbIntakeResponse);
    } catch (error) {
      console.error('Error loading analysis data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const renderTimeFrameSelection = () => (
    <View style={styles.timeFrameContainer}>
      <TouchableOpacity
        style={[styles.timeFrameOption, timeFrame === 'week' && styles.activeTimeFrame]}
        onPress={() => setTimeFrame('week')}
      >
        <Text style={[
          styles.timeFrameText,
          timeFrame === 'week' && styles.activeTimeFrameText
        ]}>Week</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.timeFrameOption, timeFrame === 'month' && styles.activeTimeFrame]}
        onPress={() => setTimeFrame('month')}
      >
        <Text style={[
          styles.timeFrameText,
          timeFrame === 'month' && styles.activeTimeFrameText
        ]}>Month</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.timeFrameOption, timeFrame === 'quarter' && styles.activeTimeFrame]}
        onPress={() => setTimeFrame('quarter')}
      >
        <Text style={[
          styles.timeFrameText,
          timeFrame === 'quarter' && styles.activeTimeFrameText
        ]}>3 Months</Text>
      </TouchableOpacity>
    </View>
  );

  const renderChartTypeSelection = () => (
    <View style={styles.chartTypeContainer}>
      <TouchableOpacity
        style={[styles.chartTypeOption, chartType === 'line' && styles.activeChartType]}
        onPress={() => setChartType('line')}
      >
        <Icon 
          name="analytics-outline" 
          size={20} 
          color={chartType === 'line' ? colors.primary : colors.text.secondary} 
        />
        <Text style={[
          styles.chartTypeText,
          chartType === 'line' && styles.activeChartTypeText
        ]}>Line</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.chartTypeOption, chartType === 'bar' && styles.activeChartType]}
        onPress={() => setChartType('bar')}
      >
        <Icon 
          name="bar-chart-outline" 
          size={20} 
          color={chartType === 'bar' ? colors.primary : colors.text.secondary} 
        />
        <Text style={[
          styles.chartTypeText,
          chartType === 'bar' && styles.activeChartTypeText
        ]}>Bar</Text>
      </TouchableOpacity>
    </View>
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
        <Text style={styles.headerTitle}>Carb Analysis</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Main Content */}
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
        {renderTimeFrameSelection()}
        {renderChartTypeSelection()}

        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading data...</Text>
          </View>
        ) : (
          <>
            {/* Glucose-Carb Correlation */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Glucose & Carb Correlation</Text>
              {analysisData && (
                <CarbAnalysisChart 
                  glucoseData={analysisData.glucoseReadings} 
                  mealData={analysisData.meals}
                  chartType={chartType}
                />
              )}
              <Text style={styles.sectionDescription}>
                This chart shows the relationship between your carb intake and glucose levels over time.
              </Text>
            </View>

            {/* Carb Intake Summary */}
            {carbIntakeData && (
              <View style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>Carb Intake Summary</Text>
                <View style={styles.statsGrid}>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>
                      {Math.round(carbIntakeData.analysisMetadata.averageDailyCarbs)}g
                    </Text>
                    <Text style={styles.statLabel}>Avg. Daily Carbs</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>
                      {carbIntakeData.dailyCarbs.length > 0
                        ? Math.max(...carbIntakeData.dailyCarbs.map(d => d.carbs)).toFixed(0)
                        : 0}g
                    </Text>
                    <Text style={styles.statLabel}>Max Daily Carbs</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>
                      {carbIntakeData.dailyCarbs.length > 0
                        ? Math.min(...carbIntakeData.dailyCarbs.filter(d => d.carbs > 0).map(d => d.carbs)).toFixed(0)
                        : 0}g
                    </Text>
                    <Text style={styles.statLabel}>Min Daily Carbs</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>
                      {carbIntakeData.analysisMetadata.totalMeals}
                    </Text>
                    <Text style={styles.statLabel}>Total Meals</Text>
                  </View>
                </View>
              </View>
            )}

            {/* Glucose by Meal State */}
            {mealStateData && (
              <View style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>Glucose by Meal State</Text>
                <View style={styles.mealStateStats}>
                  <View style={[styles.mealStateItem, { backgroundColor: '#F5F5DC' }]}>
                    <Text style={styles.mealStateValue}>
                      {mealStateData.averages.fasting.toFixed(0)}
                    </Text>
                    <Text style={styles.mealStateLabel}>Fasting</Text>
                    <Text style={styles.mealStateCount}>
                      {mealStateData.counts.fasting} readings
                    </Text>
                  </View>
                  <View style={[styles.mealStateItem, { backgroundColor: '#E6F2FF' }]}>
                    <Text style={styles.mealStateValue}>
                      {mealStateData.averages.before.toFixed(0)}
                    </Text>
                    <Text style={styles.mealStateLabel}>Before Meals</Text>
                    <Text style={styles.mealStateCount}>
                      {mealStateData.counts.before} readings
                    </Text>
                  </View>
                  <View style={[styles.mealStateItem, { backgroundColor: '#FFE6E6' }]}>
                    <Text style={styles.mealStateValue}>
                      {mealStateData.averages.after.toFixed(0)}
                      {mealStateData.averages.after.toFixed(0)}
                    </Text>
                    <Text style={styles.mealStateLabel}>After Meals</Text>
                    <Text style={styles.mealStateCount}>
                      {mealStateData.counts.after} readings
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primary,
    padding: 16,
    paddingTop: 48,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 32,
  },
  scrollView: {
    padding: 16,
  },
  timeFrameContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  timeFrameOption: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  activeTimeFrame: {
    backgroundColor: colors.primary,
  },
  timeFrameText: {
    color: colors.text.secondary,
    fontWeight: '600',
  },
  activeTimeFrameText: {
    color: '#fff',
  },
  chartTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  chartTypeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  activeChartType: {
    backgroundColor: colors.primary,
  },
  chartTypeText: {
    marginLeft: 6,
    color: colors.text.secondary,
  },
  activeChartTypeText: {
    color: '#fff',
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
  },
  loadingText: {
    marginTop: 12,
    color: colors.text.secondary,
  },
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: colors.text.primary,
  },
  sectionDescription: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  statItem: {
    width: '48%',
    marginBottom: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  mealStateStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  mealStateItem: {
    flex: 1,
    marginHorizontal: 4,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  mealStateValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  mealStateLabel: {
    fontSize: 12,
    marginTop: 4,
    color: colors.text.primary,
  },
  mealStateCount: {
    fontSize: 10,
    color: colors.text.secondary,
    marginTop: 2,
  },
});

export default CarbAnalysisScreen;
