import { NextResponse } from 'next/server';
import { getArticles } from '@/lib/data/articles';

/**
 * GET handler for unique issues in articles
 * Extracts unique assigned_issue values from the articles
 */
export async function GET(request: Request) {
  try {
    // Get all articles
    const articles = await getArticles();
    
    // Extract unique assigned_issue values
    const uniqueIssues = new Set<string>();
    
    articles.forEach(article => {
      if (article.assigned_issue && article.assigned_issue.trim() !== '') {
        uniqueIssues.add(article.assigned_issue);
      }
    });
    
    // Convert Set to array and sort
    const issues = Array.from(uniqueIssues).sort();
    
    console.log(`API issues - Found ${issues.length} unique issues`);
    
    return NextResponse.json({
      issues,
      meta: {
        total: issues.length
      }
    });
  } catch (error) {
    console.error('Error in issues API route:', error);
    return NextResponse.json({ 
      issues: [],
      error: 'Failed to fetch issues'
    }, { status: 500 });
  }
} 