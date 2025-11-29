import { createServerSupabase } from '@/lib/supabase/server';
import Link from 'next/link';
import { Plus, Edit, User } from 'lucide-react';
import { Driver } from '@/types/database';
import DeleteDriverButton from '@/components/admin/DeleteDriverButton';
import { DEFAULT_DRIVER_IMAGE } from '@/lib/utils';

export default async function DriversPage() {
  const supabase = await createServerSupabase();
  const { data: drivers, error } = await supabase
    .from('drivers')
    .select('*')
    .order('name');

  if (error) {
    return (
      <div className="glass-card rounded-2xl p-6 border-electric-red/30 bg-electric-red/5">
        <p className="text-electric-red">Error loading drivers: {error.message}</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="font-f1 text-3xl font-bold text-soft-white mb-1">Drivers</h1>
          <p className="text-soft-white/50">Manage your racing family</p>
        </div>
        <Link
          href="/admin/drivers/new"
          className="flex items-center gap-2 px-5 py-3 bg-electric-red text-white rounded-xl 
            font-semibold hover:bg-electric-red-light hover:shadow-glow-red transition-all"
        >
          <Plus size={20} />
          Add Driver
        </Link>
      </div>

      {drivers && drivers.length === 0 ? (
        <div className="glass-card rounded-3xl p-16 text-center">
          <User className="w-16 h-16 mx-auto mb-4 text-soft-white/20" />
          <p className="text-soft-white/50 text-lg mb-4">No drivers yet</p>
          <Link
            href="/admin/drivers/new"
            className="inline-flex items-center gap-2 px-5 py-3 bg-aqua-neon text-black rounded-xl 
              font-semibold hover:bg-aqua-neon-light transition-all"
          >
            <Plus size={18} />
            Add your first driver
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {drivers?.map((driver: Driver) => (
            <div
              key={driver.id}
              className="glass-card rounded-2xl overflow-hidden hover:border-aqua-neon/30 transition-all"
            >
              <div className="h-48 relative overflow-hidden">
                <img
                  src={driver.photo_url || DEFAULT_DRIVER_IMAGE}
                  alt={driver.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-deep-charcoal via-transparent to-transparent" />
              </div>
              <div className="p-5">
                <h3 className="font-f1 text-xl font-bold text-soft-white mb-2">{driver.name}</h3>
                {driver.birthday && (
                  <p className="text-sm text-soft-white/40 mb-3">
                    Born: {new Date(driver.birthday).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', year: 'numeric'
                    })}
                  </p>
                )}
                <div className="flex gap-2 mt-4">
                  <Link
                    href={`/admin/drivers/${driver.id}/edit`}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 
                      bg-white/5 border border-white/10 rounded-xl 
                      text-soft-white/70 hover:text-soft-white hover:bg-white/10 hover:border-white/20 
                      transition-all font-medium"
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
