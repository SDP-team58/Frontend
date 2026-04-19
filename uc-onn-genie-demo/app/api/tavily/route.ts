import { tavily } from '@tavily/core'
import { NextRequest, NextResponse } from 'next/server'

interface TavilyArticleResult {
  title: string
  content: string
  url: string
}

interface TavilySearchResponse {
  results?: TavilyArticleResult[]
}

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json()

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 })
    }

    const client = tavily({ apiKey: process.env.TAVILY_API_KEY })
    const response = (await client.search(query)) as TavilySearchResponse

    const articles = (response.results ?? []).slice(0, 3).map((result) => ({
      title: result.title,
      content: result.content,
      url: result.url,
    }))

    return NextResponse.json({ articles })
  } catch (error) {
    console.error('Tavily API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch articles' },
      { status: 500 }
    )
  }
}
