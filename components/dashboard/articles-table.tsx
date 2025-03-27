"use client"

import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Article } from '@/lib/data/types'

interface ArticlesTableProps {
  articles: Article[] | null
  loading: boolean
  pageSize?: number
}

export function ArticlesTable({
  articles,
  loading,
  pageSize = 5,
}: ArticlesTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  
  // Calculate pagination values
  const totalArticles = articles?.length || 0
  const totalPages = Math.ceil(totalArticles / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = Math.min(startIndex + pageSize, totalArticles)
  const currentArticles = articles?.slice(startIndex, endIndex) || []
  
  // Get predominant sentiment for an article
  const getPredominantSentiment = (article: Article) => {
    const sentiments = article.sentiment_analysis.map(s => s.sentiment)
    const positiveCount = sentiments.filter(s => s === 'Positive').length
    const negativeCount = sentiments.filter(s => s === 'Negative').length
    const neutralCount = sentiments.filter(s => s === 'Neutral').length
    
    if (positiveCount > negativeCount && positiveCount > neutralCount) {
      return 'Positive'
    } else if (negativeCount > positiveCount && negativeCount > neutralCount) {
      return 'Negative'
    } else {
      return 'Neutral'
    }
  }
  
  // Get badge variant based on sentiment
  const getSentimentBadgeVariant = (sentiment: string) => {
    switch (sentiment) {
      case 'Positive':
        return 'success'
      case 'Negative':
        return 'destructive'
      default:
        return 'secondary'
    }
  }
  
  // Handle pagination
  const goToNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages))
  }
  
  const goToPrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1))
  }
  
  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'MMM dd, yyyy')
    } catch (error) {
      return dateString
    }
  }
  
  // Truncate text to a specific length
  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength
      ? `${text.substring(0, maxLength)}...`
      : text
  }

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Recent Articles</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Loading articles...</p>
          </div>
        ) : currentArticles.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Sentiment</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentArticles.map((article) => {
                const sentiment = getPredominantSentiment(article)
                
                return (
                  <TableRow key={article.title}>
                    <TableCell className="max-w-[400px]">
                      <div className="flex items-start">
                        <div>
                          <div className="font-medium">{truncateText(article.title, 80)}</div>
                          <div className="mt-1 flex flex-wrap gap-1.5">
                            {article.tags.slice(0, 3).map((tag) => (
                              <Badge key={tag} variant="outline" className="px-1.5 py-0 text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {article.tags.length > 3 && (
                              <Badge variant="outline" className="px-1.5 py-0 text-xs">
                                +{article.tags.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                        {article.link && (
                          <a
                            href={article.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-2 text-muted-foreground hover:text-foreground"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{article.source}</TableCell>
                    <TableCell>{formatDate(article.published_date)}</TableCell>
                    <TableCell>
                      <Badge variant={getSentimentBadgeVariant(sentiment)}>
                        {sentiment}
                      </Badge>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        ) : (
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">No articles available</p>
          </div>
        )}
      </CardContent>
      {totalPages > 1 && (
        <CardFooter className="flex items-center justify-between border-t p-4">
          <div className="text-sm text-muted-foreground">
            Showing <strong>{startIndex + 1}</strong> to <strong>{endIndex}</strong> of{' '}
            <strong>{totalArticles}</strong> articles
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={goToPrevPage}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  )
} 