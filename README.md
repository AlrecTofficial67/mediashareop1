# SafelinkluX

**Secure Modern File Sharing & Mission Link Platform**

> Created by Alrect & AI Gemini

---

## Folder Structure

```
safelinklux/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (dashboard)/
│   │   └── dashboard/
│   │       ├── layout.tsx
│   │       └── page.tsx
│   ├── admin/
│   │   ├── login/page.tsx
│   │   └── dashboard/page.tsx
│   ├── api/
│   │   ├── auth/login/route.ts
│   │   ├── auth/register/route.ts
│   │   ├── auth/logout/route.ts
│   │   ├── files/upload/route.ts
│   │   ├── links/route.ts
│   │   ├── missions/verify/route.ts
│   │   └── admin/stats/route.ts
│   ├── f/[slug]/page.tsx        ← Public file page
│   ├── d/[slug]/page.tsx        ← Public link/redirect page
│   ├── upload/page.tsx
│   ├── layout.tsx
│   ├── page.tsx                 ← Landing page
│   └── globals.css
├── components/
│   └── mission/MissionGate.tsx
├── lib/
│   ├── db.ts
│   ├── auth.ts
│   ├── analytics.ts
│   ├── rate-limit.ts
│   ├── uploadthing.ts
│   └── utils.ts
├── models/index.ts
├── types/index.ts
├── middleware.ts
├── .env.example
├── next.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

---

## Setup (Local / Termux)

### 1. Install Node.js (Termux)
```bash
pkg update && pkg upgrade
pkg install nodejs-lts git
```

### 2. Clone & Install
```bash
git clone https://github.com/yourusername/safelinklux.git
cd safelinklux
npm install
```

### 3. Setup Environment
```bash
cp .env.example .env.local
nano .env.local
```

Fill in all values:
```
MONGODB_URI=          # MongoDB Atlas connection string
JWT_SECRET=           # Long random string (min 32 chars)
ADMIN_USER=           # Your admin username
ADMIN_PASSWORD=       # Your admin password
ADMIN_JWT_SECRET=     # Long random string for admin JWT
UPLOADTHING_SECRET=   # From uploadthing.com dashboard
UPLOADTHING_APP_ID=   # From uploadthing.com dashboard
NEXT_PUBLIC_BASE_URL= # Your domain or http://localhost:3000
```

### 4. Run Dev Server
```bash
npm run dev
```

---

## MongoDB Setup

1. Go to [mongodb.com/atlas](https://mongodb.com/atlas) → Create free cluster
2. Create database user with password
3. Whitelist IP: `0.0.0.0/0` (for Vercel)
4. Get connection string → paste into `MONGODB_URI`

---

## UploadThing Setup

1. Go to [uploadthing.com](https://uploadthing.com) → Sign up
2. Create new app
3. Copy `UPLOADTHING_SECRET` and `UPLOADTHING_APP_ID`
4. Add to `.env.local`

---

## Deploy to Vercel

```bash
npm install -g vercel
vercel login
vercel --prod
```

Or connect GitHub repo on [vercel.com](https://vercel.com) and add all env variables in the dashboard.

---

## Admin Panel

Admin route: `/admin/login` — credentials set via `ADMIN_USER` and `ADMIN_PASSWORD` env vars. Never hardcoded.

---

## Mission System

Files and links can have a mission gate. When enabled:
- User sees a countdown timer
- User must complete tasks (Telegram, YouTube, Instagram, custom links)
- User must pass human verification (math puzzle + click challenge)
- Only then they get the file URL or redirect

---

## Premium System

Upgrade users via MongoDB directly or add an admin UI endpoint:
```js
db.users.updateOne({ email: "user@example.com" }, { $set: { role: "premium", storageLimit: 2147483648 } })
```

---

## License

MIT — for personal and commercial use.
