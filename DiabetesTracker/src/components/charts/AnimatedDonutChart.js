// src/components/charts/AnimatedDonutChart.js
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import Svg, { G, Circle } from 'react-native-svg';
import { colors } from '../../utils/theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const AnimatedDonutChart = ({
  percentage = 75,
  radius = 70,
  strokeWidth = 10,
  duration = 1000,
  color = colors.primary,
  delay = 0,
  max = 100,
  label = "",
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const circleRef = useRef();
  const halfCircle = radius + strokeWidth;
  const circleCircumference = 2 * Math.PI * radius;
  
  const animation = (toValue) => {
    return Animated.timing(animatedValue, {
      toValue,
      duration,
      delay,
      useNativeDriver: true,
      easing: Easing.out(Easing.cubic),
    }).start();
  };
  
  useEffect(() => {
    animation(percentage);
    
    animatedValue.addListener((v) => {
      if (circleRef?.current) {
        const maxPerc = 100 * v.value / max;
        const strokeDashoffset = circleCircumference - (circleCircumference * maxPerc) / 100;
        circleRef.current.setNativeProps({
          strokeDashoffset,
        });
      }
    });
    
    return () => {
      animatedValue.removeAllListeners();
    };
  }, [percentage, max]);

  const animatedPercentage = animatedValue.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 100],
    extrapolate: 'clamp',
  });

  // Get color based on percentage
  const getColor = () => {
    if (percentage >= 70) return colors.success;
    if (percentage >= 50) return colors.warning;
    return colors.danger;
  };

  return (
    <View style={styles.container}>
      <View style={styles.valueContainer}>
        <Animated.Text style={styles.value}>
          {animatedPercentage.interpolate({
            inputRange: [0, 100],
            outputRange: [0, percentage],
            extrapolate: 'clamp',
          }).interpolate({
            inputRange: [0, 100],
            outputRange: ['0', percentage.toString()],
          })}
        </Animated.Text>
        <Text style={styles.symbol}>%</Text>
      </View>
      
      <Text style={styles.label}>{label}</Text>
      
      <Svg
        width={radius * 2 + strokeWidth * 2}
        height={radius * 2 + strokeWidth * 2}
        viewBox={`0 0 ${halfCircle * 2} ${halfCircle * 2}`}
        style={{ position: 'absolute' }}
      >
        <G rotation="-90" origin={`${halfCircle}, ${halfCircle}`}>
          <Circle
            cx="50%"
            cy="50%"
            r={radius}
            fill="transparent"
            stroke="#f2f2f2"
            strokeWidth={strokeWidth}
          />
          <AnimatedCircle
            ref={circleRef}
            cx="50%"
            cy="50%"
            r={radius}
            fill="transparent"
            stroke={color || getColor()}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circleCircumference}
            strokeDashoffset={circleCircumference}
          />
        </G>
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 160,
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  value: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  symbol: {
    fontSize: 16,
    color: colors.text.secondary,
    marginLeft: 2,
  },
  label: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 5,
  },
});

export default AnimatedDonutChart;