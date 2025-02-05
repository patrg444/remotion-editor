import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { PreviewOverlay } from '../PreviewOverlay';
import { ProductionClip } from '../../types/timeline';
import { TimelineContext } from '../../contexts/TimelineContext';

const mockDispatch = jest.fn();

const mockClip: ProductionClip = {
  id: 'test-clip',
  type: 'video',
  startTime: 0,
  duration: 60,
  transform: {
    position: { x: 100, y: 100 },
    scale: { x: 1, y: 1 },
    rotation: 0
  }
};

const renderWithContext = (ui: React.ReactElement) => {
  return render(
    <TimelineContext.Provider value={{ state: {} as any, dispatch: mockDispatch }}>
      {ui}
    </TimelineContext.Provider>
  );
};

describe('PreviewOverlay', () => {
  beforeEach(() => {
    mockDispatch.mockClear();
  });

  it('renders nothing when no clip is selected', () => {
    const { container } = renderWithContext(
      <PreviewOverlay
        selectedClip={undefined}
        previewWidth={800}
        previewHeight={600}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders overlay with handles when clip is selected', () => {
    renderWithContext(
      <PreviewOverlay
        selectedClip={mockClip}
        previewWidth={800}
        previewHeight={600}
      />
    );

    expect(screen.getByRole('presentation')).toHaveClass('preview-overlay');
    expect(screen.getAllByRole('button')).toHaveLength(5); // 4 resize + 1 rotate handle
  });

  it('updates transform on drag', () => {
    renderWithContext(
      <PreviewOverlay
        selectedClip={mockClip}
        previewWidth={800}
        previewHeight={600}
      />
    );

    const overlay = screen.getByRole('presentation');
    
    // Start drag
    fireEvent.mouseDown(overlay, { clientX: 100, clientY: 100 });
    
    // Move
    fireEvent.mouseMove(window, { clientX: 150, clientY: 150 });
    
    // End drag
    fireEvent.mouseUp(window);

    expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({
      type: 'UPDATE_CLIP_TRANSFORM',
      payload: expect.objectContaining({
        clipId: 'test-clip',
        transform: expect.objectContaining({
          position: expect.objectContaining({
            x: 150,
            y: 150
          })
        })
      })
    }));
  });

  it('updates scale on resize handle drag', () => {
    renderWithContext(
      <PreviewOverlay
        selectedClip={mockClip}
        previewWidth={800}
        previewHeight={600}
      />
    );

    const handles = screen.getAllByRole('button');
    const bottomRightHandle = handles[3]; // Bottom-right resize handle
    
    // Start resize
    fireEvent.mouseDown(bottomRightHandle, { clientX: 100, clientY: 100 });
    
    // Move
    fireEvent.mouseMove(window, { clientX: 150, clientY: 150 });
    
    // End resize
    fireEvent.mouseUp(window);

    expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({
      type: 'UPDATE_CLIP_TRANSFORM',
      payload: expect.objectContaining({
        clipId: 'test-clip',
        transform: expect.objectContaining({
          scale: expect.objectContaining({
            x: expect.any(Number),
            y: expect.any(Number)
          })
        })
      })
    }));
  });

  it('updates rotation on rotate handle drag', () => {
    renderWithContext(
      <PreviewOverlay
        selectedClip={mockClip}
        previewWidth={800}
        previewHeight={600}
      />
    );

    const rotateHandle = screen.getAllByRole('button')[4]; // Rotation handle
    
    // Start rotation
    fireEvent.mouseDown(rotateHandle, { clientX: 100, clientY: 100 });
    
    // Move
    fireEvent.mouseMove(window, { clientX: 150, clientY: 150 });
    
    // End rotation
    fireEvent.mouseUp(window);

    expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({
      type: 'UPDATE_CLIP_TRANSFORM',
      payload: expect.objectContaining({
        clipId: 'test-clip',
        transform: expect.objectContaining({
          rotation: expect.any(Number)
        })
      })
    }));
  });
});
