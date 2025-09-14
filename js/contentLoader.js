/**
 * Content Loader Utility
 * Handles dynamic loading and rendering of markdown content for panels
 */

/**
 * Simple markdown parser for basic formatting
 * @param {string} markdown - Raw markdown text
 * @returns {string} HTML string
 */
function parseMarkdown(markdown) {
  let html = markdown;

  // Headers
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

  // Bold text
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  // Italic text
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

  // Code blocks (inline)
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');

  // Unordered lists
  html = html.replace(/^\- (.*$)/gim, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');

  // Ordered lists (basic)
  html = html.replace(/^\d+\. (.*$)/gim, '<li>$1</li>');

  // Checkboxes
  html = html.replace(/- \[x\] (.*$)/gim, '<li class="completed">✅ $1</li>');
  html = html.replace(/- \[ \] (.*$)/gim, '<li class="todo">⬜ $1</li>');

  // Line breaks and paragraphs
  html = html.replace(/\n\n/g, '</p><p>');
  html = html.replace(/\n/g, '<br>');
  html = '<p>' + html + '</p>';

  // Clean up empty paragraphs
  html = html.replace(/<p><\/p>/g, '');
  html = html.replace(/<p><br>/g, '<p>');
  html = html.replace(/<br><\/p>/g, '</p>');

  // Handle headers that got wrapped in paragraphs
  html = html.replace(/<p>(<h[1-6]>.*?<\/h[1-6]>)<\/p>/g, '$1');

  // Handle lists that got wrapped in paragraphs
  html = html.replace(/<p>(<ul>.*?<\/ul>)<\/p>/gs, '$1');
  html = html.replace(/<p>(<ol>.*?<\/ol>)<\/p>/gs, '$1');

  return html;
}

/**
 * Content Loader class for managing dynamic content
 */
export class ContentLoader {
  constructor() {
    this.cache = new Map();
    this.loadingStates = new Map();
  }

  /**
   * Load content from a file with caching
   * @param {string} filePath - Path to the content file
   * @param {boolean} useCache - Whether to use cached version
   * @returns {Promise<string>} Promise resolving to file content
   */
  async loadContent(filePath, useCache = true) {
    // Return cached content if available and caching is enabled
    if (useCache && this.cache.has(filePath)) {
      return this.cache.get(filePath);
    }

    // Return existing promise if already loading
    if (this.loadingStates.has(filePath)) {
      return this.loadingStates.get(filePath);
    }

    // Create loading promise
    const loadingPromise = this.fetchContent(filePath);
    this.loadingStates.set(filePath, loadingPromise);

    try {
      const content = await loadingPromise;

      // Cache the content
      if (useCache) {
        this.cache.set(filePath, content);
      }

      return content;
    } catch (error) {
      console.error(`Failed to load content from ${filePath}:`, error);
      throw error;
    } finally {
      // Clean up loading state
      this.loadingStates.delete(filePath);
    }
  }

  /**
   * Fetch content from file
   * @param {string} filePath - Path to the content file
   * @returns {Promise<string>} Promise resolving to file content
   */
  async fetchContent(filePath) {
    try {
      const response = await fetch(filePath);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.text();
    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error(`Network error loading ${filePath}. Make sure the file exists and the server supports CORS.`);
      }
      throw error;
    }
  }

  /**
   * Load and render markdown content to HTML
   * @param {string} filePath - Path to the markdown file
   * @param {boolean} useCache - Whether to use cached version
   * @returns {Promise<string>} Promise resolving to HTML content
   */
  async loadMarkdown(filePath, useCache = true) {
    const markdown = await this.loadContent(filePath, useCache);
    return parseMarkdown(markdown);
  }

  /**
   * Load content and populate a DOM element
   * @param {string} filePath - Path to the content file
   * @param {string|HTMLElement} target - Target element selector or element
   * @param {Object} options - Loading options
   * @returns {Promise<void>}
   */
  async loadIntoElement(filePath, target, options = {}) {
    const {
      isMarkdown = true,
      useCache = true,
      loadingText = 'Loading...',
      errorText = 'Failed to load content. Please try again.',
      showLoading = true
    } = options;

    // Get target element
    const element = typeof target === 'string'
      ? document.querySelector(target)
      : target;

    if (!element) {
      throw new Error(`Target element not found: ${target}`);
    }

    // Show loading state
    if (showLoading) {
      element.innerHTML = `<p class="loading-text">${loadingText}</p>`;
    }

    try {
      let content;

      if (isMarkdown) {
        content = await this.loadMarkdown(filePath, useCache);
      } else {
        content = await this.loadContent(filePath, useCache);
      }

      element.innerHTML = content;
      element.classList.add('content-loaded');

    } catch (error) {
      console.error('Error loading content:', error);
      element.innerHTML = `<p class="error-text">${errorText}</p>`;
      element.classList.add('content-error');
    }
  }

  /**
   * Reload content and update cache
   * @param {string} filePath - Path to the content file
   * @returns {Promise<string>} Promise resolving to fresh content
   */
  async reloadContent(filePath) {
    // Clear cache for this file
    this.cache.delete(filePath);
    // Load fresh content
    return this.loadContent(filePath, true);
  }

  /**
   * Clear all cached content
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache statistics
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      loadingCount: this.loadingStates.size
    };
  }

  /**
   * Preload content files
   * @param {string[]} filePaths - Array of file paths to preload
   * @returns {Promise<void>}
   */
  async preloadContent(filePaths) {
    const promises = filePaths.map(path =>
      this.loadContent(path, true).catch(error => {
        console.warn(`Failed to preload ${path}:`, error.message);
        return null;
      })
    );

    await Promise.all(promises);
    console.log(`Preloaded ${filePaths.length} content files`);
  }
}

// Create global instance
window.contentLoader = new ContentLoader();

// Export for module use
export const contentLoader = window.contentLoader;
