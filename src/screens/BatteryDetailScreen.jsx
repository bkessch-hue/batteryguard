import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { COLORS, VOLTAGE_RANGES } from '../utils/constants';
import BatteryGauge from '../components/BatteryGauge';
import HealthIndicator from '../components/HealthIndicator';
import BatteryAnalyzer from '../services/batteryAnalyzer';

export default function BatteryDetailScreen({ route, navigation }) {
  const { lastScan, activeVehicle, scanHistory } = useSelector(s => s.app);
  const healthPercent = lastScan ? BatteryAnalyzer.getHealthPercent(lastScan.voltage, lastScan.cca, activeVehicle?.designCca) : 0;
  const status = lastScan ? BatteryAnalyzer.getStatus(healthPercent) : null;
  const voltageStatus = lastScan ? BatteryAnalyzer.getVoltageStatus(lastScan.voltage) : null;
  const prediction = lastScan ? BatteryAnalyzer.predictRemainingLife(lastScan.voltage, lastScan.cca, activeVehicle?.designCca, activeVehicle?.batteryAgeMonths || 12) : null;
  const chargingStatus = lastScan?.chargingVoltage ? BatteryAnalyzer.analyzeChargeSystem(lastScan.chargingVoltage) : null;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.gaugeSection}>
        <BatteryGauge healthPercent={healthPercent} size={200} />
        {status && <HealthIndicator status={status} color={status.color} size="large" />}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Voltage Analysis</Text>
        <View style={styles.infoCard}>
          <InfoRow label="Battery Voltage" value={`${lastScan?.voltage?.toFixed(2) || '--'}V`} />
          <InfoRow label="Status" value={voltageStatus?.label || '--'} color={COLORS.primary} />
          <InfoRow label="State of Charge" value={`${lastScan?.soc || '--'}%`} />
          <InfoRow label="Ambient Temperature" value={`${lastScan?.ambientTemp || '--'}°C`} />
          <InfoRow label="Engine RPM" value={lastScan?.engineRPM || '0'} />
        </View>
      </View>

      {chargingStatus && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Charging System</Text>
          <View style={[styles.infoCard, { borderColor: chargingStatus.color + '40' }]}>
            <View style={styles.chargingRow}>
              <MaterialCommunityIcons name="car-battery" size={24} color={chargingStatus.color} />
              <Text style={[styles.chargingLabel, { color: chargingStatus.color }]}>{chargingStatus.label}</Text>
            </View>
            <InfoRow label="Alternator Output" value={`${lastScan?.chargingVoltage?.toFixed(1) || '--'}V`} />
          </View>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Battery Prediction</Text>
        <View style={styles.infoCard}>
          <View style={styles.predictionRow}>
            <MaterialCommunityIcons name="clock-outline" size={20} color={COLORS.warning} />
            <Text style={styles.predictionText}>
              Estimated {prediction?.estimatedMonths || 0} months remaining
            </Text>
          </View>
          <View style={styles.predictionRow}>
            <MaterialCommunityIcons name="chart-line" size={20} color={COLORS.primary} />
            <Text style={styles.predictionText}>
              Confidence: {prediction?.confidence || 'medium'}
            </Text>
          </View>
          <View style={styles.predictionRow}>
            <MaterialCommunityIcons
              name={prediction?.recommendation === 'GOOD_CONDITION' ? 'check-circle' : prediction?.recommendation === 'REPLACE_SOON' ? 'alert' : 'alert-circle'}
              size={20}
              color={prediction?.recommendation === 'GOOD_CONDITION' ? COLORS.success : prediction?.recommendation === 'REPLACE_SOON' ? COLORS.warning : COLORS.danger}
            />
            <Text style={styles.predictionText}>
              {BatteryAnalyzer.getRecommendation(healthPercent, prediction)}
            </Text>
          </View>
        </View>
      </View>

      {scanHistory.length > 1 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Scans</Text>
          {scanHistory.slice(0, 5).map((scan, i) => {
            const scanHealth = BatteryAnalyzer.getHealthPercent(scan.voltage, scan.cca, activeVehicle?.designCca);
            const scanStatus = BatteryAnalyzer.getStatus(scanHealth);
            return (
              <View key={i} style={styles.historyItem}>
                <View style={[styles.historyDot, { backgroundColor: scanStatus.color }]} />
                <View style={styles.historyInfo}>
                  <Text style={styles.historyValue}>{scan.voltage?.toFixed(2)}V - {scanHealth}%</Text>
                  <Text style={styles.historyDate}>{new Date(scan.timestamp).toLocaleString()}</Text>
                </View>
              </View>
            );
          })}
        </View>
      )}

      <TouchableOpacity style={styles.reportButton} onPress={() => navigation.navigate('Reports')}>
        <MaterialCommunityIcons name="file-document-outline" size={20} color={COLORS.white} />
        <Text style={styles.reportButtonText}>Generate Full Report</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

function InfoRow({ label, value, color }) {
  return (
    <View style={rowStyles.row}>
      <Text style={rowStyles.label}>{label}</Text>
      <Text style={[rowStyles.value, color && { color }]}>{value}</Text>
    </View>
  );
}

const rowStyles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  label: { fontSize: 14, color: COLORS.textSecondary },
  value: { fontSize: 14, fontWeight: '700', color: COLORS.text },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, paddingHorizontal: 20, paddingTop: 20 },
  gaugeSection: { alignItems: 'center', paddingVertical: 20, gap: 12 },
  section: { marginTop: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: 12 },
  infoCard: { backgroundColor: COLORS.surface, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: COLORS.border },
  chargingRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  chargingLabel: { fontSize: 15, fontWeight: '700' },
  predictionRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 12 },
  predictionText: { fontSize: 14, color: COLORS.textSecondary, flex: 1, lineHeight: 20 },
  historyItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  historyDot: { width: 10, height: 10, borderRadius: 5 },
  historyInfo: { flex: 1 },
  historyValue: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  historyDate: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  reportButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.primary, borderRadius: 14, paddingVertical: 16, gap: 8, marginTop: 24 },
  reportButtonText: { fontSize: 15, fontWeight: '700', color: COLORS.white },
});
