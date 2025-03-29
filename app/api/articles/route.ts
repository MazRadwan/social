import { NextResponse } from 'next/server';
import { getArticles, getFilteredArticles, getSentimentSummary, getTopSources, getTopTags, getMentionsOverTime } from '@/lib/data/articles';
import { FilterOptions } from '@/lib/data/types';

/**
 * GET handler for article data
 * Currently using local data files, but designed to be replaced with actual API calls
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  try {
    // Parse filter options from query parameters
    const filterOptions: FilterOptions = {};
    
    // Date range filter
    const fromDate = searchParams.get('from');
    const toDate = searchParams.get('to');
    if (fromDate && toDate) {
      filterOptions.dateRange = {
        from: new Date(fromDate),
        to: new Date(toDate)
      };
    }
    
    // Source filter
    const source = searchParams.get('source');
    if (source && source !== 'all') {
      filterOptions.source = source;
    }
    
    // Sentiment filter
    const sentiment = searchParams.get('sentiment');
    if (sentiment && sentiment !== 'all') {
      filterOptions.sentiment = sentiment as 'Positive' | 'Neutral' | 'Negative';
    }
    
    // Tag filter
    const tag = searchParams.get('tag');
    if (tag && tag !== 'all keywords') {
      filterOptions.tag = tag;
    }
    
    // Assigned issue filter
    const assignedIssue = searchParams.get('assigned_issue');
    if (assignedIssue && assignedIssue !== 'all') {
      filterOptions.assigned_issue = assignedIssue;
    }
    
    // Add a force update timestamp to ensure fresh data
    filterOptions._forceUpdate = Date.now();
    
    console.log('GET API - Filter options:', filterOptions);
    
    const articles = await getFilteredArticles(filterOptions);
    
    console.log(`GET API - Returning ${articles.length} articles`);
    
    return NextResponse.json({ 
      data: articles,
      meta: {
        total: articles.length
      }
    });
  } catch (error) {
    console.error('Error in articles API route:', error);
    return NextResponse.json({ 
      data: [],
      error: 'Failed to fetch articles' 
    }, { status: 500 });
  }
}

/**
 * POST handler for more complex article data operations
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Check if it's a direct articles request with filters
    if (!body.action) {
      // Process filters from the request body
      const filters: FilterOptions = { _forceUpdate: Date.now() };
      
      // Handle date range
      if (body.dateRange) {
        let fromDate = body.dateRange.from ? new Date(body.dateRange.from) : new Date(2000, 0, 1);
        let toDate = body.dateRange.to ? new Date(body.dateRange.to) : new Date();
        
        // Ensure proper time components
        fromDate.setHours(0, 0, 0, 0);
        toDate.setHours(23, 59, 59, 999);
        
        filters.dateRange = { from: fromDate, to: toDate };
      }
      
      // Handle keyword search from search bar
      if (body.keyword && body.keyword !== null) {
        filters.keyword = body.keyword;
      }
      
      // Handle single and multi-select filters
      if (body.tags && Array.isArray(body.tags) && body.tags.length > 0) {
        filters.tags = body.tags;
      } else if (body.tag && body.tag !== 'all keywords') {
        filters.tag = body.tag;
      }
      
      if (body.sources && Array.isArray(body.sources) && body.sources.length > 0) {
        filters.sources = body.sources;
      } else if (body.source && body.source !== 'all') {
        filters.source = body.source;
      }
      
      if (body.sentiments && Array.isArray(body.sentiments) && body.sentiments.length > 0) {
        filters.sentiments = body.sentiments;
      } else if (body.sentiment && body.sentiment !== 'all') {
        filters.sentiment = body.sentiment;
      }
      
      if (body.assigned_issues && Array.isArray(body.assigned_issues) && body.assigned_issues.length > 0) {
        filters.assigned_issues = body.assigned_issues;
      } else if (body.assigned_issue && body.assigned_issue !== 'all') {
        filters.assigned_issue = body.assigned_issue;
      }
      
      console.log('POST API - Direct articles request with filters:', filters);
      
      const articles = await getFilteredArticles(filters);
      return NextResponse.json({ articles });
    }
    
    // Legacy action-based API
    const { action, filters, limit } = body;
    
    console.log('POST API - Request body:', { action, filters, limit });
    
    // Process filters to handle 'all' values
    let processedFilters = filters ? { ...filters } : {};
    
    // Remove 'all' filters
    if (processedFilters.source === 'all') delete processedFilters.source;
    if (processedFilters.sentiment === 'all') delete processedFilters.sentiment;
    if (processedFilters.assigned_issue === 'all') delete processedFilters.assigned_issue;
    
    // Handle array-based filters (if present)
    if (processedFilters.sources && processedFilters.sources.length === 0) delete processedFilters.sources;
    if (processedFilters.sentiments && processedFilters.sentiments.length === 0) delete processedFilters.sentiments;
    if (processedFilters.tags && processedFilters.tags.length === 0) delete processedFilters.tags;
    if (processedFilters.assigned_issues && processedFilters.assigned_issues.length === 0) delete processedFilters.assigned_issues;
    
    // Ensure dateRange values are Date objects
    if (processedFilters.dateRange) {
      processedFilters.dateRange = {
        from: new Date(processedFilters.dateRange.from),
        to: new Date(processedFilters.dateRange.to)
      };
    }
    
    // Add force update
    processedFilters._forceUpdate = Date.now();
    
    console.log('POST API - Processed filters:', processedFilters);
    
    // Apply filters to get articles
    const articles = await getFilteredArticles(processedFilters);
    
    // Determine which data to return based on action
    switch (action) {
      case 'sentiment_summary':
        const summary = await getSentimentSummary(articles);
        console.log('POST API - sentiment_summary result:', summary);
        return NextResponse.json({ data: summary });
        
      case 'top_sources':
        const sources = await getTopSources(articles, limit || 5);
        console.log('POST API - top_sources result:', sources);
        return NextResponse.json({ data: { sources } });
        
      case 'top_tags':
        const tags = await getTopTags(articles, limit || 5);
        console.log('POST API - top_tags result:', tags);
        return NextResponse.json({ data: { tags } });
        
      case 'mentions_over_time':
        const mentions = await getMentionsOverTime(articles);
        console.log('POST API - mentions_over_time result:', mentions);
        return NextResponse.json({ data: { mentions } });
        
      default:
        return NextResponse.json({ 
          error: 'Invalid action',
          data: null
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in API route:', error);
    return NextResponse.json({ 
      error: 'Server error',
      data: null
    }, { status: 500 });
  }
} 