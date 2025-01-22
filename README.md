# Movie Rating and Recommendation Website

This project is a full-stack movie rating and recommendation website. It fetches movie ratings from various sources, computes average ratings, and provides personalized movie recommendations based on the user's mood. The website also features an intuitive UI with animations, a theme switcher, and an intimacy rating feature.

## Features

- **Movie Rating**: Fetch and display ratings from multiple websites.
- **Recommendations**: Suggest movies based on user mood.
- **Intimacy Rating**: Classify movies based on intimacy levels (`Little`, `Some`, `Very Much`, `Most`).
- **Theme Switcher**: Toggle between light and dark modes.
- **Responsive UI**: Beautiful animations and responsive design for all devices.
- **Genre Filtering**: Filter movies by genre.
- **Search Functionality**: Search for movies by name.

## Tech Stack

### Frontend
- **React**: Component-based UI development.
- **Tailwind CSS**: Styling with utility-first CSS framework.
- **React Router**: For navigation and routing.

### Backend
- **Supabase**: Backend-as-a-service for database and authentication.
- **TMDB API**: For fetching movie data and details.

## Prerequisites

- **Node.js** (v14 or higher)
- **Supabase Account** (for backend services)
- **TMDB API Key**

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/movie-rating-website.git
   cd movie-rating-website
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory with the following:
   ```env
   REACT_APP_SUPABASE_URL=your_supabase_url
   REACT_APP_SUPABASE_KEY=your_supabase_key
   REACT_APP_TMDB_API_KEY=your_tmdb_api_key
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open the application:
   Visit `http://localhost:5173` in your browser.

## Folder Structure

```
.
├── src
│   ├── components
│   │   ├── Home.tsx
│   │   ├── MovieDetails.tsx
│   │   └── ui
│   │       ├── Button.tsx
│   │       └── ThemeSwitcher.tsx
│   ├── lib
│   │   ├── supabase.ts
│   │   └── tmdb.ts
│   ├── App.tsx
│   └── main.tsx
├── public
│   └── index.html
├── .env
├── package.json
├── tailwind.config.js
└── README.md
```

## Usage

1. **Search for Movies**: Use the search bar to find specific movies.
2. **Filter by Genre**: Select a genre to view movies within that category.
3. **View Details**: Click on a movie to view its details, ratings, and recommendations.
4. **Rate a Movie**: Log in to rate a movie and add reviews.
5. **Switch Themes**: Use the theme switcher to toggle between light and dark modes.

## API Integration

### TMDB API
- Fetch movie data, genres, and recommendations.
- Example:
  ```typescript
  import { createClient } from '@supabase/supabase-js';

  const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
  const supabaseKey = process.env.REACT_APP_SUPABASE_KEY;

  export const supabase = createClient(supabaseUrl, supabaseKey);
  ```

### Supabase
- Use for storing user ratings and profiles.
- Example Query:
  ```sql
  SELECT *
  FROM ratings
  WHERE movie_id = '762509';
  ```

## Contributing

1. Fork the repository.
2. Create a new branch:
   ```bash
   git checkout -b feature-name
   ```
3. Commit your changes:
   ```bash
   git commit -m "Add some feature"
   ```
4. Push to the branch:
   ```bash
   git push origin feature-name
   ```
5. Open a pull request.

## License

This project is licensed under the [MIT License](LICENSE).

---

Enjoy exploring and rating movies! 🎥🍿
