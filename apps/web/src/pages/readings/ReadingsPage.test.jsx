
import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
} from 'vitest';
import {
  render,
  screen,
  waitFor,
  cleanup,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ReadingsPage from './ReadingsPage.jsx';

const { readingsServiceMock } = vi.hoisted(() => ({
  readingsServiceMock: {
    getAll: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  },
}));

vi.mock('../../features/readings/readingsService.js', () => ({
  readingsService: readingsServiceMock,
}));

const sampleReadings = [
  {
    id: 'reading-1',
    reading_date: '2026-11-17',
    slot: 'after_breakfast',
    value: 150,
  },
  {
    id: 'reading-2',
    reading_date: '2026-11-16',
    slot: 'morning',
    value: 115,
  },
];

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('ReadingsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(window, 'confirm').mockReturnValue(true);

    readingsServiceMock.getAll.mockResolvedValue(sampleReadings);
    readingsServiceMock.create.mockResolvedValue({
      id: 'reading-3',
      reading_date: '2026-11-17',
      slot: 'morning',
      value: 120,
    });
    readingsServiceMock.update.mockResolvedValue({
      id: 'reading-1',
      reading_date: '2026-11-17',
      slot: 'after_breakfast',
      value: 160,
    });
    readingsServiceMock.remove.mockResolvedValue({
      success: true,
      message: 'Reading deleted successfully.',
    });
  });

  it('loads and displays readings', async () => {
    render(<ReadingsPage />);

    expect(
      await screen.findByRole('heading', {
        name: /blood glucose readings/i,
      }),
    ).toBeInTheDocument();

    expect(screen.getByText('After Breakfast')).toBeInTheDocument();
    expect(screen.getByText('150')).toBeInTheDocument();
    expect(screen.getByText('115')).toBeInTheDocument();

    expect(readingsServiceMock.getAll).toHaveBeenCalledOnce();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('displays an empty state when there are no readings', async () => {
    readingsServiceMock.getAll.mockResolvedValue([]);

    render(<ReadingsPage />);

    expect(
      await screen.findByText('No readings yet'),
    ).toBeInTheDocument();

    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('displays an error when loading readings fails', async () => {
    readingsServiceMock.getAll.mockRejectedValue({
      response: {
        data: {
          message: 'Unable to retrieve readings.',
        },
      },
    });

    render(<ReadingsPage />);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Unable to retrieve readings.',
    );
  });

  it('creates a new reading', async () => {
    const user = userEvent.setup();

    render(<ReadingsPage />);

    await screen.findByText('After Breakfast');

    await user.click(
      screen.getByRole('button', { name: /add reading/i }),
    );

    expect(
      screen.getByRole('dialog', { name: /add new reading/i }),
    ).toBeInTheDocument();

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
      expect(readingsServiceMock.create).toHaveBeenCalledWith({
        reading_date: expect.any(String),
        slot: 'morning',
        value: 120,
      });
    });

    expect(await screen.findByText('120')).toBeInTheDocument();

    expect(
      screen.queryByRole('dialog'),
    ).not.toBeInTheDocument();
  });

  it('updates an existing reading', async () => {
    const user = userEvent.setup();

    render(<ReadingsPage />);

    await screen.findByText('After Breakfast');

    await user.click(
      screen.getByRole('button', {
        name: /edit after breakfast reading/i,
      }),
    );

    expect(
      screen.getByRole('dialog', { name: /edit reading/i }),
    ).toBeInTheDocument();

    expect(screen.getByLabelText(/glucose level/i)).toHaveValue(150);

    const glucoseInput = screen.getByLabelText(/glucose level/i);
    await user.clear(glucoseInput);
    await user.type(glucoseInput, '160');

    await user.click(
      screen.getByRole('button', { name: /update reading/i }),
    );

    await waitFor(() => {
      expect(readingsServiceMock.update).toHaveBeenCalledWith(
        'reading-1',
        {
          reading_date: '2026-11-17',
          slot: 'after_breakfast',
          value: 160,
        },
      );
    });

    expect(await screen.findByText('160')).toBeInTheDocument();
  });

  it('deletes a reading after confirmation', async () => {
    const user = userEvent.setup();

    render(<ReadingsPage />);

    await screen.findByText('After Breakfast');

    await user.click(
      screen.getByRole('button', {
        name: /delete after breakfast reading/i,
      }),
    );

    expect(window.confirm).toHaveBeenCalledOnce();

    await waitFor(() => {
      expect(readingsServiceMock.remove).toHaveBeenCalledWith('reading-1');
    });

    expect(screen.queryByText('150')).not.toBeInTheDocument();
    expect(screen.getByText('115')).toBeInTheDocument();
  });

  it('does not delete a reading when confirmation is cancelled', async () => {
    const user = userEvent.setup();

    window.confirm.mockReturnValue(false);

    render(<ReadingsPage />);

    await screen.findByText('After Breakfast');

    await user.click(
      screen.getByRole('button', {
        name: /delete after breakfast reading/i,
      }),
    );

    expect(window.confirm).toHaveBeenCalledOnce();
    expect(readingsServiceMock.remove).not.toHaveBeenCalled();
    expect(screen.getByText('150')).toBeInTheDocument();
  });

  it('displays an error when deleting a reading fails', async () => {
    const user = userEvent.setup();

    readingsServiceMock.remove.mockRejectedValue({
      response: {
        data: {
          message: 'Unable to delete this reading.',
        },
      },
    });

    render(<ReadingsPage />);

    await screen.findByText('After Breakfast');

    await user.click(
      screen.getByRole('button', {
        name: /delete after breakfast reading/i,
      }),
    );

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Unable to delete this reading.',
    );

    expect(screen.getByText('150')).toBeInTheDocument();
  });
});
