"use client"

import React from 'react'
import { Save, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SidebarTrigger } from './sidebar'

interface HeaderProps {
  activeTab: string
}

export function Header({ activeTab }: HeaderProps) {
  return (
    <div className="sticky top-0 left-0 right-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="flex h-14 items-center gap-4 px-6">
        <SidebarTrigger />
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-semibold">
            {activeTab === "dashboard" && "Dashboard"}
            {activeTab === "all-data" && "All Data"}
            {activeTab === "ai-summary" && "AI Summary"}
            {activeTab === "issue-themes" && "Issue Themes"}
            {activeTab === "settings" && "Settings"}
          </h1>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div className="hidden md:flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Save className="mr-2 h-3.5 w-3.5" />
              Save View
            </Button>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-3.5 w-3.5" />
              Export
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 