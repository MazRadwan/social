"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"

interface DashboardTooltipProps {
  step: number
  totalSteps: number
  onNext: () => void
  onPrev: () => void
  onSkip: () => void
}

export function DashboardTooltip({ step, totalSteps, onNext, onPrev, onSkip }: DashboardTooltipProps) {
  const getTooltipPosition = () => {
    switch (step) {
      case 1: // Welcome tooltip
        return "top-1/3 left-1/2 -translate-x-1/2"
      case 2: // Filter tooltip
        return "top-20 right-20"
      case 3: // AI insights tooltip
        return "top-1/3 left-1/2 -translate-x-1/2"
      case 4: // Issue themes tooltip
        return "bottom-1/3 left-1/3"
      case 5: // Export tooltip
        return "top-20 right-20"
      default:
        return "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
    }
  }

  const getTooltipContent = () => {
    switch (step) {
      case 1:
        return "Welcome to your Dashboard—View overall insights and monitor your brand mentions in real-time."
      case 2:
        return "Filter your data by dates, keywords, and entities to focus on what matters most to you."
      case 3:
        return "View AI-generated summaries of key insights to quickly understand trends and sentiment."
      case 4:
        return "Explore trending issue themes and sentiment analysis to identify opportunities and challenges."
      case 5:
        return "Export reports and save customized views to share with your team or for future reference."
      default:
        return ""
    }
  }

  return (
    <Card className={`fixed z-50 w-80 ${getTooltipPosition()}`}>
      <CardContent className="p-4">
        <div className="mb-2 text-sm font-medium">
          Tip {step} of {totalSteps}
        </div>
        <p>{getTooltipContent()}</p>
      </CardContent>
      <CardFooter className="flex justify-between border-t p-3">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onPrev} disabled={step === 1}>
            Previous
          </Button>
          <Button variant="outline" size="sm" onClick={onNext} disabled={step === totalSteps}>
            Next
          </Button>
        </div>
        <Button variant="ghost" size="sm" onClick={onSkip}>
          Skip
        </Button>
      </CardFooter>
    </Card>
  )
}

