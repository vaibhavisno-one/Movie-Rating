import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../lib/store';
import { supabase } from '../lib/supabase';
import { Button } from './ui/button';

interface FavoriteMovie {
  id: string;
  movies: {
    id: string;
    title: string;
    poster_path: string;
    release_date: string;
  };
}

interface UserRating {
  id: string;
  rating: number;
  review: string;
  intimacy_rating: string;
  created_at: string;
  movies: {
    id: string;
    title: string;
    poster_path: string;
  };
}

export default function Profile() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<FavoriteMovie[]>([]);
  const [ratings, setRatings] = useState<UserRating[]>([]);
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    const fetchUserData = async () => {
      try {
        // Fetch user profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', user.id)
          .single();

        if (profile) {
          setUsername(profile.username || '');
        }

        // Fetch favorites
        const { data: favoritesData } = await supabase
          .from('favorites')
          .select('id, movies(id, title, poster_path, release_date)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (favoritesData) {
          setFavorites(favoritesData);
        }

        // Fetch ratings
        const { data: ratingsData } = await supabase
          .from('ratings')
          .select('id, rating, review, intimacy_rating, created_at, movies(id, title, poster_path)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (ratingsData) {
          setRatings(ratingsData);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user, navigate]);

  const updateUsername = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({ id: user.id, username });

      if (error) throw error;
    } catch (error) {
      console.error('Error updating username:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Profile Info */}
      <div className="bg-card rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Profile</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Email
            </label>
            <p className="text-lg">{user?.email}</p>
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
                className="flex-1 p-2 rounded-md border bg-background"
                placeholder="Set your username"
              />
              <Button onClick={updateUsername}>Save</Button>
            </div>
          </div>
        </div>
      </div>

      {/* Favorites */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Favorite Movies</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {favorites.map((favorite) => (
            <div
              key={favorite.id}
              className="bg-card rounded-lg overflow-hidden shadow-lg"
            >
              <img
                src={`https://image.tmdb.org/t/p/w500${favorite.movies.poster_path}`}
                alt={favorite.movies.title}
                className="w-full aspect-[2/3] object-cover"
              />
              <div className="p-4">
                <h3 className="font-semibold line-clamp-1">
                  {favorite.movies.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {new Date(favorite.movies.release_date).getFullYear()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ratings */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Your Ratings</h2>
        <div className="space-y-4">
          {ratings.map((rating) => (
            <div key={rating.id} className="bg-card rounded-lg p-6">
              <div className="flex gap-4">
                <img
                  src={`https://image.tmdb.org/t/p/w500${rating.movies.poster_path}`}
                  alt={rating.movies.title}
                  className="w-24 h-36 object-cover rounded"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold">
                      {rating.movies.title}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-semibold">
                        {rating.rating}/10
                      </span>
                      <span className="text-sm text-muted-foreground">
                        ({rating.intimacy_rating})
                      </span>
                    </div>
                  </div>
                  {rating.review && <p>{rating.review}</p>}
                  <p className="text-sm text-muted-foreground mt-2">
                    Rated on {new Date(rating.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}