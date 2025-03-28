"use client"

import { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, TooltipProps } from 'recharts'
import { ArticleSentimentSummary } from '@/lib/data/types'
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent'

interface SentimentChartProps {
  sentimentData: ArticleSentimentSummary
  loading: boolean
}

const CHART_COLORS = {
  positive: 'hsl(var(--chart-1))',
  negative: 'hsl(var(--chart-3))',
  neutral: 'hsl(var(--chart-2))',
  score: 'hsl(var(--chart-4))',
}

// Custom tooltip component for hovering over sentiment pie chart slices
const CustomTooltip = ({ active, payload }: TooltipProps<ValueType, NameType>) => {
  if (active && payload && payload.length > 0) {
    const data = payload[0].payload;
    const value = payload[0].value as number;
    const total = data.total || 0;
    const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
    
    return (
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-2">
        <p className="font-medium">{data.name}</p>
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold">{value}</span> mentions ({percentage}%)
        </p>
      </div>
    );
  }
  
  return null;
}

export function SentimentChart({ sentimentData, loading }: SentimentChartProps) {
  // Format the data for the pie chart
  const chartData = useMemo(() => {
    return [
      { name: 'Positive', value: sentimentData.positive, color: CHART_COLORS.positive, total: sentimentData.total },
      { name: 'Neutral', value: sentimentData.neutral, color: CHART_COLORS.neutral, total: sentimentData.total },
      { name: 'Negative', value: sentimentData.negative, color: CHART_COLORS.negative, total: sentimentData.total },
    ]
  }, [sentimentData])

  // Calculate percentages for display
  const total = sentimentData.total || chartData.reduce((acc, item) => acc + item.value, 0)
  
  // Helper function to safely calculate percentages
  const getPercentage = (value: number): string => {
    if (!total) return '0.0'
    return ((value / total) * 100).toFixed(1)
  }
  
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
        ) : total > 0 ? (
          <div className="h-[300px] flex flex-col items-center justify-center relative">
            <div className="h-[200px] w-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    startAngle={90}
                    endAngle={450}
                    paddingAngle={2}
                    dataKey="value"
                    nameKey="name"
                    stroke="none"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    content={<CustomTooltip />}
                    cursor={false}
                    offset={10}
                    position={{ x: 0, y: 0 }}
                    allowEscapeViewBox={{ x: true, y: true }}
                    isAnimationActive={false}
                    wrapperStyle={{ 
                      zIndex: 1001, 
                      position: 'absolute' 
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Center label rendered outside the chart */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-card rounded-full h-[115px] w-[115px] flex items-center justify-center flex-col z-0">
                <p className="text-2xl font-bold">{Math.round(sentimentData.positive / total * 100)}%</p>
                <p className="text-xs text-muted-foreground">Positive</p>
              </div>
            </div>
            
            <div className="flex gap-8 mt-6">
              <div className="flex items-center">
                <div className="h-3 w-3 rounded-full bg-[hsl(var(--chart-1))] mr-2"></div>
                <span className="text-sm">Positive {Math.round(sentimentData.positive / total * 100)}%</span>
              </div>
              <div className="flex items-center">
                <div className="h-3 w-3 rounded-full bg-[hsl(var(--chart-2))] mr-2"></div>
                <span className="text-sm">Neutral {Math.round(sentimentData.neutral / total * 100)}%</span>
              </div>
              <div className="flex items-center">
                <div className="h-3 w-3 rounded-full bg-[hsl(var(--chart-3))] mr-2"></div>
                <span className="text-sm">Negative {Math.round(sentimentData.negative / total * 100)}%</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-muted-foreground">No sentiment data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 