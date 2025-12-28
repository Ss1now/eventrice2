# Rice Party (Frontend)

A **minimal + playful** Next.js (App Router) frontend for:
- **Events/Party Hub** (future / ongoing / past + ratings + host score)
- **Connection Hub** (posts + interested toggle + demo DM)
- **Rankings** (college + people leaderboard)
- **Profile** (verification toggle + stats)
- **Auth page** (Supabase OTP: email or phone)

## Quick start
```bash
npm install
cp .env.local.example .env.local
npm run dev
```

## Demo mode
By default, `NEXT_PUBLIC_DEMO_MODE=true` uses in-memory demo data and does not require Supabase.

## Hooking to Supabase (later)
- Add your Supabase URL + anon key in `.env.local`
- Replace the `lib/store.tsx` demo store with:
  - Supabase `auth.getSession()` for user
  - `events`, `hosts`, `connections`, `dms` tables
  - Realtime for DMs / reservations if desired
- Add RLS policies for Rice-only events and verified users
# eventrice2
