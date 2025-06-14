// apps/web/src/hooks/useScrollDirection.ts
import { useState, useEffect } from 'react';

export type ScrollDirection = 'up' | 'down' | 'none';

interface UseScrollDirectionOptions {
  threshold?: number; // Minimum scroll mesafesi
  debounceMs?: number; // Debounce süresi (ms)
}

export const useScrollDirection = ({
  threshold = 10,
  debounceMs = 100,
}: UseScrollDirectionOptions = {}): ScrollDirection => {
  const [scrollDirection, setScrollDirection] =
    useState<ScrollDirection>('none');
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const updateScrollDirection = () => {
      const scrollY = window.scrollY;
      const difference = Math.abs(scrollY - lastScrollY);

      // Threshold kontrolü - minimum scroll mesafesi
      if (difference < threshold) {
        return;
      }

      if (scrollY > lastScrollY) {
        setScrollDirection('down');
      } else if (scrollY < lastScrollY) {
        setScrollDirection('up');
      }

      setLastScrollY(scrollY);
    };

    const handleScroll = () => {
      // Debounce işlemi
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateScrollDirection, debounceMs);
    };

    // İlk yükleme
    setLastScrollY(window.scrollY);

    // Event listener ekle
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Cleanup
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timeoutId);
    };
  }, [lastScrollY, threshold, debounceMs]);

  return scrollDirection;
};
