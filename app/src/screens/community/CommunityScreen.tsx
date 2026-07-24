import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Alert } from 'react-native';
import { ScreenHeader } from '../../components/ScreenHeader';
import { DifficultyChip } from '../../components/DifficultyChip';
import { colors, radius, space, shadow, type, sizing } from '../../theme';
import { glass } from '../../theme/tokens';
import { mockPosts, Post } from '../../lib/mockData';

// TAB 1 — Mạng xã hội trekker: feed + post card + tương tác.
export function CommunityScreen() {
  const [tab, setTab] = useState<'following' | 'explore'>('following');

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="POTTER"
        right={
          <View style={styles.seg}>
            {(['following', 'explore'] as const).map((t) => (
              <Pressable key={t} onPress={() => setTab(t)}>
                <Text style={[styles.segText, tab === t && styles.segTextOn]}>
                  {t === 'following' ? 'Đang theo dõi' : 'Khám phá'}
                </Text>
              </Pressable>
            ))}
          </View>
        }
      />
      <FlatList
        data={mockPosts}
        keyExtractor={(p) => p.id}
        contentContainerStyle={{ padding: space.screen, paddingBottom: 120 }}
        renderItem={({ item }) => <PostCard post={item} />}
      />
      {/* FAB soạn bài (lệch phải, tránh đè FAB giữa) */}
      <Pressable style={styles.composeFab}>
        {/* TODO(api): mở màn Soạn bài / Check-in (gắn track + ảnh). */}
        <Text style={styles.composeIcon}>＋</Text>
      </Pressable>
    </View>
  );
}

function PostCard({ post }: { post: Post }) {
  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <View style={styles.avatar}>
          <Text style={styles.avatarInitial}>{post.author.trim().charAt(0).toUpperCase()}</Text>
        </View>
        <Text style={styles.author}>{post.author}</Text>
        <Text style={styles.level}>⛰ Lv.{post.authorLevel}</Text>
        <Text style={styles.time}>• {post.timeAgo}</Text>
      </View>
      <View style={styles.image}>
        <Text style={styles.imageGlyph}>⛰</Text>
        {post.routeRef && (
          <View style={styles.verifiedBadge}>
            <Text style={styles.verifiedText}>✓ GPX kiểm chứng</Text>
          </View>
        )}
        <Text style={styles.imageText}>{post.routeRef ? post.routeRef.name : post.author}</Text>
      </View>
      <Text style={styles.caption}>{post.caption}</Text>
      {post.routeRef && (
        <View style={styles.routeChip}>
          <Text style={styles.routeChipName}>🥾 {post.routeRef.name}</Text>
          <View style={styles.routeChipMeta}>
            <Text style={styles.routeChipText}>{post.routeRef.distanceKm}km · ↑{post.routeRef.gainM}m</Text>
            <DifficultyChip difficulty={post.routeRef.difficulty} />
          </View>
        </View>
      )}
      <View style={styles.actions}>
        <Pressable
          style={styles.actionBtn}
          hitSlop={8}
          onPress={() => Alert.alert('Đã thích', 'Tính năng sẽ có ở bản đầy đủ.')}
        >
          <Text style={styles.action}>♥ {post.likes}</Text>
        </Pressable>
        <Pressable
          style={styles.actionBtn}
          hitSlop={8}
          onPress={() => Alert.alert('Bình luận', 'Tính năng sẽ có ở bản đầy đủ.')}
        >
          <Text style={styles.action}>💬 {post.comments}</Text>
        </Pressable>
        <Pressable
          style={styles.actionBtn}
          hitSlop={8}
          onPress={() => Alert.alert('Chia sẻ', 'Tính năng sẽ có ở bản đầy đủ.')}
        >
          <Text style={styles.action}>↗</Text>
        </Pressable>
        <Pressable
          style={styles.actionBtn}
          hitSlop={8}
          onPress={() => Alert.alert('Đã lưu', 'Tính năng sẽ có ở bản đầy đủ.')}
        >
          <Text style={styles.action}>🔖</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.base },
  seg: { flexDirection: 'row', gap: space[3] },
  segText: { ...type.meta, color: colors.text.secondary },
  segTextOn: { color: colors.brand.primary, fontWeight: '700' },
  // Feed card dark-glass: nền glass đặc + viền lime mờ + bóng sâu
  card: { backgroundColor: glass.fill, borderRadius: radius.lg, borderWidth: 1, borderColor: glass.border, padding: space[4], marginBottom: space.cardGap, ...shadow.glass },
  head: { flexDirection: 'row', alignItems: 'center', gap: space[2], marginBottom: space[3] },
  avatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.brand.primary, alignItems: 'center', justifyContent: 'center' },
  avatarInitial: { ...type.meta, color: colors.text.onLime, fontWeight: '800' },
  author: { ...type.h2, color: colors.text.primary },
  level: { ...type.caption, color: colors.brand.primary },
  time: { ...type.caption, color: colors.text.secondary },
  // Ảnh: vùng chìm dark-glass thay vì khối lime chói trên nền tối
  image: { height: 200, borderRadius: radius.md, backgroundColor: glass.fillSunk, borderWidth: 1, borderColor: glass.border, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  imageGlyph: { position: 'absolute', fontSize: 128, color: colors.earth, opacity: 0.16 },
  imageText: { color: colors.text.secondary, ...type.meta, fontWeight: '700' },
  // Badge "GPX kiểm chứng" — pill Lime nổi trên ảnh
  verifiedBadge: { position: 'absolute', top: space[3], left: space[3], backgroundColor: colors.brand.primary, borderRadius: radius.pill, paddingHorizontal: space[3], paddingVertical: space[1], ...shadow.limeGlow },
  verifiedText: { ...type.caption, color: colors.text.onLime, fontWeight: '800', letterSpacing: 0.3 },
  caption: { ...type.body, color: colors.text.primary, marginTop: space[3] },
  routeChip: { backgroundColor: glass.fillSunk, borderRadius: radius.md, borderWidth: 1, borderColor: glass.border, padding: space[3], marginTop: space[3] },
  routeChipName: { ...type.meta, color: colors.text.primary, fontWeight: '700' },
  routeChipMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: space[2] },
  routeChipText: { ...type.meta, color: colors.text.secondary },
  actions: { flexDirection: 'row', gap: space[4], marginTop: space[3] },
  actionBtn: { minWidth: sizing.touchMin, minHeight: sizing.touchMin, alignItems: 'center', justifyContent: 'center' },
  // Icon hành động rõ trên nền tối (mức ink thay vì muted)
  action: { ...type.meta, color: colors.text.primary },
  composeFab: {
    position: 'absolute',
    right: space[4],
    bottom: 90,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.limeGlow,
  },
  // Chữ ＋ trên nền Lime: dùng onLime (tránh trắng-trên-lime mất chữ)
  composeIcon: { color: colors.text.onLime, fontSize: 28, lineHeight: 30 },
});
