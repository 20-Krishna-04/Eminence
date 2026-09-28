import { MessageSquare, Send } from 'lucide-react';
import { useAdminChat } from '../../hooks/useAdminChat';
import { useRef, useEffect } from 'react';

const ChatInbox = ({ activeTab, token }) => {
  const {
    activeChats,
    selectedChat,
    chatMessages,
    replyText,
    setReplyText,
    selectChatRoom,
    handleSendReply
  } = useAdminChat(activeTab, token);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, selectedChat]);

  return (
    <div className="space-y-6 h-[75vh] flex flex-col">
      <h1 className="text-3xl font-bold text-loft-50 font-serif">Support Inbox</h1>

      <div className="flex-grow flex bg-loft-900 border border-loft-800 rounded-2xl overflow-hidden min-h-0">
        <div className="w-1/3 border-r border-loft-800 flex flex-col">
          <div className="p-4 border-b border-loft-800">
            <p className="text-xs font-bold text-loft-400 uppercase tracking-wider">Active Conversations</p>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-loft-800/40">
            {activeChats.length === 0 ? (
              <div className="p-8 text-center text-loft-400 text-xs">No active tickets.</div>
            ) : (
              activeChats.map((chat) => {
                const isSelected = selectedChat?.customerId === chat.customerId;
                const lastMsg = chat.messages[chat.messages.length - 1];
                return (
                  <button
                    key={chat.customerId}
                    onClick={() => selectChatRoom(chat)}
                    className={`w-full text-left p-4 hover:bg-loft-800/50 transition-colors block cursor-pointer ${
                      isSelected ? 'bg-loft-800 border-l-4 border-copper-500' : ''
                    }`}
                  >
                    <p className="font-bold text-loft-100 text-sm truncate">{chat.customerName}</p>
                    <p className="text-xs text-loft-400 truncate mt-1">
                      {lastMsg ? `${lastMsg.name}: ${lastMsg.text}` : 'No messages yet'}
                    </p>
                  </button>
                );
              })
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col bg-loft-950/20">
          {selectedChat ? (
            <>
              <div className="p-4 border-b border-loft-800 flex items-center justify-between bg-loft-950/40">
                <div>
                  <p className="font-bold text-loft-50 font-serif text-sm">{selectedChat.customerName}</p>
                  <p className="text-[10px] text-moss-500 font-bold uppercase tracking-wider">Room: {selectedChat.customerId.split('-')[0]}</p>
                </div>
              </div>

              <div className="flex-grow p-6 overflow-y-auto space-y-4 flex flex-col min-h-0">
                {chatMessages.map((msg, index) => {
                  const isMe = msg.sender === 'admin';
                  return (
                    <div
                      key={index}
                      className={`max-w-[70%] rounded-2xl p-3 text-xs leading-relaxed ${
                        isMe
                          ? 'bg-copper-500 text-white self-end rounded-tr-none'
                          : 'bg-loft-900 text-loft-100 border border-loft-800 self-start rounded-tl-none'
                      }`}
                    >
                      <p className="font-bold mb-0.5 text-[9px] opacity-75">
                        {isMe ? 'You' : msg.name || 'Customer'}
                      </p>
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                      <span className="block text-[8px] opacity-50 mt-1 text-right">
                        {msg.time}
                      </span>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={handleSendReply} className="p-4 border-t border-loft-800 bg-loft-900 flex gap-3">
                <input
                  type="text"
                  placeholder="Type your response..."
                  className="flex-1 input-field py-3 text-xs"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                />
                <button
                  type="submit"
                  disabled={!replyText.trim()}
                  className="btn-primary p-3 rounded-xl disabled:opacity-50 cursor-pointer"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-loft-400 text-sm">
              <MessageSquare className="w-12 h-12 text-loft-800 mb-3" />
              Select a conversation to start chatting in real-time.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatInbox;
