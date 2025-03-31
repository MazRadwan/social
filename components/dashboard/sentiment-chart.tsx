"use client"

import { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { ArticleSentimentSummary } from '@/lib/data/types'

interface SentimentChartProps {
  sentimentData: ArticleSentimentSummary
  loading: boolean
  onDrillDown?: (sentiment: 'Positive' | 'Neutral' | 'Negative') => void
}

const CHART_COLORS = {
  positive: 'hsl(var(--chart-1))',
  negative: 'hsl(var(--chart-3))',
  neutral: 'hsl(var(--chart-2))',
  score: 'hsl(var(--chart-4))',
}

// Custom tooltip component for hovering over sentiment pie chart slices
const CustomTooltip = ({ active, payload, onDrillDown }: any) => {
  console.log('Tooltip active:', active);
  console.log('Tooltip payload:', payload);
  
  if (active && payload && payload.length > 0) {
    // Get the data directly from the payload
    const entry = payload[0];
    
    // Safely access values
    const name = entry.name || '';
    const value = entry.value || 0;
    const payloadData = entry.payload || {};
    const total = payloadData.total || 0;
    
    // Calculate percentage
    const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
    
    return (
      <div className="rounded-lg border bg-background text-foreground shadow-sm p-2 z-50">
        <p className="font-medium">{name}</p>
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold">{value}</span> mentions ({percentage}%)
        </p>
        {onDrillDown && (
          <p className="text-xs text-muted-foreground mt-1 italic">
            Click to view details
          </p>
        )}
      </div>
    );
  }
  
  return null;
}

export function SentimentChart({ sentimentData, loading, onDrillDown }: SentimentChartProps) {
  // Format the data for the pie chart
  const chartData = useMemo(() => {
    const data = [
      { name: 'Positive', value: sentimentData.positive, color: CHART_COLORS.positive, total: sentimentData.total },
      { name: 'Neutral', value: sentimentData.neutral, color: CHART_COLORS.neutral, total: sentimentData.total },
      { name: 'Negative', value: sentimentData.negative, color: CHART_COLORS.negative, total: sentimentData.total },
    ];
    console.log('Chart Data:', data);
    return data;
  }, [sentimentData])

  // Handle pie chart click for drill-down
  const handlePieClick = (data: any) => {
    if (onDrillDown && data && data.name) {
      onDrillDown(data.name as 'Positive' | 'Neutral' | 'Negative');
    }
  }

  // Calculate percentages for display
  const total = sentimentData.total || chartData.reduce((acc, item) => acc + item.value, 0)
  
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
            <div className="h-[200px] w-[200px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart
                  margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
                  style={{ position: 'relative', zIndex: 10 }}
                >
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
                    isAnimationActive={true}
                    onClick={onDrillDown ? handlePieClick : undefined}
                    cursor={onDrillDown ? "pointer" : undefined}
                    onMouseEnter={(data, index) => {
                      console.log('Mouse enter:', data, index);
                    }}
                    onMouseLeave={() => {
                      console.log('Mouse leave');
                    }}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    content={<CustomTooltip onDrillDown={onDrillDown} />}
                    wrapperStyle={{ zIndex: 100, pointerEvents: 'none' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              
              {/* Center label rendered inside the chart container for better positioning */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="bg-card rounded-full h-[115px] w-[115px] flex flex-col items-center justify-center text-center pointer-events-none">
                  <div className="text-2xl font-bold leading-none">{Math.round(sentimentData.positive / total * 100)}%</div>
                  <div className="text-xs text-muted-foreground mt-1">Positive</div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-8 mt-6">
              <div 
                className="flex items-center"
                onClick={onDrillDown ? () => onDrillDown('Positive') : undefined}
                style={{ cursor: onDrillDown ? "pointer" : "default" }}
              >
                <div className="h-3 w-3 rounded-full bg-[hsl(var(--chart-1))] mr-2"></div>
                <span className="text-sm">Positive {Math.round(sentimentData.positive / total * 100)}%</span>
              </div>
              <div 
                className="flex items-center"
                onClick={onDrillDown ? () => onDrillDown('Neutral') : undefined}
                style={{ cursor: onDrillDown ? "pointer" : "default" }}
              >
                <div className="h-3 w-3 rounded-full bg-[hsl(var(--chart-2))] mr-2"></div>
                <span className="text-sm">Neutral {Math.round(sentimentData.neutral / total * 100)}%</span>
              </div>
              <div 
                className="flex items-center"
                onClick={onDrillDown ? () => onDrillDown('Negative') : undefined}
                style={{ cursor: onDrillDown ? "pointer" : "default" }}
              >
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