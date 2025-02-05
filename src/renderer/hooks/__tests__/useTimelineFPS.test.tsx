import React from 'react';
import { render, act } from '@testing-library/react';
import { TimelineProvider } from '../../contexts/TimelineContext';
import { useTimelineFPS } from '../useTimelineFPS';
import { useTimelineContext } from '../useTimelineContext';

describe('useTimelineFPS', () => {
  const FPSTestComponent: React.FC = () => {
    const { state } = useTimelineContext();
    const {
      fps,
      frameDuration,
      commonFPS,
      setFPS,
      getNearestStandardFPS,
      isStandardFPS,
      frameToTime,
      timeToFrame,
      getFrameDuration,
      isFrameAligned,
      snapToFrame
    } = useTimelineFPS();

    const testTime = 2.5; // 2.5 seconds
    const testFrame = 75; // Frame 75 (at 30fps = 2.5s)

    return (
      <div>
        <div data-testid="fps">{fps}</div>
        <div data-testid="frame-duration">{frameDuration}</div>
        <div data-testid="common-fps">{JSON.stringify(commonFPS)}</div>
        <div data-testid="nearest-standard-fps">{getNearestStandardFPS(31)}</div>
        <div data-testid="is-standard-fps">{isStandardFPS(30).toString()}</div>
        <div data-testid="time-to-frame">{timeToFrame(testTime)}</div>
        <div data-testid="frame-to-time">{frameToTime(testFrame)}</div>
        <div data-testid="frame-duration-calc">{getFrameDuration()}</div>
        <div data-testid="is-frame-aligned">{isFrameAligned(testTime).toString()}</div>
        <div data-testid="snapped-time">{snapToFrame(testTime)}</div>
        <button
          data-testid="set-fps"
          onClick={() => setFPS(24)}
        >
          Set 24 FPS
        </button>
      </div>
    );
  };

  it('provides current FPS configuration', () => {
    const { getByTestId } = render(
      <TimelineProvider>
        <FPSTestComponent />
      </TimelineProvider>
    );

    expect(Number(getByTestId('fps').textContent)).to.be.equal(30); // Default FPS
    expect(Number(getByTestId('frame-duration').textContent)).to.be.equal(1/30);
    
    const commonFPS = JSON.parse(getByTestId('common-fps').textContent || '[]');
    expect(commonFPS).to.include.members([24, 30, 60]);
  });

  it('handles standard FPS operations', () => {
    const { getByTestId } = render(
      <TimelineProvider>
        <FPSTestComponent />
      </TimelineProvider>
    );

    expect(Number(getByTestId('nearest-standard-fps').textContent)).to.be.equal(30); // 31 should round to 30
    expect(getByTestId('is-standard-fps').textContent).to.be.equal('true'); // 30 is standard
  });

  it('converts between frames and time', () => {
    const { getByTestId } = render(
      <TimelineProvider>
        <FPSTestComponent />
      </TimelineProvider>
    );

    const timeToFrameResult = Number(getByTestId('time-to-frame').textContent);
    const frameToTimeResult = Number(getByTestId('frame-to-time').textContent);

    // 2.5 seconds at 30fps should be frame 75
    expect(timeToFrameResult).to.be.equal(75);
    // Frame 75 at 30fps should be 2.5 seconds
    expect(frameToTimeResult).to.be.equal(2.5);
  });

  it('handles frame alignment', () => {
    const { getByTestId } = render(
      <TimelineProvider>
        <FPSTestComponent />
      </TimelineProvider>
    );

    const isAligned = getByTestId('is-frame-aligned').textContent === 'true';
    const snappedTime = Number(getByTestId('snapped-time').textContent);
    const frameDuration = Number(getByTestId('frame-duration-calc').textContent);

    expect(isAligned).to.be.equal(true); // 2.5s should align with frame at 30fps
    expect(snappedTime).to.be.equal(2.5); // 2.5s should snap to itself at 30fps
    expect(frameDuration).to.be.equal(1/30);
  });

  it('allows changing FPS', () => {
    const { getByTestId } = render(
      <TimelineProvider>
        <FPSTestComponent />
      </TimelineProvider>
    );

    act(() => {
      getByTestId('set-fps').click();
    });

    expect(Number(getByTestId('fps').textContent)).to.be.equal(24);
    expect(Number(getByTestId('frame-duration').textContent)).to.be.equal(1/24);
  });

  describe('boundary conditions', () => {
    const BoundaryTestComponent: React.FC = () => {
      const { fps, minFPS, maxFPS, setFPS } = useTimelineFPS();
      
      return (
        <div>
          <button data-testid="set-min" onClick={() => setFPS(0)}>Set Below Min</button>
          <button data-testid="set-max" onClick={() => setFPS(1000)}>Set Above Max</button>
          <div data-testid="min-fps">{minFPS}</div>
          <div data-testid="max-fps">{maxFPS}</div>
          <div data-testid="fps">{fps}</div>
        </div>
      );
    };

    it('clamps FPS to valid range', () => {
      const { getByTestId } = render(
        <TimelineProvider>
          <BoundaryTestComponent />
        </TimelineProvider>
      );

      const minFPS = Number(getByTestId('min-fps').textContent);
      const maxFPS = Number(getByTestId('max-fps').textContent);

      act(() => {
        getByTestId('set-min').click();
      });
      
      act(() => {
        getByTestId('set-max').click();
      });

      // FPS should be clamped to min/max range
    const fps = Number(getByTestId('fps').textContent);
    expect(fps).to.be.within(minFPS, maxFPS);
    });
  });
});
