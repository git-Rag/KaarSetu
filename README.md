# KaarSetu (कार सेतु)

**Work + Bridge** — KaarSetu is a skill-credentialing platform for India's 450 million informal workers. Workers are assessed by registered ITI instructors, earn non-transferable Soulbound Tokens (SBTs) as proof-of-skill, and employers scan QR codes to instantly verify credentials. It addresses fake certificates, gives migrant workers portable identity, and unlocks a 40–60% wage premium for verified workers.

This repository is a **fully functional mock** for hackathon demos: all blockchain activity is simulated (fake tx hashes, Polygonscan-style UI, realistic latency). No wallet or Polygon setup is required.

## Key Features

### 🎙️ AI Voice-Guided Practical Tests
KaarSetu supports a voice-first assessment flow tailored for informal workers:
*   **Accessibility**: Workers can speak naturally (Hindi/Hinglish/English) to describe practical tasks.
*   **Server-Side Transcription**: Uses `MediaRecorder` + Groq Whisper (`whisper-large-v3-turbo`) for robust, network-resilient transcription.
*   **AI Structuring**: Groq Llama-3.3-70b converts rough transcripts into structured, professional assessor notes, suggesting worker status and flagging safety concerns.
*   **Demo Mode**: Includes "Use Sample Voice Answer" for quick demos without microphone access.

### 🌐 Bilingual (English/Hindi) System
Full i18n support for the entire application:
*   **Dictionary-Based**: Fast, consistent static text translation using local dictionaries.
*   **Dynamic Translation**: Integrates Groq for translating AI-generated notes while preserving technical terminology.
*   **Language Switcher**: Persistent language preference (persists in cookies/localStorage) across all portals.

## Tech Stack

- Next.js 14 (App Router, TypeScript strict)
- Tailwind CSS + Framer Motion
- NextAuth.js v5 (credentials, role-aware JWT)
- Prisma + PostgreSQL
- AI: Groq SDK (Whisper for STT, Llama-3.3 for structured notes)
- QR: `react-qr-code`, `html5-qrcode`
- PDF: `@react-pdf/renderer`
- Charts: Recharts

## Setup

```bash
pnpm install
cp .env.example .env
# Edit DATABASE_URL, NEXTAUTH_SECRET, and AI_KEYS
```

### Environment Variables
```env
DATABASE_URL="postgresql://user:password@localhost:5432/kaarsetu"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
# AI
GROQ_API_KEY="..."
GROQ_MODEL="llama-3.3-70b-versatile"
GROQ_STT_MODEL="whisper-large-v3-turbo"
```

```bash
pnpm prisma migrate dev
pnpm prisma db seed
pnpm dev
```

## Demo Credentials

| Role | Name | Phone | Password |
|------|------|-------|----------|
| Admin | Arjun Sharma | 9999000000 | Admin@123 |
| Assessor | Dr. Pradeep Mishra | 9876543210 | Assess@123 |
| Worker | Ramesh Yadav | 9876540001 | Worker@123 |
| Employer | Vikram Singh | 9876541001 | Employer@123 |

**Live demo flow:** Assessor → search Anita Devi → complete checklist → Confirm & Mint SBT.

**Public verify:** `/verify/1042` (no login).

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│   Worker    │────▶│   Assessor   │────▶│  Mock Polygon   │
│  Dashboard  │     │  Assessment  │     │  SBT Mint API   │
└─────────────┘     └──────────────┘     └────────┬────────┘
       │                    │                      │
       │                    ▼                      ▼
       │            ┌──────────────┐     ┌─────────────────┐
       └───────────▶│  PostgreSQL  │◀────│  SBToken + QR   │
                    │   (Prisma)   │     │  /verify/:id    │
                    └──────────────┘     └────────┬────────┘
                           ▲                      │
                    ┌──────┴───────┐              │
                    │   Employer   │◀─────────────┘
                    │ Scan/Attest  │
                    └──────────────┘
```

## No Blockchain Setup Required

All on-chain activity is simulated in `lib/mock-chain.ts` for demo purposes. Production would integrate Polygon PoS and ERC-5192 soulbound contracts.
