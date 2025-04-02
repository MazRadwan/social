"use client"

import { useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
  Cell,
} from 'recharts'

interface IssuesChartProps {
  issuesData: {
    issue: string
    positive: number
    negative: number
  }[] | null
  loading: boolean
  onDrillDown?: (issue: string) => void
}

export function IssuesChart({
  issuesData,
  loading,
  onDrillDown,
}: IssuesChartProps) {
  // Track hovering state
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [activeBar, setActiveBar] = useState<'positive' | 'negative' | null>(null);

  // Format the data for the chart
  const chartData = useMemo(() => {
    if (!issuesData) return []
    
    // Transform data for the chart
    // Negative values should be negative for proper display
    return issuesData.map(item => ({
      issue: item.issue,
      positive: item.positive || 0,
      negative: -(item.negative || 0), // Convert to negative for rendering below axis
    }))
  }, [issuesData])

  // Define colors
  const colors = {
    positive: {
      default: "rgb(134, 239, 112)",
      hover: "rgb(104, 209, 82)"
    },
    negative: {
      default: "rgb(239, 138, 138)",
      hover: "rgb(209, 108, 108)"
    }
  };

  // Custom tooltip formatter
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background/95 dark:bg-gray-900/95 border border-border dark:border-gray-700 rounded-md shadow-md p-3 text-sm backdrop-blur-sm">
          <p className="font-medium mb-1">{label}</p>
          {payload.map((entry: any) => {
            // Handle displaying absolute values
            const value = Math.abs(entry.value)
            const name = entry.dataKey === 'positive' ? 'Positive' : 'Negative'
            const color = entry.dataKey === 'positive' ? 'text-green-500' : 'text-red-400'
            return (
              <p key={entry.dataKey} className={color}>
                {name}: <span className="font-medium">{value}</span>
              </p>
            )
          })}
          {onDrillDown && (
            <p className="text-xs text-muted-foreground mt-2 italic">
              Click to view details
            </p>
          )}
        </div>
      )
    }
    return null
  }

  // Handle click for drill-down
  const handleClick = (data: any) => {
    if (onDrillDown && data && data.activeLabel) {
      onDrillDown(data.activeLabel)
    }
  }

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Sentiment Comparison Across Key Issues</CardTitle>
        <CardDescription>Distribution of positive and negative sentiment by issue</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-muted-foreground">Loading issues data...</p>
          </div>
        ) : chartData.length > 0 ? (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="90%">
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 5, right: 5, left: 60, bottom: 20 }}
                onClick={onDrillDown ? handleClick : undefined}
                style={{ cursor: onDrillDown ? 'pointer' : 'default' }}
                onMouseLeave={() => {
                  setActiveIndex(null);
                  setActiveBar(null);
                }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis 
                  type="number" 
                  tickFormatter={(value) => Math.abs(value).toString()}
                />
                <YAxis
                  dataKey="issue"
                  type="category"
                  tick={{ fontSize: 11 }}
                  width={60}
                  tickMargin={5}
                />
                <Tooltip 
                  content={<CustomTooltip />}
                  cursor={{ 
                    fill: 'rgba(100, 100, 100, 0.1)', 
                    stroke: 'rgba(150, 150, 150, 0.2)',
                    strokeWidth: 1 
                  }}
                />
                <ReferenceLine x={0} stroke="#666" />
                <Bar
                  dataKey="positive"
                  name="Positive"
                  onMouseOver={(data, index) => {
                    setActiveIndex(index);
                    setActiveBar('positive');
                  }}
                  animationDuration={800}
                >
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`positive-${index}`}
                      fill={activeIndex === index && activeBar === 'positive' 
                        ? colors.positive.hover 
                        : colors.positive.default}
                    />
                  ))}
                </Bar>
                <Bar
                  dataKey="negative"
                  name="Negative"
                  onMouseOver={(data, index) => {
                    setActiveIndex(index);
                    setActiveBar('negative');
                  }}
                  animationDuration={800}
                >
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`negative-${index}`}
                      fill={activeIndex === index && activeBar === 'negative' 
                        ? colors.negative.hover 
                        : colors.negative.default}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="flex items-center justify-center gap-4 mt-2">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-sm">Positive</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <span className="text-sm">Negative</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-muted-foreground">No issues data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 