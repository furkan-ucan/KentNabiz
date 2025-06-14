// apps/web/src/components/common/PageLoader.tsx
import React from 'react';

// Loading component for lazy loaded pages
export const PageLoader: React.FC = () => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '50vh',
      fontFamily: 'Roboto, sans-serif',
    }}
  >
    <div
      className="loading-skeleton"
      style={{
        width: '200px',
        height: '20px',
        borderRadius: '4px',
      }}
    ></div>
  </div>
);

export default PageLoader;
