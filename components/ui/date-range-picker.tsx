"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"
import { format, parse, isValid } from "date-fns"
import { DateRange } from "react-day-picker"
import { useState } from "react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
// import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface DateRangePickerProps {
  dateRange: DateRange | undefined
  onDateRangeChange: (dateRange: DateRange | undefined) => void
  className?: string
}

export function DateRangePicker({
  dateRange,
  onDateRangeChange,
  className,
}: DateRangePickerProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  
  // State for dropdown selectors - only used for the dropdown UI
  const [startYear, setStartYear] = useState<string>("")
  const [startMonth, setStartMonth] = useState<string>("")
  const [startDay, setStartDay] = useState<string>("")

  // Compute text values directly from props
  const startDateText = dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : ""
  const endDateText = dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : ""
  
  // Helper functions for date range type detection
  const isLastXDays = (days: number): boolean => {
    if (!dateRange?.from) return false;
    
    // Get today with time set to start of day
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Calculate target date same way as handleQuickSelect
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() - days);
    targetDate.setHours(0, 0, 0, 0);
    
    // Get from date without time
    const fromDate = new Date(dateRange.from);
    fromDate.setHours(0, 0, 0, 0);
    
    // Calculate difference in days
    const diffTime = Math.abs(fromDate.getTime() - targetDate.getTime());
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    
    // Allow up to 2 days of offset for better tolerance
    return diffDays <= 2;
  };

  const isLastYear = (): boolean => {
    if (!dateRange?.from) return false;
    
    // Get today with time set to start of day
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Calculate one year ago same way as handleQuickSelect
    const oneYearAgo = new Date(today);
    oneYearAgo.setFullYear(today.getFullYear() - 1);
    oneYearAgo.setHours(0, 0, 0, 0);
    
    // Get from date without time
    const fromDate = new Date(dateRange.from);
    fromDate.setHours(0, 0, 0, 0);
    
    // Calculate difference in days
    const diffTime = Math.abs(fromDate.getTime() - oneYearAgo.getTime());
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    
    // Allow up to 3 days of offset for better tolerance (considering leap years)
    return diffDays <= 3;
  };

  const isAllTime = (): boolean => {
    if (!dateRange?.from) return false;
    
    const fromDate = new Date(dateRange.from);
    fromDate.setHours(0, 0, 0, 0);
    
    // Use the same approach - check if year is 2000 and month is January
    return fromDate.getFullYear() === 2000 && fromDate.getMonth() === 0;
  };

  // Quick select options with immediate callback and complete state preparation
  const handleQuickSelect = (days: number | null) => {
    let from, to;
    
    // End of today for the "to" date
    to = new Date();
    to.setHours(23, 59, 59, 999);
    
    if (days === null) {
      // All time - January 1, 2000
      from = new Date(2000, 0, 1);
    } else if (days === 365) {
      // Last year - exactly 365 days ago
      from = new Date();
      from.setFullYear(from.getFullYear() - 1);
    } else {
      // Last X days
      from = new Date();
      from.setDate(from.getDate() - days);
    }
    
    // Ensure consistent start of day
    from.setHours(0, 0, 0, 0);
    
    console.log(`Quick select direct: ${days === null ? 'all time' : days + ' days'}`, { 
      from: from.toISOString(), 
      to: to.toISOString() 
    });
    
    // Force a fresh date range object every time
    const newRange: DateRange = {
      from: new Date(from),
      to: new Date(to)
    };
    
    // Immediately notify parent with complete change
    onDateRangeChange(newRange);
  }

  // Handle manual input changes
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    
    const parsedDate = parse(value, "yyyy-MM-dd", new Date())
    if (isValid(parsedDate)) {
      // Create a new date range object to avoid reference issues
      const newRange = {
        from: parsedDate,
        to: dateRange?.to,
      };
      console.log('Manual start date change:', newRange);
      onDateRangeChange(newRange);
    }
  }

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    
    const parsedDate = parse(value, "yyyy-MM-dd", new Date())
    if (isValid(parsedDate)) {
      // Ensure end date is set to the end of the day
      parsedDate.setHours(23, 59, 59, 999);
      
      // Create a new date range object to avoid reference issues
      const newRange = {
        from: dateRange?.from,
        to: parsedDate,
      };
      console.log('Manual end date change:', newRange);
      onDateRangeChange(newRange);
    }
  }

  // Apply dropdown date selection
  const handleApplyDateSelection = () => {
    if (startYear && startMonth && startDay) {
      const dateString = `${startYear}-${startMonth}-${startDay}`
      const parsedDate = parse(dateString, "yyyy-MM-dd", new Date())
      
      if (isValid(parsedDate)) {
        const newRange = {
          from: parsedDate,
          to: dateRange?.to || new Date(),
        };
        console.log('Dropdown date selection:', newRange);
        onDateRangeChange(newRange);
      }
    }
    setDropdownOpen(false)
  }

  // Update dropdown values when calendar button is clicked
  const handleCalendarButtonClick = () => {
    if (dateRange?.from) {
      setStartYear(dateRange.from.getFullYear().toString())
      setStartMonth((dateRange.from.getMonth() + 1).toString().padStart(2, '0'))
      setStartDay(dateRange.from.getDate().toString().padStart(2, '0'))
    }
  }

  // Generate year options (2000 to current year)
  const years = Array.from({ length: new Date().getFullYear() - 1999 }, (_, i) => 
    (2000 + i).toString()
  )
  
  // Generate month options
  const months = [
    { value: "01", label: "Jan" },
    { value: "02", label: "Feb" },
    { value: "03", label: "Mar" },
    { value: "04", label: "Apr" },
    { value: "05", label: "May" },
    { value: "06", label: "Jun" },
    { value: "07", label: "Jul" },
    { value: "08", label: "Aug" },
    { value: "09", label: "Sep" },
    { value: "10", label: "Oct" },
    { value: "11", label: "Nov" },
    { value: "12", label: "Dec" },
  ]
  
  // Generate day options (1-31)
  const days = Array.from({ length: 31 }, (_, i) => 
    (i + 1).toString().padStart(2, '0')
  )

  return (
    <div className={cn("space-y-4", className)}>
      <div className="text-sm font-medium">Date Range</div>
      
      {/* Quick select buttons */}
      <div className="flex flex-wrap gap-2">
        <Button 
          variant={isLastXDays(30) ? "default" : "outline"} 
          size="sm" 
          onClick={() => handleQuickSelect(30)}
          className="text-xs h-8"
        >
          Last 30 days
        </Button>
        <Button 
          variant={isLastXDays(90) ? "default" : "outline"} 
          size="sm" 
          onClick={() => handleQuickSelect(90)}
          className="text-xs h-8"
        >
          Last 90 days
        </Button>
        <Button 
          variant={isLastYear() ? "default" : "outline"} 
          size="sm" 
          onClick={() => handleQuickSelect(365)}
          className="text-xs h-8"
        >
          Last year
        </Button>
        <Button 
          variant={isAllTime() ? "default" : "outline"} 
          size="sm" 
          onClick={() => handleQuickSelect(null)}
          className="text-xs h-8"
        >
          All time
        </Button>
      </div>
      
      {/* Date inputs */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <div className="text-sm mb-1">Start Date</div>
          <div className="relative">
            <Input
              type="text"
              placeholder="YYYY-MM-DD"
              value={startDateText}
              onChange={handleStartDateChange}
              className="pr-10"
            />
            <Popover 
              open={dropdownOpen} 
              onOpenChange={(open) => {
                setDropdownOpen(open);
                if (open) handleCalendarButtonClick();
              }}
            >
              <PopoverTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 py-1"
                >
                  <CalendarIcon className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-4" align="start">
                <div className="grid grid-cols-3 gap-2">
                  <Select value={startYear} onValueChange={setStartYear}>
                    <SelectTrigger>
                      <SelectValue placeholder="Year" />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map(year => (
                        <SelectItem key={year} value={year}>{year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select value={startMonth} onValueChange={setStartMonth}>
                    <SelectTrigger>
                      <SelectValue placeholder="Month" />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map(month => (
                        <SelectItem key={month.value} value={month.value}>
                          {month.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select value={startDay} onValueChange={setStartDay}>
                    <SelectTrigger>
                      <SelectValue placeholder="Day" />
                    </SelectTrigger>
                    <SelectContent>
                      {days.map(day => (
                        <SelectItem key={day} value={day}>{day}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <Button 
                  className="w-full mt-4" 
                  onClick={handleApplyDateSelection}
                >
                  Apply
                </Button>
              </PopoverContent>
            </Popover>
          </div>
        </div>
        
        <div>
          <div className="text-sm mb-1">End Date</div>
          <Input
            type="text"
            placeholder="YYYY-MM-DD"
            value={endDateText}
            onChange={handleEndDateChange}
          />
        </div>
      </div>
      
      {/* Date range summary */}
      <div className="text-center p-2 bg-muted/30 rounded-md text-sm">
        {dateRange?.from ? (
          dateRange.to ? (
            <>
              {format(dateRange.from, "MMM dd, yyyy")} - {format(dateRange.to, "MMM dd, yyyy")}
            </>
          ) : (
            format(dateRange.from, "MMM dd, yyyy")
          )
        ) : (
          <span>Select a date range</span>
        )}
      </div>
    </div>
  )
} 