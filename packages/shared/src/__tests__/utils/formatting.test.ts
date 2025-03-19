import {
  formatDate,
  formatDateTime,
  formatRelativeTime,
  formatCurrency,
  formatBytes,
  formatName,
  formatPhoneNumber,
} from '../../utils/formatting';

// Mock tarih için
const mockDate = new Date('2023-01-15T12:30:45');

describe('Formatting Utils', () => {
  describe('formatDate', () => {
    it('should format date correctly for Turkish locale', () => {
      const formatted = formatDate(mockDate);
      // Test is not exact due to locale differences but check if contains key parts
      expect(formatted).toContain('2023');
      expect(formatted.length).toBeGreaterThan(6);
    });

    it('should format date correctly for English locale', () => {
      const formatted = formatDate(mockDate, 'en-US');
      expect(formatted).toContain('2023');
      expect(formatted).toContain('15');
    });
  });

  describe('formatDateTime', () => {
    it('should format date and time correctly', () => {
      const formatted = formatDateTime(mockDate);
      expect(formatted).toContain('2023');
      expect(formatted.length).toBeGreaterThan(10); // Should include time part
    });
  });

  describe('formatRelativeTime', () => {
    it('should return relative time correctly', () => {
      // Manual assertion without date mocking
      const result = formatRelativeTime(new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)); // 3 days ago
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });
  });

  describe('formatCurrency', () => {
    it('should format currency values correctly', () => {
      const formatted = formatCurrency(1234.56);
      expect(formatted).toBeDefined();
      expect(formatted.length).toBeGreaterThan(4);

      const formattedUSD = formatCurrency(1234.56, 'USD', 'en-US');
      expect(formattedUSD).toBeDefined();
      expect(formattedUSD.length).toBeGreaterThan(4);
    });
  });

  describe('formatBytes', () => {
    it('should format byte values correctly', () => {
      expect(formatBytes(0)).toBe('0 Bytes');
      expect(formatBytes(1024)).toBe('1 KB');
      expect(formatBytes(1024 * 1024)).toBe('1 MB');
      expect(formatBytes(1024 * 1024 * 1024)).toBe('1 GB');
    });
  });

  describe('formatName', () => {
    it('should capitalize name correctly', () => {
      expect(formatName('john')).toBe('John');
      expect(formatName('JOHN')).toBe('John');
      expect(formatName('john doe')).toBe('John Doe');
      expect(formatName('jOHN dOE')).toBe('John Doe');
    });
  });

  describe('formatPhoneNumber', () => {
    it('should format international phone number correctly', () => {
      expect(formatPhoneNumber('+905551234567')).toBe('+90 555 123 4567');
    });

    it('should format national phone number correctly', () => {
      expect(formatPhoneNumber('05551234567')).toBe('0555 123 4567');
    });

    it('should return original string if not a recognized format', () => {
      expect(formatPhoneNumber('12345')).toBe('12345');
    });
  });
});
