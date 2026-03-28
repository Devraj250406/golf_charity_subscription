'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export async function getCharities() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('charities')
    .select('*')
    .eq('is_active', true)
    .order('is_featured', { ascending: false });

  if (error) throw new Error(error.message);
  return data || [];
}

export async function selectCharity(charityId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { error } = await supabase
    .from('profiles')
    .update({ charity_id: charityId, updated_at: new Date().toISOString() })
    .eq('id', user.id);

  if (error) throw new Error(error.message);
  revalidatePath('/charity');
  revalidatePath('/dashboard');
  return { success: true };
}

export async function updateCharityPercentage(percentage: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  if (percentage < 10) throw new Error('Minimum charity percentage is 10%');

  const { error } = await supabase
    .from('profiles')
    .update({
      charity_percentage: percentage,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id);

  if (error) throw new Error(error.message);
  revalidatePath('/charity');
  return { success: true };
}

export async function getDonations() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data, error } = await supabase
    .from('donations')
    .select('*, charities(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data || [];
}
