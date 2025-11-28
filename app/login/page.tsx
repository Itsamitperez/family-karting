'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientSupabase } from '@/lib/supabase/client';
import { Flag } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  
  // Create supabase client inside component to ensure env vars are available
  const getSupabase = () => {
    try {
      return createClientSupabase();
    } catch (err: any) {
      console.error('Error creating Supabase client:', err);
      setError('Configuration error: ' + err.message);
      return null;
    }
  };

  useEffect(() => {
    // Check if Supabase is configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    console.log('Environment check:', {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseKey,
      urlLength: supabaseUrl?.length || 0,
      keyLength: supabaseKey?.length || 0,
    });
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Supabase environment variables not set!');
      setError('Supabase configuration missing. Please check your .env.local file.');
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted!', { email: email ? 'provided' : 'empty', password: password ? 'provided' : 'empty' });
    
    setError('');
    setLoading(true);

    console.log('Attempting login with email:', email);

    try {
      if (!email || !password) {
        throw new Error('Please enter both email and password');
      }

      const supabase = getSupabase();
      if (!supabase) {
        throw new Error('Supabase client not available');
      }

      console.log('Calling signInWithPassword...');
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      console.log('Login response:', { data, error: authError });

      if (authError) {
        console.error('Login error:', authError);
        throw authError;
      }

      if (data?.user) {
        console.log('Login successful, user:', data.user.id);
        
        // Wait for auth state to update and cookies to be set
        let sessionResolved = false;
        let attempts = 0;
        const maxAttempts = 20; // Increased attempts
        
        while (!sessionResolved && attempts < maxAttempts) {
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          if (session) {
            console.log('Session confirmed after', attempts + 1, 'attempts');
            sessionResolved = true;
          } else {
            attempts++;
            if (sessionError) {
              console.log('Session check error:', sessionError.message);
            }
            await new Promise(resolve => setTimeout(resolve, 150));
          }
        }
        
        if (!sessionResolved) {
          console.warn('Session not confirmed after', maxAttempts, 'attempts, but redirecting anyway...');
        }
        
        // Refresh the session to ensure it's properly set in cookies
        console.log('Refreshing session...');
        const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession();
        
        if (refreshError) {
          console.warn('Session refresh error:', refreshError.message);
        }
        
        // Get the session one more time to ensure it's set
        const finalSessionCheck = await supabase.auth.getSession();
        console.log('Final session check before redirect:', {
          hasSession: !!finalSessionCheck.data.session,
          hasUser: !!finalSessionCheck.data.session?.user,
          accessToken: finalSessionCheck.data.session?.access_token ? 'present' : 'missing',
          refreshed: !!refreshedSession,
        });
        
        // Check cookies are set (Supabase uses sb-<project-ref>-auth-token)
        const allCookies = document.cookie.split('; ').map(c => {
          const [name, ...rest] = c.split('=');
          return { name, value: rest.join('=') };
        });
        const supabaseCookies = allCookies.filter(c => c.name.includes('supabase') || c.name.includes('auth'));
        console.log('Cookies before redirect:', supabaseCookies.map(c => ({ name: c.name, hasValue: !!c.value, length: c.value?.length || 0 })));
        
        // Wait longer to ensure cookies are written and available
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        console.log('Redirecting to /admin...');
        // Use window.location.href for a full page reload with cookies
        // This ensures all cookies are sent with the request
        window.location.href = '/admin';
        return; // Exit early to prevent error handler from running
      } else {
        throw new Error('No user data returned');
      }
    } catch (err: any) {
      console.error('Login exception:', err);
      setError(err.message || 'Failed to login. Please check your credentials.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Flag className="w-16 h-16 text-primary mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-2">Admin Login</h1>
          <p className="text-gray-400">Enter your credentials to access the admin panel</p>
        </div>

        <form onSubmit={handleLogin} className="bg-background-secondary border border-gray-800 rounded-lg p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-900/20 border border-red-500 rounded text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email / Username
            </label>
            <input
              id="email"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 bg-background border border-gray-700 rounded-lg focus:outline-none focus:border-primary transition-colors"
              placeholder="Enter your email or username"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 bg-background border border-gray-700 rounded-lg focus:outline-none focus:border-primary transition-colors"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <a href="/" className="text-gray-400 hover:text-primary transition-colors">
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}

