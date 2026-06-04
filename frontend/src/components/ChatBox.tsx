// src/components/ChatBox.tsx
import React, { useRef, useCallback } from 'react';
import {
  Box, Paper, TextField, IconButton, Typography, Avatar,
  Button, Stack, Tooltip, Chip,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import TranslateIcon from '@mui/icons-material/Translate';
import AddCommentOutlinedIcon from '@mui/icons-material/AddCommentOutlined';
import {
  ChatMessage,
  processQueryWithFallback,
  createSession,
  ChatEngineSession,
} from '../utils/chatEngine';
import {
  saveConversation,
  loadConversation,
  createConversationId,
  generateTitle,
} from '../utils/conversationStorage';
import { useViolations } from '../context/ViolationContext';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import type { SupportedLang } from '../types/lang';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ChatBoxProps {
  conversationId?: string;
  language?: SupportedLang;
  onConversationCreated?: (id: string, title: string) => void;
  onConversationUpdated?: (id: string, title: string) => void;
  onNewConversation?: () => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MAX_USER_MESSAGES = 15;

const SUGGESTED_PROMPTS = [
  'Helmet fine',
  'Overspeeding fine',
  'I paid 1500 for helmet',
  'My risk score',
  'Signal jumping fine',
  'Mobile while driving',
  'No seatbelt fine',
];

const LANG_LABELS: Record<SupportedLang, string> = {
  en: 'EN', ta: 'தமிழ்', kn: 'ಕನ್ನಡ', ml: 'മലയ', te: 'తెలుగు', hi: 'हिन्दी',
};

const LANG_BCP47: Record<SupportedLang, string> = {
  en: 'en-IN', ta: 'ta-IN', kn: 'kn-IN', ml: 'ml-IN', te: 'te-IN', hi: 'hi-IN',
};

const SpeechRecognitionAPI =
  (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

// ─── Component ────────────────────────────────────────────────────────────────

const ChatBox: React.FC<ChatBoxProps> = ({
  conversationId: initialConvId,
  language = 'en',
  onConversationCreated,
  onConversationUpdated,
  onNewConversation,
}) => {
  const { addViolation } = useViolations();
  const session = useRef<ChatEngineSession>(createSession());
  const convIdRef = useRef<string>(initialConvId || '');

  // ── State ──────────────────────────────────────────────────────────────────

  const [messages, setMessages] = React.useState<ChatMessage[]>([
    {
      id: '1',
      text: "Hello! I'm TRAK Assistant. Ask me about any traffic violation, fine amount, or how to contest a ticket.",
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [loadedInitial, setLoadedInitial] = React.useState(false);
  const [input, setInput] = React.useState('');
  const [isWaiting, setIsWaiting] = React.useState(false);
  const [isListening, setIsListening] = React.useState(false);
  const [voiceSupported] = React.useState(!!SpeechRecognitionAPI);

  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Derived: message limit ─────────────────────────────────────────────────

  const userMsgCount = messages.filter((m) => m.sender === 'user').length;
  const isFull = userMsgCount >= MAX_USER_MESSAGES;
  const remaining = MAX_USER_MESSAGES - userMsgCount;

  // ── Load existing conversation from backend ────────────────────────────────

  React.useEffect(() => {
    if (!initialConvId || loadedInitial) return;
    loadConversation(initialConvId).then((saved) => {
      if (saved && saved.messages.length > 0) {
        setMessages(saved.messages);
      }
      setLoadedInitial(true);
    });
  }, [initialConvId, loadedInitial]);

  // ── Auto-scroll ────────────────────────────────────────────────────────────

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isWaiting]);

  // ── Persist conversation ───────────────────────────────────────────────────

  const persistMessages = useCallback(
    (msgs: ChatMessage[]) => {
      if (msgs.length <= 1) return;
      if (!convIdRef.current) {
        convIdRef.current = createConversationId();
      }
      const isNew = msgs.length === 2;
      const id = convIdRef.current;
      const title = generateTitle(msgs);

      // Debounce: cancel any pending save and wait 400ms so rapid consecutive
      // calls (user msg + bot msg) collapse into one request
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(async () => {
        await saveConversation(id, msgs, title, language);
        if (isNew) {
          onConversationCreated?.(id, title);
        } else {
          onConversationUpdated?.(id, title);
        }
      }, 400);
    },
    [language, onConversationCreated, onConversationUpdated],
  );

  // ── Translation helper ─────────────────────────────────────────────────────

  const translateToRegional = useCallback(
    async (englishText: string): Promise<string> => {
      if (language === 'en') return englishText;

      const langNames: Record<SupportedLang, string> = {
        en: 'English', ta: 'Tamil', kn: 'Kannada',
        ml: 'Malayalam', te: 'Telugu', hi: 'Hindi',
      };

      try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 1000,
            messages: [
              {
                role: 'user',
                content: `Translate the following traffic-related message into ${langNames[language]}. 
Preserve markdown formatting (bold, bullet points, etc.).
Keep numbers, amounts (₹), and proper nouns (portal names) in English.
Return ONLY the translated text, no preamble.

Text to translate:
${englishText}`,
              },
            ],
          }),
        });
        if (!response.ok) return englishText;
        const data = await response.json();
        const translated: string = data?.content?.[0]?.text?.trim() ?? '';
        if (!translated) return englishText;
        return `${englishText}\n\n---\n*${langNames[language]}:*\n\n${translated}`;
      } catch {
        return englishText;
      }
    },
    [language],
  );

  // ── Send message ───────────────────────────────────────────────────────────

  const handleSend = useCallback(
    async (text: string) => {
      const messageText = text || input;
      if (!messageText.trim() || isWaiting || isFull) return;

      const userMsg: ChatMessage = {
        id: Date.now().toString(),
        text: messageText,
        sender: 'user',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setInput('');
      setIsWaiting(true);

      const englishResponse = await processQueryWithFallback(
        messageText,
        session.current,
        addViolation,
      );

      const finalResponse =
        language !== 'en'
          ? await translateToRegional(englishResponse)
          : englishResponse;

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: finalResponse,
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages((prev) => {
        const next = [...prev, botMsg];
        persistMessages(next);
        return next;
      });

      setIsWaiting(false);
    },
    [input, isWaiting, isFull, addViolation, language, translateToRegional, persistMessages],
  );

  // ── Voice input ────────────────────────────────────────────────────────────

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  const startListening = useCallback(() => {
    if (!voiceSupported || isListening) return;
    const recognition = new SpeechRecognitionAPI();
    recognition.lang = LANG_BCP47[language];
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognitionRef.current = recognition;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript: string = Array.from(event.results)
        .map((r: any) => r[0].transcript)
        .join('');
      setInput(transcript);
      if (event.results[event.results.length - 1].isFinal) {
        stopListening();
        setTimeout(() => handleSend(transcript), 100);
      }
    };
    recognition.start();
  }, [voiceSupported, isListening, language, stopListening, handleSend]);

  const toggleVoice = () => {
    if (isListening) stopListening();
    else startListening();
  };

  const confStep = session.current.confirmationStep;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>

      {/* Language indicator + message limit badge */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: 24 }}>
        {language !== 'en' ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TranslateIcon sx={{ fontSize: 16, color: 'secondary.main', opacity: 0.7 }} />
            <Typography variant="caption" sx={{ color: 'secondary.main', opacity: 0.8 }}>
              Replies translated to {({ ta: 'Tamil', kn: 'Kannada', ml: 'Malayalam', te: 'Telugu', hi: 'Hindi' } as any)[language]}
            </Typography>
          </Box>
        ) : <span />}

        {/* Badge appears only after first user message */}
        {userMsgCount > 0 && (
          <Chip
            size="small"
            label={
              isFull
                ? 'Limit reached — start a new conversation'
                : `${remaining} / ${MAX_USER_MESSAGES} messages left`
            }
            color={isFull ? 'error' : remaining <= 3 ? 'warning' : 'default'}
            sx={{ fontSize: '0.68rem', height: 22, fontWeight: 600 }}
          />
        )}
      </Box>

      {/* Message area */}
      <Paper
        ref={scrollRef}
        elevation={0}
        sx={{
          flexGrow: 1, overflowY: 'auto', p: 3,
          bgcolor: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(10px)',
          borderRadius: '12px', border: '1px solid rgba(0,0,0,0.05)',
          display: 'flex', flexDirection: 'column', gap: 2,
        }}
      >
        <AnimatePresence mode="popLayout">
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.2 }}
              style={{
                display: 'flex',
                justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                width: '100%',
              }}
            >
              <Box sx={{
                display: 'flex', gap: 1.5, maxWidth: '80%',
                flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row',
              }}>
                <Avatar sx={{
                  bgcolor: msg.sender === 'user' ? 'primary.main' : 'success.main',
                  width: 32, height: 32, borderRadius: '10px',
                }}>
                  {msg.sender === 'user' ? <PersonIcon fontSize="small" /> : <SmartToyIcon fontSize="small" />}
                </Avatar>
                <Box sx={{
                  p: 2, borderRadius: '12px',
                  bgcolor: msg.sender === 'user' ? 'primary.main' : 'white',
                  color: msg.sender === 'user' ? 'white' : 'text.primary',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                  border: msg.sender === 'bot' ? '1px solid rgba(0,0,0,0.05)' : 'none',
                  '& a': { color: msg.sender === 'user' ? 'white' : 'primary.main', textDecoration: 'underline', fontWeight: 600 },
                  '& p': { margin: 0 },
                  '& p + p': { mt: 1 },
                  '& ul, & ol': { m: 0, pl: 2 },
                  '& li': { mt: 0.5 },
                  '& hr': { my: 1.5, borderColor: 'rgba(0,0,0,0.08)' },
                }}>
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                </Box>
              </Box>
            </motion.div>
          ))}

          {isWaiting && (
            <motion.div
              key="typing"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ display: 'flex', justifyContent: 'flex-start', width: '100%' }}
            >
              <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'success.main', width: 32, height: 32, borderRadius: '10px' }}>
                  <SmartToyIcon fontSize="small" />
                </Avatar>
                <Box sx={{
                  p: 2, borderRadius: '12px', bgcolor: 'white',
                  border: '1px solid rgba(0,0,0,0.05)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                  display: 'flex', alignItems: 'center', gap: 0.5,
                }}>
                  {[0, 1, 2].map((i) => (
                    <Box key={i} sx={{
                      width: 7, height: 7, borderRadius: '50%',
                      bgcolor: 'secondary.main', opacity: 0.5,
                      animation: 'bounce 1.2s infinite',
                      animationDelay: `${i * 0.2}s`,
                      '@keyframes bounce': {
                        '0%, 80%, 100%': { transform: 'scale(1)', opacity: 0.4 },
                        '40%': { transform: 'scale(1.4)', opacity: 1 },
                      },
                    }} />
                  ))}
                </Box>
              </Box>
            </motion.div>
          )}
        </AnimatePresence>
      </Paper>

      {/* Yes/No confirmation */}
      {confStep > 0 && !isWaiting && (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <Stack direction="row" spacing={2} sx={{ justifyContent: 'center' }}>
            <Button variant="contained" color="success" startIcon={<CheckIcon />}
              onClick={() => handleSend('yes')}
              sx={{ borderRadius: '12px', px: 4, fontWeight: 700 }}>
              Yes
            </Button>
            <Button variant="contained" color="error" startIcon={<CloseIcon />}
              onClick={() => handleSend('no')}
              sx={{ borderRadius: '12px', px: 4, fontWeight: 700 }}>
              No
            </Button>
          </Stack>
        </motion.div>
      )}

      {/* Conversation full → replace prompts + input with a banner */}
      {isFull ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          <Paper elevation={0} sx={{
            p: 2.5, borderRadius: '14px',
            display: 'flex', alignItems: 'center', gap: 2,
            bgcolor: 'rgba(239,68,68,0.05)',
            border: '1px dashed rgba(239,68,68,0.3)',
          }}>
            <AddCommentOutlinedIcon sx={{ color: 'error.main', fontSize: 22, flexShrink: 0 }} />
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: 'error.main', mb: 0.25 }}>
                Conversation limit reached
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                You've used all {MAX_USER_MESSAGES} messages in this conversation.
              </Typography>
            </Box>
            <Button
              variant="contained"
              size="small"
              startIcon={<AddCommentOutlinedIcon fontSize="small" />}
              onClick={onNewConversation}
              sx={{
                borderRadius: '10px', textTransform: 'none',
                fontWeight: 700, flexShrink: 0,
                bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' },
              }}
            >
              New chat
            </Button>
          </Paper>
        </motion.div>
      ) : (
        <>
          {/* Suggested prompts */}
          {confStep === 0 && !isWaiting && (
            <Box sx={{
              display: 'flex', overflowX: 'auto', gap: 1,
              scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' },
              WebkitOverflowScrolling: 'touch', '& > *': { flexShrink: 0 },
            }}>
              {SUGGESTED_PROMPTS.map((prompt) => (
                <Button
                  key={prompt} variant="outlined" size="small"
                  onClick={() => handleSend(prompt)}
                  sx={{
                    borderRadius: '20px', textTransform: 'none',
                    borderColor: 'rgba(37, 99, 235, 0.2)', color: 'secondary.main',
                    fontWeight: 600, fontSize: '0.8rem', py: 0.6, px: 1.5,
                    '&:hover': { borderColor: 'primary.main', bgcolor: 'rgba(37, 99, 235, 0.05)', color: 'primary.main' },
                  }}
                >
                  {prompt}
                </Button>
              ))}
            </Box>
          )}

          {/* Input bar */}
          <Paper elevation={0} sx={{
            p: { xs: 1, sm: 1.5 }, borderRadius: '14px',
            display: 'flex', alignItems: 'center', gap: 1,
            border: '1px solid rgba(37, 99, 235, 0.1)',
            boxShadow: '0 4px 20px rgba(37, 99, 235, 0.05)',
          }}>
            <TextField
              fullWidth
              placeholder={isListening ? `Listening (${LANG_LABELS[language]})…` : "Ask me something…"}
              variant="standard"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !isWaiting && handleSend(input)}
              disabled={isWaiting}
              slotProps={{
                input: {
                  disableUnderline: true,
                  sx: { px: { xs: 1, md: 2 }, py: 1, fontStyle: isListening ? 'italic' : 'normal' },
                },
              }}
            />

            {voiceSupported && (
              <Tooltip title={isListening ? 'Stop listening' : `Voice input (${LANG_LABELS[language]})`}>
                <IconButton
                  onClick={toggleVoice}
                  disabled={isWaiting}
                  sx={{
                    width: { xs: 40, md: 44 }, height: { xs: 40, md: 44 }, borderRadius: '12px',
                    bgcolor: isListening ? 'rgba(239,68,68,0.1)' : 'rgba(37,99,235,0.06)',
                    color: isListening ? 'error.main' : 'secondary.main',
                    border: isListening ? '1.5px solid rgba(239,68,68,0.4)' : '1.5px solid transparent',
                    animation: isListening ? 'pulse 1.4s infinite' : 'none',
                    '@keyframes pulse': {
                      '0%, 100%': { boxShadow: '0 0 0 0 rgba(239,68,68,0.25)' },
                      '50%': { boxShadow: '0 0 0 6px rgba(239,68,68,0)' },
                    },
                    '&:hover': { bgcolor: isListening ? 'rgba(239,68,68,0.18)' : 'rgba(37,99,235,0.12)' },
                  }}
                >
                  {isListening ? <MicOffIcon fontSize="small" /> : <MicIcon fontSize="small" />}
                </IconButton>
              </Tooltip>
            )}

            <IconButton
              color="primary"
              onClick={() => handleSend(input)}
              disabled={isWaiting}
              sx={{
                bgcolor: isWaiting ? 'action.disabledBackground' : 'primary.main',
                color: 'white',
                '&:hover': { bgcolor: 'primary.dark' },
                '&.Mui-disabled': { bgcolor: 'action.disabledBackground', color: 'action.disabled' },
                width: { xs: 40, md: 44 }, height: { xs: 40, md: 44 }, borderRadius: '12px',
              }}
            >
              <SendIcon fontSize="small" />
            </IconButton>
          </Paper>
        </>
      )}
    </Box>
  );
};

export default ChatBox;