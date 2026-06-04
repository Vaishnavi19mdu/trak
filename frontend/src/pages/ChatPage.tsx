// src/pages/ChatPage.tsx
import React, { useState, useCallback, useEffect } from 'react';
import { Box, IconButton, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ChatBox from '../components/ChatBox';
import ConversationSidebar from '../components/ConversationSidebar';
import type { SupportedLang } from '../types/lang';

const ACTIVE_CONV_KEY = 'trak_active_conv_id';

const getStoredLanguage = (): SupportedLang => {
  const lang = localStorage.getItem('trak_language');
  const valid: SupportedLang[] = ['en', 'ta', 'kn', 'ml', 'te', 'hi'];
  return valid.includes(lang as SupportedLang) ? (lang as SupportedLang) : 'en';
};

const ChatPage: React.FC = () => {
  const [activeConvId, setActiveConvId] = useState<string | undefined>(
    () => localStorage.getItem(ACTIVE_CONV_KEY) ?? undefined,
  );
  const [sidebarRefresh, setSidebarRefresh] = useState(0);
  const [language] = useState<SupportedLang>(getStoredLanguage);

  // On mobile: track whether we're showing the sidebar or the chat pane
  // Default: if there's an active conversation, jump straight to chat
  const [mobilePaneIsChat, setMobilePaneIsChat] = useState<boolean>(
    () => !!localStorage.getItem(ACTIVE_CONV_KEY),
  );

  useEffect(() => {
    if (activeConvId) {
      localStorage.setItem(ACTIVE_CONV_KEY, activeConvId);
    } else {
      localStorage.removeItem(ACTIVE_CONV_KEY);
    }
  }, [activeConvId]);

  const handleSelectConversation = useCallback((id: string) => {
    setActiveConvId(id);
    setMobilePaneIsChat(true); // slide to chat on mobile
  }, []);

  const handleNewConversation = useCallback(() => {
    setActiveConvId(undefined);
    setMobilePaneIsChat(true); // open a blank chat
  }, []);

  const handleConversationCreated = useCallback((id: string, _title: string) => {
    setActiveConvId(id);
    setSidebarRefresh((n) => n + 1);
  }, []);

  const handleConversationUpdated = useCallback((_id: string, _title: string) => {
    setSidebarRefresh((n) => n + 1);
  }, []);

  const handleMobileBack = useCallback(() => {
    setMobilePaneIsChat(false);
    setSidebarRefresh((n) => n + 1); // refresh list when returning
  }, []);

  return (
    <Box sx={{ display: 'flex', width: '100%', height: '100%', overflow: 'hidden' }}>

      {/* ── ConversationSidebar ────────────────────────────────────────────────
          Desktop (sm+): always visible alongside the chat.
          Mobile (xs):   full-width, hidden when mobilePaneIsChat is true.
      ──────────────────────────────────────────────────────────────────────── */}
      <Box sx={{
        flexShrink: 0,
        display: {
          xs: mobilePaneIsChat ? 'none' : 'flex',
          sm: 'flex',
        },
        flexDirection: 'column',
        width: { xs: '100%', sm: 'auto' },
        height: '100%',
      }}>
        <ConversationSidebar
          activeConversationId={activeConvId}
          onSelectConversation={handleSelectConversation}
          onNewConversation={handleNewConversation}
          refreshTrigger={sidebarRefresh}
        />
      </Box>

      {/* ── ChatBox ───────────────────────────────────────────────────────────
          Desktop (sm+): always visible, flex-grows to fill space.
          Mobile (xs):   full-width, hidden when mobilePaneIsChat is false.
      ──────────────────────────────────────────────────────────────────────── */}
      <Box sx={{
        flexGrow: 1,
        minWidth: 0,
        display: {
          xs: mobilePaneIsChat ? 'flex' : 'none',
          sm: 'flex',
        },
        flexDirection: 'column',
        height: '100%',
        // Give mobile chat some outer rounding / padding
        borderRadius: { xs: 0, sm: '14px' },
        overflow: 'hidden',
      }}>
        {/* Mobile-only back button bar */}
        <Box sx={{
          display: { xs: 'flex', sm: 'none' },
          alignItems: 'center',
          gap: 1,
          px: 1.5,
          py: 1,
          borderBottom: '1px solid rgba(0,0,0,0.07)',
          bgcolor: 'background.paper',
          flexShrink: 0,
        }}>
          <IconButton size="small" onClick={handleMobileBack} sx={{ borderRadius: '8px' }}>
            <ArrowBackIcon sx={{ fontSize: 20 }} />
          </IconButton>
          <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: 'text.primary' }}>
            {activeConvId ? 'Conversation' : 'New Chat'}
          </Typography>
        </Box>

        <ChatBox
          key={activeConvId ?? 'new'}
          conversationId={activeConvId}
          language={language}
          onConversationCreated={handleConversationCreated}
          onConversationUpdated={handleConversationUpdated}
          onNewConversation={handleNewConversation}
        />
      </Box>
    </Box>
  );
};

export default ChatPage;