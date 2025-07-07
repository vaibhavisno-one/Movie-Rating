import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../lib/store';
import { Button } from './ui/button';
import { Mail, Lock, AlertCircle } from 'lucide-react';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  // const [resetPassword, setResetPassword] = useState(false); // Removed
  const { signIn, signUp, error: authError, loading: authLoading } = useAuthStore(); // Get error and loading from store
  const navigate = useNavigate();

  const validateForm = () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return false;
    }
    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      return false;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); // Clear local error
    // setLoading will be handled by the store's authLoading state

    if (!validateForm()) {
      // setError is called within validateForm if needed
      return;
    }

    try {
      if (isSignUp) {
        await signUp(email, password);
        // No alert needed for local storage signup
        // Check for store error after signUp
        if (useAuthStore.getState().error) {
          setError(useAuthStore.getState().error);
        } else {
          navigate('/'); // Navigate to home on successful sign up
        }
      } else {
        await signIn(email, password);
        // Check for store error after signIn
        if (useAuthStore.getState().error) {
          setError(useAuthStore.getState().error);
        } else {
          navigate('/');
        }
      }
    } catch (err) {
      // This catch block might be redundant if store handles all errors
      // and sets them in authError. Keeping it for local errors or unexpected issues.
      console.error('Auth component error:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'An unexpected error occurred.'
      );
    }
    // setLoading(false) is not needed here as we use authLoading from the store
  };

  // Update error display to use local error first, then authError from store
  const displayError = error || authError;

  return (
    <div className="max-w-md mx-auto mt-16">
      <div className="bg-card text-card-foreground rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold mb-6">
          {isSignUp ? 'Create Account' : 'Sign In'}
        </h2>

        {displayError && (
          <div className="bg-destructive/10 text-destructive p-3 rounded-md mb-4 flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {displayError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-muted-foreground mb-1"
            >
              Email
            </label>
            <div className="relative">
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-md border bg-background"
                required
              />
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-muted-foreground mb-1"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-md border bg-background"
                required
              />
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={authLoading} // Use authLoading from store
          >
            {authLoading ? ( // Use authLoading from store
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : isSignUp ? (
              'Sign Up'
            ) : (
              'Sign In'
            )}
          </Button>
        </form>

        <div className="mt-4 text-center space-y-2">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError(null); // Clear error on view toggle
            }}
            className="text-sm text-primary hover:underline"
          >
            {isSignUp
              ? 'Already have an account? Sign in'
              : "Don't have an account? Sign up"}
          </button>
          {/* Removed Forgot Password button */}
        </div>
      </div>
    </div>
  );
}