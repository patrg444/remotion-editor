import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { FaceLayoutPreview } from '../FaceLayoutPreview';
import { generateLayout } from '../../utils/faceLayoutUtils';
import { AspectRatio, FaceLayout } from '../../../types/face-tracking';

describe('Face Layout System', () => {
  const mockOnLayoutSelect = jest.fn();

  beforeEach(() => {
    mockOnLayoutSelect.mockClear();
  });

  describe('Layout Generation', () => {
    it('generates correct layout for single face', () => {
      const layout = generateLayout({
        aspectRatio: '16:9',
        numFaces: 1,
        padding: 0.05
      });

      expect(layout).toEqual(expect.objectContaining({
        rows: 1,
        columns: 1,
        aspectRatio: '16:9',
        cells: expect.arrayContaining([
          expect.objectContaining({
            x: 0,
            y: 0,
            width: 1,
            height: 1,
            padding: 0.05
          })
        ])
      }));
    });

    it('generates horizontal layout for two faces in 16:9', () => {
      const layout = generateLayout({
        aspectRatio: '16:9',
        numFaces: 2,
        padding: 0.05
      });

      expect(layout.rows).toBe(1);
      expect(layout.columns).toBe(2);
      expect(layout.cells).toHaveLength(2);
      expect(layout.cells[0].width).toBe(0.5);
      expect(layout.cells[1].x).toBe(0.5);
    });

    it('generates vertical layout for two faces in 9:16', () => {
      const layout = generateLayout({
        aspectRatio: '9:16',
        numFaces: 2,
        padding: 0.05
      });

      expect(layout.rows).toBe(2);
      expect(layout.columns).toBe(1);
      expect(layout.cells).toHaveLength(2);
      expect(layout.cells[0].height).toBe(0.5);
      expect(layout.cells[1].y).toBe(0.5);
    });

    it('defaults to single face layout for more than 2 faces', () => {
      const layout = generateLayout({
        aspectRatio: '16:9',
        numFaces: 3,
        padding: 0.05
      });

      expect(layout.rows).toBe(1);
      expect(layout.columns).toBe(1);
      expect(layout.cells).toHaveLength(1);
      expect(layout.cells[0].width).toBe(1);
      expect(layout.cells[0].height).toBe(1);
    });
  });

  describe('Layout Preview Component', () => {
    it('allows locking layout to prevent auto-reflow', () => {
      const initialLayout = generateLayout({
        aspectRatio: '16:9',
        numFaces: 2,
        padding: 0.05
      });

      render(
        <FaceLayoutPreview
          aspectRatio="16:9"
          numFaces={2}
          selectedLayout={initialLayout}
          onLayoutSelect={mockOnLayoutSelect}
        />
      );

      const lockCheckbox = screen.getByLabelText(/lock layout/i);
      fireEvent.click(lockCheckbox);

      expect(mockOnLayoutSelect).toHaveBeenCalledWith(
        expect.objectContaining({
          ...initialLayout,
          isUserOverride: true
        })
      );
    });
  });
});
