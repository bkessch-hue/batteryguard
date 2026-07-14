import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../utils/constants';

export default function HealthIndicator({ status, color, size = 'medium' }) {
  const iconSize = size === 'small' ? 16 : size === 'large' ? 28 : 22;
  const textSize = size === 'small' ? 12 : size === 'large' ? 18 : 14;

  return (
    <View style={[styles.container, { backgroundColor: color + '20' }]}>
      <MaterialCommunityIcons name={status?.icon || 'battery'} size={iconSize} color={color} />
      <Text style={[styles.text, { color, fontSize: textSize }]}>{status?.label || 'Unknown'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  text: {
    fontWeight: '700',
  },
});
