// Reusable chat UI with header, messages, input, quick replies, attachments
import React, { useEffect, useMemo, useRef, useState } from 'react';
import Message from './Message.jsx';
import QuickReply from './QuickReply.jsx';
import AttachmentUploader from './AttachmentUploader.jsx';
import { useChat } from '../contexts/ChatContext.jsx';
import { postKnowledge as chatKnowledge, postTechnical as chatTechnical } from '../lib/api/adapter.js';


/**
 * @param {Object} props
 * @param {'technical'|'knowledge'} props.agentType
 * @param {() => void} props.onClose
 */
export default function ChatWindow({ agentType, onClose }) {
  const { userId, activeAgent, messagesByAgent, addMessage, clearMessages, showSwitchBanner } = useChat();
  const messages = messagesByAgent[agentType];
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [quickReplies, setQuickReplies] = useState([]);

  const [attachments, setAttachments] = useState([]);

  const listRef = useRef(null);

  useEffect(() => {
    // Reset per agent switch
    setQuickReplies([]);
    setAttachments([]);
  }, [agentType]);

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, loading]);

  const theme = useMemo(() => agentType === 'technical' ? {
    header: 'bg-teal-600', accent: 'text-teal-100', dot: 'bg-teal-400',
  } : {
    header: 'bg-indigo-600', accent: 'text-indigo-100', dot: 'bg-indigo-400',
  }, [agentType]);

  const handleSend = async (text, opts = { skipTriage: false }) => {
    const trimmed = (text ?? input).trim();
    if (!trimmed) return;
    setInput('');
    addMessage(agentType, { id: Date.now(), role: 'user', text: trimmed });

    setLoading(true);
    try {
      let route = agentType;
  

      if (route === 'knowledge') {
        const res = await chatKnowledge({ userId, text: trimmed, context: {} });
        // Only keep the agent reply text (do not attach sources/citations to the message)
        addMessage('knowledge', { id: Date.now() + 1, role: 'agent', text: res.reply, confidence: res.confidence });
        setQuickReplies(res.suggested_replies || []);

      } else {
        const res = await chatTechnical({ userId, text: trimmed, attachments });
        addMessage('technical', { id: Date.now() + 2, role: 'agent', text: res.reply, ticket_created: res.ticket_created, ticket_id: res.ticket_id, next_steps: res.next_steps });
        setAttachments([]);
      }
    } catch (e) {
      addMessage(agentType, { id: Date.now() + 3, role: 'system', text: 'Something went wrong. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleTriageChoice = async (route) => {
    setShowTriage(false);
    await handleSend(input || 'Follow-up', { skipTriage: true });
  };

  const handleAttach = async (files) => {
    setAttachments(files);
    addMessage('technical', { id: Date.now() + 4, role: 'system', text: `${files.length} attachment(s) added.` });
    // Auto-send with a short message
    await handleSend('Please review the attached files.', { skipTriage: true });
  };

  const handleCreateTicket = async () => {
    await handleSend('Create ticket, please.', { skipTriage: true });
  };

  const handleLeadSubmit = async (e) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setLeadSubmitting(true);
    try {
      const res = await submitLead({
        name: form.get('name') || '',
        email: form.get('email') || '',
        company: form.get('company') || '',
      });
      if (res?.success) {
        addMessage('knowledge', { id: Date.now() + 5, role: 'system', text: 'Thanks! A specialist will reach out shortly.' });
        setShowLeadForm(false);
      }
    } finally {
      setLeadSubmitting(false);
    }
  };

  const headerTitle = agentType === 'technical' ? 'Technical Support' : 'Company Info (Virtual Guide)';

  return (
    <div className="fixed right-6 bottom-6 w-[800px] h-[800px] mx-auto rounded-t-2xl md:rounded-2xl overflow-hidden shadow-2xl glass" aria-live="polite">
      <div className={`${theme.header} text-white px-4 py-3 flex items-center justify-between`}>
        <div>
          <div className="font-semibold">{headerTitle}</div>
          <div className={`text-xs ${theme.accent} flex items-center gap-1`}>
            <span className={`w-2 h-2 rounded-full ${theme.dot}`}></span>
            Online
          </div>
        </div>
        <button onClick={onClose} className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white">Close</button>
      </div>

      {showSwitchBanner && (
        <div className="bg-amber-50 text-amber-800 text-xs px-4 py-2">You switched to {activeAgent === 'technical' ? 'Technical Support' : 'Company Info'}. Continue where you left off or start fresh.</div>
      )}

            <div ref={listRef} className="bg-gradient-to-b from-white to-gray-50 h-[calc(100%-180px)] overflow-y-auto p-6" role="log" aria-live="polite">
        {messages.map((m) => (
          <Message key={m.id} role={m.role} text={m.text}>
            {m.ticket_created && (
              <div className="mt-2 text-xs">
                <div className="font-medium">Ticket created: <span className="font-mono">{m.ticket_id}</span></div>
                <div className="mt-1 flex gap-2">
                  <button
                    className="px-2 py-1 rounded bg-gray-800 text-white"
                    onClick={() => navigator.clipboard.writeText(m.ticket_id)}
                  >
                    Copy ID
                  </button>
                  <a
                    href="https://example.com/tickets"
                    target="_blank"
                    rel="noreferrer"
                    className="px-2 py-1 rounded border"
                  >
                    View ticket
                  </a>
                </div>
              </div>
            )}
          </Message>
        ))}
        {loading && (
          <div className="flex justify-start mb-3">
            <div className="max-w-[80%] rounded-2xl px-4 py-2 bg-white border">
              <div className="typing-dots"><span></span><span></span><span></span></div>
            </div>
          </div>
        )}
      </div>

      {/* Quick replies */}
      {!!quickReplies.length && (
        <div className="px-4 py-2 bg-white border-t flex flex-wrap gap-2">
          {quickReplies.map((qr, i) => (
            <QuickReply key={i} label={qr} onClick={() => handleSend(qr)} />
          ))}
        </div>
      )}



      {/* Input Area */}
      <div className="bg-white/90 border-t p-3">
        {agentType === 'technical' && (
          <div className="mb-3">
            <AttachmentUploader onAttach={handleAttach} />
            <div className="mt-2 text-xs text-gray-600">Need logs? <button className="underline">Download logs</button></div>
          </div>
        )}
        <div className="flex items-end gap-2">
          <textarea
            aria-label="Type your message"
            rows={2}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Type a message..."
          />
          <button
            onClick={() => handleSend()}
            className={`px-4 py-2 rounded-lg text-white ${agentType==='technical'?'bg-teal-600 hover:bg-teal-700 focus:ring-teal-500':'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500'} focus:outline-none focus:ring-2`}
          >
            Send
          </button>
          <button
            onClick={() => clearMessages(agentType)}
            className="px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
          >
            Start fresh
          </button>
          {agentType === 'technical' && (
            <button
              onClick={handleCreateTicket}
              className="px-3 py-2 rounded-lg bg-teal-50 text-teal-700 border border-teal-200 text-sm"
            >
              Create ticket
            </button>
          )}
        </div>
      </div>


    </div>
  );
}


