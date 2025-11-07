import { api } from './adapter';
import axios from 'axios';

export const submitTicket = async (ticketData) => {
  // Submit to our backend
  const response = await api.post('/api/tickets', ticketData);
  if (!response.data.ticketId) {
    response.data.ticketId = `TKT-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }

  // Also submit to webhook
  try {
    const webhookData = {
      ticketId: response.data.ticketId,
      userInfo: {
        fullName: ticketData.fullName,
        email: ticketData.email,
        company: ticketData.company || ''
      },
      ticketDetails: {
        title: ticketData.title,
        description: ticketData.description,
        urgency: ticketData.urgency
      }
    };

    await axios.post(
      'http://localhost:5678/webhook-test/ddd3d13a-3a44-44bf-b7bc-5da41f56e942',
      webhookData
    );
  } catch (webhookError) {
    console.error('Webhook submission error:', webhookError);
    // We don't throw this error since the ticket was already created successfully
  }

  return response.data;
};

