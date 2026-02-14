# Backend API - Node.js + TypeScript + Supabase

A fully-featured backend API built with Node.js, TypeScript, and Supabase following functional programming principles and clean architecture.

## Features

- **Authentication Module**: Login, Signup, Forgot Password, Reset Password
- **User Profile Module**: Get and Update user profile
- **Todo Module**: CRUD operations with filtering, pagination, and drag-drop reordering
- **Transaction/Money Module**: Financial tracking with analytics
- **Admin Module**: User management and impersonation
- **Dashboard Module**: Aggregated statistics

## Tech Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Framework**: Express.js
- **Authentication**: JWT
- **Password Hashing**: bcrypt

## Architecture

The project follows a layered functional architecture:

```
src/
├── index.ts              # Application entry point
├── routes/               # Route definitions
├── controllers/          # Request/Response handlers
├── business/             # Business logic layer
├── common/               # Shared utilities and helpers
├── db/                   # Database queries (raw SQL)
└── types/                # TypeScript type definitions
```

### Layer Responsibilities

- **Routes**: Define API endpoints and map to controllers
- **Controllers**: Handle HTTP request/response, validate input
- **Business**: Contains all business logic and orchestrates database operations
- **Database**: Direct SQL queries with proper escaping

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```env
PORT=5000
NODE_ENV=development

# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRATION=24h

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
```

### 3. Setup Database

1. Create a Supabase project at https://supabase.com
2. Run the SQL schema from `database-schema.sql` in your Supabase SQL editor
3. The schema includes:
   - Users table
   - Todos table
   - Transactions table
   - Indexes for performance
   - `exec_sql` function for raw SQL queries

### 4. Run the Application

**Development mode:**
```bash
npm run dev
```

**Production build:**
```bash
npm run build
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token

### User Profile
- `GET /api/users/profile` - Get user profile (authenticated)
- `PUT /api/users/profile` - Update user profile (authenticated)

### Todos
- `GET /api/todos` - Get all todos with filtering and pagination
- `POST /api/todos` - Create new todo
- `PUT /api/todos/:id` - Update todo
- `DELETE /api/todos/:id` - Delete todo
- `PUT /api/todos/reorder` - Reorder todos (drag & drop)

### Transactions
- `GET /api/transactions` - Get all transactions with filtering
- `GET /api/transactions/summary` - Get income/expense summary
- `GET /api/transactions/analytics` - Get analytics data
- `POST /api/transactions` - Create new transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction

### Admin (Admin only)
- `GET /api/admin/users` - Get all users
- `DELETE /api/admin/users/:userId` - Delete user
- `POST /api/admin/impersonate/:userId` - Impersonate user

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

## Code Standards

### Type Safety
- No `any` types used
- All functions have explicit type annotations
- Custom types defined in `types/` directory

### Error Handling
- All async operations wrapped in try-catch blocks
- Consistent error response format
- Custom logger for all operations

### Security
- JWT authentication for protected routes
- Password hashing with bcrypt
- SQL injection prevention with proper escaping
- Rate limiting enabled
- CORS configuration

### Functional Programming
- Pure functions where possible
- No classes (functional approach)
- Function composition
- Minimal side effects

## Project Structure Details

### Types (`src/types/`)
- `user.types.ts` - User-related types
- `todo.types.ts` - Todo-related types
- `transaction.types.ts` - Transaction-related types
- `common.types.ts` - Shared types

### Database Layer (`src/db/`)
- Direct SQL queries (no ORM)
- Proper SQL escaping for security
- Connection pooling via Supabase client

### Business Layer (`src/business/`)
- Pure business logic
- Data validation
- Orchestrates database operations
- Independent of HTTP concerns

### Controllers (`src/controllers/`)
- HTTP request/response handling
- Input validation
- Calls business layer functions
- Error formatting

### Routes (`src/routes/`)
- Endpoint definitions
- Middleware application
- Route-level authentication

## Development

### Code Style
- Functional programming approach
- Kebab-case for file names
- Explicit type annotations
- Custom logger (no console.log)
- Try-catch for all async operations

### Testing
Run tests with:
```bash
npm test
```

## License

MIT
