'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientSupabase } from '@/lib/supabase/client';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Circuit } from '@/types/database';
import ImageUpload from '@/components/ui/ImageUpload';

export default function EditCircuitForm({ circuit }: { circuit: Circuit }) {
  const router = useRouter();
  const supabase = createClientSupabase();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: circuit.name,
    description: circuit.description || '',
    photo_url: circuit.photo_url || '',
    length: circuit.length?.toString() || '',
    url: circuit.url || '',
    type: circuit.type,
    location_lat: circuit.location_lat?.toString() || '',
    location_long: circuit.location_long?.toString() || '',
    status: circuit.status,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('circuits')
        .update({
          ...formData,
          length: formData.length ? parseFloat(formData.length) : null,
          location_lat: formData.location_lat ? parseFloat(formData.location_lat) : null,
          location_long: formData.location_long ? parseFloat(formData.location_long) : null,
        })
        .eq('id', circuit.id);

      if (error) throw error;
      router.push('/admin/circuits');
    } catch (err: any) {
      alert('Error updating circuit: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Link
        href="/admin/circuits"
        className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6"
      >
        <ArrowLeft size={20} />
        Back to Circuits
      </Link>

      <h1 className="text-4xl font-bold mb-8">Edit Circuit</h1>

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
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
            className="w-full px-4 py-2 bg-background border border-gray-700 rounded-lg focus:outline-none focus:border-primary"
          />
        </div>

        <ImageUpload
          label="Circuit Photo"
          value={formData.photo_url}
          onChange={(url) => setFormData({ ...formData, photo_url: url })}
          bucket="images"
          folder="circuits"
        />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Length (meters)</label>
            <input
              type="number"
              step="0.01"
              value={formData.length}
              onChange={(e) => setFormData({ ...formData, length: e.target.value })}
              className="w-full px-4 py-2 bg-background border border-gray-700 rounded-lg focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Circuit URL</label>
            <input
              type="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              className="w-full px-4 py-2 bg-background border border-gray-700 rounded-lg focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Type *</label>
            <select
              required
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as 'outdoor' | 'indoor' })}
              className="w-full px-4 py-2 bg-background border border-gray-700 rounded-lg focus:outline-none focus:border-primary"
            >
              <option value="outdoor">Outdoor</option>
              <option value="indoor">Indoor</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Status *</label>
            <select
              required
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
              className="w-full px-4 py-2 bg-background border border-gray-700 rounded-lg focus:outline-none focus:border-primary"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Latitude</label>
            <input
              type="number"
              step="0.000001"
              value={formData.location_lat}
              onChange={(e) => setFormData({ ...formData, location_lat: e.target.value })}
              className="w-full px-4 py-2 bg-background border border-gray-700 rounded-lg focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Longitude</label>
            <input
              type="number"
              step="0.000001"
              value={formData.location_long}
              onChange={(e) => setFormData({ ...formData, location_long: e.target.value })}
              className="w-full px-4 py-2 bg-background border border-gray-700 rounded-lg focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            {loading ? 'Updating...' : 'Update Circuit'}
          </button>
          <Link
            href="/admin/circuits"
            className="px-6 py-2 bg-background-secondary border border-gray-700 rounded-lg hover:border-gray-600 transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

