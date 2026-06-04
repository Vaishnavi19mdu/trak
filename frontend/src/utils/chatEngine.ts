// src/utils/chatEngine.ts
import rulesData from '../data/rules.json';

export interface Violation {
  id: string;
  name: string;
  fine: number;
  section: string;
  points: number;
  keywords: string[];
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export interface ChatEngineSession {
  pendingViolation: Violation | null;
  confirmationStep: number;
}

export const createSession = (): ChatEngineSession => ({
  pendingViolation: null,
  confirmationStep: 0,
});

const violations: Violation[] = rulesData.violations;

const isAffirmative = (text: string): boolean => {
  const words = ['yes', 'yeah', 'yep', 'ok', 'sure', 'correct'];
  return words.some(word => text.toLowerCase().includes(word));
};

const OFFICIAL_LINKS = `
**Official Resources:**
• [Parivahan Portal](https://parivahan.gov.in)
• [E-Challan Portal](https://echallan.parivahan.gov.in)
• [DL Services (Sarathi)](https://sarathi.parivahan.gov.in)`;

// ─────────────────────────────────────────────
// Groq Fallback (llama-3.3-70b-instant)
// ─────────────────────────────────────────────
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY as string;

const SYSTEM_PROMPT = `You are TRAK, a Tamil Nadu traffic law assistant embedded in a driver safety app. You help drivers understand traffic violations, fines, penalty points, and related legal information under the Motor Vehicles Act of India.

Rules:
- Keep answers concise (3–5 sentences max) and friendly.
- Always respond in the same language the user writes in.
- If a question is unrelated to traffic, driving, or vehicles, politely say you can only help with traffic-related topics.
- Never make up fine amounts or legal sections. Use only the known violations listed below.
- Format responses with markdown where helpful (bold for key terms, bullet points for lists).

Known violations in Tamil Nadu:
- No Helmet: ₹1,000 | MV Act 194D | 2 pts
- Overspeeding: ₹1,000 | MV Act 183 | 3 pts
- Signal Jumping: ₹1,000 | MV Act 177 | 3 pts
- Drunk Driving: ₹10,000 | MV Act 185 | 6 pts
- Triple Riding: ₹1,000 | MV Act 128 | 2 pts
- No Seatbelt: ₹1,000 | MV Act 194B | 1 pt
- Wrong Parking: ₹500 | MV Act 122 | 1 pt
- Mobile use while driving: ₹5,000 | MV Act 184 | 4 pts
- No Insurance: ₹2,000 | MV Act 196 | 2 pts
- Expired License: ₹5,000 | MV Act 3/181 | 3 pts
- No PUC Certificate: ₹1,000 | MV Act 190(2) | 2 pts
- Dangerous Driving: ₹5,000 | MV Act 184 | 5 pts
- No Number Plate: ₹500 | MV Act 192 | 2 pts`;

async function callGroqFallback(userQuery: string): Promise<string> {
  if (!GROQ_API_KEY) {
    return getFallbackSuggestion();
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 300,
        temperature: 0.4,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userQuery },
        ],
      }),
    });

    if (!response.ok) return getFallbackSuggestion();

    const data = await response.json();
    const text: string = data?.choices?.[0]?.message?.content?.trim() ?? '';
    return text || getFallbackSuggestion();
  } catch {
    return getFallbackSuggestion();
  }
}

function getFallbackSuggestion(): string {
  return (
    "I'm having trouble connecting right now. You can still ask me about:\n" +
    '- Specific fines (e.g., "helmet fine", "mobile while driving")\n' +
    '- How to pay a challan\n' +
    '- Your risk score\n' +
    '- Required documents while driving'
  );
}

// ─────────────────────────────────────────────
// Core engine
// ─────────────────────────────────────────────
export const findViolation = (query: string): Violation | undefined => {
  const lowerQuery = query.toLowerCase();
  return violations.find(v => v.keywords.some(k => lowerQuery.includes(k)));
};

