import { test, expect } from '@playwright/test';

test.describe('Timeline Integration Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
  });

  test('drag and drop clip between tracks', async ({ page }) => {
    // Create test tracks and clips
    await page.click('[data-testid="add-track-button"]');
    await page.click('[data-testid="add-track-button"]');
    await page.click('[data-testid="add-clip-button"]');

    // Get initial clip position
    const clip = page.locator('.timeline-clip').first();
    const initialBounds = await clip.boundingBox();
    expect(initialBounds).toBeTruthy();

    // Drag clip to second track
    await clip.dragTo(page.locator('.timeline-track').nth(1), {
      sourcePosition: { x: 10, y: 10 },
      targetPosition: { x: initialBounds!.x + 50, y: 25 }
    });

    // Verify clip moved to new track
    const finalBounds = await clip.boundingBox();
    expect(finalBounds!.y).toBeGreaterThan(initialBounds!.y);
    expect(finalBounds!.x).toBeGreaterThan(initialBounds!.x);
  });

  test('keyboard navigation and clip movement', async ({ page }) => {
    // Setup timeline with clips
    await page.click('[data-testid="add-track-button"]');
    await page.click('[data-testid="add-clip-button"]');

    // Focus first clip
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Enter keyboard drag mode
    await page.keyboard.press('m');
    
    // Move clip with arrow keys
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');

    // Get clip position
    const clip = page.locator('.timeline-clip').first();
    const position = await clip.boundingBox();

    // Verify clip moved right
    expect(position!.x).toBeGreaterThan(0);

    // Exit keyboard drag mode
    await page.keyboard.press('Escape');
  });

  test('zoom and scroll timeline', async ({ page }) => {
    // Add content to timeline
    await page.click('[data-testid="add-track-button"]');
    await page.click('[data-testid="add-clip-button"]');

    // Initial content width
    const initialWidth = await page.locator('.timeline-content').evaluate(el => el.scrollWidth);

    // Zoom in
    await page.keyboard.down('Control');
    await page.keyboard.press('+');
    await page.keyboard.up('Control');

    // Get zoomed width
    const zoomedWidth = await page.locator('.timeline-content').evaluate(el => el.scrollWidth);
    expect(zoomedWidth).toBeGreaterThan(initialWidth);

    // Scroll timeline
    await page.keyboard.press('ArrowRight');
    const scrollLeft = await page.locator('.timeline').evaluate(el => el.scrollLeft);
    expect(scrollLeft).toBeGreaterThan(0);
  });

  test('clip trimming and splitting', async ({ page }) => {
    // Add clip to timeline
    await page.click('[data-testid="add-track-button"]');
    await page.click('[data-testid="add-clip-button"]');

    // Get initial clip width
    const clip = page.locator('.timeline-clip').first();
    const initialWidth = await clip.evaluate(el => el.clientWidth);

    // Trim clip from right edge
    const bounds = await clip.boundingBox();
    await page.mouse.move(bounds!.x + bounds!.width - 5, bounds!.y + bounds!.height / 2);
    await page.mouse.down();
    await page.mouse.move(bounds!.x + bounds!.width - 50, bounds!.y + bounds!.height / 2);
    await page.mouse.up();

    // Verify clip was trimmed
    const trimmedWidth = await clip.evaluate(el => el.clientWidth);
    expect(trimmedWidth).toBeLessThan(initialWidth);

    // Split clip
    await clip.click({ position: { x: bounds!.width / 2, y: bounds!.height / 2 } });
    await page.keyboard.press('s');

    // Verify clip was split
    const clips = page.locator('.timeline-clip');
    expect(await clips.count()).toBe(2);
  });

  test('undo/redo operations', async ({ page }) => {
    // Add track and clip
    await page.click('[data-testid="add-track-button"]');
    await page.click('[data-testid="add-clip-button"]');

    // Move clip
    const clip = page.locator('.timeline-clip').first();
    const initialBounds = await clip.boundingBox();
    await clip.dragTo(page.locator('.timeline-track').first(), {
      sourcePosition: { x: 10, y: 10 },
      targetPosition: { x: initialBounds!.x + 100, y: initialBounds!.y }
    });

    // Verify clip moved
    const movedBounds = await clip.boundingBox();
    expect(movedBounds!.x).toBeGreaterThan(initialBounds!.x);

    // Undo move
    await page.keyboard.press('Control+z');
    const undoBounds = await clip.boundingBox();
    expect(undoBounds!.x).toBeCloseTo(initialBounds!.x, 1);

    // Redo move
    await page.keyboard.press('Control+Shift+z');
    const redoBounds = await clip.boundingBox();
    expect(redoBounds!.x).toBeCloseTo(movedBounds!.x, 1);
  });

  test('snap points and grid alignment', async ({ page }) => {
    // Add two clips
    await page.click('[data-testid="add-track-button"]');
    await page.click('[data-testid="add-clip-button"]');
    await page.click('[data-testid="add-clip-button"]');

    // Move second clip near first clip
    const clips = page.locator('.timeline-clip');
    const firstClip = clips.first();
    const secondClip = clips.nth(1);

    const firstBounds = await firstClip.boundingBox();
    await secondClip.dragTo(page.locator('.timeline-track').first(), {
      sourcePosition: { x: 10, y: 10 },
      targetPosition: { x: firstBounds!.x + firstBounds!.width - 5, y: firstBounds!.y }
    });

    // Verify clips snapped together
    const secondBounds = await secondClip.boundingBox();
    expect(secondBounds!.x).toBeCloseTo(firstBounds!.x + firstBounds!.width, 1);
  });
});
