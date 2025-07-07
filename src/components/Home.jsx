import { useEffect, useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  getPopularMovies,
  searchMovies,
  getMoviesByGenre,
  getMoviesByMood,
  languageCodes,
} from '../lib/tmdb';
import { Search, Filter, Globe2 } from 'lucide-react';
import { Button } from './ui/button';
import { useDebounce } from '../lib/hooks';

const genres = [
  { id: 28, name: 'Action' },
  { id: 35, name: 'Comedy' },
  { id: 18, name: 'Drama' },
  { id: 27, name: 'Horror' },
  { id: 10749, name: 'Romance' },
  { id: 878, name: 'Science Fiction' },
];

const moods = [
  { id: 'happy', name: 'Happy', emoji: '😊' },
  { id: 'sad', name: 'Sad', emoji: '😢' },
  { id: 'adventurous', name: 'Adventurous', emoji: '🚀' },
  { id: 'romantic', name: 'Romantic', emoji: '💝' },
  { id: 'scary', name: 'Scary', emoji: '😱' },
  { id: 'inspiring', name: 'Inspiring', emoji: '✨' },
  { id: 'relaxing', name: 'Relaxing', emoji: '😌' },
  { id: 'thoughtful', name: 'Thoughtful', emoji: '🤔' },
];

export default function Home() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [selectedMood, setSelectedMood] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef(null);
  const debouncedSearch = useDebounce(searchQuery, 300);

  const lastMovieElementRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prevPage) => prevPage + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        let data;

        if (debouncedSearch) {
          data = await searchMovies(debouncedSearch, selectedLanguage || undefined);
          setHasMore(false); // Disable infinite scroll for search results
        } else if (selectedMood) {
          data = await getMoviesByMood(selectedMood, page);
        } else if (selectedGenre) {
          data = await getMoviesByGenre(selectedGenre, page, selectedLanguage || undefined);
        } else {
          data = await getPopularMovies(page, selectedLanguage || undefined);
        }

        if (data && data.results) {
          setMovies((prev) => (page === 1 ? data.results : [...prev, ...data.results]));
          setHasMore(data.page < data.total_pages);
        } else {
          setMovies([]);
          setError('No movies found.');
          setHasMore(false);
        }
      } catch (err) {
        console.error('Failed to fetch movies:', err);
        setError('Failed to fetch movies');
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [debouncedSearch, selectedGenre, selectedMood, selectedLanguage, page]);

  const handleFilterChange = (type, value) => {
    setPage(1); // Reset page when changing filters
    setMovies([]); // Clear current movies

    if (type === 'genre') {
      setSelectedGenre(value);
      setSelectedMood(null);
    } else if (type === 'mood') {
      setSelectedMood(value);
      setSelectedGenre(null);
    } else if (type === 'language') {
      setSelectedLanguage(value);
    }
  };

  if (error) {
    return (
      <div className="text-center text-destructive">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold">
          {searchQuery
            ? 'Search Results'
            : selectedMood
            ? `${moods.find((m) => m.id === selectedMood)?.name} Movies`
            : selectedGenre
            ? `${genres.find((g) => g.id === selectedGenre)?.name} Movies`
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
          <Button variant="outline" size="icon" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="space-y-4 mb-6">
          {/* Language Filter */}
          <div>
            <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
              <Globe2 className="h-4 w-4" />
              Language
            </h3>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedLanguage === null ? 'default' : 'outline'}
                onClick={() => handleFilterChange('language', null)}
              >
                All
              </Button>
              {Object.entries(languageCodes).map(([lang, code]) => (
                <Button
                  key={code}
                  variant={selectedLanguage === code ? 'default' : 'outline'}
                  onClick={() => handleFilterChange('language', code)}
                >
                  {lang.charAt(0).toUpperCase() + lang.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          {/* Mood Filter */}
          <div>
            <h3 className="text-sm font-medium mb-2">Mood</h3>
            <div className="flex flex-wrap gap-2">
              {moods.map((mood) => (
                <Button
                  key={mood.id}
                  variant={selectedMood === mood.id ? 'default' : 'outline'}
                  onClick={() => handleFilterChange('mood', mood.id)}
                  className="flex items-center gap-2"
                >
                  <span>{mood.emoji}</span>
                  {mood.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Genre Filter */}
          <div>
            <h3 className="text-sm font-medium mb-2">Genre</h3>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedGenre === null ? 'default' : 'outline'}
                onClick={() => handleFilterChange('genre', null)}
              >
                All
              </Button>
              {genres.map((genre) => (
                <Button
                  key={genre.id}
                  variant={selectedGenre === genre.id ? 'default' : 'outline'}
                  onClick={() => handleFilterChange('genre', genre.id)}
                >
                  {genre.name}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Movie Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {movies.map((movie, index) => {
          // Defensive checks
          if (!movie.id || !movie.title || !movie.poster_path) return null;

          return (
            <Link
              key={movie.id}
              to={`/movie/${movie.id}`}
              ref={index === movies.length - 1 ? lastMovieElementRef : null}
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
                    {movie.release_date
                      ? new Date(movie.release_date).getFullYear()
                      : 'N/A'}
                  </p>
                  <div className="mt-2">
                    <Button size="sm">View Details</Button>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Loading Spinner */}
      {loading && (
        <div className="flex justify-center mt-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}
    </div>
  );
}
