// src/components/common/GradientCard.js
import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, shadows, layout } from '../../utils/theme';

const GradientCard = ({ 
  title, 
  value, 
  unit, 
  icon, 
  type = 'primary',
  trend = null,
  changeValue = null
}) => {
  const getGradientColors = () => {
    return colors.gradient[type] || colors.gradient.primary;
  };

  return (
    <View style={[styles.container, shadows.medium]}>
      <LinearGradient
        colors={getGradientColors()}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.iconContainer}>
          <Image source={icon} style={styles.icon} />
        </View>
        
        <Text style={styles.title}>{title}</Text>
        
        <View style={styles.valueContainer}>
          <Text style={styles.value}>{value}</Text>
          <Text style={styles.unit}>{unit}</Text>
        </View>
        
        {trend && (
          <View style={styles.trendContainer}>
            <Text style={styles.trendText}>
              {trend === 'up' ? '↑' : '↓'} {changeValue}%
            </Text>
          </View>
        )}
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: layout.borderRadius.lg,
    overflow: 'hidden',
    marginHorizontal: layout.spacing.sm,
    flex: 1,
  },
  gradient: {
    padding: layout.spacing.md,
    height: 140,
    justifyContent: 'space-between',
  },
  iconContainer: {
    alignItems: 'flex-end',
  },
  icon: {
    width: 24,
    height: 24,
    tintColor: 'rgba(255,255,255,0.8)',
  },
  title: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '500',
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  value: {
    color: colors.text.light,
    fontSize: 28,
    fontWeight: 'bold',
  },
  unit: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginLeft: 4,
  },
  trendContainer: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: layout.borderRadius.sm,
    paddingHorizontal: layout.spacing.sm,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  trendText: {
    color: colors.text.light,
    fontSize: 12,
    fontWeight: '500',
  }
});

export default GradientCard;