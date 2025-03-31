"use client"

import { useState, useEffect, useMemo } from 'react'
import { format, parseISO } from 'date-fns'
import {
  LayoutDashboard,
  Database,
  BrainCircuit,
  MessageSquare,
  Download,
  Save,
  Settings,
  LogOut,
  ChevronLeft
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
} from "@/components/dashboard/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"

import { Header } from "@/components/dashboard/header"
import { DashboardTooltip } from "@/components/dashboard/dashboard-tooltip"
import { FilterBar } from "@/components/dashboard/filter-bar"
import { SentimentChart } from "@/components/dashboard/sentiment-chart"
import { MentionsChart } from "@/components/dashboard/mentions-chart"
import { SourcesChart } from "@/components/dashboard/sources-chart"
import { IssueCloud } from "@/components/dashboard/issue-cloud"
import { ArticlesTable } from "@/components/dashboard/articles-table"
import { MetricsOverview } from "@/components/dashboard/metrics-overview"
import { SentimentTrendChart } from "@/components/dashboard/sentiment-trend-chart"
import { DrillDownHeader } from "@/components/dashboard/drill-down-header"

import { FilterOptions } from "@/lib/data/types"
import { useArticles } from "@/hooks/use-article-data"
import { useSentimentSummary } from "@/hooks/use-article-data"
import { useTopSources } from "@/hooks/use-article-data"
import { useTopIssues } from "@/hooks/use-article-data"
import { useMentionsOverTime } from "@/hooks/use-article-data"
import { useSentimentOverTime } from "@/hooks/use-article-data"

// Define the interface for the drill-down state
interface DrillDownState {
  active: boolean;
  type: 'source' | 'sentiment' | 'issue' | 'date' | null;
  value: string | null;
  previousFilters: FilterOptions | null;
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [showTooltips, setShowTooltips] = useState(false)
  const [currentTooltip, setCurrentTooltip] = useState(1)
  
  // Initialize date range with explicit dates for "all time"
  const allTimeStart = new Date(2000, 0, 1);
  allTimeStart.setHours(0, 0, 0, 0);
  
  const now = new Date();
  now.setHours(23, 59, 59, 999);
  
  // State for filters and drill-down
  const [filters, setFilters] = useState<FilterOptions>({
    dateRange: {
      from: allTimeStart,
      to: now,
    },
  })
  
  const [drillDownState, setDrillDownState] = useState<DrillDownState>({
    active: false,
    type: null,
    value: null,
    previousFilters: null
  })

  // Log initial filters for debugging
  console.log('Initial dashboard filters:', filters);

  // Fetch articles with filtering
  const { 
    articles, 
    loading: articlesLoading, 
    error: articlesError 
  } = useArticles(filters)

  // Fetch sentiment summary
  const { 
    summary: sentimentSummary, 
    loading: sentimentLoading,
    error: sentimentError 
  } = useSentimentSummary(filters)

  // Fetch top sources
  const { 
    sources, 
    loading: sourcesLoading,
    error: sourcesError 
  } = useTopSources(filters, 5) // Get top 5 sources

  // Fetch top issues
  const { 
    issues, 
    loading: issuesLoading,
    error: issuesError 
  } = useTopIssues(filters, 10) // Get top 10 issues

  // Fetch mentions over time
  const { 
    mentions, 
    loading: mentionsLoading,
    error: mentionsError 
  } = useMentionsOverTime(filters)

  // Fetch sentiment over time
  const {
    sentimentData,
    loading: sentimentTrendLoading,
    error: sentimentTrendError
  } = useSentimentOverTime(filters)

  // Get list of all sources for filter dropdown
  const availableSources = Array.from(
    new Set(articles?.map(article => article.source) || [])
  ).sort()

  // Handle filter changes from FilterBar component
  const handleFilterChange = (newFilters: FilterOptions) => {
    console.log('Dashboard received new filters:', newFilters);
    
    // Generate a unique force update ID with high entropy
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000000);
    const forceUpdate = timestamp * 10000 + random;
    
    // Create a completely new filter object
    const updatedFilters: FilterOptions = {};
    
