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
import { Badge } from '@/components/ui/badge'
import { ArticlesByTag } from '@/lib/data/types'

interface TagsChartProps {
  tagsData: ArticlesByTag[] | null
  loading: boolean
  type?: 'bar' | 'cloud'
}

export function TagsChart({
  tagsData,
  loading,
  type = 'bar',
}: TagsChartProps) {
  // Format the data for the chart
  const chartData = useMemo(() => {
    if (!tagsData) return []
    return tagsData
  }, [tagsData])

  // Generate colors for each bar
  const colors = useMemo(() => {
    if (!tagsData) return []
    
    // For a single tag, just use the primary color
    if (tagsData.length === 1) {
      return ['hsl(var(--primary))']
    }
    
    // For multiple tags, create a gradient of colors
    return Array(tagsData.length).fill(0).map((_, i) => {
      const opacity = 1 - (i * 0.5 / tagsData.length)
      return `hsl(var(--primary) / ${opacity})`
    })
  }, [tagsData])

  // Calculate font sizes for the tag cloud
  const getFontSize = (count: number) => {
    if (!tagsData || tagsData.length === 0) return 'text-sm'
    
    const maxCount = tagsData[0].count
    const minCount = tagsData[tagsData.length - 1].count
    
    // Normalize the count to a value between 0 and 1
    const normalized = (count - minCount) / (maxCount - minCount || 1)
    
    // Map to font size classes
    if (normalized > 0.8) return 'text-2xl'
    if (normalized > 0.6) return 'text-xl'
    if (normalized > 0.4) return 'text-lg'
    if (normalized > 0.2) return 'text-base'
    return 'text-sm'
  }

  // Custom tooltip formatter
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-md shadow-md p-2 text-sm">
          <p className="font-medium">{payload[0].payload.tag}</p>
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
        <CardTitle>Top Tags</CardTitle>
        <CardDescription>Most frequently mentioned tags</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-muted-foreground">Loading tags data...</p>
          </div>
        ) : chartData.length > 0 ? (
          type === 'bar' ? (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" />
                  <YAxis
                    dataKey="tag"
                    type="category"
                    tick={{ fontSize: 12 }}
                    width={140}
                  />
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
            <div className="h-[300px] flex flex-wrap justify-center items-center gap-3 p-4 overflow-hidden">
              {chartData.map((tag, index) => (
                <Badge
                  key={tag.tag}
                  variant="outline"
                  className={`${getFontSize(tag.count)} px-3 py-1.5 cursor-pointer hover:bg-muted`}
                  style={{
                    borderColor: colors[index % colors.length],
                    color: colors[index % colors.length],
                  }}
                >
                  {tag.tag}
                  <span className="ml-1 text-xs opacity-60">{tag.count}</span>
                </Badge>
              ))}
            </div>
          )
        ) : (
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-muted-foreground">No tags data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 