import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../utils/constants';

export default function VehicleCard({ vehicle, isActive, onSelect }) {
  return (
    <TouchableOpacity
      style={[styles.container, isActive && styles.activeContainer]}
      onPress={onSelect}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, isActive && styles.activeIcon]}>
        <MaterialCommunityIcons name="car" size={28} color={isActive ? COLORS.primary : COLORS.textSecondary} />
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{vehicle.name}</Text>
        <Text style={styles.details}>
          {vehicle.year} {vehicle.make} {vehicle.model}
        </Text>
        <Text style={styles.batteryInfo}>
          Battery: {vehicle.batteryAgeMonths ? `${vehicle.batteryAgeMonths} months old` : 'Unknown age'}
        </Text>
      </View>
      {isActive && (
        <View style={styles.checkmark}>
          <MaterialCommunityIcons name="check-circle" size={22} color={COLORS.primary} />
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    gap: 14,
  },
  activeContainer: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '08',
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: COLORS.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeIcon: {
    backgroundColor: COLORS.primary + '20',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  details: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  batteryInfo: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  checkmark: {
    marginLeft: 8,
  },
});
