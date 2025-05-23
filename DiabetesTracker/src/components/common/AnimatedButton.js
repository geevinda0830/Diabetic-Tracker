// src/components/common/AnimatedButton.js
import React, { useRef } from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  Animated, 
  Easing, 
  View 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, shadows, layout } from '../../utils/theme';
import Icon from 'react-native-vector-icons/Ionicons';

const AnimatedButton = ({ 
  title, 
  onPress, 
  type = 'primary', 
  icon,
  disabled = false 
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  
  const onPressIn = () => {
    Animated.timing(scaleAnim, {
      toValue: 0.95,
      duration: 100,
      useNativeDriver: true,
      easing: Easing.inOut(Easing.ease)
    }).start();
  };
  
  const onPressOut = () => {
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 150,
      useNativeDriver: true,
      easing: Easing.inOut(Easing.ease)
    }).start();
  };

  const getGradientColors = () => {
    if (disabled) return ['#CCCCCC', '#AAAAAA'];
    return colors.gradient[type] || colors.gradient.primary;
  };

  return (
    <Animated.View
      style={[
        styles.container,
        shadows.medium,
        { transform: [{ scale: scaleAnim }] }
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={disabled ? null : onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={styles.touchable}
        disabled={disabled}
      >
        <LinearGradient
          colors={getGradientColors()}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        >
          {icon && (
            <Icon
              name={icon}
              size={20}
              color={colors.text.light}
              style={styles.icon}
            />
          )}
          <Text style={styles.text}>{title}</Text>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: layout.borderRadius.md,
    marginVertical: layout.spacing.md,
    overflow: 'hidden',
  },
  touchable: {
    width: '100%',
  },
  gradient: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: layout.borderRadius.md,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: colors.text.light,
    fontWeight: '600',
    fontSize: 16,
    textAlign: 'center',
  },
  icon: {
    marginRight: 8,
  }
});

export default AnimatedButton;