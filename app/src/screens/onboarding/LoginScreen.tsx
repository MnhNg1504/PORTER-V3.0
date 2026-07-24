import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, TextInput, Keyboard,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, radius, space, shadow, type, sizing, fonts } from '../../theme';
import { glass } from '../../theme/tokens';
import { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;
type Nav = NativeStackNavigationProp<RootStackParamList>;

// MÀN ĐĂNG NHẬP — SĐT +84 / Google / Apple. Mọi nút demo → vào Tabs.
export function LoginScreen(_props: Props) {
  const nav = useNavigation<Nav>();
  const [phone, setPhone] = useState('');

  function goApp() {
    Keyboard.dismiss();
    // TODO(api): xác thực SĐT/OTP hoặc OAuth thật. Hiện demo → vào app.
    nav.navigate('Tabs');
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo Potter (mark chữ) */}
        <View style={styles.logoRow}>
          <View style={styles.logoMark}>
            <Text style={styles.logoMarkText}>P</Text>
          </View>
          <Text style={styles.logoWord}>Potter</Text>
        </View>

        <Text style={styles.title}>Chào mừng{'\n'}đến với Potter</Text>
        <Text style={styles.subtitle}>
          Mạng xã hội & bản đồ trekking cho người Việt. Đăng nhập để lưu cung, đi theo đoàn và săn mây đúng lúc.
        </Text>

        {/* Ô nhập SĐT +84 (nền chìm glass.fillSunk) */}
        <Text style={styles.label}>Số điện thoại</Text>
        <View style={styles.phoneField}>
          <Text style={styles.prefix}>+84</Text>
          <TextInput
            style={styles.phoneInput}
            value={phone}
            onChangeText={setPhone}
            placeholder="912 345 678"
            placeholderTextColor={colors.text.faint}
            keyboardType="phone-pad"
            maxLength={12}
            accessibilityLabel="Nhập số điện thoại"
          />
        </View>

        {/* CTA OTP — Lime */}
        <Pressable
          onPress={goApp}
          style={({ pressed }) => [styles.otpBtn, pressed && styles.otpBtnPressed]}
          accessibilityRole="button"
          accessibilityLabel="Nhận mã OTP"
        >
          <Text style={styles.otpText}>Nhận mã OTP</Text>
        </Pressable>

        {/* Divider "hoặc" */}
        <View style={styles.dividerRow}>
          <View style={styles.divLine} />
          <Text style={styles.divText}>hoặc</Text>
          <View style={styles.divLine} />
        </View>

        {/* Google + Apple — viền lime */}
        <View style={styles.oauthRow}>
          <Pressable
            onPress={goApp}
            style={({ pressed }) => [styles.oauthBtn, pressed && styles.oauthPressed]}
            accessibilityRole="button"
            accessibilityLabel="Đăng nhập bằng Google"
          >
            <Text style={styles.oauthGlyph}>G</Text>
            <Text style={styles.oauthText}>Google</Text>
          </Pressable>
          <Pressable
            onPress={goApp}
            style={({ pressed }) => [styles.oauthBtn, pressed && styles.oauthPressed]}
            accessibilityRole="button"
            accessibilityLabel="Đăng nhập bằng Apple"
          >
            <Text style={styles.oauthGlyph}></Text>
            <Text style={styles.oauthText}>Apple</Text>
          </Pressable>
        </View>

        {/* Fine-print điều khoản */}
        <Text style={styles.finePrint}>
          Bằng việc tiếp tục, bạn đồng ý với Điều khoản dịch vụ và Chính sách quyền riêng tư của Potter.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.base,
  },
  scroll: {
    paddingHorizontal: space[6],
    paddingTop: 80,
    paddingBottom: 40,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
  },
  logoMark: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.limeGlow,
  },
  logoMarkText: {
    fontFamily: fonts.display,
    fontSize: 24,
    fontWeight: '700',
    color: colors.text.onLime,
  },
  logoWord: {
    fontFamily: fonts.display,
    fontSize: 22,
    fontWeight: '700',
    color: colors.text.primary,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '700',
    color: colors.text.primary,
    marginTop: space[6],
  },
  subtitle: {
    ...type.body,
    color: colors.text.secondary,
    marginTop: space[3],
  },
  label: {
    ...type.kicker,
    color: colors.text.secondary,
    marginTop: space[8],
    marginBottom: space[2],
  },
  phoneField: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: sizing.buttonHeight,
    borderRadius: radius.md,
    backgroundColor: glass.fillSunk,
    borderWidth: 1,
    borderColor: glass.border,
    paddingHorizontal: space[4],
  },
  prefix: {
    ...type.body,
    color: colors.text.primary,
    fontWeight: '600',
    paddingRight: space[3],
    marginRight: space[3],
    borderRightWidth: 1,
    borderRightColor: glass.border,
  },
  phoneInput: {
    flex: 1,
    ...type.body,
    color: colors.text.primary,
    padding: 0,
    letterSpacing: 0.5,
  },
  otpBtn: {
    height: sizing.buttonHeight,
    borderRadius: radius.pill,
    backgroundColor: colors.brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: space[5],
    ...shadow.limeGlow,
  },
  otpBtnPressed: {
    transform: [{ scale: 0.97 }],
    backgroundColor: colors.brand.primaryDark,
  },
  otpText: {
    ...type.h2,
    color: colors.text.onLime,
    fontWeight: '700',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    marginVertical: space[6],
  },
  divLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  divText: {
    ...type.meta,
    color: colors.text.faint,
  },
  oauthRow: {
    flexDirection: 'row',
    gap: space[3],
  },
  oauthBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space[2],
    minHeight: sizing.buttonHeight,
    borderRadius: radius.pill,
    backgroundColor: glass.fill,
    borderWidth: 1,
    borderColor: glass.borderStrong,
  },
  oauthPressed: {
    transform: [{ scale: 0.97 }],
    backgroundColor: colors.bg.surfaceDark,
  },
  oauthGlyph: {
    ...type.h2,
    color: colors.brand.primary,
    fontWeight: '800',
  },
  oauthText: {
    ...type.meta,
    color: colors.text.primary,
    fontWeight: '600',
  },
  finePrint: {
    ...type.caption,
    color: colors.text.faint,
    lineHeight: 16,
    marginTop: space[6],
    textAlign: 'center',
  },
});
