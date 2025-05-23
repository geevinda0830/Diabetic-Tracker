// src/components/ui/ParallaxCard.js
import React, { useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Animated, 
  Dimensions, 
  Image,
  TouchableWithoutFeedback
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../utils/theme';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.85;
const CARD_HEIGHT = 180;

const ParallaxCard = ({ 
  title, 
  description, 
  image, 
  colors: gradientColors = ['#396afc', '#2948ff'],
  icon,
  onPress
}) => {
  // Animation values
  const scale = useRef(new Animated.Value(1)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const rotateX = useRef(new Animated.Value(0)).current;
  const rotateY = useRef(new Animated.Value(0)).current;
  
  const handlePressIn = () => {
    Animated.parallel([
      Animated.timing(scale, {
        toValue: 0.97,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 5,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };
  
  const handlePressOut = () => {
    Animated.parallel([
      Animated.timing(scale, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };
  
  const handleMove = (evt) => {
    const { locationX, locationY } = evt.nativeEvent;
    
    // Calculate the center point of the card
    const centerX = CARD_WIDTH / 2;
    const centerY = CARD_HEIGHT / 2;
    
    // Calculate the distance from center (-1 to 1)
    const rotateXInput = (locationY - centerY) / centerY;
    const rotateYInput = (locationX - centerX) / centerX;
    
    // Update rotation values (limit the rotation to 5 degrees)
    rotateX.setValue(rotateXInput * -5);
    rotateY.setValue(rotateYInput * 5);
  };
  
  const handleRelease = () => {
    // Reset rotation when finger is released
    Animated.parallel([
      Animated.timing(rotateX, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(rotateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <TouchableWithoutFeedback
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onMoveShouldSetResponder={() => true}
      onResponderMove={handleMove}
      onResponderRelease={handleRelease}
      onPress={onPress}
    >
      <Animated.View
        style={[
          styles.container,
          {
            transform: [
              { perspective: 800 },
              { scale },
              { translateY },
              { rotateX: rotateX.interpolate({
                inputRange: [-10, 10],
                outputRange: ['-10deg', '10deg'],
              }) },
              { rotateY: rotateY.interpolate({
                inputRange: [-10, 10],
                outputRange: ['-10deg', '10deg'],
              }) },
            ],
          },
        ]}
      >
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          {image && (
            <Image
              source={image}
              style={styles.backgroundImage}
              resizeMode="cover"
            />
          )}
          
          <View style={styles.contentContainer}>
            {icon && (
              <View style={styles.iconContainer}>
                {icon}
              </View>
            )}
            
            <View style={styles.textContainer}>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.description}>{description}</Text>
            </View>
          </View>
          
          {/* Highlight effect along the top edge */}
          <LinearGradient
            colors={['rgba(255,255,255,0.3)', 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.highlight}
          />
        </LinearGradient>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 20,
    overflow: 'hidden',
    marginVertical: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  gradient: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.2,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  description: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  highlight: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 2,
  },
});

export default ParallaxCard;