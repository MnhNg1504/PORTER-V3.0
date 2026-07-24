import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, radius, space, shadow, type, sizing } from '../../theme';
import { RootStackParamList } from '../../navigation/types';
import {
  getOrder, paySandbox, completeOrder, cancelOrder,
  previewRefund, formatVnd, toVnd, PaymentsApiError,
  PENDING_TTL_MINUTES,
  type OrderWithLedger, type OrderStatus, type RefundTier, type EscrowKind,
} from '../../lib/paymentsApi';

type Props = NativeStackScreenProps<RootStackParamList, 'OrderStatus'>;
type Nav = NativeStackNavigationProp<RootStackParamList>;

// Các bước hiển thị (nhánh hủy/hoàn nằm ngoài đường thẳng này).
const STEPS: { key: OrderStatus; label: string }[] = [
  { key: 'pending', label: 'Chờ cọc' },
  { key: 'deposited', label: 'Đã cọc' },
  { key: 'confirmed', label: 'Người dẫn xác nhận' },
  { key: 'completed', label: 'Hoàn thành' },
];

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: 'Chờ đặt cọc',
  deposited: 'Đã đặt cọc — chờ người dẫn xác nhận',
  confirmed: 'Người dẫn đã xác nhận',
  completed: 'Chuyến đi hoàn thành',
  cancelled: 'Đã hủy',
  refunded: 'Đã hoàn cọc',
  disputed: 'Đang khiếu nại',
};

const TIER_LABEL: Record<RefundTier, string> = {
  '100': 'Hoàn 100% cọc',
  '50': 'Hoàn 50% cọc',
  '0': 'Không hoàn cọc',
  force_majeure: 'Bất khả kháng — hoàn 100%',
};

const ESCROW_LABEL: Record<EscrowKind, string> = {
  deposit_in: 'Nạp cọc vào ký quỹ',
  refund_out: 'Hoàn cọc cho khách',
  seller_forfeit: 'Người dẫn nhận từ cọc mất',
  potter_fee: 'Phí Potter',
  payout_out: 'Trả người dẫn',
};

// Thang hoàn cọc QĐ-1 (hiển thị trước khi xác nhận hủy).
const REFUND_LADDER: { tier: RefundTier; when: string; pct: string }[] = [
  { tier: '100', when: '≥ 7 ngày trước khi đi', pct: '100%' },
  { tier: '50', when: '3–7 ngày trước khi đi', pct: '50%' },
  { tier: '0', when: '< 72 giờ trước khi đi', pct: '0%' },
];

function stepIndexOf(status: OrderStatus): number {
  const i = STEPS.findIndex((s) => s.key === status);
  return i; // -1 nếu ở nhánh hủy/hoàn/khiếu nại
}

