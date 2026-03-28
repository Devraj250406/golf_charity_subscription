'use client';

import { useState, useEffect, useCallback } from 'react';
import { getAllDraws, createDraw, simulateDraw, runDraw } from '@/app/actions/admin';
import { formatDate, formatCurrency, cn } from '@/lib/utils';
import { Plus, Play, Globe, Loader2 } from 'lucide-react';
import type { Draw } from '@/types';

export default function AdminDrawsPage() {
  const [draws, setDraws] = useState<Draw[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [processing, setProcessing] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [drawDate, setDrawDate] = useState('');
  const [drawMode, setDrawMode] = useState<'random' | 'algorithm'>('random');

  const fetchDraws = useCallback(async () => {
    try {
      const data = await getAllDraws();
      setDraws(data);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchDraws(); }, [fetchDraws]);

  const handleCreate = async () => {
    if (!drawDate) return;
    setCreating(true);
    try {
      await createDraw(drawDate, drawMode);
      await fetchDraws();
      setShowForm(false);
      setDrawDate('');
    } catch (e) { console.error(e); }
    setCreating(false);
  };

  const handleSimulate = async (id: string) => {
    setProcessing(id);
    try { await simulateDraw(id); await fetchDraws(); } catch (e) { console.error(e); }
    setProcessing(null);
  };

  const handleRunDraw = async (id: string) => {
    setProcessing(id);
    try { 
      const result = await runDraw(id); 
      console.log('Draw run result:', result);
      await fetchDraws(); 
    } catch (e) { 
      console.error(e); 
    }
    setProcessing(null);
  };

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-display-sm text-on-surface mb-2">Draw Management</h1>
          <p className="text-body-md text-on-surface-variant">{draws.length} total draws</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary-gradient px-5 py-2.5 rounded-md text-body-sm font-medium flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Draw
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="bg-surface-container-lowest rounded-xl p-6 shadow-ambient mb-8 animate-fade-in">
          <h2 className="text-headline-sm text-on-surface mb-4">Create New Draw</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-label-md text-label uppercase block">Draw Date</label>
              <input type="date" value={drawDate} onChange={(e) => setDrawDate(e.target.value)} className="w-full px-4 py-3 rounded-md bg-surface ghost-border text-body-md text-on-surface" />
            </div>
            <div className="space-y-1.5">
              <label className="text-label-md text-label uppercase block">Mode</label>
              <select value={drawMode} onChange={(e) => setDrawMode(e.target.value as 'random' | 'algorithm')} className="w-full px-4 py-3 rounded-md bg-surface ghost-border text-body-md text-on-surface">
                <option value="random">Random</option>
                <option value="algorithm">Algorithm</option>
              </select>
            </div>
            <div className="flex items-end">
              <button onClick={handleCreate} disabled={creating} className="btn-primary-gradient px-6 py-3 rounded-md text-body-sm font-medium flex items-center gap-2 disabled:opacity-50">
                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Draw'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Draws List */}
      <div className="space-y-4">
        {draws.map((draw) => (
          <div key={draw.id} className="bg-surface-container-lowest rounded-xl p-6 shadow-ambient">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-body-lg text-on-surface font-medium">{formatDate(draw.draw_date)}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className={cn(
                    'px-2 py-0.5 rounded-md text-label-sm capitalize',
                    draw.status === 'published' ? 'bg-green-50 text-green-700' :
                    draw.status === 'simulated' ? 'bg-amber-50 text-amber-700' :
                    'bg-surface-container-low text-on-surface-variant'
                  )}>
                    {draw.status}
                  </span>
                  <span className="text-label-sm text-on-surface-variant capitalize">{draw.draw_mode}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {draw.status === 'pending' && (
                  <button onClick={() => handleSimulate(draw.id)} disabled={processing === draw.id} className="px-4 py-2 rounded-md bg-surface-container-low ghost-border text-body-sm text-on-surface hover:bg-surface-container-high transition-colors flex items-center gap-2 disabled:opacity-50">
                    {processing === draw.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />} Simulate
                  </button>
                )}
                {draw.status === 'simulated' && (
                  <button onClick={() => handleRunDraw(draw.id)} disabled={processing === draw.id} className="btn-primary-gradient px-4 py-2 rounded-md text-body-sm font-medium flex items-center gap-2 disabled:opacity-50">
                    {processing === draw.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />} Run Draw
                  </button>
                )}
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4 text-center">
              <div><p className="text-label-sm text-label uppercase">Total Pool</p><p className="text-body-md text-on-surface font-semibold">{formatCurrency(Number(draw.total_pool))}</p></div>
              <div><p className="text-label-sm text-label uppercase">Jackpot</p><p className="text-body-md text-on-surface font-semibold">{formatCurrency(Number(draw.jackpot_pool))}</p></div>
              <div><p className="text-label-sm text-label uppercase">4-Match</p><p className="text-body-md text-on-surface font-semibold">{formatCurrency(Number(draw.four_match_pool))}</p></div>
              <div><p className="text-label-sm text-label uppercase">3-Match</p><p className="text-body-md text-on-surface font-semibold">{formatCurrency(Number(draw.three_match_pool))}</p></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
