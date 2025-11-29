'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientSupabase } from '@/lib/supabase/client';
import { Trash2 } from 'lucide-react';

export default function DeleteDriverButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClientSupabase();

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this driver?')) return;

    setLoading(true);
    try {
      const { error } = await supabase.from('drivers').delete().eq('id', id);
      if (error) throw error;
      router.refresh();
    } catch (err: any) {
      alert('Error deleting driver: ' + err.message);
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