    // Add the force update ID
    updatedFilters._forceUpdate = forceUpdate;
    
    // Handle date range with explicit new Date objects
    if (newFilters.dateRange) {
      // New date range provided, use it
      const fromDate = newFilters.dateRange.from instanceof Date 
        ? new Date(newFilters.dateRange.from.getTime()) 
        : new Date(newFilters.dateRange.from);
      
      const toDate = newFilters.dateRange.to instanceof Date 
        ? new Date(newFilters.dateRange.to.getTime()) 
        : new Date(newFilters.dateRange.to);
      
      // Set proper time components
      fromDate.setHours(0, 0, 0, 0);
      toDate.setHours(23, 59, 59, 999);
      
      updatedFilters.dateRange = { 
        from: fromDate, 
        to: toDate 
      };
    } else if (filters.dateRange) {
      // No new date range, preserve existing one
      updatedFilters.dateRange = {
        from: new Date(filters.dateRange.from.getTime()),
        to: new Date(filters.dateRange.to.getTime())
      };
    }
    
    // Process other filter properties by explicit checking
    // Don't merge/preserve previous values, only use what's provided in newFilters
    if ('keyword' in newFilters) {
      updatedFilters.keyword = newFilters.keyword;
    }
    
    if ('source' in newFilters) {
      updatedFilters.source = newFilters.source;
    }
    
    if ('sources' in newFilters) {
      updatedFilters.sources = newFilters.sources;
    }
    
    if ('sentiment' in newFilters) {
      updatedFilters.sentiment = newFilters.sentiment;
    }
    
    if ('sentiments' in newFilters) {
      updatedFilters.sentiments = newFilters.sentiments;
    }
    
    if ('tag' in newFilters) {
      updatedFilters.tag = newFilters.tag;
    }
    
    if ('tags' in newFilters) {
      updatedFilters.tags = newFilters.tags;
    }
    
    if ('assigned_issue' in newFilters) {
      updatedFilters.assigned_issue = newFilters.assigned_issue;
    }
    
    if ('assigned_issues' in newFilters) {
      updatedFilters.assigned_issues = newFilters.assigned_issues;
    }
    
    console.log('Setting new filters with force update:', updatedFilters);
    
    // Set state with completely new object
    setFilters(updatedFilters);
    
