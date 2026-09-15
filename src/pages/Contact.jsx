import { useState } from 'react';
import PageHeader from '../components/PageHeader.jsx';
import Icon from '../components/Icon.jsx';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', topic: 'General question', message: '' });
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);

  const change = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const submit = (e) => {
    e.preventDefault();
    const next = {};
    if (form.name.trim().length < 2) next.name = 'Please enter your name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) next.email = 'Please enter a valid email address.';
    if (form.message.trim().length < 10) next.message = 'Please write at least a sentence.';
    setErrors(next);
    if (Object.keys(next).length) return;
    setSent(true);
    setForm({ name: '', email: '', topic: 'General question', message: '' });
  };

  return (
    <>
      <PageHeader
        eyebrow="We are listening"
        title="Contact"
        text="Questions about a booking, a private screening or working with us? Write to us."
      />

      <section className="section section--top">
        <div className="container contact-grid">
          <div className="contact-info">
            <ul className="contact-list">
              <li>
                <span className="contact-list__icon">
                  <Icon name="phone" size={18} />
                </span>
                <div>
                  <strong>Box office</strong>
                  <a href="tel:+6328123456">+63 (2) 8123-4567</a>
                </div>
              </li>
              <li>
                <span className="contact-list__icon">
                  <Icon name="mail" size={18} />
                </span>
                <div>
                  <strong>Email</strong>
                  <a href="mailto:hello@cinemahouse.com">hello@cinemahouse.com</a>
                </div>
              </li>
              <li>
                <span className="contact-list__icon">
                  <Icon name="pin" size={18} />
                </span>
                <div>
                  <strong>Address</strong>
                  <span>Tagbilaran City, Bohol</span>
                </div>
              </li>
              <li>
                <span className="contact-list__icon">
                  <Icon name="clock" size={18} />
                </span>
                <div>
                  <strong>Opening hours</strong>
                  <span>Daily, 9:30 AM to 8:00 PM</span>
                </div>
              </li>
            </ul>

            <div className="contact-note" id="advertising">
              <h3>Advertising</h3>
              <p>Pre roll slots, lobby displays and event partnerships: ads@cinemahouse.com</p>
            </div>
            <div className="contact-note" id="careers">
              <h3>Careers</h3>
              <p>Projectionists, baristas and floor staff are always welcome: jobs@cinemahouse.com</p>
            </div>
          </div>

          <div className="panel">
            <h2 className="panel__title">Send a message</h2>
            {sent ? (
              <p className="alert alert--success">
                <Icon name="check" size={16} />
                Thank you. Our team replies within one business day.
              </p>
            ) : null}

            <form onSubmit={submit} noValidate className="form-grid">
              <div className="form-row">
                <label htmlFor="c-name">Name<span className="req">*</span></label>
                <input
                  id="c-name"
                  type="text"
                  value={form.name}
                  className={errors.name ? 'has-error' : ''}
                  onChange={(e) => change('name', e.target.value)}
                />
                {errors.name ? <span className="form-error">{errors.name}</span> : null}
              </div>

              <div className="form-row">
                <label htmlFor="c-email">Email<span className="req">*</span></label>
                <input
                  id="c-email"
                  type="email"
                  value={form.email}
                  className={errors.email ? 'has-error' : ''}
                  onChange={(e) => change('email', e.target.value)}
                />
                {errors.email ? <span className="form-error">{errors.email}</span> : null}
              </div>

              <div className="form-row form-row--wide">
                <label htmlFor="c-topic">Topic</label>
                <select id="c-topic" value={form.topic} onChange={(e) => change('topic', e.target.value)}>
                  <option>General question</option>
                  <option>Booking or refund</option>
                  <option>Private screening</option>
                  <option>Advertising</option>
                  <option>Careers</option>
                </select>
              </div>

              <div className="form-row form-row--wide">
                <label htmlFor="c-message">Message<span className="req">*</span></label>
                <textarea
                  id="c-message"
                  rows="5"
                  value={form.message}
                  className={errors.message ? 'has-error' : ''}
                  onChange={(e) => change('message', e.target.value)}
                />
                {errors.message ? <span className="form-error">{errors.message}</span> : null}
              </div>

              <div className="form-row form-row--wide">
                <button type="submit" className="btn btn--primary">
                  Send message
                  <Icon name="send" size={16} filled />
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
