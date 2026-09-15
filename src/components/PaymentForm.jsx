import Icon from './Icon.jsx';
import { PAYMENT_METHODS } from '../data/paymentMethods.js';
import { formatFieldValue } from '../lib/validation.js';

// Renders the method chooser plus the fields the chosen method declares.
export default function PaymentForm({ methodId, onMethodChange, values, errors, onChange }) {
  const method = PAYMENT_METHODS.find((m) => m.id === methodId);

  return (
    <div className="payment">
      <div className="payment__methods" role="radiogroup" aria-label="Payment method">
        {PAYMENT_METHODS.map((option) => (
          <button
            key={option.id}
            type="button"
            role="radio"
            aria-checked={option.id === methodId}
            className={`method ${option.id === methodId ? 'is-active' : ''}`}
            onClick={() => onMethodChange(option.id)}
          >
            <span className="method__icon">
              <Icon name={option.icon} size={20} />
            </span>
            <span className="method__body">
              <span className="method__name">{option.name}</span>
              <span className="method__blurb">{option.blurb}</span>
            </span>
            <span className="method__check">
              <Icon name="check" size={14} />
            </span>
          </button>
        ))}
      </div>

      {method ? (
        <div className="payment__fields">
          <p className="payment__note">
            <Icon name="shield" size={16} />
            {method.note}
          </p>

          <div className="form-grid">
            {method.fields.map((field) => {
              const id = `pay-${method.id}-${field.name}`;
              const error = errors[field.name];
              const value = values[field.name] ?? '';

              return (
                <div className={`form-row ${field.type === 'select' ? 'form-row--wide' : ''}`} key={field.name}>
                  <label htmlFor={id}>
                    {field.label}
                    {field.required ? <span className="req">*</span> : null}
                  </label>

                  {field.type === 'select' ? (
                    <select
                      id={id}
                      value={value}
                      className={error ? 'has-error' : ''}
                      onChange={(e) => onChange(field.name, e.target.value)}
                    >
                      <option value="">Select Your Bank</option>
                      {field.options.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      id={id}
                      type="text"
                      inputMode={field.type === 'text' ? 'text' : 'numeric'}
                      autoComplete="off"
                      className={error ? 'has-error' : ''}
                      placeholder={field.placeholder}
                      value={value}
                      onChange={(e) => onChange(field.name, formatFieldValue(field, e.target.value))}
                    />
                  )}

                  {error ? <span className="form-error">{error}</span> : null}
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
