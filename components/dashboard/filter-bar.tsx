"use client"

import { useState, useEffect } from 'react'
import { X, ChevronDown, Filter } from 'lucide-react'
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
  const [selectedKeyword, setSelectedKeyword] = useState<string>(initialFilters?.tag || "all keywords")
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
  const [assignedIssue, setAssignedIssue] = useState<string>(initialFilters?.assigned_issue || 'all')
  const [availableIssues, setAvailableIssues] = useState<string[]>([])
  const [issuesLoading, setIssuesLoading] = useState(false)
  const [activeFilters, setActiveFilters] = useState<{
    keywords: string[];
    sources: string[];
    sentiments: string[];
    issues: string[];
  }>({
    keywords: selectedKeyword !== 'all keywords' ? [selectedKeyword] : [],
    sources: source !== 'all' ? [source] : [],
    sentiments: sentiment !== 'all' ? [sentiment] : [],
    issues: assignedIssue !== 'all' ? [assignedIssue] : [],
  });

  // Fetch available issues from the API
  useEffect(() => {
    const fetchIssues = async () => {
      setIssuesLoading(true);
      try {
        // Fetch unique issues from the API
        const response = await fetch('/api/issues');
        if (!response.ok) {
          throw new Error('Failed to fetch issues');
        }
        const data = await response.json();
        setAvailableIssues(data.issues || []);
      } catch (error) {
        console.error('Error fetching issues:', error);
        // Fallback to static list if API fails
        setAvailableIssues(['Issue 1', 'Issue 2', 'Issue 3']);
      } finally {
        setIssuesLoading(false);
      }
    };

    fetchIssues();
  }, []);

  // Helper function to create filters with the current state
  const createFilters = (
    currentSource = source,
    currentSentiment = sentiment,
    currentDate = date,
    currentSelectedKeyword = selectedKeyword,
    currentAssignedIssue = assignedIssue,
    currentActiveFilters = activeFilters
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
    
    // Add optional filters - using the last selected value for compatibility
    if (currentActiveFilters.sources.length > 0) filters.source = currentActiveFilters.sources[currentActiveFilters.sources.length - 1];
    if (currentActiveFilters.sentiments.length > 0) filters.sentiment = currentActiveFilters.sentiments[currentActiveFilters.sentiments.length - 1] as any;
    if (currentActiveFilters.keywords.length > 0 && currentActiveFilters.keywords[0] !== 'all keywords') filters.tag = currentActiveFilters.keywords[currentActiveFilters.keywords.length - 1];
    if (currentActiveFilters.issues.length > 0) filters.assigned_issue = currentActiveFilters.issues[currentActiveFilters.issues.length - 1];
    
    return filters;
  };

  const handleSelectedKeywordChange = (value: string) => {
    // Don't add 'all keywords' to active filters
    if (value === 'all keywords') {
      setSelectedKeyword(value);
      // Clear all keyword filters
      const newActiveFilters = {
        ...activeFilters,
        keywords: []
      };
      setActiveFilters(newActiveFilters);
      
      const newFilters = createFilters(source, sentiment, date, value, assignedIssue, newActiveFilters);
      onFilterChange(newFilters);
      return;
    }
    
    setSelectedKeyword(value);
    
    // Add to active filters if not already present
    if (!activeFilters.keywords.includes(value)) {
      const newActiveFilters = {
        ...activeFilters,
        keywords: [...activeFilters.keywords, value]
      };
      setActiveFilters(newActiveFilters);
      
      const newFilters = createFilters(source, sentiment, date, value, assignedIssue, newActiveFilters);
      onFilterChange(newFilters);
    }
  }

  const handleSourceChange = (value: string) => {
    // Don't add 'all' to active filters
    if (value === 'all') {
      setSource(value);
      // Clear all source filters
      const newActiveFilters = {
        ...activeFilters,
        sources: []
      };
      setActiveFilters(newActiveFilters);
      
      const newFilters = createFilters(value, sentiment, date, selectedKeyword, assignedIssue, newActiveFilters);
      onFilterChange(newFilters);
      return;
    }
    
    setSource(value);
    
    // Add to active filters if not already present
    if (!activeFilters.sources.includes(value)) {
      const newActiveFilters = {
        ...activeFilters,
        sources: [...activeFilters.sources, value]
      };
      setActiveFilters(newActiveFilters);
      
      const newFilters = createFilters(value, sentiment, date, selectedKeyword, assignedIssue, newActiveFilters);
      onFilterChange(newFilters);
    }
  }

  const handleSentimentChange = (value: string) => {
    const newSentiment = value as 'Positive' | 'Neutral' | 'Negative' | 'all';
    
    // Don't add 'all' to active filters
    if (newSentiment === 'all') {
      setSentiment(newSentiment);
      // Clear all sentiment filters
      const newActiveFilters = {
        ...activeFilters,
        sentiments: []
      };
      setActiveFilters(newActiveFilters);
      
      const newFilters = createFilters(source, newSentiment, date, selectedKeyword, assignedIssue, newActiveFilters);
      onFilterChange(newFilters);
      return;
    }
    
    setSentiment(newSentiment);
    
    // Add to active filters if not already present
    if (!activeFilters.sentiments.includes(newSentiment)) {
      const newActiveFilters = {
        ...activeFilters,
        sentiments: [...activeFilters.sentiments, newSentiment]
      };
      setActiveFilters(newActiveFilters);
      
      const newFilters = createFilters(source, newSentiment, date, selectedKeyword, assignedIssue, newActiveFilters);
      onFilterChange(newFilters);
    }
  }

  const handleAssignedIssueChange = (value: string) => {
    // Don't add 'all' to active filters
    if (value === 'all') {
      setAssignedIssue(value);
      // Clear all issue filters
      const newActiveFilters = {
        ...activeFilters,
        issues: []
      };
      setActiveFilters(newActiveFilters);
      
      const newFilters = createFilters(source, sentiment, date, selectedKeyword, value, newActiveFilters);
      onFilterChange(newFilters);
      return;
    }
    
    setAssignedIssue(value);
    
    // Add to active filters if not already present
    if (!activeFilters.issues.includes(value)) {
      const newActiveFilters = {
        ...activeFilters,
        issues: [...activeFilters.issues, value]
      };
      setActiveFilters(newActiveFilters);
      
      const newFilters = createFilters(source, sentiment, date, selectedKeyword, value, newActiveFilters);
      onFilterChange(newFilters);
    }
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
    const newFilters = createFilters(source, sentiment, newRange, selectedKeyword, assignedIssue, activeFilters);
    onFilterChange(newFilters);
  }

  // Clear all filters
  const handleClearFilters = () => {
    setSelectedKeyword('all keywords');
    setSource('all');
    setSentiment('all');
    setAssignedIssue('all');
    
    // Clear all active filters
    setActiveFilters({
      keywords: [],
      sources: [],
      sentiments: [],
      issues: []
    });
    
    // Set to all time
    const allTimeRange = {
      from: new Date(2000, 0, 1), // January 1, 2000 (all time)
      to: new Date(),
    };
    
    setDate(allTimeRange);
    
    // Create empty filters with just date range
    const newFilters = createFilters('all', 'all', allTimeRange, 'all keywords', 'all', {
      keywords: [],
      sources: [],
      sentiments: [],
      issues: []
    });
    onFilterChange(newFilters);
  }

  // Badge clear button handlers
  const handleRemoveFilter = (type: 'keywords' | 'sources' | 'sentiments' | 'issues', value: string) => {
    const newActiveFilters = { ...activeFilters };
    
    // Remove the value from the appropriate array
    newActiveFilters[type] = newActiveFilters[type].filter(item => item !== value);
    
    // Update default dropdown values if needed
    if (type === 'keywords' && newActiveFilters.keywords.length === 0) {
      setSelectedKeyword('all keywords');
    }
    if (type === 'sources' && newActiveFilters.sources.length === 0) {
      setSource('all');
    }
    if (type === 'sentiments' && newActiveFilters.sentiments.length === 0) {
      setSentiment('all');
    }
    if (type === 'issues' && newActiveFilters.issues.length === 0) {
      setAssignedIssue('all');
    }
    
    // Update active filters
    setActiveFilters(newActiveFilters);
    
    // Create new filters based on updated state
    const newFilters = createFilters(
      type === 'sources' && newActiveFilters.sources.length === 0 ? 'all' : source,
      type === 'sentiments' && newActiveFilters.sentiments.length === 0 ? 'all' : sentiment,
      date,
      type === 'keywords' && newActiveFilters.keywords.length === 0 ? 'all keywords' : selectedKeyword,
      type === 'issues' && newActiveFilters.issues.length === 0 ? 'all' : assignedIssue,
      newActiveFilters
    );
    
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
              {(activeFilters.keywords.length > 0 || activeFilters.sources.length > 0 || 
                activeFilters.sentiments.length > 0 || activeFilters.issues.length > 0) && (
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

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-2 md:gap-3">
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

                {/* Assigned Issue Dropdown */}
                <div>
                  <Label htmlFor="assigned-issue" className="text-xs">Assigned Issue</Label>
                  <Select value={assignedIssue} onValueChange={handleAssignedIssueChange}>
                    <SelectTrigger id="assigned-issue" className="mt-1 w-full">
                      <SelectValue placeholder="All Issues" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Issues</SelectItem>
                      {availableIssues.map((issue) => (
                        <SelectItem key={issue} value={issue}>
                          {issue}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Active Filters Display */}
              {(activeFilters.keywords.length > 0 || activeFilters.sources.length > 0 || 
                activeFilters.sentiments.length > 0 || activeFilters.issues.length > 0) && (
                <div className="mt-4 flex flex-wrap gap-2 items-center">
                  <div className="flex items-center">
                    <Filter className="h-4 w-4 mr-2" />
                    <span className="text-sm font-medium">Active Filters:</span>
                  </div>
                  
                  {activeFilters.keywords.map(keyword => (
                    <Badge key={`keyword-${keyword}`} variant="secondary" className="flex items-center gap-1">
                      {keyword}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => handleRemoveFilter('keywords', keyword)} 
                      />
                    </Badge>
                  ))}
                  
                  {activeFilters.sources.map(src => (
                    <Badge key={`source-${src}`} variant="secondary" className="flex items-center gap-1">
                      {src}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => handleRemoveFilter('sources', src)} 
                      />
                    </Badge>
                  ))}
                  
                  {activeFilters.sentiments.map(sent => (
                    <Badge key={`sentiment-${sent}`} variant="secondary" className="flex items-center gap-1">
                      {sent}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => handleRemoveFilter('sentiments', sent)} 
                      />
                    </Badge>
                  ))}
                  
                  {activeFilters.issues.map(issue => (
                    <Badge key={`issue-${issue}`} variant="secondary" className="flex items-center gap-1">
                      {issue}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => handleRemoveFilter('issues', issue)} 
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 