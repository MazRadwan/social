"use client"

import { useState } from 'react'
import { X } from 'lucide-react'
import { DateRange } from 'react-day-picker'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { FilterOptions } from '@/lib/data/types'
import { DateRangePicker } from '@/components/ui/date-range-picker'

interface FilterBarProps {
  onFilterChange: (filters: FilterOptions) => void
  availableSources: string[]
}

export function FilterBar({ onFilterChange, availableSources }: FilterBarProps) {
  const [keyword, setKeyword] = useState<string>('')
  const [source, setSource] = useState<string>('all')
  const [sentiment, setSentiment] = useState<'Positive' | 'Neutral' | 'Negative' | 'all'>('all')
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    to: new Date(),
  })

  // Update filters only when explicitly triggered
  const updateFilters = () => {
    if (!date?.from) return;
    
    const newFilters: FilterOptions = {
      dateRange: {
        from: date.from,
        to: date.to || date.from,
      },
    }

    if (keyword) {
      newFilters.keyword = keyword
    }

    if (source && source !== 'all') {
      newFilters.source = source
    }

    if (sentiment && sentiment !== 'all') {
      newFilters.sentiment = sentiment as 'Positive' | 'Neutral' | 'Negative'
    }

    onFilterChange(newFilters)
  }

  // Handle user input changes
  const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKeyword(e.target.value)
    setTimeout(updateFilters, 0) // Defer update to next tick
  }

  const handleSourceChange = (value: string) => {
    setSource(value)
    setTimeout(updateFilters, 0) // Defer update to next tick
  }

  const handleSentimentChange = (value: string) => {
    setSentiment(value as 'Positive' | 'Neutral' | 'Negative' | 'all')
    setTimeout(updateFilters, 0) // Defer update to next tick
  }

  const handleDateChange = (range: DateRange | undefined) => {
    setDate(range)
    if (range?.from) {
      setTimeout(updateFilters, 0) // Defer update to next tick
    }
  }

  // Clear all filters
  const handleClearFilters = () => {
    setKeyword('')
    setSource('all')
    setSentiment('all')
    setDate({
      from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      to: new Date(),
    })
    
    // Update with cleared filters
    setTimeout(() => {
      onFilterChange({
        dateRange: {
          from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          to: new Date(),
        },
      })
    }, 0)
  }

  return (
    <div className="bg-card border rounded-lg p-3 sm:p-4 md:p-6 w-full">
      <div className="space-y-3 sm:space-y-4 md:space-y-6">
        {/* Date Range Picker */}
        <DateRangePicker 
          dateRange={date}
          onDateRangeChange={handleDateChange}
        />

        {/* Other Filters */}
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {/* Keyword Filter */}
          <div>
            <Label htmlFor="keyword">Keyword</Label>
            <Input
              id="keyword"
              placeholder="Search by keyword"
              value={keyword}
              onChange={handleKeywordChange}
              className="mt-1.5"
            />
          </div>

          {/* Source Filter */}
          <div>
            <Label htmlFor="source">Source</Label>
            <Select value={source} onValueChange={handleSourceChange}>
              <SelectTrigger id="source" className="mt-1.5">
                <SelectValue placeholder="All Sources" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                {availableSources.map((src) => (
                  <SelectItem key={src} value={src}>
                    {src}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sentiment Filter */}
          <div>
            <Label htmlFor="sentiment">Sentiment</Label>
            <Select 
              value={sentiment} 
              onValueChange={handleSentimentChange}
            >
              <SelectTrigger id="sentiment" className="mt-1.5">
                <SelectValue placeholder="All Sentiments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sentiments</SelectItem>
                <SelectItem value="Positive">Positive</SelectItem>
                <SelectItem value="Neutral">Neutral</SelectItem>
                <SelectItem value="Negative">Negative</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Active Filters */}
      <div className="flex flex-wrap gap-2 mt-4">
        {(keyword || source !== 'all' || sentiment !== 'all') && (
          <Button variant="outline" size="sm" onClick={handleClearFilters} className="h-7">
            Clear Filters
            <X className="ml-2 h-3.5 w-3.5" />
          </Button>
        )}

        {keyword && (
          <Badge variant="outline" className="px-3 py-1">
            Keyword: {keyword}
            <button
              className="ml-1 text-muted-foreground hover:text-foreground"
              onClick={() => {
                setKeyword('')
                setTimeout(updateFilters, 0)
              }}
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        )}

        {source !== 'all' && (
          <Badge variant="outline" className="px-3 py-1">
            Source: {source}
            <button
              className="ml-1 text-muted-foreground hover:text-foreground"
              onClick={() => {
                setSource('all')
                setTimeout(updateFilters, 0)
              }}
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        )}

        {sentiment !== 'all' && (
          <Badge variant="outline" className="px-3 py-1">
            Sentiment: {sentiment}
            <button
              className="ml-1 text-muted-foreground hover:text-foreground"
              onClick={() => {
                setSentiment('all')
                setTimeout(updateFilters, 0)
              }}
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        )}
      </div>
    </div>
  )
} 