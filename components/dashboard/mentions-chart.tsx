"use client"

import { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { format, parseISO, isValid } from 'date-fns'

interface MentionsChartProps {
  mentionsData: { date: string; count: number }[] | null
  loading: boolean
  type?: 'line' | 'area'
  onDrillDown?: (date: string) => void
  disabled?: boolean
}

export function MentionsChart({
  mentionsData,
  loading,
  type = 'line',
  onDrillDown,
  disabled = false
}: MentionsChartProps) {
  // If disabled, return null
  if (disabled) return null
  
  // Format the data for the chart
  const chartData = useMemo(() => {
    if (!mentionsData) return []

    return mentionsData
      .filter(item => isValid(parseISO(item.date)))
      .map((item) => ({
        date: item.date,
        count: item.count,
        formattedDate: format(parseISO(item.date), 'MMM dd'),
      }))
  }, [mentionsData])

  // Handle click on data point for drill-down
  const handleDataPointClick = (data: any) => {
    if (onDrillDown && data && data.activePayload && data.activePayload[0]) {
      const date = data.activePayload[0].payload.date;
      onDrillDown(date);
    }
  }

  // Custom tooltip formatter
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-md shadow-md p-2 text-sm">
          <p className="font-medium">{format(parseISO(label), 'MMM dd, yyyy')}</p>
          <p>
            Mentions: <span className="font-medium">{payload[0].value}</span>
          </p>
          {onDrillDown && (
            <p className="text-xs text-muted-foreground mt-1 italic">
              Click to view details for this date
            </p>
          )}
        </div>
      )
    }
    return null
  }

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Mentions Over Time</CardTitle>
        <CardDescription>Article volume by day</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-muted-foreground">Loading mentions data...</p>
          </div>
        ) : chartData.length > 0 ? (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              {type === 'line' ? (
                <LineChart 
                  data={chartData}
                  onClick={onDrillDown ? handleDataPointClick : undefined}
                  style={{ cursor: onDrillDown ? 'pointer' : 'default' }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(date) => format(parseISO(date), 'MMM dd')}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="count"
                    name="Mentions"
                    stroke="hsl(210, 100%, 75%)"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              ) : (
                <AreaChart 
                  data={chartData}
                  onClick={onDrillDown ? handleDataPointClick : undefined}
                  style={{ cursor: onDrillDown ? 'pointer' : 'default' }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(date) => format(parseISO(date), 'MMM dd')}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="count"
                    name="Mentions"
                    stroke="hsl(210, 100%, 75%)"
                    fill="hsl(210, 100%, 75%, 0.2)"
                  />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-muted-foreground">No mentions data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}