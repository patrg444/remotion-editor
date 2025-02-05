import React, { useState, useEffect } from 'react';
import { TimelineProvider } from './contexts/TimelineContext';
import { MediaBinProvider } from './contexts/MediaBinContext';
import { TimelineContainer } from './components/TimelineContainer';
import MediaBin from './components/MediaBin';
import { Inspector } from './components/Inspector';
import { PreviewDisplay } from './components/PreviewDisplay';

export const App: React.FC = () => {
  React.useEffect(() => {
    console.log('[DEBUG] App component mounted');
    console.log('[DEBUG] Environment:', {
      nodeEnv: process.env.NODE_ENV,
      isTest: process.env.IS_TEST
    });
    return () => console.log('[DEBUG] App component unmounted');
  }, []);

  console.log('[DEBUG] App component rendering');
  console.log('[DEBUG] App component rendering');
  return (
    <TimelineProvider>
      <MediaBinProvider>
        <div className="app-container" data-testid="app-root" id="app-root" style={{ height: '100%' }}>
          <div className="app-sidebar">
            <MediaBin className="media-bin" />
          </div>
          <div className="app-main">
            <div className="app-top">
              <div className="app-inspector">
                <Inspector />
              </div>
              <div className="app-preview">
                <PreviewDisplay />
              </div>
            </div>
            <div className="app-timeline">
              <TimelineContainer />
            </div>
          </div>
        </div>
      </MediaBinProvider>
    </TimelineProvider>
  );
};

export default App;
