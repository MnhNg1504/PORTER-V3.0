import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, radius, space, shadow, type } from '../../theme';
import { mockRoutes } from '../../lib/mockData';
import { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'StartPoint'>;
type Nav = NativeStackNavigationProp<RootStackParamList>;

/**
 * Màn "DẪN TỚI ĐIỂM XUẤT PHÁT" (BƯỚC 1) — trọng tâm luồng mua cung (docs 02/03).
 * ẢNH THỰC ĐỊA là khối lớn nhất (bắt buộc) để user nhận diện đúng chỗ.
 * "Tôi đã tới nơi → Bắt đầu đi cung" chuyển sang BƯỚC 2 (RouteNavigate).
 */
export function StartPointScreen({ route }: Props) {
  const nav = useNavigation<Nav>();
  const data = mockRoutes.find((r) => r.id === route.params.routeId) ?? mockRoutes[0];
  const sp = data.startPoint;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <Text style={styles.step}>Bước 1/2 — Tới điểm xuất phát</Text>

        {/* ẢNH THỰC ĐỊA (hero ~40% màn). TODO(api): ảnh thật từ CDN (sp.photoUrl). */}
        <View style={styles.photo}>
          <Text style={styles.photoPlaceholder}>ẢNH THỰC ĐỊA ĐIỂM XUẤT PHÁT</Text>
          <View style={styles.photoCaption}>
            <Text style={styles.photoCaptionText}>"{sp.photoCaption}"</Text>
          </View>
        </View>

        <View style={styles.body}>
          <Text style={styles.spLabel}>📍 Điểm xuất phát: {sp.label}</Text>
          {/* TODO(api): tính khoảng cách/ETA thật từ vị trí GPS hiện tại (routing GraphHopper). */}
          <Text style={styles.meta}>Cách bạn ~8.2 km · lái xe ~22 phút</Text>
          <View style={styles.coordRow}>
            <Text style={styles.meta}>Toạ độ {sp.lat.toFixed(5)}, {sp.lon.toFixed(5)}</Text>
            <Pressable><Text style={styles.copy}>Sao chép</Text></Pressable>
          </View>

          {/* Mini map "bạn → điểm XP" (MapLibre thật) — TODO(api): render tuyến tiếp cận. */}
          <View style={styles.mapPlaceholder}>
            <Text style={styles.mapPlaceholderText}>Mini map: vị trí bạn → điểm XP</Text>
          </View>

          <Text style={styles.section}>Ghi chú tới nơi</Text>
          <Text style={styles.paragraph}>{sp.note}</Text>

          {/* Liên hệ hướng dẫn viên -> Tab 4 */}
          <View style={styles.guideRow}>
            <Text style={styles.guideName}>👤 Hướng dẫn: {sp.guideName} ⭐{sp.guideRating}</Text>
            <Pressable
              style={styles.msgBtn}
              onPress={() => nav.navigate('Chat', { conversationId: 'c1' })}
            >
              <Text style={styles.msgBtnText}>Nhắn</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      {/* 2 nút đáy */}
      <View style={styles.bottomBar}>
        <Pressable style={styles.secondaryBtn}>
          {/* TODO(api): bàn giao cho app bản đồ (Google Maps deep link) để tiếp cận. */}
          <Text style={styles.secondaryText}>Chỉ đường tới</Text>
        </Pressable>
        <Pressable
          style={styles.primaryBtn}
          onPress={() => nav.navigate('RouteNavigate', { routeId: data.id })}
        >
          <Text style={styles.primaryText}>TÔI ĐÃ TỚI NƠI →{'\n'}Bắt đầu đi cung</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.base },
  step: { ...type.meta, color: colors.text.secondary, padding: space.screen, paddingBottom: space[2] },
  photo: {
    height: 260,
    backgroundColor: colors.earth,
    marginHorizontal: space.screen,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  photoPlaceholder: { color: '#fff', ...type.h2, opacity: 0.8 },
  photoCaption: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.45)', padding: space[3] },
  photoCaptionText: { color: '#fff', ...type.meta },
  body: { padding: space.screen },
  spLabel: { ...type.h2, color: colors.text.primary },
  meta: { ...type.meta, color: colors.text.secondary, marginTop: space[2] },
  coordRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: space[2] },
  copy: { ...type.meta, color: colors.brand.primary, fontWeight: '700' },
  mapPlaceholder: {
    height: 130,
    borderRadius: radius.md,
    backgroundColor: colors.bg.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: space[4],
  },
  mapPlaceholderText: { ...type.meta, color: colors.rock },
  section: { ...type.h2, color: colors.text.primary, marginBottom: space[2] },
  paragraph: { ...type.body, color: colors.text.secondary },
  guideRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: space[4] },
  guideName: { ...type.meta, color: colors.text.primary },
  msgBtn: { backgroundColor: colors.brand.primaryLight, borderRadius: radius.pill, paddingHorizontal: space[4], paddingVertical: space[2] },
  msgBtnText: { ...type.meta, color: colors.brand.primaryDark, fontWeight: '700' },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    gap: space[3],
    padding: space.screen,
    backgroundColor: colors.bg.base,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    ...shadow.card,
  },
  secondaryBtn: {
    flex: 1,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryText: { ...type.meta, color: colors.brand.primary, fontWeight: '700' },
  primaryBtn: {
    flex: 2,
    backgroundColor: colors.brand.primary,
    borderRadius: radius.md,
    paddingVertical: space[3],
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: { color: '#fff', ...type.meta, fontWeight: '700', textAlign: 'center' },
});
