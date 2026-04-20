/**
 * ocrService.js
 * Document OCR + metadata extraction pipeline.
 *
 * Supported providers (OCR_PROVIDER env var):
 *   ocr_space      – OCR.space REST API (default)  https://ocr.space/ocrapi
 *   google_vision  – Google Cloud Vision API
 *
 * When OCR_API_KEY is not set the service operates in sandbox mode and
 * returns plausible mock output so the rest of the pipeline keeps working.
 *
 * Required .env vars:
 *   OCR_PROVIDER=ocr_space|google_vision   (default: ocr_space)
 *   OCR_API_KEY=<your-api-key>
 *
 * Optional:
 *   GOOGLE_CLOUD_PROJECT=<project-id>      (google_vision only)
 */

const https = require('https');
const http  = require('http');
const FormData = require('form-data');

const PROVIDER   = (process.env.OCR_PROVIDER || 'ocr_space').toLowerCase();
const OCR_API_KEY = process.env.OCR_API_KEY || '';

// ── Helpers ────────────────────────────────────────────────────────────────────
/**
 * Extract structured metadata from raw OCR text.
 * Looks for common patterns in Ghanaian government documents.
 */
function extractMetadata(rawText) {
  const text = rawText || '';

  // Ghana Card pattern: GHA-XXXXXXXXX-X
  const ghanaCardMatches = text.match(/GHA[-\s]?\d{9}[-\s]?\d/gi) || [];

  // Generic ID numbers (any sequence of 6+ alphanumerics near "ID", "No", "Number")
  const idMatches = text.match(/(?:ID|No\.?|Number)[:\s]+([A-Z0-9]{6,})/gi) || [];

  // Dates: DD/MM/YYYY, DD-MM-YYYY, YYYY-MM-DD, Month DD YYYY
  const dateMatches = text.match(
    /\b(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|\d{4}[\/\-]\d{2}[\/\-]\d{2}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{1,2},?\s+\d{4})\b/gi
  ) || [];

  // Names (capitalised words on "Name:" lines) — capture until end-of-line
  const nameMatch  = text.match(/(?:Name|Surname|First Name)[:\s]+([A-Z][A-Za-z\s]{2,40}?)(?:\n|$|(?=\s+(?:Date|ID|No\.|Born|Gender|Issue|\d)))/i);
  const fullName   = nameMatch ? nameMatch[1].trim() : null;

  // Document type heuristics
  let documentType = 'unknown';
  if (/ghana\s*card|national\s*id/i.test(text))        documentType = 'ghana_card';
  else if (/land\s*title|deed|indenture/i.test(text))   documentType = 'land_title';
  else if (/birth\s*certif/i.test(text))                documentType = 'birth_certificate';
  else if (/passport/i.test(text))                      documentType = 'passport';
  else if (/business\s*reg/i.test(text))                documentType = 'business_registration';
  else if (/receipt|invoice/i.test(text))               documentType = 'receipt';

  return {
    documentType,
    fullName,
    ghanaCardNumbers: ghanaCardMatches.map((s) => s.replace(/\s/g, '')),
    idNumbers:        idMatches.map((s) => s.replace(/(?:ID|No\.?|Number)[:\s]+/i, '').trim()),
    dates:            dateMatches,
    wordCount:        text.split(/\s+/).filter(Boolean).length,
    extractedAt:      new Date().toISOString()
  };
}

// ── OCR.space provider ────────────────────────────────────────────────────────
function ocrSpaceRequest(buffer, mimeType) {
  return new Promise((resolve, reject) => {
    const form = new FormData();
    form.append('file',       buffer, { filename: 'document', contentType: mimeType });
    form.append('apikey',     OCR_API_KEY);
    form.append('language',   'eng');
    form.append('isOverlayRequired', 'false');
    form.append('detectOrientation', 'true');
    form.append('scale',      'true');
    form.append('OCREngine',  '2');  // more accurate engine

    const options = {
      hostname: 'api.ocr.space',
      port:     443,
      path:     '/parse/image',
      method:   'POST',
      headers:  form.getHeaders()
    };

    const req = https.request(options, (res) => {
      let raw = '';
      res.on('data', (c) => { raw += c; });
      res.on('end', () => {
        try {
          const json = JSON.parse(raw);
          if (json.OCRExitCode !== 1) {
            return reject(new Error(`OCR.space error: ${json.ErrorMessage || json.OCRExitCode}`));
          }
          const text = (json.ParsedResults || [])
            .map((r) => r.ParsedText || '')
            .join('\n');
          resolve(text);
        } catch {
          reject(new Error('OCR.space parse error'));
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(30000, () => { req.destroy(); reject(new Error('OCR.space timeout')); });
    form.pipe(req);
  });
}

// ── Google Vision provider ────────────────────────────────────────────────────
function googleVisionRequest(buffer) {
  return new Promise((resolve, reject) => {
    const apiKey = OCR_API_KEY;
    const body = JSON.stringify({
      requests: [{
        image:    { content: buffer.toString('base64') },
        features: [{ type: 'DOCUMENT_TEXT_DETECTION', maxResults: 1 }]
      }]
    });

    const options = {
      hostname: 'vision.googleapis.com',
      path:     `/v1/images:annotate?key=${encodeURIComponent(apiKey)}`,
      method:   'POST',
      headers: {
        'Content-Type':   'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    };

    const req = https.request(options, (res) => {
      let raw = '';
      res.on('data', (c) => { raw += c; });
      res.on('end', () => {
        try {
          const json = JSON.parse(raw);
          const annotation = json.responses?.[0]?.fullTextAnnotation;
          if (!annotation) {
            return reject(new Error('Google Vision: no text found'));
          }
          resolve(annotation.text || '');
        } catch {
          reject(new Error('Google Vision parse error'));
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(30000, () => { req.destroy(); reject(new Error('Google Vision timeout')); });
    req.write(body);
    req.end();
  });
}

// ── Sandbox mock ──────────────────────────────────────────────────────────────
function sandboxOcr() {
  return `REPUBLIC OF GHANA
NATIONAL IDENTIFICATION AUTHORITY
GHANA CARD
Name: KWAME MENSAH
ID No: GHA-123456789-0
Date of Birth: 01/01/1990
Gender: MALE
Issue Date: 15 March 2022
Expiry Date: 14 March 2032`;
}

// ── Public API ────────────────────────────────────────────────────────────────
/**
 * Run OCR on a file buffer and extract structured metadata.
 *
 * @param {Buffer} buffer    – raw file content
 * @param {string} mimeType  – e.g. 'application/pdf', 'image/jpeg'
 * @returns {Promise<{rawText, metadata, provider, sandbox}>}
 */
async function processDocument(buffer, mimeType) {
  let rawText;
  let sandbox  = false;
  let provider = PROVIDER;

  if (!OCR_API_KEY) {
    rawText  = sandboxOcr();
    sandbox  = true;
    provider = 'sandbox';
    console.log('[ocrService] No OCR_API_KEY — using sandbox mock');
  } else {
    try {
      if (provider === 'google_vision') {
        rawText = await googleVisionRequest(buffer);
      } else {
        rawText = await ocrSpaceRequest(buffer, mimeType);
      }
    } catch (err) {
      console.error('[ocrService] OCR request failed:', err.message);
      // Degrade gracefully: mark failed, return empty text
      return {
        rawText:  '',
        metadata: extractMetadata(''),
        provider,
        sandbox:  false,
        error:    err.message
      };
    }
  }

  const metadata = extractMetadata(rawText);

  return {
    rawText,
    metadata,
    provider,
    sandbox
  };
}

module.exports = { processDocument, extractMetadata };
