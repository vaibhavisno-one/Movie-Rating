import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../lib/store';
import * as localStore from '../lib/localStorageService'; // Import Local Storage Service
import { Button } from './ui/button';

// Interfaces are now imported from localStore or use its types directly

export default function Profile() {
  const { user, setUser } = useAuthStore(); // Assuming setUser can update the user object in store
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<localStore.FavoriteMovie[]>([]);
  const [ratings, setRatings] = useState<localStore.RatingReview[]>([]);
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    const fetchUserData = () => {
      setLoading(true);
      try {
        // Username comes from the auth store
        setUsername(user.username || user.email || ''); // Fallback to email if username is not set

        // Fetch favorites from Local Storage
        const favs = localStore.getFavorites(user.id);
        setFavorites(favs);

        // Fetch ratings from Local Storage
        const userRatings = localStore.getUserRatingsReviews(user.id);
        setRatings(userRatings);
      } catch (error) {
        console.error('Error fetching user data from local storage:', error);
        setMessage('Failed to load profile data.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user, navigate]);

  const handleUpdateUsername = async () => {
    if (!user) return;
    
    // This part will be fully functional after store.ts is updated with updateUsername
    const { updateUsername: updateStoreUsername } = useAuthStore.getState();
    if (updateStoreUsername) {
        updateStoreUsername(username);
        setMessage('Username updated successfully!');
        // Optionally, refetch or update user from store if needed, though store should handle it
    } else {
        console.warn('updateUsername function not found in auth store. Store modification pending.');
        setMessage('Username update feature pending store update.');
    }
    // For now, also update local component state if store isn't fully ready for this:
    // setUser({ ...user, username: username }); // This would be if setUser could take partial updates or if we construct the full user
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-4">
      {message && (
        <div className={`p-3 rounded-md ${message.includes('Failed') ? 'bg-destructive/10 text-destructive' : 'bg-constructive/10 text-constructive'}`}>
          {message}
        </div>
      )}
      {/* Profile Info */}
      <div className="bg-card rounded-lg p-6 shadow">
        <h2 className="text-2xl font-bold mb-6">Profile</h2>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Email
            </label>
            <p className="text-lg bg-muted p-2 rounded-md">{user?.email}</p>
          </div>
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-muted-foreground mb-1"
            >
              Username
            </label>
            <div className="flex gap-2">
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="flex-1 p-2 rounded-md border bg-background focus:ring-primary focus:border-primary"
                placeholder="Set your username"
              />
              <Button onClick={handleUpdateUsername}>Save Username</Button>
            </div>
          </div>
        </div>
      </div>

      {/* Favorites */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Favorite Movies</h2>
        {favorites.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {favorites.map((favorite) => (
              <div
                key={favorite.movieId} // Use movieId as key
                className="bg-card rounded-lg overflow-hidden shadow-lg transition-transform hover:scale-105"
              >
                <img
                  src={favorite.posterPath ? `https://image.tmdb.org/t/p/w500${favorite.posterPath}` : '/placeholder-image.png'}
                  alt={favorite.title}
                  className="w-full aspect-[2/3] object-cover"
                />
                <div className="p-4">
                  <h3 className="font-semibold line-clamp-1">
                    {favorite.title}
                  </h3>
                  {favorite.releaseDate && (
                    <p className="text-sm text-muted-foreground">
                      {new Date(favorite.releaseDate).getFullYear()}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground bg-card p-4 rounded-md">You haven't added any movies to your favorites yet.</p>
        )}
      </div>

      {/* Ratings */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Your Ratings & Reviews</h2>
        {ratings.length > 0 ? (
          <div className="space-y-4">
            {ratings.map((rating) => (
              <div key={rating.movieId} className="bg-card rounded-lg p-6 shadow flex gap-4">
                <img
                  src={rating.posterPath ? `https://image.tmdb.org/t/p/w500${rating.posterPath}` : '/placeholder-image.png'}
                  alt={rating.title || 'Movie poster'}
                  className="w-24 h-36 object-cover rounded"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold">
                      {rating.title || 'Movie Title'}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-semibold">
                        {rating.rating}/10
                      </span>
                      <span className="text-sm text-muted-foreground">
                        ({rating.intimacyRating})
                      </span>
                    </div>
                  </div>
                  {rating.reviewText && <p className="text-muted-foreground whitespace-pre-wrap">{rating.reviewText}</p>}
                  {/* Created_at is not stored in localStore.RatingReview */}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground bg-card p-4 rounded-md">You haven't rated or reviewed any movies yet.</p>
        )}
      </div>
    </div>
  );
}