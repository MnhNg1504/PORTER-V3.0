import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, radius, space, type, shadow } from '../../theme';
import { glass } from '../../theme/tokens';
import { mockChat, mockConversations, ChatMessage } from '../../lib/mockData';
import { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Chat'>;

// TAB 4 — Cửa sổ chat 1-1 + thanh ngữ cảnh cung (docs 02).
export function ChatScreen({ route }: Props) {
  const convo = mockConversations.find((c) => c.id === route.params.conversationId) ?? mockConversations[0];
  const [messages, setMessages] = useState<ChatMessage[]>(mockChat);
  const [text, setText] = useState('');

  const send = () => {
    if (!text.trim()) return;
    // TODO(api): gửi tin qua WebSocket; hiện chỉ thêm cục bộ.
    setMessages((m) => [...m, { id: `local_${Date.now()}`, fromMe: true, text }]);
    setText('');
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* Thanh ngữ cảnh cung */}
      {convo.routeName && (
        <View style={styles.routeCtx}>
          <Text style={styles.routeCtxText}>🥾 {convo.routeName} · Điểm XP ↗</Text>
        </View>
      )}
      <FlatList
        data={messages}
        keyExtractor={(m) => m.id}
        contentContainerStyle={{ padding: space[4] }}
        renderItem={({ item }) => (
          <View style={[styles.bubble, item.fromMe ? styles.bubbleMe : styles.bubbleOther]}>
            <Text style={item.fromMe ? styles.textMe : styles.textOther}>{item.text}</Text>
          </View>
        )}
      />
      <View style={styles.inputBar}>
        <Text style={styles.attach}>＋</Text>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="Soạn tin…"
          placeholderTextColor={colors.rock}
        />
        <Pressable style={styles.sendBtn} onPress={send}>
          <Text style={styles.sendIcon}>➤</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.base },
  routeCtx: {
    backgroundColor: colors.bg.surface,
    padding: space[3],
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  routeCtxText: { ...type.meta, color: colors.brand.primary, fontWeight: '700' },
  bubble: { maxWidth: '78%', borderRadius: radius.md, padding: space[3], marginBottom: space[2] },
  bubbleMe: {
    alignSelf: 'flex-end',
    backgroundColor: colors.brand.primary,
    borderBottomRightRadius: space[1],
    ...shadow.glassSoft,
  },
  bubbleOther: {
    alignSelf: 'flex-start',
    backgroundColor: colors.bg.surface,
    borderWidth: 1,
    borderColor: glass.border,
    borderBottomLeftRadius: space[1],
  },
  textMe: { color: colors.text.onLime, ...type.body },
  textOther: { color: colors.text.primary, ...type.body },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
    padding: space[3],
    backgroundColor: colors.bg.surface,
    borderTopWidth: 1,
    borderColor: colors.border,
  },
  attach: { fontSize: 24, color: colors.brand.primary },
  input: {
    flex: 1,
    backgroundColor: glass.fillSunk,
    borderWidth: 1,
    borderColor: glass.border,
    borderRadius: radius.pill,
    paddingHorizontal: space[4],
    paddingVertical: space[2],
    ...type.body,
    color: colors.text.primary,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.limeGlow,
  },
  sendIcon: { color: colors.text.onLime, fontSize: 18 },
});