    // Exit drill-down mode if we're changing filters manually
    setDrillDownState({
      active: false,
      type: null,
      value: null,
      previousFilters: null
    });
  }

  // Handle drill-down action for source chart
  const handleSourceDrillDown = (source: string) => {
    // Store current filters before replacing them
    const previousFilters = { ...filters };
    
    // Create new filter focused just on the selected source
    const drillDownFilters: FilterOptions = {
      source: source,
      dateRange: filters.dateRange ? {
        from: new Date(filters.dateRange.from.getTime()),
        to: new Date(filters.dateRange.to.getTime())
      } : {
        from: allTimeStart,
        to: now
      },
      _forceUpdate: Date.now()
    };
    
    // Update drill-down state
    setDrillDownState({
      active: true,
      type: 'source',
      value: source,
      previousFilters: previousFilters
    });
    
    // Apply the new filters
    setFilters(drillDownFilters);
  };

  // Handle drill-down action for sentiment chart
  const handleSentimentDrillDown = (sentiment: 'Positive' | 'Neutral' | 'Negative') => {
    // Store current filters before replacing them
    const previousFilters = { ...filters };
    
    // Create new filter focused just on the selected sentiment
    const drillDownFilters: FilterOptions = {
      sentiment: sentiment,
      dateRange: filters.dateRange ? {
        from: new Date(filters.dateRange.from.getTime()),
        to: new Date(filters.dateRange.to.getTime())
      } : {
        from: allTimeStart,
        to: now
      },
      _forceUpdate: Date.now()
    };
    
    // Update drill-down state
    setDrillDownState({
      active: true,
      type: 'sentiment',
      value: sentiment,
      previousFilters: previousFilters
    });
    
    // Apply the new filters
    setFilters(drillDownFilters);
  };

  // Handle drill-down action for date from sentiment trend chart
  const handleDateDrillDown = (date: string) => {
    // Store current filters before replacing them
    const previousFilters = { ...filters };
    
    // Parse the clicked date using parseISO to ensure correct timezone handling
    const selectedDate = parseISO(date);
    
    // Create new filter focused just on the selected date
    // Set the date range to the specific day (start to end of day)
    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);
    
    const drillDownFilters: FilterOptions = {
      dateRange: {
        from: startOfDay,
        to: endOfDay
      },
      _forceUpdate: Date.now()
    };
    
    // Update drill-down state
    setDrillDownState({
      active: true,
      type: 'date',
      value: format(selectedDate, 'MMM dd, yyyy'),
      previousFilters: previousFilters
    });
    
    // Apply the new filters
    setFilters(drillDownFilters);
  };

  // Handle exiting drill-down view
  const exitDrillDown = () => {
    if (drillDownState.previousFilters) {
      // Restore previous filters
      setFilters({
        ...drillDownState.previousFilters,
        _forceUpdate: Date.now()
      });
    }
    
    // Reset drill-down state
    setDrillDownState({
      active: false,
      type: null,
      value: null,
      previousFilters: null
    });
  };

  // Handle skipping tutorial
  const handleSkipTutorial = () => {
    setShowTooltips(false);
  };

  return (
    <TooltipProvider>
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-background dark:bg-[#050614]">
          <Sidebar>
            <SidebarHeader className="flex h-14 items-center border-b px-4 md:px-6">
              <div className="flex items-center gap-2 font-semibold pt-4">
                <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-xs">SL</span>
                </div>
                <span>SocialListen</span>
              </div>
            </SidebarHeader>
            <SidebarContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton isActive={activeTab === "dashboard"} onClick={() => setActiveTab("dashboard")}>
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Dashboard</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton isActive={activeTab === "all-data"} onClick={() => setActiveTab("all-data")}>
                    <Database className="h-4 w-4" />
                    <span>All Data</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton isActive={activeTab === "ai-summary"} onClick={() => setActiveTab("ai-summary")}>
                    <BrainCircuit className="h-4 w-4" />
                    <span>AI Summary</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={activeTab === "issue-themes"}
                    onClick={() => setActiveTab("issue-themes")}
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span>Issue Themes</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton isActive={activeTab === "settings"} onClick={() => setActiveTab("settings")}>
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarContent>
            <SidebarFooter className="border-t p-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center">
                  <span className="font-medium text-sm">JD</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">John Doe</span>
                  <span className="text-xs text-muted-foreground">john@example.com</span>
                </div>
                <Button variant="ghost" size="icon" className="ml-auto">
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </SidebarFooter>
          </Sidebar>

          <div className="flex flex-col flex-1">
            <Header 
              activeTab={activeTab} 
              onSearchChange={handleFilterChange}
              initialFilters={filters}
            />
            
            {drillDownState.active && (
              <DrillDownHeader
                type={drillDownState.type}
                value={drillDownState.value}
                onExit={exitDrillDown}
              />
            )}
            
            <div className="flex-1 overflow-auto h-[calc(100vh-3.5rem)]">
              <main className="p-4 sm:p-5 md:p-7 relative w-full">
                {/* Dashboard Tooltips */}
                {showTooltips && (
                  <>
                    <div className="fixed inset-0 bg-black/50 z-50" />
                    <DashboardTooltip
                      step={currentTooltip}
                      totalSteps={5}
                      onNext={() => setCurrentTooltip((prev) => Math.min(prev + 1, 5))}
                      onPrev={() => setCurrentTooltip((prev) => Math.max(prev - 1, 1))}
                      onSkip={handleSkipTutorial}
                    />
                  </>
                )}

                {/* Dashboard Tab */}
                {activeTab === "dashboard" && (
                  <div className="grid gap-4 sm:gap-6 w-full">
                    {/* Remove drill-down header from here, moved to top of scroll container */}

                    {!drillDownState.active && (
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-muted-foreground">
                            Monitoring keywords:{" "}
                            {issues?.slice(0, 3).map((issue) => (
                              <Badge key={issue.issue} variant="outline" className="ml-1">
                                {issue.issue}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Filter Bar - show only when not in drill-down mode */}
                    {!drillDownState.active && (
                      <FilterBar 
                        onFilterChange={handleFilterChange} 
                        availableSources={availableSources} 
                        initialFilters={filters}
                      />
                    )}

                    {/* Total Mentions */}
                    <div className="grid gap-4 sm:gap-6 grid-cols-1">
                      <MetricsOverview 
                        totalMentions={sentimentSummary.total || 0} 
                        positiveMentions={sentimentSummary.positive || 0}
                        negativeMentions={sentimentSummary.negative || 0}
                        sentimentScore={sentimentSummary.total > 0 ? 
                          ((sentimentSummary.positive - sentimentSummary.negative) / sentimentSummary.total) : 0}
                        loading={sentimentLoading}
                        dateLabel={filters.dateRange && filters.dateRange.from && filters.dateRange.to ? 
                          `${filters.dateRange.from.toLocaleDateString()} - ${filters.dateRange.to.toLocaleDateString()}` : 
                          'selected date range'} 
                      />
                    </div>

                    {/* Sentiment Trend and Mentions Charts */}
                    <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
                      <SentimentTrendChart 
                        key={`sentiment-trend-${filters._forceUpdate || 'initial'}`}
                        sentimentData={sentimentData} 
                        loading={sentimentTrendLoading} 
                        onDrillDown={!drillDownState.active ? handleDateDrillDown : undefined}
                      />
                      <MentionsChart 
                        key={`mentions-${filters._forceUpdate || 'initial'}`}
                        mentionsData={mentions} 
                        loading={mentionsLoading} 
                        type="area"
                      />
                    </div>

                    {/* Top Sources, Sentiment Distribution, and Issues */}
                    <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                      <SourcesChart 
                        key={`sources-${filters._forceUpdate || 'initial'}`}
                        sourcesData={sources} 
                        loading={sourcesLoading}
                        onDrillDown={!drillDownState.active ? handleSourceDrillDown : undefined}
                      />
                      <SentimentChart 
                        key={`sentiment-${filters._forceUpdate || 'initial'}`}
                        sentimentData={sentimentSummary} 
                        loading={sentimentLoading} 
                        onDrillDown={!drillDownState.active ? handleSentimentDrillDown : undefined}
                      />
                      <IssueCloud 
                        key={`issues-${filters._forceUpdate || 'initial'}`}
                        issuesData={issues} 
                        loading={issuesLoading} 
                      />
                    </div>

                    {/* Recent Articles Table */}
                    <ArticlesTable 
                      key={`articles-${filters._forceUpdate || 'initial'}`}
                      articles={articles} 
                      loading={articlesLoading} 
                      pageSize={10}
                    />
                  </div>
                )}

                {/* All Data Tab */}
                {activeTab === "all-data" && (
                  <div className="grid gap-6">
                      <div>
                        <h2 className="text-2xl font-bold tracking-tight">All Data</h2>
                        <p className="text-muted-foreground">View and filter all mentions across platforms</p>
                    </div>

                    {/* Filter Bar */}
                    {!drillDownState.active && (
                      <FilterBar 
                        onFilterChange={handleFilterChange} 
                        availableSources={availableSources} 
                        initialFilters={filters}
                      />
                    )}

                    {/* All Articles Table */}
                    <ArticlesTable 
                      articles={articles} 
                      loading={articlesLoading} 
                      pageSize={20}
                    />
                  </div>
                )}

                {/* Placeholder for other tabs */}
                {(activeTab === "ai-summary" || activeTab === "issue-themes" || activeTab === "settings") && (
                  <div className="grid place-items-center h-[50vh]">
                    <div className="text-center">
                      <h3 className="text-xl font-semibold mb-2">{activeTab} Tab</h3>
                      <p className="text-muted-foreground">This section is under development</p>
                    </div>
                  </div>
                )}
              </main>
            </div>
          </div>
        </div>
      </SidebarProvider>
    </TooltipProvider>
  )
}

