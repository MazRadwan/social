export interface SentimentAnalysis {
  text: string;
  sentiment_score: number;
  sentiment: 'Positive' | 'Neutral' | 'Negative';
}

export interface Article {
  title: string;
  link: string;
  content: string;
  published_date: string;
  tags: string[];
  source: string;
  subreddit?: string | null;
  upvotes?: number | null;
  comments?: number | null;
  assigned_issue?: string | null;
  sentiment_analysis: SentimentAnalysis[];
}

export interface ArticleSentimentSummary {
  positive: number;
  negative: number;
  neutral: number;
  total: number;
}

export interface ArticlesBySource {
  source: string;
  count: number;
}

export interface ArticlesByTag {
  tag: string;
  count: number;
}

export interface FilterOptions {
  dateRange?: {
    from: Date;
    to: Date;
  };
  keyword?: string;
  source?: string;
  sentiment?: 'Positive' | 'Neutral' | 'Negative';
  tag?: string;
  assigned_issue?: string;
  _forceUpdate?: number;
}

// API related types for future implementation
export interface ApiResponse<T> {
  data: T;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
  };
  error?: string;
}

export interface ApiError {
  statusCode: number;
  message: string;
  details?: string;
} 