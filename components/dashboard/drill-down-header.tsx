"use client"

import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

interface DrillDownHeaderProps {
  type: 'source' | 'sentiment' | 'issue' | null;
  value: string | null;
  onExit: () => void;
}

export function DrillDownHeader({ type, value, onExit }: DrillDownHeaderProps) {
  // Determine color accent based on drill-down type
  const getAccentClass = () => {
    switch (type) {
      case 'source':
        return 'border-l-blue-500';
      case 'sentiment':
        return value === 'Positive' ? 'border-l-green-500' : 
               value === 'Negative' ? 'border-l-red-500' : 'border-l-yellow-500';
      case 'issue':
        return 'border-l-purple-500';
      default:
        return 'border-l-slate-500';
    }
  };

  return (
    <div className={`py-3 px-4 bg-background dark:bg-background shadow-sm border-b border-l-4 ${getAccentClass()} flex items-center`}>
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={onExit}
        className="flex items-center gap-1 hover:bg-background/90"
      >
        <ChevronLeft className="h-4 w-4" />
        <span>Back to Overview</span>
      </Button>
      <div className="text-xl font-bold ml-2">
        {type === 'source' && `Source: ${value}`}
        {type === 'sentiment' && `Sentiment: ${value}`}
        {type === 'issue' && `Issue: ${value}`}
      </div>
    </div>
  )
} 