'use client';

import { useState, useEffect, useCallback } from 'react';
import { getAllCharitiesAdmin, createCharity } from '@/app/actions/admin';
import { Plus, Loader2, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Charity } from '@/types';

export default function AdminCharitiesPage() {
  const [charities, setCharities] = useState<Charity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchCharities = useCallback(async () => {
    try {
      const data = await getAllCharitiesAdmin();
      setCharities(data);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchCharities(); }, [fetchCharities]);

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    const formData = new FormData(e.currentTarget);
    try {
      await createCharity(formData);
      await fetchCharities();
      setShowForm(false);
    } catch (err) { console.error(err); }
    setSaving(false);
  };

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-display-sm text-on-surface mb-2">Charity Management</h1>
          <p className="text-body-md text-on-surface-variant">{charities.length} charities</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary-gradient px-5 py-2.5 rounded-md text-body-sm font-medium flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Charity
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-surface-container-lowest rounded-xl p-6 shadow-ambient mb-8 animate-fade-in">
          <h2 className="text-headline-sm text-on-surface mb-4">New Charity</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="space-y-1.5">
              <label className="text-label-md text-label uppercase block">Name</label>
              <input name="name" required className="w-full px-4 py-3 rounded-md bg-surface ghost-border text-body-md text-on-surface" />
            </div>
            <div className="space-y-1.5">
              <label className="text-label-md text-label uppercase block">Category</label>
              <input name="category" className="w-full px-4 py-3 rounded-md bg-surface ghost-border text-body-md text-on-surface" />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-label-md text-label uppercase block">Description</label>
              <textarea name="description" rows={3} className="w-full px-4 py-3 rounded-md bg-surface ghost-border text-body-md text-on-surface resize-none" />
            </div>
            <div className="space-y-1.5">
              <label className="text-label-md text-label uppercase block">Website URL</label>
              <input name="website_url" type="url" className="w-full px-4 py-3 rounded-md bg-surface ghost-border text-body-md text-on-surface" />
            </div>
            <div className="flex items-end gap-4">
              <label className="flex items-center gap-2">
                <input type="checkbox" name="is_featured" value="true" className="accent-primary" />
                <span className="text-body-sm text-on-surface">Featured</span>
              </label>
            </div>
          </div>
          <button type="submit" disabled={saving} className="btn-primary-gradient px-6 py-2.5 rounded-md text-body-sm font-medium flex items-center gap-2 disabled:opacity-50">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Charity'}
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {charities.map((charity) => (
          <div key={charity.id} className="bg-surface-container-lowest rounded-xl p-6 shadow-ambient">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-surface-container-low flex items-center justify-center">
                <Heart className="w-5 h-5 text-on-surface-variant" />
              </div>
              <div className="flex gap-2">
                {charity.is_featured && <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-label-sm">Featured</span>}
                <span className={cn('px-2 py-0.5 rounded-md text-label-sm', charity.is_active ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600')}>
                  {charity.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
            <h3 className="text-body-lg text-on-surface font-medium mb-2">{charity.name}</h3>
            <p className="text-body-sm text-on-surface-variant line-clamp-2 mb-3">{charity.description}</p>
            {charity.category && <span className="text-label-sm text-label uppercase">{charity.category}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
