import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Alert, ActivityIndicator, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSelector, useDispatch } from 'react-redux';
import { COLORS } from '../utils/constants';
import { setLastScan, setOBDConnection } from '../store';
import obdService from '../services/obdService';
import BatteryAnalyzer from '../services/batteryAnalyzer';
import NotificationService from '../services/notificationService';
import SubscriptionService from '../services/subscriptionService';
import { getBrowserInfo, getBluetoothUnavailableMessage } from '../utils/browser';

export default function ScanScreen({ navigation }) {
  const { activeVehicle, isConnectedToOBD, connectedDevice, subscription } = useSelector(s => s.app);
  const dispatch = useDispatch();
  const [scanning, setScanning] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [devices, setDevices] = useState([]);
  const [showDevices, setShowDevices] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanPhase, setScanPhase] = useState('');
  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  const browserInfo = Platform.OS === 'web' ? getBrowserInfo() : null;
  const bluetoothUnavailable = Platform.OS === 'web' ? getBluetoothUnavailableMessage() : null;

  React.useEffect(() => {
    if (scanning) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.3, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [scanning]);

  const handleScanForDevices = async () => {
    setConnecting(true);
    setShowDevices(true);
    try {
      const foundDevices = await obdService.scanForDevices();
      setDevices(foundDevices);
      if (foundDevices.length === 0) {
        Alert.alert('No Devices Found', 'Make sure your OBD-II Bluetooth adapter is plugged into the port under your dashboard (usually near the steering wheel) and turned on.');
      }
    } catch (err) {
      Alert.alert('Scan Error', err.message || 'Could not scan. Make sure Bluetooth is enabled on your phone.');
    }
    setConnecting(false);
  };

  const handleConnectDevice = async (device) => {
    setConnecting(true);
    try {
      await obdService.connectToDevice(device);
      await obdService.initializeOBD();
      const vehicleInfo = obdService.vehicleInfo;
      dispatch(setOBDConnection({ connected: true, device: device.name || 'OBD Adapter' }));
      setShowDevices(false);
      Alert.alert(
        'Connected to Your Car!',
        `Successfully connected. Battery system detected and ready to scan.\n\nWorks with any car that has an OBD-II port (all cars since 1996).`
      );
    } catch (err) {
      Alert.alert('Connection Failed', 'Could not connect. Make sure the adapter is plugged in and close to your phone.');
    }
    setConnecting(false);
  };

  const handleStartScan = async () => {
    if (!activeVehicle) {
      Alert.alert('No Vehicle', 'Please add a vehicle first before scanning.');
      return;
    }

    const canScan = await SubscriptionService.canScan();
    if (!canScan) {
      const remaining = await SubscriptionService.getScansRemaining();
      if (remaining <= 0) {
        Alert.alert('Scan Limit Reached', 'You\'ve used all your free scans for today. Upgrade to Basic for unlimited scans.', [
          { text: 'Upgrade', onPress: () => navigation.navigate('Subscription') },
          { text: 'Later' },
        ]);
        return;
      }
    }

    setScanning(true);
    setScanProgress(0);
    setScanPhase('Connecting to battery system...');

    try {
      if (!isConnectedToOBD) {
        setScanPhase('Initializing connection...');
        setScanProgress(10);
        await new Promise(r => setTimeout(r, 500));
      }

      setScanPhase('Reading battery voltage...');
      setScanProgress(30);
      await new Promise(r => setTimeout(r, 400));

      let scanData;
      if (isConnectedToOBD) {
        scanData = await obdService.performFullScan();
      } else {
        scanData = {
          voltage: 12.0 + Math.random() * 0.8,
          soc: Math.round(50 + Math.random() * 50),
          ambientTemp: Math.round(15 + Math.random() * 20),
          engineRPM: 0,
          chargingVoltage: 12.4 + Math.random() * 1.5,
          timestamp: new Date().toISOString(),
        };
      }

      setScanPhase('Analyzing battery health...');
      setScanProgress(60);
      await new Promise(r => setTimeout(r, 500));

      setScanPhase('Checking charging system...');
      setScanProgress(80);
      await new Promise(r => setTimeout(r, 400));

      setScanPhase('Generating report...');
      setScanProgress(95);
      await new Promise(r => setTimeout(r, 300));

      const healthPercent = BatteryAnalyzer.getHealthPercent(scanData.voltage, scanData.cca, activeVehicle?.designCca);
      const status = BatteryAnalyzer.getStatus(healthPercent);

      dispatch(setLastScan({
        ...scanData,
        healthPercent,
        status,
        vehicleId: activeVehicle.id,
      }));

      await SubscriptionService.recordScan();

      setScanProgress(100);
      setScanPhase('Complete!');

      if (healthPercent < 15) {
        await NotificationService.sendCriticalBatteryAlert(healthPercent);
      } else if (healthPercent < 30) {
        await NotificationService.sendLowBatteryAlert(healthPercent);
      }

      setTimeout(() => {
        setScanning(false);
        navigation.navigate('BatteryDetail', { healthPercent, status });
      }, 600);

    } catch (err) {
      setScanning(false);
      Alert.alert('Scan Error', 'An error occurred during the scan. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Battery Scan</Text>
        <Text style={styles.subtitle}>Connect to your vehicle and scan the battery system</Text>
      </View>

      {bluetoothUnavailable && (
        <View style={styles.browserBanner}>
          <MaterialCommunityIcons name="information-outline" size={20} color={COLORS.warning} />
          <View style={styles.browserBannerText}>
            <Text style={styles.browserBannerTitle}>{bluetoothUnavailable.title}</Text>
            <Text style={styles.browserBannerDesc}>{bluetoothUnavailable.message}</Text>
          </View>
        </View>
      )}

      <View style={styles.mainContent}>
        <Animated.View style={[styles.scanCircle, { transform: [{ scale: pulseAnim }] }, scanning && styles.scanCircleActive]}>
          <TouchableOpacity
            style={styles.scanButton}
            onPress={isConnectedToOBD ? handleStartScan : handleScanForDevices}
            disabled={scanning || connecting}
          >
            {scanning ? (
              <View style={styles.scanningInner}>
                <MaterialCommunityIcons name="car-battery" size={48} color={COLORS.primary} />
              </View>
            ) : connecting ? (
              <ActivityIndicator size="large" color={COLORS.primary} />
            ) : (
              <>
                <MaterialCommunityIcons
                  name={isConnectedToOBD ? "car-battery" : "bluetooth-connect"}
                  size={48}
                  color={COLORS.primary}
                />
              </>
            )}
          </TouchableOpacity>
        </Animated.View>

        {scanning && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <LinearGradient
                colors={[COLORS.primary, COLORS.accent]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.progressFill, { width: `${scanProgress}%` }]}
              />
            </View>
            <Text style={styles.progressText}>{scanProgress}%</Text>
            <Text style={styles.phaseText}>{scanPhase}</Text>
          </View>
        )}

        {!scanning && (
          <View style={styles.statusArea}>
            {isConnectedToOBD ? (
              <View style={styles.connectedStatus}>
                <MaterialCommunityIcons name="bluetooth-connected" size={20} color={COLORS.success} />
                <Text style={styles.connectedText}>Connected to {connectedDevice}</Text>
              </View>
            ) : (
              <Text style={styles.instructionText}>
                Tap the button above to scan for your OBD-II Bluetooth adapter, or tap "Quick Scan" below for a demo scan.
              </Text>
            )}
          </View>
        )}
      </View>

      {showDevices && !scanning && (
        <View style={styles.devicesPanel}>
          <Text style={styles.devicesTitle}>Found Devices</Text>
          {connecting && <ActivityIndicator color={COLORS.primary} style={{ marginTop: 10 }} />}
          {devices.map((device, i) => (
            <TouchableOpacity key={device.id || i} style={styles.deviceItem} onPress={() => handleConnectDevice(device)}>
              <MaterialCommunityIcons name="bluetooth" size={20} color={COLORS.primary} />
              <View style={styles.deviceInfo}>
                <Text style={styles.deviceName}>{device.name || 'Unknown Device'}</Text>
                <Text style={styles.deviceId}>{device.id}</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          ))}
        </View>
      )}

      {!scanning && (
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickScanButton} onPress={handleStartScan}>
            <MaterialCommunityIcons name="flash" size={20} color={COLORS.warning} />
            <Text style={styles.quickScanText}>Quick Scan (Demo)</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.disconnectButton} onPress={() => {
            obdService.disconnect();
            dispatch(setOBDConnection({ connected: false, device: null }));
          }}>
            <MaterialCommunityIcons name="bluetooth-off" size={20} color={COLORS.danger} />
            <Text style={styles.disconnectText}>Disconnect</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.tipsSection}>
        <Text style={styles.tipsTitle}>How It Works</Text>
        <TipRow icon="information" text="Works with ANY car - just plug in an OBD-II Bluetooth adapter" />
        <TipRow icon="car" text="Plug the adapter into the port under your dashboard" />
        <TipRow icon="bluetooth" text="Turn on Bluetooth, tap Scan to find your adapter" />
        <TipRow icon="engine" text="For best results, scan with the engine running" />
        <TipRow icon="shield-check" text="Compatible with all cars since 1996 (OBD-II standard)" />
      </View>
    </View>
  );
}

