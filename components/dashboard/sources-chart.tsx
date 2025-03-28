"use client"

import { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  PieChart,
  Pie,
  ResponsiveContainer,
  Cell,
  Tooltip
} from 'recharts'
import { ArticlesBySource } from '@/lib/data/types'

interface SourcesChartProps {
  sourcesData: ArticlesBySource[] | null
  loading: boolean
}

export function SourcesChart({
  sourcesData,
  loading,
}: SourcesChartProps) {
  // Format the data for the chart
  const chartData = useMemo(() => {
    if (!sourcesData) return []
    return sourcesData
  }, [sourcesData])

  const getSourceColor = (source: string, index: number) => {
    const colors = [
      'hsl(210, 100%, 59%)', // X/Twitter - Blue
      'hsl(220, 46%, 48%)',  // Facebook - Dark Blue
      'hsl(330, 100%, 59%)', // Instagram - Pink
      'hsl(20, 100%, 59%)',  // Reddit - Orange
      'hsl(180, 5%, 52%)',   // Other - Gray
    ]
    
    const lowerSource = source.toLowerCase()
    if (lowerSource.includes('twitter') || lowerSource.includes('x/twitter')) return colors[0]
    if (lowerSource.includes('facebook')) return colors[1]
    if (lowerSource.includes('instagram')) return colors[2]
    if (lowerSource.includes('reddit')) return colors[3]
    return colors[4] // Other
  }

  // Custom tooltip formatter
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const totalCount = chartData.reduce((sum, item) => sum + item.count, 0);
      const percentage = ((payload[0].value / totalCount) * 100).toFixed(1);
      
      return (
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-2">
          <p className="font-medium">{payload[0].name}</p>
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold">{payload[0].value}</span> articles ({percentage}%)
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Source Breakdown</CardTitle>
        <CardDescription>Article distribution by source</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-muted-foreground">Loading sources data...</p>
          </div>
        ) : chartData.length > 0 ? (
          <div className="h-[300px] flex flex-col items-center justify-center">
            <div className="h-[200px] w-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={0}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="count"
                    nameKey="source"
                    stroke="none"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getSourceColor(entry.source, index)} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-6">
              {chartData.map((entry, index) => (
                <div key={`legend-${index}`} className="flex items-center">
                  <div 
                    className="h-3 w-3 rounded-full mr-1" 
                    style={{ backgroundColor: getSourceColor(entry.source, index) }}
                  ></div>
                  <span className="text-sm whitespace-nowrap">
                    {entry.source} {Math.round((entry.count / chartData.reduce((sum, item) => sum + item.count, 0)) * 100)}%
                  </span>
                </div>
              ))}
            </div>
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