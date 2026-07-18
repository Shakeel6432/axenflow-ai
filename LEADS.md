# AxenFlowAI Lead Database

Production-ready lead finder layered onto the existing Next.js marketing site.

## Features

- PostgreSQL + Prisma schema for businesses, locations, users, search history
- Instant search API with filters, sorting, pagination, and rate limiting
- Homepage + `/leads` search UI
- SEO pages for `/dentists`, `/dentists-in-miami`, `/roofers-in-texas`
- Dynamic sitemap for category/city/state routes
- Admin panel with CSV import, stats, and auth-protected routes
- NextAuth (Google + Email/password) scaffold

## Setup

1. Copy `.env.example` to `.env.local` and set `DATABASE_URL`, `AUTH_SECRET`.
2. Install dependencies: `npm install --legacy-peer-deps`
3. Push schema: `npm run db:push`
4. Generate client: `npm run db:generate`
5. Seed sample data + admin: `npm run db:seed`
6. Run: `npm run dev`

Admin login defaults:

- Email: `admin@axenflowai.com`
- Password: `Admin123!`

## API

- `GET /api/search`
- `GET /api/businesses`
- `GET /api/categories`
- `GET /api/countries`
- `GET /api/states?countryId=`
- `GET /api/cities?stateId=`
- `POST /api/admin/import` (ADMIN)
- `GET|PATCH|DELETE /api/admin/stats` (ADMIN)

## CSV columns

`business_name,category,website,phone,email,address,city,state,country,postal_code,latitude,longitude,rating,reviews_count,google_maps_url,source`

## Future-ready extension points

Services under `src/services` can grow into AI lead scoring, saved leads, export, subscriptions, and scraper ingestion without changing the public search contract.
