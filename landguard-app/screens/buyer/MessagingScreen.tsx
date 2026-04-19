import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  useColorScheme,
  FlatList,
  TouchableOpacity,
  TextInput as RNTextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { messagesAPI } from '../../lib/api';
import { onNotification, getSocket } from '../../lib/socket';

// ── Conversation List View ─────────────────────────────────────────────────────
export const ConversationListScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConversations = useCallback(async () => {
    try {
      const res = await messagesAPI.getConversations();
      setConversations(res.data?.data || []);
    } catch {
      setConversations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
    // Refresh conversation list when a new message notification comes in
    const unsub = onNotification(() => { fetchConversations(); });
    return () => unsub();
  }, [fetchConversations]);

  const getOtherParticipant = (conv: any) => {
    const others = (conv.participants || []).filter((p: any) => p._id !== undefined);
    return others[0];
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
        <View style={styles.centred}><ActivityIndicator size="large" color="#3b82f6" /></View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, isDark && styles.textDark]}>Messages</Text>
      </View>

      {conversations.length === 0 ? (
        <View style={styles.centred}>
          <Text style={[styles.emptyText, isDark && styles.textMutedDark]}>
            No conversations yet.{'\n'}Contact a seller from a property listing.
          </Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => {
            const other = getOtherParticipant(item);
            const name = other
              ? `${other.personalInfo?.firstName ?? ''} ${other.personalInfo?.lastName ?? ''}`.trim() || 'Seller'
              : 'Seller';
            return (
              <TouchableOpacity
                style={[styles.convRow, isDark && styles.convRowDark]}
                onPress={() => navigation.navigate('Chat', { conversationId: item._id, otherName: name, propertyTitle: item.propertyId?.title })}
              >
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{name.charAt(0).toUpperCase()}</Text>
                </View>
                <View style={styles.convInfo}>
                  <Text style={[styles.convName, isDark && styles.textDark]}>{name}</Text>
                  {item.propertyId?.title && (
                    <Text style={[styles.convPropTitle, isDark && styles.textMutedDark]} numberOfLines={1}>
                      re: {item.propertyId.title}
                    </Text>
                  )}
                  {item.lastMessage?.text && (
                    <Text style={[styles.convLastMsg, isDark && styles.textMutedDark]} numberOfLines={1}>
                      {item.lastMessage.text}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
};

// ── Chat View ─────────────────────────────────────────────────────────────────
export const ChatScreen: React.FC<{ navigation: any; route: any }> = ({ navigation, route }) => {
  const { conversationId, otherName, propertyTitle } = route.params;
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    navigation.setOptions({ title: otherName || 'Chat' });
  }, [otherName, navigation]);

  const fetchMessages = useCallback(async () => {
    try {
      const res = await messagesAPI.getMessages(conversationId);
      setMessages(res.data?.data || []);
    } catch {
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    fetchMessages();
    // Real-time: listen for new notifications and refresh messages
    const unsub = onNotification((payload) => {
      if (payload.data && (payload.data as any).conversationId === conversationId) {
        fetchMessages();
      }
    });
    return () => unsub();
  }, [fetchMessages, conversationId]);

  const handleSend = async () => {
    const text = inputText.trim();
    if (!text) return;
    setInputText('');
    setSending(true);
    try {
      const res = await messagesAPI.sendMessage(conversationId, text);
      setMessages((prev) => [...prev, res.data.data]);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    } catch {
      Alert.alert('Error', 'Could not send message. Please try again.');
      setInputText(text);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
        <View style={styles.centred}><ActivityIndicator size="large" color="#3b82f6" /></View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      {propertyTitle && (
        <View style={[styles.propBanner, isDark && styles.propBannerDark]}>
          <Text style={[styles.propBannerText, isDark && styles.textMutedDark]} numberOfLines={1}>
            📋 {propertyTitle}
          </Text>
        </View>
      )}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => {
            const isMe = item.senderId?._id === undefined; // populated senderId vs own
            const senderName = item.senderId?.personalInfo?.firstName
              ? `${item.senderId.personalInfo.firstName} ${item.senderId.personalInfo.lastName ?? ''}`
              : null;
            return (
              <View style={[styles.msgWrapper, isMe ? styles.msgRight : styles.msgLeft]}>
                <View style={[styles.bubble, isDark && styles.bubbleDark, isMe && styles.bubbleMe]}>
                  {senderName && !isMe && (
                    <Text style={styles.senderName}>{senderName}</Text>
                  )}
                  <Text style={[styles.msgText, isMe && styles.msgTextMe]}>{item.body}</Text>
                </View>
              </View>
            );
          }}
          contentContainerStyle={styles.msgList}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
        />

        <View style={[styles.inputBar, isDark && styles.inputBarDark]}>
          <RNTextInput
            style={[styles.textInput, isDark && styles.textInputDark]}
            placeholder="Type a message…"
            placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            onPress={handleSend}
            disabled={sending || !inputText.trim()}
            style={[styles.sendBtn, (!inputText.trim() || sending) && styles.sendBtnDisabled]}
          >
            <Text style={styles.sendBtnText}>{sending ? '…' : '➤'}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  containerDark: { backgroundColor: '#111827' },
  centred: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  emptyText: { fontSize: 15, color: '#6b7280', textAlign: 'center', lineHeight: 22 },
  textDark: { color: '#f3f4f6' },
  textMutedDark: { color: '#9ca3af' },
  header: { paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#1f2937' },
  // Conversation list
  convRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#e5e7eb' },
  convRowDark: { borderBottomColor: '#374151' },
  avatar: { width: 46, height: 46, borderRadius: 23, backgroundColor: '#3b82f6', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  convInfo: { flex: 1 },
  convName: { fontSize: 15, fontWeight: '600', color: '#1f2937' },
  convPropTitle: { fontSize: 12, color: '#6b7280', marginTop: 1 },
  convLastMsg: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  // Chat
  propBanner: { paddingHorizontal: 16, paddingVertical: 6, backgroundColor: '#eff6ff', borderBottomWidth: 1, borderBottomColor: '#bfdbfe' },
  propBannerDark: { backgroundColor: '#1e3a5f', borderBottomColor: '#2563eb' },
  propBannerText: { fontSize: 13, color: '#1d4ed8' },
  msgList: { padding: 16 },
  msgWrapper: { marginBottom: 10 },
  msgLeft: { alignItems: 'flex-start' },
  msgRight: { alignItems: 'flex-end' },
  bubble: { maxWidth: '75%', backgroundColor: '#f3f4f6', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10 },
  bubbleDark: { backgroundColor: '#374151' },
  bubbleMe: { backgroundColor: '#3b82f6' },
  senderName: { fontSize: 11, fontWeight: '600', color: '#6b7280', marginBottom: 3 },
  msgText: { fontSize: 14, color: '#1f2937' },
  msgTextMe: { color: '#fff' },
  // Input bar
  inputBar: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 12, paddingVertical: 8, borderTopWidth: 1, borderTopColor: '#e5e7eb', backgroundColor: '#fff' },
  inputBarDark: { backgroundColor: '#111827', borderTopColor: '#374151' },
  textInput: { flex: 1, backgroundColor: '#f9fafb', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, fontSize: 14, color: '#1f2937', maxHeight: 100, marginRight: 8 },
  textInputDark: { backgroundColor: '#1f2937', color: '#f3f4f6' },
  sendBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#3b82f6', justifyContent: 'center', alignItems: 'center' },
  sendBtnDisabled: { backgroundColor: '#93c5fd' },
  sendBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' }
});

export default ConversationListScreen;
