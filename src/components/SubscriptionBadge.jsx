import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../utils/constants';

export default function SubscriptionBadge({ tier }) {
  const config = {
    FREE: { label: 'Free Trial', color: COLORS.textSecondary, icon: 'flask-empty-outline' },
    BASIC: { label: 'Basic', color: COLORS.primary, icon: 'star-outline' },
    PRO: { label: 'Pro', color: COLORS.accent, icon: 'shield-star' },
    ADVANCED: { label: 'Advanced', color: COLORS.secondary, icon: 'crown' },
  };

  const { label, color, icon } = config[tier] || config.FREE;

  return (
    <View style={[styles.badge, { backgroundColor: color + '20', borderColor: color + '40' }]}>
      <MaterialCommunityIcons name={icon} size={14} color={color} />
      <Text style={[styles.text, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
  },
});
