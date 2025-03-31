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
  onDrillDown?: (source: string) => void
}

export function SourcesChart({
  sourcesData,
  loading,
  onDrillDown,
}: SourcesChartProps) {
  // Format the data for the chart
  const chartData = useMemo(() => {
    if (!sourcesData) return []
    return sourcesData
  }, [sourcesData])

  const getSourceColor = (source: string, index: number) => {
    // Color palette that works well in both dark and light themes
    const colors = [
      'hsl(200, 70%, 50%)',    // Blue
      'hsl(50, 90%, 55%)',     // Yellow (for Google)
      'hsl(350, 70%, 60%)',    // Red/Pink
      'hsl(30, 90%, 60%)',     // Orange
      'hsl(265, 60%, 60%)',    // Purple
      'hsl(180, 70%, 45%)',    // Teal
      'hsl(35, 90%, 55%)',     // Amber
      'hsl(300, 60%, 60%)',    // Magenta
      'hsl(230, 70%, 70%)',    // Light Blue
      'hsl(120, 50%, 50%)',    // Lime
      'hsl(0, 0%, 60%)'        // Gray (for fallback)
    ]
    
    // Map common sources to specific colors for consistency
    const lowerSource = source.toLowerCase()
    if (lowerSource.includes('web') || lowerSource.includes('scraping')) return colors[0]
    if (lowerSource.includes('google')) return colors[1]
    if (lowerSource.includes('reddit')) return colors[2]
    if (lowerSource.includes('rss') || lowerSource.includes('feed')) return colors[3]
    if (lowerSource.includes('toronto') || lowerSource.includes('condo')) return colors[4]
    if (lowerSource.includes('twitter') || lowerSource.includes('x')) return colors[5]
    if (lowerSource.includes('facebook')) return colors[6]
    if (lowerSource.includes('instagram')) return colors[7]
    if (lowerSource.includes('linkedin')) return colors[8]
    if (lowerSource.includes('news')) return colors[9]
    
    // For other sources, cycle through colors based on index
    return colors[index % (colors.length - 1)] || colors[10]
  }

  // Handle click on chart segments for drill-down
  const handlePieClick = (data: any, index: number) => {
    if (onDrillDown && data && data.name) {
      onDrillDown(data.name);
    }
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
          {onDrillDown && (
            <p className="text-xs text-muted-foreground mt-1 italic">
              Click to view details
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
                    onClick={onDrillDown ? handlePieClick : undefined}
                    cursor={onDrillDown ? "pointer" : undefined}
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
                <div 
                  key={`legend-${index}`} 
                  className="flex items-center" 
                  onClick={onDrillDown ? () => onDrillDown(entry.source) : undefined}
                  style={{ cursor: onDrillDown ? "pointer" : "default" }}
                >
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