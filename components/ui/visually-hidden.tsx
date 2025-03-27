"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"

import { cn } from "@/lib/utils"

interface VisuallyHiddenProps {
  asChild?: boolean
  className?: string
  children: React.ReactNode
}

const VisuallyHidden = React.forwardRef<
  HTMLSpanElement,
  VisuallyHiddenProps
>(({ asChild, className, children, ...props }, ref) => {
  const Comp = asChild ? Slot : "span"
  
  return (
    <Comp
      className={cn(
        "absolute h-px w-px p-0 overflow-hidden whitespace-nowrap border-0",
        "clip-rect-[0px_0px_0px_0px]",
        className
      )}
      ref={ref}
      {...props}
    >
      {children}
    </Comp>
  )
})

VisuallyHidden.displayName = "VisuallyHidden"

export { VisuallyHidden } 