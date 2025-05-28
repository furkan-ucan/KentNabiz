import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { Provider as ReduxProvider } from 'react-redux';
import { Provider } from '@/components/ui/provider';
import { router } from '@/routes';
import { store } from '@/store';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ReduxProvider store={store}>
      <Provider>
        <RouterProvider router={router} />
      </Provider>
    </ReduxProvider>
  </React.StrictMode>
);
