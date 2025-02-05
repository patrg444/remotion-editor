/// <reference types="cypress" />

describe('Timeline Basic Tests', () => {
  beforeEach(() => {
    // Set up test data and wait for initialization
    cy.setupTestData();
    
    // Wait for timeline initialization
    cy.window().then(win => {
      return new Cypress.Promise((resolve) => {
        const handleInit = (e: CustomEvent) => {
          win.removeEventListener('timeline:initialized', handleInit as EventListener);
          resolve(e.detail);
        };
        
        win.addEventListener('timeline:initialized', handleInit as EventListener);
        
        // Also resolve if state is already initialized
        if ((win as any).timelineReady) {
          resolve({
            state: (win as any).timelineState,
            isValid: true,
            errors: []
          });
        }
      });
    }).then((detail: any) => {
      // Verify initialization was successful
      expect(detail.isValid).to.be.true;
      expect(detail.errors).to.have.length(0);
      expect(detail.state).to.exist;
    });

    // Wait for timeline to be ready
    cy.waitForTimeline();
  });

  afterEach(() => {
    // Clean up any test-created clips
    cy.window().then((win) => {
      const state = (win as any).timelineState;
      if (state && state.tracks) {
        state.tracks.forEach((track: any) => {
          if (track.clips) {
            track.clips.forEach((clip: any) => {
              if (clip.path && clip.path.startsWith('blob:')) {
                try {
                  win.URL.revokeObjectURL(clip.path);
                } catch (e) {
                  // Ignore errors from invalid URLs
                }
              }
            });
          }
        });
      }
    });
  });

  it('should handle track operations', () => {
    // Add video track
    cy.addTrack('Video Track', 'video');
    cy.get('.timeline-track').should('have.length', 1);

    // Add audio track
    cy.addTrack('Audio Track', 'audio');
    cy.get('.timeline-track').should('have.length', 2);

    // Verify track types
    cy.get('.timeline-track').eq(0).should('have.class', 'video');
    cy.get('.timeline-track').eq(1).should('have.class', 'audio');
  });

  it('should handle clip dragging', () => {
    // Add track and clip
    cy.addTrack('Video Track', 'video');
    cy.dragMediaToTimeline(0, 0, 0); // Add at start

    // Get initial position
    let initialStartTime: number;
    cy.window().then(win => {
      const state = (win as any).timelineState;
      const clip = state.tracks[0].clips[0];
      initialStartTime = clip.startTime;

      // Verify initial clip properties
      expect(clip.type).to.equal('video');
      expect(clip.path).to.include('mock://test.mp4');
      expect(clip.duration).to.be.closeTo(10, 0.1);
      expect(clip.mediaOffset).to.equal(0);
      expect(clip.mediaDuration).to.equal(10);
    });

    // Drag clip right
    cy.dragClip(0, 0, 100);

    // Verify new position and properties
    cy.window().then(win => {
      const state = (win as any).timelineState;
      const clip = state.tracks[0].clips[0];
      
      expect(clip.startTime).to.be.gt(initialStartTime);
      expect(clip.endTime - clip.startTime).to.be.closeTo(10, 0.1); // Duration unchanged
      expect(clip.mediaOffset).to.equal(0); // Media offset unchanged
      expect(clip.mediaDuration).to.equal(10); // Media duration unchanged
    });

    // Drag clip left
    cy.dragClip(0, 0, -50);

    // Verify new position and properties
    cy.window().then(win => {
      const state = (win as any).timelineState;
      const clip = state.tracks[0].clips[0];
      
      expect(clip.startTime).to.be.lt(initialStartTime + 1); // Account for rounding
      expect(clip.endTime - clip.startTime).to.be.closeTo(10, 0.1); // Duration unchanged
      expect(clip.mediaOffset).to.equal(0); // Media offset unchanged
      expect(clip.mediaDuration).to.equal(10); // Media duration unchanged
    });
  });

  it('should handle clip trimming', () => {
    // Add track and clip
    cy.addTrack('Video Track', 'video');
    cy.dragMediaToTimeline(0, 0, 0);

    // Get initial state
    let initialDuration: number;
    let initialMediaOffset: number;
    cy.window().then(win => {
      const state = (win as any).timelineState;
      const clip = state.tracks[0].clips[0];
      initialDuration = clip.endTime - clip.startTime;
      initialMediaOffset = clip.mediaOffset;

      // Verify initial clip properties
      expect(clip.type).to.equal('video');
      expect(clip.path).to.include('mock://test.mp4');
      expect(clip.mediaDuration).to.equal(10);
    });

    // Trim start
    cy.trimClip(0, 0, 'start', 50);

    // Verify trimmed start and properties
    cy.window().then(win => {
      const state = (win as any).timelineState;
      const clip = state.tracks[0].clips[0];
      
      expect(clip.endTime - clip.startTime).to.be.lt(initialDuration);
      expect(clip.mediaOffset).to.be.gt(initialMediaOffset);
      expect(clip.mediaDuration).to.equal(10); // Original duration unchanged
    });

    // Trim end
    cy.trimClip(0, 0, 'end', -50);

    // Verify trimmed end and properties
    cy.window().then(win => {
      const state = (win as any).timelineState;
      const clip = state.tracks[0].clips[0];
      
      expect(clip.endTime - clip.startTime).to.be.lt(initialDuration);
      expect(clip.mediaDuration).to.equal(10); // Original duration unchanged
    });
  });

  it('should handle clip selection', () => {
    // Add track and clips
    cy.addTrack('Video Track', 'video');
    cy.dragMediaToTimeline(0, 0, 0);
    cy.dragMediaToTimeline(0, 0, 200);

    // Select first clip
    cy.selectClip(0, 0);
    cy.window().then(win => {
      const state = (win as any).timelineState;
      expect(state.selectedClipId).to.equal(state.tracks[0].clips[0].id);
      expect(state.tracks[0].clips[0].path).to.include('test.mp4');
    });

    // Select second clip
    cy.selectClip(0, 1);
    cy.window().then(win => {
      const state = (win as any).timelineState;
      expect(state.selectedClipId).to.equal(state.tracks[0].clips[1].id);
      expect(state.tracks[0].clips[1].path).to.include('test.mp4');
    });
  });

  it('should maintain clip constraints', () => {
    // Add track and clip
    cy.addTrack('Video Track', 'video');
    cy.dragMediaToTimeline(0, 0, 0);

    // Try to drag before 0
    cy.dragClip(0, 0, -1000);

    // Verify clip stays at or after 0 and maintains properties
    cy.window().then(win => {
      const state = (win as any).timelineState;
      const clip = state.tracks[0].clips[0];
      
      expect(clip.startTime).to.be.gte(0);
      expect(clip.mediaOffset).to.be.gte(0);
      expect(clip.endTime - clip.startTime).to.be.closeTo(10, 0.1);
      expect(clip.mediaDuration).to.equal(10);
    });

    // Try to trim beyond media duration
    cy.trimClip(0, 0, 'end', 1000);

    // Verify clip duration doesn't exceed media duration
    cy.window().then(win => {
      const state = (win as any).timelineState;
      const clip = state.tracks[0].clips[0];
      
      expect(clip.endTime - clip.startTime).to.be.lte(clip.mediaDuration);
      expect(clip.mediaOffset).to.be.gte(0);
      expect(clip.mediaDuration).to.equal(10);
    });
  });
});
