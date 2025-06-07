// apps/web/src/contexts/LoadingContext.ts
import { createContext } from 'react';

export interface LoadingContextType {
  showLoading: (message?: string) => void;
  hideLoading: () => void;
  isLoading: boolean;
}

export const LoadingContext = createContext<LoadingContextType | undefined>(
  undefined
);
