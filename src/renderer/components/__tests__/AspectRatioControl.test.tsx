import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { AspectRatioControl } from '../AspectRatioControl';
import { TimelineContext } from '../../contexts/TimelineContext';
import { ASPECT_RATIO_PRESETS } from '../../types/timeline';

const mockDispatch = jest.fn();

const mockState = {
  aspectRatio: ASPECT_RATIO_PRESETS['16:9']
};

const renderWithContext = (ui: React.ReactElement) => {
  return render(
    <TimelineContext.Provider value={{ state: mockState as any, dispatch: mockDispatch }}>
      {ui}
    </TimelineContext.Provider>
  );
};

describe('AspectRatioControl', () => {
  beforeEach(() => {
    mockDispatch.mockClear();
  });

  it('renders with current aspect ratio selected', () => {
    renderWithContext(<AspectRatioControl />);
    
    const select = screen.getByLabelText('Aspect Ratio');
    expect(select).toHaveValue('16:9');
  });

  it('dispatches action when preset is selected', () => {
    renderWithContext(<AspectRatioControl />);
    
    const select = screen.getByLabelText('Aspect Ratio');
    fireEvent.change(select, { target: { value: '9:16' } });

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'SET_ASPECT_RATIO',
      payload: ASPECT_RATIO_PRESETS['9:16']
    });
  });

  it('shows custom inputs when custom is selected', () => {
    renderWithContext(<AspectRatioControl />);
    
    const select = screen.getByLabelText('Aspect Ratio');
    fireEvent.change(select, { target: { value: 'custom' } });

    expect(screen.getByLabelText('Width')).toBeInTheDocument();
    expect(screen.getByLabelText('Height')).toBeInTheDocument();
  });

  it('dispatches action with custom dimensions', () => {
    renderWithContext(<AspectRatioControl />);
    
    // Select custom option
    const select = screen.getByLabelText('Aspect Ratio');
    fireEvent.change(select, { target: { value: 'custom' } });

    // Enter custom dimensions
    const widthInput = screen.getByLabelText('Width');
    const heightInput = screen.getByLabelText('Height');
    fireEvent.change(widthInput, { target: { value: '1440' } });
    fireEvent.change(heightInput, { target: { value: '900' } });

    // Submit form
    const form = screen.getByRole('form');
    fireEvent.submit(form);

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'SET_CUSTOM_DIMENSIONS',
      payload: {
        width: 1440,
        height: 900
      }
    });
  });

  it('shows social media presets when custom is selected', () => {
    renderWithContext(<AspectRatioControl />);
    
    const select = screen.getByLabelText('Aspect Ratio');
    fireEvent.change(select, { target: { value: 'custom' } });

    expect(screen.getByText('Social Media Presets')).toBeInTheDocument();
    expect(screen.getByText('Instagram Story')).toBeInTheDocument();
    expect(screen.getByText('Facebook Link')).toBeInTheDocument();
  });

  it('dispatches action when social media preset is selected', () => {
    renderWithContext(<AspectRatioControl />);
    
    // Select custom to show presets
    const select = screen.getByLabelText('Aspect Ratio');
    fireEvent.change(select, { target: { value: 'custom' } });

    // Click Instagram Story preset
    const instagramStoryButton = screen.getByText('Instagram Story');
    fireEvent.click(instagramStoryButton);

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'SET_ASPECT_RATIO',
      payload: expect.objectContaining({
        width: 1080,
        height: 1920,
        platform: 'Instagram',
        name: 'Instagram Story'
      })
    });
  });
});
