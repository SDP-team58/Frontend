import { NextResponse } from "next/server"
import { signAuthToken } from "@/lib/auth"
import { CAS_BASE } from "@/lib/config"

export async function GET(req: Request) {
  const url = new URL(req.url)
  const ticket = url.searchParams.get("ticket")

  if (!ticket) {
    return NextResponse.redirect(
      new URL(`${process.env.SITE_URL || "http://localhost:3000"}/?auth=missing_ticket`)
    )
  }

  const baseUrl = process.env.SITE_URL || "http://localhost:3000"
  const service = `${baseUrl}${url.pathname}`

  const validateUrl = `${CAS_BASE}/serviceValidate?service=${encodeURIComponent(
    service
  )}&ticket=${encodeURIComponent(ticket)}`

  let resText = ""
  try {
    const response = await fetch(validateUrl)
    resText = await response.text()
    if (!response.ok) {
      return NextResponse.redirect(
        new URL(`${baseUrl}/?auth=cas_status_${response.status}`)
      )
    }
  } catch (e) {
    return NextResponse.redirect(
      new URL(`${baseUrl}/?auth=error_fetching_cas`)
    )
  }

  const successBlockMatch = resText.match(
    /<cas:authenticationSuccess\b[^>]*>([\s\S]*?)<\/cas:authenticationSuccess>/i
  )
  if (!successBlockMatch) {
    return NextResponse.redirect(new URL(`${baseUrl}/?auth=invalid_ticket`))
  }

  const userMatch = successBlockMatch[1].match(/<cas:user[^>]*>([^<]+)<\/cas:user>/i)
  if (!userMatch) {
    return NextResponse.redirect(new URL(`${baseUrl}/?auth=invalid_ticket`))
  }

  const username = userMatch[1].trim()
  const token = signAuthToken({ user: username })

  const redirectRes = NextResponse.redirect(new URL(baseUrl))
  redirectRes.cookies.set("auth", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60,
  })

  return redirectRes
}
