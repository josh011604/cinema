export const digitsOnly = (value) => String(value || '').replace(/\D/g, '');

export function formatFieldValue(field, raw) {
  switch (field.type) {
    case 'digits':
      return digitsOnly(raw).slice(0, field.maxLength || 20);
    case 'card': {
      const clean = digitsOnly(raw).slice(0, 16);
      return clean.replace(/(.{4})/g, '$1 ').trim();
    }
    case 'expiry': {
      const clean = digitsOnly(raw).slice(0, 4);
      if (clean.length <= 2) return clean;
      return `${clean.slice(0, 2)}/${clean.slice(2)}`;
    }
    default:
      return raw;
  }
}

function expiryError(value) {
  const clean = digitsOnly(value);
  if (clean.length !== 4) return 'Enter The Expiry Date As MM/YY.';
  const month = Number(clean.slice(0, 2));
  const year = 2000 + Number(clean.slice(2));
  if (month < 1 || month > 12) return 'Month Must Be Between 01 And 12.';
  const now = new Date();
  const endOfMonth = new Date(year, month, 0, 23, 59, 59);
  if (endOfMonth < now) return 'This Card Has Already Expired.';
  return null;
}

export function validateField(field, value) {
  const raw = String(value || '').trim();
  if (field.required && !raw) return `${field.label} Is Required.`;
  if (!raw) return null;

  if (field.type === 'expiry') return expiryError(raw);

  if (field.type === 'digits' || field.type === 'card') {
    const clean = digitsOnly(raw);
    if (field.minLength && clean.length < field.minLength) {
      return `${field.label} Must Have At Least ${field.minLength} Digits.`;
    }
    if (field.maxLength && clean.length > field.maxLength) {
      return `${field.label} Must Have At Most ${field.maxLength} Digits.`;
    }
    if (field.name === 'mobileNumber' && !/^0\d{9,10}$/.test(clean)) {
      return 'Enter A Mobile Number That Starts With 0, For Example 09171234567.';
    }
  }

  if (field.type === 'text' && raw.length < 2) return `${field.label} Looks Too Short.`;

  return null;
}

export function validatePaymentFields(method, values) {
  const errors = {};
  method.fields.forEach((field) => {
    const error = validateField(field, values[field.name]);
    if (error) errors[field.name] = error;
  });
  return errors;
}

export function validateContact(contact) {
  const errors = {};
  if (!contact.fullName || contact.fullName.trim().length < 2) {
    errors.fullName = 'Please Enter Your Full Name.';
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(contact.email || '').trim())) {
    errors.email = 'Please Enter A Valid Email Address.';
  }
  const phone = digitsOnly(contact.phone);
  if (phone.length < 10 || phone.length > 11) {
    errors.phone = 'Please Enter A Valid Mobile Number.';
  }
  return errors;
}
