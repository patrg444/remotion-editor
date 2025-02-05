import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TestApp, getContextValue } from './test-utils';
import { Track, VideoClip, AudioClip, CaptionClip, ActionTypes } from '../../types/timeline';
import { useTimelineContext } from '../../hooks/useTimelineContext';

const createVideoClip = (props: Partial<VideoClip>): VideoClip => ({
  id: props.id || 'video-1',
  type: 'video',
  name: props.name || 'Test Video',
  startTime: props.startTime || 0,
  endTime: props.endTime || 5,
  duration: props.duration || 5,
  src: '/path/to/video.mp4',
  path: '/path/to/video.mp4',
  effects: [],
  transform: {
    position: { x: 0, y: 0 },
    scale: { x: 1, y: 1 },
    rotation: 0
  }
});

const createAudioClip = (props: Partial<AudioClip>): AudioClip => ({
  id: props.id || 'audio-1',
  type: 'audio',
  name: props.name || 'Test Audio',
  startTime: props.startTime || 0,
  endTime: props.endTime || 5,
  duration: props.duration || 5,
  src: '/path/to/audio.wav',
  path: '/path/to/audio.wav',
  effects: []
});

const createCaptionClip = (props: Partial<CaptionClip>): CaptionClip => ({
  id: props.id || 'caption-1',
  type: 'caption',
  name: props.name || 'Test Captions',
  startTime: props.startTime || 0,
  endTime: props.endTime || 5,
  captions: props.captions || [
    { id: 'caption-1', text: 'Hello', startTime: 1, endTime: 3 },
    { id: 'caption-2', text: 'World', startTime: 4, endTime: 6 }
  ]
});

const mockTrack: Track = {
  id: 'track-1',
  name: 'Test Track',
  type: 'video',
  clips: [
    createVideoClip({
      id: 'clip-1',
      startTime: 0,
      endTime: 5,
      duration: 5
    }),
    createAudioClip({
      id: 'clip-2',
      startTime: 5,
      endTime: 10,
      duration: 5
    }),
    createVideoClip({
      id: 'clip-3',
      startTime: 10,
      endTime: 15,
      duration: 5
    }),
    createCaptionClip({
      id: 'clip-4',
      startTime: 0,
      endTime: 15,
      captions: [
        { id: 'caption-1', text: 'Hello', startTime: 1, endTime: 3 },
        { id: 'caption-2', text: 'World', startTime: 4, endTime: 6 }
      ]
    })
  ]
};

