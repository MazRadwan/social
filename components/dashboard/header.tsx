"use client"

import React, { useState, useEffect } from 'react'
import { Save, Download, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SidebarTrigger } from './sidebar'
import { ThemeToggle } from './theme-toggle'
import { Badge } from '@/components/ui/badge'
import { FilterOptions } from '@/lib/data/types'

interface HeaderProps {
  activeTab: string
  onSearchChange?: (filters: FilterOptions) => void
  initialFilters?: FilterOptions
}

export function Header({ activeTab, onSearchChange, initialFilters }: HeaderProps) {
  const [keyword, setKeyword] = useState<string>(initialFilters?.keyword || '')
  const [searchTags, setSearchTags] = useState<string[]>([])

  // Initialize searchTags from initialFilters if keyword exists
  useEffect(() => {
    if (initialFilters?.keyword) {
      const terms = initialFilters.keyword.split(' OR ').filter(term => term);
      setSearchTags(terms);
    }
  }, [initialFilters]);

  // Handle keyword input changes
  const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newKeyword = e.target.value;
    setKeyword(newKeyword);
    
    // If search is cleared and we have a callback, update filters
    if (newKeyword === '' && onSearchChange) {
      updateFilters('');
    }
  }

  // Handle Enter key press in search field
  const handleKeywordKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && keyword.trim() && onSearchChange) {
      e.preventDefault();
      
      // Split the keyword by spaces and filter out empty strings
      const newTerms = keyword.trim().split(/\s+/).filter(term => term && term !== 'OR');
      
      // Add each term as a separate tag
      const newSearchTags = [...searchTags, ...newTerms];
      setSearchTags(newSearchTags);
      
      // Update filters with the new search tags
      const keywordString = newSearchTags.join(' OR ');
      updateFilters(keywordString);
      
      // Clear the search input
      setKeyword('');
    }
  }

  // Handle removing a search tag
  const handleRemoveSearchTag = (tagToRemove: string) => {
    // Remove the tag from the search tags array
    const newSearchTags = searchTags.filter(tag => tag !== tagToRemove);
    setSearchTags(newSearchTags);
    
    // Direct approach: create a completely new filter object
    if (onSearchChange) {
      // Create a new filters object with the force update timestamp
      const newFilters: FilterOptions = {
        _forceUpdate: Date.now(),
      };
      
      // Only add keyword if we still have tags, otherwise set to null explicitly
      if (newSearchTags.length > 0) {
        newFilters.keyword = newSearchTags.join(' OR ');
      } else {
        // Use null instead of undefined to explicitly signal removal
        newFilters.keyword = null;
      }
      
      // Preserve the date range from initialFilters
      if (initialFilters?.dateRange) {
        newFilters.dateRange = {
          from: new Date(initialFilters.dateRange.from.getTime()),
          to: new Date(initialFilters.dateRange.to.getTime())
        };
      }
      
      console.log('Sending filter update from handleRemoveSearchTag:', newFilters);
      
      // Call the parent's filter change handler directly
      onSearchChange(newFilters);
    }
  }

  // Handle clearing all search tags
  const handleClearAllSearchTags = () => {
    // Clear the search tags array
    setSearchTags([]);
    
    // Direct approach: create a completely new filter object
    if (onSearchChange) {
      // Create a new filters object with just the force update timestamp
      const newFilters: FilterOptions = {
        _forceUpdate: Date.now(),
        // Use null instead of undefined to explicitly signal removal
        keyword: null
      };
      
      // Preserve the date range from initialFilters
      if (initialFilters?.dateRange) {
        newFilters.dateRange = {
          from: new Date(initialFilters.dateRange.from.getTime()),
          to: new Date(initialFilters.dateRange.to.getTime())
        };
      }
      
      console.log('Sending filter update from handleClearAllSearchTags:', newFilters);
      
      // Call the parent's filter change handler directly
      onSearchChange(newFilters);
    }
  }

  // Helper to update filters through the callback
  const updateFilters = (keywordString: string, forceUpdate = false) => {
    if (!onSearchChange) return;
    
    // Create new filters object with only the force update timestamp
    const newFilters: FilterOptions = {
      _forceUpdate: Date.now()
    };
    
    // Add keyword if provided
    if (keywordString) {
      newFilters.keyword = keywordString;
    } else if (forceUpdate) {
      // Explicitly set keyword to undefined to remove it
      newFilters.keyword = undefined;
    }
    
    // Explicitly preserve the date range if it exists in initialFilters
    if (initialFilters?.dateRange) {
      newFilters.dateRange = {
        from: new Date(initialFilters.dateRange.from.getTime()),
        to: new Date(initialFilters.dateRange.to.getTime())
      };
    }
    
    // Call the parent component's filter change handler
    onSearchChange(newFilters);
  }

  return (
    <div className="sticky top-0 left-0 right-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-md dark:border-border">
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
        
        <div className="ml-auto flex items-center gap-3">
          {/* Search bar */}
          {onSearchChange && (
            <div className="relative w-64">
              <Input
                type="text"
                placeholder="Search for content..."
                value={keyword}
                onChange={handleKeywordChange}
                onKeyDown={handleKeywordKeyPress}
                className="w-full h-8 text-sm"
              />
            </div>
          )}
          <ThemeToggle />
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
      
      {/* Search tags area */}
      {onSearchChange && searchTags.length > 0 && (
        <div className="px-6 py-2 border-b flex flex-wrap gap-2 items-center">
          <div className="flex flex-wrap gap-2">
            {searchTags.map((tag, index) => (
              <Badge 
                key={`${tag}-${index}`} 
                variant="secondary"
                className="flex items-center gap-1 px-2 py-1"
              >
                {tag}
                <button
                  onClick={() => handleRemoveSearchTag(tag)}
                  className="ml-1 rounded-full hover:bg-muted p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
          {searchTags.length > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleClearAllSearchTags}
              className="text-xs h-6 px-2"
            >
              Clear All
            </Button>
          )}
        </div>
      )}
    </div>
  )
} 