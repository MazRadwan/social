"use client"

import { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { ArticleSentimentSummary } from '@/lib/data/types'

interface SentimentChartProps {
  sentimentData: ArticleSentimentSummary | null
  loading: boolean
}

export function SentimentChart({ sentimentData, loading }: SentimentChartProps) {
  // Format the data for the pie chart
  const chartData = useMemo(() => {
    if (!sentimentData) return []

    return [
      { name: 'Positive', value: sentimentData.positive, color: '#10b981' },
      { name: 'Neutral', value: sentimentData.neutral, color: '#6b7280' },
      { name: 'Negative', value: sentimentData.negative, color: '#ef4444' },
    ]
  }, [sentimentData])

  // Calculate percentages for display
  const total = chartData.reduce((acc, item) => acc + item.value, 0)
  
  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Sentiment Distribution</CardTitle>
        <CardDescription>Overall proportion of sentiment</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-muted-foreground">Loading sentiment data...</p>
          </div>
        ) : chartData.length > 0 ? (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [
                    `${value} (${((value / total) * 100).toFixed(1)}%)`,
                    'Mentions',
                  ]}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-muted-foreground">No sentiment data available</p>
          </div>
        )}
        
        {sentimentData && (
          <div className="grid grid-cols-3 gap-2 mt-4 text-center">
            <div className="bg-green-50 dark:bg-green-950 p-2 rounded-md">
              <p className="text-green-600 dark:text-green-400 text-xl font-semibold">
                {((sentimentData.positive / sentimentData.total) * 100).toFixed(1)}%
              </p>
              <p className="text-sm text-muted-foreground">Positive</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 p-2 rounded-md">
              <p className="text-gray-600 dark:text-gray-400 text-xl font-semibold">
                {((sentimentData.neutral / sentimentData.total) * 100).toFixed(1)}%
              </p>
              <p className="text-sm text-muted-foreground">Neutral</p>
            </div>
            <div className="bg-red-50 dark:bg-red-950 p-2 rounded-md">
              <p className="text-red-600 dark:text-red-400 text-xl font-semibold">
                {((sentimentData.negative / sentimentData.total) * 100).toFixed(1)}%
              </p>
              <p className="text-sm text-muted-foreground">Negative</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 