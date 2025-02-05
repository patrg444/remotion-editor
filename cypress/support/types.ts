/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable<Subject = any> {
    /**
     * Wait for timeline to be ready
     */
    waitForTimeline(): Chainable<void>;

    /**
     * Wait for media bin to be ready
     */
    waitForMediaBin(): Chainable<void>;

    /**
     * Wait for preview to be ready
     */
    waitForPreview(): Chainable<void>;

    /**
     * Add track to timeline
     * @param name Track name
     * @param type Track type
     */
    addTrack(name: string, type: string): Chainable<void>;

    /**
     * Add clip to track
     * @param trackIndex Track index
     * @param mediaItem Media item
     */
    addClip(trackIndex: number, mediaItem: any): Chainable<void>;

    /**
     * Add media items to media bin
     * @param items Media items
     */
    addMediaItems(items: any[]): Chainable<void>;

    /**
     * Drag clip to new position
     * @param clipIndex Clip index
     * @param x X coordinate
     * @param y Y coordinate
     */
    dragClip(clipIndex: number, x: number, y: number): Chainable<void>;

    /**
     * Trim clip
     * @param clipIndex Clip index
     * @param edge Edge to trim ('start' or 'end')
     * @param x X coordinate
     */
    trimClip(clipIndex: number, edge: 'start' | 'end', x: number): Chainable<void>;

    /**
     * Select clip
     * @param clipIndex Clip index
     */
    selectClip(clipIndex: number): Chainable<void>;

    /**
     * Play/pause preview
     */
    togglePlayback(): Chainable<void>;

    /**
     * Seek to specific time
     * @param time Time in seconds
     */
    seekTo(time: number): Chainable<void>;

    /**
     * Get current playback time
     */
    getCurrentTime(): Chainable<number>;

    /**
     * Set up test data
     */
    setupTestData(): Chainable<void>;
  }
}
