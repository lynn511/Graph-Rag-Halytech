// Mock API to simulate endpoints with latency

const sleep = (min = 500, max = 1200) => new Promise((r) => setTimeout(r, Math.floor(Math.random() * (max - min + 1)) + min));

/**
 * POST /api/triage
 * @param {{ userId: string, text: string }} body
 * @returns {Promise<{ route: 'knowledge'|'technical'|'clarify', intent: string, confidence: number, lead_score: number }>}
 */
export async function triage(body) {
  await sleep();
  const text = body.text.toLowerCase();
  if (text.includes('price') || text.includes('hour') || text.includes('demo')) {
    return { route: 'knowledge', intent: 'general_info', confidence: 0.9, lead_score: 0.6 };
  }
  if (text.includes('error') || text.includes('disconnect') || text.includes('crash') || text.includes('stopped')) {
    return { route: 'technical', intent: 'troubleshoot', confidence: 0.85, lead_score: 0.2 };
  }
  return { route: 'clarify', intent: 'unknown', confidence: 0.4, lead_score: 0.3 };
}

/**
 * POST /api/chat/knowledge
 * @param {{ userId: string, text: string, context?: any }} body
 */
export async function chatKnowledge(body) {
  await sleep();
  const text = body.text.toLowerCase();
  if (text.includes('hour')) {
    return {
      reply: 'Our business hours are Monday–Friday, 9am–6pm (EST).',
      citations: [
        { title: 'Support Hours', url: 'https://example.com/docs/hours' },
      ],
      suggested_replies: ['Do you offer demos?', 'How much does it cost?'],
      confidence: 0.92,
    };
  }
  if (text.includes('price') || text.includes('cost')) {
    return {
      reply: 'Pricing starts at $49/month for Starter and scales with usage.',
      citations: [
        { title: 'Pricing', url: 'https://example.com/pricing' },
      ],
      suggested_replies: ['Do you offer annual discounts?', 'Can I get a quote?'],
      confidence: 0.88,
    };
  }
  return {
    reply: 'I can help with features, hours, and pricing. What would you like to know?',
    citations: [],
    suggested_replies: ['What are your hours?', 'Tell me about features'],
    confidence: 0.75,
  };
}

/**
 * POST /api/chat/technical
 * @param {{ userId: string, text: string, attachments?: Array<{name:string,url:string,type:string}> }} body
 */
export async function chatTechnical(body) {
  await sleep();
  const base = {
    reply: 'Thanks. I reviewed your issue. Try restarting the service and checking network connectivity.',
    ticket_created: false,
    next_steps: 'If the problem persists, create a ticket and attach logs.',
  };
  const mayCreate = Math.random() > 0.6 || (body.text.toLowerCase().includes('disconnect') || body.text.toLowerCase().includes('stopped'));
  if (mayCreate) {
    const ticketId = `TCK-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${Math.floor(Math.random()*9000+1000)}`;
    return { ...base, ticket_created: true, ticket_id: ticketId };
  }
  return base;
}

/**
 * POST /api/lead
 * @param {{ name: string, email: string, company: string }} body
 */
export async function submitLead(body) {
  await sleep();
  return { success: true, lead_id: `LEAD-${Math.floor(Math.random()*1e6)}` };
}


