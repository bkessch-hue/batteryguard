import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Platform, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSelector, useDispatch } from 'react-redux';
import { COLORS } from '../utils/constants';
import BatteryGauge from '../components/BatteryGauge';
import HealthIndicator from '../components/HealthIndicator';
import AlertCard from '../components/AlertCard';
import SubscriptionBadge from '../components/SubscriptionBadge';
import BatteryAnalyzer from '../services/batteryAnalyzer';
import SubscriptionService from '../services/subscriptionService';

export default function HomeDashboard({ navigation }) {
  const { user, activeVehicle, lastScan, vehicles, subscription } = useSelector(s => s.app);
  const dispatch = useDispatch();
  const [refreshing, setRefreshing] = useState(false);
  const [scansRemaining, setScansRemaining] = useState(3);
  const fadeAnim = useState(new Animated.Value(0))[0];

  const healthPercent = lastScan ? BatteryAnalyzer.getHealthPercent(lastScan.voltage, lastScan.cca, activeVehicle?.designCca) : null;
  const batteryStatus = healthPercent !== null ? BatteryAnalyzer.getStatus(healthPercent) : null;
  const voltageStatus = lastScan ? BatteryAnalyzer.getVoltageStatus(lastScan.voltage) : null;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    loadScansRemaining();
  }, []);

  const loadScansRemaining = async () => {
    const remaining = await SubscriptionService.getScansRemaining();
    setScansRemaining(remaining);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadScansRemaining();
    setRefreshing(false);
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.bgOrb1} />
      <View style={styles.bgOrb2} />

      <Animated.View style={{ opacity: fadeAnim }}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{user?.name?.charAt(0)?.toUpperCase() || 'U'}</Text>
            </View>
            <View>
              <Text style={styles.greeting}>Hello, {user?.name || 'Driver'}!</Text>
              <Text style={styles.dateText}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</Text>
            </View>
          </View>
          <SubscriptionBadge tier={subscription?.tier || 'FREE'} />
        </View>

        {activeVehicle ? (
          <>
            <TouchableOpacity style={styles.vehicleBanner} onPress={() => navigation.navigate('VehicleManager')}>
              <LinearGradient colors={['rgba(0,212,255,0.12)', 'rgba(0,212,255,0.04)']} style={styles.vehicleBannerGrad}>
                <View style={styles.vehicleIconBox}>
                  <MaterialCommunityIcons name="car" size={20} color={COLORS.primary} />
                </View>
                <View style={styles.vehicleInfo}>
                  <Text style={styles.vehicleName}>{activeVehicle.name}</Text>
                  <Text style={styles.vehicleDetails}>{activeVehicle.year} {activeVehicle.make} {activeVehicle.model}</Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={20} color={COLORS.textMuted} />
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.gaugeSection}>
              <View style={styles.gaugeGlow} />
              <BatteryGauge healthPercent={healthPercent || 0} size={220} />
              {batteryStatus && (
                <View style={styles.statusRow}>
                  <HealthIndicator status={batteryStatus} color={batteryStatus.color} size="large" />
                </View>
              )}
            </View>

            {lastScan && (
              <View style={styles.statsGrid}>
                <StatCard icon="flash" label="Voltage" value={`${lastScan.voltage?.toFixed(1) || '--'}V`} color="#00D4FF" gradient={['rgba(0,212,255,0.2)', 'rgba(0,212,255,0.05)']} />
                <StatCard icon="thermometer" label="Temperature" value={`${lastScan.ambientTemp || '--'}°C`} color="#FF9100" gradient={['rgba(255,145,0,0.2)', 'rgba(255,145,0,0.05)']} />
                <StatCard icon="engine" label="RPM" value={lastScan.engineRPM || '--'} color="#00E676" gradient={['rgba(0,230,118,0.2)', 'rgba(0,230,118,0.05)']} />
                <StatCard icon="car-battery" label="Charging" value={`${lastScan.chargingVoltage?.toFixed(1) || '--'}V`} color="#7C4DFF" gradient={['rgba(124,77,255,0.2)', 'rgba(124,77,255,0.05)']} />
              </View>
            )}

            {voltageStatus && (
              <View style={styles.alertWrapper}>
                <AlertCard
                  type={voltageStatus.label.includes('Normal') || voltageStatus.label.includes('Fully') ? 'success' : 'warning'}
                  title={voltageStatus.label}
                  message={BatteryAnalyzer.getRecommendation(healthPercent, {})}
                  onPress={() => navigation.navigate('BatteryDetail')}
                />
              </View>
            )}

            {healthPercent !== null && healthPercent < 30 && (
              <View style={styles.alertWrapper}>
                <AlertCard
                  type="critical"
                  title="Battery Replacement Needed"
                  message="Your battery health is critically low. Replace it as soon as possible to avoid being stranded."
                />
              </View>
            )}

            {subscription?.tier === 'FREE' && (
              <TouchableOpacity style={styles.upgradeCard} onPress={() => navigation.navigate('Subscription')}>
                <LinearGradient colors={['rgba(124,77,255,0.15)', 'rgba(0,212,255,0.08)']} style={styles.upgradeGrad}>
                  <View style={styles.upgradeIconBox}>
                    <MaterialCommunityIcons name="rocket-launch" size={24} color={COLORS.secondary} />
                  </View>
                  <View style={styles.upgradeText}>
                    <Text style={styles.upgradeTitle}>Upgrade to Pro</Text>
                    <Text style={styles.upgradeSubtitle}>Unlimited scans, AI predictions & more</Text>
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={24} color={COLORS.secondary} />
                </LinearGradient>
              </TouchableOpacity>
            )}
          </>
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconBox}>
              <LinearGradient colors={['rgba(0,212,255,0.15)', 'rgba(0,212,255,0.05)']} style={styles.emptyIconGrad}>
                <MaterialCommunityIcons name="car" size={48} color={COLORS.primary} />
              </LinearGradient>
            </View>
            <Text style={styles.emptyTitle}>No Vehicle Added</Text>
            <Text style={styles.emptySubtitle}>Add your first vehicle to start monitoring battery health</Text>
            <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('VehicleManager')}>
              <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.addBtnGrad}>
                <MaterialCommunityIcons name="plus" size={20} color={COLORS.white} />
                <Text style={styles.addButtonText}>Add Vehicle</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 100 }} />
      </Animated.View>
    </ScrollView>
  );
}

