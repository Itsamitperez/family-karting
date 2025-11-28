import { createServerSupabase } from '@/lib/supabase/server';
import Link from 'next/link';
import { Plus, Edit, Trash2, MapPin } from 'lucide-react';
import { Circuit } from '@/types/database';
import DeleteCircuitButton from '@/components/admin/DeleteCircuitButton';

export default async function CircuitsPage() {
  const supabase = await createServerSupabase();
  const { data: circuits, error } = await supabase
    .from('circuits')
    .select('*')
    .order('name');

  if (error) {
    return <div className="text-red-400">Error loading circuits: {error.message}</div>;
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 className="text-4xl font-bold">Circuits</h1>
        <Link
          href="/admin/circuits/new"
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
        >
          <Plus size={20} />
          Add Circuit
        </Link>
      </div>

      {circuits && circuits.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <MapPin className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>No circuits yet. Add your first circuit!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {circuits?.map((circuit: Circuit) => (
            <div
              key={circuit.id}
              className="bg-background-secondary border border-gray-800 rounded-lg overflow-hidden hover:border-primary transition-all"
            >
              {circuit.photo_url && (
                <div className="h-48 bg-gray-900 relative overflow-hidden">
                  <img
                    src={circuit.photo_url}
                    alt={circuit.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-xl font-bold">{circuit.name}</h3>
                  <span
                    className={`px-2 py-1 text-xs rounded ${
                      circuit.status === 'active'
                        ? 'bg-green-900/30 text-green-400'
                        : 'bg-gray-800 text-gray-400'
                    }`}
                  >
                    {circuit.status}
                  </span>
                </div>
                <p className="text-sm text-gray-400 mb-2 capitalize">{circuit.type}</p>
                {circuit.length && (
                  <p className="text-sm text-gray-500 mb-4">{circuit.length}m length</p>
                )}
                {circuit.description && (
                  <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                    {circuit.description}
                  </p>
                )}
                <div className="flex gap-2 mt-4">
                  <Link
                    href={`/admin/circuits/${circuit.id}/edit`}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-background border border-gray-700 rounded hover:border-primary transition-colors"
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

