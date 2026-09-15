// Catalog of films shown at Cinema House.
// `poster` is real artwork when we have it; otherwise `art` drives the
// generated poster (see components/Poster.jsx).

import minionsPoster from '../assets/images/Minions&Monsters.jpg';
import fall2Poster from '../assets/images/fall2.png';
import shaunPoster from '../assets/images/Shaunthesheep.jpg';
import talentPoster from '../assets/images/A-Talent-For-Murder.png';
import klaraPoster from '../assets/images/Klara-And-The-Sun.png';
import wildwoodPoster from '../assets/images/Wildwood.png';
import insideOut2Poster from '../assets/images/InsideOut2.jpg';
import johnWickPoster from '../assets/images/JohnWickChap6.png';
import dunePoster from '../assets/images/Dune_Part2.jpg';
import spiderManPoster from '../assets/images/Spider-Man_BND.jpg';
import insidiousPoster from '../assets/images/Insidious_Chap6.jpg';
import odysseyPoster from '../assets/images/TheOdyssey.jpg';

export const MOVIES = [
  {
    id: 'spider-man-brand-new-day',
    title: 'Spider-Man: Brand New Day',
    genres: ['Action', 'Adventure', 'Sci-Fi'],
    ageRating: '12+',
    duration: 130,
    year: 2026,
    score: 8.2,
    director: 'Destin Daniel Cretton',
    cast: ['Tom Holland', 'Sadie Sink', 'Jon Bernthal'],
    format: ['IMAX', '2D'],
    status: 'now-showing',
    tagline: 'Every day is a new beginning.',
    synopsis:
      'With his old life erased and no one left who remembers his name, Peter Parker starts again from nothing - and finds that the city still needs somebody to look out for it.',
    poster: spiderManPoster,
    art: { from: '#8a1220', to: '#0b0508', accent: '#ff4d5a', motif: 'city' }
  },
  {
    id: 'insidious-chapter-6',
    title: 'Insidious: Chapter 6',
    genres: ['Horror', 'Mystery', 'Thriller'],
    ageRating: '18+',
    duration: 104,
    year: 2026,
    score: 7.1,
    director: 'Jacob Chase',
    cast: ['Patrick Wilson', 'Rose Byrne', 'Ty Simpkins'],
    format: ['2D'],
    status: 'now-showing',
    tagline: 'The Further is never finished with you.',
    synopsis:
      'A family that thought it had left the Further behind finds the door open again, and learns that what waits on the other side has been counting the years with them.',
    poster: insidiousPoster,
    art: { from: '#3a0d18', to: '#080405', accent: '#ff4d4d', motif: 'signal' }
  },
  {
    id: 'the-odyssey',
    title: 'The Odyssey',
    genres: ['Adventure', 'Drama', 'Fantasy'],
    ageRating: '12+',
    duration: 150,
    year: 2026,
    score: 8.5,
    director: 'Christopher Nolan',
    cast: ['Matt Damon', 'Anne Hathaway', 'Tom Holland'],
    format: ['IMAX', '2D'],
    status: 'now-showing',
    tagline: 'The long way home.',
    synopsis:
      'Ten years after the war ends, a king still has not reached his own shore - and the sea, the gods and his own crew all have reasons to keep him from it.',
    poster: odysseyPoster,
    art: { from: '#123a6b', to: '#060b14', accent: '#4ea8ff', motif: 'waves' }
  },
  {
    id: 'minions-and-monsters',
    title: 'Minions & Monsters',
    genres: ['Animation', 'Family', 'Comedy'],
    ageRating: '6+',
    duration: 96,
    year: 2026,
    score: 7.8,
    director: 'Kyle Balda',
    cast: ['Pierre Coffin', 'Steve Carell', 'Taraji P. Henson'],
    format: ['2D'],
    status: 'now-showing',
    tagline: 'Small crew. Big problem.',
    synopsis:
      'When the creatures under the bed turn out to be real, and unionised, the little yellow crew has to decide whose side it is on before the whole city finds out.',
    poster: minionsPoster,
    art: { from: '#c9a227', to: '#171006', accent: '#ffd93d', motif: 'bubbles' }
  },
  {
    id: 'fall-2-deadpoint',
    title: 'Fall 2: Deadpoint',
    genres: ['Thriller', 'Survival'],
    ageRating: '16+',
    duration: 101,
    year: 2026,
    score: 7.2,
    director: 'Scott Mann',
    cast: ['Grace Caroline Currey', 'Virginia Gardner', 'Mason Gooding'],
    format: ['IMAX', '2D'],
    status: 'now-showing',
    tagline: 'One move left.',
    synopsis:
      'A climb that was meant to close the book on the last one strands two friends on a face with no way down, no signal and a storm coming in behind them.',
    poster: fall2Poster,
    art: { from: '#1d3b4a', to: '#0a1013', accent: '#7fd4e8', motif: 'ruins' }
  },
  {
    id: 'inside-out-2',
    title: 'Inside Out 2',
    genres: ['Animation', 'Family', 'Comedy'],
    ageRating: '6+',
    duration: 100,
    year: 2024,
    score: 8.1,
    director: 'Kelsey Mann',
    cast: ['Amy Poehler', 'Maya Hawke', 'Kensington Tallman'],
    format: ['2D'],
    status: 'now-showing',
    tagline: 'Make room for new feelings.',
    synopsis:
      'Riley is a teenager now, and headquarters is suddenly crowded: a whole crew of brand new emotions moves in and takes over the control panel.',
    poster: insideOut2Poster,
    art: { from: '#5a2f9a', to: '#12061f', accent: '#ffd34d', motif: 'bubbles' }
  },
  {
    id: 'john-wick-4',
    title: 'John Wick: Chapter 6',
    genres: ['Action', 'Crime', 'Thriller'],
    ageRating: '16+',
    duration: 169,
    year: 2024,
    score: 8.0,
    director: 'Chad Stahelski',
    cast: ['Keanu Reeves', 'Donnie Yen', 'Bill Skarsgard'],
    format: ['IMAX', '2D'],
    status: 'now-showing',
    tagline: 'No way back. One way out.',
    synopsis:
      'With a bounty on his head that keeps climbing, John Wick takes his fight against the High Table from New York to Paris, Osaka and Berlin.',
    poster: johnWickPoster,
    art: { from: '#2a1030', to: '#0a0710', accent: '#ff5470', motif: 'neon' }
  },
  {
    id: 'dune-part-two',
    title: 'Dune: Part Two',
    genres: ['Sci-Fi', 'Adventure'],
    ageRating: '12+',
    duration: 166,
    year: 2024,
    score: 8.7,
    director: 'Denis Villeneuve',
    cast: ['Timothee Chalamet', 'Zendaya', 'Rebecca Ferguson'],
    format: ['IMAX', '2D'],
    status: 'now-showing',
    tagline: 'Long live the fighters.',
    synopsis:
      'Paul Atreides joins the Fremen and walks the narrow path between revenge, prophecy and the future he is desperate to avoid.',
    poster: dunePoster,
    art: { from: '#8a5a20', to: '#140d08', accent: '#f2c879', motif: 'dunes' }
  },
  {
    id: 'shaun-the-sheep-mossy-bottom',
    title: 'Shaun the Sheep: The Beast of Mossy Bottom',
    genres: ['Animation', 'Family', 'Comedy'],
    ageRating: '6+',
    duration: 87,
    year: 2026,
    score: 7.9,
    director: 'Steve Cox',
    cast: ['Justin Fletcher', 'John Sparkes', 'Kate Harbour'],
    format: ['2D'],
    status: 'coming-soon',
    releaseDate: '2026-10-16',
    tagline: 'Something is out there. Probably.',
    synopsis:
      'When something starts flattening the crops at night, the flock sets out to catch the beast of Mossy Bottom - and discovers the farm has been keeping a secret of its own.',
    poster: shaunPoster,
    art: { from: '#3f6d3a', to: '#0a1109', accent: '#c8e86b', motif: 'bubbles' }
  },
  {
    id: 'a-talent-for-murder',
    title: 'A Talent for Murder',
    genres: ['Thriller', 'Crime', 'Mystery'],
    ageRating: '16+',
    duration: 108,
    year: 2026,
    score: 7.4,
    director: 'Elena Marsh',
    cast: ['Rebecca Hall', 'Daniel Kaluuya', 'Sophie Okonedo'],
    format: ['2D'],
    status: 'coming-soon',
    releaseDate: '2026-10-23',
    tagline: 'Everyone is good at something.',
    synopsis:
      'A quiet copy editor notices a pattern in the manuscripts crossing her desk, and realises one of the writers has been confessing to something nobody has reported yet.',
    poster: talentPoster,
    art: { from: '#2b1030', to: '#080510', accent: '#c47dff', motif: 'signal' }
  },
  {
    id: 'klara-and-the-sun',
    title: 'Klara and the Sun',
    genres: ['Drama', 'Sci-Fi'],
    ageRating: '12+',
    duration: 116,
    year: 2026,
    score: 7.7,
    director: 'Taika Waititi',
    cast: ['Jenna Ortega', 'Amy Adams', 'Steve Buscemi'],
    format: ['2D'],
    status: 'coming-soon',
    releaseDate: '2026-10-23',
    tagline: 'She was made to watch.',
    synopsis:
      'An artificial friend waiting in a shop window is chosen by a girl who is quietly ill, and sets out to save her using the only power she believes in - the sun.',
    poster: klaraPoster,
    art: { from: '#8a6a1f', to: '#100c06', accent: '#ffd977', motif: 'dunes' }
  },
  {
    id: 'wildwood',
    title: 'Wildwood',
    genres: ['Animation', 'Adventure', 'Fantasy'],
    ageRating: '6+',
    duration: 104,
    year: 2026,
    score: 7.6,
    director: 'Travis Knight',
    cast: ['Carey Mulligan', 'Mahershala Ali', 'Angela Bassett'],
    format: ['2D'],
    status: 'coming-soon',
    releaseDate: '2026-10-23',
    tagline: 'Nobody goes in. Nobody comes back.',
    synopsis:
      'When her baby brother is carried off by a murder of crows into the woods nobody in the city will talk about, a girl crosses the boundary and finds a country at war with itself.',
    poster: wildwoodPoster,
    art: { from: '#1f4a2c', to: '#070f0a', accent: '#8fe08a', motif: 'ruins' }
  },
  {
    id: 'borderlands',
    title: 'Borderlands',
    genres: ['Action', 'Sci-Fi', 'Comedy'],
    ageRating: '16+',
    duration: 108,
    year: 2026,
    score: 6.4,
    director: 'Eli Roth',
    cast: ['Cate Blanchett', 'Kevin Hart', 'Jamie Lee Curtis'],
    format: ['2D'],
    status: 'coming-soon',
    releaseDate: '2026-10-30',
    tagline: 'Bad guys. Worse planet.',
    synopsis:
      'A wanted bounty hunter returns to the trash planet she swore she would never see again, and picks up the worst possible crew on the way.',
    art: { from: '#7a1f4d', to: '#120510', accent: '#ffbf47', motif: 'neon' }
  },
  {
    id: 'harbor-lights',
    title: 'Harbor Lights',
    genres: ['Drama', 'Music'],
    ageRating: '12+',
    duration: 121,
    year: 2026,
    score: 8.2,
    director: 'Nadia Okonjo',
    cast: ['Sam Reyes', 'Aria Delgado', 'Femi Adeyemi'],
    format: ['2D'],
    status: 'coming-soon',
    releaseDate: '2026-11-06',
    tagline: 'Every port has a song.',
    synopsis:
      'A dock worker with a borrowed trumpet plays his way through one long winter and accidentally becomes the voice of his whole harbor town.',
    art: { from: '#123a5c', to: '#060c12', accent: '#ffd28a', motif: 'waves' }
  }
];

export const nowShowing = () => MOVIES.filter((m) => m.status === 'now-showing');
export const comingSoon = () => MOVIES.filter((m) => m.status === 'coming-soon');
export const getMovie = (id) => MOVIES.find((m) => m.id === id);
