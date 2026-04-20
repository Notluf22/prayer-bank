# Prayer Bank 🕊

A treasury of faith shared across the world. Deposit prayers, withdraw prayers, and gift them to others as beautiful gift cards.

## Features

- **Deposit** — Offer Hail Marys, Holy Rosary, Holy Mass, Novenas, and more. Earn credits for each prayer.
- **Withdraw** — Use credits to receive prayers from people around the world. You must deposit to withdraw.
- **Gift a prayer** — Withdraw a prayer and send it to someone as a gift card via email or shareable link.
- **Gift credits** — Send prayer credit bundles to friends as gift cards.
- **Redeem** — Enter a gift code to receive the prayer or credits sent to you.
- **No payment** — 100% free, powered entirely by faith.

## Tech Stack

| Service | Purpose | Cost |
|---------|---------|------|
| Next.js 14 | Frontend + API routes | Free |
| Supabase | Database + Auth + Realtime | Free tier |
| Vercel | Hosting + Deployment | Free tier |
| Resend | Gift card emails | Free tier (3000/mo) |

## Setup Guide

### 1. Clone and install

```bash
git clone https://github.com/YOURUSERNAME/prayer-bank.git
cd prayer-bank
npm install
```

### 2. Set up Supabase

1. Go to [supabase.com](https://supabase.com) and create a free project
2. In your Supabase dashboard → **SQL Editor** → paste and run the entire contents of `supabase/migrations/001_initial_schema.sql`
3. Go to **Authentication → Providers** → enable **Google** and **Email**
4. For Google: get OAuth credentials from [console.cloud.google.com](https://console.cloud.google.com) → paste Client ID + Secret into Supabase

### 3. Set up Resend (for gift card emails)

1. Go to [resend.com](https://resend.com) → create free account
2. Create an API key
3. Add your domain (or use the test domain for development)

### 4. Configure environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local` and fill in:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
RESEND_API_KEY=re_your_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Find your Supabase keys at: **Project Settings → API**

### 5. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 6. Deploy to Vercel

```bash
# Push to GitHub first
git add .
git commit -m "initial commit"
git push

# Then go to vercel.com → Import your GitHub repo → Deploy
# Add your environment variables in Vercel → Settings → Environment Variables
# Set NEXT_PUBLIC_APP_URL to your Vercel URL e.g. https://prayer-bank.vercel.app
```

## Project Structure

```
prayer-bank/
├── app/
│   ├── page.tsx              # Landing page
│   ├── layout.tsx            # Root layout
│   ├── auth/
│   │   ├── page.tsx          # Login page (Google + Magic Link)
│   │   └── callback/route.ts # Auth callback
│   ├── dashboard/
│   │   ├── layout.tsx        # Dashboard layout with NavBar
│   │   ├── page.tsx          # Dashboard home
│   │   ├── deposit/page.tsx  # Deposit a prayer
│   │   ├── withdraw/page.tsx # Withdraw / gift a prayer
│   │   ├── gift/page.tsx     # Gift credit bundles
│   │   └── redeem/page.tsx   # Redeem a gift card
│   ├── gift/[code]/page.tsx  # Public gift card view (no login needed)
│   └── api/
│       ├── deposit/route.ts  # POST /api/deposit
│       ├── withdraw/route.ts # POST /api/withdraw
│       ├── gift/route.ts     # POST /api/gift
│       └── redeem/route.ts   # POST /api/redeem
├── components/
│   ├── NavBar.tsx            # Top navigation bar
│   └── GiftModal.tsx         # Modal for gifting a withdrawn prayer
├── lib/
│   ├── types.ts              # TypeScript types + prayer config
│   └── supabase/
│       ├── client.ts         # Browser Supabase client
│       └── server.ts         # Server Supabase client
├── styles/
│   └── globals.css           # Tailwind + custom gold styles
└── supabase/
    └── migrations/
        └── 001_initial_schema.sql  # Full DB setup — run in Supabase SQL Editor
```

## Prayer Credit Values

| Prayer | Credits Earned |
|--------|---------------|
| Hail Mary | 1 |
| Our Father | 1 |
| Divine Mercy Chaplet | 3 |
| Chaplet | 4 |
| Holy Rosary | 5 |
| Novena | 7 |
| Adoration | 8 |
| Holy Mass | 10 |

## Gift Card Types

**Type A — Credit Bundle**: Gift someone 5, 15, or 30 prayer credits. They can use credits to withdraw any prayer.

**Type B — Prayer Gift**: Withdraw a specific prayer (e.g. a Holy Rosary from Portugal) and gift that exact prayer to someone. The prayer text, intention, and origin country travel with the gift.

Both gift types generate a unique code (e.g. `GRACE-K7X2-9MQP`) and a shareable link (`/gift/GRACE-K7X2-9MQP`) that works without login.

## License

Free to use, share, and modify. Built with love for the global community of faith.
