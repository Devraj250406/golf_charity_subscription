'use client';

import { useState, useEffect, useCallback } from 'react';
import { Heart, CheckCircle2, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { Charity } from '@/types';
import { cn } from '@/lib/utils';

export default function CharityPage() {
  const [charities, setCharities] = useState<Charity[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [percentage, setPercentage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  const fetchData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [charitiesRes, profileRes] = await Promise.all([
      supabase.from('charities').select('*').eq('is_active', true).order('is_featured', { ascending: false }),
      supabase.from('profiles').select('charity_id, charity_percentage').eq('id', user.id).single(),
    ]);

    setCharities(charitiesRes.data || []);
    if (profileRes.data) {
      setSelectedId(profileRes.data.charity_id);
      setPercentage(profileRes.data.charity_percentage || 10);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('profiles').update({
      charity_id: selectedId,
      charity_percentage: Math.max(10, percentage),
      updated_at: new Date().toISOString(),
    }).eq('id', user.id);

    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-display-sm text-on-surface mb-2">Charitable Giving</h1>
        <p className="text-body-md text-on-surface-variant">
          Choose a charity and set your contribution percentage (minimum 10%).
        </p>
      </div>

      {/* Percentage Selector */}
      <div className="bg-surface-container-lowest rounded-xl p-6 shadow-ambient mb-8">
        <h2 className="text-headline-sm text-on-surface mb-4">Contribution Rate</h2>
        <div className="flex items-center gap-6">
          <input
            type="range"
            min={10}
            max={50}
            step={5}
            value={percentage}
            onChange={(e) => setPercentage(Number(e.target.value))}
            className="flex-1 accent-primary"
          />
          <span className="text-display-sm text-primary font-bold min-w-[4rem] text-right">{percentage}%</span>
        </div>
        <p className="text-body-sm text-on-surface-variant mt-2">
          {percentage}% of your monthly subscription will be donated to your chosen charity.
        </p>
      </div>

      {/* Charity Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
        {charities.map((charity) => (
          <button
            key={charity.id}
            onClick={() => setSelectedId(charity.id)}
            className={cn(
              'text-left p-6 rounded-xl transition-all duration-200 relative',
              selectedId === charity.id
                ? 'bg-primary/5 ring-2 ring-primary shadow-ambient-lg'
                : 'bg-surface-container-lowest shadow-ambient hover:shadow-ambient-lg hover:-translate-y-0.5'
            )}
          >
            {selectedId === charity.id && (
              <div className="absolute top-4 right-4">
                <CheckCircle2 className="w-6 h-6 text-primary" />
              </div>
            )}
            {charity.is_featured && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-label-sm mb-3">
                Featured
              </span>
            )}
            <div className="w-11 h-11 rounded-lg bg-surface-container-low flex items-center justify-center mb-4">
              <Heart className="w-5 h-5 text-on-surface-variant" />
            </div>
            <h3 className="text-body-lg text-on-surface font-medium mb-2">{charity.name}</h3>
            <p className="text-body-sm text-on-surface-variant line-clamp-3">{charity.description}</p>
            {charity.category && (
              <span className="inline-block mt-3 text-label-sm text-label uppercase">{charity.category}</span>
            )}
          </button>
        ))}
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={saving || !selectedId}
        className="btn-primary-gradient px-8 py-3.5 rounded-md text-body-md font-medium flex items-center gap-2 disabled:opacity-50"
      >
        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Heart className="w-5 h-5" />}
        Save Preferences
      </button>
    </div>
  );
}
