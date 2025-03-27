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
  initialFilters?: FilterOptions
}

export function FilterBar({ onFilterChange, availableSources, initialFilters }: FilterBarProps) {
  const [keyword, setKeyword] = useState<string>(initialFilters?.keyword || '')
  const [source, setSource] = useState<string>(initialFilters?.source || 'all')
  const [sentiment, setSentiment] = useState<'Positive' | 'Neutral' | 'Negative' | 'all'>(
    initialFilters?.sentiment || 'all'
  )
  const [date, setDate] = useState<DateRange | undefined>(
    initialFilters?.dateRange || {
      from: new Date(2000, 0, 1), // January 1, 2000 (all time)
      to: new Date(),
    }
  )

  // Helper function to create filters with the current state
  const createFilters = (
    currentKeyword = keyword,
    currentSource = source,
    currentSentiment = sentiment,
    currentDate = date
  ): FilterOptions => {
    // Create fresh date objects
    const fromDate = currentDate?.from ? new Date(currentDate.from.getTime()) : new Date(2000, 0, 1);
    const toDate = currentDate?.to ? new Date(currentDate.to.getTime()) : new Date();
    
    // Set proper time components
    fromDate.setHours(0, 0, 0, 0);
    toDate.setHours(23, 59, 59, 999);
    
    // Build filters object
    const filters: FilterOptions = {
      dateRange: { from: fromDate, to: toDate },
      _forceUpdate: Date.now()
    };
    
    // Add optional filters
    if (currentKeyword) filters.keyword = currentKeyword;
    if (currentSource !== 'all') filters.source = currentSource;
    if (currentSentiment !== 'all') filters.sentiment = currentSentiment;
    
    return filters;
  };

  // Handle user input changes
  const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newKeyword = e.target.value;
    setKeyword(newKeyword);
    
    const newFilters = createFilters(newKeyword, source, sentiment, date);
    console.log('Updating filters with keyword:', newFilters);
    onFilterChange(newFilters);
  }

  const handleSourceChange = (value: string) => {
    setSource(value);
    
    const newFilters = createFilters(keyword, value, sentiment, date);
    console.log('Updating filters with source:', newFilters);
    onFilterChange(newFilters);
  }

  const handleSentimentChange = (value: string) => {
    const newSentiment = value as 'Positive' | 'Neutral' | 'Negative' | 'all';
    setSentiment(newSentiment);
    
    const newFilters = createFilters(keyword, source, newSentiment, date);
    console.log('Updating filters with sentiment:', newFilters);
    onFilterChange(newFilters);
  }

  // Handle date range changes
  const handleDateChange = (range: DateRange | undefined) => {
    console.log('Date range changed:', range);
    
    // Create a default range if none provided or invalid
    let fromDate: Date;
    let toDate: Date;
    
    if (!range || !range.from) {
      // Default to all time
      fromDate = new Date(2000, 0, 1);
      toDate = new Date();
    } else {
      // Create fresh dates from the valid range
      fromDate = new Date(range.from.getTime());
      toDate = range.to ? new Date(range.to.getTime()) : new Date();
    }
    
    // Set proper time components
    fromDate.setHours(0, 0, 0, 0);
    toDate.setHours(23, 59, 59, 999);
    
    // Update local state for UI rendering
    const newRange = { from: fromDate, to: toDate };
    setDate(newRange);
    
    // Use helper to create filters
    const newFilters = createFilters(keyword, source, sentiment, newRange);
    console.log('Updating filters with date range:', newFilters);
    onFilterChange(newFilters);
  }

  // Clear all filters
  const handleClearFilters = () => {
    setKeyword('');
    setSource('all');
    setSentiment('all');
    
    // Set to all time
    const allTimeRange = {
      from: new Date(2000, 0, 1), // January 1, 2000 (all time)
      to: new Date(),
    };
    
    setDate(allTimeRange);
    
    // Create empty filters with just date range
    const newFilters = createFilters('', 'all', 'all', allTimeRange);
    console.log('Clearing all filters:', newFilters);
    onFilterChange(newFilters);
  }

  // Badge clear button handlers
  const handleClearKeyword = () => {
    setKeyword('');
    const newFilters = createFilters('', source, sentiment, date);
    onFilterChange(newFilters);
  }

  const handleClearSource = () => {
    setSource('all');
    const newFilters = createFilters(keyword, 'all', sentiment, date);
    onFilterChange(newFilters);
  }

  const handleClearSentiment = () => {
    setSentiment('all');
    const newFilters = createFilters(keyword, source, 'all', date);
    onFilterChange(newFilters);
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
              onClick={handleClearKeyword}
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
              onClick={handleClearSource}
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
              onClick={handleClearSentiment}
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        )}
      </div>
    </div>
  )
} 