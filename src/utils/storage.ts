import { WorkSession } from "@/types";

export const STORAGE_KEY = 'work-sessions';

export const getStoredSessions = (): WorkSession[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    const sessions = JSON.parse(stored);
    return sessions.map((session: any) => ({
      ...session,
      startTime: new Date(session.startTime),
      endTime: new Date(session.endTime),
      date: new Date(session.date)
    }));
  } catch {
    return [];
  }
};

export const saveSession = (session: WorkSession): void => {
  if (typeof window === 'undefined') return;
  
  const sessions = getStoredSessions();
  const existingIndex = sessions.findIndex(s => s.id === session.id);
  
  if (existingIndex >= 0) {
    sessions[existingIndex] = session;
  } else {
    sessions.push(session);
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
};

export const deleteSession = (sessionId: string): void => {
  if (typeof window === 'undefined') return;
  
  const sessions = getStoredSessions();
  const filtered = sessions.filter(s => s.id !== sessionId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
};

export const clearSessions = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
};