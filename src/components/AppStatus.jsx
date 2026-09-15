// Full page placeholder shown while the website connects to the database, or
// when it cannot.
export default function AppStatus({ loading = false, title, text, actionLabel, onAction }) {
  return (
    <section className="app-status">
      {loading ? (
        <span className="app-status__spinner" role="status" aria-label="Loading" />
      ) : (
        <div className="app-status__box">
          <h1 className="app-status__title">{title}</h1>
          {text ? <p className="app-status__text">{text}</p> : null}
          {onAction ? (
            <button type="button" className="btn btn--primary" onClick={onAction}>
              {actionLabel}
            </button>
          ) : null}
        </div>
      )}
    </section>
  );
}
