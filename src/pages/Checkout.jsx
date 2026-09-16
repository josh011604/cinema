import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import Steps from '../components/Steps.jsx';
import PaymentForm from '../components/PaymentForm.jsx';
import Icon from '../components/Icon.jsx';
import { getPaymentMethod, PAYMENT_METHODS } from '../data/paymentMethods.js';
import { SEAT_LABELS } from '../data/halls.js';
import { clockTime, longDate, maskAccount, money } from '../lib/format.js';
import { digitsOnly, validateContact, validatePaymentFields } from '../lib/validation.js';
import { useCinema } from '../context/CinemaContext.jsx';

export default function Checkout() {
  const { draft, clearDraft, createBooking, pricing, customer } = useCinema();
  const navigate = useNavigate();

  const [contact, setContact] = useState(() => ({ fullName: customer?.fullName || '', email: customer?.email || '', phone: '' }));
  const [methodId, setMethodId] = useState('gcash');
  const [paymentValues, setPaymentValues] = useState(() => (customer?.fullName ? { accountName: customer.fullName, cardName: customer.fullName } : {}));
  const [errors, setErrors] = useState({ contact: {}, payment: {} });
  const [agreed, setAgreed] = useState(false);
  const [agreeError, setAgreeError] = useState('');
  const [processing, setProcessing] = useState(false);
  const [conflict, setConflict] = useState('');

  useEffect(() => {
    if (!customer) return;
    setContact((prev) => ({
      ...prev,
      fullName: prev.fullName || customer.fullName,
      email: prev.email || customer.email
    }));
    setPaymentValues((prev) => ({
      ...prev,
      accountName: prev.accountName || customer.fullName,
      cardName: prev.cardName || customer.fullName
    }));
  }, [customer]);

  const method = getPaymentMethod(methodId) || PAYMENT_METHODS[0];

  const totals = useMemo(() => {
    if (!draft) return { subtotal: 0, fees: 0, processing: 0, total: 0 };
    const subtotal = draft.subtotal;
    const fees = draft.seats.length * pricing.bookingFee;
    const processingFee = method.fee || 0;
    return { subtotal, fees, processing: processingFee, total: subtotal + fees + processingFee };
  }, [draft, method, pricing.bookingFee]);

  if (!draft) {
    return <Navigate to="/showtimes" replace />;
  }

  const changeMethod = (id) => {
    setMethodId(id);
    setPaymentValues({});
    setErrors((prev) => ({ ...prev, payment: {} }));
  };

  const changePaymentField = (name, value) => {
    setPaymentValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, payment: { ...prev.payment, [name]: undefined } }));
  };

  const changeContact = (name, value) => {
    setContact((prev) => ({ ...prev, [name]: value }));
    if (name === 'fullName') {
      setPaymentValues((prev) => ({
        ...prev,
        ...(prev.accountName === contact.fullName ? { accountName: value } : {}),
        ...(prev.cardName === contact.fullName ? { cardName: value } : {})
      }));
    }
    setErrors((prev) => ({ ...prev, contact: { ...prev.contact, [name]: undefined } }));
  };

  // Builds the non sensitive payment record kept with the booking.
  const paymentSummary = () => {
    const detail = {};
    if (paymentValues.bankName) detail.bank = paymentValues.bankName;
    if (paymentValues.accountName) detail.accountName = paymentValues.accountName;
    if (paymentValues.cardName) detail.accountName = paymentValues.cardName;
    if (paymentValues.mobileNumber) detail.reference = maskAccount(paymentValues.mobileNumber);
    if (paymentValues.accountNumber) detail.reference = maskAccount(paymentValues.accountNumber);
    if (paymentValues.cardNumber) detail.reference = maskAccount(digitsOnly(paymentValues.cardNumber));
    return { methodId: method.id, methodName: method.name, ...detail };
  };

  const submit = async (e) => {
    e.preventDefault();
    if (processing) return;

    const contactErrors = validateContact(contact);
    const paymentErrors = validatePaymentFields(method, paymentValues);
    setErrors({ contact: contactErrors, payment: paymentErrors });
    setAgreeError(agreed ? '' : 'Please Confirm That Your Booking Details Are Correct.');

    if (Object.keys(contactErrors).length || Object.keys(paymentErrors).length || !agreed) {
      return;
    }

    setProcessing(true);
    setConflict('');
    try {
      // The database re-checks the seats while saving, so a seat someone else
      // bought while this form was open is rejected instead of sold twice.
      const booking = await createBooking({
        ...draft,
        customer: { ...contact, phone: digitsOnly(contact.phone) },
        payment: paymentSummary(),
        subtotal: totals.subtotal,
        fees: totals.fees + totals.processing,
        total: totals.total
      });
      clearDraft();
      navigate(`/confirmation/${booking.code}`, { replace: true, state: { booking } });
    } catch (err) {
      setConflict(err.message);
      setProcessing(false);
    }
  };

  return (
    <section className="section section--top">
      <div className="container">
        <Steps current={2} />

        <form className="booking__layout" onSubmit={submit} noValidate>
          <div className="booking__main">
            <div className="panel">
              <h2 className="panel__title">Your Details</h2>
              <p className="panel__hint">
                Your account details are prefilled. You can edit the ticket name or email before paying.
              </p>

              <div className="form-grid">
                <div className="form-row form-row--wide">
                  <label htmlFor="fullName">
                    Full Name<span className="req">*</span>
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    value={contact.fullName}
                    className={errors.contact.fullName ? 'has-error' : ''}
                    onChange={(e) => changeContact('fullName', e.target.value)}
                    placeholder="Juan Dela Cruz"
                  />
                  {errors.contact.fullName ? <span className="form-error">{errors.contact.fullName}</span> : null}
                </div>

                <div className="form-row">
                  <label htmlFor="email">
                    Email<span className="req">*</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={contact.email}
                    className={errors.contact.email ? 'has-error' : ''}
                    onChange={(e) => changeContact('email', e.target.value)}
                    placeholder="you@example.com"
                  />
                  {errors.contact.email ? <span className="form-error">{errors.contact.email}</span> : null}
                </div>

                <div className="form-row">
                  <label htmlFor="phone">
                    Mobile Number<span className="req">*</span>
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    inputMode="numeric"
                    value={contact.phone}
                    className={errors.contact.phone ? 'has-error' : ''}
                    onChange={(e) => changeContact('phone', digitsOnly(e.target.value).slice(0, 11))}
                    placeholder="09XXXXXXXXX"
                  />
                  {errors.contact.phone ? <span className="form-error">{errors.contact.phone}</span> : null}
                </div>
              </div>
            </div>

            <div className="panel">
              <h2 className="panel__title">Payment Method</h2>
              <p className="panel__hint">Choose How You Want To Pay, Then Fill In The Details For That Method.</p>
              <PaymentForm
                methodId={methodId}
                onMethodChange={changeMethod}
                values={paymentValues}
                errors={errors.payment}
                onChange={changePaymentField}
              />
            </div>
          </div>

          <aside className="booking__aside">
            <div className="summary">
              <h2 className="summary__title">Order Summary</h2>

              <p className="summary__movie">{draft.movieTitle}</p>
              <ul className="summary__facts">
                <li>
                  <Icon name="calendar" size={15} />
                  {longDate(draft.date)}
                </li>
                <li>
                  <Icon name="clock" size={15} />
                  {clockTime(draft.time)}
                </li>
                <li>
                  <Icon name="screen" size={15} />
                  {draft.hallName} · {draft.format}
                </li>
              </ul>

              <div className="summary__seats">
                <ul>
                  {draft.seats.map((seat) => (
                    <li key={seat.id}>
                      <span>
                        <strong>{seat.id}</strong> · {SEAT_LABELS[seat.type]}
                      </span>
                      <span>{money(seat.price)}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <dl className="summary__lines">
                <div>
                  <dt>Seats Subtotal</dt>
                  <dd>{money(totals.subtotal)}</dd>
                </div>
                <div>
                  <dt>Booking Fee ({draft.seats.length} × {money(pricing.bookingFee)})</dt>
                  <dd>{money(totals.fees)}</dd>
                </div>
                {totals.processing ? (
                  <div>
                    <dt>{method.name} Fee</dt>
                    <dd>{money(totals.processing)}</dd>
                  </div>
                ) : null}
              </dl>

              <div className="summary__total">
                <span>Amount Due</span>
                <strong>{money(totals.total)}</strong>
              </div>

              <label className={`checkbox ${agreeError ? 'has-error' : ''}`}>
                <input type="checkbox" checked={agreed} onChange={(e) => { setAgreed(e.target.checked); setAgreeError(''); }} />
                <span>I Have Checked My Movie, Showtime And Seats, And I Agree To The Booking Terms.</span>
              </label>
              {agreeError ? <span className="form-error">{agreeError}</span> : null}

              {conflict ? (
                <p className="alert alert--error">
                  <Icon name="close" size={15} />
                  {conflict}
                </p>
              ) : null}

              <button type="submit" className="btn btn--primary btn--block" disabled={processing}>
                {processing ? 'Processing Payment…' : `Pay ${money(totals.total)}`}
              </button>

              <Link to={`/booking/${draft.movieId}?showtime=${draft.showtimeId}`} className="link-quiet center-block">
                Back To Seat Selection
              </Link>
            </div>
          </aside>
        </form>
      </div>
    </section>
  );
}
