"use client"

import { useState, useEffect } from 'react'
import { X, ChevronDown } from 'lucide-react'
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
import { cn } from '@/lib/utils'

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
  const [isExpanded, setIsExpanded] = useState(false)
  const [keyword, setKeyword] = useState<string>(initialFilters?.keyword || '')
  const [searchTags, setSearchTags] = useState<string[]>([])
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

  // Initialize searchTags from initialFilters if keyword exists
  useEffect(() => {
    if (initialFilters?.keyword) {
      setSearchTags([initialFilters.keyword]);
    }
  }, [initialFilters]);

  // Helper function to create filters with the current state
  const createFilters = (
    currentKeyword = '',
    currentSource = source,
    currentSentiment = sentiment,
    currentDate = date,
    currentSelectedKeyword = selectedKeyword,
    currentSearchTags = searchTags
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
    // If we have search tags, join them with OR for keyword search
    if (currentSearchTags.length > 0) {
      // Each term should be searched independently
      filters.keyword = currentSearchTags.join(' OR ');
    } else if (currentKeyword) {
      filters.keyword = currentKeyword;
    }
    
    if (currentSource !== 'all') filters.source = currentSource;
    if (currentSentiment !== 'all') filters.sentiment = currentSentiment;
    if (currentSelectedKeyword !== 'all keywords') filters.tag = currentSelectedKeyword;
    
    return filters;
  };

  // Handle user input changes
  const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newKeyword = e.target.value;
    setKeyword(newKeyword);
    
    // We don't update filters immediately on change anymore
    // Only update when Enter is pressed or when the keyword is cleared
    if (newKeyword === '') {
      const newFilters = createFilters('', source, sentiment, date, selectedKeyword, searchTags);
      onFilterChange(newFilters);
    }
  }

  // Handle Enter key press in the keyword search field
  const handleKeywordKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && keyword.trim()) {
      e.preventDefault();
      
      // Split the keyword by spaces and filter out empty strings
      const newTerms = keyword.trim().split(/\s+/).filter(term => term && term !== 'OR');
      
      // Add each term as a separate tag
      const newSearchTags = [...searchTags, ...newTerms];
      setSearchTags(newSearchTags);
      
      // Create filters with the updated search tags
      const newFilters = createFilters('', source, sentiment, date, selectedKeyword, newSearchTags);
      console.log('Search submitted with keyword tags:', newSearchTags);
      onFilterChange(newFilters);
      
      // Clear the search input
      setKeyword('');
    }
  }

  // Handle removing a search tag
  const handleRemoveSearchTag = (tagToRemove: string) => {
    const newSearchTags = searchTags.filter(tag => tag !== tagToRemove);
    setSearchTags(newSearchTags);
    
    // Update filters with the new tags
    const newFilters = createFilters('', source, sentiment, date, selectedKeyword, newSearchTags);
    onFilterChange(newFilters);
  }

  const handleSelectedKeywordChange = (value: string) => {
    setSelectedKeyword(value);
    
    const newFilters = createFilters(keyword, source, sentiment, date, value, searchTags);
    onFilterChange(newFilters);
  }

  const handleSourceChange = (value: string) => {
    setSource(value);
    
    const newFilters = createFilters(keyword, value, sentiment, date, selectedKeyword, searchTags);
    onFilterChange(newFilters);
  }

  const handleSentimentChange = (value: string) => {
    const newSentiment = value as 'Positive' | 'Neutral' | 'Negative' | 'all';
    setSentiment(newSentiment);
    
    const newFilters = createFilters(keyword, source, newSentiment, date, selectedKeyword, searchTags);
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
    const newFilters = createFilters(keyword, source, sentiment, newRange, selectedKeyword, searchTags);
    onFilterChange(newFilters);
  }

  // Clear all filters
  const handleClearFilters = () => {
    setKeyword('');
    setSearchTags([]);
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
    const newFilters = createFilters('', 'all', 'all', allTimeRange, 'all keywords', []);
    onFilterChange(newFilters);
  }

  // Badge clear button handlers
  const handleClearKeyword = () => {
    setKeyword('');
    const newFilters = createFilters('', source, sentiment, date, selectedKeyword, searchTags);
    onFilterChange(newFilters);
  }

  const handleClearSelectedKeyword = () => {
    setSelectedKeyword('all keywords');
    const newFilters = createFilters(keyword, source, sentiment, date, 'all keywords', searchTags);
    onFilterChange(newFilters);
  }

  const handleClearSource = () => {
    setSource('all');
    const newFilters = createFilters(keyword, 'all', sentiment, date, selectedKeyword, searchTags);
    onFilterChange(newFilters);
  }

  const handleClearSentiment = () => {
    setSentiment('all');
    const newFilters = createFilters(keyword, source, 'all', date, selectedKeyword, searchTags);
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

  // Handle removing all search tags at once
  const handleClearAllSearchTags = () => {
    setSearchTags([]);
    
    // Update filters without the tags
    const newFilters = createFilters('', source, sentiment, date, selectedKeyword, []);
    onFilterChange(newFilters);
  }

  return (
    <div className="space-y-4">
      <div className="bg-card border rounded-lg p-3 sm:p-4 w-full">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex flex-wrap gap-0">
              <Button
                variant="date-tab"
                size="sm"
                className="flex-1 py-2 px-4 h-auto rounded-l-md"
                data-state={isLastXDays(date, 30) ? "active" : "inactive"}
                onClick={() => handleQuickDateSelect(30)}
              >
                Last 30 days
              </Button>
              <Button
                variant="date-tab"
                size="sm"
                className="flex-1 py-2 px-4 h-auto"
                data-state={isLastXDays(date, 90) ? "active" : "inactive"}
                onClick={() => handleQuickDateSelect(90)}
              >
                Last 90 days
              </Button>
              <Button
                variant="date-tab"
                size="sm"
                className="flex-1 py-2 px-4 h-auto"
                data-state={isLastYear(date) ? "active" : "inactive"}
                onClick={() => handleQuickDateSelect(365)}
              >
                Last year
              </Button>
              <Button
                variant="date-tab"
                size="sm"
                className="flex-1 py-2 px-4 h-auto rounded-r-md"
                data-state={isAllTime(date) ? "active" : "inactive"}
                onClick={() => handleQuickDateSelect(null)}
              >
                All time
              </Button>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsExpanded(!isExpanded)}
              aria-label={isExpanded ? "Collapse filters" : "Expand filters"}
            >
              <ChevronDown
                className={cn("h-4 w-4 transition-transform", {
                  "rotate-180": isExpanded,
                })}
              />
            </Button>
          </div>

          {isExpanded && (
            <div className="space-y-4">
              {/* Clear Filters button */}
              {(searchTags.length > 0 || selectedKeyword !== 'all keywords' || source !== 'all' || sentiment !== 'all') && (
                <div className="flex justify-end">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleClearFilters} 
                    className="h-7 text-xs px-2.5"
                  >
                    Clear Filters
                    <X className="ml-1 h-3 w-3" />
                  </Button>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2 md:gap-3">
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

                <div>
                  <Label htmlFor="sentiment" className="text-xs">Sentiment</Label>
                  <Select value={sentiment} onValueChange={handleSentimentChange}>
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
            </div>
          )}
        </div>
      </div>

      {/* Keyword Search Field */}
      <div className="bg-card border rounded-lg p-3 sm:p-4">
        <div className="flex items-center justify-between mb-2">
          <Label htmlFor="keyword-search" className="text-xs">Search by keyword</Label>
          {searchTags.length > 0 && (
            <button 
              className="text-xs text-muted-foreground hover:text-foreground"
              onClick={handleClearAllSearchTags}
            >
              Clear all
            </button>
          )}
        </div>
        <div className="flex items-center border rounded-md bg-background px-2">
          <div className="flex-shrink h-9 min-w-[100px] w-auto">
            <Input
              id="keyword-search"
              placeholder="Enter search term..."
              value={keyword}
              onChange={handleKeywordChange}
              onKeyDown={handleKeywordKeyPress}
              className="border-0 w-full h-9 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
          <div className="flex-1 flex flex-wrap gap-1 py-1 pl-2">
            {searchTags.map((tag, index) => (
              <Badge 
                key={`inline-tag-${index}`} 
                variant="secondary" 
                className="h-6 text-xs flex items-center gap-1 bg-muted"
              >
                {tag}
                <button
                  type="button"
                  className="text-muted-foreground hover:text-foreground"
                  onClick={() => handleRemoveSearchTag(tag)}
                  aria-label={`Remove ${tag} tag`}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 