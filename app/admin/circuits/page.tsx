import { createServerSupabase } from '@/lib/supabase/server';
import Link from 'next/link';
import { Plus, Edit, MapPin } from 'lucide-react';
import { Circuit } from '@/types/database';
import DeleteCircuitButton from '@/components/admin/DeleteCircuitButton';

export default async function CircuitsPage() {
  const supabase = await createServerSupabase();
  const { data: circuits, error } = await supabase
    .from('circuits')
    .select('*')
    .order('name');

  if (error) {
    return (
      <div className="glass-card rounded-2xl p-6 border-electric-red/30 bg-electric-red/5">
        <p className="text-electric-red">Error loading circuits: {error.message}</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="font-f1 text-3xl font-bold text-soft-white mb-1">Circuits</h1>
          <p className="text-soft-white/50">Manage your racing tracks</p>
        </div>
        <Link
          href="/admin/circuits/new"
          className="flex items-center gap-2 px-5 py-3 bg-electric-red text-white rounded-xl 
            font-semibold hover:bg-electric-red-light hover:shadow-glow-red transition-all"
        >
          <Plus size={20} />
          Add Circuit
        </Link>
      </div>

      {circuits && circuits.length === 0 ? (
        <div className="glass-card rounded-3xl p-16 text-center">
          <MapPin className="w-16 h-16 mx-auto mb-4 text-soft-white/20" />
          <p className="text-soft-white/50 text-lg mb-4">No circuits yet</p>
          <Link
            href="/admin/circuits/new"
            className="inline-flex items-center gap-2 px-5 py-3 bg-cyber-purple text-white rounded-xl 
              font-semibold hover:bg-cyber-purple-light transition-all"
          >
            <Plus size={18} />
            Add your first circuit
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {circuits?.map((circuit: Circuit) => (
            <div
              key={circuit.id}
              className="glass-card rounded-2xl overflow-hidden hover:border-cyber-purple/30 transition-all"
            >
              {circuit.photo_url ? (
                <div className="h-40 relative overflow-hidden">
                  <img
                    src={circuit.photo_url}
                    alt={circuit.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-deep-charcoal via-transparent to-transparent" />
                </div>
              ) : (
                <div className="h-40 bg-steel-gray/50 flex items-center justify-center">
                  <MapPin className="w-12 h-12 text-soft-white/10" />
                </div>
              )}
              <div className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-f1 text-xl font-bold text-soft-white">{circuit.name}</h3>
                  <span className={`
                    px-2 py-1 text-xs rounded-lg font-semibold
                    ${circuit.status === 'active'
                      ? 'bg-green-lime/20 text-green-lime'
                      : 'bg-steel-gray text-soft-white/60'
                    }
                  `}>
                    {circuit.status}
                  </span>
                </div>
                <p className="text-sm text-soft-white/40 mb-1 capitalize">{circuit.type}</p>
                {circuit.length && (
                  <p className="text-sm text-soft-white/30 mb-3">{circuit.length}m length</p>
                )}
                <div className="flex gap-2 mt-4">
                  <Link
                    href={`/admin/circuits/${circuit.id}/edit`}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 
                      bg-white/5 border border-white/10 rounded-xl 
                      text-soft-white/70 hover:text-soft-white hover:bg-white/10 hover:border-white/20 
                      transition-all font-medium"
                  >
                    <Edit size={16} />
                    Edit
                  </Link>
                  <DeleteCircuitButton id={circuit.id} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
