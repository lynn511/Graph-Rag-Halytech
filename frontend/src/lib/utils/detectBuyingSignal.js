// Simple keyword-based buying signal detector

const KEYWORDS = [
  'price', 'pricing', 'quote', 'buy', 'purchase', 'demo', 'trial', 'plan', 'cost'
];

export function detectBuyingSignal(text) {
  if (!text) return false;
  const t = text.toLowerCase();
  return KEYWORDS.some((k) => t.includes(k));
}


