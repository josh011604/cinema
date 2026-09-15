import { useEffect, useMemo, useState } from 'react';
import Icon from '../../components/Icon.jsx';
import { DEFAULT_PRICING, ROOM_TYPES, SEAT_TYPES, seatTypesIn } from '../../data/halls.js';
import { EVENING_FACTOR, MORNING_FACTOR } from '../../data/showtimes.js';
import { money } from '../../lib/format.js';
import { useCinema } from '../../context/CinemaContext.jsx';

const MAX_PRICE = 100000;

const SEAT_NAMES = {
  standard: 'Standard',
  vip: 'VIP Recliner',
  sofa: 'Sofa (Love Seat)'
};

// Which seat types each room type really has (Standard halls have no sofas).
const OFFERED = Object.fromEntries(ROOM_TYPES.map(({ id }) => [id, seatTypesIn(id)]));

// Inputs hold text so a field can be empty while it is being retyped.
const toForm = (pricing) => ({
  bookingFee: String(pricing.bookingFee),
  ...Object.fromEntries(
    ROOM_TYPES.map(({ id }) => [id, Object.fromEntries(SEAT_TYPES.map((type) => [type, String(pricing[id][type])]))])
  )
});

const isValidPrice = (value) => /^\d+$/.test(String(value).trim()) && Number(value) <= MAX_PRICE;

const percent = (factor) => `${Math.round(Math.abs(1 - factor) * 100)}%`;

function PriceInput({ id, label, value, error, onChange }) {
  return (
    <div className="price-field">
      <div className={`price-input ${error ? 'has-error' : ''}`}>
        <span aria-hidden="true">₱</span>
        <input
          id={id}
          type="text"
          inputMode="numeric"
          aria-label={label}
          aria-invalid={Boolean(error)}
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/[^\d]/g, '').slice(0, 6))}
        />
      </div>
      {error ? <span className="form-error">{error}</span> : null}
    </div>
  );
}

export default function AdminPricing() {
  const { pricing, savePricing } = useCinema();
  const [form, setForm] = useState(() => toForm(pricing));
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null);

  // Show the saved prices again whenever they change (after a save).
  useEffect(() => {
    setForm(toForm(pricing));
  }, [pricing]);

  const dirty = useMemo(() => JSON.stringify(form) !== JSON.stringify(toForm(pricing)), [form, pricing]);

  const clearFeedback = (key) => {
    setErrors((prev) => ({ ...prev, [key]: undefined }));
    setStatus(null);
  };

  const setSeatPrice = (roomType, seatType, value) => {
    setForm((prev) => ({ ...prev, [roomType]: { ...prev[roomType], [seatType]: value } }));
    clearFeedback(`${roomType}.${seatType}`);
  };

  const setBookingFee = (value) => {
    setForm((prev) => ({ ...prev, bookingFee: value }));
    clearFeedback('bookingFee');
  };

  const useDefaults = () => {
    setForm(toForm(DEFAULT_PRICING));
    setErrors({});
    setStatus(null);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (saving) return;

    const next = {};
    ROOM_TYPES.forEach(({ id }) =>
      OFFERED[id].forEach((type) => {
        if (!isValidPrice(form[id][type])) next[`${id}.${type}`] = 'Enter A Whole Peso Amount.';
      })
    );
    if (!isValidPrice(form.bookingFee)) next.bookingFee = 'Enter A Whole Peso Amount.';

    setErrors(next);
    if (Object.keys(next).length) return;

    setSaving(true);
    setStatus(null);
    try {
      await savePricing({
        bookingFee: Number(form.bookingFee),
        ...Object.fromEntries(
          ROOM_TYPES.map(({ id }) => [
            id,
            Object.fromEntries(
              SEAT_TYPES.map((type) => [type, OFFERED[id].includes(type) ? Number(form[id][type]) : pricing[id][type]])
            )
          ])
        )
      });
      setStatus({ kind: 'success', text: 'Prices Saved. New Bookings Use Them Right Away.' });
    } catch (err) {
      setStatus({ kind: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const example = Number(form.standard.standard) || 0;

  return (
    <div className="admin-stack">
      <form className="panel pricing" onSubmit={submit} noValidate>
        <div className="pricing__head">
          <h2 className="panel__title">Ticket Prices</h2>
          <p className="pricing__hint">
            Set The Seat Prices For Each Room Type. Changes Apply To New Bookings; Tickets Already Sold Keep Their Price.
          </p>
        </div>

        <div className="table-wrap">
          <table className="pricing__table">
            <thead>
              <tr>
                <th scope="col">Seat Type</th>
                {ROOM_TYPES.map((room) => (
                  <th scope="col" key={room.id}>
                    {room.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SEAT_TYPES.map((seatType) => (
                <tr key={seatType}>
                  <th scope="row">{SEAT_NAMES[seatType]}</th>
                  {ROOM_TYPES.map((room) => {
                    const key = `${room.id}.${seatType}`;
                    return (
                      <td key={room.id}>
                        {OFFERED[room.id].includes(seatType) ? (
                          <PriceInput
                            id={`price-${room.id}-${seatType}`}
                            label={`${SEAT_NAMES[seatType]} Seat Price In The ${room.label}`}
                            value={form[room.id][seatType]}
                            error={errors[key]}
                            onChange={(value) => setSeatPrice(room.id, seatType, value)}
                          />
                        ) : (
                          <span className="pricing__none">Not Available</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pricing__fee">
          <div>
            <label htmlFor="price-booking-fee" className="pricing__fee-label">
              Booking Fee Per Seat
            </label>
            <p className="pricing__hint">Added At Checkout For Every Seat, In Every Room.</p>
          </div>
          <PriceInput
            id="price-booking-fee"
            label="Booking Fee Per Seat"
            value={form.bookingFee}
            error={errors.bookingFee}
            onChange={setBookingFee}
          />
        </div>

        <p className="pricing__note">
          <Icon name="clock" size={16} />
          <span>
            Screenings Before 12:00 PM Are {percent(MORNING_FACTOR)} Off, And Screenings From 5:00 PM Cost{' '}
            {percent(EVENING_FACTOR)} More.
            {example
              ? ` For Example, A ${money(example)} Standard Seat Is ${money(Math.round(example * MORNING_FACTOR))} In The Morning And ${money(
                  Math.round(example * EVENING_FACTOR)
                )} In The Evening.`
              : ''}
          </span>
        </p>

        <div className="pricing__actions">
          {status ? (
            <p className={`pricing__status is-${status.kind}`} role={status.kind === 'error' ? 'alert' : 'status'}>
              <Icon name={status.kind === 'error' ? 'alert' : 'check'} size={16} />
              {status.text}
            </p>
          ) : null}
          <button type="button" className="btn btn--ghost" onClick={useDefaults} disabled={saving}>
            Use Default Prices
          </button>
          <button type="submit" className="btn btn--primary" disabled={saving || !dirty}>
            {saving ? 'Saving…' : 'Save Prices'}
          </button>
        </div>
      </form>
    </div>
  );
}
