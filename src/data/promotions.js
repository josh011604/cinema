export const PROMOTIONS = [
  {
    id: 'popcorn-20',
    featured: true,
    eyebrow: '20% OFF',
    title: 'Popcorn on weekdays',
    text: 'Twenty percent off every popcorn combo from Monday to Thursday when you buy your ticket online.',
    terms: 'Valid Monday through Thursday at the concession counter. Show your online booking code before ordering. Cannot be combined with other food offers.',
    accent: 'gold'
  },
  {
    id: 'student-day',
    eyebrow: 'Every Tuesday',
    title: 'Student Day',
    text: '15% off with a valid student ID every Tuesday, on any screening and any hall.',
    terms: 'One discounted ticket per student ID. Please bring the ID to the entrance, it is checked before the screening.',
    accent: 'blue'
  },
  {
    id: 'family-ticket',
    eyebrow: 'Weekends',
    title: 'Family Ticket',
    text: '2 adults + 2 kids at a special bundle price on Saturdays and Sundays.',
    terms: 'Applies to screenings rated 12+ and below that start before 6:00 PM. Children must be under 12 years old.',
    accent: 'green'
  },
  {
    id: 'birthday-seat',
    eyebrow: 'All year',
    title: 'Birthday Seat',
    text: 'Celebrating your birthday? Your seat is on us, and your guests get 10% off.',
    terms: 'Valid on the day of your birthday and the two days after. Bring a valid government ID.',
    accent: 'pink'
  }
];

export const getPromotion = (id) => PROMOTIONS.find((p) => p.id === id);
