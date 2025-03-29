import * as fs from 'fs';
import * as path from 'path';
import { Article, ArticleSentimentSummary, ArticlesBySource, ArticlesByTag, ArticlesByIssue, FilterOptions, SentimentOverTime } from './types';

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
      // Date range filter
      if (options.dateRange && options.dateRange.from && options.dateRange.to) {
        const articleDate = new Date(article.published_date);
        const { from, to } = options.dateRange;
        
        if (articleDate < from || articleDate > to) {
          return false;
        }
      }
      
      // Keyword filter
      if (options.keyword && options.keyword !== null) {
        const keywords = options.keyword.split(' OR ').map(k => k.trim().toLowerCase());
        const articleContent = (article.title + ' ' + article.content).toLowerCase();
        
        // Check if the article contains any of the keywords
        const hasKeyword = keywords.some(keyword => 
          articleContent.includes(keyword)
        );
        
        if (!hasKeyword) return false;
      }
      
      // Source filter - can be single value or array
      if (options.source && article.source !== options.source) {
        return false;
      }
      
      // Support for multiple sources
      if (options.sources && options.sources.length > 0 && !options.sources.includes(article.source)) {
        return false;
      }
      
      // Sentiment filter - can be single value or array
      if (options.sentiment && article.sentiment_analysis && article.sentiment_analysis.length > 0) {
        // Check if any sentiment analysis matches the requested sentiment
        const hasSentiment = article.sentiment_analysis.some(
          analysis => analysis.sentiment === options.sentiment
        );
        if (!hasSentiment) return false;
      }
      
      // Support for multiple sentiments
      if (options.sentiments && options.sentiments.length > 0 && article.sentiment_analysis && article.sentiment_analysis.length > 0) {
        const hasSentiment = article.sentiment_analysis.some(
          analysis => options.sentiments && options.sentiments.includes(analysis.sentiment)
        );
        if (!hasSentiment) return false;
      }
      
      // Tag filter - can be single value or array
      if (options.tag && article.tags && !article.tags.includes(options.tag)) {
        return false;
      }
      
      // Support for multiple tags
      if (options.tags && options.tags.length > 0) {
        // If article has no tags or none of the requested tags, filter it out
        if (!article.tags || !options.tags.some((tag: string) => article.tags && article.tags.includes(tag))) {
          return false;
        }
      }
      
      // Assigned issue filter - can be single value or array
      if (options.assigned_issue && article.assigned_issue !== options.assigned_issue) {
        return false;
      }
      
      // Support for multiple assigned issues
      if (options.assigned_issues && options.assigned_issues.length > 0 && !options.assigned_issues.includes(article.assigned_issue || '')) {
        return false;
      }
      
      // Article passed all filters
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
  
  /**
   * Get sentiment data over time
   */
  static async getSentimentOverTime(articles?: Article[]): Promise<SentimentOverTime[]> {
    const data = articles || await this.getArticles();
    
    // Group articles by date
    const dateGroups: Record<string, Article[]> = {};
    
    data.forEach(article => {
      // Get date part only (without time)
      const publishedDate = new Date(article.published_date);
      const dateStr = publishedDate.toISOString().split('T')[0];
      
      if (!dateGroups[dateStr]) {
        dateGroups[dateStr] = [];
      }
      dateGroups[dateStr].push(article);
    });
    
    // Sort dates
    const sortedDates = Object.keys(dateGroups).sort();
    
    // Calculate sentiment metrics for each date
    const sentimentData = sortedDates.map(dateStr => {
      const articlesOnDate = dateGroups[dateStr];
      let positiveCount = 0;
      let neutralCount = 0;
      let negativeCount = 0;
      let totalScore = 0;
      
      articlesOnDate.forEach(article => {
        if (!article.sentiment_analysis || article.sentiment_analysis.length === 0) {
          neutralCount++;
          return;
        }
        
        // Count sentiment for each article
        const sentiments = article.sentiment_analysis.map(s => s.sentiment);
        const positiveInArticle = sentiments.filter(s => s === 'Positive').length;
        const negativeInArticle = sentiments.filter(s => s === 'Negative').length;
        const neutralInArticle = sentiments.filter(s => s === 'Neutral').length;
        
        // Get average sentiment score for the article
        const avgScore = article.sentiment_analysis.reduce((sum, item) => sum + item.sentiment_score, 0) 
          / article.sentiment_analysis.length;
        
        totalScore += avgScore;
        
        // Determine predominant sentiment for the article
        if (positiveInArticle > negativeInArticle && positiveInArticle > neutralInArticle) {
          positiveCount++;
        } else if (negativeInArticle > positiveInArticle && negativeInArticle > neutralInArticle) {
          negativeCount++;
        } else {
          neutralCount++;
        }
      });
      
      // Calculate average sentiment score for the day
      const avgDailyScore = articlesOnDate.length > 0 ? totalScore / articlesOnDate.length : 0;
      
      return {
        date: dateStr,
        positive: positiveCount,
        neutral: neutralCount,
        negative: negativeCount,
        score: avgDailyScore
      };
    });
    
    return sentimentData;
  }
  
  /**
   * Get top issues by frequency
   */
  static async getTopIssues(articles?: Article[], limit: number = 10): Promise<ArticlesByIssue[]> {
    console.log(`getTopIssues called with ${articles ? articles.length : 'no'} articles and limit ${limit}`);
    
    const data = articles || await this.getArticles();
    console.log(`getTopIssues working with ${data.length} articles`);
    
    // Count articles by issue
    const issueCounts: Record<string, number> = {};
    let articlesWithIssues = 0;
    
    data.forEach(article => {
      if (article.assigned_issue) {
        articlesWithIssues++;
        issueCounts[article.assigned_issue] = (issueCounts[article.assigned_issue] || 0) + 1;
      }
    });
    
    console.log(`Found ${articlesWithIssues} articles with assigned issues`);
    console.log('Issue counts:', issueCounts);
    
    // Convert to array and sort by count
    const issueArray = Object.entries(issueCounts).map(([issue, count]) => ({ 
      issue, 
      count 
    }));
    
    // Sort by count and limit
    const result = issueArray.sort((a, b) => b.count - a.count).slice(0, limit);
    console.log(`Returning ${result.length} issues:`, result);
    
    return result;
  }
}

// Export the service methods to maintain the same API as before
export const getArticles = ArticleService.getArticles.bind(ArticleService);
export const getFilteredArticles = ArticleService.getFilteredArticles.bind(ArticleService);
export const getSentimentSummary = ArticleService.getSentimentSummary.bind(ArticleService);
export const getTopSources = ArticleService.getTopSources.bind(ArticleService);
export const getTopTags = ArticleService.getTopTags.bind(ArticleService);
export const getMentionsOverTime = ArticleService.getMentionsOverTime.bind(ArticleService);
export const getSentimentOverTime = ArticleService.getSentimentOverTime.bind(ArticleService);
export const getTopIssues = ArticleService.getTopIssues.bind(ArticleService); 