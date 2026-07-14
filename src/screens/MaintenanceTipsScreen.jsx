import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, MAINTENANCE_TIPS } from '../utils/constants';
import { useSelector } from 'react-redux';
import BatteryAnalyzer from '../services/batteryAnalyzer';

export default function MaintenanceTipsScreen() {
  const { lastScan, activeVehicle, subscription } = useSelector(s => s.app);
  const [selectedSeason, setSelectedSeason] = useState('general');

  const currentMonth = new Date().getMonth();
  const isWinter = currentMonth >= 10 || currentMonth <= 2;
  const isSummer = currentMonth >= 4 && currentMonth <= 8;

  const seasonOptions = [
    { key: 'general', label: 'General', icon: 'wrench' },
    { key: 'winter', label: 'Winter', icon: 'snowflake' },
    { key: 'summer', label: 'Summer', icon: 'white-balance-sunny' },
  ];

  const tips = MAINTENANCE_TIPS[selectedSeason] || MAINTENANCE_TIPS.general;

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return COLORS.danger;
      case 'medium': return COLORS.warning;
      case 'low': return COLORS.success;
      default: return COLORS.textSecondary;
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {lastScan ? (
        <View style={styles.quickStatus}>
          <MaterialCommunityIcons name="information-circle" size={20} color={COLORS.primary} />
          <Text style={styles.quickStatusText}>
            {selectedSeason === 'winter' && 'Cold weather can reduce battery capacity by up to 50%.'}
            {selectedSeason === 'summer' && 'High temperatures can shorten battery life by up to 2x.'}
            {selectedSeason === 'general' && `Your battery is currently at ${BatteryAnalyzer.getHealthPercent(lastScan.voltage, lastScan.cca, activeVehicle?.designCca)}% health.`}
          </Text>
        </View>
      ) : null}

      <View style={styles.seasonTabs}>
        {seasonOptions.map(s => (
          <TouchableOpacity
            key={s.key}
            style={[styles.seasonTab, selectedSeason === s.key && styles.seasonTabActive]}
            onPress={() => setSelectedSeason(s.key)}
          >
            <MaterialCommunityIcons name={s.icon} size={18} color={selectedSeason === s.key ? COLORS.primary : COLORS.textMuted} />
            <Text style={[styles.seasonLabel, selectedSeason === s.key && styles.seasonLabelActive]}>
              {s.label}
            </Text>
            {s.key === 'winter' && isWinter && <View style={styles.currentBadge} />}
            {s.key === 'summer' && isSummer && <View style={styles.currentBadge} />}
          </TouchableOpacity>
        ))}
      </View>

      {tips.map((tip, index) => (
        <View key={index} style={styles.tipCard}>
          <View style={styles.tipHeader}>
            <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(tip.priority) + '20' }]}>
              <Text style={[styles.priorityText, { color: getPriorityColor(tip.priority) }]}>
                {tip.priority.toUpperCase()}
              </Text>
            </View>
          </View>
          <Text style={styles.tipTitle}>{tip.title}</Text>
          <Text style={styles.tipDesc}>{tip.desc}</Text>
        </View>
      ))}

      <View style={styles.aiSection}>
        <MaterialCommunityIcons name="robot-outline" size={24} color={COLORS.secondary} />
        <View style={styles.aiContent}>
          <Text style={styles.aiTitle}>AI-Powered Tips</Text>
          <Text style={styles.aiDesc}>
            {subscription?.tier === 'ADVANCED'
              ? 'Get personalized maintenance tips based on your battery data and driving patterns.'
              : 'Upgrade to Advanced for AI-powered personalized maintenance tips.'}
          </Text>
        </View>
      </View>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, paddingHorizontal: 20, paddingTop: 20 },
  quickStatus: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primary + '10', borderRadius: 12, padding: 14, marginBottom: 20, gap: 10 },
  quickStatusText: { fontSize: 13, color: COLORS.textSecondary, flex: 1, lineHeight: 18 },
  seasonTabs: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  seasonTab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.surface, borderRadius: 12, paddingVertical: 12, gap: 6, borderWidth: 1, borderColor: COLORS.border },
  seasonTabActive: { backgroundColor: COLORS.primary + '15', borderColor: COLORS.primary },
  seasonLabel: { fontSize: 13, fontWeight: '600', color: COLORS.textMuted },
  seasonLabelActive: { color: COLORS.primary },
  currentBadge: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.primary },
  tipCard: { backgroundColor: COLORS.surface, borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border },
  tipHeader: { flexDirection: 'row', justifyContent: 'flex-start', marginBottom: 8 },
  priorityBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  priorityText: { fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  tipTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 6 },
  tipDesc: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 20 },
  aiSection: { flexDirection: 'row', backgroundColor: COLORS.secondary + '10', borderRadius: 14, padding: 16, marginTop: 10, borderWidth: 1, borderColor: COLORS.secondary + '30', gap: 12 },
  aiContent: { flex: 1 },
  aiTitle: { fontSize: 15, fontWeight: '700', color: COLORS.secondary },
  aiDesc: { fontSize: 13, color: COLORS.textSecondary, marginTop: 4, lineHeight: 18 },
});
