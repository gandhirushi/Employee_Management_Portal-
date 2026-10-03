import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import Logo from '../components/Logo';
import GoogleAuthButton from '../components/GoogleAuthButton';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';
import { validateLogin } from '../utils/validation';

export default function Login() {
  const { login, loginWithGoogle } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [values, setValues] = useState({ email: '', password: '', rememberMe: false });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [banner, setBanner] = useState('');

  const set = (key) => (e) => setValues((v) => ({ ...v, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateLogin(values);
    setErrors(validationErrors);
    setBanner('');
    if (Object.keys(validationErrors).length > 0) return;

        const result = await login(values.email, values.password, values.rememberMe);
    if (!result.ok) {
      setBanner(result.error);
      return;
    }
    showToast('Welcome back!', `Logged in as ${result.user.email}`);
    const redirectTo = location.state?.from || (result.user.role === 'employee' && !result.user.isOnboarded ? '/onboarding' : '/dashboard');
    navigate(redirectTo, { replace: true });
  };

  const handleGoogleSuccess = async (credential) => {
    setBanner('');
    const result = await loginWithGoogle(credential, values.rememberMe);
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
      const redirectTo = location.state?.from || '/dashboard';
      navigate(redirectTo, { replace: true });
    }
  };

  const handleGoogleError = (errorMsg) => {
    setBanner(errorMsg || 'Google authentication failed.');
  };

  return (
    <div className="auth-page">
      <div className="auth-brand-panel">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Logo size={36} />
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.15rem' }}>YORK</span>
        </div>
        <div className="auth-brand-copy">
          <h1>Run your team with clarity, not chaos.</h1>
          <p>One dashboard for every hire, department, and status change — with the numbers that matter, always current.</p>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.8rem' }}>© {new Date().getFullYear()} York HR</p>
      </div>
      <div className="auth-form-panel">
        <div className="auth-card">
          <h2>Welcome back</h2>
          <p className="auth-sub">Sign in to your admin dashboard.</p>
          {banner && <div className="form-banner error">{banner}</div>}
          <form onSubmit={handleSubmit}>
            <div className={`field ${errors.email ? 'has-error' : ''}`}>
              <label htmlFor="email">Email address</label>
              <input id="email" type="email" value={values.email} onChange={set('email')} placeholder="you@company.com" autoComplete="email" />
              {errors.email && <div className="error-text">{errors.email}</div>}
            </div>
            <div className={`field ${errors.password ? 'has-error' : ''}`}>
              <label htmlFor="password">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={values.password}
                  onChange={set('password')}
                  placeholder="••••••••"
                  autoComplete="current-password"
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <label className="checkbox-row">
                <input type="checkbox" checked={values.rememberMe} onChange={set('rememberMe')} />
                Remember me
              </label>
            </div>
            <button type="submit" className="btn btn-primary btn-block">Sign in</button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0 16px', color: 'var(--text-faint)', fontSize: '0.8rem' }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }}></div>
            <span style={{ padding: '0 12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>or continue with</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }}></div>
          </div>

          <GoogleAuthButton onSuccess={handleGoogleSuccess} onError={handleGoogleError} text="signin_with" />

          <p className="auth-footer">
            Don't have an account? <Link to="/signup">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
