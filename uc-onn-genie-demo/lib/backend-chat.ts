import { NextResponse } from "next/server"

import { getServerUser } from "@/lib/getServerUser"

function backendBaseUrl(req: Request) {
  const configured =
    process.env.BACKEND_API_URL ||
    process.env.NEXT_PUBLIC_BACKEND_API_URL ||
    ""
  if (configured) {
    return configured.replace(/\/+$/, "")
  }

  const url = new URL(req.url)
  return `http://${url.hostname}:8000`
}

export async function proxyChatRequest(
  req: Request,
  path: "/chat" | "/chat/counterfactual",
) {
  const user = await getServerUser(req)
  if (!user) {
    return NextResponse.json({ detail: "Unauthenticated" }, { status: 401 })
  }

  const rawBody = await req.text()
  const baseUrl = backendBaseUrl(req)
  const target = `${baseUrl}${path}`

  let upstream: Response
  try {
    upstream = await fetch(target, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: rawBody,
      cache: "no-store",
    })
  } catch (error) {
    const reason = error instanceof Error ? error.message : "Unknown network error"
    return NextResponse.json(
      {
        detail: `Could not reach analysis backend at ${baseUrl}: ${reason}`,
      },
      { status: 502 },
    )
  }

  const contentType =
    upstream.headers.get("content-type") || "application/json; charset=utf-8"
  const text = await upstream.text()

  return new NextResponse(text, {
    status: upstream.status,
    headers: {
      "Content-Type": contentType,
    },
  })
}
