"use client";

import { CAS_LOGIN } from "@/lib/config";

export default function Header() {
  const handleLogin = () => {
    // Build the service callback URL on the client and redirect the browser
    // to CAS login. The CAS ticket validation happens server-side at
    // /api/cas (see app/api/cas/route.ts).
    const serviceUrl = `${window.location.origin}/api/cas`;
    const redirectUrl = `${CAS_LOGIN}?service=${encodeURIComponent(serviceUrl)}`;
    window.location.href = redirectUrl;
  };

  return (
    <header className="border-b border-border bg-primary text-primary-foreground">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight md:text-2xl">
              GENIE | UConn Macroeconomic World Model Demo
            </h1>
            <p className="mt-1 text-sm opacity-90">
              Static prototype – using canned examples only.
            </p>
          </div>

          <button
            onClick={handleLogin}
            className="rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground hover:opacity-90"
          >
            Log in
          </button>
        </div>
      </div>
    </header>
  );
}