export const processQuery = (
  query: string,
  session: ChatEngineSession,
  addViolation: (id: string) => void,
): string | null => {
  const lowerQuery = query.toLowerCase();

  // Confirmation step 1: did this happen recently?
  if (session.confirmationStep === 1) {
    if (isAffirmative(lowerQuery)) {
      session.confirmationStep = 2;
      return 'Should I include this in your driving history to improve your risk insights?';
    } else {
      session.confirmationStep = 0;
      session.pendingViolation = null;
      return 'Alright, not recorded. You can still check fines, explore your risk score, or ask about another violation.';
    }
  }

  // Confirmation step 2: add to history?
  if (session.confirmationStep === 2) {
    if (isAffirmative(lowerQuery)) {
      if (session.pendingViolation) {
        addViolation(session.pendingViolation.id);
      }
      session.confirmationStep = 0;
      session.pendingViolation = null;
      return '✅ Added to your driving history. Your risk score has been updated!';
    } else {
      session.confirmationStep = 0;
      session.pendingViolation = null;
      return 'Alright, not recorded. You can still check fines, explore your risk score, or ask about another violation.';
    }
  }

  // Follow-up
  if (['then', 'next', 'what next'].includes(lowerQuery)) {
    return 'You can:\n- Check a violation fine\n- Ask about your risk score\n- Explore alerts\n\nWhat would you like to do?';
  }

  // Intent: Payment
  if (lowerQuery.includes('pay') || lowerQuery.includes('payment') || lowerQuery.includes('how to pay')) {
    return handlePaymentQuery();
  }

  // Intent: License
  if (lowerQuery.includes('license') || lowerQuery.includes('dl') || lowerQuery.includes('renewal')) {
    return handleLicenseQuery();
  }

  // Intent: Documents
  if (lowerQuery.includes('document') || lowerQuery.includes('carry') || lowerQuery.includes('puc') || lowerQuery.includes('insurance')) {
    return handleDocumentsQuery();
  }

  // Intent: Unpaid
  if (lowerQuery.includes("don't pay") || lowerQuery.includes('unpaid') || lowerQuery.includes('what happens')) {
    return handleUnpaidQuery();
  }

  // Intent: Risk score
  if (lowerQuery.includes('risk') || lowerQuery.includes('score')) {
    return handleRiskQuery();
  }

  const violation = findViolation(query);

  // Intent: Fine amount
  if (lowerQuery.includes('fine') || lowerQuery.includes('how much')) {
    return handleFineQuery(violation);
  }

  // Intent: Contest / paid wrong amount
  if (lowerQuery.includes('paid') || lowerQuery.includes('contest') || lowerQuery.includes('wrong')) {
    return handleContestQuery(violation);
  }

  // Violation detected — start detective flow
  if (violation) {
    session.pendingViolation = violation;
    session.confirmationStep = 1;
    return `Got it. That looks like a **${violation.name}** violation. Just checking — did this happen recently?`;
  }

  return null; // signal Groq fallback
};

// ─────────────────────────────────────────────
// Main entry point for ChatBox
// ─────────────────────────────────────────────
export const processQueryWithFallback = async (
  query: string,
  session: ChatEngineSession,
  addViolation: (id: string) => void,
): Promise<string> => {
  const localResult = processQuery(query, session, addViolation);
  if (localResult !== null) return localResult;
  return await callGroqFallback(query);
};

// ─────────────────────────────────────────────
// Intent handlers
// ─────────────────────────────────────────────
export const handleFineQuery = (violation?: Violation): string => {
  if (!violation)
    return 'Which fine are you asking about? Try "helmet fine", "seatbelt", or "mobile while driving".';
  let extra = '';
  if (violation.id === 'no_helmet') extra = '\n\nNote: Helmets must be ISI certified and strapped properly.';
  if (violation.id === 'drunk_drive') extra = '\n\n⚠️ Serious offense. May also lead to imprisonment or license suspension.';
  if (violation.id === 'no_puc') extra = '\n\nTip: PUC checks are available at most petrol pumps.';
  return `The fine for **${violation.name}** is ₹${violation.fine} under ${violation.section}. It also adds ${violation.points} penalty points to your TRAK profile.${extra}`;
};

export const handleContestQuery = (violation?: Violation): string => {
  if (!violation)
    return 'To advise on a contest, I need to know the violation type. For example, "I want to contest my helmet fine".';
  return `To contest a **${violation.name}** fine:\n1. Check if the vehicle number in the challan photo is correct.\n2. Verify the time and location.\n3. If you weren't there, raise a dispute on the Parivahan portal under 'Grievances'.`;
};

export const handlePaymentQuery = (): string =>
  `To pay your challan online:\n1. Visit the E-Challan Portal.\n2. Enter your Vehicle Number or Challan Number.\n3. Verify your details and complete the payment using UPI/NetBanking.\n4. Download the receipt for your records.\n${OFFICIAL_LINKS}`;

export const handleLicenseQuery = (): string =>
  `For Driving License services (Renewal, New Application, Change of Address):\n1. Visit the Sarathi Portal (part of Parivahan).\n2. Select your State.\n3. Follow the instructions for the specific DL service you need.\n4. Book a slot if a visit to the RTO is required.\n${OFFICIAL_LINKS}`;

export const handleDocumentsQuery = (): string =>
  `Required Documents to carry while driving in India:\n• Physical or Digital Driving License (DL)\n• Registration Certificate (RC)\n• Valid Insurance Policy\n• Pollution Under Control (PUC) Certificate\n• Permit & Fitness (for commercial vehicles)\n\nNote: Digital copies in mParivahan or DigiLocker are legally valid.\n${OFFICIAL_LINKS}`;

export const handleUnpaidQuery = (): string =>
  `If you don't pay your traffic challan:\n1. Penalties may increase over time.\n2. You might receive a summons from the court.\n3. Your vehicle might be blacklisted, preventing RC renewal or transfer.\n4. Frequent unpaid violations can lead to Driving License suspension.\n\nClear your fines promptly at: https://echallan.parivahan.gov.in`;

export const handleRiskQuery = (): string =>
  `To see your live risk score and full violation history, head over to the **Risk** tab. It updates in real time as violations are confirmed here in chat!`;

export const computeRiskScore = (historyIds: string[]): number => {
  let total = 0;
  historyIds.forEach(id => {
    const v = violations.find(v => v.id === id);
    if (v) total += v.points;
  });
  return Math.max(0, 100 - total * 5);
};