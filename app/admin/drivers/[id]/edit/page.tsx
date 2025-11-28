import { createServerSupabase } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import EditDriverForm from '@/components/admin/EditDriverForm';

export default async function EditDriverPage({ params }: { params: { id: string } }) {
  const supabase = await createServerSupabase();
  const { data: driver, error } = await supabase
    .from('drivers')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error || !driver) {
    redirect('/admin/drivers');
  }

  return <EditDriverForm driver={driver} />;
}

