// Production-resilient API base URL resolution
const rawApiUrl = (import.meta.env.VITE_API_URL || '').trim();
export const API_URL = rawApiUrl
  ? (rawApiUrl.endsWith('/api') ? rawApiUrl : `${rawApiUrl.replace(/\/+$/, '')}/api`)
  : '/api';

export const LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' }
];

export const LEVELS = [
  { code: 'quick', name: 'Quick', description: 'Brief 2-3 sentence overview', icon: '⚡' },
  { code: 'tourist', name: 'Tourist', description: 'Engaging explanation for visitors', icon: '🏛️' },
  { code: 'student', name: 'Student', description: 'Detailed with terminology', icon: '📚' },
  { code: 'detailed', name: 'Detailed', description: 'Comprehensive analysis', icon: '🔍' }
];

export const CONFIDENCE_THRESHOLDS = {
  HIGH: 0.75,
  MEDIUM: 0.5,
  LOW: 0.3
};
