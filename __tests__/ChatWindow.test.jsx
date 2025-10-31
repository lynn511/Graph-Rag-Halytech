import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ChatWindow from '../src/components/ChatWindow.jsx';
import { ChatProvider } from '../src/contexts/ChatContext.jsx';

test('renders ChatWindow header', () => {
  render(
    <ChatProvider>
      <ChatWindow agentType="knowledge" onClose={() => {}} />
    </ChatProvider>
  );
  expect(screen.getByText('Company Info (Virtual Guide)')).toBeInTheDocument();
});


