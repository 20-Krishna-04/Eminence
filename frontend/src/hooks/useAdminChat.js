import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import api from '../services/api';

const API_BASE_URL = api.defaults.baseURL;

export const useAdminChat = (activeTab, token) => {
  const [activeChats, setActiveChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [replyText, setReplyText] = useState('');
  
  const socketRef = useRef(null);
  const selectedChatRef = useRef(selectedChat);

  useEffect(() => {
    selectedChatRef.current = selectedChat;
  }, [selectedChat]);

  useEffect(() => {
    if (activeTab !== 'chat') {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setSelectedChat(null);
      setChatMessages([]);
      return;
    }

    const socket = io(API_BASE_URL, {
      auth: { token }
    });
    socketRef.current = socket;

    socket.emit('join_admin');

    socket.on('chat_list', (list) => setActiveChats(list || []));
    socket.on('chat_list_update', (list) => setActiveChats(list || []));

    socket.on('chat_history', (data) => {
      const history = Array.isArray(data) ? data : (data?.messages || []);
      const targetId = data?.customerId;
      if (!targetId || targetId === selectedChatRef.current?.customerId) {
        setChatMessages(history);
      }
    });

    socket.on('receive_message', (msg) => {
      if (msg.customerId === selectedChatRef.current?.customerId) {
        setChatMessages((prev) => {
          if (msg.id && prev.some(m => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
      }
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [activeTab, token]);

  const selectChatRoom = (chat) => {
    const prevId = selectedChat?.customerId;
    setSelectedChat(chat);
    setChatMessages(chat.messages || []);

    if (socketRef.current) {
      socketRef.current.emit('admin_select_chat', {
        customerId: chat.customerId,
        previousCustomerId: prevId
      });
    }
  };

  const handleSendReply = (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedChat || !socketRef.current) return;

    socketRef.current.emit('send_message', {
      customerId: selectedChat.customerId,
      sender: 'admin',
      text: replyText,
      name: 'Admin Support'
    });

    setReplyText('');
  };

  return {
    activeChats,
    selectedChat,
    chatMessages,
    replyText,
    setReplyText,
    selectChatRoom,
    handleSendReply
  };
};
