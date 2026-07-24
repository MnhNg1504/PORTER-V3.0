import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { colors, radius, space, shadow, type, sizing } from '../../theme';
import { glass } from '../../theme/tokens';
import { currentUser } from '../../lib/mockData';

// Màn "Sửa hồ sơ" (v3) — avatar + đổi ảnh, field trên well glass.fillSunk,
// nút "Lưu" Lime + limeGlow. Bám prototype (data-screen-label="Sửa hồ sơ").
type Props = NativeStackScreenProps<RootStackParamList, 'EditProfile'>;
type Nav = NativeStackNavigationProp<RootStackParamList>;

const LEVEL_OPTIONS: { value: 1 | 2 | 3; label: string }[] = [
  { value: 1, label: 'Mới' },
  { value: 2, label: 'Có kinh nghiệm' },
  { value: 3, label: 'Tổ chức/Tour' },
];

export function EditProfileScreen(_props: Props) {
  const insets = useSafeAreaInsets();
  const nav = useNavigation<Nav>();

  const u = currentUser;
  const [name, setName] = useState(u.name);
  const [bio, setBio] = useState('Mê săn mây, thích cung khó. Đi để thấy mình nhỏ bé.');
  const [showLevel, setShowLevel] = useState<1 | 2 | 3>(u.level);

  return (
    <View style={styles.container}>
      {/* Header: nút đóng (x) + tiêu đề + nút Lưu Lime */}
      <View style={[styles.header, { paddingTop: insets.top + space[2] }]}>
        <View style={styles.headerLeft}>
          <Pressable
            onPress={() => nav.goBack()}
            style={styles.backBtn}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Đóng"
          >
            <Text style={styles.closeIcon}>✕</Text>
          </Pressable>
          <Text style={styles.title}>Sửa hồ sơ</Text>
        </View>
        <Pressable
          onPress={() => nav.goBack()}
          style={styles.saveBtn}
          hitSlop={8}
          accessibilityRole="button"
        >
          <Text style={styles.saveText}>Lưu</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: space.screen, paddingBottom: insets.bottom + 120 }}>
        {/* Avatar + đổi ảnh */}
        <View style={styles.avatarBlock}>
          <View style={styles.avatar}>
            <Text style={styles.avatarInitial}>{u.name.charAt(0)}</Text>
          </View>
          <Pressable style={styles.changePhoto} hitSlop={8} accessibilityRole="button">
            <Text style={styles.changePhotoText}>Đổi ảnh đại diện</Text>
          </Pressable>
        </View>

        {/* Tên hiển thị */}
        <Text style={styles.label}>Tên hiển thị</Text>
        <View style={styles.well}>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Tên của bạn"
            placeholderTextColor={colors.text.faint}
            style={styles.input}
          />
        </View>

        {/* Tiểu sử / Bio */}
        <Text style={styles.label}>Tiểu sử</Text>
        <View style={styles.well}>
          <TextInput
            value={bio}
            onChangeText={setBio}
            placeholder="Giới thiệu ngắn về bạn"
            placeholderTextColor={colors.text.faint}
            multiline
            style={[styles.input, styles.inputMultiline]}
          />
        </View>

        {/* Cấp độ hiển thị */}
        <Text style={styles.label}>Cấp độ hiển thị</Text>
        <View style={styles.levelRow}>
          {LEVEL_OPTIONS.map((opt) => {
            const on = opt.value === showLevel;
            return (
              <Pressable
                key={opt.value}
                onPress={() => setShowLevel(opt.value)}
                style={[styles.levelChip, on && styles.levelChipOn]}
                accessibilityRole="button"
                accessibilityState={{ selected: on }}
              >
                <Text style={[styles.levelChipLabel, on && styles.levelChipLabelOn]}>
                  Cấp {opt.value} · {opt.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Nút Lưu lớn Lime + limeGlow */}
        <Pressable
          onPress={() => nav.goBack()}
          style={styles.savePrimary}
          accessibilityRole="button"
        >
          <Text style={styles.savePrimaryText}>Lưu thay đổi</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.base },
  header: {
    paddingHorizontal: space.screen,
    paddingBottom: space[3],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: space[3] },
  backBtn: {
    width: sizing.touchMin,
    height: sizing.touchMin,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: glass.border,
    backgroundColor: glass.fill,
  },
  closeIcon: { color: colors.text.primary, fontSize: 16, fontWeight: '700' },
  title: { ...type.h1, color: colors.text.primary },
  saveBtn: {
    minHeight: sizing.touchMin,
    justifyContent: 'center',
    paddingHorizontal: space[4],
    borderRadius: radius.pill,
    backgroundColor: colors.brand.primary,
  },
  saveText: { ...type.meta, color: colors.text.onLime, fontWeight: '800' },

  avatarBlock: { alignItems: 'center', marginTop: space[4], marginBottom: space[4] },
  avatar: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: colors.brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.limeGlow,
  },
  avatarInitial: { ...type.display, color: colors.text.onLime },
  changePhoto: {
    marginTop: space[3],
    minHeight: sizing.touchMin,
    justifyContent: 'center',
    paddingHorizontal: space[4],
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: glass.borderStrong,
    backgroundColor: glass.fill,
  },
  changePhotoText: { ...type.meta, color: colors.brand.primary, fontWeight: '700' },

  label: { ...type.kicker, color: colors.text.secondary, textTransform: 'uppercase', marginTop: space[4], marginBottom: space[2], marginLeft: space[1] },
  well: {
    backgroundColor: glass.fillSunk,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: glass.border,
    paddingHorizontal: space[3],
  },
  input: {
    ...type.body,
    color: colors.text.primary,
    minHeight: sizing.touchMin,
    paddingVertical: space[2],
  },
  inputMultiline: { minHeight: 88, textAlignVertical: 'top' },

  levelRow: { flexDirection: 'row', flexWrap: 'wrap', gap: space[2] },
  levelChip: {
    minHeight: sizing.touchMin,
    justifyContent: 'center',
    paddingHorizontal: space[4],
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: glass.border,
    backgroundColor: glass.fillSunk,
  },
  levelChipOn: { backgroundColor: colors.brand.primary, borderColor: colors.brand.primaryDark },
  levelChipLabel: { ...type.meta, color: colors.text.secondary, fontWeight: '600' },
  levelChipLabelOn: { color: colors.text.onLime, fontWeight: '800' },

  savePrimary: {
    marginTop: space[6],
    minHeight: sizing.buttonHeight,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.brand.primary,
    ...shadow.limeGlow,
  },
  savePrimaryText: { ...type.body, color: colors.text.onLime, fontWeight: '800' },
});
