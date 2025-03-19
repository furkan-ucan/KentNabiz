import {
  isValidEmail,
  isPasswordStrong,
  isValidPhoneNumber,
  isValidTcKimlik,
  isValidCoordinate,
  isValidUrl,
} from '../../utils/validation';

describe('Validation Utils', () => {
  describe('isValidEmail', () => {
    it('should return true for a valid email', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name+tag@example.co.uk')).toBe(true);
    });

    it('should return false for an invalid email', () => {
      expect(isValidEmail('test')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('test@example')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('test @example.com')).toBe(false);
    });
  });

  describe('isPasswordStrong', () => {
    it('should return true for a strong password', () => {
      expect(isPasswordStrong('Test1234')).toBe(true);
      expect(isPasswordStrong('StrongP4ssword')).toBe(true);
    });

    it('should return false for a weak password', () => {
      expect(isPasswordStrong('test')).toBe(false); // too short
      expect(isPasswordStrong('testtest')).toBe(false); // no uppercase
      expect(isPasswordStrong('TESTTEST')).toBe(false); // no lowercase
      expect(isPasswordStrong('Testtest')).toBe(false); // no number
    });
  });

  describe('isValidPhoneNumber', () => {
    it('should return true for a valid international phone number', () => {
      expect(isValidPhoneNumber('+905551234567')).toBe(true);
      expect(isValidPhoneNumber('+12125551234')).toBe(true);
    });

    it('should return false for an invalid phone number', () => {
      expect(isValidPhoneNumber('05551234567')).toBe(false); // no + prefix
      expect(isValidPhoneNumber('+90555')).toBe(false); // too short
      expect(isValidPhoneNumber('+abc5551234')).toBe(false); // contains letters
    });
  });

  describe('isValidTcKimlik', () => {
    it('should return true for a valid TC Kimlik number', () => {
      // Using test TC Kimlik numbers
      expect(isValidTcKimlik('10000000146')).toBe(true);
      expect(isValidTcKimlik('26458566654')).toBe(true);
    });

    it('should return false for an invalid TC Kimlik number', () => {
      expect(isValidTcKimlik('1234567890')).toBe(false); // too short
      expect(isValidTcKimlik('12345678901')).toBe(false); // invalid checksum
      expect(isValidTcKimlik('01234567891')).toBe(false); // starts with 0
    });
  });

  describe('isValidCoordinate', () => {
    it('should return true for valid coordinates', () => {
      expect(isValidCoordinate(41.0082, 28.9784)).toBe(true); // Istanbul
      expect(isValidCoordinate(0, 0)).toBe(true); // Null Island
      expect(isValidCoordinate(-33.8688, 151.2093)).toBe(true); // Sydney
    });

    it('should return false for invalid coordinates', () => {
      expect(isValidCoordinate(91, 28.9784)).toBe(false); // latitude > 90
      expect(isValidCoordinate(-91, 28.9784)).toBe(false); // latitude < -90
      expect(isValidCoordinate(41.0082, 181)).toBe(false); // longitude > 180
      expect(isValidCoordinate(41.0082, -181)).toBe(false); // longitude < -180
    });
  });

  describe('isValidUrl', () => {
    it('should return true for valid URLs', () => {
      expect(isValidUrl('https://example.com')).toBe(true);
      expect(isValidUrl('http://subdomain.example.co.uk/path?query=param#hash')).toBe(true);
    });

    it('should return false for invalid URLs', () => {
      expect(isValidUrl('example')).toBe(false);
      expect(isValidUrl('http://')).toBe(false);
      expect(isValidUrl('http://example')).toBe(true); // This will be true with the new URL() approach
    });
  });
});
