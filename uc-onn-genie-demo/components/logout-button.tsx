"use client"

export default function LogoutButton({ className }: { className?: string }) {
  const handleLogout = () => {
    // Navigate to server logout route which will clear the auth cookie and
    // redirect to CAS logout to terminate the SSO session.
    window.location.href = '/api/logout'
  }

  return (
    <button
      onClick={handleLogout}
      className={className || "ml-4 rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground hover:opacity-90"}
    >
      Log out
    </button>
  )
}
