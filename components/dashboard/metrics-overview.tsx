"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface MetricsOverviewProps {
  totalMentions: number
  loading: boolean
  dateLabel?: string
}

export function MetricsOverview({
  totalMentions,
  loading,
  dateLabel = 'last 30 days'
}: MetricsOverviewProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Total Mentions</CardTitle>
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
  )
} 