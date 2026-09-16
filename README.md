# Cinema House

A movie theater website built with React and Vite. Customers browse the schedule, pick their
seats on an interactive seat map and pay with one of five payment methods — no account and no
password required. Staff sign in on a separate page to manage bookings and the movie catalog.

## Running it

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build into dist/
npm run preview  # preview the production build
```

## Administrator login

The staff area lives at `/admin/login` (also linked from the person icon in the header and from
"Staff Login" in the footer).

Authentication uses Supabase. Create the staff user and add it to the `public.admins` table as
described in [supabase/SETUP.md](supabase/SETUP.md). Staff enter the username portion of the
placeholder email, such as `admin` for `admin@cinemahouse.local`.

For a Vercel deployment, add `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` under the
project's Environment Variables, enable them for the deployed environment, and redeploy. Vite
embeds these values during the build.

## Customer booking flow

1. **Showtimes** — pick a day and a screening. Past screenings drop off the list automatically.
2. **Seats** — choose up to 10 seats on the hall map. Standard, VIP recliner and sofa seats are
   priced differently and evening screenings cost a little more.
3. **Payment** — enter a name, email and mobile number, then pay with **Bank Transfer, GCash,
   MariBank, Maya or Debit Card**. Each method asks for its own fields and validates them.
4. **Ticket** — a booking code (`CH-XXXXXX`) and a printable ticket stub. Nothing else is needed
   at the door.

## Admin dashboard

- **Overview** — bookings, tickets sold, gross revenue, screenings today, revenue by movie and
  the latest orders.
- **Bookings** — search and filter every order, expand a row for payment details, check guests
  in, cancel, restore or delete a booking.
- **Movies** — add, edit and remove films, including the generated poster artwork, and restore
  the default catalog.

## Project structure

```
src/
  components/        Reusable UI (icons, posters, seat map, payment form, ticket, layout)
    home/            Home page hero and facts strip
    layout/          Header, footer, logo, search panel, site shell
  context/           CinemaContext - movies, bookings, checkout draft, admin session
  data/              Movies, halls and seat prices, generated showtimes, promos, payment methods
  lib/               Storage wrapper, formatting, seat occupancy, form validation
  pages/             One file per route
    admin/           Login screen and dashboard tabs
  styles/            base / layout / home / booking / admin stylesheets
```

## Notes on the demo build

- There is no backend. Bookings, catalog edits and the admin session are kept in the browser's
  `localStorage`, so they survive a refresh and are visible in the dashboard on the same device.
- Payment is simulated. Card and account numbers are never stored in full — only a masked
  reference (last four digits) is kept with the booking.
- Posters are drawn as SVG from a small color and motif description on each movie, so the site
  needs no external images and works offline.
