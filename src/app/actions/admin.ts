'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') redirect('/dashboard');
  return user;
}

export async function getAdminStats() {
  await requireAdmin();
  const admin = createAdminClient();

  const [
    { count: totalUsers },
    { count: activeSubs },
    { data: charityData },
  ] = await Promise.all([
    admin.from('profiles').select('*', { count: 'exact', head: true }),
    admin.from('subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    admin.from('donations').select('amount'),
  ]);

  const totalDonations = charityData?.reduce((sum, d) => sum + Number(d.amount), 0) || 0;

  return {
    totalUsers: totalUsers || 0,
    activeSubscriptions: activeSubs || 0,
    totalCharityContributions: totalDonations,
    totalPrizePool: (activeSubs || 0) * 7,
  };
}

export async function getAllUsers() {
  await requireAdmin();
  const admin = createAdminClient();

  const { data, error } = await admin
    .from('profiles')
    .select('*, subscriptions(*)')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data || [];
}

export async function getAllSubscriptions() {
  await requireAdmin();
  const admin = createAdminClient();

  const { data, error } = await admin
    .from('subscriptions')
    .select('*, profiles(full_name, email)')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data || [];
}

export async function createDraw(drawDate: string, drawMode: 'random' | 'algorithm') {
  const adminUser = await requireAdmin();
  const admin = createAdminClient();

  const activeSubs = await admin
    .from('subscriptions')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active');

  const totalPool = (activeSubs.count || 0) * 7;
  const jackpotPool = totalPool * 0.4;
  const fourMatchPool = totalPool * 0.35;
  const threeMatchPool = totalPool * 0.25;

  const { data, error } = await admin.from('draws').insert({
    draw_date: drawDate,
    draw_mode: drawMode,
    total_pool: totalPool,
    jackpot_pool: jackpotPool,
    four_match_pool: fourMatchPool,
    three_match_pool: threeMatchPool,
    status: 'pending',
  }).select().single();

  if (error) throw new Error(error.message);

  // Log admin action
  await admin.from('admin_logs').insert({
    admin_id: adminUser.id,
    action: 'create_draw',
    entity_type: 'draw',
    entity_id: data.id,
    details: { draw_date: drawDate, draw_mode: drawMode, total_pool: totalPool },
  });

  revalidatePath('/admin/draws');
  return data;
}

export async function simulateDraw(drawId: string) {
  const adminUser = await requireAdmin();
  const admin = createAdminClient();

  // Get all active subscribers with scores
  const { data: subscribers } = await admin
    .from('subscriptions')
    .select('user_id')
    .eq('status', 'active');

  if (!subscribers || subscribers.length === 0) throw new Error('No active subscribers');

  // Get scores for each subscriber and create entries
  for (const sub of subscribers) {
    const { data: scores } = await admin
      .from('scores')
      .select('score')
      .eq('user_id', sub.user_id)
      .order('played_date', { ascending: false })
      .limit(5);

    if (scores && scores.length > 0) {
      const entryScores = scores.map(s => s.score);
      await admin.from('draw_entries').insert({
        draw_id: drawId,
        user_id: sub.user_id,
        entry_scores: entryScores,
      });
    }
  }

  // Update draw status
  await admin.from('draws').update({ status: 'simulated' }).eq('id', drawId);

  await admin.from('admin_logs').insert({
    admin_id: adminUser.id,
    action: 'simulate_draw',
    entity_type: 'draw',
    entity_id: drawId,
  });

  revalidatePath('/admin/draws');
  return { success: true };
}

export async function runDraw(drawId: string) {
  const adminUser = await requireAdmin();
  const admin = createAdminClient();

  // 1. Get the draw and its entries
  const { data: draw } = await admin.from('draws').select('*').eq('id', drawId).single();
  if (!draw) throw new Error('Draw not found');

  const { data: entries } = await admin
    .from('draw_entries')
    .select('*')
    .eq('draw_id', drawId);

  if (!entries || entries.length === 0) throw new Error('No entries for this draw. Run simulation first.');

  // 2. Generate 5 random winning numbers (1-45)
  const winningNumbers: number[] = [];
  while (winningNumbers.length < 5) {
    const num = Math.floor(Math.random() * 45) + 1;
    if (!winningNumbers.includes(num)) winningNumbers.push(num);
  }
  winningNumbers.sort((a, b) => a - b);

  // 3. Check each entry for matches
  const results: { entryId: string; userId: string; matches: number; matchType: string }[] = [];

  for (const entry of entries) {
    const entryScores: number[] = entry.entry_scores || [];
    const matchCount = entryScores.filter(s => winningNumbers.includes(s)).length;

    if (matchCount >= 3) {
      const matchType = matchCount >= 5 ? '5-match' : matchCount >= 4 ? '4-match' : '3-match';
      results.push({
        entryId: entry.id,
        userId: entry.user_id,
        matches: matchCount,
        matchType,
      });
    }
  }

  // 4. Calculate prize distributions
  const jackpotPool = Number(draw.jackpot_pool) + Number(draw.jackpot_rollover || 0);
  const fourMatchPool = Number(draw.four_match_pool);
  const threeMatchPool = Number(draw.three_match_pool);

  const fiveMatchWinners = results.filter(r => r.matchType === '5-match');
  const fourMatchWinners = results.filter(r => r.matchType === '4-match');
  const threeMatchWinners = results.filter(r => r.matchType === '3-match');

  let jackpotRollover = 0;

  // Distribute prizes
  if (fiveMatchWinners.length > 0) {
    const prizeEach = jackpotPool / fiveMatchWinners.length;
    for (const winner of fiveMatchWinners) {
      await admin.from('winnings').insert({
        draw_id: drawId,
        user_id: winner.userId,
        draw_entry_id: winner.entryId,
        match_type: '5-match',
        amount: prizeEach,
        verification_status: 'pending',
        payment_status: 'pending',
      });
    }
  } else {
    // Jackpot rolls over
    jackpotRollover = jackpotPool;
  }

  if (fourMatchWinners.length > 0) {
    const prizeEach = fourMatchPool / fourMatchWinners.length;
    for (const winner of fourMatchWinners) {
      await admin.from('winnings').insert({
        draw_id: drawId,
        user_id: winner.userId,
        draw_entry_id: winner.entryId,
        match_type: '4-match',
        amount: prizeEach,
        verification_status: 'pending',
        payment_status: 'pending',
      });
    }
  }

  if (threeMatchWinners.length > 0) {
    const prizeEach = threeMatchPool / threeMatchWinners.length;
    for (const winner of threeMatchWinners) {
      await admin.from('winnings').insert({
        draw_id: drawId,
        user_id: winner.userId,
        draw_entry_id: winner.entryId,
        match_type: '3-match',
        amount: prizeEach,
        verification_status: 'pending',
        payment_status: 'pending',
      });
    }
  }

  // 5. Update the draw with results
  await admin.from('draws').update({
    status: 'published',
    published_at: new Date().toISOString(),
    jackpot_rollover: jackpotRollover,
  }).eq('id', drawId);

  await admin.from('admin_logs').insert({
    admin_id: adminUser.id,
    action: 'run_draw',
    entity_type: 'draw',
    entity_id: drawId,
    details: {
      winning_numbers: winningNumbers,
      five_match_count: fiveMatchWinners.length,
      four_match_count: fourMatchWinners.length,
      three_match_count: threeMatchWinners.length,
      jackpot_rolled_over: fiveMatchWinners.length === 0,
      jackpot_rollover: jackpotRollover,
    },
  });

  revalidatePath('/admin/draws');
  revalidatePath('/admin/winners');
  revalidatePath('/draws');
  revalidatePath('/winnings');

  return {
    success: true,
    winningNumbers,
    fiveMatchCount: fiveMatchWinners.length,
    fourMatchCount: fourMatchWinners.length,
    threeMatchCount: threeMatchWinners.length,
    jackpotRolledOver: fiveMatchWinners.length === 0,
  };
}


export async function publishDraw(drawId: string) {
  const adminUser = await requireAdmin();
  const admin = createAdminClient();

  await admin.from('draws').update({
    status: 'published',
    published_at: new Date().toISOString(),
  }).eq('id', drawId);

  await admin.from('admin_logs').insert({
    admin_id: adminUser.id,
    action: 'publish_draw',
    entity_type: 'draw',
    entity_id: drawId,
  });

  revalidatePath('/admin/draws');
  revalidatePath('/draws');
  return { success: true };
}

export async function getAllDraws() {
  await requireAdmin();
  const admin = createAdminClient();

  const { data, error } = await admin
    .from('draws')
    .select('*')
    .order('draw_date', { ascending: false });

  if (error) throw new Error(error.message);
  return data || [];
}

export async function getPendingWinners() {
  await requireAdmin();
  const admin = createAdminClient();

  const { data, error } = await admin
    .from('winnings')
    .select('*, profiles(full_name, email), draws(draw_date)')
    .eq('verification_status', 'pending')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data || [];
}

export async function verifyWinner(winningId: string, status: 'approved' | 'rejected', notes?: string) {
  const adminUser = await requireAdmin();
  const admin = createAdminClient();

  const updates: Record<string, unknown> = {
    verification_status: status,
    verified_at: new Date().toISOString(),
  };
  if (notes) updates.admin_notes = notes;
  if (status === 'approved') updates.payment_status = 'paid';

  const { error } = await admin
    .from('winnings')
    .update(updates)
    .eq('id', winningId);

  if (error) throw new Error(error.message);

  await admin.from('admin_logs').insert({
    admin_id: adminUser.id,
    action: `verify_winner_${status}`,
    entity_type: 'winning',
    entity_id: winningId,
    details: { notes },
  });

  revalidatePath('/admin/winners');
  return { success: true };
}

export async function getAllCharitiesAdmin() {
  await requireAdmin();
  const admin = createAdminClient();

  const { data, error } = await admin
    .from('charities')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data || [];
}

export async function createCharity(formData: FormData) {
  const adminUser = await requireAdmin();
  const admin = createAdminClient();

  const { data, error } = await admin.from('charities').insert({
    name: formData.get('name') as string,
    description: formData.get('description') as string,
    category: formData.get('category') as string,
    website_url: formData.get('website_url') as string || null,
    is_featured: formData.get('is_featured') === 'true',
    is_active: true,
  }).select().single();

  if (error) throw new Error(error.message);

  await admin.from('admin_logs').insert({
    admin_id: adminUser.id,
    action: 'create_charity',
    entity_type: 'charity',
    entity_id: data.id,
  });

  revalidatePath('/admin/charities');
  revalidatePath('/charities');
  return data;
}
