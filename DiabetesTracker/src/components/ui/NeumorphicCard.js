// src/components/ui/NeumorphicCard.js
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Pressable, 
  Animated, 
  Easing 
} from 'react-native';
import { colors } from '../../utils/theme';

const NeumorphicCard = ({ 
  title, 
  value, 
  unit, 
  icon,
  accent = '#4e9af1',
  isInteractive = true
}) => {
  const [pressed, setPressed] = useState(false);
  const [animation] = useState(new Animated.Value(0));
  
  const handlePressIn = () => {
    if (!isInteractive) return;
    
    setPressed(true);
    Animated.timing(animation, {
      toValue: 1,
      duration: 150,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start();
  };
  
  const handlePressOut = () => {
    if (!isInteractive) return;
    
    setPressed(false);
    Animated.timing(animation, {
      toValue: 0,
      duration: 200,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start();
  };
  
  const animatedShadowRadius = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [10, 5],
  });
  
  const animatedScale = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.98],
  });

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={styles.pressable}
    >
      <Animated.View 
        style={[
          styles.container,
          {
            transform: [{ scale: animatedScale }],
            shadowRadius: animatedShadowRadius,
          },
          pressed ? styles.pressed : {}
        ]}
      >
        <View style={styles.contentContainer}>
          <View style={styles.topRow}>
            {icon && (
              <View style={[styles.iconContainer, { backgroundColor: accent }]}>
                {icon}
              </View>
            )}
            <Text style={styles.title}>{title}</Text>
          </View>
          
          <View style={styles.valueRow}>
            <Text style={styles.value}>{value}</Text>
            <Text style={styles.unit}>{unit}</Text>
          </View>
          
          <View style={[styles.accentBar, { backgroundColor: accent }]} />
        </View>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  pressable: {
    borderRadius: 25,
    marginVertical: 8,
    marginHorizontal: 5,
    flex: 1,
  },
  container: {
    backgroundColor: '#f0f5ff',
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: {
      width: 10,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
    padding: 20,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f8faff',
  },
  pressed: {
    shadowOffset: {
      width: 5,
      height: 5,
    },
    shadowOpacity: 0.15,
    shadowRadius: 5,
  },
  contentContainer: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#596377',
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  value: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A2440',
  },
  unit: {
    fontSize: 14,
    color: '#9CA5B4',
    marginLeft: 5,
  },
  accentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: 25,
    borderBottomLeftRadius: 25,
  },
});

export default NeumorphicCard;