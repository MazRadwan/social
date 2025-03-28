"use client"

import { useState, useEffect } from 'react'
import { X, ChevronDown, ChevronUp } from 'lucide-react'
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
  const [filtersExpanded, setFiltersExpanded] = useState<boolean>(false)

  // Initialize searchTags from initialFilters if keyword exists
  useEffect(() => {
    if (initialFilters?.keyword) {
      // Split by OR to handle pre-existing search strings
      if (initialFilters.keyword.includes(' OR ')) {
        const tags = initialFilters.keyword.split(' OR ').map(tag => tag.trim());
        setSearchTags(tags);
      } else {
        setSearchTags([initialFilters.keyword]);
      }
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
      // Each term should be searched independently, but joined for the API
      const cleanTags = currentSearchTags.map(tag => tag.trim()).filter(Boolean);
      if (cleanTags.length > 0) {
        filters.keyword = cleanTags.join(' OR ');
        
        // Store the original tags for UI display purposes
        (filters as any)._originalTags = [...cleanTags];
      }
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
      
      // Add to search tags
      const newSearchTags = [...searchTags, keyword.trim()];
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

  // Toggle filters expanded/collapsed state
  const toggleFilters = () => {
    setFiltersExpanded(!filtersExpanded);
  };

  return (
    <div className="space-y-4">
      <Card className="bg-card border rounded-lg w-full">
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center justify-between mb-2">
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
            </div>
            
            <div className="flex items-center gap-2">
              {/* Clear Filters Button */}
              {(searchTags.length > 0 || selectedKeyword !== 'all keywords' || source !== 'all' || sentiment !== 'all') && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleClearFilters} 
                  className="h-7 text-xs px-2.5"
                >
                  Clear Filters
                  <X className="ml-1 h-3 w-3" />
                </Button>
              )}
              
              {/* Toggle Expand/Collapse Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFilters}
                className="h-7 w-7 p-0"
                aria-label={filtersExpanded ? "Collapse filters" : "Expand filters"}
              >
                {filtersExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          
          {/* Collapsible content */}
          {filtersExpanded && (
            <div className="space-y-4">
              {/* Single row layout with all filters */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2 md:gap-3">
                {/* Start Date Input */}
                <div>
                  <Label htmlFor="start-date" className="text-xs">Start Date</Label>
                  <DateRangePicker
                    dateRange={date}
                    onDateRangeChange={handleDateChange}
                    className="mt-1 w-full"
                  />
                </div>
                
                {/* End Date Input */}
                <div>
                  <Label htmlFor="end-date" className="text-xs">End Date</Label>
                  <DateRangePicker
                    dateRange={date}
                    onDateRangeChange={handleDateChange}
                    className="mt-1 w-full"
                  />
                </div>
                
                {/* Monitoring Keyword Dropdown */}
                <div>
                  <Label htmlFor="monitoring-keyword" className="text-xs">Monitoring Keyword</Label>
                  <Select 
                    value={selectedKeyword} 
                    onValueChange={handleSelectedKeywordChange}
                  >
                    <SelectTrigger id="monitoring-keyword" className="mt-1 w-full">
                      <SelectValue placeholder="Select keyword" />
                    </SelectTrigger>
                    <SelectContent>
                      {MONITORING_KEYWORDS.map((keyword) => (
                        <SelectItem key={keyword} value={keyword}>
                          {keyword}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Source Dropdown */}
                <div>
                  <Label htmlFor="source" className="text-xs">Source</Label>
                  <Select 
                    value={source} 
                    onValueChange={handleSourceChange}
                  >
                    <SelectTrigger id="source" className="mt-1 w-full">
                      <SelectValue placeholder="Select source" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Sources</SelectItem>
                      {availableSources.map((source) => (
                        <SelectItem key={source} value={source}>
                          {source}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Sentiment Dropdown */}
                <div>
                  <Label htmlFor="sentiment" className="text-xs">Sentiment</Label>
                  <Select 
                    value={sentiment} 
                    onValueChange={handleSentimentChange}
                  >
                    <SelectTrigger id="sentiment" className="mt-1 w-full">
                      <SelectValue placeholder="Select sentiment" />
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
              {(selectedKeyword !== 'all keywords' || source !== 'all' || sentiment !== 'all') && (
                <div className="flex flex-wrap gap-2 mt-3">
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
          )}
        </CardContent>
      </Card>

      {/* Keyword Search Field - Moved below filter bar */}
      <Card className="bg-card border rounded-lg w-full">
        <CardContent className="p-3 sm:p-4">
          <div className="relative">
            <div className="flex justify-between items-center">
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
            <div className="flex items-center flex-wrap gap-1 mt-1 p-1 border rounded-md bg-background">
              <Input
                id="keyword-search"
                placeholder={searchTags.length > 0 ? "" : "Enter search term..."}
                value={keyword}
                onChange={handleKeywordChange}
                onKeyDown={handleKeywordKeyPress}
                className="flex-1 min-w-[120px] border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-1"
              />
              {searchTags.map((tag, index) => (
                <Badge 
                  key={`inline-tag-${index}`} 
                  variant="secondary" 
                  className="px-2 py-0.5 h-7 flex items-center gap-1 whitespace-nowrap"
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
        </CardContent>
      </Card>
    </div>
  )
} 