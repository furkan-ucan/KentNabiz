import { createBrowserRouter } from 'react-router-dom';
import HomePage from '@/pages/HomePage'; // @/ src alias'ı ile import

export const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
]);
