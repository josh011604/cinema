import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import AppStatus from '../../components/AppStatus.jsx';
import Icon from '../../components/Icon.jsx';
import Logo from '../../components/layout/Logo.jsx';
import { useCinema } from '../../context/CinemaContext.jsx';

export default function AdminLogin() {
  const { login, isAdmin, authReady } = useCinema();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/admin';

  const [form, setForm] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (!authReady) return <AppStatus loading />;
  if (isAdmin) return <Navigate to={from} replace />;

  // Typing again clears the previous error so it never lingers over a fresh attempt.
  const update = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (error) setError('');
  };

  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    setError('');

    if (!form.username.trim() || !form.password) {
      setError('Please Enter Your Username And Password.');
      return;
    }

    setBusy(true);
    const result = await login(form.username, form.password);
    setBusy(false);

    if (!result.ok) {
      setError(result.error);
      setForm((prev) => ({ ...prev, password: '' }));
      return;
    }
    navigate(from, { replace: true });
  };

  const inputClass = error ? 'has-error' : undefined;

  return (
    <section className="admin-auth">
      <div className="admin-auth__wrap">
        <div className="admin-auth__logo">
          <Logo />
        </div>

        <div className="admin-auth__panel">
          <header className="admin-auth__head">
            <h1 className="admin-auth__title">Admin Sign In</h1>
            <p className="admin-auth__text">Sign In To Manage Bookings And Movies.</p>
          </header>

          <form onSubmit={submit} noValidate className="admin-auth__form">
            <div className="form-row">
              <label htmlFor="admin-user">Username</label>
              <input
                id="admin-user"
                type="text"
                autoComplete="username"
                autoCapitalize="none"
                spellCheck={false}
                className={inputClass}
                value={form.username}
                onChange={update('username')}
                placeholder="Enter Your Username"
                aria-invalid={Boolean(error)}
                aria-describedby={error ? 'admin-auth-error' : undefined}
                autoFocus
              />
            </div>

            <div className="form-row">
              <label htmlFor="admin-pass">Password</label>
              <div className="password-field">
                <input
                  id="admin-pass"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  className={inputClass}
                  value={form.password}
                  onChange={update('password')}
                  placeholder="Enter Your Password"
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? 'admin-auth-error' : undefined}
                />
                <button
                  type="button"
                  className="password-field__toggle"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide Password' : 'Show Password'}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {error ? (
              <p id="admin-auth-error" className="admin-auth__error" role="alert">
                <Icon name="alert" size={16} />
                {error}
              </p>
            ) : null}

            <button type="submit" className="btn btn--primary btn--block admin-auth__submit" disabled={busy}>
              {busy ? 'Signing In…' : 'Sign In'}
            </button>
          </form>
        </div>

        <Link to="/" className="admin-auth__back">
          ← Back To Website
        </Link>
      </div>
    </section>
  );
}
