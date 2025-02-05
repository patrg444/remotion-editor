import React from 'react';
import { render, fireEvent, within } from '@testing-library/react';
import { TimelineGroupPanel } from '../TimelineGroupPanel';
import { useCompositing } from '../../hooks/useCompositing';
import { CompositeLayer } from '../../types/compositing';

// Mock the useCompositing hook
jest.mock('../../hooks/useCompositing');

const mockUseCompositing = useCompositing as jest.MockedFunction<typeof useCompositing>;

describe('TimelineGroupPanel', () => {
  const mockGroups = [
    {
      id: 'group1',
      name: 'Background',
      trackIds: ['track1', 'track2'],
      isCollapsed: false,
      blendMode: 'normal' as const,
      opacity: 1,
      isSolo: false,
      isMuted: false
    },
    {
      id: 'group2',
      name: 'Foreground',
      trackIds: ['track3'],
      isCollapsed: true,
      blendMode: 'overlay' as const,
      opacity: 0.8,
      isSolo: true,
      isMuted: false
    }
  ];

  const mockLayers: CompositeLayer[] = [
    {
      id: 'layer1',
      trackId: 'track1',
      clipId: 'clip1',
      renderOrder: 0,
      isEnabled: true,
      keyframeTracks: {},
      parameters: {
        blendMode: 'normal',
        opacity: 1,
        position: { x: 0, y: 0 },
        scale: { x: 1, y: 1 },
        rotation: 0,
        anchor: { x: 0.5, y: 0.5 }
      }
    },
    {
      id: 'layer2',
      trackId: 'track2',
      clipId: 'clip2',
      renderOrder: 1,
      isEnabled: true,
      keyframeTracks: {},
      parameters: {
        blendMode: 'multiply',
        opacity: 0.8,
        position: { x: 0, y: 0 },
        scale: { x: 1, y: 1 },
        rotation: 0,
        anchor: { x: 0.5, y: 0.5 }
      }
    }
  ];

  const mockContext = {
    layers: mockLayers,
    groups: mockGroups,
    selectedLayerId: null,
    selectedGroupId: 'group1',
    setSelectedLayerId: jest.fn(),
    setSelectedGroupId: jest.fn(),
    addLayer: jest.fn(),
    createGroup: jest.fn(),
    updateLayer: jest.fn(),
    updateGroup: jest.fn(),
    removeLayer: jest.fn(),
    removeGroup: jest.fn(),
    reorderLayer: jest.fn(),
    toggleLayer: jest.fn(),
    getLayer: jest.fn(),
    getGroup: jest.fn(),
    getLayersForTrack: jest.fn(),
    getLayersForGroup: jest.fn().mockReturnValue([]),
    getEffectiveParameters: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseCompositing.mockReturnValue(mockContext);
  });

  it('renders all groups', () => {
    const { getByText } = render(<TimelineGroupPanel />);
    expect(getByText('Background')).toBeInTheDocument();
    expect(getByText('Foreground')).toBeInTheDocument();
  });

  it('shows correct group states', () => {
    const { getByTestId } = render(<TimelineGroupPanel />);
    
    const backgroundGroup = getByTestId('group-group1');
    expect(backgroundGroup).toHaveClass('selected');

    const foregroundGroup = getByTestId('group-group2');
    expect(foregroundGroup).toHaveClass('collapsed');
  });

  it('handles group selection', () => {
    const { getByTestId } = render(<TimelineGroupPanel />);
    fireEvent.click(getByTestId('group-group2'));
    expect(mockContext.setSelectedGroupId).toHaveBeenCalledWith('group2');
  });

  it('handles blend mode changes', () => {
    const { getByTestId } = render(<TimelineGroupPanel />);
    const blendModeSelect = within(getByTestId('group-group1')).getByRole('combobox');
    fireEvent.change(blendModeSelect, { target: { value: 'multiply' } });
    
    expect(mockContext.updateGroup).toHaveBeenCalledWith('group1', { blendMode: 'multiply' });
  });

  it('handles opacity changes', () => {
    const { getByTestId } = render(<TimelineGroupPanel />);
    const opacityInput = within(getByTestId('group-group1')).getByRole('spinbutton');
    fireEvent.change(opacityInput, { target: { value: '50' } });
    
    expect(mockContext.updateGroup).toHaveBeenCalledWith('group1', { opacity: 0.5 });
  });

  it('handles mute toggle', () => {
    const { getByTestId } = render(<TimelineGroupPanel />);
    const muteButton = within(getByTestId('group-group1')).getByRole('button', { name: 'M' });
    fireEvent.click(muteButton);
    
    expect(mockContext.updateGroup).toHaveBeenCalledWith('group1', { isMuted: true });
  });

  it('handles solo toggle', () => {
    const { getByTestId } = render(<TimelineGroupPanel />);
    const soloButton = within(getByTestId('group-group1')).getByRole('button', { name: 'S' });
    fireEvent.click(soloButton);
    
    expect(mockContext.updateGroup).toHaveBeenCalledWith('group1', { isSolo: true });
  });

  it('handles group removal', () => {
    const { getByTestId } = render(<TimelineGroupPanel />);
    const removeButton = within(getByTestId('group-group1')).getByRole('button', { name: '×' });
    fireEvent.click(removeButton);
    
    expect(mockContext.removeGroup).toHaveBeenCalledWith('group1');
  });

  it('handles collapse toggle', () => {
    const { getByTestId } = render(<TimelineGroupPanel />);
    const collapseButton = within(getByTestId('group-group1')).getByRole('button', { name: '▼' });
    fireEvent.click(collapseButton);
    
    expect(mockContext.updateGroup).toHaveBeenCalledWith('group1', { isCollapsed: true });
  });

  it('shows layer count for each group', () => {
    mockContext.getLayersForGroup
      .mockReturnValueOnce([mockLayers[0], mockLayers[1]])
      .mockReturnValueOnce([mockLayers[0]]);

    const { getByTestId } = render(<TimelineGroupPanel />);
    
    const backgroundGroup = getByTestId('group-group1');
    expect(within(backgroundGroup).getByText('2 layers')).toBeInTheDocument();
  });
});