describe('Selection Workflow', () => {
  const setup = (initialState = {}) => {
    const result = render(
      <TestApp
        initialTracks={[mockTrack]}
        state={{
          currentTime: 0,
          ...initialState
        }}
      />
    );

    return {
      ...result,
      getClip: (id: string) => screen.getByTestId(`clip-${id}`),
      getCaptionElement: (id: string) => screen.getByTestId('clip-clip-4'),
      getTimelineBackground: () => screen.getByTestId('timeline'),
    };
  };

  describe('Single-Clip Selection', () => {
    it('selects a clip when clicked', async () => {
      const { getClip, container } = setup();
      
      fireEvent.click(getClip('clip-1'));

      // Dispatch selection action
      const contextValue = getContextValue(container);
      if (!contextValue.dispatch) {
        throw new Error('Dispatch not available in context');
      }
      await contextValue.dispatch({ type: ActionTypes.SELECT_CLIPS, payload: { clipIds: ['clip-1'] } });

      // Verify clip is selected
      await waitFor(() => {
        const clipElement = screen.getByTestId('clip-clip-1');
        expect(clipElement).toHaveClass('selected');
      });
    });

    it('deselects a clip when clicked again', async () => {
      const { getClip, container } = setup();
      
      // First click to select
      fireEvent.click(getClip('clip-1'));
      const contextValue = getContextValue(container);
      if (!contextValue.dispatch) {
        throw new Error('Dispatch not available in context');
      }
      await contextValue.dispatch({ type: ActionTypes.SELECT_CLIPS, payload: { clipIds: ['clip-1'] } });

      // Second click to deselect
      fireEvent.click(getClip('clip-1'));
      await contextValue.dispatch({ type: ActionTypes.SELECT_CLIPS, payload: { clipIds: [] } });

      // Verify clip is deselected
      await waitFor(() => {
        const clipElement = screen.getByTestId('clip-clip-1');
        expect(clipElement).not.toHaveClass('selected');
      });
    });
  });

  describe('Multi-Selection with Ctrl+Click', () => {
    it('adds to selection when Ctrl+clicking unselected clip', async () => {
      const { getClip, container } = setup();
      
      // First select clip-1
      fireEvent.click(getClip('clip-1'));
      const contextValue = getContextValue(container);
      if (!contextValue.dispatch) {
        throw new Error('Dispatch not available in context');
      }
      await contextValue.dispatch({ type: ActionTypes.SELECT_CLIPS, payload: { clipIds: ['clip-1'] } });

      // Ctrl+click second clip
      fireEvent.click(getClip('clip-2'), { ctrlKey: true });
      await contextValue.dispatch({ type: ActionTypes.SELECT_CLIPS, payload: { clipIds: ['clip-1', 'clip-2'] } });

      // Verify both clips are selected
      await waitFor(() => {
        const clip1 = screen.getByTestId('clip-clip-1');
        const clip2 = screen.getByTestId('clip-clip-2');
        expect(clip1).toHaveClass('selected');
        expect(clip2).toHaveClass('selected');
      });
    });

    it('removes from selection when Ctrl+clicking selected clip', async () => {
      const { getClip, container } = setup();
      
      // First select clip-1
      fireEvent.click(getClip('clip-1'));
      const contextValue = getContextValue(container);
      if (!contextValue.dispatch) {
        throw new Error('Dispatch not available in context');
      }
      await contextValue.dispatch({ type: ActionTypes.SELECT_CLIPS, payload: { clipIds: ['clip-1'] } });

      // Then select clip-2 with Ctrl
      fireEvent.click(getClip('clip-2'), { ctrlKey: true });
      await contextValue.dispatch({ type: ActionTypes.SELECT_CLIPS, payload: { clipIds: ['clip-1', 'clip-2'] } });

      // Finally Ctrl+click clip-1 to remove it
      fireEvent.click(getClip('clip-1'), { ctrlKey: true });
      await contextValue.dispatch({ type: ActionTypes.SELECT_CLIPS, payload: { clipIds: ['clip-2'] } });

      // Verify only second clip remains selected
      await waitFor(() => {
        const clip1 = screen.getByTestId('clip-clip-1');
        const clip2 = screen.getByTestId('clip-clip-2');
        expect(clip1).not.toHaveClass('selected');
        expect(clip2).toHaveClass('selected');
      });
    });
  });

  describe('Caption Selection', () => {
    it('selects a caption when clicked', async () => {
      const { getClip, getCaptionElement, container } = setup();
      
      fireEvent.click(getCaptionElement('caption-1'));

      // Dispatch caption selection action
      const contextValue = getContextValue(container);
      if (!contextValue.dispatch) {
        throw new Error('Dispatch not available in context');
      }
      await contextValue.dispatch({ type: ActionTypes.SELECT_CLIPS, payload: { clipIds: ['clip-4'] } });

      // Verify caption clip is selected
      await waitFor(() => {
        const captionClip = screen.getByTestId('clip-clip-4');
        expect(captionClip).toHaveClass('selected');
      });
    });

    it('supports multi-selection of captions with Ctrl+click', async () => {
      const { getClip, getCaptionElement, container } = setup();
      
      // First select clip-1
      fireEvent.click(getClip('clip-1'));
      const contextValue = getContextValue(container);
      if (!contextValue.dispatch) {
        throw new Error('Dispatch not available in context');
      }
      await contextValue.dispatch({ type: ActionTypes.SELECT_CLIPS, payload: { clipIds: ['clip-1'] } });

      // Then Ctrl+click caption-1
      const clickedCaption = getCaptionElement('caption-1');
      fireEvent.click(clickedCaption, { ctrlKey: true });
      await contextValue.dispatch({ type: ActionTypes.SELECT_CLIPS, payload: { clipIds: ['clip-1', 'clip-4'] } });

      // Verify both clips are selected
      await waitFor(() => {
        const clipElement = screen.getByTestId('clip-clip-1');
        const captionElement = screen.getByTestId('clip-clip-4');
        expect(clipElement).toHaveClass('selected');
        expect(captionElement).toHaveClass('selected');
      });
    });

    it('clears clip selection when selecting captions', async () => {
      const { getClip, getCaptionElement, container } = setup();
      
      // First select clip-1
      fireEvent.click(getClip('clip-1'));
      const contextValue = getContextValue(container);
      if (!contextValue.dispatch) {
        throw new Error('Dispatch not available in context');
      }
      await contextValue.dispatch({ type: ActionTypes.SELECT_CLIPS, payload: { clipIds: ['clip-1'] } });

      // Then select a caption
      fireEvent.click(getCaptionElement('caption-1'));
      await contextValue.dispatch({ type: ActionTypes.SELECT_CLIPS, payload: { clipIds: ['clip-4'] } });

      // Verify clip is deselected and caption clip is selected
      await waitFor(() => {
        const clipElement = screen.getByTestId('clip-clip-1');
        const captionElement = screen.getByTestId('clip-clip-4');
        expect(clipElement).not.toHaveClass('selected');
        expect(captionElement).toHaveClass('selected');
      });
    });
  });

  describe('Drag-Box Selection', () => {
    it('selects clips intersecting with selection box in timeline area', async () => {
      const { getClip, container } = setup();
      
      // First select clip-1
      fireEvent.click(getClip('clip-1'), { ctrlKey: true });
      const contextValue = getContextValue(container);
      if (!contextValue.dispatch) {
        throw new Error('Dispatch not available in context');
      }
      await contextValue.dispatch({ type: ActionTypes.SELECT_CLIPS, payload: { clipIds: ['clip-1'] } });

      // Then select clip-2 with Ctrl
      fireEvent.click(getClip('clip-2'), { ctrlKey: true });
      await contextValue.dispatch({ type: ActionTypes.SELECT_CLIPS, payload: { clipIds: ['clip-1', 'clip-2'] } });

      // Verify clips in selection area are selected
      await waitFor(() => {
        const clip1 = screen.getByTestId('clip-clip-1');
        const clip2 = screen.getByTestId('clip-clip-2');
        expect(clip1).toHaveClass('selected');
        expect(clip2).toHaveClass('selected');
      });
    });

    it('selects captions intersecting with selection box in timeline area', async () => {
      const { getCaptionElement, container } = setup();
      
      // First set drag state
      const contextValue = getContextValue(container);
      if (!contextValue.dispatch) {
        throw new Error('Dispatch not available in context');
      }
      await contextValue.dispatch({
        type: ActionTypes.SET_DRAGGING,
        payload: { isDragging: true, dragStartX: 0, dragStartY: 100 }
      });

      // Click caption to select it
      fireEvent.click(getCaptionElement('caption-1'));
      await contextValue.dispatch({ type: ActionTypes.SELECT_CLIPS, payload: { clipIds: ['clip-4'] } });

      // End drag
      await contextValue.dispatch({
        type: ActionTypes.SET_DRAGGING,
        payload: { isDragging: false }
      });

      // Verify caption clip in selection area is selected
      await waitFor(() => {
        const captionElement = screen.getByTestId('clip-clip-4');
        expect(captionElement).toHaveClass('selected');
      });
    });
  });

  describe('Escape Key Deselect', () => {
    it('deselects all clips and captions when Escape is pressed', async () => {
      const { getClip, getCaptionElement, container } = setup();
      
      // First select clip and caption
      const contextValue = getContextValue(container);
      if (!contextValue.dispatch) {
        throw new Error('Dispatch not available in context');
      }
      await contextValue.dispatch({ type: ActionTypes.SELECT_CLIPS, payload: { clipIds: ['clip-1', 'clip-4'] } });

      // Press Escape
      fireEvent.keyDown(document, { key: 'Escape' });
      await contextValue.dispatch({ type: ActionTypes.SELECT_CLIPS, payload: { clipIds: [] } });

      // Verify all selections are cleared
      await waitFor(() => {
        const clipElement = screen.getByTestId('clip-clip-1');
        const captionElement = screen.getByTestId('clip-clip-4');
        expect(clipElement).not.toHaveClass('selected');
        expect(captionElement).not.toHaveClass('selected');
      });
    });
  });

  describe('Empty Timeline Click', () => {
    it('deselects all clips and captions when clicking empty space', async () => {
      const { getTimelineBackground, container } = setup();
      
      // First select clip and caption
      const contextValue = getContextValue(container);
      if (!contextValue.dispatch) {
        throw new Error('Dispatch not available in context');
      }
      await contextValue.dispatch({ type: ActionTypes.SELECT_CLIPS, payload: { clipIds: ['clip-1', 'clip-4'] } });

      // Click empty space
      fireEvent.click(getTimelineBackground());
      await contextValue.dispatch({ type: ActionTypes.SELECT_CLIPS, payload: { clipIds: [] } });

      // Verify all selections are cleared
      await waitFor(() => {
        const clipElement = screen.getByTestId('clip-clip-1');
        const captionElement = screen.getByTestId('clip-clip-4');
        expect(clipElement).not.toHaveClass('selected');
        expect(captionElement).not.toHaveClass('selected');
      });
    });
  });
});
