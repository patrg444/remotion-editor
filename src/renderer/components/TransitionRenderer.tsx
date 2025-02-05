import React, { useRef, useEffect } from 'react';
import { Transition, TransitionType } from '../types/transition';
import { useTextureCache } from '../hooks/useTextureCache';
import transitions from '../transitions/shaders';

interface Clip {
  thumbnail?: string;
  id: string;
  duration: number;
  startTime: number;
}

interface TransitionRendererProps {
  transition: Transition;
  fromClip: Clip;
  toClip: Clip;
  progress: number;
  width: number;
  height: number;
}

export const TransitionRenderer: React.FC<TransitionRendererProps> = ({
  transition,
  fromClip,
  toClip,
  progress,
  width,
  height,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGL2RenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const { getTexture } = useTextureCache();

  // Initialize WebGL context and shaders
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl2');
    if (!gl) {
      console.error('WebGL2 not supported');
      return;
    }

    glRef.current = gl;

    // Clean up
    return () => {
      if (programRef.current) {
        gl.deleteProgram(programRef.current);
      }
    };
  }, []);

  // Render transition
  useEffect(() => {
    const gl = glRef.current;
    if (!gl || !transition.type) return;

    const transitionDef = transitions[transition.type];
    if (!transitionDef) return;

    const renderFrame = async () => {
      try {
        // Load images
        const [fromImage, toImage] = await Promise.all([
          fromClip.thumbnail ? getTexture(fromClip.thumbnail) : null,
          toClip.thumbnail ? getTexture(toClip.thumbnail) : null,
        ]);

        if (!fromImage || !toImage) return;

        // Create WebGL textures from images
        const fromTexture = gl.createTexture();
        const toTexture = gl.createTexture();
        if (!fromTexture || !toTexture) return;

        // Load first texture
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, fromTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, fromImage);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        // Load second texture
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, toTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, toImage);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        // Create and compile shaders
        const vertexShader = gl.createShader(gl.VERTEX_SHADER);
        const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
        if (!vertexShader || !fragmentShader) return;

        gl.shaderSource(vertexShader, transitionDef.vertexShader);
        gl.shaderSource(fragmentShader, transitionDef.fragmentShader);
        gl.compileShader(vertexShader);
        gl.compileShader(fragmentShader);

        // Create and link program
        const program = gl.createProgram();
        if (!program) return;

        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        gl.useProgram(program);

        programRef.current = program;

        // Set up uniforms
        Object.entries(transitionDef.uniforms).forEach(([name, uniform]) => {
          const location = gl.getUniformLocation(program, name);
          if (!location) return;

          switch (name) {
            case 'progress':
              gl.uniform1f(location, progress);
              break;
            case 'fromTexture':
              gl.uniform1i(location, 0);
              break;
            case 'toTexture':
              gl.uniform1i(location, 1);
              break;
            case 'direction':
              if (transition.params?.direction) {
                const dir = transition.params.direction;
                const vec = dir === 'right' ? [1, 0] :
                          dir === 'left' ? [-1, 0] :
                          dir === 'up' ? [0, -1] :
                          [0, 1];
                gl.uniform2fv(location, new Float32Array(vec));
              }
              break;
            case 'scale':
              if (transition.params?.scale) {
                gl.uniform1f(location, transition.params.scale);
              }
              break;
          }
        });

        // Set up attributes
        const positionBuffer = gl.createBuffer();
        const positions = new Float32Array([
          -1, -1,
           1, -1,
          -1,  1,
           1,  1,
        ]);

        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

        const positionLocation = gl.getAttribLocation(program, 'position');
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

        // Draw
        gl.viewport(0, 0, width, height);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

        // Clean up
        // Clean up
        gl.deleteBuffer(positionBuffer);
        gl.deleteShader(vertexShader);
        gl.deleteShader(fragmentShader);
        gl.deleteTexture(fromTexture);
        gl.deleteTexture(toTexture);

      } catch (error) {
        console.error('Error rendering transition:', error);
      }
    };

    renderFrame();
  }, [transition, fromClip, toClip, progress, width, height, getTexture]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{ width: '100%', height: '100%' }}
      data-testid="transition-canvas"
    />
  );
};

export default TransitionRenderer;
