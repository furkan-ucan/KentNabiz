// apps/web/src/contexts/SnackbarContext.ts
import { createContext } from 'react';
import { AlertColor } from '@mui/material';

export interface SnackbarContextType {
  showSnackbar: (message: string, severity?: AlertColor) => void;
}

export const SnackbarContext = createContext<SnackbarContextType | undefined>(
  undefined
);
