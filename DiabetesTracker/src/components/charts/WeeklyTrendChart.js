// src/components/charts/WeeklyTrendChart.js
import React from 'react';
import { View, Text, Dimensions, StyleSheet } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

const WeeklyTrendChart = ({ data = [] }) => {
  // Group by day of week and calculate averages
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dailyAvgs = Array(7).fill(0);
  const counts = Array(7).fill(0);
  
  data.forEach(reading => {
    const date = new Date(reading.timestamp);
    const dayIdx = date.getDay();
    dailyAvgs[dayIdx] += reading.value;
    counts[dayIdx]++;
  });
  
  // Calculate average per day
  const chartData = dailyAvgs.map((total, idx) => 
    counts[idx] ? Math.round(total / counts[idx]) : 0
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Weekly Glucose Trend</Text>
      <LineChart
        data={{
          labels: days,
          datasets: [{ data: chartData.length ? chartData : [0, 0, 0, 0, 0, 0, 0] }]
        }}
        width={Dimensions.get('window').width - 30}
        height={180}
        chartConfig={{
          backgroundColor: '#1E88E5',
          backgroundGradientFrom: '#1E88E5',
          backgroundGradientTo: '#64B5F6',
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          propsForDots: { r: '4', strokeWidth: '2', stroke: '#ffa726' }
        }}
        bezier
        style={styles.chart}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginVertical: 10 },
  title: { fontSize: 16, fontWeight: 'bold', marginLeft: 15, marginBottom: 5 },
  chart: { borderRadius: 16 }
});

export default WeeklyTrendChart;