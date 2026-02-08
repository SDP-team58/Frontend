"use client"

import LoginButton from "@/components/login-button"

export default function PublicHome() {
  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <div className="max-w-2xl text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to GENIE</h1>
        <p className="mb-6 text-lg opacity-90">Explore UConn's Macroeconomic World Model. Please sign in to continue.</p>
        <div className="flex justify-center">
          <LoginButton className="rounded-lg bg-primary px-6 py-3 text-lg font-semibold text-primary-foreground hover:opacity-90" />
        </div>
      </div>
    </div>
  )
}
