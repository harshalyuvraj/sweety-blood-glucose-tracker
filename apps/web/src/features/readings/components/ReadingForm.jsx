import { useState } from 'react';

const READING_SLOTS = [
  { value: 'morning', label: 'Morning' },
  { value: 'after_breakfast', label: 'After Breakfast' },
  { value: 'after_lunch', label: 'After Lunch' },
  { value: 'after_dinner', label: 'After Dinner' },
];

const getToday = () => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());

  const dateParts = Object.fromEntries(
    parts.map(({ type, value }) => [type, value]),
  );

  return `${dateParts.year}-${dateParts.month}-${dateParts.day}`;
};

function ReadingForm({ onSubmit, onCancel, initialData = null }) {
  const [formData, setFormData] = useState({
    reading_date: initialData?.reading_date || getToday(),
    slot: initialData?.slot || '',
    value: initialData?.value?.toString() || '',
  });

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    const glucoseValue = Number(formData.value);

    if (!Number.isInteger(glucoseValue) || glucoseValue < 40 || glucoseValue > 600) {
      setError('Enter a whole number between 40 and 600 mg/dL.');
      return;
    }

    if (!formData.slot) {
      setError('Please select a time slot.');
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit({
        reading_date: formData.reading_date,
        slot: formData.slot,
        value: glucoseValue,
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Unable to save the reading. Please try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label
          htmlFor="reading_date"
          className="mb-2 block text-sm font-medium text-slate-700"
        >
          Reading date
        </label>

        <input
          id="reading_date"
          name="reading_date"
          type="date"
          max={getToday()}
          required
          value={formData.reading_date}
          onChange={handleChange}
          className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
        />
      </div>

      <div>
        <label
          htmlFor="slot"
          className="mb-2 block text-sm font-medium text-slate-700"
        >
          Time slot
        </label>

        <select
          id="slot"
          name="slot"
          required
          value={formData.slot}
          onChange={handleChange}
          className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
        >
          <option value="" disabled>
            Select a time slot
          </option>

          {READING_SLOTS.map((slot) => (
            <option key={slot.value} value={slot.value}>
              {slot.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="value"
          className="mb-2 block text-sm font-medium text-slate-700"
        >
          Glucose level (mg/dL)
        </label>

        <input
          id="value"
          name="value"
          type="number"
          min="40"
          max="600"
          step="1"
          required
          value={formData.value}
          onChange={handleChange}
          placeholder="Enter glucose level"
          className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
        />

        <p className="mt-2 text-xs text-slate-500">
          Enter a whole number between 40 and 600.
        </p>
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
        >
          {error}
        </p>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Saving...' : initialData ? 'Update Reading' : 'Save Reading'}
        </button>
      </div>
    </form>
  );
}

export default ReadingForm;