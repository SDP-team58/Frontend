"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { scenarios } from "@/lib/scenarios"
import { ExternalLink, Loader2 } from "lucide-react"

interface Article {
  title: string
  content: string
  url: string
}

interface ArticleGroup {
  id: string
  date: string
  articles: Article[]
}

interface ScenarioPanelProps {
  onScenarioClick: (scenarioId: string) => void
  articleGroups?: ArticleGroup[]
}

interface FetchedArticle {
  title: string
  content: string
  url: string
}

export default function ScenarioPanel({ onScenarioClick, articleGroups = [] }: ScenarioPanelProps) {
  const [showArticlesDialog, setShowArticlesDialog] = useState(false)
  const [fetchedArticles, setFetchedArticles] = useState<FetchedArticle[]>([])
  const [isLoadingArticles, setIsLoadingArticles] = useState(false)

  const handleArticlesClick = async () => {
    setShowArticlesDialog(true)
    setIsLoadingArticles(true)
    
    try {
      const response = await fetch("/api/tavily", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: "economic articles from date",
        }),
      })

      if (!response.ok) throw new Error("Failed to fetch articles")
      
      const data = await response.json()
      setFetchedArticles(data.articles || [])
    } catch (error) {
      console.error("Error fetching articles:", error)
      setFetchedArticles([])
    } finally {
      setIsLoadingArticles(false)
    }
  }

  return (
    <aside className="hidden flex-shrink-0 md:block w-64 lg:w-80">
      <div className="h-full overflow-y-auto rounded-lg border border-border bg-card p-4 shadow-sm">
        <h2 className="mb-6 font-semibold text-card-foreground">Elements</h2>
        
        {/* Scenarios Section */}
        <div className="mb-6">
          <h3 className="mb-3 text-sm font-medium text-muted-foreground">Demo Scenarios</h3>
          <div className="space-y-3">
            {scenarios.map((scenario) => (
              <Button
                key={scenario.id}
                onClick={() => onScenarioClick(scenario.id)}
                className="w-full justify-start text-left"
                variant="outline"
              >
                <span className="truncate">{scenario.title}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Dynamic Articles Section */}
        {articleGroups.length > 0 && (
          <div className="mb-6">
            <h3 className="mb-3 text-sm font-medium text-muted-foreground">Economic Articles</h3>
            <div className="space-y-2">
              {articleGroups.map((group) => (
                <Popover key={group.id}>
                  <PopoverTrigger asChild>
                    <Button
                      className="w-full justify-start text-left text-xs h-auto py-2"
                      variant="outline"
                      title={`${group.articles.length} articles from ${group.date}`}
                    >
                      <span className="truncate">{group.date}</span>
                      <span className="ml-auto text-xs text-muted-foreground flex-shrink-0">
                        {group.articles.length}
                      </span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-96 max-h-96 overflow-y-auto">
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm">Articles from {group.date}</h4>
                      {group.articles.map((article, index) => (
                        <div key={index} className="border-t pt-3 first:border-t-0 first:pt-0">
                          <a
                            href={article.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-primary hover:underline text-sm flex items-center gap-2 break-words"
                          >
                            {article.title}
                            <ExternalLink className="h-3 w-3 flex-shrink-0" />
                          </a>
                          <p className="text-xs text-muted-foreground mt-1">{article.content.slice(0,300)}...</p>
                        </div>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Articles Dialog */}
      <Dialog open={showArticlesDialog} onOpenChange={setShowArticlesDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Economic Articles</DialogTitle>
            <DialogDescription>
              Latest economic articles from the web
            </DialogDescription>
          </DialogHeader>
          
          {isLoadingArticles ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : fetchedArticles.length > 0 ? (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {fetchedArticles.map((article, index) => (
                <div key={index} className="border border-border rounded-lg p-4">
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-primary hover:underline flex items-center gap-2"
                  >
                    {article.title}
                    <ExternalLink className="h-4 w-4 flex-shrink-0" />
                  </a>
                  <p className="text-sm text-muted-foreground mt-2">{article.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No articles found
            </div>
          )}
        </DialogContent>
      </Dialog>
    </aside>
  )
}
