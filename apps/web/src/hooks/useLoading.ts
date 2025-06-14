// apps/web/src/hooks/useLoading.ts
import { useContext } from 'react';
import { LoadingContext } from '../contexts/LoadingContext';

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};
