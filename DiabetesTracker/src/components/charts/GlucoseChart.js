// src/components/charts/GlucoseChart.js
import React from 'react';
import { View, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { colors } from '../../utils/theme';

const GlucoseChart = ({ data = [] }) => {
  // Default data if nothing is provided
  const defaultData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      data: [120, 135, 110, 128, 142, 118, 130],
    }]
  };

  const chartData = data.length > 0 ? {
    labels: data.map(d => new Date(d.timestamp).toLocaleDateString('en-US', { weekday: 'short' })),
    datasets: [{ data: data.map(d => d.value) }]
  } : defaultData;

  return (
    <View>
      <LineChart
        data={chartData}
        width={Dimensions.get('window').width - 40}
        height={220}
        chartConfig={{
          backgroundColor: colors.primary,
          backgroundGradientFrom: colors.primaryDark,
          backgroundGradientTo: colors.primary,
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          style: {
            borderRadius: 16
          },
          propsForDots: {
            r: "6",
            strokeWidth: "2",
            stroke: colors.accent
          }
        }}
        bezier
        style={{
          marginVertical: 8,
          borderRadius: 16
        }}
      />
    </View>
  );
};

export default GlucoseChart;