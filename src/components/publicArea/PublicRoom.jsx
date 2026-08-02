import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import './PublicRoom.css';
import { baseUrl } from '../../api/api';

const SEGMENT_COUNT = 4;

const PublicRoom = () => {
  const socketRef = useRef(null);
  const [username, setUsername] = useState('');
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [roomCode, setRoomCode] = useState('');
  const [roomName, setRoomName] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [users, setUsers] = useState([]);
  const [isOffline, setIsOffline] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [segments, setSegments] = useState(Array(SEGMENT_COUNT).fill(''));
  const [activeSegment, setActiveSegment] = useState(0);
  const [copiedMessageId, setCopiedMessageId] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const segmentRefs = useRef([]);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const emojis = ['😀', '😂', '😍', '🤔', '👍', '❤️', '🎉', '🔥', '👏', '✨'];

  useEffect(() => {
    socketRef.current = io(baseUrl, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      transports: ['websocket', 'polling'],
      forceNew: true,
      path: '/socket.io/',
    });

    socketRef.current.on('connect_error', () => setIsOffline(true));
    socketRef.current.on('disconnect', () => setIsOffline(true));
    socketRef.current.on('connect', () => setIsOffline(false));

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const code = params.get('code');
    if (code) {
      setRoomCode(code);
      const codeSegments = code.split('').slice(0, SEGMENT_COUNT);
      setSegments(codeSegments.concat(Array(Math.max(0, SEGMENT_COUNT - codeSegments.length)).fill('')));
      const storedUsername = localStorage.getItem('tshare_username');
      if (storedUsername) {
        setUsername(storedUsername);
      } else {
        setShowUsernameModal(true);
      }
    }
  }, [location.search]);

  useEffect(() => {
    if (!socketRef.current) return;
    const s = socketRef.current;

    const handleConnect = () => {
      if (roomCode && username) s.emit('join-room', { roomCode, username });
    };

    const handleReconnect = () => {
      if (roomCode && username) s.emit('join-room', { roomCode, username });
    };

    const handleRoomJoined = (data) => {
      setRoomName(data.roomName || `Public Room ${data.roomCode}`);
      setIsJoined(true);
      setIsLoading(false);
      setMessages(data.messages || []);
      setUsers(data.users || []);
      const params = new URLSearchParams(location.search);
      params.set('code', data.roomCode);
      navigate(`${location.pathname}?${params.toString()}`, { replace: true });
    };

    const handleRoomError = (errorMessage) => {
      setError(errorMessage);
      setIsLoading(false);
    };

    const handleUserJoined = (userData) => {
      setUsers(prev => [...prev, userData]);
      setMessages(prev => [...prev, {
        type: 'system',
        text: `${userData.username} joined the room`,
        timestamp: new Date().toISOString()
      }]);
    };

    const handleUserLeft = (userData) => {
      setUsers(prev => prev.filter(user => user.id !== userData.id));
      setMessages(prev => [...prev, {
        type: 'system',
        text: `${userData.username} left the room`,
        timestamp: new Date().toISOString()
      }]);
    };

    const handleChatMessage = (messageData) => {
      setMessages(prev => [...prev, messageData]);
    };

    const handleTypingStart = (data) => {
      setTypingUsers(prev => {
        if (!prev.some(user => user.username === data.username)) {
          return [...prev, data];
        }
        return prev;
      });
    };

    const handleTypingStop = (data) => {
      setTypingUsers(prev => prev.filter(user => user.username !== data.username));
    };

    s.on('connect', handleConnect);
    s.on('reconnect', handleReconnect);
    s.on('room-joined', handleRoomJoined);
    s.on('room-error', handleRoomError);
    s.on('user-joined', handleUserJoined);
    s.on('user-left', handleUserLeft);
    s.on('chat-message', handleChatMessage);
    s.on('typing-start', handleTypingStart);
    s.on('typing-stop', handleTypingStop);

    return () => {
      s.off('connect', handleConnect);
      s.off('reconnect', handleReconnect);
      s.off('room-joined', handleRoomJoined);
      s.off('room-error', handleRoomError);
      s.off('user-joined', handleUserJoined);
      s.off('user-left', handleUserLeft);
      s.off('chat-message', handleChatMessage);
      s.off('typing-start', handleTypingStart);
      s.off('typing-stop', handleTypingStop);
    };
  }, [roomCode, username, navigate, location.pathname]);

  const handleJoinRoom = async (code = roomCode, name = username) => {
    if (!socketRef.current) return;

    setIsLoading(true);
    setError('');
    if (name) localStorage.setItem('tshare_username', name);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const res = await fetch(`${baseUrl}/public-room/validate/${code}`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      const data = await res.json();

      if (data.success) {
        let responseReceived = false;

        const onRoomJoined = () => {
          responseReceived = true;
          socketRef.current.off('room-error', onRoomError);
        };

        const onRoomError = (errorMsg) => {
          responseReceived = true;
          setError(errorMsg);
          socketRef.current.off('room-joined', onRoomJoined);
          setIsLoading(false);
        };

        socketRef.current.once('room-joined', onRoomJoined);
        socketRef.current.once('room-error', onRoomError);
        socketRef.current.emit('join-room', { roomCode: code, username: name });

        setTimeout(() => {
          if (!responseReceived) {
            socketRef.current.off('room-joined', onRoomJoined);
            socketRef.current.off('room-error', onRoomError);
            setError('Room join request timed out. Please try again.');
            setIsLoading(false);
          }
        }, 8000);
      } else {
        setError(data.message || 'Invalid room code');
        setIsLoading(false);
      }
    } catch (err) {
      console.error('Error validating room code:', err);
      setError(err.name === 'AbortError' ? 'Request timed out.' : 'Failed to validate room code');
      setIsLoading(false);
    }
  };

  const handleSubmitUsername = (e) => {
    e.preventDefault();
    if (!username.trim()) return;
    setShowUsernameModal(false);
    localStorage.setItem('tshare_username', username);
    handleJoinRoom(roomCode, username);
  };

  const handleAnonymous = () => {
    setShowUsernameModal(false);
    const guestName = `Guest-${Math.floor(1000 + Math.random() * 9000)}`;
    setUsername(guestName);
    handleJoinRoom(roomCode, guestName);
  };

  const handleSubmitCode = (e) => {
    e.preventDefault();
    const code = segments.join('');
    if (code.length !== SEGMENT_COUNT) {
      setError('Please enter all 4 digits');
      return;
    }
    setRoomCode(code);
    const storedUsername = localStorage.getItem('tshare_username');
    if (storedUsername) {
      setUsername(storedUsername);
      handleJoinRoom(code, storedUsername);
    } else {
      setShowUsernameModal(true);
    }
  };

  const handleSegmentChange = (index, value) => {
    const digit = value.replace(/\D/g, '');
    if (!digit) return;
    const newSegments = [...segments];
    newSegments[index] = digit.slice(-1);
    setSegments(newSegments);
    setError('');
    if (index < SEGMENT_COUNT - 1) {
      setActiveSegment(index + 1);
      segmentRefs.current[index + 1]?.focus();
    }
  };

  const handleSegmentKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const newSegments = [...segments];
      if (segments[index]) {
        newSegments[index] = '';
        setSegments(newSegments);
      } else if (index > 0) {
        newSegments[index - 1] = '';
        setSegments(newSegments);
        setActiveSegment(index - 1);
        segmentRefs.current[index - 1]?.focus();
      }
    }

    if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      setActiveSegment(index - 1);
      segmentRefs.current[index - 1]?.focus();
    }

    if (e.key === 'ArrowRight' && index < SEGMENT_COUNT - 1) {
      e.preventDefault();
      setActiveSegment(index + 1);
      segmentRefs.current[index + 1]?.focus();
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmitCode(e);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, SEGMENT_COUNT);
    if (!pasted) return;
    const newSegments = [...segments];
    for (let i = 0; i < pasted.length; i++) {
      newSegments[i] = pasted[i];
    }
    setSegments(newSegments);
    setError('');
    const nextIndex = Math.min(pasted.length, SEGMENT_COUNT - 1);
    setActiveSegment(nextIndex);
    segmentRefs.current[nextIndex]?.focus();
  };

  const clearAll = () => {
    setSegments(Array(SEGMENT_COUNT).fill(''));
    setActiveSegment(0);
    segmentRefs.current[0]?.focus();
    setError('');
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageText.trim() || !socketRef.current || !isJoined || isSending) return;

    setIsSending(true);
    const messageToSend = { roomCode, text: messageText, username };

    const timeoutId = setTimeout(() => {
      console.error('Message acknowledgment timeout');
      setIsOffline(true);
      setIsSending(false);
    }, 5000);

    const handleAck = (success) => {
      clearTimeout(timeoutId);
      setIsSending(false);
      if (success === false) console.error('Message sending failed on server');
    };

    setMessageText('');
    setIsTyping(false);
    if (socketRef.current) socketRef.current.emit('typing-stop', { roomCode, username });

    try {
      socketRef.current.emit('send-message', messageToSend, handleAck);
    } catch (error) {
      console.error('Error emitting message:', error);
      setIsSending(false);
      setIsOffline(true);
      setMessages(prev => [...prev, {
        ...messageToSend,
        timestamp: new Date(),
        type: 'message',
        pending: true
      }]);
    }
  };

  const handleTyping = (e) => {
    setMessageText(e.target.value);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    if (!isTyping && socketRef.current) {
      setIsTyping(true);
      socketRef.current.emit('typing-start', { roomCode, username });
    }
    typingTimeoutRef.current = setTimeout(() => {
      if (socketRef.current) socketRef.current.emit('typing-stop', { roomCode, username });
      setIsTyping(false);
    }, 1000);
  };

  const handleEmojiClick = (emoji) => {
    setMessageText(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const handleCopyMessage = (text, index) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setCopiedMessageId(index);
        setTimeout(() => setCopiedMessageId(null), 2000);
      })
      .catch(err => console.error('Failed to copy:', err));
  };

  const handleBackToHome = () => navigate('/');

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const leaveRoom = () => {
    if (socketRef.current) socketRef.current.disconnect();
    setIsJoined(false);
    setMessages([]);
    setUsers([]);
    navigate('/');
  };

  return (
    <div className="public-room">
      {/* Offline Indicator */}
      <AnimatePresence>
        {isOffline && (
          <motion.div
            className="offline-banner"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.706 3.294A12.545 12.545 0 0 0 8 3C5.259 3 2.723 3.882.663 5.379a.485.485 0 0 0-.048.736.518.518 0 0 0 .668.05A11.448 11.448 0 0 1 8 4c.63 0 1.249.05 1.852.148l.854-.854zM8 6c-1.905 0-3.68.56-5.166 1.526a.48.48 0 0 0-.063.745.525.525 0 0 0 .652.065 8.448 8.448 0 0 1 3.51-1.27L8 6zm2.596 1.404.785-.785c.63.24 1.227.545 1.785.907a.482.482 0 0 1 .063.745.525.525 0 0 1-.652.065 8.462 8.462 0 0 0-1.98-.932zM8 10l.933-.933a6.455 6.455 0 0 1 2.013.637c.285.145.326.524.1.75-.226.226-.551.19-.75-.1-.15-.15-.314-.289-.486-.406L8 10z" />
            </svg>
            <span>Connection Lost</span>
            <motion.button
              className="retry-btn"
              onClick={() => {
                if (socketRef.current) {
                  socketRef.current.disconnect();
                  socketRef.current = io(baseUrl, {
                    autoConnect: true,
                    reconnection: true,
                    reconnectionAttempts: 5,
                    reconnectionDelay: 1000,
                    reconnectionDelayMax: 3000,
                    timeout: 20000,
                    transports: ['polling', 'websocket'],
                    forceNew: true,
                    path: '/socket.io/'
                  });
                  socketRef.current.on('connect', () => {
                    setIsOffline(false);
                    if (isJoined && roomCode && username) {
                      socketRef.current.emit('join-room', { roomCode, username });
                    }
                  });
                }
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Retry
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Username Modal */}
      <AnimatePresence>
        {showUsernameModal && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="username-modal"
              initial={{ opacity: 0, y: -30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -30, scale: 0.95 }}
            >
              <div className="modal-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 00-3-3.87" />
                  <path d="M16 3.13a4 4 0 010 7.75" />
                </svg>
              </div>
              <h2>Welcome!</h2>
              <p>Enter your name to join the chat</p>
              {error && <div className="error-msg">{error}</div>}
              <form onSubmit={handleSubmitUsername}>
                <input
                  type="text"
                  placeholder="Your name"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoFocus
                  maxLength={20}
                />
                <motion.button
                  className="btn btn-primary btn-block"
                  type="submit"
                  disabled={!username.trim()}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Join Chat
                </motion.button>
              </form>
              <motion.button
                className="btn btn-secondary btn-block"
                onClick={handleAnonymous}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Continue as Guest
              </motion.button>
              <button className="text-btn" onClick={handleBackToHome}>Cancel</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {!isJoined ? (
        /* Join Room View */
        <motion.div
          className="join-view"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="join-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="join-card__header">
              <div className="join-card__icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 00-3-3.87" />
                  <path d="M16 3.13a4 4 0 010 7.75" />
                </svg>
              </div>
              <h1>Join Public Chat</h1>
              <p className="join-card__subtitle">Enter a room code to start chatting</p>
            </div>

            {error && <motion.div className="error-msg" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{error}</motion.div>}

            <form onSubmit={handleSubmitCode}>
              <div className="input-group">
                <label>Room Code</label>
                <div className="code-inputs">
                  {segments.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => { segmentRefs.current[i] = el; }}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleSegmentChange(i, e.target.value)}
                      onKeyDown={(e) => handleSegmentKeyDown(i, e)}
                      onFocus={() => setActiveSegment(i)}
                      className={`code-input ${digit ? 'filled' : ''} ${activeSegment === i ? 'active' : ''}`}
                      aria-label={`Digit ${i + 1}`}
                      disabled={isLoading}
                    />
                  ))}
                </div>
              </div>

              <div className="join-card__actions">
                <button type="button" className="btn btn-ghost" onClick={clearAll} disabled={isLoading}>
                  Clear
                </button>
                <motion.button
                  className="btn btn-primary btn-flex"
                  type="submit"
                  disabled={isLoading || segments.join('').length !== SEGMENT_COUNT}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isLoading ? (
                    <span className="spinner" />
                  ) : (
                    <>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                      </svg>
                      Join Room
                    </>
                  )}
                </motion.button>
              </div>
            </form>

            <p className="join-card__hint">
              Don't have a code? Create a public room from the home page.
            </p>
          </motion.div>
        </motion.div>
      ) : (
        /* Chat View */
        <motion.div
          className="chat-view"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {/* Chat Header */}
          <div className="chat-header">
            <div className="chat-header__info">
              <div className="chat-header__avatar">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                </svg>
              </div>
              <div className="chat-header__text">
                <h2>{roomName || `Room ${roomCode}`}</h2>
                <span className="chat-header__status">
                  <span className="status-dot" />
                  {users.length} online
                </span>
              </div>
            </div>
            <div className="chat-header__actions">
              <motion.button
                className="icon-btn"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                title="Emoji"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                  <line x1="9" y1="9" x2="9.01" y2="9" />
                  <line x1="15" y1="9" x2="15.01" y2="9" />
                </svg>
              </motion.button>
              <motion.button
                className="icon-btn"
                onClick={leaveRoom}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                title="Leave Room"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </motion.button>
            </div>
          </div>

          {/* Emoji Picker */}
          <AnimatePresence>
            {showEmojiPicker && (
              <motion.div
                className="emoji-picker"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {emojis.map(emoji => (
                  <motion.button
                    key={emoji}
                    className="emoji-btn"
                    onClick={() => handleEmojiClick(emoji)}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {emoji}
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Messages */}
          <div className="messages-area">
            <div className="messages-list">
              {messages.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state__icon">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                    </svg>
                  </div>
                  <p>No messages yet</p>
                  <span>Be the first to say hello!</span>
                </div>
              ) : (
                messages.map((message, index) => (
                  <motion.div
                    key={index}
                    className={`message ${message.type === 'system' ? 'message--system' : message.username === username ? 'message--own' : 'message--other'}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {message.type !== 'system' && (
                      <div className="message__sender">
                        {message.username === username ? 'You' : message.username}
                      </div>
                    )}
                    <div className="message__body">
                      <div className="message__text">{message.text}</div>
                      <div className="message__meta">
                        <span className="message__time">{formatTime(message.timestamp)}</span>
                        {message.type !== 'system' && (
                          <motion.button
                            className={`message__copy ${copiedMessageId === index ? 'copied' : ''}`}
                            onClick={() => handleCopyMessage(message.text, index)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            {copiedMessageId === index ? (
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            ) : (
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="9" y="9" width="13" height="13" rx="2" />
                                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                              </svg>
                            )}
                          </motion.button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Typing Indicator */}
          <AnimatePresence>
            {typingUsers.length > 0 && typingUsers.some(user => user.username !== username) && (
              <motion.div
                className="typing-indicator"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
              >
                <div className="typing-dots">
                  <span />
                  <span />
                  <span />
                </div>
                <span>
                  {typingUsers.filter(user => user.username !== username).map(user => user.username).join(', ')}
                  {' '}{typingUsers.length > 1 ? 'are' : 'is'} typing...
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Message Input */}
          <form className="message-input-area" onSubmit={handleSendMessage}>
            <div className="input-wrapper">
              <input
                type="text"
                placeholder="Type a message..."
                value={messageText}
                onChange={handleTyping}
                disabled={isSending}
                autoFocus
              />
              <motion.button
                type="button"
                className="input-action"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                  <line x1="9" y1="9" x2="9.01" y2="9" />
                  <line x1="15" y1="9" x2="15.01" y2="9" />
                </svg>
              </motion.button>
              <motion.button
                type="submit"
                className="send-btn"
                disabled={!messageText.trim() || isSending}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isSending ? (
                  <span className="spinner small" />
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>
      )}
    </div>
  );
};

export default PublicRoom;