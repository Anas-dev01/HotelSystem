# Famous Haven — Cozy Bookings

Famous Haven is a hotel booking and property-management web application. Guests can create an account while reserving a room and then view their reservations. Hotel staff can manage rooms, reservations, guests, staff accounts, and reporting from a protected dashboard.

## Contents

- [System workflow](#system-workflow)
- [Features and access levels](#features-and-access-levels)
- [Local URLs](#local-urls)
- [Windows setup guide](#windows-setup-guide)
- [Supabase configuration](#supabase-configuration)
- [Commands](#commands)
- [Project structure](#project-structure)
- [Deployment](#deployment)

## System workflow

The application has two main user journeys: guest self-service booking and staff operations.

### Guest booking journey

```text
Open Book a Room
  → enter guest details and create a password
  → select an available room and stay dates
  → review the automatically calculated total
  → enter simulated card details
  → account is created in Supabase Auth
  → guest record and confirmed, paid booking are saved
  → guest signs in and views reservations in My Bookings
```

1. A guest opens the **Book a Room** page and enters their name, email, optional phone number, and password.
2. The guest selects a room whose current status is `available`, then selects a future check-in date and a later check-out date.
3. The system calculates the number of nights and total charge from the room’s nightly rate.
4. Card fields are a **simulated payment** step; no payment gateway or card data storage is implemented. A valid-looking card number, expiry date, and CVV are required before submission.
5. The app creates a Supabase Auth user with the `guest` role, creates (or associates) a guest record, and saves a booking with `confirmed` and `paid` statuses.
6. The guest can sign in at the Login page. Guest users are sent to **My Bookings**, where they can review current and previous reservations and make another reservation.

### Staff operations journey

```text
Staff login
  → role is read from profiles
  → receptionist: bookings, booked rooms, rooms, and guests
  → manager: all receptionist tools + dashboard, analytics, and staff management
  → create/manage bookings
  → check in (room becomes occupied)
  → check out (room becomes available)
  → reporting and live updates refresh automatically
```

1. A staff member signs in using the **Login** page.
2. The app reads the user’s role from the `profiles` table and routes them accordingly.
3. A **receptionist** can manage bookings, view booked rooms, manage room status/prices, and view guest records.
4. A **manager** also has access to the dashboard, analytics, and staff management.
5. In **Bookings**, staff can create a reservation for a new or existing guest, choose a room available for the selected dates, and calculate the stay total. Every booking is recorded as paid.
6. A confirmed reservation can be checked in. This changes the booking to `checked-in` and the room to `occupied`.
7. A checked-in reservation can be checked out. This changes the booking to `checked-out` and the room back to `available`.
8. Staff can generate a PDF receipt from a booking record.
9. Changes to `bookings` and `rooms` refresh relevant screens through Supabase Realtime.

### Data flow

```text
React + Vite interface
          ↕
Supabase Auth ─── user session and login
          ↕
Supabase Postgres ─── profiles, guests, rooms, bookings, reporting views
          ↕
Supabase Realtime ─── room and booking refresh notifications
```

## Features and access levels

| Area | What it does | Who can use it |
| --- | --- | --- |
| Book a Room | Creates a guest account and a paid, confirmed booking using a simulated card payment | Anyone |
| Login | Signs in guests and staff, then routes them by role | Anyone with an account |
| My Bookings | Shows the signed-in guest’s reservation history | Signed-in guest |
| Dashboard | Shows occupancy, current revenue, active bookings, guests, and charts | Manager |
| Bookings | Creates, searches, filters, checks in/out, and prints receipts for reservations | Receptionist or manager |
| Booked Rooms | Shows rooms that have booking history | Receptionist or manager |
| Rooms | Shows room inventory; supports creating rooms, adjusting price, and maintenance/availability status | Receptionist or manager |
| Guests | Shows guest profiles, booking history, and spending information | Receptionist or manager |
| Analytics | Shows revenue, occupancy, and top-customer insights | Manager |
| Staff Management | Lists staff, creates staff accounts, and removes other staff profiles | Manager |

## Local URLs

After running `npm run dev`, use these URLs. The configured development server runs on port **8080**.

| Page | Local URL | Access |
| --- | --- | --- |
| Book a room | [http://localhost:8080/book-room](http://localhost:8080/book-room) | Public |
| Login | [http://localhost:8080/login](http://localhost:8080/login) | Public |
| My Bookings | [http://localhost:8080/my-bookings](http://localhost:8080/my-bookings) | Signed-in guest |
| Staff dashboard | [http://localhost:8080/](http://localhost:8080/) | Signed-in staff; manager dashboard |
| Bookings | [http://localhost:8080/bookings](http://localhost:8080/bookings) | Receptionist or manager |
| Booked rooms | [http://localhost:8080/booked-rooms](http://localhost:8080/booked-rooms) | Receptionist or manager |
| Rooms | [http://localhost:8080/rooms](http://localhost:8080/rooms) | Receptionist or manager |
| Guests | [http://localhost:8080/guests](http://localhost:8080/guests) | Receptionist or manager |
| Analytics | [http://localhost:8080/analytics](http://localhost:8080/analytics) | Manager |
| Staff management | [http://localhost:8080/staff](http://localhost:8080/staff) | Manager |
| Register staff | [http://localhost:8080/register-staff](http://localhost:8080/register-staff) | Manager |

Protected pages redirect unauthenticated visitors to `/login`. Receptionists are redirected away from the dashboard and analytics page.

## Windows setup guide

Follow these steps on a Windows PC, starting from a new development environment.

### 1. Install Visual Studio Code

1. Download and install [Visual Studio Code](https://code.visualstudio.com/Download).
2. During installation, select **Add to PATH** and **Open with Code** if those options are offered.
3. Open VS Code after installation.

Recommended VS Code extensions:

- **ESLint** — displays code-quality issues.
- **Tailwind CSS IntelliSense** — assists with Tailwind class names.
- **Prettier - Code formatter** — optional formatting support.

### 2. Install Node.js

1. Download the current **LTS** release of [Node.js](https://nodejs.org/).
2. Run the installer and keep the default npm option enabled.
3. Close and reopen PowerShell, then verify the installation:

```powershell
node --version
npm --version
```

Node.js 18 or later is required. Node.js 20 LTS or newer is recommended.

### 3. Install Git (if you are cloning the project)

1. Download and install [Git for Windows](https://git-scm.com/download/win).
2. Open PowerShell and verify it:

```powershell
git --version
```

### 4. Download or clone the project

If the project is in a Git repository, clone it from PowerShell (replace the placeholder with the repository URL):

```powershell
git clone <repository-url>
cd cozy-bookings
```

If you received a ZIP file, extract it, open PowerShell in the extracted project folder, and continue from there.

### 5. Open the project in VS Code

From the project folder, run:

```powershell
code .
```

Or use VS Code’s **File → Open Folder…** menu and select the `cozy-bookings` folder.

### 6. Configure Supabase environment variables

1. Create a Supabase project at [Supabase](https://supabase.com/dashboard).
2. In Supabase, open **Project Settings → API**.
3. Copy the project URL and the public **anon** key.
4. In the project root, create a file named `.env` (not `.env.txt`) containing:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-public-anon-key
```

Do not commit `.env` to Git and never put a Supabase `service_role` key in this file.

### 7. Install project dependencies

Open the VS Code terminal with **Terminal → New Terminal**, then run:

```powershell
npm install
```

### 8. Start the application

In the same terminal, run:

```powershell
npm run dev
```

Open [http://localhost:8080/book-room](http://localhost:8080/book-room) to start the guest flow, or [http://localhost:8080/login](http://localhost:8080/login) to sign in as a configured staff member. Keep the terminal running while using the application; press `Ctrl+C` to stop the server.

### Common Windows issues

| Problem | What to do |
| --- | --- |
| `npm` or `node` is not recognized | Restart PowerShell/VS Code after installing Node.js. If it persists, reinstall Node.js and ensure **Add to PATH** is selected. |
| Port 8080 is already in use | Stop the other app using that port, or change `server.port` in `vite.config.ts`. |
| App reports missing Supabase credentials | Confirm `.env` is in the project root, has the exact `VITE_` variable names, and restart `npm run dev`. |
| Login works but data cannot load | Check the Supabase URL/key, database schema, RLS policies, and user profile/role record. |
| A page is blank after deployment | Configure the host to redirect unknown paths to `index.html` for React Router. |

## Supabase configuration

The frontend expects these objects in the `public` schema:

| Object | Purpose |
| --- | --- |
| `profiles` table | Maps an Auth user ID to `full_name` and a `role` of `manager`, `receptionist`, or `guest`. |
| `guests` table | Stores guest contact information. |
| `rooms` table | Stores room number, type, floor, nightly price, status, capacity, description, and amenities. |
| `bookings` table | Links a guest to a room and stores stay dates, booking status, payment status, total amount, and creation time. |
| `dashboard_stats` view | Supplies summary analytics metrics. |
| `monthly_revenue_stats` view | Supplies monthly revenue chart data. |

The application joins `bookings` to `guests` and `rooms`, so `bookings.guest_id` and `bookings.room_id` must reference those tables. It also relies on a `profiles.id` value matching `auth.users.id`.

### Required Supabase tasks

1. Create the tables and views above, including the required relationships.
2. Create a profile record for every Auth user. A database trigger on `auth.users` is the most reliable way to do this, assigning the role from user metadata when the user signs up.
3. Create at least one manager profile so a staff user can access the administration area.
4. Enable Realtime replication for the `rooms` and `bookings` tables.
5. Run [`supabase/booking_safety.sql`](supabase/booking_safety.sql) in **SQL Editor**. It makes every booking paid, prevents overlapping active bookings for the same room at database level, and gives signed-in staff full room-management access (including maintenance and room creation).
6. Add Row Level Security policies that permit only the intended users to read and change data. Test both guest and staff journeys after enabling RLS.

> **Important security note:** the client uses the public Supabase anon key only. Administrative Auth operations must be done in a secured server-side endpoint or Supabase Edge Function; never expose a service-role key in this React application. Role checks in the interface should be backed by database RLS policies.

### RLS and shared editing

Do not add an `anon`/public write policy just to make editing easy: that would allow any visitor to change or delete rooms and bookings. The supplied SQL instead allows **all authenticated staff** (profiles with role `manager` or `receptionist`) to create, update, and mark rooms for maintenance.

To give another employee edit access, create their Auth account, then set their `profiles.role` to `manager` or `receptionist`. Guest booking policies should be scoped to the signed-in guest's own records; do not use an unrestricted `for all using (true)` policy for bookings or guests.

## Commands

| Command | Description |
| --- | --- |
| `npm run dev` | Starts the Vite development server on port 8080. |
| `npm run build` | Creates a production build in `dist/`. |
| `npm run build:dev` | Creates a development-mode build. |
| `npm run preview` | Serves the production build locally. |
| `npm run lint` | Runs ESLint. |
| `npm test` | Runs the Vitest test suite once. |
| `npm run test:watch` | Runs tests in watch mode. |

## Tech stack

- React 18 and TypeScript
- Vite
- Tailwind CSS, shadcn/ui, and Radix UI
- React Router and TanStack Query
- Supabase Auth, Postgres, and Realtime
- Recharts for visual reporting
- jsPDF and jsPDF AutoTable for receipts
- Vitest and Testing Library

## Project structure

```text
src/
├── components/   # Shared layout, sidebar, UI components, and route protection
├── pages/        # Guest and staff pages
├── services/     # Supabase authentication and data operations
├── lib/          # Supabase client and shared utilities
├── utils/        # Currency formatting and PDF receipt generation
└── test/         # Vitest setup and tests
```

## Deployment

Run `npm run build` and deploy the generated `dist/` folder to a static host. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in the host’s build environment. Configure an SPA fallback/rewrite so routes such as `/book-room` and `/bookings` serve `index.html` when opened directly.
