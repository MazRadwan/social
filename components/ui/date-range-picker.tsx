"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"
import { format, parse, isValid } from "date-fns"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
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
  const [isCalendarOpen, setIsCalendarOpen] = React.useState(false)
  const [startDateText, setStartDateText] = React.useState("")
  const [endDateText, setEndDateText] = React.useState("")
  const [dropdownOpen, setDropdownOpen] = React.useState(false)
  
  // State for dropdown selectors
  const [startYear, setStartYear] = React.useState<string>("")
  const [startMonth, setStartMonth] = React.useState<string>("")
  const [startDay, setStartDay] = React.useState<string>("")
  
  // Update text inputs when dateRange changes
  React.useEffect(() => {
    if (dateRange?.from) {
      setStartDateText(format(dateRange.from, "yyyy-MM-dd"))
      setStartYear(dateRange.from.getFullYear().toString())
      setStartMonth((dateRange.from.getMonth() + 1).toString().padStart(2, '0'))
      setStartDay(dateRange.from.getDate().toString().padStart(2, '0'))
    }
    if (dateRange?.to) {
      setEndDateText(format(dateRange.to, "yyyy-MM-dd"))
    }
  }, [dateRange])

  // Quick select options
  const handleQuickSelect = (days: number | null) => {
    if (days === null) {
      // All time - use a very old date and today
      onDateRangeChange({
        from: new Date(2000, 0, 1),
        to: new Date(),
      })
    } else if (days === 365) {
      // Last year
      const to = new Date()
      const from = new Date()
      from.setFullYear(from.getFullYear() - 1)
      onDateRangeChange({ from, to })
    } else {
      // Last X days
      const to = new Date()
      const from = new Date()
      from.setDate(from.getDate() - days)
      onDateRangeChange({ from, to })
    }
  }

  // Handle manual input changes
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setStartDateText(value)
    
    const parsedDate = parse(value, "yyyy-MM-dd", new Date())
    if (isValid(parsedDate)) {
      onDateRangeChange({
        from: parsedDate,
        to: dateRange?.to,
      })
    }
  }

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setEndDateText(value)
    
    const parsedDate = parse(value, "yyyy-MM-dd", new Date())
    if (isValid(parsedDate)) {
      onDateRangeChange({
        from: dateRange?.from,
        to: parsedDate,
      })
    }
  }

  // Apply dropdown date selection
  const handleApplyDateSelection = () => {
    if (startYear && startMonth && startDay) {
      const dateString = `${startYear}-${startMonth}-${startDay}`
      const parsedDate = parse(dateString, "yyyy-MM-dd", new Date())
      
      if (isValid(parsedDate)) {
        onDateRangeChange({
          from: parsedDate,
          to: dateRange?.to || new Date(),
        })
      }
    }
    setDropdownOpen(false)
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
          variant="outline" 
          size="sm" 
          onClick={() => handleQuickSelect(30)}
          className={cn(
            "text-xs h-8",
            dateRange?.from && 
            dateRange.from.getTime() === new Date().setDate(new Date().getDate() - 30) &&
            "bg-primary text-primary-foreground hover:bg-primary/90"
          )}
        >
          Last 30 days
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => handleQuickSelect(90)}
          className="text-xs h-8"
        >
          Last 90 days
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => handleQuickSelect(365)}
          className="text-xs h-8"
        >
          Last year
        </Button>
        <Button 
          variant="outline" 
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
            <Popover open={dropdownOpen} onOpenChange={setDropdownOpen}>
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