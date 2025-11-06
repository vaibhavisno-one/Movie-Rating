const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;//asking for api key from .env
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

if (!TMDB_API_KEY) {
  throw new Error('Missing TMDB API key');
}

export async function searchMovies(query, language) {
  const params = new URLSearchParams({
    api_key: TMDB_API_KEY,
    query: query,
    ...(language && { with_original_language: language }),
  });
  const response = await fetch(`${TMDB_BASE_URL}/search/movie?${params}`);
  return response.json();
}

export async function getMovieDetails(id) {
  const response = await fetch(
    `${TMDB_BASE_URL}/movie/${id}?api_key=${TMDB_API_KEY}&append_to_response=keywords,watch/providers`
  );
  return response.json();
}

export async function getPopularMovies(page = 1, language) {
  const params = new URLSearchParams({
    api_key: TMDB_API_KEY,
    page: page.toString(),
    ...(language && { with_original_language: language }),
  });
  const response = await fetch(`${TMDB_BASE_URL}/movie/popular?${params}`);
  return response.json();
}

export async function getMoviesByGenre(genreId, page = 1, language) {
  const params = new URLSearchParams({
    api_key: TMDB_API_KEY,
    with_genres: genreId.toString(),
    page: page.toString(),
    ...(language && { with_original_language: language }),
  });
  const response = await fetch(`${TMDB_BASE_URL}/discover/movie?${params}`);
  return response.json();
}

// Map moods to relevant keywords and genres
const moodMap = {
  happy: { keywords: [9715, 9717], genres: [35, 10751] }, // comedy, family
  sad: { keywords: [9748, 9714], genres: [18] }, // drama
  adventurous: { keywords: [9716], genres: [12, 28] }, // adventure, action
  romantic: { keywords: [9748], genres: [10749] }, // romance
  scary: { keywords: [9718], genres: [27, 53] }, // horror, thriller
  inspiring: { keywords: [9715], genres: [18, 36] }, // drama, history
  relaxing: { keywords: [9716], genres: [35, 10751] }, // comedy, family
  thoughtful: { keywords: [9714], genres: [18, 99] }, // drama, documentary
};

export async function getMoviesByMood(mood, page = 1) {
  const { keywords, genres } = moodMap[mood];
  const params = new URLSearchParams({
    api_key: TMDB_API_KEY,
    with_genres: genres.join(','),
    with_keywords: keywords.join(','),
    page: page.toString(),
    sort_by: 'popularity.desc',
  });
  const response = await fetch(`${TMDB_BASE_URL}/discover/movie?${params}`);
  return response.json();
}

// Language codes mapping
export const languageCodes = {
  english: 'en',
  hindi: 'hi',
  spanish: 'es',
  french: 'fr',
  japanese: 'ja',
  korean: 'ko',
  chinese: 'zh',
  german: 'de',
  italian: 'it',
  portuguese: 'pt',
  russian: 'ru',
  turkish: 'tr',
};