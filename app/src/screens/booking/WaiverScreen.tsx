import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, TextInput, Keyboard,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, radius, space, shadow, type, sizing } from '../../theme';
import { glass } from '../../theme/tokens';
import { mockRoutes, currentUser } from '../../lib/mockData';
import { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Waiver'>;
type Nav = NativeStackNavigationProp<RootStackParamList>;

// Các điều khoản cam kết (rút gọn) — cung ≥ Chuẩn có rủi ro địa hình.
const TERMS = [
  'Tôi hiểu cung này có độ khó từ Chuẩn trở lên, địa hình dốc, sóng điện thoại yếu và thời tiết núi cao thay đổi nhanh.',
  'Tôi tự chịu trách nhiệm về sức khỏe, thể lực và trang bị cá nhân của mình.',
  'Tôi cam kết tuân theo hướng dẫn của người dẫn đường và không tách đoàn khi chưa được đồng ý.',
  'Tôi đã khai báo liên hệ khẩn cấp và đồng ý để POTTER dùng khi cần cứu hộ (SOS).',
];

// MÀN WAIVER — ký số (checkbox + tên) cho cung ≥Chuẩn. Chặn thanh toán tới khi ký.
export function WaiverScreen({ route }: Props) {
  const nav = useNavigation<Nav>();
  const data = mockRoutes.find((r) => r.id === route.params.routeId) ?? mockRoutes[0];

  const [agreed, setAgreed] = useState(false);
  const [name, setName] = useState(currentUser.name ?? '');

  const canSign = agreed && name.trim().length >= 2;

  function onSign() {
    if (!canSign) return;
    Keyboard.dismiss();
    // TODO(api): POST chữ ký waiver (tên + timestamp + routeSlug) lên server để lưu vết pháp lý.
    // Hiện trả cờ đã ký về màn Đặt cọc để mở khóa thanh toán.
    nav.navigate('Booking', { routeId: data.id, waiverSigned: true });
  }

  const today = new Date().toLocaleDateString('vi-VN');

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: space.screen, paddingBottom: 140 }} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Cam kết an toàn</Text>
        <Text style={styles.subtitle}>{data.name}</Text>
        <Text style={styles.intro}>
          Cung mức {data.difficulty === 'hard' ? 'Khó' : 'Chuẩn'} yêu cầu ký cam kết trước khi đặt cọc.
          Vui lòng đọc kỹ và xác nhận.
        </Text>

        <View style={styles.termsCard}>
          {TERMS.map((t, i) => (
            <View key={i} style={styles.termRow}>
              <Text style={styles.termBullet}>{i + 1}</Text>
              <Text style={styles.termText}>{t}</Text>
            </View>
          ))}
        </View>

        {/* Checkbox đồng ý */}
        <Pressable
          style={styles.checkRow}
          onPress={() => setAgreed((v) => !v)}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: agreed }}
          accessibilityLabel="Tôi đã đọc và đồng ý các điều khoản"
        >
          <View style={[styles.checkbox, agreed && styles.checkboxOn]}>
            {agreed && <Text style={styles.checkMark}>✓</Text>}
          </View>
          <Text style={styles.checkLabel}>Tôi đã đọc và đồng ý toàn bộ điều khoản trên.</Text>
        </Pressable>

        {/* Ký tên */}
        <Text style={styles.signLabel}>Ký tên (gõ họ tên đầy đủ)</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Nguyễn Văn A"
          placeholderTextColor={colors.rock}
          autoCapitalize="words"
          returnKeyType="done"
        />
        <Text style={styles.signMeta}>Ký ngày {today}</Text>
      </ScrollView>

      {/* CTA sticky */}
      <View style={styles.ctaBar}>
        <Pressable style={[styles.cta, !canSign && styles.ctaDisabled]} disabled={!canSign} onPress={onSign}>
          <Text style={styles.ctaText}>KÝ VÀ TIẾP TỤC</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.base },
  title: { ...type.display, color: colors.text.primary },
  subtitle: { ...type.h2, color: colors.text.secondary, marginTop: space[1] },
  intro: { ...type.body, color: colors.text.secondary, marginTop: space[3] },

  termsCard: {
    marginTop: space[4],
    padding: space[4],
    borderRadius: radius.lg,
    backgroundColor: glass.fill,
    borderWidth: 1,
    borderColor: glass.border,
    gap: space[3],
    ...shadow.glassSoft,
  },
  termRow: { flexDirection: 'row', gap: space[3] },
  termBullet: {
    ...type.meta,
    color: colors.text.onBrand,
    backgroundColor: colors.brand.primary,
    width: 22, height: 22, borderRadius: 11,
    textAlign: 'center', lineHeight: 22, overflow: 'hidden',
  },
  termText: { ...type.body, color: colors.text.primary, flex: 1 },

  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    marginTop: space[5],
    minHeight: sizing.touchMin,
  },
  checkbox: {
    width: 28, height: 28, borderRadius: radius.sm,
    borderWidth: 2, borderColor: colors.brand.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  checkboxOn: { backgroundColor: colors.brand.primary },
  checkMark: { color: colors.text.onBrand, fontSize: 16, fontWeight: '700' },
  checkLabel: { ...type.body, color: colors.text.primary, flex: 1 },

  signLabel: { ...type.h2, color: colors.text.primary, marginTop: space[5], marginBottom: space[2] },
  input: {
    height: sizing.buttonHeight,
    borderWidth: 1,
    borderColor: glass.border,
    borderRadius: radius.md,
    paddingHorizontal: space[4],
    backgroundColor: glass.fillSunk,
    ...type.h2,
    color: colors.text.primary,
    // Chữ ký kiểu tay: dùng font display cho cảm giác "ký".
    fontFamily: 'YoungDisplay',
  },
  signMeta: { ...type.caption, color: colors.rock, marginTop: space[2] },

  ctaBar: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    padding: space.screen,
    backgroundColor: colors.bg.base,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    ...shadow.card,
  },
  cta: {
    backgroundColor: colors.brand.primary,
    borderRadius: radius.md,
    height: sizing.buttonHeight,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.limeGlow,
  },
  ctaDisabled: { opacity: 0.5 },
  ctaText: { ...type.h2, color: colors.text.onLime, fontWeight: '700' },
});
