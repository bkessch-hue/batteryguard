import React, { useState } from 'react';
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
  const rotateAnim = React.useRef(new Animated.Value(0)).current;
  const ringAnim = React.useRef(new Animated.Value(0)).current;

  const browserInfo = Platform.OS === 'web' ? getBrowserInfo() : null;
  const bluetoothUnavailable = Platform.OS === 'web' ? getBluetoothUnavailableMessage() : null;

  React.useEffect(() => {
    if (scanning) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.15, duration: 900, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
        ])
      ).start();
      Animated.loop(
        Animated.timing(rotateAnim, { toValue: 1, duration: 3000, useNativeDriver: true })
      ).start();
      Animated.loop(
        Animated.sequence([
          Animated.timing(ringAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
          Animated.timing(ringAnim, { toValue: 0, duration: 1500, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
      rotateAnim.setValue(0);
      ringAnim.setValue(0);
    }
  }, [scanning]);

  const spin = rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const ringScale = ringAnim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1.3] });
  const ringOpacity = ringAnim.interpolate({ inputRange: [0, 1], outputRange: [0.6, 0] });

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
      dispatch(setOBDConnection({ connected: true, device: device.name || 'OBD Adapter' }));
      setShowDevices(false);
      Alert.alert('Connected to Your Car!', 'Successfully connected. Battery system detected and ready to scan.');
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
        Alert.alert('Scan Limit Reached', "You've used all your free scans for today. Upgrade to Basic for unlimited scans.", [
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
      dispatch(setLastScan({ ...scanData, healthPercent, status, vehicleId: activeVehicle.id }));
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
      <View style={styles.bgOrb1} />
      <View style={styles.bgOrb2} />

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
        <View style={styles.scanArea}>
          {scanning && (
            <Animated.View style={[styles.scanRing, { transform: [{ scale: ringScale }], opacity: ringOpacity }]} />
          )}
          {scanning && (
            <Animated.View style={[styles.scanRingOuter, { transform: [{ rotate: spin }] }]}>
              <View style={styles.scanDot} style={[styles.scanDot, { top: 0, left: '50%' }]} />
            </Animated.View>
          )}

          <Animated.View style={[styles.scanCircle, { transform: [{ scale: pulseAnim }] }, scanning && styles.scanCircleActive]}>
            <TouchableOpacity
              style={styles.scanButton}
              onPress={isConnectedToOBD ? handleStartScan : handleScanForDevices}
              disabled={scanning || connecting}
            >
              {scanning ? (
                <View style={styles.scanningInner}>
                  <LinearGradient colors={['rgba(0,212,255,0.2)', 'rgba(0,212,255,0.05)']} style={styles.scanningGrad}>
                    <MaterialCommunityIcons name="car-battery" size={44} color={COLORS.primary} />
                  </LinearGradient>
                </View>
              ) : connecting ? (
                <ActivityIndicator size="large" color={COLORS.primary} />
              ) : (
                <LinearGradient colors={['rgba(0,212,255,0.15)', 'rgba(0,212,255,0.05)']} style={styles.scanBtnGrad}>
                  <MaterialCommunityIcons
                    name={isConnectedToOBD ? "car-battery" : "bluetooth-connect"}
                    size={44}
                    color={COLORS.primary}
                  />
                </LinearGradient>
              )}
            </TouchableOpacity>
          </Animated.View>
        </View>

        {scanning && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBarBg}>
              <LinearGradient
                colors={['#00D4FF', '#00E676', '#7C4DFF']}
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
                <MaterialCommunityIcons name="bluetooth-connected" size={18} color={COLORS.accent} />
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
              <View style={styles.deviceIconBox}>
                <MaterialCommunityIcons name="bluetooth" size={18} color={COLORS.primary} />
              </View>
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
            <LinearGradient colors={['rgba(255,145,0,0.15)', 'rgba(255,145,0,0.05)']} style={styles.quickBtnGrad}>
              <MaterialCommunityIcons name="flash" size={20} color={COLORS.warning} />
              <Text style={styles.quickScanText}>Quick Scan (Demo)</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity style={styles.disconnectButton} onPress={() => {
            obdService.disconnect();
            dispatch(setOBDConnection({ connected: false, device: null }));
          }}>
            <LinearGradient colors={['rgba(255,23,68,0.15)', 'rgba(255,23,68,0.05)']} style={styles.quickBtnGrad}>
              <MaterialCommunityIcons name="bluetooth-off" size={20} color={COLORS.danger} />
              <Text style={styles.disconnectText}>Disconnect</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.tipsSection}>
        <Text style={styles.tipsTitle}>How It Works</Text>
        <TipRow icon="information" text="Works with ANY car - just plug in an OBD-II Bluetooth adapter" num="1" />
        <TipRow icon="car" text="Plug the adapter into the port under your dashboard" num="2" />
        <TipRow icon="bluetooth" text="Turn on Bluetooth, tap Scan to find your adapter" num="3" />
        <TipRow icon="engine" text="For best results, scan with the engine running" num="4" />
        <TipRow icon="shield-check" text="Compatible with all cars since 1996 (OBD-II standard)" num="5" />
      </View>
    </View>
  );
}

