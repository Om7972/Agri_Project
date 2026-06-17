import { useState, useCallback } from 'react';

export interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'USER' | 'ASSISTANT';
  content: string;
  createdAt: string;
}

// MandiPrime Base API URL configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

/**
 * Helper to retrieve stored auth tokens
 */
const getAuthHeaders = (): Record<string, string> => {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('mandiprime_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Hook for AI Crop Price Prediction
 */
export function useCropPricePrediction() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<unknown>(null);

  const predict = useCallback(async (crop: string, quantity: number, location: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/ai/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ crop, quantity, location }),
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.message || 'Failed to compute price prediction.');
      }
      setData(resData.data);
      return resData.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { predict, data, loading, error };
}

/**
 * Hook for AI Buyer-Seller Matching
 */
export function useBuyerSellerMatching() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [matchData, setMatchData] = useState<unknown>(null);

  const calculateMatch = useCallback(async (buyerId: string, sellerId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/ai/match?buyerId=${buyerId}&sellerId=${sellerId}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.message || 'Failed to calculate match score.');
      }
      setMatchData(resData.data);
      return resData.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { calculateMatch, matchData, loading, error };
}

/**
 * Hook for Personal Recommendations Engine
 */
export function useAiRecommendations() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<unknown>(null);

  const fetchRecommendations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/ai/recommend`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.message || 'Failed to retrieve recommendations.');
      }
      setRecommendations(resData.data);
      return resData.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { fetchRecommendations, recommendations, loading, error };
}

/**
 * Hook for Market Intelligence Dashboard Data
 */
export function useMarketIntelligence() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [intelligenceData, setIntelligenceData] = useState<unknown>(null);

  const fetchIntelligence = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/ai/intelligence`, {
        method: 'GET',
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.message || 'Failed to fetch market metrics.');
      }
      setIntelligenceData(resData.data);
      return resData.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { fetchIntelligence, intelligenceData, loading, error };
}

/**
 * Hook for AI Assistant Chat sessions
 */
export function useAiAssistant() {
  const [loading, setLoading] = useState(false);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  // 1. Fetch user's chat sessions
  const fetchSessions = useCallback(async () => {
    setSessionsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/ai/chat/sessions`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      const resData = await response.json();
      if (!response.ok) throw new Error(resData.message || 'Failed to load chat sessions.');
      setSessions(resData.data);
      return resData.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
    } finally {
      setSessionsLoading(false);
    }
  }, []);

  // 2. Create a new chat session
  const createSession = useCallback(async (title?: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/ai/chat/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ title }),
      });
      const resData = await response.json();
      if (!response.ok) throw new Error(resData.message || 'Failed to start chat session.');
      setSessions((prev) => [resData.data, ...prev]);
      setActiveSessionId(resData.data.id);
      setMessages([]);
      return resData.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // 3. Get messages for a session
  const fetchMessages = useCallback(async (sessionId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/ai/chat/sessions/${sessionId}/messages`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      const resData = await response.json();
      if (!response.ok) throw new Error(resData.message || 'Failed to retrieve message logs.');
      setMessages(resData.data);
      setActiveSessionId(sessionId);
      return resData.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // 4. Send message to assistant
  const sendMessage = useCallback(async (messageContent: string) => {
    if (!activeSessionId) {
      setError('No active chat session selected.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/ai/chat/sessions/${activeSessionId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ message: messageContent }),
      });
      const resData = await response.json();
      if (!response.ok) throw new Error(resData.message || 'Failed to transmit reply.');
      
      // Append user & assistant messages to current thread
      setMessages((prev) => [
        ...prev,
        resData.data.userMessage,
        resData.data.assistantMessage,
      ]);
      return resData.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [activeSessionId]);

  return {
    sessions,
    messages,
    activeSessionId,
    setActiveSessionId,
    fetchSessions,
    createSession,
    fetchMessages,
    sendMessage,
    loading,
    sessionsLoading,
    error,
  };
}
