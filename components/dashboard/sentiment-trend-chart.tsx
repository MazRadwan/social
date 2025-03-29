"use client"

import { useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { format, parseISO, isValid } from 'date-fns'

interface SentimentDataPoint {
  date: string
  positive: number
  neutral: number
  negative: number
  score: number
}

interface SentimentTrendChartProps {
  sentimentData: SentimentDataPoint[] | null
  loading: boolean
}

const CHART_COLORS = {
  positive: 'hsl(var(--chart-1))',
  negative: 'hsl(var(--chart-3))',
  neutral: 'hsl(var(--chart-2))',
  score: 'hsl(var(--chart-4))',
}

export function SentimentTrendChart({
  sentimentData,
  loading,
}: SentimentTrendChartProps) {
  // State to track which lines are visible
  const [visibleLines, setVisibleLines] = useState({
    positive: true,
    neutral: true,
    negative: true,
    score: true,
  })

  // Format the data for the chart
  const chartData = useMemo(() => {
    if (!sentimentData) return []

    return sentimentData
      .filter(item => isValid(parseISO(item.date)))
      .map((item) => ({
        ...item,
        formattedDate: format(parseISO(item.date), 'MMM dd'),
      }))
  }, [sentimentData])

  // Custom tooltip formatter
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-md shadow-md p-2 text-sm">
          <p className="font-medium">{format(parseISO(label), 'MMM dd, yyyy')}</p>
          {payload.map((entry: any, index: number) => (
            <p key={`item-${index}`} style={{ color: entry.stroke || entry.color }}>
              {entry.name}: <span className="font-medium">{entry.name === 'Sentiment Score' ? entry.value.toFixed(2) : entry.value}</span>
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  // Handle legend click to toggle visibility
  const handleLegendClick = (dataKey: any) => {
    if (typeof dataKey === 'string') {
      setVisibleLines(prev => ({
        ...prev,
        [dataKey.toLowerCase()]: !prev[dataKey.toLowerCase() as keyof typeof prev]
      }))
    }
  }

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Sentiment Trend</CardTitle>
        <CardDescription>Sentiment over time</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-muted-foreground">Loading sentiment data...</p>
          </div>
        ) : chartData.length > 0 ? (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickFormatter={(date) => format(parseISO(date), 'MMM dd')}
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  yAxisId="left"
                  allowDecimals={false}
                  tick={{ fontSize: 12 }}
                  domain={[0, 'auto']}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  domain={[-1, 1]}
                  tickFormatter={(value) => value.toFixed(1)}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  onClick={(e) => handleLegendClick(e.dataKey)}
                  wrapperStyle={{ cursor: 'pointer' }}
                  formatter={(value, entry) => {
                    const dataKey = entry.dataKey as string;
                    const isActive = visibleLines[dataKey.toLowerCase() as keyof typeof visibleLines];
                    return (
                      <span style={{ color: isActive ? entry.color : 'gray', textDecoration: isActive ? 'none' : 'line-through' }}>
                        {value}
                      </span>
                    );
                  }}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="positive"
                  name="Positive"
                  stroke={CHART_COLORS.positive}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                  hide={!visibleLines.positive}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="neutral"
                  name="Neutral"
                  stroke={CHART_COLORS.neutral}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                  hide={!visibleLines.neutral}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="negative"
                  name="Negative"
                  stroke={CHART_COLORS.negative}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                  hide={!visibleLines.negative}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="score"
                  name="Sentiment Score"
                  stroke={CHART_COLORS.score}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                  hide={!visibleLines.score}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-muted-foreground">No sentiment trend data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 