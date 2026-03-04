export async function POST(req: Request) {
    const body = await req.json();
    
    const response = await fetch(`${process.env.NEXT_API_BASE_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });

    const data = await response.json();

    return Response.json(data);
}
