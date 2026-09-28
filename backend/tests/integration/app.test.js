const request = require('supertest');
const app = require('../../src/app');

describe('App Integration Tests', () => {
  describe('GET /api/health', () => {
    it('should return 200 and success message', async () => {
      const response = await request(app).get('/api/health');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'EMINENCE API is running');
    });
  });

  describe('XSS Request Sanitization', () => {
    const { sanitizeString, sanitizeChatMessage } = require('../../src/middleware/requestValidator');

    it('should strip script tags, attributes, event handlers, and javascript URIs', () => {
      expect(sanitizeString('<script>alert("xss")</script>')).toBe('alert("xss")');
      expect(sanitizeString('javascript:alert(1)')).toBe('alert(1)');
      expect(sanitizeString('<img src="x" onerror="alert(1)">')).toBe('');
      expect(sanitizeString('Hello <b onmouseover=alert(1)>World</b>')).toBe('Hello World');
      expect(sanitizeString('data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==')).toBe(';base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==');
    });

    it('should sanitize chat messages and enforce max length', () => {
      expect(sanitizeChatMessage('<script>bad()</script>hello')).toBe('bad()hello');
      const longMsg = 'a'.repeat(1200);
      expect(sanitizeChatMessage(longMsg).length).toBe(1000);
    });
  });
});
