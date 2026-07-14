import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { COLORS } from '../utils/constants';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function BatteryGauge({ healthPercent = 75, size = 200, strokeWidth = 14 }) {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const halfSize = size / 2;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: healthPercent,
      duration: 1500,
      useNativeDriver: false,
    }).start();
  }, [healthPercent]);

  const getColor = (pct) => {
    if (pct >= 90) return COLORS.battery.excellent;
    if (pct >= 70) return COLORS.battery.good;
    if (pct >= 50) return COLORS.battery.fair;
    if (pct >= 30) return COLORS.battery.poor;
    return COLORS.battery.critical;
  };

  const strokeDashoffset = animatedValue.interpolate({
    inputRange: [0, 100],
    outputRange: [circumference, 0],
  });

  const color = getColor(healthPercent);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <G rotation="-90" origin={`${halfSize}, ${halfSize}`}>
          <Circle
            cx={halfSize}
            cy={halfSize}
            r={radius}
            stroke={COLORS.surfaceLight}
            strokeWidth={strokeWidth}
            fill="none"
          />
          <AnimatedCircle
            cx={halfSize}
            cy={halfSize}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </G>
      </Svg>
      <View style={styles.textContainer}>
        <Text style={[styles.percentText, { color }]}>{healthPercent}%</Text>
        <Text style={styles.labelText}>Battery Health</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentText: {
    fontSize: 42,
    fontWeight: '800',
  },
  labelText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
});
