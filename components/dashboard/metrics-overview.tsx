"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, BarChart3, ThumbsUp, ThumbsDown } from 'lucide-react'

interface MetricsOverviewProps {
  totalMentions: number
  loading: boolean
  dateLabel?: string
  positiveMentions: number
  negativeMentions: number
  sentimentScore: number
}

export function MetricsOverview({
  totalMentions,
  loading,
  dateLabel = 'last 30 days',
  positiveMentions = 0,
  negativeMentions = 0,
  sentimentScore = 0
}: MetricsOverviewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Mentions</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="animate-pulse h-12 bg-muted rounded-md" />
          ) : (
            <>
              <div className="text-2xl font-bold">{totalMentions.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">From {dateLabel}</p>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg Sentiment Score</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="animate-pulse h-12 bg-muted rounded-md" />
          ) : (
            <>
              <div className="text-2xl font-bold">{sentimentScore.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Scale -1 to 1</p>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Positive Mentions</CardTitle>
          <ThumbsUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="animate-pulse h-12 bg-muted rounded-md" />
          ) : (
            <>
              <div className="text-2xl font-bold text-green-500">{positiveMentions.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">{totalMentions > 0 ? Math.round((positiveMentions / totalMentions) * 100) : 0}% of total</p>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Negative Mentions</CardTitle>
          <ThumbsDown className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="animate-pulse h-12 bg-muted rounded-md" />
          ) : (
            <>
              <div className="text-2xl font-bold text-red-500">{negativeMentions.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">{totalMentions > 0 ? Math.round((negativeMentions / totalMentions) * 100) : 0}% of total</p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 