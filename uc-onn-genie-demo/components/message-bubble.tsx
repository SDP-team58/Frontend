interface Message {
  id: string
  role: "user" | "assistant"
  content: string
}

interface MessageBubbleProps {
  message: Message
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user"

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl rounded-lg px-4 py-3 text-sm md:text-base leading-relaxed ${
          isUser
            ? "bg-primary text-primary-foreground rounded-br-none"
            : "bg-secondary text-secondary-foreground rounded-bl-none"
        }`}
      >
        {isUser ? null : <div className="mb-1 font-semibold">GENIE</div>}
        <p className="text-balance">{message.content}</p>
      </div>
    </div>
  )
}
