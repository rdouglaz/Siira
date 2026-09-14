# Siira — Speak every day.

A production-ready language learning app built with Next.js 15, React 19, TypeScript, and Tailwind CSS v4.

## Features

- **Speech-to-Text**: Deepgram Flux (`flux-general-multi`) via secure token endpoint, VAD turn-taking, barge-in
- **Multi-Provider LLM**: Mistral (14B, 8B, Medium, 3B) + Gemini Flash + NVIDIA NIM with automatic fallback + cost tracking
- **Text-to-Speech**: Deepgram Aura-2 voices (Chinese/German/English) via secure proxy + on-device IndexedDB cache
- **Pronunciation**: STT-based scoring with tone feedback + practice UI in review
- **Spaced Repetition (SRS)**: SM-2 algorithm with Supabase persistence + vocabulary extracted from conversations
- **Scaffolding**: Stuck-state detection with progressive hints + Help mode
- **Authentication**: Magic Link email auth via Supabase
- **Daily Themes**: Auto-generated themes via Vercel Cron (6 AM UTC)
- **Conversations**: Persisted to Supabase, exportable
- **Progress**: Mastery distribution, streak calendar, SRS export/import
- **PWA Support**: Installable, offline-capable with service worker
- **Cross-platform**: Capacitor shell for iOS/Android (loads hosted web app)
- **Error Boundaries**: Graceful error handling with retry
- **Cost observability**: `/admin/costs` + `/api/llm/costs`

## Tech Stack

- **Framework**: Next.js 15 (App Router) + React 19 + TypeScript
- **Styling**: Tailwind CSS v4 + Framer Motion
- **Database/Auth**: Supabase (PostgreSQL + Auth)
- **AI**: Deepgram (STT/TTS) + Multi-provider LLM
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm (recommended) or npm
- Supabase account
- Deepgram account
- At least one LLM provider (Mistral, Gemini, or NVIDIA)

### Installation

```bash
# Clone and install
git clone <repo-url>
  cd siira-language-app
pnpm install

# Copy environment variables
cp .env.example .env.local

# Edit .env.local with your keys
# (see Environment Variables section below)

# Run development server
pnpm run dev
```

Open http://localhost:8443

### Environment Variables

Copy `.env.example` to `.env.local` and fill in:

#### Server-only (SECRET - never expose to client)
```
DEEPGRAM_API_KEY=          # Deepgram STT/TTS
MISTRAL_API_KEY=           # Mistral models
GEMINI_API_KEY=            # Google Gemini
NVIDIA_NIM_API_KEY=        # NVIDIA Nemotron
SUPABASE_SERVICE_ROLE_KEY= # Supabase admin (optional)
CRON_SECRET=               # Secure random string for cron protection
```

#### Client-side (PUBLIC - safe in browser)
```
NEXT_PUBLIC_SUPABASE_URL=       # https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=  # anon key
NEXT_PUBLIC_APP_URL=            # http://localhost:8443 (dev) or https://your-app.vercel.app
```

## Supabase Setup

1. Create a new Supabase project
2. Run the SQL from `supabase-schema.sql` in the SQL Editor
3. Enable Email Auth (Magic Link) in Authentication settings
4. Copy URL and anon key to `.env.local`

## LLM Provider Setup

At least one required:

- **Mistral** (recommended): Get key from console.mistral.ai
- **Gemini**: Get key from aistudio.google.com/apikey
- **NVIDIA NIM**: Get key from build.nvidia.com

The app automatically falls back through providers if one fails or rate-limits.

## Deepgram Setup

1. Create account at console.deepgram.com
2. Generate API key
3. Add to `DEEPGRAM_API_KEY` (server-side only!)
3. The client gets short-lived tokens via `/api/deepgram/token`

## Deployment to Vercel

### 1. Push to GitHub
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### 2. Import on Vercel
- Go to vercel.com/new
- Import your GitHub repo
- Vercel auto-detects Next.js

