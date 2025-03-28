"use client"

import { useState } from "react"
import {
  LayoutDashboard,
  Database,
  BrainCircuit,
  MessageSquare,
  Download,
  Save,
  Settings,
  LogOut,
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
import { TagsChart } from "@/components/dashboard/tags-chart"
import { ArticlesTable } from "@/components/dashboard/articles-table"
import { MetricsOverview } from "@/components/dashboard/metrics-overview"

import { FilterOptions } from "@/lib/data/types"
import { useArticles } from "@/hooks/use-article-data"
import { useSentimentSummary } from "@/hooks/use-article-data"
import { useTopSources } from "@/hooks/use-article-data"
import { useTopTags } from "@/hooks/use-article-data"
import { useMentionsOverTime } from "@/hooks/use-article-data"

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [showTooltips, setShowTooltips] = useState(false) // Set to false to disable tutorial by default
  const [currentTooltip, setCurrentTooltip] = useState(1)

  // Initialize date range with explicit dates for "all time"
  const allTimeStart = new Date(2000, 0, 1);
  allTimeStart.setHours(0, 0, 0, 0);
  
  const now = new Date();
  now.setHours(23, 59, 59, 999);
  
  const [filters, setFilters] = useState<FilterOptions>({
    dateRange: {
      from: allTimeStart,
      to: now,
    },
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

  // Fetch top tags
  const { 
    tags, 
    loading: tagsLoading,
    error: tagsError 
  } = useTopTags(filters, 10) // Get top 10 tags

  // Fetch mentions over time
  const { 
    mentions, 
    loading: mentionsLoading,
    error: mentionsError 
  } = useMentionsOverTime(filters)

  // Get list of all sources for filter dropdown
  const availableSources = Array.from(
    new Set(articles?.map(article => article.source) || [])
  ).sort()

  // Handle filter changes from FilterBar component
  const handleFilterChange = (newFilters: FilterOptions) => {
    console.log('Dashboard received new filters:', newFilters);
    
    // Force immediate re-fetch with timestamp plus random value to ensure uniqueness
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 100000);
    const forceUpdate = timestamp * 1000 + random;
    
    // Create a completely new filter object to avoid any reference issues
    const updatedFilters: FilterOptions = {
      _forceUpdate: forceUpdate
    };
    
    // Handle date range with explicit new Date objects
    if (newFilters.dateRange) {
      const fromDate = new Date(
        newFilters.dateRange.from instanceof Date 
          ? newFilters.dateRange.from.getTime() 
          : new Date(newFilters.dateRange.from).getTime()
      );
      
      const toDate = new Date(
        newFilters.dateRange.to instanceof Date 
          ? newFilters.dateRange.to.getTime() 
          : new Date(newFilters.dateRange.to).getTime()
      );
      
      // Set proper time components
      fromDate.setHours(0, 0, 0, 0);
      toDate.setHours(23, 59, 59, 999);
      
      updatedFilters.dateRange = { 
        from: fromDate, 
        to: toDate 
      };
    }
    
    // Copy other filter properties
    if (newFilters.keyword) updatedFilters.keyword = newFilters.keyword;
    if (newFilters.source) updatedFilters.source = newFilters.source;
    if (newFilters.sentiment) updatedFilters.sentiment = newFilters.sentiment;
    
    console.log('Setting new filters with force update:', updatedFilters);
    
    // Set state with completely new object
    setFilters(updatedFilters);
  }

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
            <Header activeTab={activeTab} />
            
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
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-muted-foreground">
                          Monitoring keywords:{" "}
                          {tags?.slice(0, 3).map((tag) => (
                            <Badge key={tag.tag} variant="outline" className="ml-1">
                              {tag.tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Filter Bar */}
                    <FilterBar 
                      onFilterChange={handleFilterChange} 
                      availableSources={availableSources} 
                      initialFilters={filters}
                    />

                    {/* Total Mentions */}
                    <div className="grid gap-4 sm:gap-6 grid-cols-1">
                      <MetricsOverview 
                        totalMentions={sentimentSummary.total || 0} 
                        loading={sentimentLoading}
                        dateLabel={`${filters.dateRange?.from.toLocaleDateString()} - ${filters.dateRange?.to.toLocaleDateString()}`} 
                      />
                    </div>

                    {/* Sentiment and Mentions Charts */}
                    <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
                      <SentimentChart 
                        sentimentData={sentimentSummary} 
                        loading={sentimentLoading} 
                      />
                      <MentionsChart 
                        mentionsData={mentions} 
                        loading={mentionsLoading} 
                        type="area"
                      />
                    </div>

                    {/* Top Sources and Tags */}
                    <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
                      <SourcesChart 
                        sourcesData={sources} 
                        loading={sourcesLoading} 
                      />
                      <TagsChart 
                        tagsData={tags} 
                        loading={tagsLoading} 
                        type="cloud"
                      />
                    </div>

                    {/* Recent Articles Table */}
                    <ArticlesTable 
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
                    <FilterBar 
                      onFilterChange={handleFilterChange} 
                      availableSources={availableSources} 
                      initialFilters={filters}
                    />

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

