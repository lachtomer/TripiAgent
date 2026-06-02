'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Loader2, Trash2 } from 'lucide-react';
import { useBankStore } from '@/stores/bankStore';
import { useTripStore } from '@/stores/tripStore';
import { useIsHydrated } from '@/hooks/useIsHydrated';
import { isBankAdminUser } from '@/lib/bankPermissions';
import { trackEvent } from '@/lib/analytics';
import type { ParsedPlace } from '@/lib/aiParser';

export default function BankPage() {
  const isHydrated = useIsHydrated();
  const storedPlaces = useBankStore((s) => s.places);
  const loadPlaces = useBankStore((s) => s.load);
  const removePlace = useBankStore((s) => s.remove);

  const users = useTripStore((s) => s.users);
  const currentUserId = useTripStore((s) => s.currentUser);
  const activeUser = users.find((u) => u.id === currentUserId);
  const canDelete = isBankAdminUser(activeUser);

  const [itinerary, setItinerary] = useState('');
  const [preview, setPreview] = useState<ParsedPlace[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingIndex, setDeletingIndex] = useState<number | null>(null);
  const hasTrackedPageView = useRef(false);

  const isBusy = isGenerating || isSubmitting || deletingIndex !== null;

  useEffect(() => {
    if (isHydrated) {
      void loadPlaces();
      if (!hasTrackedPageView.current) {
        trackEvent('bank_admin_page_viewed', {
          userId: activeUser?.id ?? null,
          userName: activeUser?.name ?? null,
          canDelete,
        });
        hasTrackedPageView.current = true;
      }
    }
  }, [isHydrated, loadPlaces, activeUser?.id, activeUser?.name, canDelete]);

  const generatePreview = async () => {
    if (isBusy || !itinerary.trim()) return;
    setError('');
    setIsGenerating(true);
    trackEvent('bank_generate_clicked', { inputLength: itinerary.trim().length });
    try {
      const res = await fetch('/api/bank/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: itinerary }),
      });
      if (!res.ok) {
        throw new Error('Parse failed');
      }
      const data = (await res.json()) as { places: ParsedPlace[] };
      setPreview(data.places ?? []);
      setSubmitted(false);
      trackEvent('bank_generate_succeeded', { parsedCount: data.places?.length ?? 0 });
    } catch (e) {
      console.error(e);
      setError('Failed to parse itinerary. Please try again.');
      trackEvent('bank_generate_failed', {
        message: e instanceof Error ? e.message : 'unknown',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const submitPreview = async () => {
    if (isBusy || preview.length === 0) return;
    setError('');
    setIsSubmitting(true);
    trackEvent('bank_submit_clicked', { previewCount: preview.length });
    try {
      await useBankStore.getState().add(preview);
      setSubmitted(true);
      setItinerary('');
      setPreview([]);
      trackEvent('bank_submit_succeeded', { submittedCount: preview.length });
    } catch (e) {
      console.error(e);
      setError('Failed to save entries. Please try again.');
      trackEvent('bank_submit_failed', {
        message: e instanceof Error ? e.message : 'unknown',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteStored = async (index: number) => {
    if (!canDelete || !activeUser?.name || isBusy) return;
    setError('');
    setDeletingIndex(index);
    trackEvent('bank_delete_clicked', { index });
    try {
      await removePlace(index, activeUser.name);
      trackEvent('bank_delete_succeeded', { index });
    } catch (e) {
      console.error(e);
      setError(
        e instanceof Error && e.message.includes('admins')
          ? 'Only Liran and Tomer can delete bank entries.'
          : 'Failed to delete entry. Please try again.'
      );
      trackEvent('bank_delete_failed', {
        index,
        message: e instanceof Error ? e.message : 'unknown',
      });
    } finally {
      setDeletingIndex(null);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 pb-24">
      {isHydrated && <span data-testid="bank-page-ready" className="sr-only">ready</span>}

      <div className="flex items-center justify-between gap-3 mb-4">
        <h1 className="text-2xl font-bold text-foreground">Bank – Itinerary Import</h1>
        <Link
          href="/"
          data-testid="bank-return-home"
          className="inline-flex items-center justify-center min-h-12 px-4 text-sm font-semibold text-[#006400] dark:text-[#86df72] rounded-xl border border-[#006400]/30 hover:bg-[#006400]/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006400] focus-visible:ring-offset-2"
          aria-label="Return to Home"
        >
          Return to Home
        </Link>
      </div>

      {!canDelete && isHydrated && (
        <p className="text-xs text-muted-foreground mb-3" data-testid="bank-delete-hint">
          Switch to Liran or Tomer to delete stored bank entries.
        </p>
      )}

      <label htmlFor="itinerary-input" className="block text-sm font-semibold mb-2 text-foreground">
        Itinerary text
      </label>
      <textarea
        id="itinerary-input"
        aria-label="Paste itinerary text to import bank entries"
        disabled={isBusy}
        className="w-full h-32 border border-outline-variant/40 rounded-xl p-3 mb-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006400] disabled:opacity-60"
        placeholder="Enter itinerary (e.g., Day 1 – Visit Sirmione; Day 2 – Explore Verona)"
        value={itinerary}
        onChange={(e) => setItinerary(e.target.value)}
      />

      <div className="flex flex-wrap gap-2 mb-4">
        <button
          type="button"
          id="generate-bank-btn"
          data-testid="generate-bank-btn"
          aria-label="Generate bank entries from itinerary text"
          aria-busy={isGenerating}
          disabled={isBusy || !itinerary.trim()}
          className="inline-flex items-center justify-center gap-2 min-h-12 min-w-[48px] px-4 py-2 bg-[#006400] hover:bg-[#004d00] text-white rounded-xl font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006400] focus-visible:ring-offset-2"
          onClick={() => void generatePreview()}
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              <span>Generating…</span>
            </>
          ) : (
            'Generate Bank Entries'
          )}
        </button>
        <button
          type="button"
          id="submit-bank-btn"
          data-testid="submit-bank-btn"
          aria-label="Submit preview entries to the bank API"
          aria-busy={isSubmitting}
          disabled={isBusy || preview.length === 0}
          className="inline-flex items-center justify-center gap-2 min-h-12 min-w-[48px] px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
          onClick={() => void submitPreview()}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              <span>Submitting…</span>
            </>
          ) : (
            'Submit'
          )}
        </button>
      </div>

      {error && (
        <p className="mt-2 text-red-600 text-sm" role="alert" data-testid="submit-error">
          {error}
        </p>
      )}

      <table
        id="preview-table"
        aria-label="Preview of parsed bank entries"
        className={`w-full border-collapse border border-outline-variant/40 rounded-lg overflow-hidden mb-6${preview.length === 0 ? ' hidden' : ''}`}
        aria-hidden={preview.length === 0}
      >
        <thead>
          <tr className="bg-muted/50">
            <th scope="col" className="border border-outline-variant/30 p-3 text-left text-sm font-semibold">
              Entry
            </th>
          </tr>
        </thead>
        <tbody>
          {preview.map((row, idx) => (
            <tr key={idx}>
              <td className="border border-outline-variant/30 p-3 text-sm" data-testid="preview-row">
                <div className="flex flex-wrap items-center gap-2">
                  <span>{row.name}</span>
                  {row.category && (
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-[#006400]/10 text-[#006400] dark:text-[#86df72] border border-[#006400]/20">
                      {row.category}
                    </span>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {submitted && (
        <p className="mt-3 mb-6 text-[#006400] dark:text-[#86df72] font-semibold text-sm" role="status" data-testid="submit-success">
          Submitted successfully!
        </p>
      )}

      <section aria-label="Stored bank entries">
        <h2 className="text-sm font-bold text-foreground mb-2">Stored bank entries ({storedPlaces.length})</h2>
        {storedPlaces.length === 0 ? (
          <p className="text-xs text-muted-foreground" data-testid="bank-stored-empty">
            No entries in the shared bank yet.
          </p>
        ) : (
          <ul className="space-y-2" data-testid="bank-stored-list">
            {storedPlaces.map((place, index) => (
              <li
                key={`${place.name}-${index}`}
                className="flex items-center justify-between gap-2 border border-outline-variant/30 rounded-xl p-3 text-sm"
                data-testid="bank-stored-row"
              >
                <span>{place.name}</span>
                {canDelete && (
                  <button
                    type="button"
                    data-testid={`bank-delete-btn-${index}`}
                    aria-label={`Delete ${place.name} from bank`}
                    disabled={isBusy}
                    className="inline-flex items-center justify-center min-h-12 min-w-12 text-destructive hover:bg-destructive/10 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive"
                    onClick={() => void handleDeleteStored(index)}
                  >
                    {deletingIndex === index ? (
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    ) : (
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    )}
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
