import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEmployees } from '../hooks/useEmployees';
import { useToast } from '../context/ToastContext';
import EmployeeForm from '../components/EmployeeForm';
import Logo from '../components/Logo';

export default function Onboarding() {
  const { user, completeOnboarding } = useAuth();
  const { onboardEmployee, loading: submitting } = useEmployees();
  const navigate = useNavigate();
  const { showToast } = useToast();

  if (user?.isOnboarded || user?.role !== 'employee') {
    return <Navigate to="/dashboard" replace />;
  }

  const handleOnboard = async (data) => {
    try {
      await onboardEmployee(data);
      completeOnboarding();
      showToast('Welcome aboard!', 'success');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      showToast(err.message || 'Failed to submit onboarding form', 'error');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '40px 20px',
      backgroundColor: 'var(--surface-subtle, #f3f4f6)'
    }}>
      <div style={{ marginBottom: 30 }}>
        <Logo />
      </div>
      
      <div style={{
        background: '#fff',
        padding: '30px',
        borderRadius: '8px',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '700px'
      }}>
        <h2 style={{ marginTop: 0, marginBottom: '8px' }}>Complete Your Profile</h2>
        <p style={{ color: 'var(--text-muted, #4b5563)', marginBottom: '24px' }}>
          Please fill out your details to continue. This is mandatory for all new employees.
        </p>

        {submitting && (
          <div style={{ marginBottom: 16, color: 'var(--brand-600, #2D3282)', fontWeight: 'bold' }}>
            Submitting your profile...
          </div>
        )}

        <EmployeeForm
          initialValues={{ fullName: user?.fullName || '', email: user?.email || '' }}
          onSubmit={handleOnboard}
          submitLabel={submitting ? "Submitting..." : "Complete Setup"}
        />
      </div>
    </div>
  );
}
