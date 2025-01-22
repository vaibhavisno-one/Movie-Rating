import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuthStore } from '../lib/store';
import { getMovieDetails } from '../lib/tmdb';
import { supabase } from '../lib/supabase';
import { Star, Heart, Clock } from 'lucide-react';
import { Button } from './ui/button';

interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  release_date: string;
  vote_average: number;
  genres: { id: number; name: string }[];
}

interface Rating {
  id: string;
  rating: number;
  review: string;
  intimacy_rating: string;
  created_at: string;
  profiles: {
    username: string;
    avatar_url: string;
  };
}

export default function MovieDetails() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [userRating, setUserRating] = useState<number>(0);
  const [review, setReview] = useState('');
  const [intimacyRating, setIntimacyRating] = useState<string>('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovieData = async () => {
      try {
        const movieData = await getMovieDetails(Number(id));
        setMovie(movieData);

        if (user) {
          // Check if movie is in favorites
          const { data: favoriteData } = await supabase
            .from('favorites')
            .select('id')
            .eq('user_id', user.id)
            .eq('movie_id', id)
            .single();

          setIsFavorite(!!favoriteData);

          // Get user's rating if exists
          const { data: ratingData } = await supabase
            .from('ratings')
            .select('rating, review, intimacy_rating')
            .eq('user_id', user.id)
            .eq('movie_id', id)
            .single();

          if (ratingData) {
            setUserRating(ratingData.rating);
            setReview(ratingData.review || '');
            setIntimacyRating(ratingData.intimacy_rating);
          }
        }

        // Get all ratings
        const { data: ratingsData } = await supabase
          .from('ratings')
          .select('*, profiles:user_id(username, avatar_url)')
          .eq('movie_id', id)
          .order('created_at', { ascending: false });

        if (ratingsData) {
          setRatings(ratingsData);
        }
      } catch (error) {
        console.error('Error fetching movie data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovieData();
  }, [id, user]);

  const handleRatingSubmit = async () => {
    if (!user || !movie) return;

    try {
      // First, ensure the movie exists in our database
      const { data: existingMovie } = await supabase
        .from('movies')
        .select('id')
        .eq('tmdb_id', movie.id)
        .single();

      let movieId = existingMovie?.id;

      if (!movieId) {
        const { data: newMovie } = await supabase
          .from('movies')
          .insert({
            tmdb_id: movie.id,
            title: movie.title,
            poster_path: movie.poster_path,
            release_date: movie.release_date,
          })
          .select('id')
          .single();

        movieId = newMovie?.id;
      }

      if (movieId) {
        const { error } = await supabase.from('ratings').upsert({
          user_id: user.id,
          movie_id: movieId,
          rating: userRating,
          review,
          intimacy_rating,
        });

        if (error) throw error;

        // Refresh ratings
        const { data: newRatings } = await supabase
          .from('ratings')
          .select('*, profiles:user_id(username, avatar_url)')
          .eq('movie_id', movieId)
          .order('created_at', { ascending: false });

        if (newRatings) {
          setRatings(newRatings);
        }
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
    }
  };

  const toggleFavorite = async () => {
    if (!user || !movie) return;

    try {
      if (isFavorite) {
        await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('movie_id', id);
      } else {
        await supabase.from('favorites').insert({
          user_id: user.id,
          movie_id: id,
        });
      }
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="text-center text-destructive">
        <p>Movie not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Movie Poster and Info */}
        <div className="md:w-1/3">
          <div className="sticky top-8">
            <img
              src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
              alt={movie.title}
              className="w-full rounded-lg shadow-lg"
            />
            {user && (
              <Button
                onClick={toggleFavorite}
                variant={isFavorite ? 'default' : 'outline'}
                className="w-full mt-4"
              >
                <Heart
                  className={`mr-2 h-4 w-4 ${
                    isFavorite ? 'fill-current' : ''
                  }`}
                />
                {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
              </Button>
            )}
          </div>
        </div>

        {/* Movie Details and Ratings */}
        <div className="md:w-2/3 space-y-8">
          <div>
            <h1 className="text-4xl font-bold mb-4">{movie.title}</h1>
            <div className="flex items-center gap-4 text-muted-foreground">
              <span className="flex items-center">
                <Clock className="mr-1 h-4 w-4" />
                {new Date(movie.release_date).getFullYear()}
              </span>
              <span className="flex items-center">
                <Star className="mr-1 h-4 w-4 fill-yellow-400" />
                {movie.vote_average.toFixed(1)}
              </span>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              {movie.genres.map((genre) => (
                <span
                  key={genre.id}
                  className="px-3 py-1 rounded-full bg-primary/10 text-sm"
                >
                  {genre.name}
                </span>
              ))}
            </div>
            <p className="mt-4 text-lg leading-relaxed">{movie.overview}</p>
          </div>

          {/* Rating Form */}
          {user && (
            <div className="bg-card rounded-lg p-6 space-y-4">
              <h3 className="text-xl font-semibold mb-4">Rate this Movie</h3>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => setUserRating(rating)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                      userRating >= rating
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted hover:bg-muted/80'
                    }`}
                  >
                    {rating}
                  </button>
                ))}
              </div>
              <select
                value={intimacyRating}
                onChange={(e) => setIntimacyRating(e.target.value)}
                className="w-full p-2 rounded-md border bg-background"
              >
                <option value="">Select Intimacy Rating</option>
                <option value="Little">Little</option>
                <option value="Some">Some</option>
                <option value="Very Much">Very Much</option>
                <option value="Most">Most</option>
              </select>
              <textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="Write your review..."
                className="w-full p-3 rounded-md border bg-background min-h-[100px]"
              />
              <Button onClick={handleRatingSubmit} className="w-full">
                Submit Rating
              </Button>
            </div>
          )}

          {/* User Ratings */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">User Reviews</h3>
            {ratings.length > 0 ? (
              ratings.map((rating) => (
                <div
                  key={rating.id}
                  className="bg-card rounded-lg p-6 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        {rating.profiles.username?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <p className="font-medium">
                          {rating.profiles.username || 'Anonymous'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(rating.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-semibold">
                        {rating.rating}/10
                      </span>
                      <span className="text-sm text-muted-foreground">
                        ({rating.intimacy_rating})
                      </span>
                    </div>
                  </div>
                  {rating.review && (
                    <p className="text-muted-foreground">{rating.review}</p>
                  )}
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">No reviews yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}