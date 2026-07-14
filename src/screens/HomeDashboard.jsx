import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
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

  const healthPercent = lastScan ? BatteryAnalyzer.getHealthPercent(lastScan.voltage, lastScan.cca, activeVehicle?.designCca) : null;
  const batteryStatus = healthPercent !== null ? BatteryAnalyzer.getStatus(healthPercent) : null;
  const voltageStatus = lastScan ? BatteryAnalyzer.getVoltageStatus(lastScan.voltage) : null;

  useEffect(() => {
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
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {user?.name || 'Driver'}!</Text>
          <Text style={styles.dateText}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</Text>
        </View>
        <SubscriptionBadge tier={subscription?.tier || 'FREE'} />
      </View>

      {activeVehicle ? (
        <>
          <View style={styles.vehicleBanner}>
            <MaterialCommunityIcons name="car" size={20} color={COLORS.primary} />
            <Text style={styles.vehicleName}>{activeVehicle.name}</Text>
            <Text style={styles.vehicleDetails}>{activeVehicle.year} {activeVehicle.make} {activeVehicle.model}</Text>
          </View>

          <View style={styles.gaugeContainer}>
            <BatteryGauge healthPercent={healthPercent || 0} size={220} />
            {batteryStatus && (
              <View style={styles.statusRow}>
                <HealthIndicator status={batteryStatus} color={batteryStatus.color} size="large" />
              </View>
            )}
          </View>

          {lastScan && (
            <View style={styles.statsGrid}>
              <StatCard icon="flash" label="Voltage" value={`${lastScan.voltage?.toFixed(1) || '--'}V`} color={COLORS.primary} />
              <StatCard icon="thermometer" label="Temperature" value={`${lastScan.ambientTemp || '--'}°C`} color={COLORS.warning} />
              <StatCard icon="engine" label="RPM" value={lastScan.engineRPM || '--'} color={COLORS.accent} />
              <StatCard icon="car-battery" label="Charging" value={`${lastScan.chargingVoltage?.toFixed(1) || '--'}V`} color={COLORS.secondary} />
            </View>
          )}

          {voltageStatus && (
            <AlertCard
              type={voltageStatus.label.includes('Normal') || voltageStatus.label.includes('Fully') ? 'success' : 'warning'}
              title={voltageStatus.label}
              message={BatteryAnalyzer.getRecommendation(healthPercent, {})}
              onPress={() => navigation.navigate('BatteryDetail')}
            />
          )}

          {healthPercent !== null && healthPercent < 30 && (
            <AlertCard
              type="critical"
              title="Battery Replacement Needed"
              message="Your battery health is critically low. Replace it as soon as possible to avoid being stranded."
            />
          )}

          {subscription?.tier === 'FREE' && (
            <TouchableOpacity
              style={styles.upgradeBanner}
              onPress={() => navigation.navigate('Subscription')}
            >
              <MaterialCommunityIcons name="rocket-launch" size={24} color={COLORS.secondary} />
              <View style={styles.upgradeText}>
                <Text style={styles.upgradeTitle}>Upgrade to Basic</Text>
                <Text style={styles.upgradeSubtitle}>Unlimited scans, detailed reports & more</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color={COLORS.secondary} />
            </TouchableOpacity>
          )}
        </>
      ) : (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="car" size={64} color={COLORS.textMuted} />
          <Text style={styles.emptyTitle}>No Vehicle Added</Text>
          <Text style={styles.emptySubtitle}>Add your first vehicle to start monitoring battery health</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('VehicleManager')}
          >
            <MaterialCommunityIcons name="plus" size={20} color={COLORS.white} />
            <Text style={styles.addButtonText}>Add Vehicle</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

function StatCard({ icon, label, value, color }) {
  return (
    <View style={statStyles.card}>
      <MaterialCommunityIcons name={icon} size={22} color={color} />
      <Text style={statStyles.value}>{value}</Text>
      <Text style={statStyles.label}>{label}</Text>
    </View>
  );
}

const statStyles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    width: '47%',
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 4,
  },
  value: { fontSize: 18, fontWeight: '800', color: COLORS.text },
  label: { fontSize: 12, color: COLORS.textSecondary, fontWeight: '500' },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 20,
    paddingTop: 50,
    ...(Platform.OS === 'web' ? {
      WebkitOverflowScrolling: 'touch',
      overflowY: 'auto',
    } : {}),
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  greeting: { fontSize: 26, fontWeight: '800', color: COLORS.text },
  dateText: { fontSize: 14, color: COLORS.textSecondary, marginTop: 2 },
  vehicleBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primary + '10', borderRadius: 12, padding: 12, marginBottom: 20, gap: 8 },
  vehicleName: { fontSize: 15, fontWeight: '700', color: COLORS.primary },
  vehicleDetails: { fontSize: 13, color: COLORS.textSecondary, flex: 1 },
  gaugeContainer: { alignItems: 'center', marginVertical: 24 },
  statusRow: { marginTop: 16 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 16, gap: 10 },
  upgradeBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.secondary + '15', borderRadius: 14, padding: 16, marginTop: 10, borderWidth: 1, borderColor: COLORS.secondary + '30', gap: 12 },
  upgradeText: { flex: 1 },
  upgradeTitle: { fontSize: 15, fontWeight: '700', color: COLORS.secondary },
  upgradeSubtitle: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  emptyState: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text },
  emptySubtitle: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center' },
  addButton: { flexDirection: 'row', backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 14, paddingHorizontal: 24, alignItems: 'center', gap: 8, marginTop: 16 },
  addButtonText: { fontSize: 15, fontWeight: '700', color: COLORS.white },
});
