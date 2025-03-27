import { useState, useEffect, useRef } from 'react';
import { Article, ArticleSentimentSummary, ArticlesBySource, ArticlesByTag, FilterOptions } from '@/lib/data/types';

// Helper to deep compare objects - simplified to prioritize force updates
const isEqual = (a: any, b: any): boolean => {
  // Same reference = same object
  if (a === b) return true;
  
  // If either is null/undefined but not both
  if (!a || !b) return false;
  
  // Force update has highest priority - if either has a force update, they're different
  if (a._forceUpdate || b._forceUpdate) {
    return false;
  }
  
  // For date ranges, strictly compare the date values by time
  if (a.dateRange && b.dateRange) {
    // If any date is missing in either object, they're different
    if (!a.dateRange.from || !a.dateRange.to || !b.dateRange.from || !b.dateRange.to) {
      return false;
    }
    
    // Get timestamps for comparison
    const aFrom = a.dateRange.from instanceof Date ? a.dateRange.from.getTime() : new Date(a.dateRange.from).getTime();
    const aTo = a.dateRange.to instanceof Date ? a.dateRange.to.getTime() : new Date(a.dateRange.to).getTime();
    const bFrom = b.dateRange.from instanceof Date ? b.dateRange.from.getTime() : new Date(b.dateRange.from).getTime();
    const bTo = b.dateRange.to instanceof Date ? b.dateRange.to.getTime() : new Date(b.dateRange.to).getTime();
    
    // Dates must be exactly the same to be considered equal (not fuzzy/day-based comparison)
    if (aFrom !== bFrom || aTo !== bTo) {
      return false;
    }
  }
  
  // Check other filter properties (keyword, source, sentiment)
  if (a.keyword !== b.keyword || a.source !== b.source || a.sentiment !== b.sentiment) {
    return false;
  }
  
  // If we've passed all checks, objects are considered equal
  return true;
};

// Helper to ensure dates are properly serialized
const prepareFiltersForAPI = (filters?: FilterOptions): FilterOptions | undefined => {
  if (!filters) return undefined;
  
  console.log('Preparing filters for API:', filters);
  
  const preparedFilters = { ...filters };
  
  // Handle date range serialization
  if (preparedFilters.dateRange) {
    let { from, to } = preparedFilters.dateRange;
    
    // Ensure these are Date objects before serializing
    from = from instanceof Date ? from : new Date(from);
    to = to instanceof Date ? to : new Date(to);
    
    // Set proper time components
    const fromDate = new Date(from);
    fromDate.setHours(0, 0, 0, 0);
    
    const toDate = new Date(to);
    toDate.setHours(23, 59, 59, 999);
    
    preparedFilters.dateRange = {
      from: fromDate,
      to: toDate
    };
    
    console.log('Prepared date range:', {
      from: preparedFilters.dateRange.from.toISOString(),
      to: preparedFilters.dateRange.to.toISOString()
    });
  }
  
  return preparedFilters;
};

// Hook for fetching articles with filtering capability
export function useArticles(initialFilters?: FilterOptions) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const previousFiltersRef = useRef<FilterOptions | undefined>(initialFilters);
  const isFirstRenderRef = useRef<boolean>(true);

  useEffect(() => {
    // Always fetch on first render or if filters changed
    if (isFirstRenderRef.current || !isEqual(initialFilters, previousFiltersRef.current)) {
      isFirstRenderRef.current = false;
      previousFiltersRef.current = initialFilters;
      
      const fetchArticles = async () => {
        setLoading(true);
        setError(null);
        
        try {
          // Build query string from filters
          const params = new URLSearchParams();
          const preparedFilters = prepareFiltersForAPI(initialFilters);
          
          if (preparedFilters?.dateRange) {
            // Format dates in ISO format
            const fromDate = preparedFilters.dateRange.from;
            const toDate = preparedFilters.dateRange.to;
            
            params.set('from', fromDate.toISOString());
            params.set('to', toDate.toISOString());
            
            console.log('Setting date parameters:', {
              from: fromDate.toISOString(),
              to: toDate.toISOString()
            });
          }
          
          if (preparedFilters?.keyword) {
            params.set('keyword', preparedFilters.keyword);
          }
          
          if (preparedFilters?.source && preparedFilters.source !== 'all') {
            params.set('source', preparedFilters.source);
          }
          
          if (preparedFilters?.sentiment) {
            // Only filter if this is a valid sentiment value (Positive, Neutral, Negative)
            // The type in FilterOptions doesn't include 'all', but we need to handle it in the UI
            const validSentiments: string[] = ['Positive', 'Neutral', 'Negative'];
            if (validSentiments.includes(preparedFilters.sentiment)) {
              params.set('sentiment', preparedFilters.sentiment);
            }
          }
          
          const queryString = params.toString();
          const url = `/api/articles${queryString ? `?${queryString}` : ''}`;
          
          console.log('Fetching articles with URL:', url);
          const response = await fetch(url);
          
          if (!response.ok) {
            throw new Error('Failed to fetch articles');
          }
          
          const responseData = await response.json();
          console.log('Articles response:', responseData);
          setArticles(responseData.data || []);
        } catch (err) {
          console.error('Error fetching articles:', err);
          setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
          setLoading(false);
        }
      };
      
      fetchArticles();
    }
  }, [initialFilters]);
  
  return { articles, loading, error };
}

