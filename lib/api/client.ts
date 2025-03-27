import { ApiError, ApiResponse } from '../data/types';

/**
 * ApiClient - A service for making HTTP requests to the backend API
 * Currently uses fetch, but could be replaced with axios or another HTTP client
 */
class ApiClient {
  private baseUrl: string;
  private headers: Record<string, string>;

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl;
    this.headers = {
      'Content-Type': 'application/json',
    };
  }

  /**
   * Set an authentication token for API requests
   */
  setAuthToken(token: string): void {
    this.headers['Authorization'] = `Bearer ${token}`;
  }

  /**
   * Clear the authentication token
   */
  clearAuthToken(): void {
    delete this.headers['Authorization'];
  }

  /**
   * Make a GET request to the API
   */
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    try {
      // Build URL with query parameters
      const url = new URL(`${this.baseUrl}${endpoint}`, window.location.origin);
      
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            // Handle date objects
            if (value instanceof Date) {
              url.searchParams.append(key, value.toISOString());
            } 
            // Handle arrays
            else if (Array.isArray(value)) {
              value.forEach(item => url.searchParams.append(`${key}[]`, String(item)));
            }
            // Handle objects (convert to JSON string)
            else if (typeof value === 'object') {
              url.searchParams.append(key, JSON.stringify(value));
            }
            // Handle primitive values
            else {
              url.searchParams.append(key, String(value));
            }
          }
        });
      }
      
      // Make the request
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: this.headers,
      });
      
      return this.handleResponse<T>(response);
    } catch (error) {
      return this.handleError<T>(error);
    }
  }

  /**
   * Make a POST request to the API
   */
  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: this.headers,
        body: data ? JSON.stringify(data) : undefined,
      });
      
      return this.handleResponse<T>(response);
    } catch (error) {
      return this.handleError<T>(error);
    }
  }

  /**
   * Make a PUT request to the API
   */
  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'PUT',
        headers: this.headers,
        body: data ? JSON.stringify(data) : undefined,
      });
      
      return this.handleResponse<T>(response);
    } catch (error) {
      return this.handleError<T>(error);
    }
  }

  /**
   * Make a DELETE request to the API
   */
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'DELETE',
        headers: this.headers,
      });
      
      return this.handleResponse<T>(response);
    } catch (error) {
      return this.handleError<T>(error);
    }
  }

  /**
   * Handle successful API responses
   */
  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw {
        statusCode: response.status,
        message: response.statusText,
        details: errorData.message || errorData.error || null,
      } as ApiError;
    }

    const data = await response.json();
    return { 
      data: data.data || data,
      meta: data.meta,
    };
  }

  /**
   * Handle API request errors
   */
  private handleError<T>(error: any): ApiResponse<T> {
    console.error('API request failed:', error);
    
    if (error.statusCode) {
      // This is an ApiError that we created
      return { 
        data: {} as T, 
        error: `${error.message}${error.details ? `: ${error.details}` : ''}` 
      };
    }
    
    return { 
      data: {} as T, 
      error: error.message || 'Unknown error occurred' 
    };
  }
}

// Export a singleton instance of the API client
export const apiClient = new ApiClient();

// Re-export for cases when a new instance with custom configuration is needed
export default ApiClient; 