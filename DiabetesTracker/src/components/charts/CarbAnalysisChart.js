// src/components/charts/CarbAnalysisChart.js
import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { colors } from '../../utils/theme';

const { width } = Dimensions.get('window');

const CarbAnalysisChart = ({ glucoseData, mealData, chartType = 'line' }) => {
  // If no data, show placeholder
  if (!glucoseData?.length || !mealData?.length) {
    return (
      <View style={styles.noDataContainer}>
        <Text style={styles.noDataText}>Not enough data for analysis</Text>
        <Text style={styles.noDataSubtext}>Add more readings and meals</Text>
      </View>
    );
  }

  // Process data for analysis
  const processData = () => {
    // Group glucose readings by day
    const dailyGlucose = {};
    glucoseData.forEach(reading => {
      const date = new Date(reading.timestamp).toISOString().split('T')[0];
      if (!dailyGlucose[date]) {
        dailyGlucose[date] = [];
      }
      dailyGlucose[date].push(reading.value);
    });

    // Calculate average glucose by day
    const averageGlucose = {};
    Object.keys(dailyGlucose).forEach(date => {
      const values = dailyGlucose[date];
      averageGlucose[date] = values.reduce((sum, val) => sum + val, 0) / values.length;
    });

    // Group carb intake by day
    const dailyCarbs = {};
    mealData.forEach(meal => {
      const date = new Date(meal.timestamp).toISOString().split('T')[0];
      if (!dailyCarbs[date]) {
        dailyCarbs[date] = 0;
      }
      dailyCarbs[date] += meal.totalCarbs;
    });

    // Align dates for both datasets and create chart data
    const allDates = [...new Set([...Object.keys(averageGlucose), ...Object.keys(dailyCarbs)])].sort();
    
    // Take the most recent 7 days for the chart
    const recentDates = allDates.slice(-7);
    
    const labels = recentDates.map(date => {
      const d = new Date(date);
      return `${d.getMonth()+1}/${d.getDate()}`;
    });

    const glucoseValues = recentDates.map(date => averageGlucose[date] || 0);
    const carbValues = recentDates.map(date => dailyCarbs[date] || 0);

    return {
      labels,
      glucoseValues,
      carbValues
    };
  };

  const { labels, glucoseValues, carbValues } = processData();

  const renderLineChart = () => (
    <LineChart
      data={{
        labels,
        datasets: [
          {
            data: glucoseValues,
            color: (opacity = 1) => `rgba(0, 102, 255, ${opacity})`,
            strokeWidth: 2
          },
          {
            data: carbValues.map(v => v / 2), // Scale carbs to fit on same scale
            color: (opacity = 1) => `rgba(255, 102, 0, ${opacity})`,
            strokeWidth: 2
          }
        ],
        legend: ['Glucose (mg/dL)', 'Carbs (g)']
      }}
      width={width - 40}
      height={220}
      chartConfig={{
        backgroundColor: '#fff',
        backgroundGradientFrom: '#fff',
        backgroundGradientTo: '#fff',
        decimalPlaces: 0,
        color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        style: {
          borderRadius: 16
        },
        propsForDots: {
          r: '4',
          strokeWidth: '2'
        }
      }}
      bezier
      style={{
        marginVertical: 8,
        borderRadius: 16
      }}
    />
  );

  const renderBarChart = () => (
    <BarChart
      data={{
        labels,
        datasets: [
          {
            data: carbValues,
          }
        ]
      }}
      width={width - 40}
      height={220}
      chartConfig={{
        backgroundColor: '#fff',
        backgroundGradientFrom: '#fff',
        backgroundGradientTo: '#fff',
        decimalPlaces: 0,
        color: (opacity = 1) => `rgba(255, 102, 0, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        style: {
          borderRadius: 16
        },
        barPercentage: 0.7
      }}
      style={{
        marginVertical: 8,
        borderRadius: 16
      }}
      showValuesOnTopOfBars
    />
  );

  return (
    <View style={styles.container}>
      {chartType === 'line' ? renderLineChart() : renderBarChart()}
      
      <View style={styles.legendContainer}>
        {chartType === 'line' && (
          <>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: 'rgba(0, 102, 255, 1)' }]} />
              <Text style={styles.legendText}>Glucose (mg/dL)</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: 'rgba(255, 102, 0, 1)' }]} />
              <Text style={styles.legendText}>Carbs (g)</Text>
            </View>
          </>
        )}
        {chartType === 'bar' && (
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: 'rgba(255, 102, 0, 1)' }]} />
            <Text style={styles.legendText}>Daily Carb Intake (g)</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    marginVertical: 10
  },
  noDataContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 20
  },
  noDataText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text.secondary
  },
  noDataSubtext: {
    marginTop: 5,
    fontSize: 14,
    color: colors.text.secondary
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginTop: 10
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
    marginBottom: 5
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 5
  },
  legendText: {
    fontSize: 12,
    color: colors.text.secondary
  }
});

export default CarbAnalysisChart;