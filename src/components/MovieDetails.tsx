import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuthStore } from '../lib/store';
import { getMovieDetails } from '../lib/tmdb';
import * as localStore from '../lib/localStorageService'; // Import Local Storage Service
import { Star, Heart, Clock, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { useDebounce } from '../lib/hooks';
import DOMPurify from 'dompurify';

interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  release_date: string;
  vote_average: number;
  genres: { id: number; name: string }[];
  production_companies: { id: number; name: string; origin_country: string }[];
}

// Removed Rating interface, as we'll use local state for the current user's review

const MAX_REVIEW_LENGTH = 1000;
const PROFANITY_LIST = ['badword1', 'badword2']; // Add actual profanity list

export default function MovieDetails() {
  const { id } = useParams<{ id: string }>(); // id is the TMDB movie ID string
  const { user } = useAuthStore();
  const [movie, setMovie] = useState<Movie | null>(null);
  // Removed ratings state: useState<Rating[]>([]);
  const [userRating, setUserRating] = useState<number>(0);
  const [review, setReview] = useState('');
  const [intimacyRating, setIntimacyRating] = useState<string>('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debouncedReview = useDebounce(review, 500);

  const [reviewError, setReviewError] = useState<string | null>(null);
  // Removed optimisticRating state, direct state updates will reflect changes

  useEffect(() => {
    const fetchMovieData = async () => {
      if (!id) return; // Ensure id is present
      const movieIdStr = id; // TMDB ID from URL params

      try {
        setLoading(true);
        const movieData = await getMovieDetails(Number(movieIdStr));
        setMovie(movieData);

        if (user) {
          // Check if movie is in favorites using Local Storage
          setIsFavorite(localStore.isFavorite(user.id, movieIdStr));

          // Get user's rating if exists from Local Storage
          const existingRating = localStore.getRatingReview(user.id, movieIdStr);
          if (existingRating) {
            setUserRating(existingRating.rating);
            setReview(existingRating.reviewText || '');
            setIntimacyRating(existingRating.intimacyRating || '');
          } else {
            // Reset if no rating found for this movie for this user
            setUserRating(0);
            setReview('');
            setIntimacyRating('');
          }
        }
        // Removed fetching all ratings for the movie
      } catch (error) {
        console.error('Error fetching movie data:', error);
        setError('Failed to load movie data');
      } finally {
        setLoading(false);
      }
    };

    fetchMovieData();
  }, [id, user]); // user dependency re-runs if user logs in/out

  useEffect(() => {
    if (!debouncedReview) {
      setReviewError(null);
      return;
    }
    if (debouncedReview.length > MAX_REVIEW_LENGTH) {
      setReviewError(`Review must be less than ${MAX_REVIEW_LENGTH} characters`);
      return;
    }
    const hasProfanity = PROFANITY_LIST.some(word => 
      debouncedReview.toLowerCase().includes(word)
    );
    if (hasProfanity) {
      setReviewError('Please keep the review family-friendly');
      return;
    }
    setReviewError(null);
  }, [debouncedReview]);

  const sanitizeReview = (content: string) => {
    return DOMPurify.sanitize(content, { ALLOWED_TAGS: [] });
  };

  const handleRatingSubmit = async () => {
    if (!user || !movie) return;
    if (reviewError) {
      setError('Please fix the review errors before submitting');
      return;
    }

    setSubmitting(true);
    setError(null);
    const movieIdStr = movie.id.toString();

    try {
      localStore.saveRatingReview(
        user.id,
        movieIdStr,
        userRating,
        sanitizeReview(review),
        intimacyRating,
        { tmdbId: movie.id, title: movie.title, posterPath: movie.poster_path }
      );
      // UI is already updated via state, so no optimistic update needed here for the form itself.
      // If there was a list of reviews, that would be different.
      // Display a success message or similar feedback if desired
      // alert('Rating submitted!'); 
    } catch (error) {
      console.error('Error submitting rating:', error);
      setError('Failed to submit rating. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleFavorite = async () => {
    if (!user || !movie) return;
    const movieIdStr = movie.id.toString();
    try {
      if (isFavorite) {
        localStore.removeFavorite(user.id, movieIdStr);
      } else {
        const favMovieData: localStore.FavoriteMovie = {
          movieId: movieIdStr,
          tmdbId: movie.id,
          title: movie.title,
          posterPath: movie.poster_path,
          releaseDate: movie.release_date,
        };
        localStore.saveFavorite(user.id, favMovieData);
      }
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('Error toggling favorite:', error);
      setError('Failed to update favorites');
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
        <p>Movie not found or ID missing</p>
      </div>
    );
  }

  const filmIndustry = movie.production_companies?.[0]?.origin_country
    ? {
        US: 'Hollywood',
        IN: 'Bollywood',
        KR: 'Korean Cinema',
        JP: 'Japanese Cinema',
        HK: 'Hong Kong Cinema',
        GB: 'British Cinema',
      }[movie.production_companies[0].origin_country] || 'International'
    : 'International';

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row gap-8">
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
              <span>{filmIndustry}</span>
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

          {user ? (
            <div className="bg-card rounded-lg p-6 space-y-4">
              <h3 className="text-xl font-semibold mb-4">Your Rating & Review</h3>
              {error && (
                <div className="bg-destructive/10 text-destructive p-3 rounded-md flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" /> {error}
                </div>
              )}
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
              <div>
                <textarea
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  placeholder="Write your review..."
                  className={`w-full p-3 rounded-md border bg-background min-h-[100px] ${
                    reviewError ? 'border-destructive' : ''
                  }`}
                />
                {reviewError && (
                  <p className="text-sm text-destructive mt-1">{reviewError}</p>
                )}
                <p className="text-sm text-muted-foreground mt-1">
                  {review.length}/{MAX_REVIEW_LENGTH} characters
                </p>
              </div>
              <Button
                onClick={handleRatingSubmit}
                className="w-full"
                disabled={submitting || !!reviewError || userRating === 0 || !intimacyRating}
              >
                {submitting ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  'Submit Your Rating'
                )}
              </Button>
            </div>
          ) : (
            <div className="bg-card rounded-lg p-6 text-center">
              <p className="text-muted-foreground">
                Please sign in to rate and review this movie.
              </p>
            </div>
          )}

          {/* Display Current User's Review */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Your Review</h3>
            {user && (localStore.getRatingReview(user.id, id || '') || review) ? (
              <div className="bg-card rounded-lg p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      {(user.email?.[0] || 'U').toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium">
                        {user.username || user.email}
                      </p>
                      {/* Date is not stored in localStore.RatingReview, so cannot display it unless added */}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold">
                      {userRating}/10 
                    </span>
                    <span className="text-sm text-muted-foreground">
                      ({intimacyRating || 'No intimacy rating'})
                    </span>
                  </div>
                </div>
                {review && (
                  <p className="text-muted-foreground whitespace-pre-wrap">{review}</p>
                )}
                {!review && <p className="text-muted-foreground">You have rated this movie but not provided a written review.</p>}
              </div>
            ) : user ? (
              <p className="text-muted-foreground">You have not reviewed this movie yet.</p>
            ) : (
              <p className="text-muted-foreground">Sign in to see your review.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}