// src/utils/conversationStorage.ts
import { ChatMessage } from './chatEngine';
import type { SupportedLang } from '../types/lang';

export interface StoredConversation {
  id: string;
  title: string;
  language: SupportedLang;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

const API = 'http://localhost:8000';

const authHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('trak_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

/** Handles 401 by clearing the token and redirecting to /auth. */
const handleUnauthorized = (res: Response): void => {
  if (res.status === 401) {
    localStorage.removeItem('trak_token');
    window.location.href = '/auth';
  }
};

export const createConversationId = (): string =>
  `conv_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

export const generateTitle = (messages: ChatMessage[]): string => {
  const firstUser = messages.find((m) => m.sender === 'user');
  if (!firstUser) return 'New conversation';
  const text = firstUser.text.trim();
  return text.length > 40 ? text.slice(0, 38) + '…' : text;
};

export const saveConversation = async (
  id: string,
  messages: ChatMessage[],
  title: string,
  language: SupportedLang = 'en',
): Promise<void> => {
  try {
    const payload = {
      id,
      title,
      language,
      messages: messages.map((m) => ({
        id: m.id,
        text: m.text,
        sender: m.sender,
        timestamp: m.timestamp instanceof Date
          ? m.timestamp.toISOString()
          : String(m.timestamp),
      })),
    };
    const res = await fetch(`${API}/conversations/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });
    handleUnauthorized(res);
  } catch (e) {
    console.warn('TRAK: failed to save conversation', e);
  }
};

export const loadConversation = async (
  id: string,
): Promise<StoredConversation | null> => {
  try {
    const res = await fetch(`${API}/conversations/${id}`, {
      headers: authHeaders(),
    });
    handleUnauthorized(res);
    if (!res.ok) return null;
    const data = await res.json();
    return {
      id: data.id,
      title: data.title,
      language: data.language as SupportedLang,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      messages: (data.messages as any[]).map((m) => ({
        ...m,
        timestamp: new Date(m.timestamp),
      })),
    };
  } catch {
    return null;
  }
};

export const loadAllConversations = async (): Promise<
  Omit<StoredConversation, 'messages'>[]
> => {
  try {
    const res = await fetch(`${API}/conversations/`, {
      headers: authHeaders(),
    });
    handleUnauthorized(res);
    if (!res.ok) return [];
    const data: any[] = await res.json();
    return data.map((d) => ({
      id: d.id,
      title: d.title,
      language: d.language as SupportedLang,
      createdAt: d.created_at,
      updatedAt: d.updated_at,
    }));
  } catch {
    return [];
  }
};

export const deleteConversation = async (id: string): Promise<void> => {
  try {
    const res = await fetch(`${API}/conversations/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    handleUnauthorized(res);
  } catch (e) {
    console.warn('TRAK: failed to delete conversation', e);
  }
};