import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { COLORS } from '../utils/constants';
import BatteryAnalyzer from '../services/batteryAnalyzer';

export default function HistoryScreen() {
  const { scanHistory, activeVehicle } = useSelector(s => s.app);
  const [filter, setFilter] = useState('all');

  const getFilteredHistory = () => {
    if (filter === 'all') return scanHistory;
    if (filter === 'good') return scanHistory.filter(s => BatteryAnalyzer.getHealthPercent(s.voltage, s.cca, activeVehicle?.designCca) >= 70);
    if (filter === 'bad') return scanHistory.filter(s => BatteryAnalyzer.getHealthPercent(s.voltage, s.cca, activeVehicle?.designCca) < 50);
    return scanHistory;
  };

  const filtered = getFilteredHistory();

  const renderScanItem = ({ item, index }) => {
    const health = BatteryAnalyzer.getHealthPercent(item.voltage, item.cca, activeVehicle?.designCca);
    const status = BatteryAnalyzer.getStatus(health);

    return (
      <View style={styles.scanItem}>
        <View style={[styles.dot, { backgroundColor: status.color }]} />
        <View style={styles.scanInfo}>
          <View style={styles.scanHeader}>
            <Text style={styles.scanHealth}>{health}%</Text>
            <Text style={[styles.scanStatus, { color: status.color }]}>{status.label}</Text>
          </View>
          <Text style={styles.scanVoltage}>{item.voltage?.toFixed(2)}V</Text>
          <Text style={styles.scanDate}>{new Date(item.timestamp).toLocaleString()}</Text>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={20} color={COLORS.textMuted} />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.filters}>
        {['all', 'good', 'bad'].map(f => (
          <TouchableOpacity key={f} style={[styles.filterBtn, filter === f && styles.filterActive]} onPress={() => setFilter(f)}>
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f === 'all' ? 'All' : f === 'good' ? 'Good' : 'Poor'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {filtered.length === 0 ? (
        <View style={styles.empty}>
          <MaterialCommunityIcons name="history" size={48} color={COLORS.textMuted} />
          <Text style={styles.emptyTitle}>No Scan History</Text>
          <Text style={styles.emptySubtitle}>Start scanning your battery to build history</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          renderItem={renderScanItem}
          keyExtractor={(_, i) => i.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, paddingHorizontal: 20, paddingTop: 20 },
  filters: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  filterBtn: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  filterActive: { backgroundColor: COLORS.primary + '20', borderColor: COLORS.primary },
  filterText: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary },
  filterTextActive: { color: COLORS.primary },
  scanItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: 12, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: COLORS.border, gap: 14 },
  dot: { width: 12, height: 12, borderRadius: 6 },
  scanInfo: { flex: 1 },
  scanHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  scanHealth: { fontSize: 18, fontWeight: '800', color: COLORS.text },
  scanStatus: { fontSize: 13, fontWeight: '600' },
  scanVoltage: { fontSize: 14, color: COLORS.textSecondary, marginTop: 2 },
  scanDate: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text },
  emptySubtitle: { fontSize: 14, color: COLORS.textSecondary },
});
