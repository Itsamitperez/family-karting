'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientSupabase } from '@/lib/supabase/client';
import { Flag, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  
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
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      setError('Supabase configuration missing. Please check your .env.local file.');
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!email || !password) {
        throw new Error('Please enter both email and password');
      }

      const supabase = getSupabase();
      if (!supabase) {
        throw new Error('Supabase client not available');
      }

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (authError) {
        throw authError;
      }

      if (data?.user) {
        let sessionResolved = false;
        let attempts = 0;
        const maxAttempts = 20;
        
        while (!sessionResolved && attempts < maxAttempts) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            sessionResolved = true;
          } else {
            attempts++;
            await new Promise(resolve => setTimeout(resolve, 150));
          }
        }
        
        await supabase.auth.refreshSession();
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        window.location.href = '/admin';
        return;
      } else {
        throw new Error('No user data returned');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to login. Please check your credentials.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative">
      {/* Background */}
      <div className="racing-bg" />
      
      <div className="w-full max-w-md relative z-10">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-soft-white/60 hover:text-soft-white 
            mb-8 transition-colors group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Link>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-2xl bg-electric-red mx-auto mb-6 
            flex items-center justify-center shadow-glow-red">
            <Flag className="w-10 h-10 text-white" />
          </div>
          <h1 className="font-f1 text-4xl font-bold text-soft-white mb-2">Admin Login</h1>
          <p className="text-soft-white/50">Enter your credentials to access the admin panel</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="glass-card rounded-3xl p-8">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-electric-red/10 border border-electric-red/30 text-electric-red text-sm">
              {error}
            </div>
          )}

          <div className="mb-5">
            <label htmlFor="email" className="block text-sm font-medium text-soft-white/70 mb-2">
              Email / Username
            </label>
            <input
              id="email"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-[#1a1a2e] border border-white/30 rounded-xl 
                text-soft-white placeholder-soft-white/50
                focus:outline-none focus:border-electric-red focus:ring-2 focus:ring-electric-red/40
                transition-all"
              placeholder="Enter your email or username"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-soft-white/70 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 bg-[#1a1a2e] border border-white/30 rounded-xl 
                text-soft-white placeholder-soft-white/50
                focus:outline-none focus:border-electric-red focus:ring-2 focus:ring-electric-red/40
                transition-all"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-electric-red text-white font-semibold rounded-xl 
              hover:bg-electric-red-light hover:shadow-glow-red
              transition-all duration-200 
              disabled:opacity-50 disabled:cursor-not-allowed
              flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Logging in...
              </>
            ) : (
              'Login'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
