# Connecting Cinema House to Supabase

Cinema House keeps its movies, bookings and poster images in a free Supabase project. Setup takes about 10 minutes and only has to be done once.

## 1. Create the project

1. Sign up at [supabase.com](https://supabase.com) and click **New project** (the Free plan is enough).
2. Pick the region closest to your customers (for the Philippines: **Southeast Asia (Singapore)**) and set a database password. Save the password somewhere safe.

## 2. Create the tables

1. In the project, open **SQL Editor** → **New query**.
2. Paste the whole of `supabase/schema.sql` and click **Run**.
3. Open another new query, paste `supabase/seed.sql` and click **Run**. This adds the 14 starter movies.

**Already set up before?** When the website gains new database fields (such as the cinema rooms a movie plays in), run `supabase/schema.sql` again. It only adds what is missing and keeps all your movies and bookings.

## 3. Create the admin account

1. Go to **Authentication** → **Sign In / Providers** and turn **off** "Allow new users to sign up". Only accounts you create yourself can then sign in.
2. Staff sign in on the website with a **username**, but Supabase needs an email address. So pick a username (for example `admin`) and turn it into a placeholder address by adding `@cinemahouse.local`: `admin@cinemahouse.local`. No email is ever sent to it.
3. Go to **Authentication** → **Users** → **Add user** → **Create new user**. Enter that placeholder address and a strong password, and tick **Auto Confirm User**.
4. In **SQL Editor**, run this with the same address:

   ```sql
   insert into public.admins (user_id)
   select id from auth.users where email = 'admin@cinemahouse.local'
   on conflict do nothing;
   ```

On the website's **Admin Sign In** page, type only the username (`admin`) and the password.

A username with spaces works too: replace each space with a dot in the address. For **Cinema Admin**, create `cinema.admin@cinemahouse.local`, then sign in by typing `Cinema Admin`.

Repeat step 2 and 3 for every staff member who needs the dashboard.

## 4. Connect the website

1. Click **Connect** at the top of the project (or open **Project Settings** → **API Keys**) and copy the **Project URL** and the **Publishable key**.
2. In the project folder, copy `.env.example` to a new file named `.env` and paste the two values in.
3. Restart the dev server (`npm run dev`). Sign in at `/admin/login` with the admin email and password.

Both values are safe to be public. What visitors can do is controlled by the rules in `schema.sql`, not by hiding the key. Never put the **secret** key or the database password in `.env`.

## 5. Deploy (Vercel, free)

1. Push the project to GitHub. `.env` is ignored, so your keys are not uploaded.
2. On [vercel.com](https://vercel.com), click **Add New** → **Project** and import the repository. Vercel detects Vite automatically.
3. Under **Environment Variables**, add `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` with the same values as in `.env`.
4. Click **Deploy**.

`vercel.json` makes page reloads work on every route. Netlify works too; `public/_redirects` handles the same thing there.

## Free plan limits to know

- A free project **pauses after 7 days without any visits**. Open the Supabase dashboard and click **Restore** to wake it up.
- 500 MB of database space and 1 GB of file storage. Posters are shrunk before upload (about 100 KB each), so this is plenty.