function StatCard({ icon, label, value, color, gradient }) {
  return (
    <View style={statStyles.cardWrapper}>
      <LinearGradient colors={gradient} style={statStyles.card}>
        <View style={[statStyles.iconBox, { backgroundColor: color + '20' }]}>
          <MaterialCommunityIcons name={icon} size={20} color={color} />
        </View>
        <Text style={statStyles.value}>{value}</Text>
        <Text style={statStyles.label}>{label}</Text>
      </LinearGradient>
    </View>
  );
}

const statStyles = StyleSheet.create({
  cardWrapper: {
    width: '47%',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(42,47,74,0.5)',
  },
  card: {
    padding: 16,
    alignItems: 'center',
    gap: 6,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: { fontSize: 20, fontWeight: '800', color: COLORS.text },
  label: { fontSize: 12, color: COLORS.textSecondary, fontWeight: '500' },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050816',
    paddingHorizontal: 20,
    paddingTop: 50,
    ...(Platform.OS === 'web' ? {
      WebkitOverflowScrolling: 'touch',
      overflowY: 'auto',
    } : {}),
  },
  bgOrb1: {
    position: 'absolute',
    top: -60,
    right: -40,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(0,212,255,0.04)',
  },
  bgOrb2: {
    position: 'absolute',
    top: 300,
    left: -60,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(124,77,255,0.03)',
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,212,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(0,212,255,0.3)',
  },
  avatarText: { fontSize: 18, fontWeight: '800', color: COLORS.primary },
  greeting: { fontSize: 20, fontWeight: '700', color: COLORS.text },
  dateText: { fontSize: 13, color: COLORS.textSecondary, marginTop: 1 },
  vehicleBanner: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,212,255,0.2)',
  },
  vehicleBannerGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  vehicleIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(0,212,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vehicleInfo: { flex: 1 },
  vehicleName: { fontSize: 15, fontWeight: '700', color: COLORS.primary },
  vehicleDetails: { fontSize: 12, color: COLORS.textSecondary, marginTop: 1 },
  gaugeSection: {
    alignItems: 'center',
    marginVertical: 20,
    position: 'relative',
  },
  gaugeGlow: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(0,212,255,0.04)',
  },
  statusRow: { marginTop: 16 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 16, gap: 10 },
  alertWrapper: { marginBottom: 12 },
  upgradeCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 4,
    borderWidth: 1,
    borderColor: 'rgba(124,77,255,0.3)',
  },
  upgradeGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 14,
  },
  upgradeIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(124,77,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  upgradeText: { flex: 1 },
  upgradeTitle: { fontSize: 16, fontWeight: '700', color: COLORS.secondary },
  upgradeSubtitle: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  emptyState: { alignItems: 'center', paddingVertical: 60, gap: 16 },
  emptyIconBox: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0,212,255,0.2)',
  },
  emptyIconGrad: {
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text },
  emptySubtitle: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', paddingHorizontal: 20 },
  addButton: { borderRadius: 14, overflow: 'hidden', marginTop: 8 },
  addBtnGrad: { flexDirection: 'row', paddingVertical: 14, paddingHorizontal: 28, alignItems: 'center', gap: 8 },
  addButtonText: { fontSize: 15, fontWeight: '700', color: COLORS.white },
});
