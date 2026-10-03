import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import Logo from '../components/Logo';
import GoogleAuthButton from '../components/GoogleAuthButton';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';
import { validateSignup } from '../utils/validation';

export default function Signup() {
  const { signup, loginWithGoogle } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [values, setValues] = useState({ fullName: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [banner, setBanner] = useState('');
  const [success, setSuccess] = useState(false);

  const set = (key) => (e) => setValues((v) => ({ ...v, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateSignup(values);
    setErrors(validationErrors);
    setBanner('');
    if (Object.keys(validationErrors).length > 0) return;

    const result = await signup(values.fullName.trim(), values.email.trim(), values.password);
    
    if (!result.ok) {
    // If backend sent field-specific errors, map them directly under input fields
    if (result.errors && typeof result.errors === 'object') {
      setErrors(result.errors);
    } else {
      // General fallback error in top banner
      setBanner(result.error || 'Registration failed. Please try again.');
    }
      return;
    }
    setSuccess(true);
    setTimeout(() => navigate('/login'), 1200);
  };

  const handleGoogleSuccess = async (credential) => {
    setBanner('');
    const result = await loginWithGoogle(credential, false);
    if (!result.ok) {
      setBanner(result.error);
      return;
    }

    showToast(
      result.isNewUser ? 'Welcome to York!' : 'Welcome back!',
      `Signed in with Google as ${result.user.email}`
    );

    if (result.user.role === 'employee' && !result.user.isOnboarded) {
      navigate('/onboarding', { replace: true });
    } else {
      navigate('/dashboard', { replace: true });
    }
  };

  const handleGoogleError = (errorMsg) => {
    setBanner(errorMsg || 'Google sign-up failed.');
  };

  return (
    <div className="auth-page">
      <div className="auth-brand-panel">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Logo size={36} />
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.15rem' }}>YORK</span>
        </div>
        <div className="auth-brand-copy">
          <h1>Every hire, every change, in one place.</h1>
          <p>Create an account to start managing your team, departments, leaves, and activity in one unified dashboard.</p>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.8rem' }}>© {new Date().getFullYear()} YORK HR</p>
      </div>
      <div className="auth-form-panel">
        <div className="auth-card">
          <h2>Create your account</h2>
          <p className="auth-sub">Get started with the YORK admin panel.</p>
          {banner && <div className="form-banner error">{banner}</div>}
          {success && <div className="form-banner success">Account created! Redirecting to sign in…</div>}
          <form onSubmit={handleSubmit}>
            <div className={`field ${errors.fullName ? 'has-error' : ''}`}>
              <label htmlFor="fullName">Full name</label>
              <input id="fullName" value={values.fullName} onChange={set('fullName')} placeholder="Jordan Blake" autoComplete="name" />
              {errors.fullName && <div className="error-text">{errors.fullName}</div>}
            </div>
            <div className={`field ${errors.email ? 'has-error' : ''}`}>
              <label htmlFor="email">Email address</label>
              <input id="email" type="email" value={values.email} onChange={set('email')} placeholder="you@company.com" autoComplete="email" />
              {errors.email && <div className="error-text">{errors.email}</div>}
            </div>
            <div className="field-row">
              <div className={`field ${errors.password ? 'has-error' : ''}`}>
                <label htmlFor="password">Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={values.password}
                    onChange={set('password')}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    style={{ paddingRight: 40 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    style={{ position: 'absolute', right: 10, top: 10, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-faint)' }}
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
                {errors.password && <div className="error-text">{errors.password}</div>}
              </div>
              <div className={`field ${errors.confirmPassword ? 'has-error' : ''}`}>
                <label htmlFor="confirmPassword">Confirm password</label>
                <input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={values.confirmPassword}
                  onChange={set('confirmPassword')}
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
                {errors.confirmPassword && <div className="error-text">{errors.confirmPassword}</div>}
              </div>
            </div>
            <button type="submit" className="btn btn-primary btn-block">Create account</button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0 16px', color: 'var(--text-faint)', fontSize: '0.8rem' }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }}></div>
            <span style={{ padding: '0 12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>or continue with</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }}></div>
          </div>

          <GoogleAuthButton onSuccess={handleGoogleSuccess} onError={handleGoogleError} text="signup_with" />

          <p className="auth-footer">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
