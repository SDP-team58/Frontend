type ChatMode = "baseline" | "counterfactual"

type ChatProxyRequest = {
  mode?: ChatMode
  user_message?: string
  counterfactual_text?: string
  date_range_start?: string
  date_range_end?: string
}

function resolveBackendBaseUrl(req: Request) {
  const configured = process.env.NEXT_API_BASE_URL?.trim()
  if (configured) {
    return configured.replace(/\/+$/, "")
  }

  const requestUrl = new URL(req.url)
  const forwardedProto = req.headers.get("x-forwarded-proto")?.split(",")[0]?.trim()
  const forwardedHost = req.headers.get("x-forwarded-host")?.split(",")[0]?.trim()
  const host = forwardedHost || req.headers.get("host") || requestUrl.host
  const protocol = (forwardedProto || requestUrl.protocol).replace(/:$/, "")

  const backendUrl = new URL(`${protocol}://${host}`)
  backendUrl.port = "8000"
  backendUrl.pathname = ""
  backendUrl.search = ""
  backendUrl.hash = ""

  return backendUrl.toString().replace(/\/+$/, "")
}

export async function POST(req: Request) {
  const backendBaseUrl = resolveBackendBaseUrl(req)

  const body = (await req.json()) as ChatProxyRequest
  const mode: ChatMode = body.mode === "counterfactual" ? "counterfactual" : "baseline"
  const endpoint = mode === "counterfactual" ? "/chat/counterfactual" : "/chat"

  const upstreamBody =
    mode === "counterfactual"
      ? {
          user_message: body.user_message,
          counterfactual_text: body.counterfactual_text,
          date_range_start: body.date_range_start,
          date_range_end: body.date_range_end,
        }
      : {
          user_message: body.user_message,
          date_range_start: body.date_range_start,
          date_range_end: body.date_range_end,
        }

  const response = await fetch(`${backendBaseUrl}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(upstreamBody),
    cache: "no-store",
  })

  const data = await response.json().catch(() => ({
    error: "Failed to parse backend response.",
  }))

  return Response.json(data, { status: response.status })
}