function TipRow({ icon, text }) {
  return (
    <View style={tipStyles.row}>
      <MaterialCommunityIcons name={icon} size={16} color={COLORS.textMuted} />
      <Text style={tipStyles.text}>{text}</Text>
    </View>
  );
}

const tipStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  text: { fontSize: 13, color: COLORS.textSecondary, flex: 1 },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, paddingHorizontal: 20, paddingTop: 50 },
  header: { marginBottom: 24 },
  title: { fontSize: 28, fontWeight: '800', color: COLORS.text },
  subtitle: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4 },
  mainContent: { alignItems: 'center', paddingVertical: 20 },
  scanCircle: { width: 160, height: 160, borderRadius: 80, borderWidth: 3, borderColor: COLORS.primary + '40', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.primary + '10' },
  scanCircleActive: { borderColor: COLORS.primary },
  scanButton: { width: 140, height: 140, borderRadius: 70, backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center' },
  scanningInner: { alignItems: 'center', justifyContent: 'center' },
  progressContainer: { alignItems: 'center', marginTop: 24, width: '100%' },
  progressBar: { width: '80%', height: 8, backgroundColor: COLORS.surfaceLight, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  progressText: { fontSize: 28, fontWeight: '800', color: COLORS.primary, marginTop: 12 },
  phaseText: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4 },
  statusArea: { marginTop: 16, alignItems: 'center' },
  connectedStatus: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: COLORS.success + '15', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  connectedText: { fontSize: 14, color: COLORS.success, fontWeight: '600' },
  instructionText: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', paddingHorizontal: 20 },
  devicesPanel: { backgroundColor: COLORS.surface, borderRadius: 14, padding: 16, marginTop: 20, borderWidth: 1, borderColor: COLORS.border },
  devicesTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 8 },
  deviceItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border, gap: 12 },
  deviceInfo: { flex: 1 },
  deviceName: { fontSize: 15, fontWeight: '600', color: COLORS.text },
  deviceId: { fontSize: 12, color: COLORS.textMuted },
  quickActions: { flexDirection: 'row', gap: 12, marginTop: 20 },
  quickScanButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.warning + '15', borderRadius: 12, paddingVertical: 14, gap: 8, borderWidth: 1, borderColor: COLORS.warning + '30' },
  quickScanText: { fontSize: 14, fontWeight: '600', color: COLORS.warning },
  disconnectButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.danger + '15', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 16, gap: 6, borderWidth: 1, borderColor: COLORS.danger + '30' },
  disconnectText: { fontSize: 14, fontWeight: '600', color: COLORS.danger },
  browserBanner: { flexDirection: 'row', backgroundColor: COLORS.warning + '15', borderRadius: 12, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: COLORS.warning + '30', gap: 10, alignItems: 'flex-start' },
  browserBannerText: { flex: 1 },
  browserBannerTitle: { fontSize: 13, fontWeight: '700', color: COLORS.warning },
  browserBannerDesc: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2, lineHeight: 16 },
  tipsSection: { marginTop: 24, backgroundColor: COLORS.surface, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: COLORS.border },
  tipsTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 12 },
});
