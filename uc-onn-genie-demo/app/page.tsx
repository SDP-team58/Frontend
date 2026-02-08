import { cookies } from "next/headers"
import { verifyAuthToken } from "@/lib/auth"
import MainApp from "@/components/main-app"
import PublicHome from "@/components/public-home"

export default async function Page() {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth")?.value
  const user = token ? verifyAuthToken(token) : null

  if (user) {
    return <MainApp />
  }

  return <PublicHome />
}
