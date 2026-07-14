import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../utils/constants';

export default function AlertCard({ type, title, message, onPress }) {
  const getConfig = () => {
    switch (type) {
      case 'critical':
        return { icon: 'alert-circle', bg: COLORS.danger + '15', border: COLORS.danger, iconColor: COLORS.danger };
      case 'warning':
        return { icon: 'alert', bg: COLORS.warning + '15', border: COLORS.warning, iconColor: COLORS.warning };
      case 'success':
        return { icon: 'check-circle', bg: COLORS.success + '15', border: COLORS.success, iconColor: COLORS.success };
      case 'info':
        return { icon: 'information', bg: COLORS.primary + '15', border: COLORS.primary, iconColor: COLORS.primary };
      default:
        return { icon: 'bell', bg: COLORS.surfaceLight, border: COLORS.border, iconColor: COLORS.textSecondary };
    }
  };

  const config = getConfig();

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: config.bg, borderColor: config.border }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <MaterialCommunityIcons name={config.icon} size={24} color={config.iconColor} />
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={20} color={COLORS.textMuted} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
    gap: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  message: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
});
