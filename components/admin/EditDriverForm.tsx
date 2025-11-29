'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientSupabase } from '@/lib/supabase/client';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Driver } from '@/types/database';
import ImageUpload from '@/components/ui/ImageUpload';

export default function EditDriverForm({ driver }: { driver: Driver }) {
  const router = useRouter();
  const supabase = createClientSupabase();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: driver.name,
    birthday: driver.birthday || '',
    photo_url: driver.photo_url || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('drivers')
        .update({
          ...formData,
          birthday: formData.birthday || null,
        })
        .eq('id', driver.id);

      if (error) throw error;
      router.push('/admin/drivers');
    } catch (err: any) {
      alert('Error updating driver: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = `w-full px-4 py-3 bg-[#1a1a2e] border border-white/30 rounded-xl 
    text-soft-white placeholder-soft-white/50
    focus:outline-none focus:border-aqua-neon focus:ring-2 focus:ring-aqua-neon/40
    transition-all`;

  return (
    <div>
      <Link
        href="/admin/drivers"
        className="inline-flex items-center gap-2 text-soft-white/60 hover:text-soft-white mb-6 transition-colors group"
      >
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        Back to Drivers
      </Link>

      <h1 className="font-f1 text-3xl font-bold text-soft-white mb-8">Edit Driver</h1>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <div className="glass-card rounded-2xl p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-soft-white/70 mb-2">Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-soft-white/70 mb-2">Birthday</label>
            <input
              type="date"
              value={formData.birthday}
              onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
              className={inputClass}
            />
          </div>

          <ImageUpload
            label="Driver Photo"
            value={formData.photo_url}
            onChange={(url) => setFormData({ ...formData, photo_url: url })}
            bucket="images"
            folder="drivers"
            accentColor="aqua-neon"
          />
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-electric-red text-white rounded-xl font-semibold
              hover:bg-electric-red-light hover:shadow-glow-red transition-all 
              disabled:opacity-50 disabled:cursor-not-allowed
              flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Updating...
              </>
            ) : (
              'Update Driver'
            )}
          </button>
          <Link
            href="/admin/drivers"
            className="px-6 py-3 bg-white/5 border border-white/10 text-soft-white rounded-xl 
              hover:bg-white/10 hover:border-white/20 transition-all font-medium"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
