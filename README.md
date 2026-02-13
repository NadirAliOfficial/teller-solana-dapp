
# Teller Solana dApp

Teller is a Solana wallet analytics and chain statistics application.  
This repository contains the cleaned and structured codebase prepared for Solana dApp Store and Solana Mobile compliance (Phase 2).

## Purpose
- Track and analyze Solana wallet activity
- Display wallet metrics and insights in a user-friendly dashboard
- Provide analytics only (no custody, no trading, no signing transactions)

## Current Status
- Phase 2 setup completed
- Codebase cleaned and structured for Solana dApp development
- Solana wallet integration and compliance work in progress

## Tech Stack
- Vite
- React
- Tailwind CSS
- Solana Wallet Adapter

## Setup (Local Development)

### Prerequisites
- Node.js 18+
- npm or pnpm

### Installation
```bash
npm install
````

### Environment Variables

Create a `.env.local` file in the root directory if required for API access or external services.

```env
VITE_APP_ENV=development
```

### Run the App

```bash
npm run dev
```

### Build

```bash
npm run build
```

## Solana Wallet Support

* Phantom
* Solflare
  (additional wallets may be enabled as needed)

## Notes

* This app is analytics-only and does not execute transactions
* No private keys are stored
* Wallet connections are read-only for data retrieval

## Roadmap

* Finalize Solana Mobile dApp Store compliance
* Mobile UX validation
* Submission-ready build packaging

---

Maintained by Nadir Ali Khan and @theteamnak.com
