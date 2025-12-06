'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientSupabase } from '@/lib/supabase/client';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Circuit, OperatingHours } from '@/types/database';
import ImageUpload from '@/components/ui/ImageUpload';
import OperatingHoursInput from './OperatingHoursInput';

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

  const [operatingHours, setOperatingHours] = useState<OperatingHours | null>(
    circuit.operating_hours
  );

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
          operating_hours: operatingHours,
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

  const inputClass = `w-full px-4 py-3 bg-[#1a1a2e] border border-white/30 rounded-xl 
    text-soft-white placeholder-soft-white/50
    focus:outline-none focus:border-cyber-purple focus:ring-2 focus:ring-cyber-purple/40
    transition-all`;

  return (
    <div>
      <Link
        href="/admin/circuits"
        className="inline-flex items-center gap-2 text-soft-white/60 hover:text-soft-white mb-6 transition-colors group"
      >
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        Back to Circuits
      </Link>

      <h1 className="font-f1 text-3xl font-bold text-soft-white mb-8">Edit Circuit</h1>

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
            <label className="block text-sm font-medium text-soft-white/70 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className={inputClass}
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
              <label className="block text-sm font-medium text-soft-white/70 mb-2">Length (meters)</label>
              <input
                type="number"
                step="0.01"
                value={formData.length}
                onChange={(e) => setFormData({ ...formData, length: e.target.value })}
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-soft-white/70 mb-2">Circuit URL</label>
              <input
                type="url"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-soft-white/70 mb-2">Type *</label>
              <select
                required
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as 'outdoor' | 'indoor' })}
                className={inputClass}
              >
                <option value="outdoor">Outdoor</option>
                <option value="indoor">Indoor</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-soft-white/70 mb-2">Status *</label>
              <select
                required
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                className={inputClass}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-soft-white/70 mb-2">Latitude</label>
              <input
                type="number"
                step="0.000001"
                value={formData.location_lat}
                onChange={(e) => setFormData({ ...formData, location_lat: e.target.value })}
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-soft-white/70 mb-2">Longitude</label>
              <input
                type="number"
                step="0.000001"
                value={formData.location_long}
                onChange={(e) => setFormData({ ...formData, location_long: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>

          <OperatingHoursInput
            value={operatingHours}
            onChange={setOperatingHours}
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
              'Update Circuit'
            )}
          </button>
          <Link
            href="/admin/circuits"
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
