import fs from 'fs';
import path from 'path';
import { Article, ArticleSentimentSummary, ArticlesBySource, ArticlesByTag, FilterOptions } from './types';

/**
 * ArticleService - A layer to abstract data access
 * This will make it easier to switch to a real API in the future
 */
class ArticleService {
  // Current implementation uses a local JSON file
  private static dataFilePath = path.join(process.cwd(), 'data', 'static_data.json');
  
  /**
   * Get all articles from the data source
   */
  static async getArticles(): Promise<Article[]> {
    try {
      // In a future implementation, this would be an API call
      console.log('Loading data from:', this.dataFilePath);
      const jsonData = fs.readFileSync(this.dataFilePath, 'utf8');
      const articles: Article[] = JSON.parse(jsonData);
      console.log(`Loaded ${articles.length} articles from data file`);
      return articles;
    } catch (error) {
      console.error('Error loading articles data:', error);
      return [];
    }
  }
  
  /**
   * Get filtered articles based on options
   */
  static async getFilteredArticles(options?: FilterOptions): Promise<Article[]> {
    const articles = await this.getArticles();
    
    if (!options) return articles;
    
    return articles.filter(article => {
      // Filter by date range
      if (options.dateRange) {
        const articleDate = new Date(article.published_date);
        if (articleDate < options.dateRange.from || articleDate > options.dateRange.to) {
          return false;
        }
      }
      
      // Filter by keyword/tag
      if (options.keyword) {
        const keyword = options.keyword.toLowerCase();
        const hasKeyword = 
          article.title.toLowerCase().includes(keyword) ||
          article.content.toLowerCase().includes(keyword) ||
          (article.tags && article.tags.some(tag => tag && tag.toLowerCase().includes(keyword)));
        
        if (!hasKeyword) return false;
      }
      
      // Filter by source
      if (options.source && article.source !== options.source) {
        return false;
      }
      
      // Filter by sentiment (using the first sentiment analysis entry as dominant)
      if (options.sentiment && article.sentiment_analysis && article.sentiment_analysis.length > 0) {
        // Check if any sentiment analysis matches the requested sentiment
        const hasSentiment = article.sentiment_analysis.some(
          analysis => analysis.sentiment === options.sentiment
        );
        if (!hasSentiment) return false;
      }
      
      return true;
    });
  }
  
  /**
   * Get sentiment summary (positive, negative, neutral counts)
   */
  static async getSentimentSummary(articles?: Article[]): Promise<ArticleSentimentSummary> {
    const data = articles || await this.getArticles();
    
    const summary: ArticleSentimentSummary = {
      positive: 0,
      negative: 0,
      neutral: 0,
      total: data.length
    };
    
    // Count articles by predominant sentiment
    data.forEach(article => {
      if (!article.sentiment_analysis || article.sentiment_analysis.length === 0) {
        summary.neutral++; // Default to neutral if no sentiment data
        return;
      }
      
      const sentiments = article.sentiment_analysis.map(s => s.sentiment);
      const positiveCount = sentiments.filter(s => s === 'Positive').length;
      const negativeCount = sentiments.filter(s => s === 'Negative').length;
      const neutralCount = sentiments.filter(s => s === 'Neutral').length;
      
      if (positiveCount > negativeCount && positiveCount > neutralCount) {
        summary.positive++;
      } else if (negativeCount > positiveCount && negativeCount > neutralCount) {
        summary.negative++;
      } else {
        summary.neutral++;
      }
    });
    
    return summary;
  }
  
  /**
   * Get top sources by article count
   */
  static async getTopSources(articles?: Article[], limit: number = 5): Promise<ArticlesBySource[]> {
    const data = articles || await this.getArticles();
    
    // Count articles by source
    const sourceCounts: Record<string, number> = {};
    data.forEach(article => {
      if (article.source) {
        sourceCounts[article.source] = (sourceCounts[article.source] || 0) + 1;
      }
    });
    
    // Convert to array and sort by count
    const sourceArray = Object.entries(sourceCounts).map(([source, count]) => ({ 
      source, 
      count 
    }));
    
    // Sort by count and limit
    return sourceArray.sort((a, b) => b.count - a.count).slice(0, limit);
  }
  
  /**
   * Get top tags by frequency
   */
  static async getTopTags(articles?: Article[], limit: number = 5): Promise<ArticlesByTag[]> {
    const data = articles || await this.getArticles();
    
    // Count articles by tag
    const tagCounts: Record<string, number> = {};
    data.forEach(article => {
      if (article.tags && Array.isArray(article.tags)) {
        article.tags.forEach(tag => {
          if (tag) { // Skip null/undefined tags
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
          }
        });
      }
    });
    
    // Convert to array and sort by count
    const tagArray = Object.entries(tagCounts).map(([tag, count]) => ({ 
      tag, 
      count 
    }));
    
    // Sort by count and limit
    return tagArray.sort((a, b) => b.count - a.count).slice(0, limit);
  }
  
  /**
   * Get mentions over time (grouped by date)
   */
  static async getMentionsOverTime(articles?: Article[]): Promise<{ date: string; count: number }[]> {
    const data = articles || await this.getArticles();
    
    // Group articles by date
    const dateCounts: Record<string, number> = {};
    data.forEach(article => {
      if (article.published_date) {
        const date = new Date(article.published_date).toISOString().split('T')[0]; // YYYY-MM-DD
        dateCounts[date] = (dateCounts[date] || 0) + 1;
      }
    });
    
    // Convert to array and sort by date
    const dateArray = Object.entries(dateCounts).map(([date, count]) => ({ 
      date, 
      count 
    }));
    
    // Sort by date
    return dateArray.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }
}

// Export the service methods to maintain the same API as before
export const getArticles = ArticleService.getArticles.bind(ArticleService);
export const getFilteredArticles = ArticleService.getFilteredArticles.bind(ArticleService);
export const getSentimentSummary = ArticleService.getSentimentSummary.bind(ArticleService);
export const getTopSources = ArticleService.getTopSources.bind(ArticleService);
export const getTopTags = ArticleService.getTopTags.bind(ArticleService);
export const getMentionsOverTime = ArticleService.getMentionsOverTime.bind(ArticleService); 