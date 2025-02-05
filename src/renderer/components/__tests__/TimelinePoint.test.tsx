import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { TimelinePoint } from '../TimelinePoint';

describe('TimelinePoint', () => {
  const mockProps = {
    time: 1000,
    type: 'marker' as const,
    label: 'Test Marker',
  };

  const mockHandlers = {
    onClick: jest.fn(),
    onDoubleClick: jest.fn(),
    onContextMenu: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders marker type point with label', () => {
    render(<TimelinePoint {...mockProps} />);
    
    expect(screen.getByTitle('Test Marker')).toBeInTheDocument();
    expect(screen.getByText('Test Marker')).toBeInTheDocument();
    expect(document.querySelector('.marker-flag')).toBeInTheDocument();
  });

  it('renders in point with indicator', () => {
    render(<TimelinePoint {...mockProps} type="in" />);
    
    expect(screen.getByText('I')).toBeInTheDocument();
    expect(document.querySelector('.in-point-indicator')).toBeInTheDocument();
  });

  it('renders out point with indicator', () => {
    render(<TimelinePoint {...mockProps} type="out" />);
    
    expect(screen.getByText('O')).toBeInTheDocument();
    expect(document.querySelector('.out-point-indicator')).toBeInTheDocument();
  });

  it('applies custom color', () => {
    const color = '#ff0000';
    render(<TimelinePoint {...mockProps} color={color} />);
    
    const point = document.querySelector('.timeline-point');
    expect(point).toHaveStyle({ backgroundColor: color });

    const flag = document.querySelector('.marker-flag');
    expect(flag).toHaveStyle({ borderColor: color });
  });

  it('applies default color when not provided', () => {
    render(<TimelinePoint {...mockProps} />);
    
    const point = document.querySelector('.timeline-point');
    expect(point).toHaveStyle({ backgroundColor: '#ffeb3b' });
  });

  it('applies selected class when isSelected is true', () => {
    render(<TimelinePoint {...mockProps} isSelected={true} />);
    
    const point = document.querySelector('.timeline-point');
    expect(point).toHaveClass('selected');
  });

  it('handles click events', () => {
    render(<TimelinePoint {...mockProps} onClick={mockHandlers.onClick} />);
    
    const point = document.querySelector('.timeline-point')!;
    fireEvent.click(point);
    
    expect(mockHandlers.onClick).toHaveBeenCalledTimes(1);
  });

  it('handles double click events', () => {
    render(<TimelinePoint {...mockProps} onDoubleClick={mockHandlers.onDoubleClick} />);
    
    const point = document.querySelector('.timeline-point')!;
    fireEvent.doubleClick(point);
    
    expect(mockHandlers.onDoubleClick).toHaveBeenCalledTimes(1);
  });

  it('handles context menu events', () => {
    render(<TimelinePoint {...mockProps} onContextMenu={mockHandlers.onContextMenu} />);
    
    const point = document.querySelector('.timeline-point')!;
    fireEvent.contextMenu(point);
    
    expect(mockHandlers.onContextMenu).toHaveBeenCalledTimes(1);
  });

  it('applies correct CSS classes', () => {
    render(<TimelinePoint {...mockProps} />);
    
    const point = document.querySelector('.timeline-point');
    expect(point).toHaveClass('timeline-point');
    expect(point).toHaveClass('marker');
  });

  it('does not render label when not provided', () => {
    const { container } = render(
      <TimelinePoint time={1000} type="marker" />
    );
    
    expect(container.querySelector('.marker-label')).not.toBeInTheDocument();
  });

  it('passes time in title attribute', () => {
    render(<TimelinePoint {...mockProps} />);
    
    expect(screen.getByTitle('Test Marker')).toBeInTheDocument();
  });

  it('renders correctly without optional props', () => {
    const { container } = render(
      <TimelinePoint time={1000} type="marker" />
    );
    
    const point = container.querySelector('.timeline-point');
    expect(point).toBeInTheDocument();
    expect(point).toHaveStyle({ backgroundColor: '#ffeb3b' }); // default color
    expect(point).not.toHaveClass('selected');
  });
});
