import { createServerSupabase } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import EditRaceForm from '@/components/admin/EditRaceForm';

export default async function EditRacePage({ params }: { params: { id: string } }) {
  const supabase = await createServerSupabase();
  const { data: race, error } = await supabase
    .from('races')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error || !race) {
    redirect('/admin/races');
  }

  return <EditRaceForm race={race} />;
}

