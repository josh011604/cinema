import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import Logo from '../components/layout/Logo.jsx';
import { useCinema } from '../context/CinemaContext.jsx';

export default function Account() {
  const { customer, signUp, customerLogin, logout } = useCinema();
  const navigate = useNavigate();
  const [mode, setMode] = useState('signup');
  const [form, setForm] = useState({ fullName: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);

  if (customer) {
    return (
      <section className="admin-auth">
        <div className="admin-auth__wrap">
          <div className="admin-auth__logo"><Logo /></div>
          <div className="admin-auth__panel">
            <header className="admin-auth__head">
              <h1 className="admin-auth__title">Welcome, {customer.fullName || 'Moviegoer'}</h1>
              <p className="admin-auth__text">{customer.email}</p>
            </header>
            <button type="button" className="btn btn--primary btn--block" onClick={() => navigate('/showtimes')}>Book A Ticket</button>
            <button type="button" className="btn btn--ghost btn--block" onClick={logout}><Icon name="logout" size={16} /> Sign Out</button>
          </div>
          <Link to="/" className="admin-auth__back">Back To Website</Link>
        </div>
      </section>
    );
  }

  const update = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
    setError('');
    setNotice('');
  };

  const submit = async (event) => {
    event.preventDefault();
    if (busy) return;
    const fullName = form.fullName.trim();
    const email = form.email.trim();
    if (mode === 'signup' && fullName.length < 2) return setError('Please Enter Your Full Name.');
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError('Please Enter A Valid Email Address.');
    if (form.password.length < 6) return setError('Your Password Must Have At Least 6 Characters.');

    setBusy(true);
    const result = mode === 'signup' ? await signUp(fullName, email, form.password) : await customerLogin(email, form.password);
    setBusy(false);
    if (!result.ok) return setError(result.error);
    if (result.needsConfirmation) {
      setNotice('Account created. Check your email to confirm it, then sign in here.');
      setMode('signin');
      setForm((prev) => ({ ...prev, password: '' }));
      return;
    }
    navigate('/showtimes');
  };

  return (
    <section className="admin-auth">
      <div className="admin-auth__wrap">
        <div className="admin-auth__logo"><Logo /></div>
        <div className="admin-auth__panel">
          <header className="admin-auth__head">
            <h1 className="admin-auth__title">{mode === 'signup' ? 'Create Your Account' : 'Welcome Back'}</h1>
            <p className="admin-auth__text">Save your details for faster checkout. Testing is limited to 10 customer accounts.</p>
          </header>
          <form onSubmit={submit} noValidate className="admin-auth__form">
            {mode === 'signup' ? <div className="form-row"><label htmlFor="account-name">Full Name</label><input id="account-name" type="text" autoComplete="name" value={form.fullName} onChange={update('fullName')} placeholder="Juan Dela Cruz" /></div> : null}
            <div className="form-row"><label htmlFor="account-email">Email</label><input id="account-email" type="email" autoComplete="email" value={form.email} onChange={update('email')} placeholder="you@example.com" /></div>
            <div className="form-row"><label htmlFor="account-password">Password</label><input id="account-password" type="password" autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} value={form.password} onChange={update('password')} placeholder="At least 6 characters" /></div>
            {error ? <p className="admin-auth__error" role="alert"><Icon name="alert" size={16} />{error}</p> : null}
            {notice ? <p className="admin-auth__notice" role="status">{notice}</p> : null}
            <button type="submit" className="btn btn--primary btn--block admin-auth__submit" disabled={busy}>{busy ? 'Please Wait…' : mode === 'signup' ? 'Create Account' : 'Sign In'}</button>
          </form>
          <button type="button" className="link-button account-auth__switch" onClick={() => { setMode(mode === 'signup' ? 'signin' : 'signup'); setError(''); setNotice(''); }}>
            {mode === 'signup' ? 'Already have an account? Sign in' : 'Need an account? Sign up'}
          </button>
        </div>
        <Link to="/" className="admin-auth__back">Back To Website</Link>
      </div>
    </section>
  );
}