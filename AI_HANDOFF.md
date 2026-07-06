# AI Handoff & Project Context

## Project Overview
This project is a modern platform for Rotaract clubs and districts built with Next.js App Router (React), Tailwind CSS, Prisma, and PostgreSQL (Supabase).

## Recent Architectural Changes & Work Completed

### 1. Role Based Access Control (RBAC) Refactor
- **Change:** Migrated the `User.role` field from a single `String` to an array of Enums (`User.roles: Role[]`) in `prisma/schema.prisma` to allow users to hold multiple roles simultaneously (e.g., `["CLUB_ADMIN", "FINANCE_ADMIN"]`).
- **Implementation:** The `/api/admin/accounts` endpoints and the `accounts/new` UI have been updated to support multiple checkbox selections.
- **Gotcha:** If you see `ts(2561)` in VS Code complaining that `roles` does not exist on `UserCreateInput` and asking if you meant `role`, **ignore it or restart the TS server**. It is a known VS Code cache issue; the Prisma schema correctly defines `roles` and the app compiles successfully.

### 2. Unified Event & Series Creation
- **Change:** Merged the creation forms for `Event` (single occurrences) and `Initiative` (recurring series) into one unified UI at `/admin/events/new`.
- **Implementation:** A "Frequency" dropdown was added. If the user selects "Once", it creates an `Event`. If they select "Weekly", "Monthly", or "Daily", it automatically creates the parent `Initiative` and the first `Event` instance behind the scenes.

### 3. Caching & Real-Time UI Updates
- **Server Components Strategy:** To fix the issue where users had to manually refresh the browser to see updates after a mutation, `router.refresh()` was injected immediately after `router.push()` across all admin dashboard forms (`members`, `events`, `finance`, `gallery`, `announcements`). This triggers Next.js to flush the router cache and fetch fresh server HTML.
- **Client Components Strategy (React Query):** `@tanstack/react-query` was integrated. A `QueryProvider` was added to `src/app/providers.tsx` and wraps `src/app/layout.tsx`. The `AccountsAdmin` dashboard (`/admin/accounts`) was successfully migrated to `useQuery` and `useMutation` with instant cache invalidation as a blueprint for highly interactive client views.

## Primary Motives & Next Steps

1. **Complete Missing CRUD Operations:** Ensure full Create, Read, Update, and Delete capabilities are fully wired up across all admin modules, particularly for areas that might have been stubbed out.
2. **Finance Module Refinements (Treasurer Role):** 
   - A Treasurer needs the ability to record income and expenses. 
   - Ensure that the **edit and delete** operations for the Finance module are strictly restricted to users who possess the `FINANCE_ADMIN` role in their `User.roles` array.
3. **General UI/UX Polish:** The user values responsive, modern design (Tailwind) and smooth interactions without requiring hard page refreshes.

## Running the App
- `npm run dev` starts the local Next.js server.
- The `seed-superadmin.ts` script can be run via `npx tsx --env-file=.env seed-superadmin.ts` to restore the primary super admin account if the database is reset.
