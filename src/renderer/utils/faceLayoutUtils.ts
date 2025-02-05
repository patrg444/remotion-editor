import { AspectRatio, LayoutCell, FaceLayout, LayoutOptions, LayoutMode } from '../../types/face-tracking';

const DEFAULT_PADDING = 0.05; // 5% padding

function calculateCells(rows: number, cols: number, padding: number): LayoutCell[] {
  const cells: LayoutCell[] = [];
  const cellWidth = 1 / cols;
  const cellHeight = 1 / rows;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      cells.push({
        x: col * cellWidth,
        y: row * cellHeight,
        width: cellWidth,
        height: cellHeight,
        padding
      });
    }
  }

  return cells;
}

function determineLayoutMode(aspectRatio: AspectRatio, numFaces: number): LayoutMode {
  if (numFaces === 1) return 'single';
  if (numFaces === 2) {
    return aspectRatio === '16:9' ? 'horizontal' : 'vertical';
  }
  return 'grid';
}

export function generateLayout(options: LayoutOptions): FaceLayout {
  const { aspectRatio, numFaces, mode: userMode, userOverride, padding = DEFAULT_PADDING } = options;

  let rows: number;
  let cols: number;
  let mode = userMode || determineLayoutMode(aspectRatio, numFaces);

  // Only handle 1-2 faces
  if (numFaces === 1) {
    rows = 1;
    cols = 1;
  } else if (numFaces === 2) {
    if (mode === 'horizontal' || (aspectRatio === '16:9' && mode !== 'vertical')) {
      rows = 1;
      cols = 2;
    } else {
      rows = 2;
      cols = 1;
    }
  } else {
    // For more than 2 faces, just show first face
    rows = 1;
    cols = 1;
    mode = 'single';
  }

  const cells = calculateCells(rows, cols, padding);

  return {
    mode,
    rows,
    columns: cols,
    cells,
    aspectRatio,
    isUserOverride: !!userOverride
  };
}

export function generateLayoutPreviews(aspectRatio: AspectRatio): string[] {
  // Generate SVG previews for 1-2 faces
  const svgs: string[] = [];
  
  for (let numFaces = 1; numFaces <= 2; numFaces++) {
    const layout = generateLayout({ aspectRatio, numFaces });
    const svg = generatePreviewSVG(layout, numFaces);
    svgs.push(svg);
  }

  return svgs;
}

function generatePreviewSVG(layout: FaceLayout, numFaces: number): string {
  const width = layout.aspectRatio === '16:9' ? 160 : 90;
  const height = layout.aspectRatio === '9:16' ? 160 : 90;
  const viewBox = `0 0 ${width} ${height}`;

  let cells = '';
  layout.cells.slice(0, numFaces).forEach((cell, index) => {
    const x = cell.x * width;
    const y = cell.y * height;
    const w = cell.width * width;
    const h = cell.height * height;
    const pad = cell.padding * Math.min(w, h);

    cells += `
      <rect
        x="${x + pad}"
        y="${y + pad}"
        width="${w - 2 * pad}"
        height="${h - 2 * pad}"
        rx="4"
        fill="#666"
        stroke="#999"
        stroke-width="1"
      />
    `;
  });

  return `
    <svg width="${width}" height="${height}" viewBox="${viewBox}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#333"/>
      ${cells}
    </svg>
  `.trim();
}

export function getAspectRatioDimensions(aspectRatio: AspectRatio): { width: number; height: number } {
  switch (aspectRatio) {
    case '16:9':
      return { width: 16, height: 9 };
    case '9:16':
      return { width: 9, height: 16 };
    case '1:1':
      return { width: 1, height: 1 };
  }
}
