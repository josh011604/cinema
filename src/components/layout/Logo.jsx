import { Link } from 'react-router-dom';
import logoImage from '../../assets/images/cinemahouselogo-trim.png';

// The logo artwork sits on a black background; layout.css blends that black
// away so only the mark, the wordmark and the red glow show on dark surfaces.
export default function Logo({ to = '/', tagline = false }) {
  return (
    <Link to={to} className="logo" aria-label="Cinema House home">
      <img className="logo__image" src={logoImage} alt="Cinema House" width="572" height="180" />
      {tagline ? <span className="logo__tagline">A new generation movie theater</span> : null}
    </Link>
  );
}
