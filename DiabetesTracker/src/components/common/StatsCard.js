// src/components/common/StatsCard.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../utils/theme';

const StatsCard = ({ title, value, unit, change, trend }) => (
  <View style={styles.card}>
    <Text style={styles.title}>{title}</Text>
    <Text style={styles.value}>
      {value} <Text style={styles.unit}>{unit}</Text>
    </Text>
    {change && (
      <Text style={[styles.change, trend === 'up' ? styles.up : styles.down]}>
        {trend === 'up' ? '↑' : '↓'} {change}%
      </Text>
    )}
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: 15,
    margin: 5,
    flex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
  title: { fontSize: 14, color: colors.text.secondary },
  value: { fontSize: 20, fontWeight: 'bold', marginVertical: 5, color: colors.text.primary },
  unit: { fontSize: 14, color: colors.text.secondary },
  change: { fontSize: 12 },
  up: { color: colors.success },
  down: { color: colors.danger },
});

export default StatsCard;