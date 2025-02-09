import React from 'react';
import { TimelineProvider } from './contexts/TimelineContext';
import { MediaBinProvider } from './contexts/MediaBinContext';
import { TimelineContainer } from './components/TimelineContainer';
import MediaBin from './components/MediaBin';
import { Inspector } from './components/Inspector';
import { PreviewDisplay } from './components/PreviewDisplay';

export const App: React.FC = () => {
  return (
    <TimelineProvider>
      <MediaBinProvider>
        <div className="app-container app-root" data-testid="app-root">
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
