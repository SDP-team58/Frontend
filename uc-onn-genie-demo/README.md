# Genie Demo Frontend

This is a modern React/Next.js project, designed for rapid UI development using Radix UI, Tailwind CSS, and shadcn/ui components. It features a modular structure for scalable development and easy customization.

## Project Structure

```
├─ app/                  # Next.js app directory (routing, global styles, layout)
   └─ api/               # Server-side routes
      └─ cas/            # CAS route
├─ components/           # Reusable UI components (chat window, header, scenario panel, etc)
   └─ ui/                # Radix UI and custom UI primitives
├─ hooks/                # Custom React hooks
├─ lib/                  # Utility functions and scenario logic
├─ public/               # Static assets
└─ styles/               # Global CSS (Tailwind)
```

## Useful Scripts

- `pnpm dev` — Start dev server
- `pnpm build` — Build for production
- `pnpm start` — Start production server
- `pnpm lint` — Run ESLint

## Running on VM

Everything should be installed, to get to run:

- ssh {NETID}@soc-sdp-58.grove.ad.uconn.edu
- cd /srv/shared/Frontend/uc-onn-genie-demo
- npx next dev -H 0.0.0.0 -p 3000
- To persist: npm run build [and then] nohup npx next dev -H 0.0.0.0 -p 3000 > output.log 2>&1 &
- Visit http://137.99.22.90:3000/

## Project Info

### CAS SSO (Server-side)

This repo includes a server-side CAS SSO integration using a Next.js Route Handler.

- Login button (client): `components/login-button.tsx` redirects the browser to the CAS `/login` endpoint with `service` set to `/api/cas` on the current origin.
- Callback (server): `app/api/cas/route.ts` validates the CAS `ticket` server-side via CAS `/serviceValidate` and extracts the username.
- Session: a signed JWT is issued and set as an HttpOnly cookie named `auth` (see `lib/auth.ts`).

Environment variables to set in your environment (e.g. `.env.local`):

```
JWT_SECRET=replace-with-a-strong-secret
```

Notes:

- Ticket validation is performed on the server only (no client-side validation).
- The cookie is HttpOnly and Secure in production; the token is signed using `JWT_SECRET`.
- If you want to protect routes server-side, use `lib/auth.ts` helpers to verify the cookie in route handlers or server components.

## License

This project is for demo/development purposes. Please check with the repository owner for licensing details.
