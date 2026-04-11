# HOME-CELL Webapp

HOME-CELL is a Next.js web application scaffolded to match the stack and conventions used in `WETH-TAX` (`wethax-assets`).

## Tech Stack

- Next.js 16 using the Pages Router
- React 19
- TypeScript 5
- Tailwind CSS 4
- Zustand for persisted client state (ready for slices)
- Axios for API requests (optional proxy pattern included)
- React Hook Form + Zod ready
- Shadcn UI conventions (`components.json`)
- ESLint (flat config) + Prettier

## Getting Started

### Prerequisites

- Node.js 18 or newer
- npm

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env.local` file in the project root and define (optional):

```env
NEXT_PUBLIC_API_BASE_URL=
```

If set, these values are used by `src/pages/api/proxy.ts` to forward requests.

### Run Locally

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

## Project Structure

```text
src/
├── components/
│   ├── common/           Shared app and website components
│   ├── layouts/          Route and page layout wrappers
│   ├── ui/               Reusable UI primitives
│   └── website/          Marketing site components
├── config/               Axios configuration and interceptors
├── hooks/                Custom React hooks
├── lib/                  Shared utilities and constants
├── pages/
│   ├── api/              Next.js API routes (proxy pattern included)
│   └── app/              In-app pages (scaffold only)
├── services/             API service modules grouped by domain (scaffold only)
├── store/                Zustand store and slices (scaffold)
├── styles/               Global styles (Tailwind v4 + CSS variables)
└── types/                Shared TypeScript types (scaffold)
```
