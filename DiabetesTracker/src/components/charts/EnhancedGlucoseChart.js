// src/components/charts/EnhancedGlucoseChart.js
import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { colors, shadows, layout } from '../../utils/theme';
import LinearGradient from 'react-native-linear-gradient';

const EnhancedGlucoseChart = ({ data = [] }) => {
  // Calculate target ranges
  const targetMin = 70;
  const targetMax = 180;
  
  // Format data for chart
  const chartData = {
    labels: data.length > 0 
      ? data.slice(-7).map(d => new Date(d.timestamp).toLocaleDateString('en-US', { weekday: 'short' }))
      : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      data: data.length > 0 
        ? data.slice(-7).map(d => d.value)
        : [120, 135, 110, 190, 142, 118, 130],
    }]
  };
  
  // Calculate time in range
  const calculateTimeInRange = () => {
    if (data.length === 0) return 0;
    
    const inRange = data.filter(d => d.value >= targetMin && d.value <= targetMax).length;
    return Math.round((inRange / data.length) * 100);
  };
  
  const timeInRange = calculateTimeInRange();

  return (
    <View style={[styles.container, shadows.medium]}>
      <View style={styles.header}>
        <Text style={styles.title}>Glucose Trend</Text>
        <View style={styles.rangeIndicator}>
          <Text style={styles.rangeText}>{timeInRange}% in range</Text>
        </View>
      </View>
      
      <LineChart
        data={chartData}
        width={Dimensions.get('window').width - 32}
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
          },
          propsForBackgroundLines: {
            strokeDasharray: '', // solid background lines
          },
          // Highlight target range
          propsForHorizontalLabels: {
            fontSize: 12,
          },
          formatYLabel: (value) => {
            const val = parseInt(value);
            return val.toString();
          },
        }}
        bezier
        style={styles.chart}
        // Add horizontal line for target range
        decorator={() => {
          return (
            <>
              <View style={[styles.targetLine, { bottom: targetMin * 220 / 300 }]} />
              <View style={[styles.targetLine, { bottom: targetMax * 220 / 300 }]} />
              <View 
                style={[
                  styles.targetRangeArea, 
                  { 
                    bottom: targetMin * 220 / 300,
                    height: (targetMax - targetMin) * 220 / 300
                  }
                ]} 
              />
            </>
          )
        }}
      />
      
      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.accent }]} />
          <Text style={styles.legendText}>Glucose Reading</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: 'rgba(255,255,255,0.3)' }]} />
          <Text style={styles.legendText}>Target Range</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: layout.borderRadius.lg,
    padding: layout.spacing.md,
    marginVertical: layout.spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: layout.spacing.md,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  rangeIndicator: {
    backgroundColor: colors.secondary,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: layout.borderRadius.pill,
  },
  rangeText: {
    color: colors.text.light,
    fontWeight: '500',
    fontSize: 12,
  },
  chart: {
    marginVertical: layout.spacing.sm,
    borderRadius: layout.borderRadius.lg,
  },
  targetLine: {
    position: 'absolute',
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.5)',
    left: 0,
  },
  targetRangeArea: {
    position: 'absolute',
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.1)',
    left: 0,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: layout.spacing.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: layout.spacing.md,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: colors.text.secondary,
  }
});

export default EnhancedGlucoseChart;