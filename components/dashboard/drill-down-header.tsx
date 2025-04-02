"use client"

import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

interface DrillDownHeaderProps {
  type: 'source' | 'sentiment' | 'issue' | 'date' | null;
  value: string | null;
  subValue?: 'positive' | 'negative' | null;
  onExit: () => void;
}

export function DrillDownHeader({ type, value, subValue, onExit }: DrillDownHeaderProps) {
  // Determine color accent based on drill-down type and subValue
  const getAccentClass = () => {
    switch (type) {
      case 'source':
        return 'border-l-blue-500';
      case 'sentiment':
        return value === 'Positive' ? 'border-l-green-500' : 
               value === 'Negative' ? 'border-l-red-500' : 'border-l-yellow-500';
      case 'issue':
        if (subValue === 'positive') return 'border-l-green-500';
        if (subValue === 'negative') return 'border-l-red-500';
        return 'border-l-purple-500';
      case 'date':
        return 'border-l-indigo-500';
      default:
        return 'border-l-slate-500';
    }
  };

  // Get button background color based on drill-down type and subValue
  const getButtonClass = () => {
    switch (type) {
      case 'source':
        return 'bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-800 dark:text-blue-200';
      case 'sentiment':
        if (value === 'Positive') 
          return 'bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/50 text-green-800 dark:text-green-200';
        else if (value === 'Negative') 
          return 'bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-800 dark:text-red-200';
        else 
          return 'bg-yellow-100 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:hover:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200';
      case 'issue':
        if (subValue === 'positive')
          return 'bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/50 text-green-800 dark:text-green-200';
        else if (subValue === 'negative')
          return 'bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-800 dark:text-red-200';
        return 'bg-purple-100 hover:bg-purple-200 dark:bg-purple-900/30 dark:hover:bg-purple-900/50 text-purple-800 dark:text-purple-200';
      case 'date':
        return 'bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 text-indigo-800 dark:text-indigo-200';
      default:
        return 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-900/30 dark:hover:bg-slate-900/50 text-slate-800 dark:text-slate-200';
    }
  };

  return (
    <div className={`py-3 px-4 bg-background/80 dark:bg-background/80 backdrop-blur-sm shadow-md border-b border-l-4 ${getAccentClass()} flex items-center w-full`}>
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={onExit}
        className={`flex items-center gap-1 ${getButtonClass()}`}
      >
        <ChevronLeft className="h-4 w-4" />
        <span>Back to Overview</span>
      </Button>
      <div className="text-xl font-bold ml-2">
        {type === 'source' && `Source: ${value}`}
        {type === 'sentiment' && `Sentiment: ${value}`}
        {type === 'issue' && (
          <>
            Issue: {value}
          </>
        )}
        {type === 'date' && `Date: ${value}`}
      </div>
    </div>
  )
} 