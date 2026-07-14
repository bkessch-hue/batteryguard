import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Svg, { Circle, G, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import { COLORS } from '../utils/constants';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function BatteryGauge({ healthPercent = 75, size = 200, strokeWidth = 14 }) {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const radius = (size - strokeWidth - 16) / 2;
  const circumference = radius * 2 * Math.PI;
  const halfSize = size / 2;
  const svgSize = size + 16;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: healthPercent,
      duration: 1800,
      useNativeDriver: false,
    }).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0, duration: 2000, useNativeDriver: true }),
      ])
    ).start();
  }, [healthPercent]);

  const getColor = (pct) => {
    if (pct >= 90) return '#00E676';
    if (pct >= 70) return '#76FF03';
    if (pct >= 50) return '#FFD600';
    if (pct >= 30) return '#FF9100';
    return '#FF1744';
  };

  const getGlowColor = (pct) => {
    if (pct >= 90) return 'rgba(0,230,118,0.3)';
    if (pct >= 70) return 'rgba(118,255,3,0.3)';
    if (pct >= 50) return 'rgba(255,214,0,0.3)';
    if (pct >= 30) return 'rgba(255,145,0,0.3)';
    return 'rgba(255,23,68,0.3)';
  };

  const strokeDashoffset = animatedValue.interpolate({
    inputRange: [0, 100],
    outputRange: [circumference, 0],
  });

  const color = getColor(healthPercent);
  const glowColor = getGlowColor(healthPercent);
  const glowOpacity = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.2, 0.5] });

  const gradientId = `grad-${healthPercent}`;
  const glowId = `glow-${healthPercent}`;

  return (
    <View style={[styles.container, { width: svgSize, height: svgSize }]}>
      <View style={[styles.glowBg, { width: size * 0.85, height: size * 0.85, borderRadius: size * 0.425, backgroundColor: glowColor }]} />

      <Svg width={svgSize} height={svgSize}>
        <Defs>
          <SvgGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={color} stopOpacity="1" />
            <Stop offset="50%" stopColor={color} stopOpacity="0.8" />
            <Stop offset="100%" stopColor={color} stopOpacity="0.6" />
          </SvgGradient>
          <SvgGradient id={glowId} x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor={color} stopOpacity="0" />
            <Stop offset="50%" stopColor={color} stopOpacity="0.4" />
            <Stop offset="100%" stopColor={color} stopOpacity="0" />
          </SvgGradient>
        </Defs>

        <G rotation="-90" origin={`${svgSize / 2}, ${svgSize / 2}`}>
          <Circle
            cx={svgSize / 2}
            cy={svgSize / 2}
            r={radius}
            stroke="rgba(30,35,69,0.8)"
            strokeWidth={strokeWidth}
            fill="none"
          />
          <Circle
            cx={svgSize / 2}
            cy={svgSize / 2}
            r={radius}
            stroke="rgba(42,47,74,0.4)"
            strokeWidth={strokeWidth + 6}
            fill="none"
          />
          <AnimatedCircle
            cx={svgSize / 2}
            cy={svgSize / 2}
            r={radius}
            stroke={`url(#${gradientId})`}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
          <AnimatedCircle
            cx={svgSize / 2}
            cy={svgSize / 2}
            r={radius + strokeWidth / 2 + 2}
            stroke={`url(#${glowId})`}
            strokeWidth={3}
            fill="none"
            strokeDasharray={circumference + 10}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            opacity={glowOpacity}
          />
        </G>
      </Svg>

      <View style={styles.textContainer}>
        <Text style={[styles.percentText, { color }]}>{healthPercent}%</Text>
        <Text style={styles.labelText}>Battery Health</Text>
        <View style={[styles.statusDot, { backgroundColor: color }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowBg: {
    position: 'absolute',
    opacity: 0.15,
  },
  textContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentText: {
    fontSize: 42,
    fontWeight: '900',
    letterSpacing: -1,
  },
  labelText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
    fontWeight: '500',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 8,
  },
});
