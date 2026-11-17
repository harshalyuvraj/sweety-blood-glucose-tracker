import { useEffect, useState } from 'react';
import {
  Activity,
  CalendarDays,
  Plus,
  X,
  Pencil,
  Trash2,
} from 'lucide-react';
import { readingsService } from '../../features/readings/readingsService.js';
import ReadingForm from '../../features/readings/components/ReadingForm.jsx';

const SLOT_LABELS = {
  morning: 'Morning',
  after_breakfast: 'After Breakfast',
  after_lunch: 'After Lunch',
  after_dinner: 'After Dinner',
};

const SLOT_ORDER = {
  morning: 1,
  after_breakfast: 2,
  after_lunch: 3,
  after_dinner: 4,
};

function formatDate(dateString) {
  const [year, month, day] = dateString.split('-').map(Number);

  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Kolkata',
  }).format(new Date(year, month - 1, day));
}

function sortReadings(items) {
  return [...items].sort((a, b) => {
    const dateComparison = b.reading_date.localeCompare(a.reading_date);

    if (dateComparison !== 0) return dateComparison;

    return SLOT_ORDER[a.slot] - SLOT_ORDER[b.slot];
  });
}

function ReadingsPage() {
  const [readings, setReadings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReading, setSelectedReading] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    async function fetchReadings() {
      try {
        setIsLoading(true);
        setError('');

        const data = await readingsService.getAll();
        setReadings(data);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            'Unable to load your readings. Please try again.',
        );
      } finally {
        setIsLoading(false);
      }
    }

    fetchReadings();
  }, []);

  async function handleCreateReading(readingData) {
    const newReading = await readingsService.create(readingData);

    setReadings((previous) => sortReadings([...previous, newReading]));
    setIsModalOpen(false);
  }

  async function handleUpdateReading(readingData) {
    const updatedReading = await readingsService.update(
      selectedReading.id,
      readingData,
    );

    setReadings((previous) =>
      sortReadings(
        previous.map((reading) =>
          reading.id === updatedReading.id ? updatedReading : reading,
        ),
      ),
    );

    setIsModalOpen(false);
    setSelectedReading(null);
  }

  async function handleDeleteReading(reading) {
    const confirmed = window.confirm(
      `Are you sure you want to delete the ${SLOT_LABELS[reading.slot]} reading (${reading.value} mg/dL)?`,
    );

    if (!confirmed) return;

    try {
      setDeletingId(reading.id);
      setDeleteError('');

      await readingsService.remove(reading.id);

      setReadings((previous) =>
        previous.filter((item) => item.id !== reading.id),
      );
    } catch (err) {
      setDeleteError(
        err.response?.data?.message ||
          'Unable to delete the reading. Please try again.',
      );
    } finally {
      setDeletingId(null);
    }
  }

  function openCreateModal() {
    setSelectedReading(null);
    setIsModalOpen(true);
  }

  function openEditModal(reading) {
    setSelectedReading(reading);
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setSelectedReading(null);
  }

  return (
    <div className="space-y-8">
      {/* Page heading */}
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Blood Glucose Readings
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            View and manage your recorded blood glucose levels.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-800"
        >
          <Plus size={18} />
          Add Reading
        </button>
      </section>

      {/* Reading count */}
      <section className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <p className="text-sm font-medium text-slate-500">
            Total Recorded Readings
          </p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {isLoading ? '...' : readings.length}
          </p>
        </div>

        <div className="rounded-xl bg-brand-50 p-3 text-brand-700">
          <Activity size={24} />
        </div>
      </section>

      {/* Readings table */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {deleteError && (
          <div
            role="alert"
            className="m-5 rounded-xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700"
          >
            {deleteError}
          </div>
        )}
        <div className="border-b border-slate-200 px-6 py-5">
          <h2 className="font-semibold text-slate-900">
            All Readings
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Your glucose measurement history.
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="m-5 rounded-xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700"
          >
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="p-12 text-center text-sm text-slate-500">
            Loading your readings...
          </div>
        ) : error ? null : readings.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-16 text-center">
            <div className="mb-4 rounded-full bg-brand-50 p-4 text-brand-700">
              <CalendarDays size={28} />
            </div>
            <h3 className="font-semibold text-slate-900">
              No readings yet
            </h3>
            <p className="mt-2 max-w-sm text-sm text-slate-500">
              Your recorded glucose measurements will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Time Slot</th>
                  <th className="px-6 py-4 font-medium">Glucose Level</th>
                  <th className="px-6 py-4 text-right font-medium">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {readings.map((reading) => (
                  <tr
                    key={reading.id}
                    className="transition-colors hover:bg-slate-50"
                  >
                    <td className="whitespace-nowrap px-6 py-4 font-medium text-slate-700">
                      {formatDate(reading.reading_date)}
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-slate-600">
                      {SLOT_LABELS[reading.slot] || reading.slot}
                    </td>

                    <td className="whitespace-nowrap px-6 py-4">
                      <span className="font-semibold text-slate-900">
                        {reading.value}
                      </span>
                      <span className="ml-2 text-slate-500">
                        mg/dL
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(reading)}
                          aria-label={`Edit ${SLOT_LABELS[reading.slot]} reading`}
                          className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-brand-700 transition hover:bg-brand-50"
                        >
                          <Pencil size={16} />
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteReading(reading)}
                          disabled={deletingId === reading.id}
                          aria-label={`Delete ${SLOT_LABELS[reading.slot]} reading`}
                          className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Trash2 size={16} />
                          {deletingId === reading.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Create/Edit reading modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 py-8"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeModal();
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="reading-modal-title"
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
          >
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2
                  id="reading-modal-title"
                  className="text-xl font-bold text-slate-900"
                >
                  {selectedReading ? 'Edit Reading' : 'Add New Reading'}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {selectedReading
                    ? 'Update your blood glucose measurement.'
                    : 'Enter your blood glucose measurement.'}
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                aria-label="Close modal"
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            <ReadingForm
              key={selectedReading?.id || 'new-reading'}
              initialData={selectedReading}
              onSubmit={
                selectedReading ? handleUpdateReading : handleCreateReading
              }
              onCancel={closeModal}
            />
          </section>
        </div>
      )}
    </div>
  );
}

export default ReadingsPage;