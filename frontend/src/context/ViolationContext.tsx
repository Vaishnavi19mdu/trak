// src/context/ViolationContext.tsx
import React, { createContext, useContext, useState, useCallback } from 'react';

// ─────────────────────────────────────────────
// Simulated driver profiles
// ─────────────────────────────────────────────
export interface DriverProfile {
  id: string;
  name: string;
  avatar: string; // initials
  violationHistory: string[];
}

export const SIMULATED_PROFILES: DriverProfile[] = [
  {
    id: 'safe',
    name: 'Arun (Safe Driver)',
    avatar: 'AR',
    violationHistory: ['wrong_parking'],
  },
  {
    id: 'moderate',
    name: 'Priya (Moderate Risk)',
    avatar: 'PR',
    violationHistory: ['no_helmet', 'signal_jump', 'no_seatbelt'],
  },
  {
    id: 'high',
    name: 'Karthik (High Risk)',
    avatar: 'KA',
    violationHistory: ['drunk_drive', 'overspeeding', 'no_helmet', 'mobile_use', 'signal_jump'],
  },
  {
    id: 'you',
    name: 'You',
    avatar: 'ME',
    violationHistory: [],
  },
];

// ─────────────────────────────────────────────
// Risk score logic
// Each violation id maps to penalty points (from rules.json)
// Score = 100 - (total points * 5), floored at 0
// ─────────────────────────────────────────────
const POINTS_MAP: Record<string, number> = {
  no_helmet: 2,
  overspeeding: 3,
  signal_jump: 3,
  drunk_drive: 6,
  triple_riding: 2,
  no_seatbelt: 1,
  wrong_parking: 1,
  mobile_use: 4,
  no_insurance: 2,
  expired_license: 3,
  no_puc: 2,
  dangerous_driving: 5,
  no_number_plate: 2,
};

export const computeRiskScore = (historyIds: string[]): number => {
  const total = historyIds.reduce((sum, id) => sum + (POINTS_MAP[id] ?? 0), 0);
  return Math.max(0, 100 - total * 5);
};

export const getRiskLabel = (score: number): { text: string; color: string } => {
  if (score >= 80) return { text: 'Safe Driver Profile', color: 'success.main' };
  if (score >= 50) return { text: 'Moderate Risk Profile', color: 'warning.main' };
  return { text: 'High Risk Driver Profile', color: 'error.main' };
};

// ─────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────
interface ViolationContextType {
  violationHistory: string[];
  addViolation: (id: string) => void;
  clearHistory: () => void;
  activeProfileId: string;
  setActiveProfileId: (id: string) => void;
  riskScore: number;
}

const ViolationContext = createContext<ViolationContextType | null>(null);

export const ViolationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeProfileId, setActiveProfileId] = useState<string>('you');
  const [customHistory, setCustomHistory] = useState<string[]>([]);

  // If active profile is 'you', use customHistory; otherwise use the simulated profile's history
  const violationHistory =
    activeProfileId === 'you'
      ? customHistory
      : SIMULATED_PROFILES.find(p => p.id === activeProfileId)?.violationHistory ?? [];

  const riskScore = computeRiskScore(violationHistory);

  const addViolation = useCallback((id: string) => {
    // Always adds to the 'you' profile and switches to it
    setActiveProfileId('you');
    setCustomHistory(prev => [...prev, id]);
  }, []);

  const clearHistory = useCallback(() => {
    setCustomHistory([]);
  }, []);

  const handleSetActiveProfileId = useCallback((id: string) => {
    setActiveProfileId(id);
  }, []);

  return (
    <ViolationContext.Provider
      value={{
        violationHistory,
        addViolation,
        clearHistory,
        activeProfileId,
        setActiveProfileId: handleSetActiveProfileId,
        riskScore,
      }}
    >
      {children}
    </ViolationContext.Provider>
  );
};

export const useViolations = (): ViolationContextType => {
  const ctx = useContext(ViolationContext);
  if (!ctx) throw new Error('useViolations must be used inside <ViolationProvider>');
  return ctx;
};