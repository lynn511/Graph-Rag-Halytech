import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import AgentCard from '../src/components/AgentCard.jsx';

test('renders AgentCard and triggers start', () => {
  const onStart = jest.fn();
  render(
    <AgentCard title="Technical Support" description="Help" badge="Ticket" theme="technical" onStart={onStart} />
  );
  expect(screen.getByText('Technical Support')).toBeInTheDocument();
  fireEvent.click(screen.getByText('Start chat'));
  expect(onStart).toHaveBeenCalled();
});


