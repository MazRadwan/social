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
    
    // Keyword filter
    const keyword = searchParams.get('keyword');
    if (keyword) {
      filterOptions.keyword = keyword;
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
    
    console.log('GET API - Filter options:', filterOptions);
    
    // Check if we should use filters
    const hasFilters = Object.keys(filterOptions).length > 0;
    const articles = hasFilters
      ? await getFilteredArticles(filterOptions)
      : await getArticles();
    
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
    const { action, filters, limit } = body;
    
    console.log('POST API - Request body:', { action, filters, limit });
    
    // Process filters to handle 'all' values
    let processedFilters = filters;
    if (filters) {
      processedFilters = { ...filters };
      if (processedFilters.source === 'all') {
        delete processedFilters.source;
      }
      if (processedFilters.sentiment === 'all') {
        delete processedFilters.sentiment;
      }
      
      // Ensure dateRange values are Date objects
      if (processedFilters.dateRange) {
        processedFilters.dateRange = {
          from: new Date(processedFilters.dateRange.from),
          to: new Date(processedFilters.dateRange.to)
        };
      }
    }
    
    console.log('POST API - Processed filters:', processedFilters);
    
    // Apply filters if provided
    let articles = processedFilters ? await getFilteredArticles(processedFilters) : undefined;
    
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