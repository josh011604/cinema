// The five payment methods a customer can pay with. Each method declares the
// fields the checkout form has to render, so PaymentForm stays generic.

export const PAYMENT_METHODS = [
  {
    id: 'bank',
    name: 'Bank Transfer',
    blurb: 'Online Banking / InstaPay',
    icon: 'bank',
    fee: 0,
    note: 'You Will Be Redirected To Your Bank To Approve The Transfer.',
    fields: [
      {
        name: 'bankName',
        label: 'Bank',
        type: 'select',
        options: [
          'BDO Unibank',
          'BPI',
          'Metrobank',
          'Land Bank of the Philippines',
          'Security Bank',
          'UnionBank',
          'RCBC'
        ],
        required: true
      },
      { name: 'accountName', label: 'Account Name', type: 'text', placeholder: 'Name On The Account', required: true },
      {
        name: 'accountNumber',
        label: 'Account Number',
        type: 'digits',
        maxLength: 16,
        minLength: 10,
        placeholder: '10 To 16 Digits',
        required: true
      }
    ]
  },
  {
    id: 'gcash',
    name: 'GCash',
    blurb: 'E-Wallet',
    icon: 'wallet',
    fee: 0,
    note: 'A Payment Request Is Sent To Your GCash App. Approve It Within 10 Minutes.',
    fields: [
      {
        name: 'mobileNumber',
        label: 'GCash Mobile Number',
        type: 'digits',
        maxLength: 11,
        minLength: 11,
        placeholder: '09XXXXXXXXX',
        required: true
      },
      { name: 'accountName', label: 'Account Name', type: 'text', placeholder: 'Registered Account Name', required: true }
    ]
  },
  {
    id: 'maribank',
    name: 'MariBank',
    blurb: 'Digital Bank',
    icon: 'bank',
    fee: 0,
    note: 'Confirm The Payment In Your MariBank App To Release The Seats.',
    fields: [
      {
        name: 'mobileNumber',
        label: 'Registered Mobile Number',
        type: 'digits',
        maxLength: 11,
        minLength: 10,
        placeholder: 'Mobile Number Linked To MariBank',
        required: true
      },
      { name: 'accountName', label: 'Account Name', type: 'text', placeholder: 'Name On The Account', required: true },
      {
        name: 'accountNumber',
        label: 'MariBank Account Number',
        type: 'digits',
        maxLength: 16,
        minLength: 8,
        placeholder: 'Account Number',
        required: true
      }
    ]
  },
  {
    id: 'maya',
    name: 'Maya',
    blurb: 'E-Wallet',
    icon: 'wallet',
    fee: 0,
    note: 'Open The Maya App And Approve The Request To Complete The Booking.',
    fields: [
      {
        name: 'mobileNumber',
        label: 'Maya Mobile Number',
        type: 'digits',
        maxLength: 11,
        minLength: 11,
        placeholder: '09XXXXXXXXX',
        required: true
      },
      { name: 'accountName', label: 'Account Name', type: 'text', placeholder: 'Registered Account Name', required: true }
    ]
  },
  {
    id: 'debit',
    name: 'Debit Card',
    blurb: 'Visa / Mastercard',
    icon: 'card',
    fee: 15,
    note: 'A Convenience Fee Of 15 Pesos Is Charged By The Card Processor.',
    fields: [
      { name: 'cardName', label: 'Name On Card', type: 'text', placeholder: 'Exactly As Printed', required: true },
      {
        name: 'cardNumber',
        label: 'Card Number',
        type: 'card',
        maxLength: 16,
        minLength: 16,
        placeholder: '1234 5678 9012 3456',
        required: true
      },
      { name: 'expiry', label: 'Expiry Date', type: 'expiry', maxLength: 5, placeholder: 'MM/YY', required: true },
      { name: 'cvv', label: 'CVV', type: 'digits', maxLength: 4, minLength: 3, placeholder: '3 Digits', required: true }
    ]
  }
];

export const getPaymentMethod = (id) => PAYMENT_METHODS.find((m) => m.id === id);
