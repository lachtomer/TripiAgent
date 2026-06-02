import React, { useState } from 'react';
import { useBankStore } from '@/stores/bankStore';
import { z } from 'zod';

// Zod schema for a bank place entry
const bankPlaceSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  category: z.string().optional(),
  description: z.string().optional(),
});

type BankPlaceInput = z.infer<typeof bankPlaceSchema>;

export default function BankImport() {
  const [formData, setFormData] = useState<BankPlaceInput>({ name: '' });
  const [error, setError] = useState<string | null>(null);
  const add = useBankStore((state) => state.add);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const result = bankPlaceSchema.safeParse(formData);
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }
    try {
      // API add expects an array of places
      await add([result.data]);
      setFormData({ name: '' }); // reset on success
    } catch {
      setError('Failed to save entry');
    }
  };

  return (
    <div className="p-4 bg-gray-800 rounded-md shadow-md max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-4 text-white">Add Bank Entry</h2>
      {error && <p className="text-red-500 mb-2" role="alert">{error}</p>}
      <form onSubmit={handleSubmit} className="flex flex-col space-y-3">
        <input
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Place name"
          className="p-2 rounded bg-gray-700 text-white"
          required
        />
        <input
          name="category"
          value={formData.category || ''}
          onChange={handleChange}
          placeholder="Category (optional)"
          className="p-2 rounded bg-gray-700 text-white"
        />
        <textarea
          name="description"
          value={formData.description || ''}
          onChange={handleChange}
          placeholder="Description (optional)"
          className="p-2 rounded bg-gray-700 text-white"
          rows={3}
          data-testid="bank-import-textarea"
        />
        <button
          type="submit"
          className="bg-[#006400] text-white py-2 rounded hover:bg-[#005000] transition"
          data-testid="bank-import-save-btn"
        >
          Save
        </button>
      </form>
    </div>
  );
}
