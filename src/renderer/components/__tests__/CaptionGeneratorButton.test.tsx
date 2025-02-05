import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { CaptionGeneratorButton } from '../CaptionGeneratorButton';

// Helper function to flush promises
const flushPromises = () => new Promise(resolve => setTimeout(resolve, 0));

describe('CaptionGeneratorButton', () => {
  it('should render in initial state', () => {
    render(
      <CaptionGeneratorButton
        isGenerating={false}
        onGenerate={jest.fn()}
      />
    );

    const button = screen.getByTestId('generate-captions-button');
    expect(button).toBeInTheDocument();
    expect(button).not.toHaveClass('loading');
    expect(button).toBeEnabled();
    expect(button).toHaveTextContent('Generate Captions');
  });

  it('should show loading state while generating', async () => {
    let resolvePromise: (value: any) => void;
    const generatePromise = new Promise(resolve => {
      resolvePromise = resolve;
    });

    const onGenerate = jest.fn().mockImplementation(() => generatePromise);

    render(
      <CaptionGeneratorButton
        isGenerating={false}
        onGenerate={onGenerate}
      />
    );

    // Click the button
    const button = screen.getByTestId('generate-captions-button');
    await act(async () => {
      fireEvent.click(button);
      await flushPromises();
    });

    // Verify loading state
    expect(button).toHaveClass('loading');
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent('Generating...');

    // Complete the operation
    await act(async () => {
      resolvePromise!(null);
      await flushPromises();
    });

    // Verify button returns to normal state
    expect(button).not.toHaveClass('loading');
    expect(button).toBeEnabled();
    expect(button).toHaveTextContent('Generate Captions');
  });

  it('should handle generation errors', async () => {
    const error = new Error('Failed to generate captions');
    const onGenerate = jest.fn().mockRejectedValue(error);

    render(
      <CaptionGeneratorButton
        isGenerating={false}
        onGenerate={onGenerate}
      />
    );

    // Click the button
    const button = screen.getByTestId('generate-captions-button');
    await act(async () => {
      fireEvent.click(button);
      await flushPromises();
    });

    // Verify loading state
    expect(button).toHaveClass('loading');
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent('Generating...');

    // Wait for error to be handled
    await act(async () => {
      await flushPromises();
    });

    // Verify button returns to normal state
    expect(button).not.toHaveClass('loading');
    expect(button).toBeEnabled();
    expect(button).toHaveTextContent('Generate Captions');
  });

  it('should be disabled when isGenerating is true', () => {
    render(
      <CaptionGeneratorButton
        isGenerating={true}
        onGenerate={jest.fn()}
      />
    );

    const button = screen.getByTestId('generate-captions-button');
    expect(button).toBeDisabled();
  });

  it('should prevent multiple clicks while loading', async () => {
    const onGenerate = jest.fn().mockImplementation(() => new Promise(() => {}));

    render(
      <CaptionGeneratorButton
        isGenerating={false}
        onGenerate={onGenerate}
      />
    );

    // Click the button multiple times
    const button = screen.getByTestId('generate-captions-button');
    await act(async () => {
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);
      await flushPromises();
    });

    // Verify onGenerate was only called once
    expect(onGenerate).toHaveBeenCalledTimes(1);
  });
});
