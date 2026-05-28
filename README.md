# KaarSetu (कार सेतु)

**Work + Bridge** — KaarSetu is a skill-credentialing platform for India's 450 million informal workers. Workers are assessed by registered ITI instructors, earn non-transferable Soulbound Tokens (SBTs) as proof-of-skill, and employers scan QR codes to instantly verify credentials. It addresses fake certificates, gives migrant workers portable identity, and unlocks a 40–60% wage premium for verified workers.

This repository is a **fully functional mock** for hackathon demos: all blockchain activity is simulated (fake tx hashes, Polygonscan-style UI, realistic latency). No wallet or Polygon setup is required.

## Tech Stack

- Next.js 14 (App Router, TypeScript strict)
- Tailwind CSS + Framer Motion
- NextAuth.js v5 (credentials, role-aware JWT)
- Prisma + PostgreSQL
- QR: `react-qr-code`, `html5-qrcode`
- PDF: `@react-pdf/renderer`
- Charts: Recharts

## Setup

```bash
pnpm install
cp .env.example .env
# Edit DATABASE_URL and NEXTAUTH_SECRET

pnpm prisma migrate dev
pnpm prisma db seed
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Demo Credentials

| Role | Name | Phone | Password |
|------|------|-------|----------|
| Admin | Arjun Sharma | 9999000000 | Admin@123 |
| Assessor | Dr. Pradeep Mishra | 9876543210 | Assess@123 |
| Assessor | Sunita Rao | 9876543211 | Assess@123 |
| Worker | Ramesh Yadav | 9876540001 | Worker@123 |
| Worker | Anita Devi (ready to mint) | 9876540004 | Worker@123 |
| Employer | Vikram Singh | 9876541001 | Employer@123 |
| Employer | Meera Joshi | 9876541002 | Employer@123 |

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
