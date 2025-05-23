// src/components/ui/FloatingActionButton.js
import React, { useState, useEffect } from 'react';
import { 
  View, 
  TouchableOpacity, 
  StyleSheet, 
  Animated, 
  Easing,
  Text
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../../utils/theme';

const FloatingActionButton = ({ 
  onPress, 
  actions = [],
  icon = "add-outline",
  color = colors.primary
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [animation] = useState(new Animated.Value(0));
  
  const toggleMenu = () => {
    const toValue = isOpen ? 0 : 1;
    
    Animated.timing(animation, {
      toValue,
      duration: 300,
      easing: Easing.bezier(0.4, 0.0, 0.2, 1),
      useNativeDriver: true,
    }).start();
    
    setIsOpen(!isOpen);
  };
  
  const rotation = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });
  
  const backdropOpacity = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.5],
  });

  // Close menu when touching backdrop
  useEffect(() => {
    if (!isOpen) return;
    
    const timer = setTimeout(() => {
      if (isOpen) {
        toggleMenu();
      }
    }, 5000); // Auto close after 5 seconds
    
    return () => clearTimeout(timer);
  }, [isOpen]);

  return (
    <>
      {isOpen && (
        <Animated.View 
          style={[
            styles.backdrop,
            { opacity: backdropOpacity }
          ]}
          pointerEvents={isOpen ? 'auto' : 'none'}
          onTouchEnd={() => toggleMenu()}
        />
      )}
      
      <View style={styles.container}>
        {actions.map((action, index) => {
          const translateY = animation.interpolate({
            inputRange: [0, 1],
            outputRange: [0, -70 * (index + 1)],
          });
          
          const scale = animation.interpolate({
            inputRange: [0, 0.8, 1],
            outputRange: [0, 1.2, 1],
          });
          
          const opacity = animation.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [0, 0, 1],
          });
          
          return (
            <Animated.View 
              key={index}
              style={[
                styles.actionButton,
                { 
                  transform: [
                    { translateY },
                    { scale }
                  ],
                  opacity
                }
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.actionButtonTouchable,
                  { backgroundColor: action.color || color }
                ]}
                onPress={() => {
                  action.onPress();
                  toggleMenu();
                }}
              >
                <Icon name={action.icon} size={22} color="#fff" />
              </TouchableOpacity>
              {action.label && (
                <Animated.View style={[styles.actionLabel, { opacity }]}>
                  <View style={styles.actionLabelContainer}>
                    <Text style={styles.actionLabelText}>{action.label}</Text>
                  </View>
                </Animated.View>
              )}
            </Animated.View>
          );
        })}
        
        <TouchableOpacity
          style={[styles.button, { backgroundColor: color }]}
          onPress={toggleMenu}
          activeOpacity={0.85}
        >
          <Animated.View style={{ transform: [{ rotate: rotation }] }}>
            <Icon name={icon} size={28} color="#fff" />
          </Animated.View>
        </TouchableOpacity>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    alignItems: 'center',
    zIndex: 999,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
    zIndex: 998,
  },
  button: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.34,
    shadowRadius: 6.27,
    elevation: 10,
  },
  actionButton: {
    position: 'absolute',
    width: 48,
    height: 48,
    right: 6,
    bottom: 6,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 997,
  },
  actionButtonTouchable: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    elevation: 6,
  },
  actionLabel: {
    position: 'absolute',
    right: 64,
    borderRadius: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  actionLabelContainer: {
    backgroundColor: 'white',
    borderRadius: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  actionLabelText: {
    color: '#333',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default FloatingActionButton;