# Entiti Badminton Ciamis — Web App

Step 1: Setup project + Auth Google (Supabase).

## Tech stack
- Next.js 16 (App Router) + TypeScript
- Tailwind CSS v4
- Supabase (Auth + Postgres)
- Vercel (hosting)

## Yang sudah jadi di step ini
- `/login` — halaman login, tombol "Lanjutkan dengan Google"
- `/auth/callback` — tukar OAuth code jadi session
- `/auth/signout` — logout
- `/beranda` — placeholder halaman terproteksi (harus login)
- `middleware.ts` — refresh session otomatis + proteksi route (redirect ke
  `/login` kalau belum login, cek role admin untuk `/admin/*`)
- `supabase/migrations/0000_init_schema.sql` — tabel `players` + RLS + trigger auto-buat profil
  saat user baru sign up

## Cara jalanin

### 1. Setup Supabase
1. Buka project Supabase kamu → **SQL Editor** → jalankan isi file
   `supabase/migrations/0000_init_schema.sql`.
2. Buka **Authentication → Providers → Google** → aktifkan.
3. Buka **Authentication → URL Configuration** → tambahkan Site URL &
   Redirect URL:
   - Dev: `http://localhost:3000/auth/callback`
   - Prod (nanti): `https://domain-kamu.vercel.app/auth/callback`

### 2. Setup Google Cloud OAuth
1. Buka [Google Cloud Console](https://console.cloud.google.com/) → buat
   project (atau pakai yang sudah ada) → **APIs & Services → Credentials**.
2. Buat **OAuth Client ID** tipe **Web application**.
3. Authorized redirect URIs, isi dengan URL callback dari Supabase (bentuknya
   `https://<project-ref>.supabase.co/auth/v1/callback`, ambil dari halaman
   provider Google di Supabase — biasanya sudah otomatis ditampilkan di sana).
4. Copy **Client ID** & **Client Secret** → paste ke halaman provider Google
   di Supabase.

### 3. Env variable
Copy `.env.local.example` jadi `.env.local`, isi dengan:
- `NEXT_PUBLIC_SUPABASE_URL` — dari Supabase → Settings → API
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — dari Supabase → Settings → API

### 4. Jalankan
```bash
npm install
npm run dev
```
Buka `http://localhost:3000` → otomatis redirect ke `/login`.

## Next step
- Bangun UI Beranda (pengumuman, dashboard, event mabar)
- Bangun Mabar (tab Mabar Aktif / My Mabar) + halaman detail mabar
- Bangun Profil (avatar + edit data pemain)
- Bangun panel Admin (Dashboard, Player CRUD, Mabar Event CRUD)
