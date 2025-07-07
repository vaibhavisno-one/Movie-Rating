import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './lib/store';
import Navbar from './components/Navbar';
import Home from './components/Home';
import MovieDetails from './components/MovieDetails';
import Profile from './components/Profile';
import Auth from './components/Auth';
import { ThemeProvider } from './components/ThemeProvider';

function App() {
  // const setUser = useAuthStore((state) => state.setUser); // No longer directly setting user like this
  const checkUserSession = useAuthStore((state) => state.checkUserSession);
  const loading = useAuthStore((state) => state.loading); // Optional: manage a global loading state

  useEffect(() => {
    checkUserSession();
  }, [checkUserSession]);

  // Optional: Show a loading indicator while checking session
  // if (loading) {
  //   return <div>Loading application...</div>; 
  // }

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Router>
        <div className="min-h-screen bg-background text-foreground">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/movie/:id" element={<MovieDetails />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/auth" element={<Auth />} />
            </Routes>
          </main>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;