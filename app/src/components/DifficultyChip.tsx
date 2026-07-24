import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, difficultyMeta, Difficulty, radius, space } from '../theme';

// Chip độ khó màu: Dễ=xanh, Chuẩn=vàng, Khó=đỏ (docs 02).
export function DifficultyChip({ difficulty }: { difficulty: Difficulty }) {
  const meta = difficultyMeta[difficulty];
  return (
    <View style={[styles.chip, { backgroundColor: meta.color }]}>
      <Text style={styles.text}>{meta.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: space[3],
    paddingVertical: space[1],
    borderRadius: radius.sm,
    alignSelf: 'flex-start',
  },
  // Chữ ink tối #182200 — tương phản cao trên cả 3 màu semantic (sage/gold/ember) sáng
  text: { color: colors.text.onLime, fontSize: 12, fontWeight: '700' },
});
