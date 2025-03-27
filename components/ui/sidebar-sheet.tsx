"use client"

import * as React from "react"
import * as SheetPrimitive from "@radix-ui/react-dialog"
import { cva, type VariantProps } from "class-variance-authority"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

const SidebarSheet = SheetPrimitive.Root

const SidebarSheetTrigger = SheetPrimitive.Trigger

const SidebarSheetClose = SheetPrimitive.Close

const SidebarSheetPortal = SheetPrimitive.Portal

// Custom overlay with lower z-index to go under the header
const SidebarSheetOverlay = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Overlay
    className={cn(
      "fixed inset-0 z-30 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
    ref={ref}
  />
))
SidebarSheetOverlay.displayName = "SidebarSheetOverlay"

const sidebarSheetVariants = cva(
  "fixed z-40 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-500",
  {
    variants: {
      side: {
        left: "inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
        right: "inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm",
      },
    },
    defaultVariants: {
      side: "left",
    },
  }
)

interface SidebarSheetContentProps
  extends React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content>,
    VariantProps<typeof sidebarSheetVariants> {}

const SidebarSheetContent = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Content>,
  SidebarSheetContentProps
>(({ side = "left", className, children, ...props }, ref) => (
  <SidebarSheetPortal>
    <SidebarSheetOverlay />
    <SheetPrimitive.Content
      ref={ref}
      className={cn(sidebarSheetVariants({ side }), className)}
      {...props}
    >
      {children}
      <SidebarSheetClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </SidebarSheetClose>
    </SheetPrimitive.Content>
  </SidebarSheetPortal>
))
SidebarSheetContent.displayName = "SidebarSheetContent"

const SidebarSheetTitle = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Title>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold text-foreground", className)}
    {...props}
  />
))
SidebarSheetTitle.displayName = "SidebarSheetTitle"

export {
  SidebarSheet,
  SidebarSheetPortal,
  SidebarSheetOverlay,
  SidebarSheetTrigger,
  SidebarSheetClose,
  SidebarSheetContent,
  SidebarSheetTitle,
} 