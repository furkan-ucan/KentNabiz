/**
 * ColorModeScript - Production-ready script to prevent FOUC
 * This script must be included in the <head> of your HTML document
 * before any other content to prevent Flash of Unstyled Content
 */

export const colorModeScript = `
(function() {
  'use strict';
  
  try {
    // Configuration
    const STORAGE_KEY = 'theme';
    const THEME_ATTRIBUTE = 'class';
    const DARK_CLASS = 'dark';
    const DATA_THEME_ATTR = 'data-theme';
    
    // Get stored theme preference
    let theme = localStorage.getItem(STORAGE_KEY);
    
    // Fallback to system preference if no stored theme or theme is 'system'
    if (!theme || theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      theme = mediaQuery.matches ? 'dark' : 'light';
    }
    
    // Apply theme immediately
    const root = document.documentElement;
    
    if (theme === 'dark') {
      root.classList.add(DARK_CLASS);
      root.setAttribute(DATA_THEME_ATTR, 'dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove(DARK_CLASS);
      root.setAttribute(DATA_THEME_ATTR, 'light');
      root.style.colorScheme = 'light';
    }
    
    // Add a class to prevent transitions during initial load
    root.classList.add('theme-loading');
    
    // Remove the loading class after a short delay
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        root.classList.remove('theme-loading');
      });
    });
    
  } catch (error) {
    // Fallback: Apply system preference
    console.warn('ColorModeScript error:', error);
    
    try {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const root = document.documentElement;
      
      if (isDark) {
        root.classList.add('dark');
        root.setAttribute('data-theme', 'dark');
        root.style.colorScheme = 'dark';
      } else {
        root.classList.remove('dark');
        root.setAttribute('data-theme', 'light');
        root.style.colorScheme = 'light';
      }
    } catch (fallbackError) {
      console.error('ColorModeScript fallback failed:', fallbackError);
    }
  }
})();
`;

export function getColorModeScript() {
  return colorModeScript;
}
