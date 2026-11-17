# Sweety – Blood Glucose Tracker

Sweety is a full-stack blood glucose tracking application that helps users record their daily glucose readings, manage their reading history, and monitor their glucose levels through daily and monthly reports.

The application supports individual user accounts, secure authentication, input validation, and user-specific data access.

## Features

### Authentication
- User registration and login.
- Password hashing using bcrypt.
- JWT-based authentication.
- Protected application routes.
- User-specific data access.

### Blood Glucose Readings
- Create, view, update, and delete glucose readings.
- Four daily reading slots:
  - Morning
  - After Breakfast
  - After Lunch
  - After Dinner
- Reading values restricted to 40–600 mg/dL.
- Maximum one reading per slot per day.
- Future-dated readings are not allowed.

### Reports
- Daily glucose summary.
- Month-to-date summary.
- Previous-month summary.
- Average, minimum, maximum, and total reading count.
- Daily breakdown by reading slot.

### Additional Features
- Responsive React interface.
- Form validation and error handling.
- PostgreSQL database with relational constraints.
- Repeatable demo-data seed script.
- Automated frontend and backend tests.

## Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React 19, Vite 8 |
| Styling | Tailwind CSS 4 |
| Backend | Node.js, Express 5 |
| Database | PostgreSQL 17 |
| Authentication | JWT |
| Password Hashing | bcrypt |
| Validation | Zod |
| API Client | Axios |
| Routing | React Router |
| Testing | Vitest, Supertest, React Testing Library |
| Containerization | Docker Compose |
| Package Manager | pnpm |

## Project Structure

```text
sweety/
├── apps/
│   ├── api/
│   │   ├── src/
│   │   │   ├── config/
│   │   │   ├── middleware/
│   │   │   ├── modules/
│   │   │   │   ├── auth/
│   │   │   │   ├── readings/
│   │   │   │   └── reports/
│   │   │   ├── scripts/
│   │   │   ├── app.js
│   │   │   └── server.js
│   │   └── package.json
│   └── web/
│       ├── src/
│       │   ├── components/
│       │   ├── features/
│       │   ├── lib/
│       │   ├── pages/
│       │   └── App.jsx
│       └── package.json
├── database/
│   ├── migrations/
├── docs/
├── docker-compose.yml
├── package.json
├── pnpm-workspace.yaml
├── .env.example
└── README.md
```

## Prerequisites

Install the following before running the application:

- Node.js 22 or later.
- pnpm 11.
- Docker Desktop with Docker Compose.
- Git.

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/harshalyuvraj/sweety-blood-glucose-tracker.git
cd sweety-blood-glucose-tracker
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Configure environment variables

Create a local environment file:

```bash
cp .env.example .env
```

Update `.env` with your database password and a secure JWT secret.

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

DB_HOST=localhost
DB_PORT=5432
DB_NAME=sweety
DB_USER=sweety_user
DB_PASSWORD=your_database_password

JWT_SECRET=your_secure_jwt_secret
JWT_EXPIRES_IN=1d

SEED_DEMO_NAME=Sweety Demo
SEED_DEMO_EMAIL=demo@sweety.app
SEED_DEMO_PASSWORD=your_demo_password
```

Use a strong, randomly generated JWT secret and demo password. Never commit your actual `.env` file.

### 4. Start PostgreSQL

```bash
docker compose up -d postgres
```

Verify that the database container is running:

```bash
docker compose ps
```
> **Note:** The current Docker Compose configuration uses a WSL-specific host directory for PostgreSQL persistence. If you are running the project in another environment, update the PostgreSQL volume mapping in `docker-compose.yml` to a suitable local directory or Docker named volume.

### 5. Apply database migrations

Run the initial schema migration:

```bash
docker exec -i sweety-postgres psql -U sweety_user -d sweety < database/migrations/001_create_initial_schema.sql
```

This creates the users and readings tables, along with their constraints and indexes.

### 6. Seed demo data

```bash
pnpm --filter @sweety/api seed
```

The seed script creates a demo account and inserts sample readings covering the previous month and current month.

The script is safe to run repeatedly: existing demo-account data and readings are preserved.

### 7. Start the backend

Open a terminal:

```bash
pnpm dev:api
```

The API will be available at:

`http://localhost:5000`

### 8. Start the frontend

Open another terminal:

```bash
pnpm dev:web
```

The frontend will be available at:

`http://localhost:5173`

## API Endpoints

All endpoints return JSON responses.

### Authentication

| Method | Endpoint | Description | Authentication |
|---|---|---|---|
| POST | `/api/auth/register` | Register a new user | No |
| POST | `/api/auth/login` | Log in | No |

### Blood Glucose Readings

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/readings` | Create a reading |
| GET | `/api/readings` | Get all readings |
| GET | `/api/readings/:id` | Get a reading by ID |
| PUT | `/api/readings/:id` | Update a reading |
| DELETE | `/api/readings/:id` | Delete a reading |

All reading endpoints require authentication.

### Reports

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/reports/daily` | Get daily report |
| GET | `/api/reports/month-to-date` | Get current month report |
| GET | `/api/reports/previous-month` | Get previous month report |

All report endpoints require authentication.

The daily report accepts an optional `date` query parameter in `YYYY-MM-DD` format.

### Health Check

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Check API health |

## Testing

Run all project tests from the repository root:

```bash
pnpm test
```

Build the frontend:

```bash
pnpm --filter @sweety/web build
```

Run backend tests independently:

```bash
pnpm --filter @sweety/api test
```

Run frontend tests independently:

```bash
pnpm --filter @sweety/web test
```

## Demo Account

A demo account is created by the seed script.

| Field | Value |
|---|---|
| Email | `demo@sweety.app` |
| Password | The value configured in `SEED_DEMO_PASSWORD` in your local `.env` |

For security, demo credentials should be configured locally and should not contain private production credentials.

## Security and Data Integrity

- Passwords are hashed using bcrypt before storage.
- Protected endpoints require a valid JWT.
- Reading queries are scoped to the authenticated user.
- Database constraints prevent duplicate readings for the same user, date, and slot.
- Input validation is performed using Zod.
- Database queries use parameterized statements.
- User deletion cascades to associated readings.

## License

This project was developed as a full-stack application project.