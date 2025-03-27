"use client"

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { DateRange } from 'react-day-picker'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { FilterOptions } from '@/lib/data/types'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import { format, parseISO } from 'date-fns'
import { Card, CardContent } from '@/components/ui/card'

interface FilterBarProps {
  onFilterChange: (filters: FilterOptions) => void
  availableSources: string[]
  initialFilters?: FilterOptions
}

// Define the list of monitoring keywords
const MONITORING_KEYWORDS = [
  "all keywords",
  "condominium act",
  "condominium authority tribunal",
  "condominium authority",
  "ontario condo laws"
]

export function FilterBar({ onFilterChange, availableSources, initialFilters }: FilterBarProps) {
  const [keyword, setKeyword] = useState<string>(initialFilters?.keyword || '')
  const [selectedKeyword, setSelectedKeyword] = useState<string>("all keywords")
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
    currentDate = date,
    currentSelectedKeyword = selectedKeyword
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
    if (currentSelectedKeyword !== 'all keywords') filters.tag = currentSelectedKeyword;
    
    return filters;
  };

  // Handle user input changes
  const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newKeyword = e.target.value;
    setKeyword(newKeyword);
    
    const newFilters = createFilters(newKeyword, source, sentiment, date, selectedKeyword);
    console.log('Updating filters with keyword:', newFilters);
    onFilterChange(newFilters);
  }

  const handleSelectedKeywordChange = (value: string) => {
    setSelectedKeyword(value);
    
    const newFilters = createFilters(keyword, source, sentiment, date, value);
    console.log('Updating filters with selected keyword:', newFilters);
    onFilterChange(newFilters);
  }

  const handleSourceChange = (value: string) => {
    setSource(value);
    
    const newFilters = createFilters(keyword, value, sentiment, date, selectedKeyword);
    console.log('Updating filters with source:', newFilters);
    onFilterChange(newFilters);
  }

  const handleSentimentChange = (value: string) => {
    const newSentiment = value as 'Positive' | 'Neutral' | 'Negative' | 'all';
    setSentiment(newSentiment);
    
    const newFilters = createFilters(keyword, source, newSentiment, date, selectedKeyword);
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
    const newFilters = createFilters(keyword, source, sentiment, newRange, selectedKeyword);
    console.log('Updating filters with date range:', newFilters);
    onFilterChange(newFilters);
  }

  // Clear all filters
  const handleClearFilters = () => {
    setKeyword('');
    setSelectedKeyword('all keywords');
    setSource('all');
    setSentiment('all');
    
    // Set to all time
    const allTimeRange = {
      from: new Date(2000, 0, 1), // January 1, 2000 (all time)
      to: new Date(),
    };
    
    setDate(allTimeRange);
    
    // Create empty filters with just date range
    const newFilters = createFilters('', 'all', 'all', allTimeRange, 'all keywords');
    console.log('Clearing all filters:', newFilters);
    onFilterChange(newFilters);
  }

  // Badge clear button handlers
  const handleClearKeyword = () => {
    setKeyword('');
    const newFilters = createFilters('', source, sentiment, date, selectedKeyword);
    onFilterChange(newFilters);
  }

  const handleClearSelectedKeyword = () => {
    setSelectedKeyword('all keywords');
    const newFilters = createFilters(keyword, source, sentiment, date, 'all keywords');
    onFilterChange(newFilters);
  }

  const handleClearSource = () => {
    setSource('all');
    const newFilters = createFilters(keyword, 'all', sentiment, date, selectedKeyword);
    onFilterChange(newFilters);
  }

  const handleClearSentiment = () => {
    setSentiment('all');
    const newFilters = createFilters(keyword, source, 'all', date, selectedKeyword);
    onFilterChange(newFilters);
  }

  const handleQuickDateSelect = (days: number | null) => {
    const currentDate = new Date();
    let newDate: DateRange | undefined;

    if (days === null) {
      newDate = { from: new Date(2000, 0, 1), to: new Date() };
    } else {
      const newFromDate = new Date(currentDate);
      newFromDate.setDate(currentDate.getDate() - days);
      newDate = { from: newFromDate, to: currentDate };
    }

    handleDateChange(newDate);
  };

  const isLastXDays = (dateRange: DateRange | undefined, days: number) => {
    if (!dateRange || !dateRange.from || !dateRange.to) return false;
    
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    
    const fromDate = new Date(dateRange.from);
    const toDate = new Date(dateRange.to);
    
    // Check if "to" date is today (or within 1 day)
    const isToDateToday = Math.abs(toDate.getTime() - today.getTime()) < (24 * 60 * 60 * 1000);
    
    // Calculate expected "from" date
    const expectedFromDate = new Date(today);
    expectedFromDate.setDate(today.getDate() - days);
    expectedFromDate.setHours(0, 0, 0, 0);
    
    // Allow 1 day tolerance for the from date
    const isFromDateCorrect = Math.abs(fromDate.getTime() - expectedFromDate.getTime()) < (24 * 60 * 60 * 1000);
    
    return isToDateToday && isFromDateCorrect;
  };

  const isLastYear = (dateRange: DateRange | undefined) => {
    if (!dateRange || !dateRange.from || !dateRange.to) return false;
    
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    
    const fromDate = new Date(dateRange.from);
    const toDate = new Date(dateRange.to);
    
    // Check if "to" date is today (or within 1 day)
    const isToDateToday = Math.abs(toDate.getTime() - today.getTime()) < (24 * 60 * 60 * 1000);
    
    // Calculate expected "from" date (1 year ago)
    const expectedFromDate = new Date(today);
    expectedFromDate.setFullYear(today.getFullYear() - 1);
    expectedFromDate.setHours(0, 0, 0, 0);
    
    // Allow 2 day tolerance for the from date (accounting for leap years)
    const isFromDateCorrect = Math.abs(fromDate.getTime() - expectedFromDate.getTime()) < (2 * 24 * 60 * 60 * 1000);
    
    return isToDateToday && isFromDateCorrect;
  };

  const isAllTime = (dateRange: DateRange | undefined) => {
    if (!dateRange || !dateRange.from || !dateRange.to) return false;
    
    // Check if the "from" date is Jan 1, 2000 (or close to it)
    const fromDate = new Date(dateRange.from);
    const allTimeStart = new Date(2000, 0, 1);
    
    // Within one day tolerance for comparison
    const isStartAllTime = Math.abs(fromDate.getTime() - allTimeStart.getTime()) < (24 * 60 * 60 * 1000);
    
    // The "to" date should be today or within a day of today
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const toDate = new Date(dateRange.to);
    const isEndRecent = Math.abs(toDate.getTime() - today.getTime()) < (24 * 60 * 60 * 1000);
    
    return isStartAllTime && isEndRecent;
  };

  return (
    <div className="space-y-4">
      <div className="bg-card border rounded-lg p-3 sm:p-4 w-full">
        <div className="space-y-4">
          {/* Date Range Quick Buttons - Moved to top */}
          <div className="flex flex-wrap gap-1.5">
            <Button
              variant={isLastXDays(date, 30) ? "default" : "outline"}
              size="sm"
              className="h-7 text-xs px-2.5"
              onClick={() => handleQuickDateSelect(30)}
            >
              Last 30 days
            </Button>
            <Button
              variant={isLastXDays(date, 90) ? "default" : "outline"}
              size="sm"
              className="h-7 text-xs px-2.5"
              onClick={() => handleQuickDateSelect(90)}
            >
              Last 90 days
            </Button>
            <Button
              variant={isLastYear(date) ? "default" : "outline"}
              size="sm"
              className="h-7 text-xs px-2.5"
              onClick={() => handleQuickDateSelect(365)}
            >
              Last year
            </Button>
            <Button
              variant={isAllTime(date) ? "default" : "outline"}
              size="sm"
              className="h-7 text-xs px-2.5"
              onClick={() => handleQuickDateSelect(null)}
            >
              All time
            </Button>

            {/* Clear Filters Button */}
            {(keyword || selectedKeyword !== 'all keywords' || source !== 'all' || sentiment !== 'all') && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleClearFilters} 
                className="ml-auto h-7 text-xs px-2.5"
              >
                Clear Filters
                <X className="ml-1 h-3 w-3" />
              </Button>
            )}
          </div>

          {/* Single row layout with all filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2 md:gap-3">
            {/* Start Date */}
            <div>
              <Label htmlFor="start-date" className="text-xs">Start Date</Label>
              <div className="flex items-center mt-1">
                <Input
                  id="start-date"
                  type="date"
                  value={date?.from ? format(date.from, 'yyyy-MM-dd') : ''}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    const fromDate = newValue ? parseISO(newValue) : new Date(2000, 0, 1);
                    const toDate = date?.to || new Date();
                    handleDateChange({ from: fromDate, to: toDate });
                  }}
                  className="w-full"
                />
              </div>
            </div>

            {/* End Date */}
            <div>
              <Label htmlFor="end-date" className="text-xs">End Date</Label>
              <div className="flex items-center mt-1">
                <Input
                  id="end-date"
                  type="date"
                  value={date?.to ? format(date.to, 'yyyy-MM-dd') : ''}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    const toDate = newValue ? parseISO(newValue) : new Date();
                    const fromDate = date?.from || new Date(2000, 0, 1);
                    handleDateChange({ from: fromDate, to: toDate });
                  }}
                  className="w-full"
                />
              </div>
            </div>

            {/* Monitoring Keyword Dropdown - Replaced keyword input */}
            <div>
              <Label htmlFor="monitoring-keyword" className="text-xs">Monitoring Keyword</Label>
              <Select value={selectedKeyword} onValueChange={handleSelectedKeywordChange}>
                <SelectTrigger id="monitoring-keyword" className="mt-1 w-full">
                  <SelectValue placeholder="All Keywords" />
                </SelectTrigger>
                <SelectContent>
                  {MONITORING_KEYWORDS.map((kw) => (
                    <SelectItem key={kw} value={kw}>
                      {kw}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Source Filter */}
            <div>
              <Label htmlFor="source" className="text-xs">Source</Label>
              <Select value={source} onValueChange={handleSourceChange}>
                <SelectTrigger id="source" className="mt-1 w-full">
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
              <Label htmlFor="sentiment" className="text-xs">Sentiment</Label>
              <Select 
                value={sentiment} 
                onValueChange={handleSentimentChange}
              >
                <SelectTrigger id="sentiment" className="mt-1 w-full">
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

          {/* Active Filters */}
          {(keyword || selectedKeyword !== 'all keywords' || source !== 'all' || sentiment !== 'all') && (
            <div className="flex flex-wrap gap-2 mt-3">
              {keyword && (
                <Badge variant="outline" className="px-3 py-1">
                  Search: {keyword}
                  <button
                    className="ml-1 text-muted-foreground hover:text-foreground"
                    onClick={handleClearKeyword}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}

              {selectedKeyword !== 'all keywords' && (
                <Badge variant="outline" className="px-3 py-1">
                  Keyword: {selectedKeyword}
                  <button
                    className="ml-1 text-muted-foreground hover:text-foreground"
                    onClick={handleClearSelectedKeyword}
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
          )}
        </div>
      </div>

      {/* Keyword Search Field - Moved below filter bar */}
      <Card className="bg-card border rounded-lg w-full">
        <CardContent className="p-3 sm:p-4">
          <div>
            <Label htmlFor="keyword-search" className="text-xs">Search by keyword</Label>
            <Input
              id="keyword-search"
              placeholder="Enter search term..."
              value={keyword}
              onChange={handleKeywordChange}
              className="mt-1 w-full"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 