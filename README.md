# Ankita Sharma Services Store

A Next.js + Tailwind storefront for selling digital services with Supabase-backed products and a lightweight cart.

## Quick start

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## Environment

Copy `.env.example` to `.env.local` and fill:

- `NEXT_PUBLIC_SUPABASE_URL` – your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` – anon public key for reads
- `SUPABASE_SERVICE_ROLE_KEY` – **server-side only** key for admin actions

## Features

- **Landing splash** – Animated dissolve in/out (2s) → redirects to `/shop`
- **Product catalog** – Grid view with categories, badges, pricing
- **Product detail pages** – Full descriptions, features list, related products (`/shop/[id]`)
- **Search & filters** – Search bar, category dropdown, price range, sort options
- **Shopping cart** – Persistent (localStorage), dedicated cart page with quantity controls (`/cart`)
- **User authentication** – Sign up (first/last name, email optional, password), login, guest checkout
- **Admin panel** (`/admin`) – Password-protected CRUD for products (add/edit/delete)
- **Mobile-first responsive** – Sticky header with cart counter, hamburger menu, adaptive layouts

## Supabase schema (minimal)

```sql
create table if not exists products (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text not null,
  price numeric not null,
  badge text,
  image text,
  category text,
  full_description text,
  features text[],
  created_at timestamptz default now()
);

create table if not exists users (
  id uuid primary key default uuid_generate_v4(),
  email text not null,
  first_name text not null,
  last_name text not null,
  is_guest boolean default false,
  created_at timestamptz default now()
);

create table if not exists orders (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id),
  total numeric not null,
  status text default 'pending',
  created_at timestamptz default now()
);

create table if not exists order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references orders(id) on delete cascade,
  product_id uuid references products(id),
  quantity int not null,
  price numeric not null
);
```

Grant RLS as needed; allow anon select for public reads and restrict writes to service role.

## Deploy

- Vercel: set env vars above; build command `npm run build`.
- Supabase: ensure service role is configured as Vercel env secret (not exposed client-side).
