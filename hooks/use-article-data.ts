import { useState, useEffect, useRef } from 'react';
import { Article, ArticleSentimentSummary, ArticlesBySource, ArticlesByTag, FilterOptions } from '@/lib/data/types';

// Check if two filter options are equal
function isEqual(a?: FilterOptions, b?: FilterOptions): boolean {
  // Handle undefined cases
  if (!a && !b) return true;
  if (!a || !b) return false;

  // If either object has a forceUpdate flag, check if they differ
  if (a._forceUpdate || b._forceUpdate) {
    return a._forceUpdate === b._forceUpdate;
  }

  // Check date ranges
  if (a.dateRange && b.dateRange) {
    if (a.dateRange.from?.getTime() !== b.dateRange.from?.getTime()) return false;
    if (a.dateRange.to?.getTime() !== b.dateRange.to?.getTime()) return false;
  } else if ((a.dateRange && !b.dateRange) || (!a.dateRange && b.dateRange)) {
    return false;
  }

  // Check for all other filter properties
  const allProperties = new Set([
    ...Object.keys(a || {}),
    ...Object.keys(b || {})
  ]);

  // Skip these properties as they're checked separately or ignored
  const skipProperties = new Set(['dateRange', '_forceUpdate']);
  
  for (const prop of allProperties) {
    if (skipProperties.has(prop)) continue;
    
    const aValue = a[prop as keyof FilterOptions];
    const bValue = b[prop as keyof FilterOptions];
    
    // If one has the property and the other doesn't
    if ((aValue === undefined && bValue !== undefined) || 
        (aValue !== undefined && bValue === undefined)) {
      return false;
    }
    
    // If both are arrays, check if they have the same content
    if (Array.isArray(aValue) && Array.isArray(bValue)) {
      if (aValue.length !== bValue.length) return false;
      
      // Sort arrays to ensure consistent comparison
      const sortedA = [...aValue].sort();
      const sortedB = [...bValue].sort();
      
      for (let i = 0; i < sortedA.length; i++) {
        if (sortedA[i] !== sortedB[i]) return false;
      }
    } 
    // For non-array values
    else if (aValue !== bValue) {
      return false;
    }
  }
  
  return true;
}

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
          // Use POST method with body instead of query params
          const preparedFilters = prepareFiltersForAPI(initialFilters);
          
          console.log('Fetching articles with filters:', preparedFilters);
          
          const response = await fetch('/api/articles', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(preparedFilters || {}),
          });
          
          if (!response.ok) {
            throw new Error('Failed to fetch articles');
          }
          
          const responseData = await response.json();
          console.log('Articles response:', responseData);
          setArticles(responseData.articles || []);
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