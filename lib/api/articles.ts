import { apiClient } from './client';
import { 
  Article, 
  ArticleSentimentSummary, 
  ArticlesBySource, 
  ArticlesByTag, 
  FilterOptions 
} from '../data/types';

/**
 * ArticlesApi - Service for interacting with the articles API endpoints
 * This class will be used when we migrate to a real backend
 */
export class ArticlesApi {
  /**
   * Get all articles with optional filtering
   */
  static async getArticles(filters?: FilterOptions): Promise<Article[]> {
    // Convert date objects to ISO strings for API requests
    const params: Record<string, any> = {};
    
    if (filters) {
      if (filters.dateRange) {
        params.from = filters.dateRange.from;
        params.to = filters.dateRange.to;
      }
      
      if (filters.keyword) params.keyword = filters.keyword;
      if (filters.source) params.source = filters.source;
      if (filters.sentiment) params.sentiment = filters.sentiment;
      if (filters.tag) params.tag = filters.tag;
    }
    
    const response = await apiClient.get<Article[]>('/articles', params);
    
    if (response.error) {
      console.error('Error fetching articles:', response.error);
      return [];
    }
    
    return response.data;
  }
  
  /**
   * Get sentiment summary data
   */
  static async getSentimentSummary(filters?: FilterOptions): Promise<ArticleSentimentSummary | null> {
    const response = await apiClient.post<ArticleSentimentSummary>('/articles', {
      action: 'sentiment_summary',
      filters
    });
    
    if (response.error) {
      console.error('Error fetching sentiment summary:', response.error);
      return null;
    }
    
    return response.data;
  }
  
  /**
   * Get top sources data
   */
  static async getTopSources(filters?: FilterOptions, limit: number = 5): Promise<ArticlesBySource[]> {
    const response = await apiClient.post<{ sources: ArticlesBySource[] }>('/articles', {
      action: 'top_sources',
      filters,
      limit
    });
    
    if (response.error) {
      console.error('Error fetching top sources:', response.error);
      return [];
    }
    
    return response.data.sources;
  }
  
  /**
   * Get top tags data
   */
  static async getTopTags(filters?: FilterOptions, limit: number = 5): Promise<ArticlesByTag[]> {
    const response = await apiClient.post<{ tags: ArticlesByTag[] }>('/articles', {
      action: 'top_tags',
      filters,
      limit
    });
    
    if (response.error) {
      console.error('Error fetching top tags:', response.error);
      return [];
    }
    
    return response.data.tags;
  }
  
  /**
   * Get mentions over time
   */
  static async getMentionsOverTime(filters?: FilterOptions): Promise<{ date: string; count: number }[]> {
    const response = await apiClient.post<{ mentions: { date: string; count: number }[] }>('/articles', {
      action: 'mentions_over_time',
      filters
    });
    
    if (response.error) {
      console.error('Error fetching mentions over time:', response.error);
      return [];
    }
    
    return response.data.mentions;
  }
}

// Export individual methods for ease of use
export const getArticles = ArticlesApi.getArticles;
export const getSentimentSummary = ArticlesApi.getSentimentSummary;
export const getTopSources = ArticlesApi.getTopSources;
export const getTopTags = ArticlesApi.getTopTags;
export const getMentionsOverTime = ArticlesApi.getMentionsOverTime; 