// Hook for fetching sentiment summary
export function useSentimentSummary(filters?: FilterOptions) {
  const [summary, setSummary] = useState<ArticleSentimentSummary>({
    total: 0,
    positive: 0,
    neutral: 0,
    negative: 0
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const previousFiltersRef = useRef<FilterOptions | undefined>(filters);
  const isFirstRenderRef = useRef<boolean>(true);
  
  useEffect(() => {
    // Always fetch on first render or if filters changed
    if (isFirstRenderRef.current || !isEqual(filters, previousFiltersRef.current)) {
      isFirstRenderRef.current = false;
      previousFiltersRef.current = filters;
      
      console.log('Fetching sentiment summary with filters:', filters);
    
      const fetchSummary = async () => {
        setLoading(true);
        setError(null);
        
        try {
          const preparedFilters = prepareFiltersForAPI(filters);
          
          // Add the action parameter to specify we want sentiment summary
          const requestBody: any = {
            action: 'sentiment_summary',
            filters: preparedFilters
          };
          
          const response = await fetch('/api/articles', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
          });
          
          if (!response.ok) {
            throw new Error('Failed to fetch sentiment summary');
          }
          
          const responseData = await response.json();
          console.log('Sentiment summary response:', responseData);
          setSummary(responseData.data || { total: 0, positive: 0, neutral: 0, negative: 0 });
        } catch (err) {
          console.error('Error fetching sentiment summary:', err);
          setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
          setLoading(false);
        }
      };
      
      fetchSummary();
    }
  }, [filters]);
  
  return { summary, loading, error };
}

// Hook for fetching top sources
export function useTopSources(filters?: FilterOptions, limit: number = 5) {
  const [sources, setSources] = useState<ArticlesBySource[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const previousFiltersRef = useRef<FilterOptions | undefined>(filters);
  const previousLimitRef = useRef<number>(limit);
  const isFirstRenderRef = useRef<boolean>(true);
  
  useEffect(() => {
    // Always fetch on first render or if filters/limit changed
    if (isFirstRenderRef.current || !isEqual(filters, previousFiltersRef.current) || limit !== previousLimitRef.current) {
      isFirstRenderRef.current = false;
      previousFiltersRef.current = filters;
      previousLimitRef.current = limit;
      
      const fetchSources = async () => {
        setLoading(true);
        setError(null);
        
        try {
          const preparedFilters = prepareFiltersForAPI(filters);
          
          // Add the action parameter to specify we want top sources
          const requestBody: any = {
            action: 'top_sources',
            filters: preparedFilters,
            limit
          };
          
          const response = await fetch('/api/articles', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
          });
          
          if (!response.ok) {
            throw new Error('Failed to fetch top sources');
          }
          
          const responseData = await response.json();
          setSources(responseData.data?.sources || []);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
          setLoading(false);
        }
      };
      
      fetchSources();
    }
  }, [filters, limit]);
  
  return { sources, loading, error };
}

// Hook for fetching top tags
export function useTopTags(filters?: FilterOptions, limit: number = 5) {
  const [tags, setTags] = useState<ArticlesByTag[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const previousFiltersRef = useRef<FilterOptions | undefined>(filters);
  const previousLimitRef = useRef<number>(limit);
  const isFirstRenderRef = useRef<boolean>(true);
  
  useEffect(() => {
    // Always fetch on first render or if filters/limit changed
    if (isFirstRenderRef.current || !isEqual(filters, previousFiltersRef.current) || limit !== previousLimitRef.current) {
      isFirstRenderRef.current = false;
      previousFiltersRef.current = filters;
      previousLimitRef.current = limit;
      
      const fetchTags = async () => {
        setLoading(true);
        setError(null);
        
        try {
          const preparedFilters = prepareFiltersForAPI(filters);
          
          // Add the action parameter to specify we want top tags
          const requestBody: any = {
            action: 'top_tags',
            filters: preparedFilters,
            limit
          };
          
          const response = await fetch('/api/articles', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
          });
          
          if (!response.ok) {
            throw new Error('Failed to fetch top tags');
          }
          
          const responseData = await response.json();
          setTags(responseData.data?.tags || []);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
          setLoading(false);
        }
      };
      
      fetchTags();
    }
  }, [filters, limit]);
  
  return { tags, loading, error };
}

// Hook for fetching mentions over time
export function useMentionsOverTime(filters?: FilterOptions) {
  const [mentions, setMentions] = useState<{ date: string; count: number }[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const previousFiltersRef = useRef<FilterOptions | undefined>(filters);
  const isFirstRenderRef = useRef<boolean>(true);
  
  useEffect(() => {
    // Always fetch on first render or if filters changed
    if (isFirstRenderRef.current || !isEqual(filters, previousFiltersRef.current)) {
      isFirstRenderRef.current = false;
      previousFiltersRef.current = filters;
      
      console.log('Fetching mentions over time with filters:', filters);
    
      const fetchMentions = async () => {
        setLoading(true);
        setError(null);
        
        try {
          const preparedFilters = prepareFiltersForAPI(filters);
          
          // Add the action parameter to specify we want mentions over time
          const requestBody: any = {
            action: 'mentions_over_time',
            filters: preparedFilters
          };
          
          const response = await fetch('/api/articles', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
          });
          
          if (!response.ok) {
            throw new Error('Failed to fetch mentions over time');
          }
          
          const responseData = await response.json();
          console.log('Mentions over time response:', responseData);
          setMentions(responseData.data?.mentions || []);
        } catch (err) {
          console.error('Error fetching mentions over time:', err);
          setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
          setLoading(false);
        }
      };
      
      fetchMentions();
    }
  }, [filters]);
  
  return { mentions, loading, error };
} 