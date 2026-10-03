import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import FloatingChatBox from '../components/chat/FloatingChatBox';

const TITLES = {
  '/dashboard': 'Dashboard',
  '/employees': 'Employees',
  '/notifications': 'Notifications',
  '/settings': 'Settings',
  '/admin/leaves': 'Leave Applications',
  '/leave-application': 'Leave Application',
};

function titleFor(pathname) {
  if (TITLES[pathname]) return TITLES[pathname];
  if (pathname.startsWith('/employees/') && pathname.endsWith('/edit')) return 'Edit employee';
  if (pathname === '/employees/add') return 'Add employee';
  if (pathname.startsWith('/employees/')) return 'Employee details';
  return 'YORK';
}

export default function AdminLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const handleToggle = () => {
    if (window.innerWidth <= 960) {
      setMobileOpen((o) => !o);
    } else {
      setCollapsed((c) => !c);
    }
  };

  return (
    <div className={`admin-shell ${collapsed ? 'collapsed' : ''}`}>
      <Sidebar collapsed={collapsed} mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />
      <div className="admin-main">
        <Navbar title={titleFor(location.pathname)} onToggleSidebar={handleToggle} />
        <main className="admin-content">{children}</main>
      </div>
      <FloatingChatBox />
    </div>
  );
}
