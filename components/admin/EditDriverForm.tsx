'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientSupabase } from '@/lib/supabase/client';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
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

  return (
    <div>
      <Link
        href="/admin/drivers"
        className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6"
      >
        <ArrowLeft size={20} />
        Back to Drivers
      </Link>

      <h1 className="text-4xl font-bold mb-8">Edit Driver</h1>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Name *</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2 bg-background border border-gray-700 rounded-lg focus:outline-none focus:border-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Birthday</label>
          <input
            type="date"
            value={formData.birthday}
            onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
            className="w-full px-4 py-2 bg-background border border-gray-700 rounded-lg focus:outline-none focus:border-primary"
          />
        </div>

        <ImageUpload
          label="Driver Photo"
          value={formData.photo_url}
          onChange={(url) => setFormData({ ...formData, photo_url: url })}
          bucket="images"
          folder="drivers"
        />

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            {loading ? 'Updating...' : 'Update Driver'}
          </button>
          <Link
            href="/admin/drivers"
            className="px-6 py-2 bg-background-secondary border border-gray-700 rounded-lg hover:border-gray-600 transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

