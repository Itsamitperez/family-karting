'use client';

import { useEffect, useState } from 'react';
import { AlertCircle } from 'lucide-react';

export default function EnvCheck() {
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!url || !key) {
      setMissing(true);
    }
  }, []);

  if (!missing) return null;

  return (
    <div className="fixed top-4 left-4 right-4 z-50 bg-red-900/90 border border-red-500 rounded-lg p-4 text-white">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="font-bold mb-1">Missing Environment Variables</h3>
          <p className="text-sm mb-2">
            Please create a <code className="bg-black/30 px-1 rounded">.env.local</code> file in the root directory with:
          </p>
          <pre className="bg-black/30 p-2 rounded text-xs overflow-x-auto mb-2">
{`NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key`}
          </pre>
          <p className="text-xs">
            Get these values from:{' '}
            <a
              href="https://supabase.com/dashboard/project/_/settings/api"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:no-underline"
            >
              Supabase Dashboard → Settings → API
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

