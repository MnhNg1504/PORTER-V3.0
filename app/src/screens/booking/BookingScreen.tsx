import React, { useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, radius, space, shadow, type, sizing } from '../../theme';
import { DifficultyChip } from '../../components/DifficultyChip';
import { mockRoutes } from '../../lib/mockData';
import { RootStackParamList } from '../../navigation/types';
import {
  createOrder, previewPricing, formatVnd, PaymentsApiError,
} from '../../lib/paymentsApi';

type Props = NativeStackScreenProps<RootStackParamList, 'Booking'>;
type Nav = NativeStackNavigationProp<RootStackParamList>;

// Cung ≥ Chuẩn (standard | hard) bắt buộc ký waiver trước khi thanh toán (docs an toàn).
const NEEDS_WAIVER = new Set(['standard', 'hard']);

// TODO(verify): mockRoutes chưa có `slug`; suy tạm từ id (bỏ tiền tố "r_").
// CEO nối route thật -> dùng `route.slug` từ backend.
function routeSlugOf(routeId: string): string {
  return routeId.replace(/^r_/, '');
}

// Danh sách ngày khởi hành chọn nhanh (14 ngày tới) — tránh phụ thuộc date-picker ngoài.
function nextDays(count: number): { iso: string; dayLabel: string; dateLabel: string }[] {
  const WD = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  const out: { iso: string; dayLabel: string; dateLabel: string }[] = [];
  const base = new Date();
  base.setHours(0, 0, 0, 0);
  for (let i = 1; i <= count; i++) {
    const d = new Date(base.getTime() + i * 86_400_000);
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    out.push({ iso, dayLabel: WD[d.getDay()], dateLabel: `${d.getDate()}/${d.getMonth() + 1}` });
  }
  return out;
}

