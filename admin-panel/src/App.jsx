import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { NotificationProvider } from './context/NotificationContext';
import { SocketProvider } from './context/SocketContext';
import { ChatProvider } from './context/ChatContext';
import ProtectedRoute from './routes/ProtectedRoute';
import AdminLayout from './layouts/AdminLayout';

// Eagerly loaded auth entry pages
import Login from './pages/Login';
import Signup from './pages/Signup';

// Lazy-loaded routes for code splitting and faster initial page loads
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Employees = lazy(() => import('./pages/Employees'));
const EmployeeDetails = lazy(() => import('./pages/EmployeeDetails'));
const AddEmployee = lazy(() => import('./pages/AddEmployee'));
const EditEmployee = lazy(() => import('./pages/EditEmployee'));
const Notifications = lazy(() => import('./pages/Notifications'));
const Settings = lazy(() => import('./pages/Settings'));
const Onboarding = lazy(() => import('./pages/Onboarding'));
const LeaveApplication = lazy(() => import('./pages/LeaveApplication'));
const AdminLeaves = lazy(() => import('./pages/AdminLeaves'));

function PageLoader() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
      <div className="text-muted" style={{ fontSize: '0.9rem' }}>Loading...</div>
    </div>
  );
}

function Shell({ children }) {
  return <AdminLayout>{children}</AdminLayout>;
}

function AuthLandingRedirect() {
  const { user } = useAuth();
  if (user) {
    if (user.role === 'employee' && !user.isOnboarded) {
      return <Navigate to="/onboarding" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }
  return <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <NotificationProvider>
            <SocketProvider>
              <ChatProvider>
                <BrowserRouter>
                  <Suspense fallback={<PageLoader />}>
                    <Routes>
                      <Route path="/" element={<AuthLandingRedirect />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/signup" element={<Signup />} />
                      <Route path="/onboarding" element={<ProtectedRoute requireOnboarding={false} allowedRoles={['employee']}><Onboarding /></ProtectedRoute>} />

                      <Route path="/dashboard" element={<ProtectedRoute><Shell><Dashboard /></Shell></ProtectedRoute>} />
                      <Route path="/employees" element={<ProtectedRoute allowedRoles={['super_admin', 'hr_admin', 'manager']}><Shell><Employees /></Shell></ProtectedRoute>} />
                      <Route path="/employees/add" element={<ProtectedRoute allowedRoles={['super_admin', 'hr_admin']}><Shell><AddEmployee /></Shell></ProtectedRoute>} />
                      <Route path="/employees/:id" element={<ProtectedRoute allowedRoles={['super_admin', 'hr_admin', 'manager']}><Shell><EmployeeDetails /></Shell></ProtectedRoute>} />
                      <Route path="/employees/:id/edit" element={<ProtectedRoute allowedRoles={['super_admin', 'hr_admin']}><Shell><EditEmployee /></Shell></ProtectedRoute>} />
                      <Route path="/notifications" element={<ProtectedRoute><Shell><Notifications /></Shell></ProtectedRoute>} />
                      <Route path="/settings" element={<ProtectedRoute><Shell><Settings /></Shell></ProtectedRoute>} />
                      <Route path="/leave-application" element={<ProtectedRoute allowedRoles={['employee', 'manager', 'hr_admin']}><Shell><LeaveApplication /></Shell></ProtectedRoute>} />
                      <Route path="/admin/leaves" element={<ProtectedRoute allowedRoles={['super_admin', 'hr_admin']}><Shell><AdminLeaves /></Shell></ProtectedRoute>} />

                      <Route path="*" element={<AuthLandingRedirect />} />
                    </Routes>
                  </Suspense>
                </BrowserRouter>
              </ChatProvider>
            </SocketProvider>
          </NotificationProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
