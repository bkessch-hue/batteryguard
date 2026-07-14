import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../utils/constants';

const { width } = Dimensions.get('window');

export default function WelcomeScreen({ navigation }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(60)).current;
  const iconAnim = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const particleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 1000, useNativeDriver: true }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(iconAnim, { toValue: 1, duration: 2500, useNativeDriver: true }),
        Animated.timing(iconAnim, { toValue: 0, duration: 2500, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: -8, duration: 3000, useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0, duration: 3000, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0, duration: 2000, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.timing(particleAnim, { toValue: 1, duration: 4000, useNativeDriver: true })
    ).start();
  }, []);

  const pulseScale = iconAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] });
  const glowOpacity = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.8] });
  const particleY = particleAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -30] });
  const particleOpacity = particleAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 1, 0] });

  return (
    <LinearGradient colors={['#050816', '#0A0E21', '#0D1330', '#0A0E21']} style={styles.container}>
      <View style={styles.bgOrb1} />
      <View style={styles.bgOrb2} />
      <View style={styles.bgOrb3} />
      <View style={styles.bgGrid} />

      <Animated.View style={[styles.topSection, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <Animated.View style={[styles.iconWrapper, { transform: [{ scale: pulseScale }, { translateY: floatAnim }] }]}>
          <View style={styles.iconGlowOuter} />
          <View style={styles.iconGlowInner} />
          <View style={styles.iconCircleOuter}>
            <LinearGradient colors={['rgba(0,212,255,0.2)', 'rgba(0,212,255,0.05)']} style={styles.iconCircleGrad}>
              <MaterialCommunityIcons name="car-battery" size={64} color={COLORS.primary} />
            </LinearGradient>
          </View>
          <View style={styles.pulseRing} />
          <View style={[styles.pulseRing, styles.pulseRing2]} />
          <View style={[styles.pulseRing, styles.pulseRing3]} />

          {[0, 1, 2, 3, 4].map(i => (
            <Animated.View
              key={i}
              style={[styles.particle, {
                left: `${20 + i * 15}%`,
                opacity: particleOpacity,
                transform: [{ translateY: particleY }, { scale: particleAnim }],
              }]}
            />
          ))}
        </Animated.View>

        <View style={styles.titleContainer}>
          <Text style={styles.title}>BatteryGuard</Text>
          <View style={styles.aiBadge}>
            <Text style={styles.aiText}>AI</Text>
          </View>
        </View>
        <Text style={styles.description}>
          Smart battery diagnostics for every vehicle.
        </Text>
        <Text style={styles.subDescription}>
          Know your battery health before it fails.
        </Text>
      </Animated.View>

      <Animated.View style={[styles.features, { opacity: fadeAnim }]}>
        <FeatureRow icon="bluetooth-connect" text="Scan via OBD-II Bluetooth" delay={0} />
        <FeatureRow icon="chart-arc" text="Real-time health analytics" delay={100} />
        <FeatureRow icon="bell-alert" text="Smart alerts & predictions" delay={200} />
        <FeatureRow icon="car" text="Multiple vehicle support" delay={300} />
      </Animated.View>

      <Animated.View style={[styles.buttons, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate('Register')}>
          <LinearGradient colors={['#00D4FF', '#0099CC', '#7C4DFF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.gradient}>
            <MaterialCommunityIcons name="zap" size={20} color={COLORS.white} />
            <Text style={styles.primaryButtonText}>Get Started Free</Text>
            <MaterialCommunityIcons name="arrow-right" size={20} color={COLORS.white} />
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.secondaryButtonText}>Already have an account? <Text style={styles.signInLink}>Sign In</Text></Text>
        </TouchableOpacity>
      </Animated.View>
    </LinearGradient>
  );
}

function FeatureRow({ icon, text }) {
  return (
    <View style={featureStyles.row}>
      <View style={featureStyles.iconBox}>
        <MaterialCommunityIcons name={icon} size={18} color={COLORS.primary} />
      </View>
      <Text style={featureStyles.text}>{text}</Text>
      <MaterialCommunityIcons name="check-circle" size={16} color={COLORS.accent} />
    </View>
  );
}

const featureStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: 'rgba(21,26,48,0.6)',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(42,47,74,0.6)',
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(0,212,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  text: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
    flex: 1,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 50,
    justifyContent: 'space-between',
    overflow: 'hidden',
    ...(Platform.OS === 'web' ? {
      minHeight: '100vh',
      minHeight: '-webkit-fill-available',
    } : {}),
  },
  bgOrb1: {
    position: 'absolute',
    top: -80,
    right: -60,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(0,212,255,0.06)',
  },
  bgOrb2: {
    position: 'absolute',
    bottom: 100,
    left: -80,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(124,77,255,0.05)',
  },
  bgOrb3: {
    position: 'absolute',
    top: '40%',
    right: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(0,230,118,0.04)',
  },
  bgGrid: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 0,
    opacity: 0.03,
  },
  topSection: {
    alignItems: 'center',
  },
  iconWrapper: {
    marginBottom: 28,
    position: 'relative',
    width: 180,
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconGlowOuter: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(0,212,255,0.08)',
  },
  iconGlowInner: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(0,212,255,0.12)',
  },
  iconCircleOuter: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: 'rgba(0,212,255,0.4)',
    overflow: 'hidden',
  },
  iconCircleGrad: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(10,14,33,0.8)',
  },
  pulseRing: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 1,
    borderColor: 'rgba(0,212,255,0.15)',
  },
  pulseRing2: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderColor: 'rgba(0,212,255,0.08)',
  },
  pulseRing3: {
    width: 178,
    height: 178,
    borderRadius: 89,
    borderColor: 'rgba(0,212,255,0.04)',
  },
  particle: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.primary,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: -1,
  },
  aiBadge: {
    backgroundColor: 'rgba(0,212,255,0.15)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: 'rgba(0,212,255,0.3)',
  },
  aiText: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 1,
  },
  description: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 14,
    fontWeight: '500',
  },
  subDescription: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 4,
  },
  features: {
    paddingHorizontal: 4,
  },
  buttons: {
    gap: 14,
  },
  primaryButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#00D4FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 10,
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  secondaryButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  secondaryButtonText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  signInLink: {
    color: COLORS.primary,
    fontWeight: '700',
  },
});
