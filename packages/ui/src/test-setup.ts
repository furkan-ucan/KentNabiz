// packages/ui/src/test-setup.ts
import '@testing-library/jest-dom';

// Jest ortamı için global ayarlar
global.ResizeObserver = class ResizeObserver {
  observe() {
    // Boş implementasyon
  }
  unobserve() {
    // Boş implementasyon
  }
  disconnect() {
    // Boş implementasyon
  }
};

// Jest konsol hatalarını temizlemek için
beforeAll(() => {
  // React 18 konsol uyarılarını bastır
  const originalError = console.error;
  console.error = (...args) => {
    if (typeof args[0] === 'string' && args[0].includes('ReactDOM.render is no longer supported')) {
      return;
    }
    originalError(...args);
  };
});
