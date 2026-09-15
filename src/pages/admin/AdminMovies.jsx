import { useMemo, useState } from 'react';
import Icon from '../../components/Icon.jsx';
import Poster from '../../components/Poster.jsx';
import { HALLS } from '../../data/halls.js';
import {
  CLEANING_MINUTES,
  OPENING_TIME,
  screeningEnd,
  screeningWindow,
  showtimeId,
  suggestStartTime,
  toClock,
  toDateKey,
  toMinutes,
  windowsOverlap
} from '../../data/showtimes.js';
import { clockTime, releaseLabel, runtime } from '../../lib/format.js';
import { useCinema } from '../../context/CinemaContext.jsx';

const FORMATS = ['IMAX', '2D'];
const POSTER_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const POSTER_MAX_BYTES = 10 * 1024 * 1024;

// "Hall 2 - Standard" is offered as "Hall 2 · Standard".
const ROOMS = HALLS.map((hall) => ({
  id: hall.id,
  title: hall.name.split(' - ')[0],
  label: hall.name.replace(' - ', ' · ')
}));
const roomTitle = (id) => ROOMS.find((room) => room.id === id)?.title || 'This Room';

// Screening rows need a stable React key while they are being edited.
let screeningCounter = 0;
const newScreeningKey = () => {
  screeningCounter += 1;
  return `screening-${Date.now()}-${screeningCounter}`;
};

const isUpcoming = (screening) => new Date(`${screening.date}T${screening.time}`) > new Date();

const EMPTY = {
  id: '',
  title: '',
  genres: '',
  ageRating: '12+',
  duration: 120,
  year: new Date().getFullYear(),
  score: 7.5,
  director: '',
  cast: '',
  format: ['2D'],
  screenings: [],
  status: 'now-showing',
  releaseDate: '',
  tagline: '',
  synopsis: '',
  poster: '',
  art: { from: '#1d3b4a', to: '#0a1013', accent: '#a8101c', motif: 'city' }
};

const slugify = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);

function toForm(movie) {
  return {
    ...EMPTY,
    ...movie,
    genres: movie.genres.join(', '),
    cast: movie.cast.join(', '),
    screenings: (movie.screenings || []).map((s) => ({ ...s, key: newScreeningKey() })),
    year: movie.year ?? '',
    score: movie.score ?? '',
    releaseDate: movie.releaseDate || '',
    poster: movie.poster || '',
    art: { ...EMPTY.art, ...movie.art }
  };
}

// Posters are scaled down and re-encoded as JPEG before upload, so they load
// quickly on the website and stay well inside the free storage allowance.
function readPoster(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, 600 / img.width, 900 / img.height);
      const width = Math.round(img.width * scale);
      const height = Math.round(img.height * scale);
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);
      canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Could not encode image'))), 'image/jpeg', 0.85);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Unreadable image'));
    };
    img.src = url;
  });
}

// Local previews of a picked file hold memory until they are released.
const releasePreview = (url) => {
  if (typeof url === 'string' && url.startsWith('blob:')) URL.revokeObjectURL(url);
};

