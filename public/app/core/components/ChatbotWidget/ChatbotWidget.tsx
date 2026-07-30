/* eslint-disable */
import { css, keyframes } from '@emotion/css';
import React, { useState } from 'react';

import { type GrafanaTheme2 } from '@grafana/data';
import { config } from '@grafana/runtime';
import { Icon, IconButton, useStyles2 } from '@grafana/ui';

interface Props {
  defaultUrl?: string;
}

const pulseAnimation = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.7);
  }
  70% {
    box-shadow: 0 0 0 14px rgba(99, 102, 241, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(99, 102, 241, 0);
  }
`;

export const ChatbotWidget = ({ defaultUrl = 'http://192.168.0.19:8011' }: Props) => {
  const styles = useStyles2(getStyles);
  const initialUrl = config.bootData?.settings?.chatbotUrl || defaultUrl;
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [chatbotUrl, setChatbotUrl] = useState(initialUrl);
  const [showSettings, setShowSettings] = useState(false);
  const [tempUrl, setTempUrl] = useState(initialUrl);

  const toggleOpen = () => {
    if (isMinimized) {
      setIsMinimized(false);
      setIsOpen(true);
    } else {
      setIsOpen(!isOpen);
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setChatbotUrl(tempUrl);
    setShowSettings(false);
  };

  return (
    <div className={styles.container}>
      {/* Floating Chatbot Window */}
      {isOpen && !isMinimized && (
        <div className={styles.chatWindow}>
          {/* Header */}
          <div className={styles.header}>
            <div className={styles.headerTitle}>
              <span className={styles.statusDot} />
              <Icon name="ai-sparkle" size="lg" className={styles.headerIcon} />
              <span className={styles.titleText}>AI Chatbot</span>
            </div>
            <div className={styles.headerActions}>
              <IconButton
                name="cog"
                size="sm"
                tooltip="Configure Chatbot URL"
                onClick={() => setShowSettings(!showSettings)}
                className={styles.headerBtn}
              />
              <IconButton
                name="minus"
                size="sm"
                tooltip="Minimize"
                onClick={() => setIsMinimized(true)}
                className={styles.headerBtn}
              />
              <IconButton
                name="times"
                size="sm"
                tooltip="Close"
                onClick={() => setIsOpen(false)}
                className={styles.headerBtn}
              />
            </div>
          </div>

          {/* URL Configuration Dropdown overlay */}
          {showSettings ? (
            <div className={styles.settingsOverlay}>
              <form onSubmit={handleSaveSettings} className={styles.settingsForm}>
                <label className={styles.settingsLabel}>Hosted Chatbot URL:</label>
                <input
                  type="text"
                  value={tempUrl}
                  onChange={(e) => setTempUrl(e.target.value)}
                  placeholder="https://your-chatbot-url.com"
                  className={styles.settingsInput}
                />
                <div className={styles.settingsButtons}>
                  <button type="submit" className={styles.btnPrimary}>
                    Save URL
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowSettings(false)}
                    className={styles.btnSecondary}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* Main Chat Iframe */
            <div className={styles.iframeContainer}>
              <iframe
                src={chatbotUrl}
                title="Hosted AI Chatbot"
                className={styles.iframe}
                allow="camera; microphone; clipboard-write; encrypted-media"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-downloads allow-storage-access-by-user-activation"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          )}
        </div>
      )}

      {/* Floating Action Button (FAB) */}
      <button
        onClick={toggleOpen}
        className={styles.fabButton}
        title={isOpen ? 'Close Chatbot' : 'Open AI Chatbot'}
        aria-label="Open AI Chatbot"
      >
        <Icon name={isOpen && !isMinimized ? 'times' : 'comment-alt-message'} size="xl" />
      </button>
    </div>
  );
};

const getStyles = (theme: GrafanaTheme2) => ({
  container: css({
    position: 'fixed',
    bottom: theme.spacing(3),
    right: theme.spacing(3),
    zIndex: 10000,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
  }),

  fabButton: css({
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    border: 'none',
    background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    boxShadow: '0 8px 24px rgba(99, 102, 241, 0.4)',
    animation: `${pulseAnimation} 2.5s infinite`,
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',

    '&:hover': {
      transform: 'scale(1.08)',
      boxShadow: '0 12px 28px rgba(168, 85, 247, 0.6)',
    },

    '&:active': {
      transform: 'scale(0.95)',
    },
  }),

  chatWindow: css({
    width: '420px',
    height: '600px',
    maxWidth: 'calc(100vw - 32px)',
    maxHeight: 'calc(100vh - 110px)',
    marginBottom: theme.spacing(2),
    borderRadius: '16px',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    background: theme.isDark ? 'rgba(24, 27, 31, 0.95)' : 'rgba(255, 255, 255, 0.98)',
    backdropFilter: 'blur(16px)',
    border: `1px solid ${theme.isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)'}`,
    boxShadow: '0 16px 40px rgba(0, 0, 0, 0.35)',
    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
  }),

  header: css({
    height: '52px',
    padding: theme.spacing(0, 2),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: theme.isDark
      ? 'linear-gradient(90deg, rgba(30, 34, 42, 0.9) 0%, rgba(20, 24, 30, 0.9) 100%)'
      : 'linear-gradient(90deg, #f4f5f7 0%, #e9ecef 100%)',
    borderBottom: `1px solid ${theme.isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'}`,
  }),

  headerTitle: css({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
  }),

  statusDot: css({
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#10b981',
    boxShadow: '0 0 8px #10b981',
  }),

  headerIcon: css({
    color: '#a855f7',
  }),

  titleText: css({
    fontWeight: theme.typography.fontWeightMedium,
    fontSize: theme.typography.size.base,
    color: theme.colors.text.primary,
  }),

  headerActions: css({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
  }),

  headerBtn: css({
    color: theme.colors.text.secondary,
    '&:hover': {
      color: theme.colors.text.primary,
    },
  }),

  settingsOverlay: css({
    padding: theme.spacing(3),
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    flexGrow: 1,
    background: theme.colors.background.primary,
  }),

  settingsForm: css({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
  }),

  settingsLabel: css({
    fontWeight: theme.typography.fontWeightMedium,
    color: theme.colors.text.primary,
  }),

  settingsInput: css({
    width: '100%',
    padding: theme.spacing(1.5),
    borderRadius: theme.shape.borderRadius(1),
    border: `1px solid ${theme.colors.border.weak}`,
    backgroundColor: theme.colors.background.secondary,
    color: theme.colors.text.primary,
    outline: 'none',

    '&:focus': {
      borderColor: theme.colors.primary.main,
    },
  }),

  settingsButtons: css({
    display: 'flex',
    gap: theme.spacing(1),
    justifyContent: 'flex-end',
    marginTop: theme.spacing(1),
  }),

  btnPrimary: css({
    padding: theme.spacing(1, 2),
    borderRadius: theme.shape.borderRadius(1),
    border: 'none',
    backgroundColor: theme.colors.primary.main,
    color: theme.colors.primary.text,
    cursor: 'pointer',
    fontWeight: theme.typography.fontWeightMedium,
  }),

  btnSecondary: css({
    padding: theme.spacing(1, 2),
    borderRadius: theme.shape.borderRadius(1),
    border: `1px solid ${theme.colors.border.weak}`,
    backgroundColor: 'transparent',
    color: theme.colors.text.secondary,
    cursor: 'pointer',
  }),

  iframeContainer: css({
    flexGrow: 1,
    width: '100%',
    height: '100%',
    position: 'relative',
    backgroundColor: theme.colors.background.primary,
  }),

  iframe: css({
    width: '100%',
    height: '100%',
    border: 'none',
  }),
});
