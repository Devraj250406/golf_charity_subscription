'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function getPublishedDraws() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('draws')
    .select('*')
    .eq('status', 'published')
    .order('draw_date', { ascending: false })
    .limit(12);

  if (error) throw new Error(error.message);
  return data || [];
}

export async function getDrawEntries() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data, error } = await supabase
    .from('draw_entries')
    .select('*, draws(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) throw new Error(error.message);
  return data || [];
}

export async function getWinnings() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data, error } = await supabase
    .from('winnings')
    .select('*, draws(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data || [];
}
