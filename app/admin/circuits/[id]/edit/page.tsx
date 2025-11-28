import { createServerSupabase } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import EditCircuitForm from '@/components/admin/EditCircuitForm';

export default async function EditCircuitPage({ params }: { params: { id: string } }) {
  const supabase = await createServerSupabase();
  const { data: circuit, error } = await supabase
    .from('circuits')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error || !circuit) {
    redirect('/admin/circuits');
  }

  return <EditCircuitForm circuit={circuit} />;
}

