// Define data structures for Rating/Review and Favorite Movie

export interface RatingReview {
  rating: number; // e.g., 1-10
  reviewText: string;
  intimacyRating: string; // 'Little', 'Some', 'Very Much', 'Most'
  movieId: string; // Can be TMDB ID as string
  tmdbId?: number; // Optional, but good for consistency
  title?: string; // Optional movie title
  posterPath?: string; // Optional movie poster path
}

export interface FavoriteMovie {
  movieId: string; // Typically TMDB ID as string
  tmdbId: number;
  title: string;
  posterPath?: string;
  releaseDate?: string;
}

// Key Prefixes for Local Storage
const RATING_REVIEW_PREFIX = 'rating_';
const FAVORITE_PREFIX = 'favorite_';

// Helper to construct keys
const getRatingReviewKey = (userId: string, movieId: string) => `${RATING_REVIEW_PREFIX}${userId}_${movieId}`;
const getFavoriteKey = (userId: string, movieId: string) => `${FAVORITE_PREFIX}${userId}_${movieId}`;

// --- Rating/Review Functions ---

export const saveRatingReview = (
  userId: string,
  movieId: string,
  rating: number,
  reviewText: string,
  intimacyRating: string,
  movieDetails?: { tmdbId?: number; title?: string; posterPath?: string }
): void => {
  if (!userId || !movieId) {
    console.error('User ID and Movie ID are required to save rating/review.');
    return;
  }
  const key = getRatingReviewKey(userId, movieId);
  const data: RatingReview = {
    movieId,
    rating,
    reviewText,
    intimacyRating,
    ...movieDetails,
  };
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving rating/review to localStorage:', error);
  }
};

export const getRatingReview = (userId: string, movieId: string): RatingReview | null => {
  if (!userId || !movieId) {
    console.error('User ID and Movie ID are required to get rating/review.');
    return null;
  }
  const key = getRatingReviewKey(userId, movieId);
  try {
    const item = localStorage.getItem(key);
    return item ? (JSON.parse(item) as RatingReview) : null;
  } catch (error) {
    console.error('Error getting rating/review from localStorage:', error);
    return null;
  }
};

export const getUserRatingsReviews = (userId: string): RatingReview[] => {
  if (!userId) {
    console.error('User ID is required to get all ratings/reviews.');
    return [];
  }
  const results: RatingReview[] = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(`${RATING_REVIEW_PREFIX}${userId}_`)) {
        const item = localStorage.getItem(key);
        if (item) {
          results.push(JSON.parse(item) as RatingReview);
        }
      }
    }
  } catch (error) {
    console.error('Error retrieving user ratings/reviews from localStorage:', error);
  }
  return results;
};

// --- Favorite Movie Functions ---

export const saveFavorite = (userId: string, movie: FavoriteMovie): void => {
  if (!userId || !movie || !movie.movieId) {
    console.error('User ID and movie data (with movieId) are required to save favorite.');
    return;
  }
  const key = getFavoriteKey(userId, movie.movieId);
  try {
    localStorage.setItem(key, JSON.stringify(movie));
  } catch (error) {
    console.error('Error saving favorite to localStorage:', error);
  }
};

export const removeFavorite = (userId: string, movieId: string): void => {
  if (!userId || !movieId) {
    console.error('User ID and Movie ID are required to remove favorite.');
    return;
  }
  const key = getFavoriteKey(userId, movieId);
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing favorite from localStorage:', error);
  }
};

export const getFavorites = (userId: string): FavoriteMovie[] => {
  if (!userId) {
    console.error('User ID is required to get favorites.');
    return [];
  }
  const results: FavoriteMovie[] = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(`${FAVORITE_PREFIX}${userId}_`)) {
        const item = localStorage.getItem(key);
        if (item) {
          results.push(JSON.parse(item) as FavoriteMovie);
        }
      }
    }
  } catch (error) {
    console.error('Error retrieving favorites from localStorage:', error);
  }
  return results;
};

export const isFavorite = (userId: string, movieId: string): boolean => {
  if (!userId || !movieId) {
    console.error('User ID and Movie ID are required to check if favorite.');
    return false;
  }
  const key = getFavoriteKey(userId, movieId);
  try {
    return localStorage.getItem(key) !== null;
  } catch (error) {
    console.error('Error checking favorite status in localStorage:', error);
    return false;
  }
};
