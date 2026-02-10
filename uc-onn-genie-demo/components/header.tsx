"use client";

import LogoutButton from "@/components/logout-button";

export default function Header({ user }: { user: any }) {

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

          <div className="flex items-center gap-4 text-sm opacity-90">
            <div>
              Signed in as <span className="font-semibold">{user.user}</span>
            </div>
            <LogoutButton />
          </div>
        </div>
      </div>
    </header>
  );
}
