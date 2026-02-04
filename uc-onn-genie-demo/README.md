# Genie Demo Frontend

## Overview

This is a modern React/Next.js frontend project, designed for rapid UI development using Radix UI, Tailwind CSS, and shadcn/ui components. It features a modular structure for scalable development and easy customization.

## Project Structure

- **app/**: Next.js app directory (routing, global styles, layout)
- **components/**: Reusable UI components (chat window, header, scenario panel, etc.)
- **components/ui/**: Radix UI and custom UI primitives
- **hooks/**: Custom React hooks
- **lib/**: Utility functions and scenario logic
- **public/**: Static assets
- **styles/**: Global CSS (Tailwind)

## Key Technologies

- **Next.js**: React framework for SSR/SSG
- **TypeScript**: Type safety
- **Tailwind CSS**: Utility-first styling
- **Radix UI**: Accessible UI primitives
- **shadcn/ui**: Component library

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- pnpm (recommended) or npm/yarn

### Run dev server locally

1. Install dependencies:
   ```sh
   pnpm install
   # or
   npm install
   # or
   yarn install
   ```
2. Start development server:
   ```sh
   pnpm dev
   # or
   npm run dev
   # or
   yarn dev
   ```
3. Visit [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```sh
pnpm build
pnpm start
```

## Customization & Development

- Add new pages/components in the `app/` and `components/` folders.
- Use Tailwind CSS for styling (`app/globals.css`).
- UI primitives are in `components/ui/` (Radix-based).
- Utility functions and scenarios in `lib/`.

## Linting

```sh
pnpm lint
```

## Configuration

- **next.config.mjs**: Next.js config
- **tsconfig.json**: TypeScript config
- **components.json**: shadcn/ui config

## Useful Scripts

- `pnpm dev` — Start dev server
- `pnpm build` — Build for production
- `pnpm start` — Start production server
- `pnpm lint` — Run ESLint

## License

This project is for demo/development purposes. Please check with the repository owner for licensing details.
