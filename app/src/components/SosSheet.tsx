import React, { useEffect, useState } from 'react';
import {
  Modal, View, Text, Pressable, StyleSheet, Platform, Linking, Share, ActivityIndicator,
} from 'react-native';
import * as Location from 'expo-location';
import { brandPalette, colors, radius, space, type } from '../theme';
import {
  SosPosition, EMERGENCY_NUMBERS, formatSosMessage, formatShareMessage,
  speakableCoords, smsUrl, telUrl,
} from '../lib/sos';

/**
 * SOS sheet (docs/05 §5 — SMS + gọi khẩn cấp, KHÔNG qua server).
 * LUÔN lấy GPS THẬT của máy khi mở (không dùng vị trí mô phỏng) — an toàn là trên hết.
 * fallbackPos: vị trí trên tuyến nếu GPS lỗi (vẫn tốt hơn không có gì).
 */
export function SosSheet({
  visible, onClose, routeName, fallbackPos, emergencyContact,
}: {
  visible: boolean;
  onClose: () => void;
  routeName?: string;
  fallbackPos?: SosPosition | null;
  emergencyContact?: { name: string; phone: string } | null;
}) {
  const [pos, setPos] = useState<SosPosition | null>(null);
  const [gpsState, setGpsState] = useState<'loading' | 'real' | 'fallback'>('loading');

  useEffect(() => {
    if (!visible) return;
    let alive = true;
    setGpsState('loading');
    setPos(null);
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') throw new Error('no permission');
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        if (!alive) return;
        setPos({
          lat: loc.coords.latitude,
          lon: loc.coords.longitude,
          ele: loc.coords.altitude,
          accuracy: loc.coords.accuracy,
        });
        setGpsState('real');
      } catch {
        if (!alive) return;
        setPos(fallbackPos ?? null);
        setGpsState('fallback');
      }
    })();
    return () => { alive = false; };
  }, [visible, fallbackPos]);

  const openSms = () => {
    if (!pos || !emergencyContact) return;
    const body = formatSosMessage(pos, { routeName });
    Linking.openURL(smsUrl(emergencyContact.phone, body, Platform.OS === 'ios' ? 'ios' : 'android'));
  };
  const sharePos = () => {
    if (!pos) return;
    Share.share({ message: formatShareMessage(pos, routeName) });
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <Text style={styles.title}>🆘 Khẩn cấp</Text>

        {/* Toạ độ hiện tại — đọc được qua điện thoại khi gọi cứu hộ */}
        <View style={styles.posBox}>
          {gpsState === 'loading' ? (
            <View style={styles.posLoading}>
              <ActivityIndicator color={brandPalette.ember} />
              <Text style={styles.posNote}>Đang lấy GPS thật…</Text>
            </View>
          ) : pos ? (
            <>
              <Text style={styles.posLabel}>
                {gpsState === 'real' ? 'Vị trí GPS của bạn' : '⚠ GPS lỗi — dùng vị trí trên tuyến'}
              </Text>
              <Text selectable style={styles.posCoords}>{speakableCoords(pos)}</Text>
              <Text style={styles.posNote}>Đọc dãy số này khi gọi tổng đài cứu hộ</Text>
            </>
          ) : (
            <Text style={styles.posLabel}>Không có vị trí (GPS lỗi & chưa có tuyến)</Text>
          )}
        </View>

        {/* Gọi khẩn cấp — hoạt động chỉ cần sóng thoại */}
        {EMERGENCY_NUMBERS.map((e) => (
          <Pressable key={e.number} style={styles.callBtn} onPress={() => Linking.openURL(telUrl(e.number))}>
            <Text style={styles.callText}>📞 Gọi {e.number} — {e.label}</Text>
          </Pressable>
        ))}

        {/* SMS người thân đã khai trong hồ sơ */}
        <Pressable
          style={[styles.smsBtn, (!pos || !emergencyContact) && styles.disabled]}
          disabled={!pos || !emergencyContact}
          onPress={openSms}
        >
          <Text style={styles.smsText}>
            {emergencyContact
              ? `✉️ SMS SOS cho ${emergencyContact.name} (${emergencyContact.phone})`
              : '✉️ Chưa khai liên hệ khẩn cấp (Hồ sơ → Liên hệ khẩn cấp)'}
          </Text>
        </Pressable>

        {/* Chia sẻ vị trí thường (không khẩn cấp) */}
        <Pressable style={[styles.shareBtn, !pos && styles.disabled]} disabled={!pos} onPress={sharePos}>
          <Text style={styles.shareText}>📍 Chia sẻ vị trí (không khẩn cấp)</Text>
        </Pressable>

        <Text style={styles.note}>
          POTTER hỗ trợ liên lạc — KHÔNG thay thế dịch vụ cứu hộ. SMS/gọi cần sóng di động.
        </Text>

        <Pressable style={styles.closeBtn} onPress={onClose}>
          <Text style={styles.closeText}>Đóng</Text>
        </Pressable>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(14,18,14,0.55)' },
  sheet: {
    backgroundColor: colors.bg.base,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: space.screen,
    paddingBottom: space[8],
    gap: space[2],
  },
  title: { ...type.h1, color: brandPalette.ember, marginBottom: space[1] },
  posBox: {
    backgroundColor: colors.bg.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: space[3],
    marginBottom: space[2],
  },
  posLoading: { flexDirection: 'row', alignItems: 'center', gap: space[2] },
  posLabel: { ...type.caption, color: colors.text.secondary },
  posCoords: { ...type.h2, color: colors.text.primary, marginVertical: 2 },
  posNote: { ...type.caption, color: colors.text.secondary },
  callBtn: { backgroundColor: brandPalette.ember, borderRadius: radius.md, padding: space[3] },
  callText: { ...type.body, color: '#FFFFFF', fontWeight: '700' },
  smsBtn: { backgroundColor: brandPalette.pine, borderRadius: radius.md, padding: space[3] },
  smsText: { ...type.meta, color: brandPalette.cream, fontWeight: '600' },
  shareBtn: { backgroundColor: colors.bg.surface, borderRadius: radius.md, padding: space[3], borderWidth: 1, borderColor: colors.border },
  shareText: { ...type.meta, color: colors.text.primary, fontWeight: '600' },
  disabled: { opacity: 0.45 },
  note: { ...type.caption, color: colors.text.secondary, marginTop: space[1] },
  closeBtn: { alignSelf: 'center', padding: space[2], marginTop: space[1] },
  closeText: { ...type.meta, color: colors.text.secondary, fontWeight: '700' },
});
