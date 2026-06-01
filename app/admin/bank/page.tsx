// app/admin/bank/page.tsx

'use client';

import { useState } from 'react';

export default function BankPage() {
  const [itinerary, setItinerary] = useState('');
  const [preview, setPreview] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const generatePreview = () => {
    const rows = itinerary
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    setPreview(rows);
  };

  const submitPreview = async () => {
    try {
      const res = await fetch('/api/bank/places', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entries: preview }),
      });
      if (!res.ok) throw new Error('Network response was not ok');
      setSubmitted(true);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Bank – Itinerary Import</h1>
      <textarea
        id="itinerary-input"
        className="w-full h-32 border rounded p-2 mb-2"
        placeholder="Enter itinerary (e.g., Day 1 – Visit Sirmone; Day 2 – Explore Verona)"
        value={itinerary}
        onChange={(e) => setItinerary(e.target.value)}
      />
      <div className="flex gap-2 mb-4">
        <button
          className="px-4 py-2 bg-green-600 text-white rounded"
          onClick={generatePreview}
        >
          Generate Bank Entries
        </button>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded"
          onClick={submitPreview}
          disabled={preview.length === 0}
        >
          Submit
        </button>
      </div>
      {preview.length > 0 && (
        <table id="preview-table" className="w-full border-collapse border">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2 text-left">Entry</th>
            </tr>
          </thead>
          <tbody>
            {preview.map((row, idx) => (
              <tr key={idx}>
                <td className="border p-2" data-testid="preview-row">
                  {row}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {submitted && <p className="mt-2 text-green-600">Submitted successfully!</p>}
    </div>
  );
}
