import { createServerSupabase } from '@/lib/supabase/server';
import Link from 'next/link';
import { Plus, Edit, Trash2, User } from 'lucide-react';
import { Driver } from '@/types/database';
import DeleteDriverButton from '@/components/admin/DeleteDriverButton';

export default async function DriversPage() {
  const supabase = await createServerSupabase();
  const { data: drivers, error } = await supabase
    .from('drivers')
    .select('*')
    .order('name');

  if (error) {
    return <div className="text-red-400">Error loading drivers: {error.message}</div>;
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 className="text-4xl font-bold">Drivers</h1>
        <Link
          href="/admin/drivers/new"
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
        >
          <Plus size={20} />
          Add Driver
        </Link>
      </div>

      {drivers && drivers.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <User className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>No drivers yet. Add your first driver!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {drivers?.map((driver: Driver) => (
            <div
              key={driver.id}
              className="bg-background-secondary border border-gray-800 rounded-lg overflow-hidden hover:border-primary transition-all"
            >
              {driver.photo_url ? (
                <div className="h-48 bg-gray-900 relative overflow-hidden">
                  <img
                    src={driver.photo_url}
                    alt={driver.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="h-48 bg-gray-900 flex items-center justify-center">
                  <User className="w-16 h-16 text-gray-700" />
                </div>
              )}
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">{driver.name}</h3>
                {driver.birthday && (
                  <p className="text-sm text-gray-400 mb-4">
                    Born: {new Date(driver.birthday).toLocaleDateString()}
                  </p>
                )}
                <div className="flex gap-2 mt-4">
                  <Link
                    href={`/admin/drivers/${driver.id}/edit`}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-background border border-gray-700 rounded hover:border-primary transition-colors"
                  >
                    <Edit size={16} />
                    Edit
                  </Link>
                  <DeleteDriverButton id={driver.id} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

