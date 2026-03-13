# DealerOps

DealerOps is a production-style UK used car dealer DMS built with Next.js, Prisma, PostgreSQL, NextAuth, Tailwind, Zod, React Hook Form, TanStack Table, Recharts, CSV export, and PDF generation.

## Core Modules

- Authentication with role-based access (`ADMIN`, `MANAGER`, `SALES`, `AFTERSALES`)
- Dashboard KPI/analytics with charts
- Vehicle inventory with status + location tracking, documents/images, stock ageing, margin view
- Customer CRM with purchases, warranties, aftersales, communication timeline
- Deals pipeline with stage updates, compliance evidence, finance linking
- Finance providers and applications tracking
- Invoice generation + status management + PDF export
- Warranty creation + warranty certificate PDF
- Aftersales issue management with costs and evidence logs
- Vehicle location tracker
- Tasks board + linked entities
- Communication logging
- Reporting + CSV exports
- Settings + user administration
- Audit logs for key actions

## Stack

- Next.js 16 (App Router), TypeScript
- Tailwind CSS and shadcn-style UI components
- Prisma ORM + PostgreSQL
- NextAuth (credentials, self-host friendly)
- Zod + React Hook Form
- TanStack Table
- Recharts
- pdf-lib + papaparse

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure env:
```bash
cp .env.example .env
```

3. Run Prisma migration and seed:
```bash
npm run db:migrate
npm run db:seed
```

4. Start dev server:
```bash
npm run dev
```

Open `http://localhost:3000`.

## Demo Users

- `admin@dealerops.local` / `Password123!`
- `manager@dealerops.local` / `Password123!`
- `sales@dealerops.local` / `Password123!`
- `aftersales@dealerops.local` / `Password123!`

## Scripts

- `npm run dev` - start dev server
- `npm run build` - production build
- `npm run start` - run production server
- `npm run lint` - lint
- `npm run typecheck` - TypeScript checks
- `npm run db:migrate` - run Prisma migrations
- `npm run db:push` - push schema without migration files
- `npm run db:seed` - seed demo data

## Notes

- File uploads are stored under `public/uploads`.
- PDF exports are available under `/api/pdf/*` routes.
- CSV exports are available under `/api/reports/csv/*` routes.
- Deployment healthcheck is available at `/api/health` (checks DB + auth env presence).
