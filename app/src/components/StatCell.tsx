import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, type } from '../theme';

// Ô số liệu (km / tổng leo / thời gian / mùa) — dùng ở Route Card & cột mốc.
export function StatCell({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.cell}>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  cell: { flex: 1, alignItems: 'center' },
  value: { ...type.stat, color: colors.text.primary },
  label: { ...type.caption, color: colors.text.secondary, marginTop: 2 },
});
