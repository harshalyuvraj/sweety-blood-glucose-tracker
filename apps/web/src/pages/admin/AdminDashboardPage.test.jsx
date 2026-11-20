
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
  cleanup,
} from '@testing-library/react';
import AdminDashboardPage from './AdminDashboardPage.jsx';

const { adminServiceMock } = vi.hoisted(() => ({
  adminServiceMock: {
    getDashboardStats: vi.fn(),
    getRecentUsers: vi.fn(),
    getRecentActivity: vi.fn(),
  },
}));

vi.mock('../../features/admin/adminService.js', () => ({
  adminService: adminServiceMock,
}));

afterEach(() => {
  cleanup();
});

describe('AdminDashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    adminServiceMock.getDashboardStats.mockResolvedValue({
      total_users: 125,
      active_users: 42,
      new_registrations: 18,
    });

    adminServiceMock.getRecentUsers.mockResolvedValue([
      {
        id: 'user-1',
        name: 'Alice Johnson',
        email: 'alice@example.com',
        created_at: '2026-11-19T10:00:00.000Z',
        last_active_at: '2026-11-20T12:00:00.000Z',
      },
      {
        id: 'user-2',
        name: 'Bob Smith',
        email: 'bob@example.com',
        created_at: '2026-11-18T10:00:00.000Z',
        last_active_at: null,
      },
    ]);

    adminServiceMock.getRecentActivity.mockResolvedValue([
      {
        id: 'activity-1',
        event_type: 'user_registered',
        user_name: 'Alice Johnson',
        user_email: 'alice@example.com',
        created_at: '2026-11-19T10:00:00.000Z',
      },
      {
        id: 'activity-2',
        event_type: 'reading_created',
        user_name: 'Bob Smith',
        user_email: 'bob@example.com',
        created_at: '2026-11-19T11:00:00.000Z',
      },
    ]);
  });

  it('renders the dashboard statistics', async () => {
    render(<AdminDashboardPage />);

    expect(
      await screen.findByRole('heading', {
        name: /admin dashboard/i,
      }),
    ).toBeInTheDocument();

    expect(await screen.findByText('125')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('18')).toBeInTheDocument();

    expect(
      adminServiceMock.getDashboardStats,
    ).toHaveBeenCalledOnce();
  });

  it('renders recent registered users', async () => {
    render(<AdminDashboardPage />);

    expect(
      await screen.findAllByText('Alice Johnson'),
    ).toHaveLength(2);

    expect(
      screen.getAllByText('alice@example.com'),
    ).toHaveLength(2);

    expect(
      screen.getAllByText('Bob Smith'),
    ).toHaveLength(2);

    expect(
      screen.getAllByText('bob@example.com'),
    ).toHaveLength(2);

    expect(
      adminServiceMock.getRecentUsers,
    ).toHaveBeenCalledOnce();
  });

  it('renders recent activity with readable event descriptions', async () => {
    render(<AdminDashboardPage />);

    expect(
      await screen.findByText('Created an account'),
    ).toBeInTheDocument();

    expect(screen.getByText('Added a reading')).toBeInTheDocument();

    expect(
      adminServiceMock.getRecentActivity,
    ).toHaveBeenCalledOnce();
  });

  it('displays empty states when there are no users or activity', async () => {
    adminServiceMock.getRecentUsers.mockResolvedValue([]);
    adminServiceMock.getRecentActivity.mockResolvedValue([]);

    render(<AdminDashboardPage />);

    expect(
      await screen.findByText('No registered users yet.'),
    ).toBeInTheDocument();

    expect(
      screen.getByText('No activity recorded yet.'),
    ).toBeInTheDocument();
  });

  it('displays an error when an admin request fails', async () => {
    adminServiceMock.getDashboardStats.mockRejectedValue({
      response: {
        data: {
          message: 'Unable to fetch admin statistics.',
        },
      },
    });

    render(<AdminDashboardPage />);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Unable to fetch admin statistics.',
    );
  });

  it('displays loading indicators while requests are pending', () => {
    adminServiceMock.getDashboardStats.mockReturnValue(
      new Promise(() => {}),
    );

    adminServiceMock.getRecentUsers.mockReturnValue(
      new Promise(() => {}),
    );

    adminServiceMock.getRecentActivity.mockReturnValue(
      new Promise(() => {}),
    );

    render(<AdminDashboardPage />);

    expect(
      screen.getByText('Loading registered users...'),
    ).toBeInTheDocument();

    expect(
      screen.getByText('Loading recent activity...'),
    ).toBeInTheDocument();

    expect(screen.getAllByText('...')).toHaveLength(3);
  });
});