export default function AdminMovies() {
  const { movies, bookings, saveMovie, removeMovie, resetCatalog } = useCinema();
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [posterFile, setPosterFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [dragging, setDragging] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [confirm, setConfirm] = useState(null);
  const [confirmBusy, setConfirmBusy] = useState(false);
  const [confirmError, setConfirmError] = useState('');
  const [notice, setNotice] = useState('');

  const todayKey = toDateKey(new Date());
  const duration = Number(form.duration) || 0;

  // Seats sold per screening. A screening with sales is locked, so the
  // customers who bought tickets for it are never left without a show.
  const bookedSeats = useMemo(() => {
    const counts = new Map();
    bookings.forEach((booking) => {
      if (booking.status === 'cancelled') return;
      counts.set(booking.showtimeId, (counts.get(booking.showtimeId) || 0) + booking.seats.length);
    });
    return counts;
  }, [bookings]);

  // Every other film's screenings, so new times are checked against the rooms' real schedules.
  const otherScreenings = useMemo(
    () =>
      movies
        .filter((movie) => movie.id !== form.id)
        .flatMap((movie) => (movie.screenings || []).map((s) => ({ ...s, duration: movie.duration, title: movie.title }))),
    [movies, form.id]
  );

  // A screening clashes when it shares a room and date with another one and
  // their times (runtime plus the cleaning break) overlap.
  const conflicts = useMemo(() => {
    const result = {};
    form.screenings.forEach((row) => {
      if (!row.date || !row.time || !row.hallId) return;
      const slot = screeningWindow(row.time, duration);
      const candidates = [
        ...form.screenings
          .filter((other) => other.key !== row.key)
          .map((other) => ({ ...other, duration, title: 'Another Screening Of This Movie' })),
        ...otherScreenings
      ];
      const clash = candidates.find(
        (other) =>
          other.date === row.date &&
          other.hallId === row.hallId &&
          other.time &&
          windowsOverlap(slot, screeningWindow(other.time, other.duration))
      );
      if (clash) {
        result[row.key] = `Overlaps ${clash.title} (${clockTime(clash.time)} – ${clockTime(
          screeningEnd(clash.time, clash.duration).time
        )}) In ${roomTitle(row.hallId)}. Leave ${CLEANING_MINUTES} Minutes For Cleaning Between Shows.`;
      }
    });
    return result;
  }, [form.screenings, duration, otherScreenings]);

  const showNotice = (message) => {
    setNotice(message);
    window.setTimeout(() => setNotice(''), 4000);
  };

  const openEditor = (id, values) => {
    setEditing(id);
    setForm(values);
    setPosterFile(null);
    setErrors({});
    setFormError('');
  };

  const openNew = () => openEditor('new', EMPTY);
  const openEdit = (movie) => openEditor(movie.id, toForm(movie));

  const resetEditor = () => {
    releasePreview(form.poster);
    setEditing(null);
    setPosterFile(null);
    setErrors({});
    setFormError('');
    setDragging(false);
  };

  const close = () => {
    if (!saving) resetEditor();
  };

  const change = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const setError = (name, message) => setErrors((prev) => ({ ...prev, [name]: message }));

  const toggleFormat = (value) => {
    setForm((prev) => ({
      ...prev,
      format: prev.format.includes(value) ? prev.format.filter((f) => f !== value) : [...prev.format, value]
    }));
    setErrors((prev) => ({ ...prev, format: undefined }));
  };

  /* ------------------------------ screenings ------------------------------ */

  const bookedFor = (row) => (editing && editing !== 'new' ? bookedSeats.get(showtimeId(form.id, row)) || 0 : 0);

  // New screenings copy the previous row's date and room, and start at the
  // first free moment in that room once the shows before it (and cleaning) end.
  const addScreening = () => {
    const last = form.screenings[form.screenings.length - 1];
    const date = last?.date && last.date >= todayKey ? last.date : todayKey;
    const hallId = last?.hallId || ROOMS[0].id;
    const busy = [...form.screenings.map((s) => ({ ...s, duration })), ...otherScreenings].filter(
      (s) => s.date === date && s.hallId === hallId
    );
    const now = new Date();
    const notBefore =
      date === todayKey
        ? toClock(Math.max(toMinutes(OPENING_TIME), now.getHours() * 60 + now.getMinutes()))
        : OPENING_TIME;

    setForm((prev) => ({
      ...prev,
      screenings: [
        ...prev.screenings,
        { key: newScreeningKey(), date, hallId, time: suggestStartTime(busy, duration, notBefore) }
      ]
    }));
    setErrors((prev) => ({ ...prev, screenings: undefined }));
  };

  const updateScreening = (key, field, value) => {
    setForm((prev) => ({
      ...prev,
      screenings: prev.screenings.map((s) => (s.key === key ? { ...s, [field]: value } : s))
    }));
    setErrors((prev) => ({ ...prev, screenings: undefined }));
  };

  const removeScreening = (key) => {
    setForm((prev) => ({ ...prev, screenings: prev.screenings.filter((s) => s.key !== key) }));
    setErrors((prev) => ({ ...prev, screenings: undefined }));
  };

  /* -------------------------------- poster -------------------------------- */

  const setPoster = (preview, file) => {
    releasePreview(form.poster);
    change('poster', preview);
    setPosterFile(file);
  };

  const pickPoster = async (file) => {
    if (!file) return;
    if (!POSTER_TYPES.includes(file.type)) {
      setError('poster', 'Please Choose A JPG, PNG Or WebP Image.');
      return;
    }
    if (file.size > POSTER_MAX_BYTES) {
      setError('poster', 'The Image Must Be Smaller Than 10 MB.');
      return;
    }
    try {
      const blob = await readPoster(file);
      setPoster(URL.createObjectURL(blob), blob);
    } catch {
      setError('poster', 'This Image Could Not Be Read. Please Try Another File.');
    }
  };

  const dropPoster = (e) => {
    e.preventDefault();
    setDragging(false);
    pickPoster(e.dataTransfer.files?.[0]);
  };

  /* -------------------------------- saving -------------------------------- */

  const submit = async (e) => {
    e.preventDefault();
    if (saving) return;

    const next = {};
    if (!form.poster) next.poster = 'Please Upload A Movie Poster.';
    if (form.title.trim().length < 2) next.title = 'Title Is Required.';
    if (!form.genres.trim()) next.genres = 'Add At Least One Genre.';
    if (!duration || duration < 20) next.duration = 'Runtime Must Be At Least 20 Minutes.';
    if (!form.format.length) next.format = 'Pick At Least One Format.';
    if (form.status === 'coming-soon' && !form.releaseDate) next.releaseDate = 'Please Choose A Release Date.';
    if (form.screenings.some((s) => !s.date || !s.time || !s.hallId)) {
      next.screenings = 'Fill In The Date, Room And Start Time For Every Screening.';
    } else if (Object.keys(conflicts).length) {
      next.screenings = 'Some Show Times Overlap. Please Fix The Highlighted Screenings.';
    }

    const id = editing === 'new' ? slugify(form.title) : form.id;
    if (editing === 'new' && movies.some((m) => m.id === id)) {
      next.title = 'A Movie With This Title Already Exists.';
    }

    setErrors(next);
    if (Object.keys(next).length) return;

    setSaving(true);
    setFormError('');
    try {
      await saveMovie(
        {
          ...form,
          id,
          title: form.title.trim(),
          duration,
          genres: form.genres.split(',').map((g) => g.trim()).filter(Boolean),
          cast: form.cast.split(',').map((c) => c.trim()).filter(Boolean),
          releaseDate: form.status === 'coming-soon' ? form.releaseDate : undefined
        },
        posterFile
      );
      setSaving(false);
      resetEditor();
      showNotice(editing === 'new' ? `"${form.title.trim()}" Was Added To The Catalog.` : `"${form.title.trim()}" Was Updated.`);
    } catch (err) {
      setSaving(false);
      setFormError(err.message);
    }
  };

  const openConfirm = (value) => {
    setConfirm(value);
    setConfirmError('');
  };

  const closeConfirm = () => {
    if (!confirmBusy) setConfirm(null);
  };

  const runConfirm = async () => {
    setConfirmBusy(true);
    setConfirmError('');
    try {
      if (confirm.kind === 'delete') {
        await removeMovie(confirm.movie.id);
        showNotice(`"${confirm.movie.title}" Was Removed From The Catalog.`);
      } else {
        await resetCatalog();
        showNotice('The Default Movies Were Restored.');
      }
      setConfirm(null);
    } catch (err) {
      setConfirmError(err.message);
    } finally {
      setConfirmBusy(false);
    }
  };

  const fieldClass = (name) => (errors[name] ? 'has-error' : undefined);
  const fieldError = (name) => (errors[name] ? <span className="form-error">{errors[name]}</span> : null);

  return (
    <div className="admin-stack">
      {notice ? (
        <p className="alert alert--success">
          <Icon name="check" size={16} />
          {notice}
        </p>
      ) : null}

      <div className="panel">
        <div className="panel__head">
          <h2 className="panel__title">Movie Catalog ({movies.length})</h2>
          <div className="panel__head-actions">
            <button type="button" className="btn btn--ghost btn--sm" onClick={() => openConfirm({ kind: 'reset' })}>
              Restore Defaults
            </button>
            <button type="button" className="btn btn--primary btn--sm" onClick={openNew}>
              <Icon name="plus" size={16} />
              Add Movie
            </button>
          </div>
        </div>

        {movies.length ? (
          <ul className="movie-admin-list">
            {movies.map((movie) => {
              const upcoming = (movie.screenings || []).filter(isUpcoming).length;
              return (
                <li key={movie.id}>
                  <div className="movie-admin-list__art">
                    <Poster movie={movie} />
                  </div>
                  <div className="movie-admin-list__body">
                    <h3>{movie.title}</h3>
                    <p className="muted">
                      {movie.genres.join(', ')} · {runtime(movie.duration)} · {movie.ageRating} · {movie.format.join(' / ')}
                    </p>
                    <span className={`status status--${movie.status === 'now-showing' ? 'confirmed' : 'used'}`}>
                      {movie.status === 'now-showing'
                        ? 'Now Showing'
                        : `Coming ${movie.releaseDate ? releaseLabel(movie.releaseDate) : 'Soon'}`}
                    </span>
                    <span className="movie-admin-list__schedule">
                      <Icon name="clock" size={13} />
                      {upcoming
                        ? `${upcoming} Upcoming ${upcoming === 1 ? 'Screening' : 'Screenings'}`
                        : 'No Upcoming Screenings'}
                    </span>
                  </div>
                  <div className="table__actions">
                    <button type="button" className="icon-button icon-button--sm" title="Edit" onClick={() => openEdit(movie)}>
                      <Icon name="edit" size={15} />
                    </button>
                    <button
                      type="button"
                      className="icon-button icon-button--sm icon-button--danger"
                      title="Remove From Catalog"
                      onClick={() => openConfirm({ kind: 'delete', movie })}
                    >
                      <Icon name="trash" size={15} />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="empty-note">No Movies Yet. Add A Movie Or Restore The Default Catalog.</p>
        )}
      </div>

      {editing ? (
        <div className="overlay" role="dialog" aria-modal="true" aria-labelledby="movie-editor-title">
          <button type="button" className="overlay__backdrop" onClick={close} aria-label="Close" />
          <div className="modal movie-editor">
            <div className="modal__head movie-editor__head">
              <div>
                <h2 id="movie-editor-title">{editing === 'new' ? 'Add Movie' : 'Edit Movie'}</h2>
                <p>Fields Marked With * Are Required.</p>
              </div>
              <button type="button" className="icon-button" onClick={close} aria-label="Close Editor">
                <Icon name="close" size={18} />
              </button>
            </div>

            <form onSubmit={submit} noValidate>
              <div className="movie-editor__body">
                <div className="movie-editor__poster">
                  <span className="field-label">
                    Poster<span className="req">*</span>
                  </span>

                  <label
                    className={[
                      'poster-upload',
                      form.poster ? 'has-image' : '',
                      errors.poster ? 'has-error' : '',
                      dragging ? 'is-dragging' : ''
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragging(true);
                    }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={dropPoster}
                  >
                    <input
                      type="file"
                      accept={POSTER_TYPES.join(',')}
                      className="poster-upload__input"
                      aria-label={form.poster ? 'Change Poster' : 'Upload Poster'}
                      onChange={(e) => {
                        pickPoster(e.target.files?.[0]);
                        e.target.value = '';
                      }}
                    />
                    {form.poster ? (
                      <>
                        <img src={form.poster} alt={`${form.title || 'Movie'} Poster`} />
                        <span className="poster-upload__change">Change Poster</span>
                      </>
                    ) : (
                      <span className="poster-upload__empty">
                        <span className="poster-upload__plus">
                          <Icon name="plus" size={20} />
                        </span>
                        <strong>Upload Poster</strong>
                        <span>Click Or Drag An Image Here</span>
                      </span>
                    )}
                  </label>

                  {errors.poster ? (
                    fieldError('poster')
                  ) : (
                    <div className="poster-upload__foot">
                      <span>JPG, PNG Or WebP · 2:3 Ratio</span>
                      {form.poster ? (
                        <button type="button" className="poster-upload__remove" onClick={() => setPoster('', null)}>
                          Remove
                        </button>
                      ) : null}
                    </div>
                  )}
                </div>

                <div className="movie-editor__fields">
                  <section className="movie-editor__section">
                    <h3>Basic Details</h3>
                    <div className="form-grid">
                      <div className="form-row form-row--wide">
                        <label htmlFor="m-title">
                          Title<span className="req">*</span>
                        </label>
                        <input
                          id="m-title"
                          type="text"
                          value={form.title}
                          placeholder="Enter The Movie Title"
                          className={fieldClass('title')}
                          onChange={(e) => change('title', e.target.value)}
                        />
                        {fieldError('title')}
                      </div>

                      <div className="form-row">
                        <label htmlFor="m-genres">
                          Genres<span className="req">*</span>
                        </label>
                        <input
                          id="m-genres"
                          type="text"
                          value={form.genres}
                          placeholder="Action, Drama"
                          className={fieldClass('genres')}
                          onChange={(e) => change('genres', e.target.value)}
                        />
                        {fieldError('genres')}
                      </div>

                      <div className="form-row">
                        <label htmlFor="m-age">Age Rating</label>
                        <select id="m-age" value={form.ageRating} onChange={(e) => change('ageRating', e.target.value)}>
                          {['0+', '6+', '12+', '16+', '18+'].map((r) => (
                            <option key={r}>{r}</option>
                          ))}
                        </select>
                      </div>

                      <div className="form-row">
                        <label htmlFor="m-duration">
                          Runtime (Minutes)<span className="req">*</span>
                        </label>
                        <input
                          id="m-duration"
                          type="number"
                          min="20"
                          max="400"
                          value={form.duration}
                          className={fieldClass('duration')}
                          onChange={(e) => change('duration', e.target.value)}
                        />
                        {fieldError('duration')}
                      </div>

                      <div className="form-row">
                        <label htmlFor="m-year">Year</label>
                        <input
                          id="m-year"
                          type="number"
                          min="1900"
                          max="2100"
                          value={form.year}
                          onChange={(e) => change('year', e.target.value)}
                        />
                      </div>

                      <div className="form-row">
                        <label htmlFor="m-score">Rating (0–10)</label>
                        <input
                          id="m-score"
                          type="number"
                          step="0.1"
                          min="0"
                          max="10"
                          value={form.score}
                          onChange={(e) => change('score', e.target.value)}
                        />
                      </div>

                      <div className="form-row">
                        <label htmlFor="m-status">Status</label>
                        <select id="m-status" value={form.status} onChange={(e) => change('status', e.target.value)}>
                          <option value="now-showing">Now Showing</option>
                          <option value="coming-soon">Coming Soon</option>
                        </select>
                      </div>

                      {form.status === 'coming-soon' ? (
                        <div className="form-row">
                          <label htmlFor="m-release">
                            Release Date<span className="req">*</span>
                          </label>
                          <input
                            id="m-release"
                            type="date"
                            value={form.releaseDate}
                            className={fieldClass('releaseDate')}
                            onChange={(e) => change('releaseDate', e.target.value)}
                          />
                          {fieldError('releaseDate')}
                        </div>
                      ) : null}

                      <div className="form-row form-row--wide">
                        <span className="field-label">
                          Formats<span className="req">*</span>
                        </span>
                        <div className="chips">
                          {FORMATS.map((f) => (
                            <button
                              key={f}
                              type="button"
                              className={`chip ${form.format.includes(f) ? 'is-active' : ''}`}
                              aria-pressed={form.format.includes(f)}
                              onClick={() => toggleFormat(f)}
                            >
                              {f}
                            </button>
                          ))}
                        </div>
                        {fieldError('format')}
                      </div>
                    </div>
                  </section>

                  <section className="movie-editor__section">
                    <h3>Show Times</h3>
                    <p className="movie-editor__section-hint">
                      Add The Date, Room And Start Time Of Each Screening. End Times Are Worked Out From The Runtime
                      {duration ? ` (${runtime(duration)})` : ''}, And Every Room Keeps {CLEANING_MINUTES} Minutes Free For
                      Cleaning Before The Next Show.
                    </p>

                    {form.screenings.length ? (
                      <div className="screening-list">
                        <div className="screening-head" aria-hidden="true">
                          <span>Date</span>
                          <span>Room</span>
                          <span>Starts</span>
                          <span>Ends</span>
                          <span />
                        </div>

                        {form.screenings.map((row) => {
                          const booked = bookedFor(row);
                          const locked = booked > 0;
                          const conflict = conflicts[row.key];
                          const end = row.time && duration ? screeningEnd(row.time, duration) : null;
                          const inputClass = conflict ? 'has-error' : undefined;

                          return (
                            <div className={`screening-row ${conflict ? 'has-error' : ''}`} key={row.key}>
                              <input
                                type="date"
                                aria-label="Screening Date"
                                value={row.date}
                                min={locked ? undefined : todayKey}
                                disabled={locked}
                                className={inputClass}
                                onChange={(e) => updateScreening(row.key, 'date', e.target.value)}
                              />
                              <select
                                aria-label="Cinema Room"
                                value={row.hallId}
                                disabled={locked}
                                className={inputClass}
                                onChange={(e) => updateScreening(row.key, 'hallId', e.target.value)}
                              >
                                {ROOMS.map((room) => (
                                  <option key={room.id} value={room.id}>
                                    {room.label}
                                  </option>
                                ))}
                              </select>
                              <input
                                type="time"
                                aria-label="Start Time"
                                step="300"
                                value={row.time}
                                disabled={locked}
                                className={inputClass}
                                onChange={(e) => updateScreening(row.key, 'time', e.target.value)}
                              />
                              <span className="screening-row__end" aria-label="End Time">
                                {end ? (
                                  <>
                                    {clockTime(end.time)}
                                    {end.nextDay ? <small> +1 Day</small> : null}
                                  </>
                                ) : (
                                  '—'
                                )}
                              </span>
                              <button
                                type="button"
                                className="icon-button icon-button--sm icon-button--danger"
                                title={locked ? 'This Screening Has Bookings' : 'Remove Screening'}
                                aria-label="Remove Screening"
                                disabled={locked}
                                onClick={() => removeScreening(row.key)}
                              >
                                <Icon name="trash" size={15} />
                              </button>

                              {conflict ? (
                                <span className="screening-row__note is-error">{conflict}</span>
                              ) : locked ? (
                                <span className="screening-row__note">
                                  {booked} {booked === 1 ? 'Seat' : 'Seats'} Booked · This Screening Can No Longer Be Changed.
                                </span>
                              ) : null}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="screening-empty">
                        No Screenings Yet. This Movie Won't Appear In Showtimes Until You Add One.
                      </p>
                    )}

                    <button type="button" className="btn btn--ghost btn--sm screening-add" onClick={addScreening}>
                      <Icon name="plus" size={15} />
                      Add Screening
                    </button>

                    {errors.screenings ? (
                      fieldError('screenings')
                    ) : form.status === 'coming-soon' && form.screenings.length ? (
                      <span className="field-hint">Screenings Go Live Once The Status Is Set To Now Showing.</span>
                    ) : null}
                  </section>

                  <section className="movie-editor__section">
                    <h3>Cast And Story</h3>
                    <div className="form-grid">
                      <div className="form-row">
                        <label htmlFor="m-director">Director</label>
                        <input
                          id="m-director"
                          type="text"
                          value={form.director}
                          placeholder="Director's Name"
                          onChange={(e) => change('director', e.target.value)}
                        />
                      </div>

                      <div className="form-row">
                        <label htmlFor="m-cast">Cast</label>
                        <input
                          id="m-cast"
                          type="text"
                          value={form.cast}
                          placeholder="Separate Names With Commas"
                          onChange={(e) => change('cast', e.target.value)}
                        />
                      </div>

                      <div className="form-row form-row--wide">
                        <label htmlFor="m-tagline">Tagline</label>
                        <input
                          id="m-tagline"
                          type="text"
                          value={form.tagline}
                          placeholder="A Short, Catchy Line"
                          onChange={(e) => change('tagline', e.target.value)}
                        />
                      </div>

                      <div className="form-row form-row--wide">
                        <label htmlFor="m-synopsis">Synopsis</label>
                        <textarea
                          id="m-synopsis"
                          rows="4"
                          value={form.synopsis}
                          placeholder="What Is The Movie About?"
                          onChange={(e) => change('synopsis', e.target.value)}
                        />
                      </div>
                    </div>
                  </section>
                </div>
              </div>

              <div className="movie-editor__footer">
                {formError ? (
                  <p className="movie-editor__error" role="alert">
                    <Icon name="alert" size={16} />
                    {formError}
                  </p>
                ) : null}
                <button type="button" className="btn btn--ghost" onClick={close} disabled={saving}>
                  Cancel
                </button>
                <button type="submit" className="btn btn--primary" disabled={saving}>
                  {saving ? 'Saving…' : editing === 'new' ? 'Add Movie' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {confirm ? (
        <div className="overlay" role="dialog" aria-modal="true" aria-labelledby="movie-confirm-title">
          <button type="button" className="overlay__backdrop" onClick={closeConfirm} aria-label="Close" />
          <div className="confirm-dialog">
            <h3 id="movie-confirm-title">
              {confirm.kind === 'delete' ? `Remove ${confirm.movie.title}?` : 'Restore Default Movies?'}
            </h3>
            <p>
              {confirm.kind === 'delete'
                ? 'The Movie Will Be Removed From The Website. Existing Bookings Are Kept.'
                : 'This Replaces The Whole Catalog With The Original Movies. Movies You Added Will Be Deleted.'}
            </p>
            {confirmError ? (
              <div className="alert alert--error" role="alert">
                <Icon name="alert" size={15} />
                {confirmError}
              </div>
            ) : null}
            <div className="confirm-dialog__actions">
              <button type="button" className="btn btn--ghost btn--sm" onClick={closeConfirm} disabled={confirmBusy}>
                Keep It
              </button>
              <button type="button" className="btn btn--danger btn--sm" onClick={runConfirm} disabled={confirmBusy}>
                {confirmBusy ? 'Working…' : confirm.kind === 'delete' ? 'Remove Movie' : 'Restore Defaults'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
