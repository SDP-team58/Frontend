type ChatMode = "baseline" | "counterfactual"

type ChatProxyRequest = {
  mode?: ChatMode
  user_message?: string
  counterfactual_text?: string
  date_range_start?: string
  date_range_end?: string
}

export async function POST(req: Request) {
  const backendBaseUrl = process.env.NEXT_API_BASE_URL

  if (!backendBaseUrl) {
    return Response.json(
      { error: "NEXT_API_BASE_URL is not configured." },
      { status: 500 },
    )
  }

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

  const upstream = await fetch(`${backendBaseUrl}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(upstreamBody),
    cache: "no-store",
    // @ts-expect-error — Node 18 fetch needs this to stream large bodies
    duplex: "half",
  })

  if (!upstream.ok || !upstream.body) {
    // Upstream failed before streaming started — return a plain JSON error
    // so the client can handle it without trying to parse an SSE stream.
    const errData = await upstream.json().catch(() => ({
      error: "Backend unreachable.",
    }))
    return Response.json(errData, { status: upstream.status })
  }

  // Proxy the raw SSE byte stream straight through to the browser.
  // No buffering, no JSON parsing — the client owns that responsibility.
  return new Response(upstream.body, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "X-Accel-Buffering": "no",
    },
  })
}