### 3. Configure Environment Variables
In Vercel dashboard → Settings → Environment Variables, add all variables from `.env.example`:
- Mark `DEEPGRAM_API_KEY`, `MISTRAL_API_KEY`, `GEMINI_API_KEY`, `NVIDIA_NIM_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `CRON_SECRET` as **Secret** (server-only)
- Mark `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_APP_URL` as **Plaintext** (client-safe)

### 4. Configure Cron
The `vercel.json` includes:
```json
{
  "crons": [{ "path": "/api/cron/generate-themes", "schedule": "0 6 * * *" }]
}
```
This runs daily at 6 AM UTC. The endpoint is protected by `CRON_SECRET`.

### 5. Deploy
Click Deploy. Vercel will:
- Build the app
- Configure the cron job
- Provide a production URL

## Supabase Dashboard (Post-Deploy)

1. Go to Authentication → Settings → URL Configuration
2. Set **Site URL** to your Vercel URL
3. Add **Redirect URLs**: `https://your-app.vercel.app/**`
4. Enable "Confirm email" if desired

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── llm/chat/route.ts       # Multi-provider LLM
│   │   ├── llm/explain/route.ts    # Explanations
│   │   ├── deepgram/token/route.ts # Secure STT token
│   │   ├── deepgram/tts/route.ts   # Secure TTS proxy
│   │   ├── themes/generate/route.ts # Theme generation
│   │   └── cron/generate-themes/   # Cron endpoint
│   ├── talk/                       # Talk screen
│   ├── themes/                     # Themes screen
│   ├── words/                      # Words/SRS screen
│   ├── layout.tsx                  # Root layout + PWA + SW
│   ├── providers.tsx               # Context providers + ErrorBoundary
│   └── not-found.tsx               # 404 page
├── components/
│   ├── TalkScreen.tsx              # Main conversation UI
│   ├── ThemesScreen.tsx            # Themes + daily theme
│   ├── WordsScreen.tsx             # SRS vocabulary
│   ├── SettingsScreen.tsx          # Auth + preferences
│   ├── ErrorBoundary.tsx           # Error handling
│   ├── SWRegister.tsx              # Service worker registration
│   └── ...                         # UI components
├── context/
│   ├── AppContext.tsx              # Language, tabs, conversation
│   ├── AuthContext.tsx             # Supabase auth + profile
│   └── WordsContext.tsx            # SRS with Supabase sync
├── hooks/
│   ├── useSpeech.ts                # Deepgram STT (token-based)
│   ├── useTTS.ts                   # Deepgram TTS (proxy)
│   └── useTutor.ts                 # LLM chat
├── lib/
│   ├── llm/                        # Multi-provider LLM system
│   ├── speech/                     # Deepgram STT client
│   ├── tts/                        # Deepgram TTS client
│   ├── supabase/                   # Supabase clients + types
│   └── themes/                     # Theme generation prompts
├── data/                           # Static themes, words, conversations
└── types/                          # Shared types
```

## Key Security Features

- **Deepgram API key never exposed to client** - tokens fetched from `/api/deepgram/token`
- **TTS proxy** - `/api/deepgram/tts` keeps API key server-side
- **Cron protection** - `CRON_SECRET` required for theme generation
- **Supabase RLS** - users only access their own data
- **No client-side secrets** - all sensitive keys server-only

## Testing the Cron Locally

```bash
# Generate theme for Chinese
curl -X POST http://localhost:8443/api/themes/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CRON_SECRET" \
  -d '{"language": "zh", "difficulty": "Beginner"}'

# Trigger cron job
curl http://localhost:8443/api/cron/generate-themes \
  -H "Authorization: Bearer $CRON_SECRET"
```

## Scripts

```bash
pnpm run dev      # Development server (port 8443)
pnpm run build    # Production build
pnpm run start    # Production server
pnpm run format   # Code formatting (oxfmt)
```

## License

MIT License - feel free to use and modify.

---

Built with ❤️ for language learners everywhere.