// MÀN ĐẶT CỌC — chọn ngày đi + số người, xem bảng giá, đặt cọc 30%.
export function BookingScreen({ route }: Props) {
  const nav = useNavigation<Nav>();
  const data = mockRoutes.find((r) => r.id === route.params.routeId) ?? mockRoutes[0];
  const waiverSigned = route.params.waiverSigned === true;
  const needWaiver = NEEDS_WAIVER.has(data.difficulty);

  const days = useMemo(() => nextDays(14), []);
  // DEMO1: mặc định ~1 tuần tới để beat "thử Hủy" ra hoàn 100% (thang QĐ-1), tránh 0đ.
  const [tripDate, setTripDate] = useState<string>((days[7] ?? days[0]).iso);
  const [headcount, setHeadcount] = useState<number>(1);
  const [submitting, setSubmitting] = useState(false);

  // Bảng giá preview (server tính lại con số cuối khi tạo đơn).
  const pricing = useMemo(
    () => previewPricing(data.priceVnd, headcount),
    [data.priceVnd, headcount],
  );

  const gatedByWaiver = needWaiver && !waiverSigned;

  async function onDeposit() {
    if (gatedByWaiver) {
      nav.navigate('Waiver', { routeId: data.id });
      return;
    }
    setSubmitting(true);
    try {
      const { order } = await createOrder({
        routeSlug: routeSlugOf(data.id),
        tripDate,
        headcount,
        demoUnitVnd: data.priceVnd, // DEMO1: tính đơn cục bộ khi chưa nối backend
      });
      nav.navigate('OrderStatus', { orderId: order.id });
    } catch (e) {
      const msg = e instanceof PaymentsApiError ? e.message : 'Không tạo được đơn. Thử lại nhé.';
      Alert.alert('Lỗi đặt cọc', msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: space.screen, paddingBottom: 140 }}>
        {/* Tóm tắt cung */}
        <View style={styles.routeCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.routeName} numberOfLines={2}>{data.name}</Text>
            <Text style={styles.routeMeta}>{data.region} · {data.durationText}</Text>
          </View>
          <DifficultyChip difficulty={data.difficulty} />
        </View>

        {/* Ngày khởi hành */}
        <Text style={styles.section}>Ngày khởi hành</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dayRow}>
          {days.map((d) => {
            const active = d.iso === tripDate;
            return (
              <Pressable
                key={d.iso}
                onPress={() => setTripDate(d.iso)}
                style={[styles.dayChip, active && styles.dayChipActive]}
                accessibilityRole="button"
                accessibilityLabel={`Chọn ngày ${d.dateLabel}`}
              >
                <Text style={[styles.dayWd, active && styles.dayTextActive]}>{d.dayLabel}</Text>
                <Text style={[styles.dayNum, active && styles.dayTextActive]}>{d.dateLabel}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Số người */}
        <Text style={styles.section}>Số người</Text>
        <View style={styles.stepperRow}>
          <Pressable
            style={[styles.stepBtn, headcount <= 1 && styles.stepBtnDisabled]}
            disabled={headcount <= 1}
            onPress={() => setHeadcount((n) => Math.max(1, n - 1))}
            accessibilityLabel="Giảm số người"
          >
            <Text style={styles.stepSign}>−</Text>
          </Pressable>
          <Text style={styles.stepValue}>{headcount}</Text>
          <Pressable
            style={styles.stepBtn}
            onPress={() => setHeadcount((n) => Math.min(20, n + 1))}
            accessibilityLabel="Tăng số người"
          >
            <Text style={styles.stepSign}>+</Text>
          </Pressable>
        </View>

        {/* Bảng giá */}
        <Text style={styles.section}>Bảng giá</Text>
        <View style={styles.priceCard}>
          <PriceRow label={`Giá cung × ${headcount}`} value={formatVnd(pricing.subtotalVnd)} />
          <PriceRow label="Phí dịch vụ (+5%)" value={`+${formatVnd(pricing.buyerTotalVnd - pricing.subtotalVnd)}`} />
          <Text style={styles.priceSubNote}>Potter thu 10%, chia đôi khách–người dẫn (docs/16).</Text>
          <View style={styles.priceDivider} />
          <PriceRow label="Khách trả" value={formatVnd(pricing.buyerTotalVnd)} strong />
          <PriceRow label="Cọc giữ chỗ (30%)" value={formatVnd(pricing.depositVnd)} highlight />
          <Text style={styles.priceNote}>
            Cọc 30% giữ trong ví ký quỹ (escrow). Phần còn lại thanh toán khi gặp người dẫn.
          </Text>
          <Text style={styles.refundPolicyNote}>
            Chính sách hoàn cọc theo thời điểm hủy: ≥7 ngày 100% · 3–7 ngày 50% · &lt;72h 0%.
          </Text>
        </View>

        {gatedByWaiver && (
          <Text style={styles.waiverWarn}>
            ⚠ Cung {data.difficulty === 'hard' ? 'Khó' : 'Chuẩn'} cần ký cam kết an toàn trước khi đặt cọc.
          </Text>
        )}
        {needWaiver && waiverSigned && (
          <Text style={styles.waiverOk}>✓ Đã ký cam kết an toàn.</Text>
        )}
      </ScrollView>

      {/* CTA sticky */}
      <View style={styles.ctaBar}>
        <View style={styles.ctaSummary}>
          <Text style={styles.ctaSummaryLabel}>Đặt cọc</Text>
          <Text style={styles.ctaSummaryValue}>{formatVnd(pricing.depositVnd)}</Text>
        </View>
        <Pressable
          style={[styles.cta, submitting && styles.ctaDisabled]}
          disabled={submitting}
          onPress={onDeposit}
        >
          {submitting ? (
            <ActivityIndicator color={colors.text.onLime} />
          ) : (
            <Text style={styles.ctaText}>
              {gatedByWaiver ? 'KÝ CAM KẾT AN TOÀN' : 'ĐẶT CỌC 30%'}
            </Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

function PriceRow({ label, value, strong, highlight }: {
  label: string; value: string; strong?: boolean; highlight?: boolean;
}) {
  return (
    <View style={styles.priceRow}>
      <Text style={[styles.priceLabel, strong && styles.priceLabelStrong]}>{label}</Text>
      <Text style={[
        styles.priceValue,
        strong && styles.priceValueStrong,
        highlight && styles.priceValueHighlight,
      ]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.base },
  routeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    padding: space[4],
    borderRadius: radius.md,
    backgroundColor: colors.bg.surface,
    marginBottom: space[4],
    ...shadow.card,
  },
  routeName: { ...type.h2, color: colors.text.primary },
  routeMeta: { ...type.meta, color: colors.text.secondary, marginTop: space[1] },

  section: { ...type.h2, color: colors.text.primary, marginTop: space[2], marginBottom: space[3] },

  dayRow: { gap: space[2], paddingBottom: space[2] },
  dayChip: {
    minWidth: 56,
    minHeight: sizing.touchMin,
    paddingHorizontal: space[3],
    paddingVertical: space[2],
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bg.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayChipActive: { backgroundColor: colors.brand.primary, borderColor: colors.brand.primary },
  dayWd: { ...type.caption, color: colors.text.secondary },
  dayNum: { ...type.meta, color: colors.text.primary, fontWeight: '700' },
  dayTextActive: { color: colors.text.onBrand },

  stepperRow: { flexDirection: 'row', alignItems: 'center', gap: space[5] },
  stepBtn: {
    width: sizing.touchMin,
    height: sizing.touchMin,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnDisabled: { borderColor: colors.border, opacity: 0.5 },
  stepSign: { ...type.h1, color: colors.brand.primary, lineHeight: 26 },
  stepValue: { ...type.display, color: colors.text.primary, minWidth: 40, textAlign: 'center' },

  priceCard: {
    padding: space[4],
    borderRadius: radius.md,
    backgroundColor: colors.bg.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: space[1] },
  priceLabel: { ...type.body, color: colors.text.secondary },
  priceLabelStrong: { color: colors.text.primary, fontWeight: '700' },
  priceValue: { ...type.body, color: colors.text.secondary },
  priceValueStrong: { ...type.h2, color: colors.text.primary },
  priceValueHighlight: { ...type.h2, color: colors.accent.summit },
  priceDivider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border, marginVertical: space[2] },
  priceSubNote: { ...type.caption, color: colors.rock, marginTop: space[1] },
  priceNote: { ...type.caption, color: colors.rock, marginTop: space[3] },
  refundPolicyNote: { ...type.caption, color: colors.text.secondary, marginTop: space[2] },

  waiverWarn: { ...type.meta, color: colors.danger, marginTop: space[4] },
  waiverOk: { ...type.meta, color: colors.success, marginTop: space[4] },

  ctaBar: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    flexDirection: 'row', alignItems: 'center', gap: space[3],
    padding: space.screen,
    backgroundColor: colors.bg.base,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    ...shadow.card,
  },
  ctaSummary: { justifyContent: 'center' },
  ctaSummaryLabel: { ...type.caption, color: colors.text.secondary },
  ctaSummaryValue: { ...type.h2, color: colors.text.primary },
  cta: {
    flex: 1,
    backgroundColor: colors.brand.primaryLight,
    borderRadius: radius.md,
    height: sizing.buttonHeight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaDisabled: { opacity: 0.6 },
  ctaText: { ...type.h2, color: colors.text.onLime, fontWeight: '700' },
});
