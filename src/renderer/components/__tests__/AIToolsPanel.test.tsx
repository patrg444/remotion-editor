import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import AIToolsPanel from '../AIToolsPanel';
import {
  DEFAULT_AUTO_CAPTION_CONFIG,
  DEFAULT_AUTO_FRAMING_CONFIG,
  DEFAULT_EMOTION_DETECTION_CONFIG,
  AISegment
} from '../../types/ai-tools';

const mockSegments: AISegment[] = [
  {
    id: '1',
    type: 'highlight',
    startTime: 10,
    endTime: 15,
    confidence: 0.85,
    category: 'Emotion Peak',
    description: 'High emotional engagement detected',
    metadata: { emotion: 'joy', intensity: 0.9 }
  },
  {
    id: '2',
    type: 'suggestion',
    startTime: 30,
    endTime: 35,
    confidence: 0.75,
    category: 'Framing',
    description: 'Suggested reframe for better composition',
    metadata: { subjects: ['face'], action: 'zoom' }
  }
];

describe('AIToolsPanel', () => {
  const mockHandlers = {
    onFeatureToggle: jest.fn(),
    onFeatureSettingsChange: jest.fn(),
    onSegmentSelect: jest.fn(),
    onSegmentApply: jest.fn(),
    onSegmentDismiss: jest.fn()
  };

  const mockFeatures = {
    autoCaption: { ...DEFAULT_AUTO_CAPTION_CONFIG },
    autoFraming: { ...DEFAULT_AUTO_FRAMING_CONFIG },
    emotionDetection: { ...DEFAULT_EMOTION_DETECTION_CONFIG }
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all AI features', () => {
    render(
      <AIToolsPanel
        features={mockFeatures}
        segments={[]}
        {...mockHandlers}
      />
    );

    expect(screen.getByText('Auto Caption')).toBeInTheDocument();
    expect(screen.getByText('Smart Framing')).toBeInTheDocument();
    expect(screen.getByText('Emotion Detection')).toBeInTheDocument();
  });

  describe('Auto Caption Feature', () => {
    it('handles language selection', () => {
      render(
        <AIToolsPanel
          features={{
            autoCaption: { ...DEFAULT_AUTO_CAPTION_CONFIG, isEnabled: true }
          }}
          segments={[]}
          {...mockHandlers}
        />
      );

      const languageSelect = screen.getByLabelText('Language');
      fireEvent.change(languageSelect, { target: { value: 'es' } });

      expect(mockHandlers.onFeatureSettingsChange).toHaveBeenCalledWith(
        'autoCaption',
        expect.objectContaining({ language: 'es' })
      );
    });

    it('toggles auto-translate option', () => {
      render(
        <AIToolsPanel
          features={{
            autoCaption: { ...DEFAULT_AUTO_CAPTION_CONFIG, isEnabled: true }
          }}
          segments={[]}
          {...mockHandlers}
        />
      );

      const autoTranslateCheckbox = screen.getByLabelText('Auto-translate');
      fireEvent.click(autoTranslateCheckbox);

      expect(mockHandlers.onFeatureSettingsChange).toHaveBeenCalledWith(
        'autoCaption',
        expect.objectContaining({ autoTranslate: true })
      );
    });
  });

  describe('Smart Framing Feature', () => {
    it('handles mode selection', () => {
      render(
        <AIToolsPanel
          features={{
            autoFraming: { ...DEFAULT_AUTO_FRAMING_CONFIG, isEnabled: true }
          }}
          segments={[]}
          {...mockHandlers}
        />
      );

      const modeSelect = screen.getByLabelText('Mode');
      fireEvent.change(modeSelect, { target: { value: 'object' } });

      expect(mockHandlers.onFeatureSettingsChange).toHaveBeenCalledWith(
        'autoFraming',
        expect.objectContaining({ mode: 'object' })
      );
    });

    it('adjusts strength and smoothing', () => {
      render(
        <AIToolsPanel
          features={{
            autoFraming: { ...DEFAULT_AUTO_FRAMING_CONFIG, isEnabled: true }
          }}
          segments={[]}
          {...mockHandlers}
        />
      );

      const strengthSlider = screen.getByLabelText(/Strength/);
      fireEvent.change(strengthSlider, { target: { value: '0.8' } });

      expect(mockHandlers.onFeatureSettingsChange).toHaveBeenCalledWith(
        'autoFraming',
        expect.objectContaining({ strength: 0.8 })
      );
    });
  });

  describe('Emotion Detection Feature', () => {
    it('adjusts sensitivity and confidence threshold', () => {
      render(
        <AIToolsPanel
          features={{
            emotionDetection: { ...DEFAULT_EMOTION_DETECTION_CONFIG, isEnabled: true }
          }}
          segments={[]}
          {...mockHandlers}
        />
      );

      const sensitivitySlider = screen.getByLabelText(/Sensitivity/);
      fireEvent.change(sensitivitySlider, { target: { value: '0.9' } });

      expect(mockHandlers.onFeatureSettingsChange).toHaveBeenCalledWith(
        'emotionDetection',
        expect.objectContaining({ sensitivity: 0.9 })
      );
    });
  });

  describe('AI Segments', () => {
    it('renders segment list', () => {
      render(
        <AIToolsPanel
          features={mockFeatures}
          segments={mockSegments}
          {...mockHandlers}
        />
      );

      expect(screen.getByText('Emotion Peak')).toBeInTheDocument();
      expect(screen.getByText('High emotional engagement detected')).toBeInTheDocument();
      expect(screen.getByText('Suggested reframe for better composition')).toBeInTheDocument();
    });

    it('handles segment selection', () => {
      render(
        <AIToolsPanel
          features={mockFeatures}
          segments={mockSegments}
          {...mockHandlers}
        />
      );

      const segment = screen.getByText('High emotional engagement detected').closest('.segment-item');
      fireEvent.click(segment!);

      expect(mockHandlers.onSegmentSelect).toHaveBeenCalledWith('1');
    });

    it('handles apply and dismiss actions', () => {
      render(
        <AIToolsPanel
          features={mockFeatures}
          segments={mockSegments}
          {...mockHandlers}
        />
      );

      const applyButton = screen.getAllByText('Apply')[0];
      fireEvent.click(applyButton);
      expect(mockHandlers.onSegmentApply).toHaveBeenCalledWith('1');

      const dismissButton = screen.getAllByText('Dismiss')[0];
      fireEvent.click(dismissButton);
      expect(mockHandlers.onSegmentDismiss).toHaveBeenCalledWith('1');
    });

    it('shows empty state when no segments', () => {
      render(
        <AIToolsPanel
          features={mockFeatures}
          segments={[]}
          {...mockHandlers}
        />
      );

      expect(screen.getByText('No AI suggestions available')).toBeInTheDocument();
    });
  });

  it('applies custom className when provided', () => {
    const { container } = render(
      <AIToolsPanel
        features={mockFeatures}
        segments={mockSegments}
        className="custom-class"
        {...mockHandlers}
      />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });
});
