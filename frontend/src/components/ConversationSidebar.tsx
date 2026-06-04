import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, IconButton, Typography, ListItemButton,
  Tooltip, Skeleton, Divider, useMediaQuery, useTheme,
} from '@mui/material';
import AddCommentOutlinedIcon from '@mui/icons-material/AddCommentOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import ChatBubbleOutlinedIcon from '@mui/icons-material/ChatBubbleOutlined';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { motion, AnimatePresence } from 'motion/react';
import {
  loadAllConversations,
  deleteConversation,
  StoredConversation,
} from '../utils/conversationStorage';

interface ConversationSidebarProps {
  activeConversationId?: string;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  refreshTrigger?: number;
}

type ConvSummary = Omit<StoredConversation, 'messages'>;

const SIDEBAR_OPEN_WIDTH = 240;
const SIDEBAR_CLOSED_WIDTH = 52;

type GroupKey = 'Today' | 'Yesterday' | 'Last 7 days' | 'Earlier';

const getGroup = (isoDate: string): GroupKey => {
  const diff = Date.now() - new Date(isoDate).getTime();
  const days = diff / (1000 * 60 * 60 * 24);
  if (days < 1) return 'Today';
  if (days < 2) return 'Yesterday';
  if (days < 7) return 'Last 7 days';
  return 'Earlier';
};

const GROUP_ORDER: GroupKey[] = ['Today', 'Yesterday', 'Last 7 days', 'Earlier'];

