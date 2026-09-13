import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../../context/AuthContext';

interface ChatMessage {
  id?: string;
  sender: 'admin' | 'customer';
  text: string;
  name?: string;
  timestamp?: string;
}

interface ActiveChat {
  customerId: string;
  customerName: string;
  messages: ChatMessage[];
}

export default function AdminSupportInboxScreen() {
  const router = useRouter();
  const { token } = useAuth();
  const [activeChats, setActiveChats] = useState<ActiveChat[]>([
    {
      customerId: 'cust-demo-1',
      customerName: 'Demo Customer (Rahul)',
      messages: [
        { sender: 'customer', text: 'Hello, when will my Tata Ace arrive at Koregaon Park?', timestamp: '11:02 AM' },
        { sender: 'admin', text: 'Hi Rahul, driver Ramesh is 4 minutes away at North Main Rd.', timestamp: '11:03 AM' },
      ],
    },
    {
      customerId: 'cust-demo-2',
      customerName: 'TechCorp Pune (B2B)',
      messages: [
        { sender: 'customer', text: 'Need a consolidated GST invoice for our multi-stop shipment.', timestamp: '10:45 AM' },
      ],
    },
  ]);
  const [selectedChat, setSelectedChat] = useState<ActiveChat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [replyText, setReplyText] = useState('');
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Default select first chat for immediate demo testing
    if (activeChats.length > 0 && !selectedChat) {
      setSelectedChat(activeChats[0]);
      setMessages(activeChats[0].messages);
    }

    const socketUrl = 'http://localhost:3000';
    const s = io(socketUrl, {
      auth: { token },
      transports: ['websocket'],
    });

    s.on('connect', () => {
      setConnected(true);
      s.emit('join_admin');
    });

    s.on('chat_list', (list: ActiveChat[]) => {
      if (list && list.length > 0) {
        setActiveChats(list);
      }
    });

    s.on('chat_list_update', (list: ActiveChat[]) => {
      if (list && list.length > 0) {
        setActiveChats(list);
      }
    });

    s.on('chat_history', (data: { customerId: string; messages: ChatMessage[] }) => {
      setMessages(data.messages || []);
    });

    s.on('new_message', (msg: { customerId: string; sender: string; text: string; name?: string }) => {
      const formatted: ChatMessage = {
        sender: msg.sender === 'admin' ? 'admin' : 'customer',
        text: msg.text,
        name: msg.name,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, formatted]);
    });

    s.on('disconnect', () => {
      setConnected(false);
    });

    socketRef.current = s;

    return () => {
      s.disconnect();
    };
  }, [token]);

  const handleSelectChat = (chat: ActiveChat) => {
    setSelectedChat(chat);
    setMessages(chat.messages || []);
    if (socketRef.current) {
      socketRef.current.emit('admin_select_chat', { customerId: chat.customerId });
    }
  };

  const handleSendMessage = () => {
    const text = replyText.trim();
    if (!text || !selectedChat) return;

    const newMsg: ChatMessage = {
      sender: 'admin',
      text,
      name: 'Eminence Support',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newMsg]);
    setReplyText('');

    if (socketRef.current) {
      socketRef.current.emit('send_message', {
        customerId: selectedChat.customerId,
        sender: 'admin',
        text,
        name: 'Support Agent',
      });
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Live Support (TC-036)</Text>
        <View style={styles.statusBadge}>
          <View style={[styles.dot, { backgroundColor: connected ? '#22c55e' : '#94a3b8' }]} />
          <Text style={styles.statusText}>{connected ? 'ONLINE' : 'SYNCED'}</Text>
        </View>
      </View>

      <View style={styles.layout}>
        {/* Horizontal Active Thread Selector */}
        <View style={styles.threadSelector}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {activeChats.map((chat) => {
              const isSelected = selectedChat?.customerId === chat.customerId;
              return (
                <TouchableOpacity
                  key={chat.customerId}
                  style={[styles.threadChip, isSelected && styles.threadChipActive]}
                  onPress={() => handleSelectChat(chat)}
                >
                  <Text style={[styles.threadChipText, isSelected && styles.threadChipTextActive]}>
                    💬 {chat.customerName}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Selected Customer Banner */}
        {selectedChat && (
          <View style={styles.recipientBar}>
            <View>
              <Text style={styles.recipientName}>{selectedChat.customerName}</Text>
              <Text style={styles.recipientSub}>Thread ID: {selectedChat.customerId}</Text>
            </View>
            <Text style={styles.verifiedTag}>Verified User</Text>
          </View>
        )}

        {/* Message Bubble Feed */}
        <ScrollView style={styles.messageFeed} contentContainerStyle={{ padding: 16, gap: 12 }}>
          {messages.map((msg, idx) => {
            const isAdmin = msg.sender === 'admin';
            return (
              <View
                key={idx}
                style={[
                  styles.bubbleContainer,
                  isAdmin ? styles.bubbleContainerAdmin : styles.bubbleContainerUser,
                ]}
              >
                <View style={[styles.bubble, isAdmin ? styles.bubbleAdmin : styles.bubbleUser]}>
                  <Text style={[styles.bubbleSender, isAdmin && { color: '#818cf8' }]}>
                    {isAdmin ? '🛡️ Admin Support' : msg.name || 'Customer'}
                  </Text>
                  <Text style={styles.bubbleText}>{msg.text}</Text>
                  {msg.timestamp && (
                    <Text style={styles.bubbleTime}>{msg.timestamp}</Text>
                  )}
                </View>
              </View>
            );
          })}
        </ScrollView>

        {/* Chat Input Bar */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            placeholder="Type your support reply..."
            placeholderTextColor="#64748b"
            value={replyText}
            onChangeText={setReplyText}
            onSubmitEditing={handleSendMessage}
          />
          <TouchableOpacity style={styles.sendBtn} onPress={handleSendMessage}>
            <Text style={styles.sendBtnText}>Send</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 52,
    paddingBottom: 16,
    backgroundColor: '#1e293b',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  backBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#334155',
  },
  backBtnText: {
    color: '#cbd5e1',
    fontWeight: '600',
    fontSize: 13,
  },
  title: {
    color: '#f8fafc',
    fontSize: 17,
    fontWeight: '700',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0f172a',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '700',
  },
  layout: {
    flex: 1,
  },
  threadSelector: {
    backgroundColor: '#1e293b',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  threadChip: {
    backgroundColor: '#0f172a',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  threadChipActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  threadChipText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
  },
  threadChipTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  recipientBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  recipientName: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  recipientSub: {
    color: '#64748b',
    fontSize: 11,
  },
  verifiedTag: {
    color: '#22c55e',
    fontSize: 11,
    fontWeight: '700',
  },
  messageFeed: {
    flex: 1,
  },
  bubbleContainer: {
    flexDirection: 'row',
  },
  bubbleContainerAdmin: {
    justifyContent: 'flex-end',
  },
  bubbleContainerUser: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 14,
  },
  bubbleAdmin: {
    backgroundColor: '#312e81',
    borderTopRightRadius: 2,
    borderWidth: 1,
    borderColor: '#4338ca',
  },
  bubbleUser: {
    backgroundColor: '#1e293b',
    borderTopLeftRadius: 2,
    borderWidth: 1,
    borderColor: '#334155',
  },
  bubbleSender: {
    color: '#38bdf8',
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 4,
  },
  bubbleText: {
    color: '#ffffff',
    fontSize: 14,
    lineHeight: 19,
  },
  bubbleTime: {
    color: '#94a3b8',
    fontSize: 9,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  inputBar: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#1e293b',
    borderTopWidth: 1,
    borderTopColor: '#334155',
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: '#0f172a',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: '#ffffff',
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  sendBtn: {
    backgroundColor: '#2563eb',
    borderRadius: 10,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 13,
  },
});
