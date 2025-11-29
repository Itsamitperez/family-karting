'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientSupabase } from '@/lib/supabase/client';
import { Trash2 } from 'lucide-react';

export default function DeleteLapButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClientSupabase();

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this lap?')) return;

    setLoading(true);
    try {
      const { error } = await supabase.from('laps').delete().eq('id', id);
      if (error) throw error;
      router.refresh();
    } catch (err: any) {
      alert('Error deleting lap: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="p-2 bg-electric-red/10 border border-electric-red/30 text-electric-red rounded-lg 
        hover:bg-electric-red/20 hover:border-electric-red/50 transition-all disabled:opacity-50"
    >
      <Trash2 size={16} />
    </button>
  );
}