const ConversationSidebar: React.FC<ConversationSidebarProps> = ({
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  refreshTrigger = 0,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [open, setOpen] = useState(true);
  const [conversations, setConversations] = useState<ConvSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    const data = await loadAllConversations();
    setConversations(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    reload();
  }, [reload, refreshTrigger]);

  const grouped = conversations.reduce<Record<GroupKey, ConvSummary[]>>(
    (acc, conv) => {
      const g = getGroup(conv.updatedAt);
      acc[g] = [...(acc[g] || []), conv];
      return acc;
    },
    { Today: [], Yesterday: [], 'Last 7 days': [], Earlier: [] },
  );

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDeletingId(id);
    setTimeout(async () => {
      await deleteConversation(id);
      setConversations((prev) => prev.filter((c) => c.id !== id));
      setDeletingId(null);
      if (id === activeConversationId) onNewConversation();
    }, 260);
  };

  // On mobile: always expanded, full width (ChatPage controls visibility)
  const effectiveOpen = isMobile ? true : open;
  const sidebarWidth = isMobile ? '100%' : (effectiveOpen ? SIDEBAR_OPEN_WIDTH : SIDEBAR_CLOSED_WIDTH);

  return (
    <Box
      sx={{
        width: sidebarWidth,
        flexShrink: 0,
        transition: isMobile ? 'none' : 'width 0.28s cubic-bezier(0.4,0,0.2,1)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper',
        borderRadius: { xs: 0, sm: '16px' },
        border: { xs: 'none', sm: '1.5px solid rgba(37,99,235,0.10)' },
        boxShadow: { xs: 'none', sm: '0 4px 24px rgba(37,99,235,0.07)' },
        mr: { xs: 0, sm: 1.5 },
        height: '100%',
      }}
    >
      {/* Header */}
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: effectiveOpen ? 'space-between' : 'center',
        px: effectiveOpen ? 2 : 0.5,
        py: { xs: 2, sm: 1.75 },
        borderBottom: '1.5px solid rgba(0,0,0,0.06)',
        minHeight: { xs: 60, sm: 56 },
        bgcolor: 'rgba(37,99,235,0.03)',
        flexShrink: 0,
      }}>
        {effectiveOpen && (
          <Typography sx={{
            fontWeight: 800,
            color: 'primary.dark',
            fontSize: { xs: '0.8rem', sm: '0.7rem' },
            letterSpacing: 1.5,
            textTransform: 'uppercase',
          }}>
            Chats
          </Typography>
        )}
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {effectiveOpen && (
            <Tooltip title="New conversation">
              <IconButton
                size={isMobile ? 'medium' : 'small'}
                onClick={onNewConversation}
                sx={{ borderRadius: '9px', color: 'primary.main', '&:hover': { bgcolor: 'rgba(37,99,235,0.08)' } }}
              >
                <AddCommentOutlinedIcon sx={{ fontSize: { xs: 22, sm: 19 } }} />
              </IconButton>
            </Tooltip>
          )}
          {!isMobile && (
            <Tooltip title={open ? 'Collapse' : 'Expand'}>
              <IconButton
                size="small"
                onClick={() => setOpen(!open)}
                sx={{ borderRadius: '9px', color: 'text.secondary', '&:hover': { bgcolor: 'rgba(0,0,0,0.05)' } }}
              >
                {open ? <ChevronLeftIcon sx={{ fontSize: 19 }} /> : <ChevronRightIcon sx={{ fontSize: 19 }} />}
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>

      {/* Collapsed desktop only */}
      {!effectiveOpen && !isMobile && (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pt: 1.5 }}>
          <Tooltip title="New conversation" placement="right">
            <IconButton
              size="small"
              onClick={onNewConversation}
              sx={{ borderRadius: '9px', color: 'primary.main', '&:hover': { bgcolor: 'rgba(37,99,235,0.08)' } }}
            >
              <AddCommentOutlinedIcon sx={{ fontSize: 19 }} />
            </IconButton>
          </Tooltip>
        </Box>
      )}

      {/* List */}
      {effectiveOpen && (
        <Box sx={{
          flexGrow: 1,
          overflowY: 'auto',
          px: { xs: 1.5, sm: 1.25 },
          py: { xs: 1.5, sm: 1.25 },
          scrollbarWidth: 'thin',
        }}>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <Box key={i} sx={{ px: 1, mb: 1.5 }}>
                <Skeleton variant="rounded" height={isMobile ? 48 : 36} sx={{ borderRadius: '10px' }} />
              </Box>
            ))
          ) : conversations.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 6, px: 2 }}>
              <ChatBubbleOutlinedIcon sx={{ color: 'rgba(0,0,0,0.13)', fontSize: { xs: 44, sm: 34 }, mb: 1.5 }} />
              <Typography sx={{ color: 'text.disabled', fontSize: { xs: '0.92rem', sm: '0.78rem' }, lineHeight: 1.6 }}>
                No conversations yet.
              </Typography>
              <Typography sx={{ color: 'text.disabled', fontSize: { xs: '0.82rem', sm: '0.72rem' }, mt: 0.5 }}>
                Tap + to start a new chat.
              </Typography>
            </Box>
          ) : (
            GROUP_ORDER.map((group, groupIdx) => {
              const items = grouped[group];
              if (!items || items.length === 0) return null;
              return (
                <Box key={group} sx={{ mb: 0.5 }}>
                  <Typography sx={{
                    px: 1,
                    pt: groupIdx === 0 ? 0.5 : 1.5,
                    pb: 0.75,
                    display: 'block',
                    color: 'text.disabled',
                    fontWeight: 700,
                    fontSize: { xs: '0.72rem', sm: '0.66rem' },
                    letterSpacing: 1,
                    textTransform: 'uppercase',
                  }}>
                    {group}
                  </Typography>

                  <AnimatePresence>
                    {items.map((conv, idx) => (
                      <motion.div
                        key={conv.id}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: deletingId === conv.id ? 0 : 1, x: 0 }}
                        exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                        transition={{ duration: 0.22 }}
                      >
                        <ListItemButton
                          selected={conv.id === activeConversationId}
                          onClick={() => onSelectConversation(conv.id)}
                          sx={{
                            borderRadius: '10px',
                            py: { xs: 1.25, sm: 0.9 },
                            px: { xs: 1.5, sm: 1.25 },
                            minHeight: { xs: 52, sm: 38 },
                            '&.Mui-selected': {
                              bgcolor: 'rgba(37,99,235,0.09)',
                              '&:hover': { bgcolor: 'rgba(37,99,235,0.13)' },
                            },
                            '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' },
                            '&:hover .delete-btn': { opacity: 1 },
                            // On touch devices, always show delete at low opacity
                            '.delete-btn': { opacity: isMobile ? 0.35 : 0 },
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                        >
                          <Typography
                            noWrap
                            sx={{
                              fontSize: { xs: '1rem', sm: '0.84rem' },
                              fontWeight: conv.id === activeConversationId ? 600 : 400,
                              color: conv.id === activeConversationId ? 'primary.main' : 'text.primary',
                              flexGrow: 1,
                              minWidth: 0,
                              lineHeight: 1.4,
                            }}
                          >
                            {conv.title}
                          </Typography>
                          <IconButton
                            className="delete-btn"
                            size="small"
                            onClick={(e) => handleDelete(e, conv.id)}
                            sx={{
                              transition: 'opacity 0.15s',
                              width: { xs: 30, sm: 22 },
                              height: { xs: 30, sm: 22 },
                              borderRadius: '6px',
                              flexShrink: 0,
                              ml: 0.5,
                              color: '#ef4444',
                              '&:hover': { bgcolor: 'rgba(239,68,68,0.09)' },
                            }}
                          >
                            <DeleteOutlinedIcon sx={{ fontSize: { xs: 17, sm: 14 } }} />
                          </IconButton>
                        </ListItemButton>

                        {idx < items.length - 1 && (
                          <Divider sx={{ mx: 1, borderColor: 'rgba(0,0,0,0.05)' }} />
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </Box>
              );
            })
          )}
        </Box>
      )}
    </Box>
  );
};

export default ConversationSidebar;