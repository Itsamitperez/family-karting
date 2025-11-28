import { createServerSupabase } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import EditLapForm from '@/components/admin/EditLapForm';

export default async function EditLapPage({ params }: { params: { id: string } }) {
  const supabase = await createServerSupabase();
  const { data: lap, error } = await supabase
    .from('laps')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error || !lap) {
    redirect('/admin/laps');
  }

  return <EditLapForm lap={lap} />;
}

