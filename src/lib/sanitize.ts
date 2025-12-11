/**
 * Input Sanitization Utilities
 *
 * Provides functions to sanitize user input and prevent XSS attacks.
 * Uses a lightweight approach without external dependencies for basic sanitization.
 * For rich text content, consider using DOMPurify library.
 *
 * @module sanitize
 */

/**
 * HTML entities that need to be escaped
 */
const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
};

/**
 * Escape HTML entities in a string to prevent XSS
 *
 * Converts potentially dangerous characters to their HTML entity equivalents.
 * This prevents browsers from interpreting user input as HTML/JavaScript.
 *
 * @param text - The text to escape
 * @returns Escaped text safe for HTML rendering
 *
 * @example
 * ```ts
 * escapeHtml('<script>alert("xss")</script>')
 * // Returns: '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
 * ```
 */
export function escapeHtml(text: string): string {
  return text.replace(/[&<>"'/]/g, (char) => HTML_ENTITIES[char] || char);
}

/**
 * Sanitize text input for safe storage and display
 *
 * Performs the following operations:
 * - Trims whitespace
 * - Removes null bytes
 * - Normalizes line endings
 * - Escapes HTML entities
 *
 * @param text - The text to sanitize
 * @param options - Sanitization options
 * @returns Sanitized text
 *
 * @example
 * ```ts
 * sanitizeText('  Hello <script>  ', { trim: true, escapeHtml: true })
 * // Returns: 'Hello &lt;script&gt;'
 * ```
 */
export function sanitizeText(
  text: string,
  options: {
    /** Remove leading/trailing whitespace */
    trim?: boolean;
    /** Escape HTML entities */
    escapeHtml?: boolean;
    /** Maximum length (truncates if longer) */
    maxLength?: number;
  } = {}
): string {
  const { trim = true, escapeHtml: shouldEscapeHtml = true, maxLength } = options;

  let sanitized = text;

  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '');

  // Normalize line endings
  sanitized = sanitized.replace(/\r\n/g, '\n');

  // Trim whitespace
  if (trim) {
    sanitized = sanitized.trim();
  }

  // Truncate if needed
  if (maxLength && sanitized.length > maxLength) {
    sanitized = sanitized.slice(0, maxLength);
  }

  // Escape HTML
  if (shouldEscapeHtml) {
    sanitized = escapeHtml(sanitized);
  }

  return sanitized;
}

/**
 * Sanitize a journal entry or long-form text
 *
 * Similar to sanitizeText but preserves line breaks and allows more formatting.
 *
 * @param text - The journal entry text
 * @param maxLength - Maximum length (default: 2000)
 * @returns Sanitized journal entry
 */
export function sanitizeJournalEntry(text: string, maxLength = 2000): string {
  return sanitizeText(text, {
    trim: true,
    escapeHtml: true,
    maxLength,
  });
}

/**
 * Sanitize sensation notes
 *
 * @param notes - The sensation notes
 * @param maxLength - Maximum length (default: 200)
 * @returns Sanitized notes
 */
export function sanitizeSensationNotes(notes: string, maxLength = 200): string {
  return sanitizeText(notes, {
    trim: true,
    escapeHtml: true,
    maxLength,
  });
}

/**
 * Sanitize an email address
 *
 * Validates and sanitizes email format.
 * Note: This is basic validation. Use Zod schema for comprehensive validation.
 *
 * @param email - The email address
 * @returns Sanitized email or null if invalid
 */
export function sanitizeEmail(email: string): string | null {
  const trimmed = email.trim().toLowerCase();

  // Basic email regex (not comprehensive, use Zod for full validation)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(trimmed)) {
    return null;
  }

  return trimmed;
}

/**
 * Sanitize a URL
 *
 * Ensures URL is safe and uses allowed protocols.
 *
 * @param url - The URL to sanitize
 * @param allowedProtocols - Allowed URL protocols
 * @returns Sanitized URL or null if invalid
 */
export function sanitizeUrl(
  url: string,
  allowedProtocols: string[] = ['http:', 'https:']
): string | null {
  try {
    const parsed = new URL(url.trim());

    if (!allowedProtocols.includes(parsed.protocol)) {
      return null;
    }

    return parsed.toString();
  } catch {
    return null;
  }
}

/**
 * Remove script tags and event handlers from HTML string
 *
 * This is a basic implementation. For production use with user-generated HTML,
 * consider using DOMPurify library.
 *
 * @param html - The HTML string
 * @returns Cleaned HTML
 */
export function removeScripts(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/on\w+\s*=\s*[^\s>]*/gi, '');
}

/**
 * Sanitize filename for safe storage
 *
 * Removes potentially dangerous characters from filenames.
 *
 * @param filename - The filename to sanitize
 * @returns Safe filename
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .trim()
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_{2,}/g, '_')
    .slice(0, 255); // Max filename length
}

/**
 * Validate and sanitize a Firebase document ID
 *
 * Firebase document IDs have specific requirements.
 *
 * @param id - The document ID
 * @returns Valid document ID or null
 */
export function sanitizeDocumentId(id: string): string | null {
  const trimmed = id.trim();

  // Firebase document ID rules:
  // - Cannot be empty
  // - Cannot contain forward slashes
  // - Cannot be exactly "." or ".."
  // - Must be less than 1500 bytes

  if (!trimmed || trimmed === '.' || trimmed === '..' || trimmed.includes('/')) {
    return null;
  }

  if (new Blob([trimmed]).size > 1500) {
    return null;
  }

  return trimmed;
}

/**
 * Sanitize an object's string values recursively
 *
 * Useful for sanitizing entire form submissions.
 *
 * @param obj - The object to sanitize
 * @param options - Sanitization options
 * @returns Sanitized object
 */
export function sanitizeObject<T extends Record<string, any>>(
  obj: T,
  options: {
    escapeHtml?: boolean;
    maxDepth?: number;
  } = {}
): T {
  const { escapeHtml: shouldEscape = true, maxDepth = 10 } = options;

  function sanitizeValue(value: any, depth: number): any {
    // Prevent infinite recursion
    if (depth > maxDepth) {
      return value;
    }

    if (typeof value === 'string') {
      return sanitizeText(value, { escapeHtml: shouldEscape });
    }

    if (Array.isArray(value)) {
      return value.map((item) => sanitizeValue(item, depth + 1));
    }

    if (value !== null && typeof value === 'object') {
      const sanitized: Record<string, any> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val, depth + 1);
      }
      return sanitized;
    }

    return value;
  }

  return sanitizeValue(obj, 0) as T;
}

/**
 * Strip markdown formatting from text
 *
 * Removes markdown syntax but preserves the text content.
 * Useful for generating plain text previews.
 *
 * @param markdown - The markdown text
 * @returns Plain text without markdown syntax
 */
export function stripMarkdown(markdown: string): string {
  return markdown
    // Remove headers
    .replace(/^#+\s+/gm, '')
    // Remove bold/italic
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(\*|_)(.*?)\1/g, '$2')
    // Remove links
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Remove inline code
    .replace(/`([^`]+)`/g, '$1')
    // Remove code blocks
    .replace(/```[\s\S]*?```/g, '')
    // Remove images
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
    // Remove blockquotes
    .replace(/^>\s+/gm, '')
    // Remove list markers
    .replace(/^[\*\-\+]\s+/gm, '')
    .replace(/^\d+\.\s+/gm, '')
    .trim();
}
