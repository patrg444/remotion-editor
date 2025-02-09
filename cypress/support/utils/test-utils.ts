import { TimelineState } from '../../../src/renderer/types/timeline';

export const validateTimelineState = (state: TimelineState) => {
  // Validate basic state structure
  expect(state).to.exist;
  expect(state.tracks).to.exist;
  expect(Array.isArray(state.tracks)).to.be.true;
  expect(state.selectedClipIds).to.exist;
  expect(Array.isArray(state.selectedClipIds)).to.be.true;
  expect(state.history).to.exist;
  expect(state.history.entries).to.exist;
  expect(Array.isArray(state.history.entries)).to.be.true;
  expect(typeof state.history.currentIndex).to.equal('number');

  // Validate tracks
  state.tracks.forEach(track => {
    expect(track).to.exist;
    expect(track.id).to.exist;
    expect(track.clips).to.exist;
    expect(Array.isArray(track.clips)).to.be.true;

    // Validate clips
    track.clips.forEach(clip => {
      expect(clip).to.exist;
      expect(clip.id).to.exist;
      expect(typeof clip.startTime).to.equal('number');
      expect(typeof clip.endTime).to.equal('number');
      expect(clip.endTime).to.be.greaterThan(clip.startTime);
    });
  });

  // Validate history entries
  state.history.entries.forEach(entry => {
    expect(entry).to.exist;
    expect(entry.type).to.equal('partial');
    expect(entry.timestamp).to.exist;
    expect(typeof entry.timestamp).to.equal('number');
    expect(entry.patches).to.exist;
    expect(Array.isArray(entry.patches)).to.be.true;
    expect(entry.inversePatches).to.exist;
    expect(Array.isArray(entry.inversePatches)).to.be.true;
    expect(entry.description).to.exist;
    expect(typeof entry.description).to.equal('string');
  });

  return true;
};

export const validateTimelineDispatch = (dispatch: any) => {
  expect(dispatch).to.exist;
  expect(typeof dispatch).to.equal('function');
  return true;
};

export const waitForOperation = (
  predicate: (state: TimelineState) => boolean,
  timeout: number = 30000
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const checkState = () => {
      cy.window().then(win => {
        const state = (win as any).timelineState;
        if (predicate(state)) {
          resolve();
        } else if (Date.now() - startTime > timeout) {
          reject(new Error('Operation timeout'));
        } else {
          requestAnimationFrame(checkState);
        }
      });
    };
    checkState();
  });
};

export const waitForStateUpdate = (
  initialState: TimelineState,
  timeout: number = 30000
): Promise<TimelineState> => {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const checkState = () => {
      cy.window().then(win => {
        const currentState = (win as any).timelineState;
        if (currentState !== initialState) {
          resolve(currentState);
        } else if (Date.now() - startTime > timeout) {
          reject(new Error('State update timeout'));
        } else {
          requestAnimationFrame(checkState);
        }
      });
    };
    checkState();
  });
};

export const waitForDOMUpdate = (
  selector: string,
  predicate: (elements: JQuery<HTMLElement>) => boolean,
  timeout: number = 30000
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const checkDOM = () => {
      const elements = Cypress.$(selector);
      if (predicate(elements)) {
        resolve();
      } else if (Date.now() - startTime > timeout) {
        reject(new Error('DOM update timeout'));
      } else {
        requestAnimationFrame(checkDOM);
      }
    };
    checkDOM();
  });
};

export const waitForRender = (
  selector: string,
  timeout: number = 30000
): Promise<void> => {
  return waitForDOMUpdate(
    selector,
    elements => elements.length > 0 && elements.is(':visible'),
    timeout
  );
};

export const waitForClipRender = (
  clipId: string,
  timeout: number = 30000
): Promise<void> => {
  return waitForDOMUpdate(
    `[data-clip-id="${clipId}"]`,
    elements => {
      if (elements.length === 0) return false;
      const style = window.getComputedStyle(elements[0]);
      return style.left !== 'auto' && style.top !== 'auto';
    },
    timeout
  );
};

export const waitForAllClipsRender = (
  clipIds: string[],
  timeout: number = 30000
): Promise<void> => {
  return Promise.all(
    clipIds.map(id => waitForClipRender(id, timeout))
  ).then(() => undefined);
};

export const waitForHistoryUpdate = (
  expectedIndex: number,
  timeout: number = 30000
): Promise<void> => {
  return waitForOperation(
    state => state.history.currentIndex === expectedIndex,
    timeout
  );
};

export const waitForSelectionUpdate = (
  expectedClipIds: string[],
  timeout: number = 30000
): Promise<void> => {
  return waitForOperation(
    state => {
      const currentIds = state.selectedClipIds;
      return (
        currentIds.length === expectedClipIds.length &&
        currentIds.every(id => expectedClipIds.includes(id))
      );
    },
    timeout
  );
};

export const waitForTrackUpdate = (
  trackId: string,
  predicate: (track: any) => boolean,
  timeout: number = 30000
): Promise<void> => {
  return waitForOperation(
    state => {
      const track = state.tracks.find(t => t.id === trackId);
      return track ? predicate(track) : false;
    },
    timeout
  );
};

export const waitForClipUpdate = (
  trackId: string,
  clipId: string,
  predicate: (clip: any) => boolean,
  timeout: number = 30000
): Promise<void> => {
  return waitForOperation(
    state => {
      const track = state.tracks.find(t => t.id === trackId);
      if (!track) return false;
      const clip = track.clips.find(c => c.id === clipId);
      return clip ? predicate(clip) : false;
    },
    timeout
  );
};