// MÀN TRẠNG THÁI ĐƠN — theo dõi vòng đời + hủy (hiện thang hoàn cọc trước khi xác nhận).
export function OrderStatusScreen({ route }: Props) {
  const nav = useNavigation<Nav>();
  const { orderId } = route.params;

  const [order, setOrder] = useState<OrderWithLedger | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [acting, setActing] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [nowTs, setNowTs] = useState(() => Date.now());

  const load = useCallback(async () => {
    try {
      setError(null);
      const data = await getOrder(orderId);
      setOrder(data);
    } catch (e) {
      setError(e instanceof PaymentsApiError ? e.message : 'Không tải được đơn.');
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => { load(); }, [load]);

  // Đồng hồ đếm ngược TTL đơn 'pending'.
  useEffect(() => {
    if (order?.status !== 'pending') return;
    const t = setInterval(() => setNowTs(Date.now()), 1000);
    return () => clearInterval(t);
  }, [order?.status]);

  const ttl = useMemo(() => {
    if (!order || order.status !== 'pending') return null;
    const deadline = new Date(order.createdAt).getTime() + PENDING_TTL_MINUTES * 60_000;
    const left = Math.max(0, deadline - nowTs);
    const mm = Math.floor(left / 60_000);
    const ss = Math.floor((left % 60_000) / 1000);
    return { expired: left <= 0, text: `${mm}:${String(ss).padStart(2, '0')}` };
  }, [order, nowTs]);

  const refund = useMemo(() => {
    if (!order) return null;
    return previewRefund(toVnd(order.depositVnd), order.tripDate);
  }, [order]);

  async function runAction(fn: () => Promise<unknown>, failMsg: string) {
    setActing(true);
    try {
      await fn();
      await load();
    } catch (e) {
      Alert.alert('Lỗi', e instanceof PaymentsApiError ? e.message : failMsg);
    } finally {
      setActing(false);
    }
  }

  async function onConfirmCancel() {
    setShowCancel(false);
    setActing(true);
    try {
      const res = await cancelOrder(orderId);
      await load();
      Alert.alert('Đã hủy đơn', `${TIER_LABEL[res.tier]} · Hoàn ${formatVnd(res.refundVnd)}.`);
    } catch (e) {
      Alert.alert('Lỗi hủy đơn', e instanceof PaymentsApiError ? e.message : 'Không hủy được đơn.');
    } finally {
      setActing(false);
    }
  }

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator color={colors.brand.primary} />
      </View>
    );
  }

  if (error || !order) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>{error ?? 'Không có dữ liệu đơn.'}</Text>
        <Pressable style={styles.retryBtn} onPress={() => { setLoading(true); load(); }}>
          <Text style={styles.retryText}>Thử lại</Text>
        </Pressable>
      </View>
    );
  }

  const activeIdx = stepIndexOf(order.status);
  const isTerminal = order.status === 'completed' || order.status === 'cancelled' || order.status === 'refunded';
  const canCancel = order.status === 'pending' || order.status === 'deposited' || order.status === 'confirmed';

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: space.screen, paddingBottom: 160 }}>
        {/* Trạng thái hiện tại */}
        <View style={styles.statusHeader}>
          <Text style={styles.statusLabel}>Trạng thái</Text>
          <Text style={styles.statusValue}>{STATUS_LABEL[order.status]}</Text>
          <Text style={styles.orderMeta}>Ngày đi {order.tripDate} · {order.headcount} người</Text>
        </View>

        {/* Đếm ngược TTL khi chờ cọc */}
        {order.status === 'pending' && ttl && (
          <View style={[styles.ttlCard, ttl.expired && styles.ttlExpired]}>
            <Text style={styles.ttlLabel}>
              {ttl.expired ? 'Đơn đã quá hạn giữ chỗ' : 'Giữ chỗ còn'}
            </Text>
            {!ttl.expired && <Text style={styles.ttlValue}>{ttl.text}</Text>}
            <Text style={styles.ttlNote}>
              Đơn tự hủy nếu không đặt cọc trong {PENDING_TTL_MINUTES} phút.
            </Text>
          </View>
        )}

        {/* Stepper vòng đời */}
        <View style={styles.stepper}>
          {STEPS.map((s, i) => {
            const done = activeIdx >= 0 && i <= activeIdx;
            const current = i === activeIdx;
            return (
              <View key={s.key} style={styles.step}>
                <View style={styles.stepDotWrap}>
                  {i > 0 && <View style={[styles.stepLine, done && styles.stepLineDone]} />}
                  <View style={[styles.stepDot, done && styles.stepDotDone, current && styles.stepDotCurrent]}>
                    {done && <Text style={styles.stepCheck}>✓</Text>}
                  </View>
                </View>
                <Text style={[styles.stepText, current && styles.stepTextCurrent]} numberOfLines={2}>
                  {s.label}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Bảng tiền */}
        <View style={styles.moneyCard}>
          <MoneyRow label="Khách trả" value={formatVnd(order.buyerTotalVnd)} />
          <MoneyRow label="Đã cọc (30%)" value={formatVnd(order.depositVnd)} highlight />
          {order.pspRef && <MoneyRow label="Mã giao dịch" value={order.pspRef} mono />}
        </View>

        {/* Sổ ký quỹ (escrow ledger) */}
        {order.escrow?.length > 0 && (
          <View style={styles.ledgerCard}>
            <Text style={styles.ledgerTitle}>Sổ ký quỹ</Text>
            {order.escrow.map((e) => (
              <View key={e.id} style={styles.ledgerRow}>
                <Text style={styles.ledgerKind}>{ESCROW_LABEL[e.kind] ?? e.kind}</Text>
                <Text style={styles.ledgerAmount}>{formatVnd(e.amountVnd)}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Thang hoàn cọc QĐ-1 — HIỆN TRƯỚC khi xác nhận hủy */}
        {showCancel && refund && (
          <View style={styles.refundCard}>
            <Text style={styles.refundTitle}>Chính sách hoàn cọc (QĐ-1)</Text>
            {REFUND_LADDER.map((row) => {
              const applies = row.tier === refund.tier;
              return (
                <View key={row.tier} style={[styles.refundRow, applies && styles.refundRowActive]}>
                  <Text style={[styles.refundWhen, applies && styles.refundActiveText]}>{row.when}</Text>
                  <Text style={[styles.refundPct, applies && styles.refundActiveText]}>{row.pct}</Text>
                </View>
              );
            })}
            <View style={styles.refundSummary}>
              <Text style={styles.refundSummaryLabel}>Hủy hôm nay bạn được hoàn</Text>
              <Text style={styles.refundSummaryValue}>{formatVnd(refund.refundVnd)}</Text>
            </View>
            {refund.forfeitVnd > 0 && (
              <Text style={styles.refundNote}>
                Mất {formatVnd(refund.forfeitVnd)} tiền cọc (chia đôi người dẫn / Potter).
              </Text>
            )}
            <Text style={styles.refundNote}>Bão / bất khả kháng (QĐ-5): hoàn 100% bất kể thời điểm.</Text>
            <View style={styles.refundActions}>
              <Pressable style={styles.cancelDismiss} onPress={() => setShowCancel(false)} disabled={acting}>
                <Text style={styles.cancelDismissText}>Giữ đơn</Text>
              </Pressable>
              <Pressable style={styles.cancelConfirm} onPress={onConfirmCancel} disabled={acting}>
                {acting ? <ActivityIndicator color="#fff" /> : <Text style={styles.cancelConfirmText}>Xác nhận hủy</Text>}
              </Pressable>
            </View>
          </View>
        )}

        {isTerminal && (
          <Pressable style={styles.doneBtn} onPress={() => nav.goBack()}>
            <Text style={styles.doneBtnText}>Về trang trước</Text>
          </Pressable>
        )}
      </ScrollView>

      {/* CTA theo trạng thái */}
      {!isTerminal && !showCancel && (
        <View style={styles.ctaBar}>
          {order.status === 'pending' && (
            <PrimaryCta
              disabled={acting || ttl?.expired}
              busy={acting}
              label="THANH TOÁN CỌC (THỬ)"
              onPress={() => runAction(() => paySandbox(orderId), 'Không thanh toán được.')}
            />
          )}
          {order.status === 'deposited' && (
            <Text style={styles.waitHint}>Đang chờ người dẫn xác nhận đơn…</Text>
          )}
          {order.status === 'confirmed' && (
            <PrimaryCta
              disabled={acting}
              busy={acting}
              label="XÁC NHẬN ĐÃ HOÀN THÀNH"
              onPress={() => runAction(() => completeOrder(orderId), 'Không xác nhận được.')}
            />
          )}
          {canCancel && (
            <Pressable
              style={styles.cancelBtn}
              disabled={acting}
              onPress={() => setShowCancel(true)}
              accessibilityLabel="Hủy đơn"
            >
              <Text style={styles.cancelBtnText}>Hủy đơn</Text>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}

function PrimaryCta({ label, onPress, disabled, busy }: {
  label: string; onPress: () => void; disabled?: boolean; busy?: boolean;
}) {
  return (
    <Pressable style={[styles.primaryCta, disabled && styles.ctaDisabled]} disabled={disabled} onPress={onPress}>
      {busy ? <ActivityIndicator color={colors.text.onLime} /> : <Text style={styles.primaryCtaText}>{label}</Text>}
    </Pressable>
  );
}

function MoneyRow({ label, value, highlight, mono }: {
  label: string; value: string; highlight?: boolean; mono?: boolean;
}) {
  return (
    <View style={styles.moneyRow}>
      <Text style={styles.moneyLabel}>{label}</Text>
      <Text style={[styles.moneyValue, highlight && styles.moneyHighlight, mono && styles.moneyMono]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.base },
  center: { alignItems: 'center', justifyContent: 'center', gap: space[4] },
  errorText: { ...type.body, color: colors.danger, textAlign: 'center', paddingHorizontal: space[6] },
  retryBtn: { paddingHorizontal: space[5], paddingVertical: space[3], borderRadius: radius.md, backgroundColor: colors.brand.primary, minHeight: sizing.touchMin, justifyContent: 'center' },
  retryText: { ...type.h2, color: colors.text.onBrand },

  statusHeader: { marginBottom: space[4] },
  statusLabel: { ...type.caption, color: colors.text.secondary },
  statusValue: { ...type.h1, color: colors.text.primary, marginTop: space[1] },
  orderMeta: { ...type.meta, color: colors.text.secondary, marginTop: space[2] },

  ttlCard: { padding: space[4], borderRadius: radius.md, backgroundColor: colors.bg.surface, borderWidth: 1, borderColor: colors.warning, marginBottom: space[4], alignItems: 'center' },
  ttlExpired: { borderColor: colors.danger },
  ttlLabel: { ...type.meta, color: colors.text.secondary },
  ttlValue: { ...type.display, color: colors.accent.summit, marginTop: space[1], fontVariant: ['tabular-nums'] },
  ttlNote: { ...type.caption, color: colors.rock, marginTop: space[2], textAlign: 'center' },

  stepper: { flexDirection: 'row', marginBottom: space[5] },
  step: { flex: 1, alignItems: 'center' },
  stepDotWrap: { width: '100%', alignItems: 'center', justifyContent: 'center', height: 28 },
  // Nối tâm dot hiện tại về tâm dot trước: neo mép phải vào giữa step, kéo rộng 1 step.
  stepLine: { position: 'absolute', right: '50%', width: '100%', top: 13, height: 2, backgroundColor: colors.border },
  stepLineDone: { backgroundColor: colors.brand.primary },
  stepDot: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.bg.surface, borderWidth: 2, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', zIndex: 1 },
  stepDotDone: { backgroundColor: colors.brand.primary, borderColor: colors.brand.primary },
  stepDotCurrent: { borderColor: colors.brand.primaryLight },
  stepCheck: { color: colors.text.onBrand, fontSize: 14, fontWeight: '700' },
  stepText: { ...type.caption, color: colors.text.secondary, textAlign: 'center', marginTop: space[2] },
  stepTextCurrent: { color: colors.text.primary, fontWeight: '700' },

  moneyCard: { padding: space[4], borderRadius: radius.md, backgroundColor: colors.bg.surface, borderWidth: 1, borderColor: colors.border, marginBottom: space[4] },
  moneyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: space[1] },
  moneyLabel: { ...type.body, color: colors.text.secondary },
  moneyValue: { ...type.body, color: colors.text.primary, fontWeight: '600' },
  moneyHighlight: { ...type.h2, color: colors.accent.summit },
  moneyMono: { fontFamily: 'monospace', fontWeight: '400' },

  ledgerCard: { padding: space[4], borderRadius: radius.md, backgroundColor: colors.bg.surface, borderWidth: 1, borderColor: colors.border, marginBottom: space[4] },
  ledgerTitle: { ...type.h2, color: colors.text.primary, marginBottom: space[2] },
  ledgerRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: space[1] },
  ledgerKind: { ...type.meta, color: colors.text.secondary },
  ledgerAmount: { ...type.meta, color: colors.text.primary, fontWeight: '600' },

  refundCard: { padding: space[4], borderRadius: radius.md, backgroundColor: colors.bg.surface, borderWidth: 1, borderColor: colors.danger, marginBottom: space[4] },
  refundTitle: { ...type.h2, color: colors.text.primary, marginBottom: space[3] },
  refundRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: space[2], paddingHorizontal: space[3], borderRadius: radius.sm },
  refundRowActive: { backgroundColor: colors.brand.primaryLight },
  refundWhen: { ...type.meta, color: colors.text.secondary },
  refundPct: { ...type.meta, color: colors.text.primary, fontWeight: '700' },
  refundActiveText: { color: colors.text.onLime },
  refundSummary: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: space[3], paddingTop: space[3], borderTopWidth: StyleSheet.hairlineWidth, borderColor: colors.border },
  refundSummaryLabel: { ...type.body, color: colors.text.primary, fontWeight: '700' },
  refundSummaryValue: { ...type.h1, color: colors.success },
  refundNote: { ...type.caption, color: colors.rock, marginTop: space[2] },
  refundActions: { flexDirection: 'row', gap: space[3], marginTop: space[4] },
  cancelDismiss: { flex: 1, height: sizing.buttonHeight, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  cancelDismissText: { ...type.h2, color: colors.text.primary },
  cancelConfirm: { flex: 1, height: sizing.buttonHeight, borderRadius: radius.md, backgroundColor: colors.danger, alignItems: 'center', justifyContent: 'center' },
  cancelConfirmText: { ...type.h2, color: '#fff' },

  doneBtn: { height: sizing.buttonHeight, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', marginTop: space[2] },
  doneBtnText: { ...type.h2, color: colors.text.primary },

  ctaBar: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: space.screen, gap: space[3], backgroundColor: colors.bg.base, borderTopWidth: StyleSheet.hairlineWidth, borderColor: colors.border, ...shadow.card },
  primaryCta: { backgroundColor: colors.brand.primaryLight, borderRadius: radius.md, height: sizing.buttonHeight, alignItems: 'center', justifyContent: 'center' },
  primaryCtaText: { ...type.h2, color: colors.text.onLime, fontWeight: '700' },
  ctaDisabled: { opacity: 0.5 },
  waitHint: { ...type.meta, color: colors.text.secondary, textAlign: 'center', paddingVertical: space[2] },
  cancelBtn: { height: sizing.touchMin, alignItems: 'center', justifyContent: 'center' },
  cancelBtnText: { ...type.body, color: colors.danger, fontWeight: '600' },
});
