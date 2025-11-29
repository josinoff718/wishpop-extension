// WishPop API Integration Module
// This module provides a consistent interface for interacting with the WishPop API

class WishPopAPI {
  constructor() {
    this.baseUrl = null;
    this.apiKey = null;
    this.initialized = false;
  }

  // Initialize API with settings from storage
  async init() {
    const { apiUrl, apiKey } = await chrome.storage.sync.get(['apiUrl', 'apiKey']);
    this.baseUrl = apiUrl || 'https://wishpop.app';
    this.apiKey = apiKey;
    this.initialized = true;
    return this;
  }

  // Ensure API is initialized
  async ensureInit() {
    if (!this.initialized) {
      await this.init();
    }
  }

  // Get auth headers
  getHeaders(additionalHeaders = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...additionalHeaders
    };

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    return headers;
  }

  // Make API request
  async request(endpoint, options = {}) {
    await this.ensureInit();

    const url = `${this.baseUrl}${endpoint}`;
    const config = {
      ...options,
      headers: this.getHeaders(options.headers)
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new APIError(data.message || 'API request failed', response.status, data);
      }

      return data;
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError('Network error', 0, { originalError: error.message });
    }
  }

  // Wishlist endpoints
  async getWishlistItems(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/api/p/688a4a52e2f530af6381409f/function/wishlistApi?action=items${queryString ? `&${queryString}` : ''}`;
    return this.request(endpoint);
  }

  async getWishlistItemCount() {
    const data = await this.request('/api/p/688a4a52e2f530af6381409f/function/wishlistApi?action=count');
    return data.count || 0;
  }

  async addWishlistItem(item) {
    return this.request('/api/p/688a4a52e2f530af6381409f/function/wishlistApi?action=items', {
      method: 'POST',
      body: JSON.stringify(item)
    });
  }

  async updateWishlistItem(itemId, updates) {
    return this.request(`/api/wishlist/items/${itemId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    });
  }

  async deleteWishlistItem(itemId) {
    return this.request(`/api/wishlist/items/${itemId}`, {
      method: 'DELETE'
    });
  }

  async getWishlistItem(itemId) {
    return this.request(`/api/wishlist/items/${itemId}`);
  }

  // User endpoints
  async getCurrentUser() {
    return this.request('/api/user/me');
  }

  async updateUserProfile(updates) {
    return this.request('/api/user/me', {
      method: 'PATCH',
      body: JSON.stringify(updates)
    });
  }

  // Authentication endpoints
  async login(credentials) {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
  }

  async logout() {
    return this.request('/api/auth/logout', {
      method: 'POST'
    });
  }

  async refreshToken() {
    return this.request('/api/auth/refresh', {
      method: 'POST'
    });
  }

  // Categories endpoints
  async getCategories() {
    return this.request('/api/categories');
  }

  async createCategory(category) {
    return this.request('/api/categories', {
      method: 'POST',
      body: JSON.stringify(category)
    });
  }

  // Tags endpoints
  async getTags() {
    return this.request('/api/tags');
  }

  async createTag(tag) {
    return this.request('/api/tags', {
      method: 'POST',
      body: JSON.stringify(tag)
    });
  }

  // Search endpoints
  async searchWishlist(query, filters = {}) {
    const params = { q: query, ...filters };
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/api/wishlist/search?${queryString}`);
  }

  // Price tracking endpoints
  async checkPriceUpdates(itemId) {
    return this.request(`/api/wishlist/items/${itemId}/price-check`, {
      method: 'POST'
    });
  }

  async getPriceHistory(itemId) {
    return this.request(`/api/wishlist/items/${itemId}/price-history`);
  }

  // Sharing endpoints
  async shareWishlist(shareOptions) {
    return this.request('/api/wishlist/share', {
      method: 'POST',
      body: JSON.stringify(shareOptions)
    });
  }

  async getSharedWishlist(shareId) {
    return this.request(`/api/wishlist/shared/${shareId}`);
  }

  // Utility methods
  isAuthenticated() {
    return !!this.apiKey;
  }

  setApiKey(apiKey) {
    this.apiKey = apiKey;
  }

  setBaseUrl(baseUrl) {
    this.baseUrl = baseUrl;
  }

  async checkHealth() {
    try {
      await this.request('/api/health');
      return true;
    } catch (error) {
      return false;
    }
  }
}

// Custom API Error class
class APIError extends Error {
  constructor(message, statusCode, data = {}) {
    super(message);
    this.name = 'APIError';
    this.statusCode = statusCode;
    this.data = data;
  }

  isAuthError() {
    return this.statusCode === 401 || this.statusCode === 403;
  }

  isNotFoundError() {
    return this.statusCode === 404;
  }

  isValidationError() {
    return this.statusCode === 400 || this.statusCode === 422;
  }

  isServerError() {
    return this.statusCode >= 500;
  }
}

// Export singleton instance
const api = new WishPopAPI();

// For use in extension scripts
if (typeof window !== 'undefined') {
  window.WishPopAPI = api;
}

// For use in service worker
if (typeof self !== 'undefined' && self.registration) {
  self.WishPopAPI = api;
}
