import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Bell, Sun, Moon, ChevronDown, MessageSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNotifications } from '../hooks/useNotifications';
import { useChat } from '../hooks/useChat';
import Avatar from './Avatar';
import NotificationDropdown from './NotificationDropdown';
import ChatDropdown from './chat/ChatDropdown';
import { formatRole } from '../constants/departments';

export default function Navbar({ title, onToggleSidebar }) {
  const { user, role, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const {
    notifications,
    readNotification,
    readAllNotifications,
    removeNotification,
    unreadCount,
  } = useNotifications();
  const {
    unreadCount: chatUnreadCount,
    conversations,
    loadingConversations,
    openConversation,
  } = useChat();

  const [notifOpen, setNotifOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);

  const notifRef = useRef(null);
  const chatRef = useRef(null);
  const userRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClick(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (chatRef.current && !chatRef.current.contains(e.target)) setChatOpen(false);
      if (userRef.current && !userRef.current.contains(e.target)) setUserOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <header className="navbar">
      <div className="navbar-left">
        <button className="icon-btn" onClick={onToggleSidebar} aria-label="Toggle sidebar" title="Toggle sidebar">
          <Menu size={18} />
        </button>
        <span className="navbar-title">{title}</span>
      </div>
      <div className="navbar-right">
        <button className="icon-btn" onClick={toggleTheme} title="Toggle theme" aria-label="Toggle dark mode">
          {theme === 'light' ? <Moon size={17} /> : <Sun size={17} />}
        </button>

        <div style={{ position: 'relative' }} ref={chatRef}>
          <button
            className="icon-btn"
            onClick={() => setChatOpen((o) => !o)}
            aria-label="Messages"
            title="Messages"
          >
            <MessageSquare size={17} />
            {chatUnreadCount > 0 && (
              <span className="notif-count">
                {chatUnreadCount > 9 ? '9+' : chatUnreadCount}
              </span>
            )}
          </button>
          {chatOpen && (
            <ChatDropdown
              conversations={conversations}
              loading={loadingConversations}
              onSelectConversation={(conv) => {
                setChatOpen(false);
                openConversation(conv);
              }}
              onClose={() => setChatOpen(false)}
            />
          )}
        </div>

        <div style={{ position: 'relative' }} ref={notifRef}>
          <button className="icon-btn" onClick={() => setNotifOpen((o) => !o)} aria-label="Notifications">
            <Bell size={17} />
            {unreadCount > 0 && <span className="notif-count">{unreadCount > 9 ? '9+' : unreadCount}</span>}
          </button>
          {notifOpen && (
            <NotificationDropdown
              notifications={notifications}
              onRead={readNotification}
              onReadAll={readAllNotifications}
              onDelete={removeNotification}
              onClose={() => setNotifOpen(false)}
            />
          )}
        </div>
        <div style={{ position: 'relative' }} ref={userRef}>
          <div className="navbar-user" onClick={() => setUserOpen((o) => !o)}>
            <Avatar name={user?.fullName || 'User'} src={user?.profilePhoto} />
            <div>
              <div className="navbar-user-name">{user?.fullName}</div>
              <div className="navbar-user-role">
                {formatRole(role)}
              </div>
            </div>
            <ChevronDown size={14} color="var(--text-muted)" />
          </div>
          {userOpen && (
            <div className="notif-dropdown" style={{ width: 200 }}>
              <div style={{ padding: 8 }}>
                <button className="btn btn-ghost btn-sm btn-block" style={{ justifyContent: 'flex-start' }} onClick={() => { setUserOpen(false); navigate('/settings'); }}>
                  Settings
                </button>
                <button className="btn btn-ghost btn-sm btn-block" style={{ justifyContent: 'flex-start', color: 'var(--danger)' }} onClick={logout}>
                  Log out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
