import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { COLORS } from '../utils/constants';
import BatteryAnalyzer from '../services/batteryAnalyzer';

export default function ReportsScreen({ navigation }) {
  const { lastScan, activeVehicle, scanHistory, subscription } = useSelector(s => s.app);
  const healthPercent = lastScan ? BatteryAnalyzer.getHealthPercent(lastScan.voltage, lastScan.cca, activeVehicle?.designCca) : 0;
  const report = lastScan && activeVehicle ? BatteryAnalyzer.generateReport(lastScan, activeVehicle) : null;

  const handleExport = () => {
    Alert.alert('Report Generated', 'Your battery health report has been generated. In a production app, this would be exported as a PDF and emailed to you.');
  };

  const handleShare = () => {
    Alert.alert('Share Report', 'Share your battery health report with your mechanic or for your records.');
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {report ? (
        <>
          <View style={styles.reportHeader}>
            <View style={styles.headerTop}>
              <Text style={styles.reportTitle}>Battery Health Report</Text>
              <Text style={styles.reportDate}>{new Date().toLocaleDateString()}</Text>
            </View>
            <Text style={styles.vehicleName}>{activeVehicle?.name} - {activeVehicle?.year} {activeVehicle?.make} {activeVehicle?.model}</Text>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Overall Health</Text>
              <Text style={[styles.summaryValue, { color: report.status.color }]}>{healthPercent}%</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Status</Text>
              <Text style={[styles.summaryValue, { color: report.status.color }]}>{report.status.label}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Voltage</Text>
              <Text style={styles.summaryValue}>{report.voltage?.toFixed(2)}V</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Voltage Status</Text>
              <Text style={styles.summaryValue}>{report.voltageStatus?.label}</Text>
            </View>
            {report.cca && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Cold Cranking Amps</Text>
                <Text style={styles.summaryValue}>{report.cca} A</Text>
              </View>
            )}
            {report.temperature !== null && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Temperature</Text>
                <Text style={styles.summaryValue}>{report.temperature}°C</Text>
              </View>
            )}
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Prediction</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Estimated Remaining Life</Text>
              <Text style={styles.summaryValue}>{report.prediction?.estimatedMonths || 0} months</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Analysis Confidence</Text>
              <Text style={styles.summaryValue}>{report.prediction?.confidence || 'medium'}</Text>
            </View>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Recommendation</Text>
            <Text style={styles.recommendationText}>{report.recommendation}</Text>
          </View>

          <View style={styles.exportSection}>
            <TouchableOpacity style={styles.exportButton} onPress={handleExport}>
              <MaterialCommunityIcons name="file-pdf-box" size={20} color={COLORS.white} />
              <Text style={styles.exportButtonText}>Export PDF</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
              <MaterialCommunityIcons name="share-variant" size={20} color={COLORS.primary} />
              <Text style={styles.shareButtonText}>Share</Text>
            </TouchableOpacity>
          </View>

          {subscription?.tier === 'FREE' && (
            <View style={styles.upgradeCard}>
              <MaterialCommunityIcons name="star" size={24} color={COLORS.primary} />
              <View style={styles.upgradeInfo}>
                <Text style={styles.upgradeTitle}>Need More Reports?</Text>
                <Text style={styles.upgradeDesc}>Upgrade to Basic for detailed PDF reports or Advanced for auto-emailed reports.</Text>
              </View>
            </View>
          )}
        </>
      ) : (
        <View style={styles.empty}>
          <MaterialCommunityIcons name="file-document-outline" size={64} color={COLORS.textMuted} />
          <Text style={styles.emptyTitle}>No Report Available</Text>
          <Text style={styles.emptySubtitle}>Scan your battery first to generate a report</Text>
          <TouchableOpacity style={styles.scanButton} onPress={() => navigation.navigate('Scan')}>
            <Text style={styles.scanButtonText}>Go to Scan</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, paddingHorizontal: 20, paddingTop: 20 },
  reportHeader: { marginBottom: 20 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  reportTitle: { fontSize: 24, fontWeight: '800', color: COLORS.text },
  reportDate: { fontSize: 13, color: COLORS.textSecondary },
  vehicleName: { fontSize: 14, color: COLORS.primary, marginTop: 4 },
  summaryCard: { backgroundColor: COLORS.surface, borderRadius: 14, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: COLORS.border },
  summaryTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 12 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  summaryLabel: { fontSize: 14, color: COLORS.textSecondary },
  summaryValue: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  recommendationText: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 22 },
  exportSection: { flexDirection: 'row', gap: 12, marginTop: 10 },
  exportButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 14, gap: 8 },
  exportButtonText: { fontSize: 15, fontWeight: '700', color: COLORS.white },
  shareButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.primary + '15', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 20, gap: 8, borderWidth: 1, borderColor: COLORS.primary + '30' },
  shareButtonText: { fontSize: 15, fontWeight: '700', color: COLORS.primary },
  upgradeCard: { flexDirection: 'row', backgroundColor: COLORS.surface, borderRadius: 14, padding: 16, marginTop: 14, borderWidth: 1, borderColor: COLORS.border, gap: 12 },
  upgradeInfo: { flex: 1 },
  upgradeTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  upgradeDesc: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2, lineHeight: 18 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 60, gap: 12 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text },
  emptySubtitle: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center' },
  scanButton: { backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 14, paddingHorizontal: 24, marginTop: 16 },
  scanButtonText: { fontSize: 15, fontWeight: '700', color: COLORS.white },
});
