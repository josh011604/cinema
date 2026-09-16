import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AppStatus from '../components/AppStatus.jsx';
import { normalizePricing } from '../data/halls.js';
import { MOVIES } from '../data/movies.js';
import { buildShowtimes } from '../data/showtimes.js';
import { bookingFromRow, movieFromRow, movieToRow } from '../lib/db.js';
import { readJSON, removeKey, writeJSON, STORAGE_KEYS } from '../lib/storage.js';
import { isSupabaseConfigured, supabase } from '../lib/supabase.js';

const CinemaContext = createContext(null);

const POSTER_BUCKET = 'posters';

const byCatalogOrder = (a, b) => a.sortOrder - b.sortOrder;

// Logs the technical error for debugging and hands the page a readable message.
function failure(error, message) {
  if (error) console.error(error);
  return new Error(message);
}

// Finds an uploaded poster's file path from its public URL, so the old file
// can be deleted when a poster is replaced or its movie is removed.
function posterPath(url) {
  const marker = `/object/public/${POSTER_BUCKET}/`;
  const index = typeof url === 'string' ? url.indexOf(marker) : -1;
  return index === -1 ? null : decodeURIComponent(url.slice(index + marker.length));
}

async function removePosterFile(url) {
  const path = posterPath(url);
  if (!path) return;
  const { error } = await supabase.storage.from(POSTER_BUCKET).remove([path]);
  if (error) console.error(error);
}

async function checkIsAdmin() {
  const { data, error } = await supabase.rpc('is_admin');
  if (error) console.error(error);
  return !error && data === true;
}

