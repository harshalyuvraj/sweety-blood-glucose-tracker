
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  render,
  screen,
  waitFor,
  cleanup,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ReadingForm from './ReadingForm.jsx';

afterEach(() => {
  cleanup();
});

describe('ReadingForm', () => {
  let onSubmit;
  let onCancel;

  beforeEach(() => {
    onSubmit = vi.fn().mockResolvedValue(undefined);
    onCancel = vi.fn();
  });

  it('renders all form fields', () => {
    render(<ReadingForm onSubmit={onSubmit} onCancel={onCancel} />);

    expect(screen.getByLabelText(/reading date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/time slot/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/glucose level/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /save reading/i }),
    ).toBeInTheDocument();
  });

  it('renders initial data when editing a reading', () => {
    const initialData = {
      reading_date: '2026-11-17',
      slot: 'morning',
      value: 115,
    };

    render(
      <ReadingForm
        initialData={initialData}
        onSubmit={onSubmit}
        onCancel={onCancel}
      />,
    );

    expect(screen.getByLabelText(/reading date/i)).toHaveValue('2026-11-17');
    expect(screen.getByLabelText(/time slot/i)).toHaveValue('morning');
    expect(screen.getByLabelText(/glucose level/i)).toHaveValue(115);
    expect(
      screen.getByRole('button', { name: /update reading/i }),
    ).toBeInTheDocument();
  });

  it('submits valid reading data', async () => {
    const user = userEvent.setup();

    render(<ReadingForm onSubmit={onSubmit} onCancel={onCancel} />);

    await user.selectOptions(
      screen.getByLabelText(/time slot/i),
      'morning',
    );

    const glucoseInput = screen.getByLabelText(/glucose level/i);
    await user.clear(glucoseInput);
    await user.type(glucoseInput, '120');

    await user.click(
      screen.getByRole('button', { name: /save reading/i }),
    );

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        reading_date: expect.any(String),
        slot: 'morning',
        value: 120,
      });
    });
  });

  it('rejects glucose values below 40', async () => {
    const user = userEvent.setup();

    render(<ReadingForm onSubmit={onSubmit} onCancel={onCancel} />);

    const glucoseInput = screen.getByLabelText(/glucose level/i);

    await user.clear(glucoseInput);
    await user.type(glucoseInput, '30');

    expect(glucoseInput).toBeInvalid();
    expect(glucoseInput.validity.rangeUnderflow).toBe(true);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('rejects decimal glucose values', async () => {
    const user = userEvent.setup();

    render(<ReadingForm onSubmit={onSubmit} onCancel={onCancel} />);

    const glucoseInput = screen.getByLabelText(/glucose level/i);

    await user.clear(glucoseInput);
    await user.type(glucoseInput, '120.5');

    expect(glucoseInput).toBeInvalid();
    expect(glucoseInput.validity.stepMismatch).toBe(true);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('displays an error when submission fails', async () => {
    const user = userEvent.setup();

    onSubmit.mockRejectedValue({
      response: {
        data: {
          message: 'A reading already exists for this date and time slot.',
        },
      },
    });

    render(<ReadingForm onSubmit={onSubmit} onCancel={onCancel} />);

    await user.selectOptions(
      screen.getByLabelText(/time slot/i),
      'morning',
    );

    const glucoseInput = screen.getByLabelText(/glucose level/i);
    await user.clear(glucoseInput);
    await user.type(glucoseInput, '120');

    await user.click(
      screen.getByRole('button', { name: /save reading/i }),
    );

    expect(await screen.findByRole('alert')).toHaveTextContent(
      /already exists/i,
    );
  });

  it('calls onCancel when Cancel is clicked', async () => {
    const user = userEvent.setup();

    render(<ReadingForm onSubmit={onSubmit} onCancel={onCancel} />);

    await user.click(
      screen.getByRole('button', { name: /cancel/i }),
    );

    expect(onCancel).toHaveBeenCalledOnce();
  });
});
