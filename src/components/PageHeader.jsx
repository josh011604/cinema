export default function PageHeader({ eyebrow, title, text, children }) {
  return (
    <section className="page-header">
      <div className="container">
        {eyebrow ? <span className="page-header__eyebrow">{eyebrow}</span> : null}
        <h1 className="page-header__title">{title}</h1>
        {text ? <p className="page-header__text">{text}</p> : null}
        {children}
      </div>
    </section>
  );
}
