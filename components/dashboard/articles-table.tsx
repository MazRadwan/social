"use client"

import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { ChevronLeft, ChevronRight, ExternalLink, ChevronDown, Maximize2, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Article } from '@/lib/data/types'
import { cn } from '@/lib/utils'
import React from 'react'

// Define sort types
type SortColumn = 'title' | 'source' | 'date' | 'sentiment' | null;
type SortDirection = 'asc' | 'desc' | null;

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
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({})
  const [sortColumn, setSortColumn] = useState<SortColumn>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>(null)
  
  // Toggle row expansion
  const toggleRowExpansion = (index: number) => {
    const rowKey = `article-${startIndex + index}`
    setExpandedRows(prev => ({
      ...prev,
      [rowKey]: !prev[rowKey]
    }))
  }
  
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
  
  // Get average sentiment score
  const getAverageSentimentScore = (article: Article) => {
    if (!article.sentiment_analysis || article.sentiment_analysis.length === 0) {
      return 0
    }
    
    const totalScore = article.sentiment_analysis.reduce(
      (sum, analysis) => sum + analysis.sentiment_score, 
      0
    )
    
    return totalScore / article.sentiment_analysis.length
  }
  
  // Toggle sorting for a column
  const toggleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      // Cycle through: asc -> desc -> no sort
      if (sortDirection === 'asc') {
        setSortDirection('desc')
      } else if (sortDirection === 'desc') {
        setSortColumn(null)
        setSortDirection(null)
      }
    } else {
      // New column, start with ascending
      setSortColumn(column)
      setSortDirection('asc')
    }
  }
  
  // Get sorted articles
  const getSortedArticles = () => {
    if (!articles || !sortColumn || !sortDirection) {
      return articles || []
    }
    
    return [...articles].sort((a, b) => {
      let valueA, valueB;
      
      if (sortColumn === 'title') {
        valueA = a.title.toLowerCase()
        valueB = b.title.toLowerCase()
      } else if (sortColumn === 'source') {
        valueA = a.source.toLowerCase()
        valueB = b.source.toLowerCase()
      } else if (sortColumn === 'date') {
        valueA = new Date(a.published_date).getTime()
        valueB = new Date(b.published_date).getTime()
      } else if (sortColumn === 'sentiment') {
        valueA = getPredominantSentiment(a)
        valueB = getPredominantSentiment(b)
      } else {
        return 0
      }
      
      // Sort direction
      const multiplier = sortDirection === 'asc' ? 1 : -1
      
      // Handle string comparison
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return multiplier * valueA.localeCompare(valueB)
      }
      
      // Handle number comparison
      return multiplier * ((valueA as number) - (valueB as number))
    })
  }
  
  // Calculate pagination values with sorted articles
  const sortedArticles = getSortedArticles()
  const totalArticles = sortedArticles.length
  const totalPages = Math.ceil(totalArticles / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = Math.min(startIndex + pageSize, totalArticles)
  const currentArticles = sortedArticles.slice(startIndex, endIndex)
  
  // Get sort icon for column header
  const getSortIcon = (column: SortColumn) => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="ml-2 h-4 w-4" />
    }
    
    return sortDirection === 'asc' ? 
      <ArrowUp className="ml-2 h-4 w-4" /> : 
      <ArrowDown className="ml-2 h-4 w-4" />
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
                <TableHead onClick={() => toggleSort('title')} className="cursor-pointer hover:bg-muted/60">
                  <div className="flex items-center">
                    Title
                    {getSortIcon('title')}
                  </div>
                </TableHead>
                <TableHead onClick={() => toggleSort('source')} className="cursor-pointer hover:bg-muted/60">
                  <div className="flex items-center">
                    Source
                    {getSortIcon('source')}
                  </div>
                </TableHead>
                <TableHead onClick={() => toggleSort('date')} className="cursor-pointer hover:bg-muted/60">
                  <div className="flex items-center">
                    Date
                    {getSortIcon('date')}
                  </div>
                </TableHead>
                <TableHead onClick={() => toggleSort('sentiment')} className="cursor-pointer hover:bg-muted/60">
                  <div className="flex items-center">
                    Sentiment
                    {getSortIcon('sentiment')}
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentArticles.map((article, index) => {
                const sentiment = getPredominantSentiment(article)
                const rowKey = `article-${startIndex + index}`
                const isExpanded = expandedRows[rowKey] || false
                
                return (
                  <React.Fragment key={rowKey}>
                    <TableRow 
                      className="cursor-pointer hover:bg-muted/80"
                      onClick={() => toggleRowExpansion(index)}
                    >
                      <TableCell className="max-w-[400px]">
                        <div className="flex items-start">
                          <div className="flex-1">
                            <div className="font-medium">
                              {truncateText(article.title, 80)}
                            </div>
                          </div>
                          {article.link && (
                            <a
                              href={article.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ml-2 text-muted-foreground hover:text-foreground"
                              onClick={(e) => e.stopPropagation()}
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
                    
                    {isExpanded && (
                      <TableRow className="bg-muted/40 dark:bg-muted/60 hover:bg-muted/40 dark:hover:bg-muted/60 border-t border-b border-muted">
                        <TableCell colSpan={4} className="p-4">
                          <div className="space-y-4">
                            {/* Tags section */}
                            <div>
                              <h4 className="text-sm font-medium mb-2">Keywords</h4>
                              <div className="flex flex-wrap gap-1.5">
                                {article.tags && article.tags.map((tag) => (
                                  <Badge key={tag} variant="outline" className="px-2 py-0.5 text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                                {(!article.tags || article.tags.length === 0) && (
                                  <span className="text-xs text-muted-foreground">No keywords</span>
                                )}
                              </div>
                            </div>
                            
                            {/* Sentiment details */}
                            <div>
                              <h4 className="text-sm font-medium mb-2">Sentiment Details</h4>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-background rounded p-2">
                                  <div className="text-xs text-muted-foreground">Sentiment Score</div>
                                  <div className="font-medium">
                                    {getAverageSentimentScore(article).toFixed(2)}
                                  </div>
                                </div>
                                <div className="bg-background rounded p-2">
                                  <div className="text-xs text-muted-foreground">Sentiment Breakdown</div>
                                  <div className="text-xs space-y-1">
                                    <div className="flex justify-between">
                                      <span>Positive:</span>
                                      <span>{article.sentiment_analysis.filter(s => s.sentiment === 'Positive').length}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Neutral:</span>
                                      <span>{article.sentiment_analysis.filter(s => s.sentiment === 'Neutral').length}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Negative:</span>
                                      <span>{article.sentiment_analysis.filter(s => s.sentiment === 'Negative').length}</span>
                                    </div>
                                  </div>
                                </div>
                                {article.assigned_issue && (
                                  <div className="bg-background rounded p-2">
                                    <div className="text-xs text-muted-foreground">Assigned Issue</div>
                                    <div className="font-medium">{article.assigned_issue}</div>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            {/* Article content preview */}
                            <div>
                              <h4 className="text-sm font-medium mb-2">Content Preview</h4>
                              <p className="text-sm text-muted-foreground">
                                {truncateText(article.content, 300)}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
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