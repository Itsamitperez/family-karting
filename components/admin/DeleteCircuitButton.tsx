'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientSupabase } from '@/lib/supabase/client';
import { Trash2 } from 'lucide-react';

export default function DeleteCircuitButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClientSupabase();

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this circuit?')) return;

    setLoading(true);
    try {
      const { error } = await supabase.from('circuits').delete().eq('id', id);
      if (error) throw error;
      router.refresh();
    } catch (err: any) {
      alert('Error deleting circuit: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="flex items-center justify-center gap-2 px-4 py-2 bg-red-900/20 border border-red-500 text-red-400 rounded hover:bg-red-900/30 transition-colors disabled:opacity-50"
    >
      <Trash2 size={16} />
    </button>
  );
}

