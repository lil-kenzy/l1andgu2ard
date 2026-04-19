/**
 * sanitize.js – Express middleware for XSS and NoSQL-injection prevention.
 *
 * Two layers:
 *  1. NoSQL injection scrubber  – strips MongoDB operator keys ($, .) from
 *     req.body / req.params / req.query so malicious `{ "$gt": "" }` payloads
 *     cannot reach Mongoose queries.
 *  2. XSS scrubber – replaces the five dangerous HTML characters in every
 *     string value, preventing stored-XSS through user-supplied fields.
 *
 * This is a lightweight, zero-dependency implementation.  If you later add
 * `mongo-sanitize` or `xss-clean` to package.json you can replace this file.
 */

'use strict';

// Characters that must be HTML-entity-encoded to prevent XSS
const XSS_MAP = {
  '&':  '&amp;',
  '<':  '&lt;',
  '>':  '&gt;',
  '"':  '&quot;',
  "'":  '&#x27;',
  '/':  '&#x2F;',
};

const XSS_REGEX = /[&<>"'/]/g;

/**
 * Recursively walk an object/array and:
 *  – remove keys that start with `$` or contain `.` (NoSQL operators)
 *  – HTML-encode string values
 *
 * @param {unknown} input
 * @param {boolean} [encodeStrings=true]
 * @returns {unknown}
 */
function sanitizeValue(input, encodeStrings = true) {
  if (input === null || input === undefined) return input;

  if (typeof input === 'string') {
    return encodeStrings ? input.replace(XSS_REGEX, (c) => XSS_MAP[c]) : input;
  }

  if (typeof input === 'number' || typeof input === 'boolean') {
    return input;
  }

  if (Array.isArray(input)) {
    return input.map((v) => sanitizeValue(v, encodeStrings));
  }

  if (typeof input === 'object') {
    const clean = {};
    for (const key of Object.keys(input)) {
      // Strip MongoDB operator keys and dotted path keys
      if (key.startsWith('$') || key.includes('.')) continue;
      clean[key] = sanitizeValue(input[key], encodeStrings);
    }
    return clean;
  }

  return input;
}

/**
 * Express middleware.
 * Sanitizes req.body (XSS + NoSQL), req.params (NoSQL only), req.query (NoSQL only).
 *
 * Note: params/query values are URL-decoded strings; we do NOT HTML-encode them
 * because they are used in database lookups, not rendered directly in HTML.
 */
function sanitizeMiddleware(req, _res, next) {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeValue(req.body, true);
  }

  if (req.params && typeof req.params === 'object') {
    req.params = sanitizeValue(req.params, false);
  }

  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeValue(req.query, false);
  }

  next();
}

module.exports = { sanitizeMiddleware, sanitizeValue };
