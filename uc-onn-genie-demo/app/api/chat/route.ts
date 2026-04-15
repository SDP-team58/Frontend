import { proxyChatRequest } from "@/lib/backend-chat"

export async function POST(req: Request) {
  return proxyChatRequest(req, "/chat")
}
