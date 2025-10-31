// Real adapter skeleton using axios. Point baseURL to your backend when available.
import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:8000',
  timeout: 15000,
});

// Example wrappers (unused in mock-only mode). Replace with your endpoints later.
export async function postTriage(payload) {
  const { data } = await api.post('/api/triage', payload);
  return data;
}
export async function postKnowledge(payload) {
  const { data } = await api.post('/api/chat/knowledge', payload);
  return data;
}
export async function postTechnical(payload) {
  const { data } = await api.post('/api/chat/technical', payload);
  return data;
}
export async function postLead(payload) {
  const { data } = await api.post('/api/lead', payload);
  return data;
}


