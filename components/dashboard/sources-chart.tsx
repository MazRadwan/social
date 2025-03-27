"use client"

import { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { ArticlesBySource } from '@/lib/data/types'

interface SourcesChartProps {
  sourcesData: ArticlesBySource[] | null
  loading: boolean
  direction?: 'vertical' | 'horizontal'
}

export function SourcesChart({
  sourcesData,
  loading,
  direction = 'horizontal'
}: SourcesChartProps) {
  // Format the data for the chart
  const chartData = useMemo(() => {
    if (!sourcesData) return []
    return sourcesData
  }, [sourcesData])

  // Generate colors for each bar
  const colors = useMemo(() => {
    if (!sourcesData) return []
    const primaryBase = 'hsl(var(--primary))'
    
    // For a single source, just use the primary color
    if (sourcesData.length === 1) {
      return [primaryBase]
    }
    
    // For multiple sources, create a gradient of colors
    return Array(sourcesData.length).fill(0).map((_, i) => {
      const opacity = 1 - (i * 0.5 / sourcesData.length)
      return `hsl(var(--primary) / ${opacity})`
    })
  }, [sourcesData])

  // Custom tooltip formatter
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-md shadow-md p-2 text-sm">
          <p className="font-medium">{payload[0].payload.source}</p>
          <p>
            Mentions: <span className="font-medium">{payload[0].value}</span>
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Top Sources</CardTitle>
        <CardDescription>Most frequent article sources</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-muted-foreground">Loading sources data...</p>
          </div>
        ) : chartData.length > 0 ? (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                layout={direction === 'horizontal' ? 'vertical' : 'horizontal'}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={direction !== 'horizontal'} />
                {direction === 'horizontal' ? (
                  <>
                    <XAxis type="number" />
                    <YAxis
                      dataKey="source"
                      type="category"
                      tick={{ fontSize: 12 }}
                      width={120}
                    />
                  </>
                ) : (
                  <>
                    <XAxis
                      dataKey="source"
                      tick={{ fontSize: 12 }}
                      interval={0}
                      angle={-45}
                      textAnchor="end"
                      height={50}
                    />
                    <YAxis type="number" />
                  </>
                )}
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Mentions">
                  {chartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-muted-foreground">No sources data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 