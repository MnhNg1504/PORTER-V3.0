import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, radius, space, shadow, type, sizing, fonts } from '../../theme';
import { glass } from '../../theme/tokens';
import { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;
type Nav = NativeStackNavigationProp<RootStackParamList>;

// Nội dung 3 slide — bám standalone (const OB[...]).
interface Slide {
  kicker: string;
  title: string;
  subtitle: string;
  cta: string;
  // Nền mô phỏng (RN không có ảnh full-bleed sẵn) — dùng tone glass phân biệt slide.
  tone: string;
}

const SLIDES: Slide[] = [
  {
    kicker: 'MẠNG XÃ HỘI ĐẦU TIÊN CHO TREKKER VIỆT',
    title: 'Mỗi cung đường, một người đồng hành',
    subtitle:
      'Cung đường kiểm chứng GPX, checkpoint xác minh ảnh GPS — đi là tới, không lo lạc.',
    cta: 'Tiếp',
    tone: colors.bg.surface,
  },
  {
    kicker: 'ĐI THEO ĐOÀN',
    title: 'Cả đoàn trên một bản đồ',
    subtitle:
      'Vị trí trực tiếp, chat nội bộ, cảnh báo khi có người tách đoàn quá 500 m.',
    cta: 'Tiếp',
    tone: colors.bg.surfaceDark,
  },
  {
    kicker: 'SĂN MÂY ĐÚNG LÚC',
    title: 'Săn mây có dự báo',
    subtitle:
      'Tỷ lệ biển mây, giờ bình minh, gió trên đỉnh — cập nhật từng giờ cho từng cung.',
    cta: 'Bắt đầu',
    tone: colors.bg.surface,
  },
];

// MÀN ONBOARDING — 3 slide giới thiệu, nút Tiếp/Bắt đầu (Lime) + Bỏ qua → Login.
export function OnboardingScreen(_props: Props) {
  const nav = useNavigation<Nav>();
  const [step, setStep] = useState(0);
  const slide = SLIDES[step];
  const isLast = step === SLIDES.length - 1;

  function goLogin() {
    nav.navigate('Login');
  }

  function onNext() {
    if (isLast) {
      goLogin();
    } else {
      setStep((s) => s + 1);
    }
  }

  return (
    <View style={styles.container}>
      {/* Nền full-bleed tối theo tone slide + overlay tăng tương phản chữ */}
      <View style={[styles.bg, { backgroundColor: slide.tone }]} />
      <View style={styles.overlay} />

      {/* Nút Bỏ qua (góc trên phải) */}
      <View style={styles.topBar}>
        <Pressable
          onPress={goLogin}
          style={styles.skipBtn}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Bỏ qua phần giới thiệu"
        >
          <Text style={styles.skipText}>Bỏ qua</Text>
        </Pressable>
      </View>

      {/* Nội dung slide (căn đáy) */}
      <View style={styles.content}>
        <Text style={styles.kicker}>{slide.kicker}</Text>
        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.subtitle}>{slide.subtitle}</Text>

        {/* Dot tiến trình */}
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View key={i} style={[styles.dot, i === step && styles.dotActive]} />
          ))}
        </View>

        {/* CTA Lime + limeGlow */}
        <Pressable
          onPress={onNext}
          style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}
          accessibilityRole="button"
          accessibilityLabel={slide.cta}
        >
          <Text style={styles.ctaText}>{slide.cta}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.base,
  },
  bg: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(8,11,8,0.55)',
  },
  topBar: {
    position: 'absolute',
    top: 54,
    right: space[4],
    left: space[4],
    flexDirection: 'row',
    justifyContent: 'flex-end',
    zIndex: 2,
  },
  skipBtn: {
    minHeight: sizing.touchMin,
    minWidth: sizing.touchMin,
    paddingHorizontal: space[4],
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: glass.fill,
    borderWidth: 1,
    borderColor: glass.border,
  },
  skipText: {
    ...type.meta,
    color: colors.text.secondary,
  },
  content: {
    position: 'absolute',
    left: space[6],
    right: space[6],
    bottom: 40,
    zIndex: 2,
  },
  kicker: {
    ...type.kicker,
    color: colors.brand.primary,
    marginBottom: space[3],
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '700',
    color: colors.text.primary,
  },
  subtitle: {
    ...type.body,
    color: colors.text.secondary,
    marginTop: space[3],
  },
  dots: {
    flexDirection: 'row',
    gap: space[2],
    marginTop: space[6],
    marginBottom: space[5],
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: glass.borderStrong,
  },
  dotActive: {
    width: 22,
    backgroundColor: colors.brand.primary,
  },
  cta: {
    height: sizing.buttonHeight,
    borderRadius: radius.pill,
    backgroundColor: colors.brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.limeGlow,
  },
  ctaPressed: {
    transform: [{ scale: 0.97 }],
    backgroundColor: colors.brand.primaryDark,
  },
  ctaText: {
    ...type.h2,
    color: colors.text.onLime,
    fontWeight: '700',
  },
});
