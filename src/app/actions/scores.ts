'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export async function getScores() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data, error } = await supabase
    .from('scores')
    .select('*')
    .eq('user_id', user.id)
    .order('played_date', { ascending: false });

  if (error) throw new Error(error.message);
  return data || [];
}

export async function addScore(score: number, playedDate: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  if (score < 1 || score > 45) throw new Error('Score must be between 1 and 45');

  const { error } = await supabase.from('scores').insert({
    user_id: user.id,
    score,
    played_date: playedDate,
  });

  if (error) throw new Error(error.message);
  revalidatePath('/scores');
  revalidatePath('/dashboard');
  return { success: true };
}

export async function deleteScore(scoreId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { error } = await supabase
    .from('scores')
    .delete()
    .eq('id', scoreId)
    .eq('user_id', user.id);

  if (error) throw new Error(error.message);
  revalidatePath('/scores');
  revalidatePath('/dashboard');
  return { success: true };
}
