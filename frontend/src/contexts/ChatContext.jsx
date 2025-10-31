// ChatContext provides activeAgent, messages, and persistence
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { loadSession, saveSession } from '../lib/utils/localStorage.js';

const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  const [userId] = useState(() => {
    const existing = typeof crypto !== 'undefined' && crypto.randomUUID ? null : null;
    const saved = window.localStorage.getItem('hub_user_id');
    if (saved) return saved;
    const id = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : `user-${Date.now()}`;
    window.localStorage.setItem('hub_user_id', id);
    return id;
  });

  const [activeAgent, setActiveAgent] = useState('knowledge'); // 'knowledge' | 'technical'
  const [messagesByAgent, setMessagesByAgent] = useState(() => ({
    knowledge: loadSession(userId, 'knowledge')?.messages || [],
    technical: loadSession(userId, 'technical')?.messages || [],
  }));
  const [showSwitchBanner, setShowSwitchBanner] = useState(false);

  // Persist on changes
  useEffect(() => {
    saveSession(userId, 'knowledge', { messages: messagesByAgent.knowledge });
  }, [messagesByAgent.knowledge, userId]);

  useEffect(() => {
    saveSession(userId, 'technical', { messages: messagesByAgent.technical });
  }, [messagesByAgent.technical, userId]);

  const switchAgent = (agentType) => {
    if (agentType !== activeAgent) {
      setActiveAgent(agentType);
      setShowSwitchBanner(true);
      setTimeout(() => setShowSwitchBanner(false), 2500);
    }
  };

  const addMessage = (agentType, message) => {
    setMessagesByAgent((prev) => ({
      ...prev,
      [agentType]: [...prev[agentType], message],
    }));
  };

  const clearMessages = (agentType) => {
    setMessagesByAgent((prev) => ({
      ...prev,
      [agentType]: [],
    }));
  };

  const value = useMemo(() => ({
    userId,
    activeAgent,
    messages: messagesByAgent[activeAgent],
    messagesByAgent,
    switchAgent,
    addMessage,
    clearMessages,
    showSwitchBanner,
  }), [userId, activeAgent, messagesByAgent, showSwitchBanner]);

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat must be used within ChatProvider');
  return ctx;
}


