"use client"

import { CAS_LOGIN } from "@/lib/config"

export default function LoginButton({ className }: { className?: string }) {
  const handleLogin = () => {
    const serviceUrl = `${window.location.origin}/api/cas`
    const redirectUrl = `${CAS_LOGIN}?service=${encodeURIComponent(serviceUrl)}`
    window.location.href = redirectUrl
  }

  return (
    <button
      onClick={handleLogin}
      className={className || "rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground hover:opacity-90"}
    >
      Log in
    </button>
  )
}
