'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { formatDate, formatCurrency } from '@/lib/utils';
import { ArrowLeft, Upload, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import type { Winning } from '@/types';

export default function WinningDetail({ params }: { params: { id: string } }) {
  const [winning, setWinning] = useState<Winning | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const router = useRouter();
  const supabase = createClient();

  const fetchWinning = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('winnings')
      .select('*, draws(draw_date, status)')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error(error);
      router.push('/winnings');
      return;
    }

    setWinning(data as any);
    setLoading(false);
  }, [params.id, supabase, router]);

  useEffect(() => {
    fetchWinning();
  }, [fetchWinning]);

  const handleUpload = async () => {
    if (!file || !winning) return;
    setUploading(true);
    setError('');
    setSuccess(false);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const fileExt = file.name.split('.').pop();
      const fileName = `${winning.id}-${Math.random()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      // Assuming 'proofs' bucket exists
      const { error: uploadError } = await supabase.storage
        .from('proofs')
        .upload(filePath, file);

      if (uploadError) {
        throw new Error(uploadError.message || 'Failed to upload file');
      }

      const { data: { publicUrl } } = supabase.storage
        .from('proofs')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('winnings')
        .update({ 
          proof_url: publicUrl,
          verification_status: 'pending' 
        })
        .eq('id', winning.id);

      if (updateError) throw updateError;

      setSuccess(true);
      await fetchWinning();
      setFile(null);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to upload proof. Ensure "proofs" bucket exists and is public.');
    } finally {
      setUploading(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!winning) return null;

  const requiresProof = winning.verification_status === 'pending' || winning.verification_status === 'rejected';

  return (
    <div>
      <div className="mb-8">
        <Link href="/winnings" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Winnings
        </Link>
        <h1 className="text-display-sm text-on-surface mb-2">Winning Proof</h1>
        <p className="text-body-md text-on-surface-variant">
          Upload verification documents so we can process your payout.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-surface-container-lowest flex flex-col rounded-xl p-8 shadow-ambient">
          <h2 className="text-headline-sm text-on-surface mb-6">Winning Details</h2>
          <div className="space-y-4">
            <div className="flex justify-between py-3 border-b border-surface-container-high/20">
              <span className="text-on-surface-variant">Draw Date</span>
              <span className="text-on-surface font-medium">{formatDate(winning.draws?.draw_date as string)}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-surface-container-high/20">
              <span className="text-on-surface-variant">Match Type</span>
              <span className="text-on-surface font-medium capitalize">{winning.match_type}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-surface-container-high/20">
              <span className="text-on-surface-variant">Prize Amount</span>
              <span className="text-on-surface font-semibold text-primary">{formatCurrency(winning.amount)}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-surface-container-high/20">
              <span className="text-on-surface-variant">Verification Status</span>
              <span className="capitalize font-medium">{winning.verification_status}</span>
            </div>
          </div>
        </div>

        <div className="bg-surface-container-lowest flex flex-col rounded-xl p-8 shadow-ambient">
          <h2 className="text-headline-sm text-on-surface mb-6">Upload Proof</h2>
          
          {winning.verification_status === 'approved' ? (
            <div className="flex flex-col items-center justify-center text-center p-6 h-full border-2 border-dashed border-green-500/20 rounded-xl bg-green-500/5">
              <CheckCircle2 className="w-12 h-12 text-green-500 mb-4" />
              <h3 className="text-headline-sm text-on-surface mb-2">Proof Approved</h3>
              <p className="text-body-sm text-on-surface-variant">Your winning verification is complete. Your payout is being processed.</p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col">
              {winning.verification_status === 'rejected' && (
                <div className="mb-6 p-4 rounded-md bg-error-container/20 flex gap-3 text-error">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p className="text-body-sm">Your previous proof was rejected. Please upload a clearer image of your scorecard or certificate.</p>
                </div>
              )}

              {winning.proof_url && winning.verification_status === 'pending' && (
                <div className="mb-6 p-4 rounded-md bg-primary-container/20 flex gap-3">
                  <span className="text-body-sm text-on-surface-variant">
                    Proof submitted successfully. We are reviewing your document. You can upload a new one below if needed.
                  </span>
                </div>
              )}

              {error && (
                <div className="mb-6 p-4 rounded-md bg-error-container/20 flex gap-3 text-error">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p className="text-body-sm">{error}</p>
                </div>
              )}

              {success && (
                <div className="mb-6 p-4 rounded-md bg-green-50 text-green-700 flex gap-3">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <p className="text-body-sm">Proof uploaded successfully! We'll review it shortly.</p>
                </div>
              )}

              <div className="flex-1 flex flex-col justify-center gap-4">
                <input
                  type="file"
                  id="proof-upload"
                  accept="image/jpeg,image/png,application/pdf"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
                
                <label
                  htmlFor="proof-upload"
                  className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-surface-container-high rounded-xl cursor-pointer hover:bg-surface-container-low/50 transition-colors"
                >
                  <Upload className="w-8 h-8 text-on-surface-variant mb-2" />
                  <p className="text-body-md text-on-surface font-medium">Click to select file</p>
                  <p className="text-label-sm text-on-surface-variant mt-1">JPG, PNG, or PDF (max 5MB)</p>
                </label>

                {file && (
                  <div className="flex items-center justify-between p-3 bg-surface-container-low rounded-lg">
                    <span className="text-body-sm truncate pr-4">{file.name}</span>
                    <button
                      onClick={() => setFile(null)}
                      className="text-label-sm text-error hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                )}

                <button
                  onClick={handleUpload}
                  disabled={!file || uploading}
                  className="btn-primary-gradient mt-4 w-full py-3 rounded-md text-body-md font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" /> Uploading...
                    </>
                  ) : (
                    'Submit Proof'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
