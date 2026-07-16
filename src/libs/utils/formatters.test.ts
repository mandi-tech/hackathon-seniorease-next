import { describe, it, expect } from 'vitest';
import { getInitials, formatFontSize, formatPreferenceStatus } from './formatters';

describe('formatters utility functions', () => {
  describe('getInitials', () => {
    it('should return the first two letters of the name in uppercase', () => {
      expect(getInitials('Mariana Silva')).toBe('MA');
    });

    it('should fall back to email if name is not provided', () => {
      expect(getInitials(null, 'test@example.com')).toBe('TE');
    });

    it('should return U if both name and email are empty/undefined', () => {
      expect(getInitials()).toBe('U');
      expect(getInitials(null, null)).toBe('U');
    });

    it('should handle leading/trailing spaces correctly', () => {
      expect(getInitials('   John Doe   ')).toBe('JO');
    });
  });

  describe('formatFontSize', () => {
    it('should format grande as Grande', () => {
      expect(formatFontSize('grande')).toBe('Grande');
    });

    it('should format muito-grande as Muito Grande', () => {
      expect(formatFontSize('muito-grande')).toBe('Muito Grande');
    });

    it('should default to Padrão for other values', () => {
      expect(formatFontSize('padrao')).toBe('Padrão');
      expect(formatFontSize(null)).toBe('Padrão');
      expect(formatFontSize(undefined)).toBe('Padrão');
    });
  });

  describe('formatPreferenceStatus', () => {
    it('should return Ativado for true', () => {
      expect(formatPreferenceStatus(true)).toBe('Ativado');
    });

    it('should return Desativado for false/null/undefined', () => {
      expect(formatPreferenceStatus(false)).toBe('Desativado');
      expect(formatPreferenceStatus(null)).toBe('Desativado');
      expect(formatPreferenceStatus(undefined)).toBe('Desativado');
    });
  });
});