export function CinemaProvider({ children }) {
  const [movies, setMovies] = useState([]);
  const [pricing, setPricing] = useState(() => normalizePricing(null));
  const [catalogStatus, setCatalogStatus] = useState(isSupabaseConfigured ? 'loading' : 'offline');
  const [bookings, setBookings] = useState([]);
  const [bookingsError, setBookingsError] = useState('');
  const [session, setSession] = useState(null);
  const [adminAccess, setAdminAccess] = useState(false);
  const [authReady, setAuthReady] = useState(!isSupabaseConfigured);
  // The checkout draft only matters to this visitor, so it stays in the browser.
  const [draft, setDraftState] = useState(() => readJSON(STORAGE_KEYS.draft, null));

  useEffect(() => {
    if (draft) writeJSON(STORAGE_KEYS.draft, draft);
    else removeKey(STORAGE_KEYS.draft);
  }, [draft]);

  /* -------------------------------- catalog ------------------------------- */

  // Movies and ticket prices load together, since every booking page needs both.
  const loadMovies = useCallback(async () => {
    setCatalogStatus('loading');
    const [moviesResult, pricingResult] = await Promise.all([
      supabase.from('movies').select('*').order('sort_order').order('created_at'),
      supabase.from('settings').select('value').eq('key', 'pricing').maybeSingle()
    ]);

    if (moviesResult.error) {
      console.error(moviesResult.error);
      setCatalogStatus('error');
      return;
    }

    // Without saved prices (or the settings table) the default prices apply.
    if (pricingResult.error) console.error(pricingResult.error);
    setPricing(normalizePricing(pricingResult.data?.value));

    setMovies(moviesResult.data.map(movieFromRow));
    setCatalogStatus('ready');
  }, []);

  useEffect(() => {
    if (isSupabaseConfigured) loadMovies();
  }, [loadMovies]);

  /* --------------------------------- auth --------------------------------- */

  useEffect(() => {
    if (!isSupabaseConfigured) return undefined;
    let active = true;

    // Fires once on load with the saved session, then on every sign in/out.
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      // Supabase advises against calling itself inside this callback, so the
      // admin check runs on the next tick.
      window.setTimeout(async () => {
        const allowed = nextSession ? await checkIsAdmin() : false;
        if (!active) return;
        setSession(nextSession);
        setAdminAccess(allowed);
        setAuthReady(true);
      }, 0);
    });

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  // Staff sign in with a username. Supabase accounts need an email address, so
  // each username stands for "<username>@cinemahouse.local" - a placeholder
  // that never receives mail and is never shown on the website. Addresses
  // cannot contain spaces, so "Cinema Admin" becomes "cinema.admin".
  const login = useCallback(async (username, password) => {
    if (!isSupabaseConfigured) {
      return { ok: false, error: 'Admin sign in is not configured. Please contact the site owner.' };
    }

    const name = username.trim().toLowerCase().replace(/\s+/g, '.');
    const email = name.includes('@') ? name : `${name}@cinemahouse.local`;
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      console.error(error);
      const wrongDetails = error.code === 'invalid_credentials' || error.status === 400;
      return {
        ok: false,
        error: wrongDetails ? 'Incorrect Username Or Password.' : 'Could Not Sign In. Please Try Again.'
      };
    }

    if (!(await checkIsAdmin())) {
      await supabase.auth.signOut();
      return { ok: false, error: 'This Account Does Not Have Admin Access.' };
    }

    setSession(data.session);
    setAdminAccess(true);
    setAuthReady(true);
    return { ok: true };
  }, []);

  const logout = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error(error);
    setSession(null);
    setAdminAccess(false);
    setBookings([]);
  }, []);

  const admin = useMemo(() => {
    if (!session || !adminAccess) return null;
    const email = session.user.email || '';
    // "cinema.admin@cinemahouse.local" is shown as "Cinema Admin".
    const username =
      email
        .split('@')[0]
        .split(/[._-]+/)
        .filter(Boolean)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ') || 'Admin';
    return { email, username, signedInAt: session.user.last_sign_in_at };
  }, [session, adminAccess]);

  /* ----------------------------- customer side ---------------------------- */

  const setDraft = useCallback((value) => setDraftState(value), []);
  const clearDraft = useCallback(() => setDraftState(null), []);

  // Seats already sold online for one screening.
  const fetchTakenSeats = useCallback(async (showtimeId) => {
    const { data, error } = await supabase.rpc('taken_seats', { p_showtime_id: showtimeId });
    if (error) throw failure(error, 'Could not load seat availability. Please refresh the page.');
    return new Set(data || []);
  }, []);

  // Rejects with `takenSeats` when someone else bought one of the seats first.
  const createBooking = useCallback(async (payload) => {
    const { data, error } = await supabase.rpc('create_booking', { p: payload });
    if (error) {
      const match = /SEATS_TAKEN:([\w,-]+)/.exec(error.message || '');
      const err = failure(
        error,
        match
          ? `Seat ${match[1].split(',').join(', ')} was just booked by someone else. Please go back and pick another seat.`
          : 'We could not complete your booking. Please try again.'
      );
      if (match) err.takenSeats = match[1].split(',');
      throw err;
    }
    return bookingFromRow(data);
  }, []);

  const fetchBooking = useCallback(async (code) => {
    const { data, error } = await supabase.rpc('get_booking', { p_code: code }).maybeSingle();
    if (error) throw failure(error, 'Could not load this booking.');
    return data ? bookingFromRow(data) : null;
  }, []);

  /* ------------------------------ admin side ------------------------------ */

  const refreshBookings = useCallback(async () => {
    const { data, error } = await supabase.from('bookings').select('*').order('created_at', { ascending: false });
    if (error) {
      console.error(error);
      setBookingsError('Could Not Load Bookings. Please Refresh The Page.');
      return;
    }
    setBookingsError('');
    setBookings(data.map(bookingFromRow));
  }, []);

  const setBookingStatus = useCallback(async (code, status) => {
    const { data, error } = await supabase.from('bookings').update({ status }).eq('code', code).select('code');
    if (error || !data?.length) throw failure(error, 'Could Not Update The Booking. Please Try Again.');
    setBookings((prev) => prev.map((b) => (b.code === code ? { ...b, status } : b)));
  }, []);

  const deleteBooking = useCallback(async (code) => {
    const { data, error } = await supabase.from('bookings').delete().eq('code', code).select('code');
    if (error || !data?.length) throw failure(error, 'Could Not Delete The Booking. Please Try Again.');
    setBookings((prev) => prev.filter((b) => b.code !== code));
  }, []);

  // Saves the ticket prices the admin set in the Pricing tab.
  const savePricing = useCallback(async (next) => {
    const value = normalizePricing(next);
    const { data, error } = await supabase
      .from('settings')
      .upsert({ key: 'pricing', value, updated_at: new Date().toISOString() })
      .select('value')
      .single();
    if (error) throw failure(error, 'Could Not Save The Prices. Please Try Again.');
    setPricing(normalizePricing(data.value));
  }, []);

  // `posterFile` is a new image to upload; without one the current poster stays.
  const saveMovie = useCallback(
    async (movie, posterFile) => {
      const existing = movies.find((m) => m.id === movie.id);
      let posterUrl = existing?.posterUrl || null;

      if (posterFile) {
        const path = `${movie.id}-${Date.now()}.jpg`;
        const { error: uploadError } = await supabase.storage
          .from(POSTER_BUCKET)
          .upload(path, posterFile, { contentType: 'image/jpeg', cacheControl: '31536000' });
        if (uploadError) throw failure(uploadError, 'Could Not Upload The Poster. Please Try Again.');
        posterUrl = supabase.storage.from(POSTER_BUCKET).getPublicUrl(path).data.publicUrl;
      }

      const sortOrder = existing ? existing.sortOrder : movies.reduce((max, m) => Math.max(max, m.sortOrder), -1) + 1;
      const { data, error } = await supabase
        .from('movies')
        .upsert(movieToRow({ ...movie, posterUrl, sortOrder }))
        .select()
        .single();

      if (error) {
        if (posterFile) await removePosterFile(posterUrl);
        throw failure(error, 'Could Not Save The Movie. Please Try Again.');
      }

      if (existing?.posterUrl && existing.posterUrl !== posterUrl) await removePosterFile(existing.posterUrl);

      const saved = movieFromRow(data);
      setMovies((prev) =>
        prev.some((m) => m.id === saved.id) ? prev.map((m) => (m.id === saved.id ? saved : m)) : [...prev, saved]
      );
      return saved;
    },
    [movies]
  );

  const removeMovie = useCallback(
    async (id) => {
      const target = movies.find((m) => m.id === id);
      const { data, error } = await supabase.from('movies').delete().eq('id', id).select('id');
      if (error || !data?.length) throw failure(error, 'Could Not Remove The Movie. Please Try Again.');
      if (target?.posterUrl) await removePosterFile(target.posterUrl);
      setMovies((prev) => prev.filter((m) => m.id !== id));
    },
    [movies]
  );

  // Replaces the whole catalog with the starter movies bundled with the site.
  const resetCatalog = useCallback(async () => {
    const uploaded = movies.map((m) => m.posterUrl).filter(Boolean);

    const { error: clearError } = await supabase.from('movies').delete().neq('id', '');
    if (clearError) throw failure(clearError, 'Could Not Restore The Default Movies. Please Try Again.');

    const rows = MOVIES.map((m, index) => movieToRow({ ...m, posterUrl: null, sortOrder: index }));
    const { data, error } = await supabase.from('movies').insert(rows).select();
    if (error) {
      await loadMovies();
      throw failure(error, 'Could Not Restore The Default Movies. Please Try Again.');
    }

    await Promise.all(uploaded.map((url) => removePosterFile(url)));
    setMovies(data.map(movieFromRow).sort(byCatalogOrder));
  }, [movies, loadMovies]);

  /* -------------------------------- derived ------------------------------- */

  const nowShowingMovies = useMemo(() => movies.filter((m) => m.status === 'now-showing'), [movies]);
  const comingSoonMovies = useMemo(
    () =>
      movies
        .filter((m) => m.status === 'coming-soon')
        .slice()
        .sort((a, b) => String(a.releaseDate).localeCompare(String(b.releaseDate))),
    [movies]
  );

  // Every bookable screening, built from the times the admin scheduled.
  const showtimes = useMemo(() => buildShowtimes(movies), [movies]);

  const findMovie = useCallback((id) => movies.find((m) => m.id === id), [movies]);

  const value = useMemo(
    () => ({
      movies,
      nowShowingMovies,
      comingSoonMovies,
      findMovie,
      showtimes,
      pricing,
      fetchTakenSeats,
      createBooking,
      fetchBooking,
      draft,
      setDraft,
      clearDraft,
      admin,
      isAdmin: Boolean(admin),
      authReady,
      login,
      logout,
      bookings,
      bookingsError,
      refreshBookings,
      setBookingStatus,
      deleteBooking,
      savePricing,
      saveMovie,
      removeMovie,
      resetCatalog
    }),
    [
      movies,
      nowShowingMovies,
      comingSoonMovies,
      findMovie,
      showtimes,
      pricing,
      fetchTakenSeats,
      createBooking,
      fetchBooking,
      draft,
      setDraft,
      clearDraft,
      admin,
      authReady,
      login,
      logout,
      bookings,
      bookingsError,
      refreshBookings,
      setBookingStatus,
      deleteBooking,
      savePricing,
      saveMovie,
      removeMovie,
      resetCatalog
    ]
  );

  if (catalogStatus === 'offline') {
    return (
      <AppStatus
        title="Database Not Connected"
        text="Add Your Supabase Project URL And Publishable Key To The .env File, Then Restart The Website."
      />
    );
  }

  if (catalogStatus === 'error') {
    return (
      <AppStatus
        title="Something Went Wrong"
        text="We Could Not Load The Movies. Please Check Your Connection And Try Again."
        actionLabel="Try Again"
        onAction={loadMovies}
      />
    );
  }

  if (catalogStatus === 'loading' && !movies.length) {
    return <AppStatus loading />;
  }

  return <CinemaContext.Provider value={value}>{children}</CinemaContext.Provider>;
}

export function useCinema() {
  const ctx = useContext(CinemaContext);
  if (!ctx) throw new Error('useCinema must be used inside a CinemaProvider');
  return ctx;
}
