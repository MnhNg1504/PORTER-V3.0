import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { ScreenHeader } from '../../components/ScreenHeader';
import { DifficultyChip } from '../../components/DifficultyChip';
import { colors, radius, space, shadow, type } from '../../theme';
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
        <View style={styles.avatar} />
        <Text style={styles.author}>{post.author}</Text>
        <Text style={styles.level}>⛰ Lv.{post.authorLevel}</Text>
        <Text style={styles.time}>• {post.timeAgo}</Text>
      </View>
      <View style={styles.image}>
        <Text style={styles.imageText}>Ảnh chuyến đi</Text>
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
        <Text style={styles.action}>♥ {post.likes}</Text>
        <Text style={styles.action}>💬 {post.comments}</Text>
        <Text style={styles.action}>↗</Text>
        <Text style={styles.action}>🔖</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.surface },
  seg: { flexDirection: 'row', gap: space[3] },
  segText: { ...type.meta, color: colors.text.secondary },
  segTextOn: { color: colors.brand.primary, fontWeight: '700' },
  card: { backgroundColor: colors.bg.base, borderRadius: radius.md, padding: space[4], marginBottom: space.cardGap, ...shadow.card },
  head: { flexDirection: 'row', alignItems: 'center', gap: space[2], marginBottom: space[3] },
  avatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.brand.primaryLight },
  author: { ...type.h2, color: colors.text.primary },
  level: { ...type.caption, color: colors.brand.primary },
  time: { ...type.caption, color: colors.text.secondary },
  image: { height: 200, borderRadius: radius.md, backgroundColor: colors.rock, alignItems: 'center', justifyContent: 'center' },
  imageText: { color: '#fff', ...type.meta, opacity: 0.8 },
  caption: { ...type.body, color: colors.text.primary, marginTop: space[3] },
  routeChip: { backgroundColor: colors.bg.surface, borderRadius: radius.md, padding: space[3], marginTop: space[3] },
  routeChipName: { ...type.meta, color: colors.text.primary, fontWeight: '700' },
  routeChipMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: space[2] },
  routeChipText: { ...type.meta, color: colors.text.secondary },
  actions: { flexDirection: 'row', gap: space[6], marginTop: space[3] },
  action: { ...type.meta, color: colors.text.secondary },
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
    ...shadow.fab,
  },
  composeIcon: { color: '#fff', fontSize: 28, lineHeight: 30 },
});
