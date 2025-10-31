// Single message bubble (role: user/agent/system)
import React from 'react';

/**
 * @param {Object} props
 * @param {'user'|'agent'|'system'} props.role
 * @param {string} props.text
 * @param {React.ReactNode} [props.children]
 */
export default function Message({ role = 'agent', text, children }) {
  const isUser = role === 'user';
  const isSystem = role === 'system';
  const bubbleClasses = isUser
    ? 'bg-indigo-600 text-white'
    : isSystem
      ? 'bg-gray-100 text-gray-700'
      : 'bg-white text-gray-900 border';
  const align = isUser ? 'justify-end' : 'justify-start';

  return (
    <div className={`flex ${align} mb-3`} role="article">
      <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${bubbleClasses}`}>
        <div className="whitespace-pre-wrap text-sm">{text}</div>
        {children}
      </div>
    </div>
  );
}


