import { useState, useEffect, useRef } from 'react';
import { Article, ArticleSentimentSummary, ArticlesBySource, ArticlesByTag, FilterOptions } from '@/lib/data/types';

// Helper to deep compare objects
const isEqual = (a: any, b: any): boolean => {
  return JSON.stringify(a) === JSON.stringify(b);
};

// Hook for fetching articles with filtering capability
export function useArticles(initialFilters?: FilterOptions) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const previousFiltersRef = useRef<FilterOptions | undefined>(initialFilters);

  useEffect(() => {
    // Skip if filters haven't changed (deep comparison)
    if (isEqual(initialFilters, previousFiltersRef.current)) {
      return;
    }

    // Update reference
    previousFiltersRef.current = initialFilters;
    
    const fetchArticles = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Build query string from filters
        const params = new URLSearchParams();
        
        if (initialFilters?.dateRange) {
          params.set('from', initialFilters.dateRange.from.toISOString());
          params.set('to', initialFilters.dateRange.to.toISOString());
        }
        
        if (initialFilters?.keyword) {
          params.set('keyword', initialFilters.keyword);
        }
        
        if (initialFilters?.source) {
          params.set('source', initialFilters.source);
        }
        
        if (initialFilters?.sentiment) {
          params.set('sentiment', initialFilters.sentiment);
        }
        
        const queryString = params.toString();
        const url = `/api/articles${queryString ? `?${queryString}` : ''}`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error('Failed to fetch articles');
        }
        
        const responseData = await response.json();
        setArticles(responseData.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    fetchArticles();
  }, [initialFilters]);
  
  return { articles, loading, error };
}

// Hook for fetching sentiment summary
export function useSentimentSummary(filters?: FilterOptions) {
  const [summary, setSummary] = useState<ArticleSentimentSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const previousFiltersRef = useRef<FilterOptions | undefined>(filters);
  
  useEffect(() => {
    // Skip if filters haven't changed (deep comparison)
    if (isEqual(filters, previousFiltersRef.current)) {
      return;
    }

    // Update reference
    previousFiltersRef.current = filters;
    
    const fetchSummary = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch('/api/articles', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'sentiment_summary',
            filters,
          }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch sentiment summary');
        }
        
        const responseData = await response.json();
        setSummary(responseData.data || null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSummary();
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
  
  useEffect(() => {
    // Skip if filters and limit haven't changed
    if (isEqual(filters, previousFiltersRef.current) && limit === previousLimitRef.current) {
      return;
    }

    // Update references
    previousFiltersRef.current = filters;
    previousLimitRef.current = limit;
    
    const fetchSources = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch('/api/articles', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'top_sources',
            filters,
            limit,
          }),
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
  
  useEffect(() => {
    // Skip if filters and limit haven't changed
    if (isEqual(filters, previousFiltersRef.current) && limit === previousLimitRef.current) {
      return;
    }

    // Update references
    previousFiltersRef.current = filters;
    previousLimitRef.current = limit;
    
    const fetchTags = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch('/api/articles', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'top_tags',
            filters,
            limit,
          }),
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
  }, [filters, limit]);
  
  return { tags, loading, error };
}

// Hook for fetching mentions over time
export function useMentionsOverTime(filters?: FilterOptions) {
  const [mentions, setMentions] = useState<{ date: string; count: number }[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const previousFiltersRef = useRef<FilterOptions | undefined>(filters);
  
  useEffect(() => {
    // Skip if filters haven't changed (deep comparison)
    if (isEqual(filters, previousFiltersRef.current)) {
      return;
    }

    // Update reference
    previousFiltersRef.current = filters;
    
    const fetchMentions = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch('/api/articles', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'mentions_over_time',
            filters,
          }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch mentions over time');
        }
        
        const responseData = await response.json();
        setMentions(responseData.data?.mentions || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    fetchMentions();
  }, [filters]);
  
  return { mentions, loading, error };
} 