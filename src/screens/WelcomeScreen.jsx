import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../utils/constants';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen({ navigation }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const iconAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(iconAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(iconAnim, { toValue: 0, duration: 2000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const pulseScale = iconAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.1] });

  return (
    <LinearGradient colors={[COLORS.background, '#0D1330', COLORS.background]} style={styles.container}>
      <Animated.View style={[styles.topSection, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <Animated.View style={[styles.iconWrapper, { transform: [{ scale: pulseScale }] }]}>
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons name="car-battery" size={80} color={COLORS.primary} />
          </View>
          <View style={styles.pulseRing} />
          <View style={[styles.pulseRing, styles.pulseRing2]} />
        </Animated.View>

        <Text style={styles.title}>BatteryGuard</Text>
        <Text style={styles.subtitle}>AI</Text>
        <Text style={styles.description}>
          Smart battery diagnostics for every vehicle.{'\n'}
          Know your battery health before it fails.
        </Text>
      </Animated.View>

      <Animated.View style={[styles.features, { opacity: fadeAnim }]}>
        <FeatureRow icon="bluetooth-connect" text="Scan via OBD-II Bluetooth" />
        <FeatureRow icon="chart-arc" text="Real-time health analytics" />
        <FeatureRow icon="bell-alert" text="Smart alerts & predictions" />
        <FeatureRow icon="car" text="Multiple vehicle support" />
      </Animated.View>

      <Animated.View style={[styles.buttons, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate('Register')}
        >
          <LinearGradient
            colors={[COLORS.primary, COLORS.primaryDark]}
            style={styles.gradient}
          >
            <Text style={styles.primaryButtonText}>Get Started Free</Text>
            <MaterialCommunityIcons name="arrow-right" size={20} color={COLORS.white} />
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.secondaryButtonText}>Already have an account? Sign In</Text>
        </TouchableOpacity>
      </Animated.View>
    </LinearGradient>
  );
}

function FeatureRow({ icon, text }) {
  return (
    <View style={featureStyles.row}>
      <MaterialCommunityIcons name={icon} size={22} color={COLORS.primary} />
      <Text style={featureStyles.text}>{text}</Text>
    </View>
  );
}

const featureStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 14,
  },
  text: {
    fontSize: 15,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 80,
    paddingBottom: 50,
    justifyContent: 'space-between',
    ...(Platform.OS === 'web' ? {
      minHeight: '100vh',
      minHeight: '-webkit-fill-available',
      WebkitOverflowScrolling: 'touch',
    } : {}),
  },
  topSection: {
    alignItems: 'center',
  },
  iconWrapper: {
    marginBottom: 24,
    position: 'relative',
    width: 160,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: COLORS.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary + '30',
  },
  pulseRing: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 1,
    borderColor: COLORS.primary + '20',
  },
  pulseRing2: {
    width: 145,
    height: 145,
    borderRadius: 72.5,
  },
  title: {
    fontSize: 38,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.primary,
    marginTop: 2,
    letterSpacing: 4,
  },
  description: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 22,
  },
  features: {
    paddingHorizontal: 10,
  },
  buttons: {
    gap: 12,
  },
  primaryButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.white,
  },
  secondaryButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  secondaryButtonText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
});
