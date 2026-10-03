import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Bell, Settings, LogOut, Calendar, CalendarCheck } from 'lucide-react';
import Logo from './Logo';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../hooks/useNotifications';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/employees', label: 'Employees', icon: Users, allowedRoles: ['super_admin', 'hr_admin', 'manager'] },
  { to: '/admin/leaves', label: 'Employee Leaves', icon: CalendarCheck, allowedRoles: ['super_admin', 'hr_admin'] },
  { to: '/leave-application', label: 'Leave Application', icon: Calendar, allowedRoles: ['employee', 'manager', 'hr_admin'] },
  { to: '/notifications', label: 'Notifications', icon: Bell },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ collapsed, mobileOpen, onCloseMobile }) {
  const { logout, role } = useAuth();
  const { unreadCount } = useNotifications();

  const visibleNavItems = NAV_ITEMS.filter(item => 
    !item.allowedRoles || item.allowedRoles.includes(role)
  );

  return (
    <>
      {mobileOpen && <div className="sidebar-overlay" onClick={onCloseMobile} />}
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-brand">
          <Logo size={32} />
          <span className="sidebar-brand-name">YORK</span>
        </div>
        <nav className="sidebar-nav">
          {visibleNavItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onCloseMobile}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={18} />
              <span className="label">{label}</span>
              {to === '/notifications' && unreadCount > 0 && <span className="nav-dot" />}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button className="nav-item" style={{ width: '100%', border: 'none', background: 'transparent' }} onClick={logout}>
            <LogOut size={18} />
            <span className="label">Log out</span>
          </button>
        </div>
      </aside>
    </>
  );
}