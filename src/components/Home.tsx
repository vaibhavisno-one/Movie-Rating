import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getPopularMovies, searchMovies, getMoviesByGenre } from '../lib/tmdb';
import { Search, Filter } from 'lucide-react';
import { Button } from './ui/button';

interface Movie {
  id: number;
  title: string;
  poster_path: string;
  release_date: string;
  vote_average: number;
}

const genres = [
  { id: 28, name: 'Action' },
  { id: 35, name: 'Comedy' },
  { id: 18, name: 'Drama' },
  { id: 27, name: 'Horror' },
  { id: 10749, name: 'Romance' },
  { id: 878, name: 'Science Fiction' },
];

export default function Home() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);

useEffect(() => {
  const fetchMovies = async () => {
    try {
      setLoading(true);
      let data;

      if (searchQuery) {
        data = await searchMovies(searchQuery);
      } else if (selectedGenre) {
        data = await getMoviesByGenre(selectedGenre);
      } else {
        data = await getPopularMovies();
      }

      if (data && data.results) {
        setMovies(data.results);
      } else {
        setMovies([]); // Fallback if `results` is undefined
        setError('No movies found.');
      }
    } catch (err) {
      console.error('Failed to fetch movies:', err);
      setError('Failed to fetch movies');
    } finally {
      setLoading(false);
    }
  };

  const debounce = setTimeout(fetchMovies, 300);
  return () => clearTimeout(debounce);
}, [searchQuery, selectedGenre]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-destructive">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold">
          {searchQuery
            ? 'Search Results'
            : selectedGenre
            ? genres.find((g) => g.id === selectedGenre)?.name + ' Movies'
            : 'Popular Movies'}
        </h1>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <input
              type="search"
              placeholder="Search movies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 pl-10 pr-4 py-2 rounded-md border bg-background"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {showFilters && (
        <div className="flex flex-wrap gap-2 mb-6">
          <Button
            variant={selectedGenre === null ? 'default' : 'outline'}
            onClick={() => setSelectedGenre(null)}
          >
            All
          </Button>
          {genres.map((genre) => (
            <Button
              key={genre.id}
              variant={selectedGenre === genre.id ? 'default' : 'outline'}
              onClick={() => setSelectedGenre(genre.id)}
            >
              {genre.name}
            </Button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {movies.map((movie) => (
          <Link
            key={movie.id}
            to={`/movie/${movie.id}`}
            className="group relative rounded-lg overflow-hidden bg-card shadow-lg transition-transform hover:scale-105"
          >
            <img
              src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
              alt={movie.title}
              className="w-full aspect-[2/3] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="absolute bottom-0 p-4">
                <h2 className="text-white font-semibold">{movie.title}</h2>
                <p className="text-white/80 text-sm">
                  {new Date(movie.release_date).getFullYear()}
                </p>
                <div className="mt-2">
                  <Button size="sm">View Details</Button>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}