function TipRow({ icon, text, num }) {
  return (
    <View style={tipStyles.row}>
      <View style={tipStyles.numBox}>
        <Text style={tipStyles.num}>{num}</Text>
      </View>
      <Text style={tipStyles.text}>{text}</Text>
    </View>
  );
}

const tipStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 12 },
  numBox: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: 'rgba(0,212,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  num: { fontSize: 12, fontWeight: '700', color: COLORS.primary },
  text: { fontSize: 13, color: COLORS.textSecondary, flex: 1, lineHeight: 18 },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050816', paddingHorizontal: 20, paddingTop: 50, overflow: 'hidden' },
  bgOrb1: { position: 'absolute', top: -40, left: -60, width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(0,212,255,0.04)' },
  bgOrb2: { position: 'absolute', bottom: 80, right: -50, width: 150, height: 150, borderRadius: 75, backgroundColor: 'rgba(124,77,255,0.03)' },
  header: { marginBottom: 20 },
  title: { fontSize: 28, fontWeight: '800', color: COLORS.text },
  subtitle: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4 },
  mainContent: { alignItems: 'center', paddingVertical: 16 },
  scanArea: { width: 200, height: 200, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  scanRing: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  scanRingOuter: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(0,212,255,0.3)',
    borderStyle: 'dashed',
  },
  scanCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 2,
    borderColor: 'rgba(0,212,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,212,255,0.05)',
  },
  scanCircleActive: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(0,212,255,0.1)',
  },
  scanButton: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(21,26,48,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,212,255,0.2)',
  },
  scanningInner: { alignItems: 'center', justifyContent: 'center' },
  scanningGrad: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center' },
  scanBtnGrad: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center' },
  progressContainer: { alignItems: 'center', marginTop: 20, width: '100%' },
  progressBarBg: { width: '85%', height: 8, backgroundColor: 'rgba(30,35,69,0.8)', borderRadius: 4, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(42,47,74,0.5)' },
  progressFill: { height: '100%', borderRadius: 4 },
  progressText: { fontSize: 32, fontWeight: '800', color: COLORS.primary, marginTop: 14 },
  phaseText: { fontSize: 13, color: COLORS.textSecondary, marginTop: 6 },
  statusArea: { marginTop: 16, alignItems: 'center' },
  connectedStatus: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(0,230,118,0.12)', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(0,230,118,0.25)' },
  connectedText: { fontSize: 14, color: COLORS.accent, fontWeight: '600' },
  instructionText: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', paddingHorizontal: 16, lineHeight: 20 },
  devicesPanel: { backgroundColor: 'rgba(21,26,48,0.8)', borderRadius: 16, padding: 16, marginTop: 16, borderWidth: 1, borderColor: 'rgba(42,47,74,0.6)' },
  devicesTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 10 },
  deviceItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(42,47,74,0.5)', gap: 12 },
  deviceIconBox: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(0,212,255,0.12)', alignItems: 'center', justifyContent: 'center' },
  deviceInfo: { flex: 1 },
  deviceName: { fontSize: 15, fontWeight: '600', color: COLORS.text },
  deviceId: { fontSize: 11, color: COLORS.textMuted, marginTop: 1 },
  quickActions: { flexDirection: 'row', gap: 10, marginTop: 16 },
  quickScanButton: { flex: 1, borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,145,0,0.3)' },
  quickBtnGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, gap: 8 },
  quickScanText: { fontSize: 14, fontWeight: '600', color: COLORS.warning },
  disconnectButton: { borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,23,68,0.3)' },
  disconnectText: { fontSize: 14, fontWeight: '600', color: COLORS.danger },
  browserBanner: { flexDirection: 'row', backgroundColor: 'rgba(255,145,0,0.1)', borderRadius: 14, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(255,145,0,0.25)', gap: 10, alignItems: 'flex-start' },
  browserBannerText: { flex: 1 },
  browserBannerTitle: { fontSize: 13, fontWeight: '700', color: COLORS.warning },
  browserBannerDesc: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2, lineHeight: 16 },
  tipsSection: { marginTop: 20, backgroundColor: 'rgba(21,26,48,0.6)', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(42,47,74,0.5)' },
  tipsTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 14 },
});
