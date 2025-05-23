// src/components/ui/MorphingButton.js
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  ActivityIndicator
} from 'react-native';
import { colors } from '../../utils/theme';
import Icon from 'react-native-vector-icons/Ionicons';

const MorphingButton = ({
  title,
  icon,
  onPress,
  style,
  color = colors.primary,
  successMessage = 'Success!',
  loadingTime = 1500,
  successTime = 1500,
}) => {
  const [buttonState, setButtonState] = useState('normal'); // normal, loading, success
  const widthAnim = useRef(new Animated.Value(1)).current;
  const successOpacity = useRef(new Animated.Value(0)).current;
  const loadingOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(1)).current;
  
  const handlePress = async () => {
    // Start animation to loading state
    setButtonState('loading');
    Animated.parallel([
      Animated.timing(widthAnim, {
        toValue: 0.4,
        duration: 300,
        useNativeDriver: false,
        easing: Easing.bezier(0.4, 0.0, 0.2, 1),
      }),
      Animated.timing(textOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(loadingOpacity, {
        toValue: 1,
        duration: 300,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Call onPress
    if (onPress) {
      try {
        await onPress();
      } catch (error) {
        console.error(error);
        // Reset to normal state on error
        resetButton();
        return;
      }
    }
    
    // After loadingTime, animate to success state
    setTimeout(() => {
      setButtonState('success');
      Animated.parallel([
        Animated.timing(loadingOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(successOpacity, {
          toValue: 1,
          duration: 300,
          delay: 200,
          useNativeDriver: true,
        }),
      ]).start();
      
      // After successTime, reset to normal state
      setTimeout(resetButton, successTime);
    }, loadingTime);
  };
  
  const resetButton = () => {
    Animated.parallel([
      Animated.timing(widthAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
        easing: Easing.bezier(0.4, 0.0, 0.2, 1),
      }),
      Animated.timing(successOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 300,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setButtonState('normal');
    });
  };
  
  const buttonWidth = widthAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['40%', '100%'],
  });
  
  const buttonBorderRadius = widthAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [50, 10],
  });

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={handlePress}
      disabled={buttonState !== 'normal'}
      style={style}
    >
      <Animated.View
        style={[
          styles.button,
          {
            backgroundColor: color,
            width: buttonWidth,
            borderRadius: buttonBorderRadius,
          },
        ]}
      >
        {/* Normal state text */}
        <Animated.View
          style={[
            styles.contentContainer,
            { opacity: textOpacity }
          ]}
        >
          {icon && (
            <Icon
              name={icon}
              size={20}
              color="#fff"
              style={styles.icon}
            />
          )}
          <Text style={styles.text}>{title}</Text>
        </Animated.View>
        
        {/* Loading indicator */}
        <Animated.View
          style={[
            styles.loadingContainer,
            { opacity: loadingOpacity },
            buttonState !== 'loading' && styles.hidden,
          ]}
        >
          <ActivityIndicator color="#fff" size="small" />
        </Animated.View>
        
        {/* Success indicator */}
        <Animated.View
          style={[
            styles.successContainer,
            { opacity: successOpacity },
            buttonState !== 'success' && styles.hidden,
          ]}
        >
          <Icon name="checkmark-circle" size={20} color="#fff" />
          <Text style={styles.successText}>{successMessage}</Text>
        </Animated.View>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 8,
    alignSelf: 'center',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
  },
  text: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  icon: {
    marginRight: 8,
  },
  loadingContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successContainer: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successText: {
    color: '#fff',
    marginLeft: 5,
    fontSize: 14,
    fontWeight: '500',
  },
  hidden: {
    display: 'none',
  },
});

export default MorphingButton;