# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TaskFlowPro is a backend REST API for project/task management. Stack: Node.js + Express 5 + TypeScript + TypeORM + PostgreSQL. There is no frontend yet.

## Running the Project

The development environment runs via Docker Compose from the project root:

```bash
docker-compose up
```

Copy `.env.example` to `.env` and fill in the values before starting. The backend listens on port 3000; the DB on 5432.

`DB_HOST` must be `db` (the Docker service name) when running inside Docker. TypeORM schema synchronization is enabled automatically when `NODE_ENV=development`.

## Tests

Tests live inside `backend/src/**/__tests__/` and are run from the `backend/` directory:

```bash
cd backend
npm test                  # run all tests once
npm run test:watch        # re-run on file changes
npm run test:coverage     # with coverage report
```

To run a single test file:

```bash
cd backend
npx jest src/auth/__tests__/controller.test.ts
```

Tests use `jest.mock(...)` to mock the service layer; they do not hit a real database.

## Architecture

### Module structure

Every domain module follows the same layered pattern:

```
<module>/
  entity.ts      — TypeORM entity (maps to a DB table)
  repository.ts  — raw DB queries using AppDataSource
  service.ts     — business logic, calls repository + emits history events
  controller.ts  — HTTP request/response handling, calls service
  route.ts       — Express Router, wires middleware + controller
  dto.ts         — input/output type definitions (where needed)
```

Current modules: `auth`, `users`, `projects`, `project_members`, `tasks`, `task_comments`, `history`.

### Request lifecycle

```
route.ts  →  authMiddleware  →  requirePermission(resource, action)  →  controller  →  service  →  repository
```

- `authMiddleware` (`middleware/authHandler.ts`) verifies the JWT access token and attaches `req.user` (`JwtPayload`).
- `requirePermission` (`middleware/permissionHandler.ts`) calls `match_permission` (in `project_members/service.ts`) to check the caller's role against the RBAC table before the controller runs.

### Authentication

- Access token: short-lived JWT signed with `JWT_SECRET` (1 hour).
- Refresh token: longer-lived JWT signed with `REFRESH_SECRET`, stored in the DB (`RefreshToken` entity). `REFRESH_EXPIRE` is in days (default 30).
- Auth routes live under `/auth/v1` (register, login, refresh).

### RBAC (Role-Based Access Control)

Roles are defined in `project_members/entity.ts`: `owner`, `admin`, `editor`. The permission matrix is a plain object in `project_members/service.ts` (`permissions`). Each role lists allowed actions (`get`, `create`, `update`, `delete`, `change_status`) per resource (`project`, `members`, `tasks`, `comments`, `history`).

`requirePermission(resource, action)` is a middleware factory — compose it per route as shown in `tasks/route.ts`.

### History / audit log

Any mutation (create, update, delete) on projects, tasks, members, or comments must emit an audit event. The pattern is:

1. Before mutating, call `canManipulateRecords(table, id, fields)` to capture old values.
2. Perform the mutation.
3. Emit `historyEmitter.emit('record', { ... })` with `old_value` and `new_value` arrays.

`historyEmitter` is a Node.js `EventEmitter` (`history/emitter.ts`). The listener in `history/service.ts` writes the record to the `history` table asynchronously.

### Error handling

- Throw `AppError(statusCode, message)` for expected/operational errors — the global `errorHandler` middleware formats and returns these.
- Use the `asyncHandler` wrapper for async controllers so unhandled promise rejections propagate to `errorHandler`.
- In development, error responses include the stack trace.

### Database

`db.ts` exports a singleton `AppDataSource`. All entities must be registered there. Schema sync is automatic in development; for production, migrations should be used.
