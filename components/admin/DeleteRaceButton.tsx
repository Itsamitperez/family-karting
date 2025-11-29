'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientSupabase } from '@/lib/supabase/client';
import { Trash2 } from 'lucide-react';

export default function DeleteRaceButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClientSupabase();

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this race? This will also delete all associated laps.')) return;

    setLoading(true);
    try {
      // Delete related data first
      await supabase.from('laps').delete().eq('race_id', id);
      await supabase.from('race_drivers').delete().eq('race_id', id);
      const { error } = await supabase.from('races').delete().eq('id', id);
      if (error) throw error;
      router.refresh();
    } catch (err: any) {
      alert('Error deleting race: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="flex items-center justify-center gap-2 px-4 py-2.5 
        bg-electric-red/10 border border-electric-red/30 text-electric-red rounded-xl 
        hover:bg-electric-red/20 hover:border-electric-red/50 transition-all disabled:opacity-50"
    >
      <Trash2 size={16} />
    </button>
  );
}
