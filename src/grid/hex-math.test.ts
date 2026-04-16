import { describe, it, expect } from 'vitest';
import {
  offsetToCube,
  cubeToOffset,
  hexToPixel,
  pixelToHex,
  getHexNeighbors,
  getValidNeighbors,
  isValidCoord,
  hexDistance,
  coordKey,
} from './hex-math';
import type { HexCoord } from './types';
import { DEFAULT_GRID_CONFIG } from './types';

describe('coordKey', () => {
  it('produces a stable string key', () => {
    expect(coordKey({ q: 3, r: 7 })).toBe('3,7');
    expect(coordKey({ q: 0, r: 0 })).toBe('0,0');
    expect(coordKey({ q: -1, r: 2 })).toBe('-1,2');
  });
});

describe('offsetToCube / cubeToOffset round-trip', () => {
  const cases: HexCoord[] = [
    { q: 0, r: 0 },
    { q: 1, r: 0 }, // odd column
    { q: 2, r: 0 }, // even column
    { q: 1, r: 1 },
    { q: 4, r: 3 },
    { q: 10, r: 5 },
    { q: 0, r: 10 },
  ];

  cases.forEach(({ q, r }) => {
    it(`round-trips (${q}, ${r})`, () => {
      const result = cubeToOffset(offsetToCube({ q, r }));
      expect(result.q).toBe(q);
      expect(result.r).toBe(r);
    });
  });

  it('satisfies q+r+s=0 in cube space', () => {
    const cube = offsetToCube({ q: 5, r: 3 });
    expect(cube.q + cube.r + cube.s).toBe(0);
  });
});

describe('hexToPixel / pixelToHex round-trip', () => {
  const RADIUS = 18;

  const cases: HexCoord[] = [
    { q: 0, r: 0 },
    { q: 1, r: 0 },
    { q: 2, r: 1 },
    { q: 5, r: 4 },
    { q: 10, r: 8 },
  ];

  cases.forEach(({ q, r }) => {
    it(`round-trips hex (${q}, ${r})`, () => {
      const { x, y } = hexToPixel({ q, r }, RADIUS);
      const back = pixelToHex(x, y, RADIUS);
      expect(back.q).toBe(q);
      expect(back.r).toBe(r);
    });
  });

  it('places even columns at y=0 for r=0', () => {
    const { y } = hexToPixel({ q: 0, r: 0 }, RADIUS);
    expect(y).toBeCloseTo(0);
  });

  it('places odd columns offset down by half a row', () => {
    const even = hexToPixel({ q: 0, r: 0 }, RADIUS);
    const odd = hexToPixel({ q: 1, r: 0 }, RADIUS);
    expect(odd.y).toBeCloseTo(RADIUS * Math.sqrt(3) * 0.5);
    expect(even.y).toBeCloseTo(0);
  });

  it('horizontal spacing is 1.5 × radius between adjacent columns', () => {
    const a = hexToPixel({ q: 0, r: 0 }, RADIUS);
    const b = hexToPixel({ q: 1, r: 0 }, RADIUS);
    expect(b.x - a.x).toBeCloseTo(RADIUS * 1.5);
  });

  it('snaps pixel to nearest hex center (not just floor)', () => {
    // midpoint between (0,0) and (0,1) should round to one of them, not a garbage coord
    const { x: x0, y: y0 } = hexToPixel({ q: 0, r: 0 }, RADIUS);
    const { x: x1, y: y1 } = hexToPixel({ q: 0, r: 1 }, RADIUS);
    const midX = (x0 + x1) / 2;
    const midY = (y0 + y1) / 2;
    const result = pixelToHex(midX, midY, RADIUS);
    const isOne = (result.q === 0 && result.r === 0) || (result.q === 0 && result.r === 1);
    expect(isOne).toBe(true);
  });
});

describe('getHexNeighbors', () => {
  it('returns exactly 6 neighbors', () => {
    expect(getHexNeighbors({ q: 5, r: 5 })).toHaveLength(6);
  });

  it('all neighbors are distinct', () => {
    const neighbors = getHexNeighbors({ q: 3, r: 3 });
    const keys = neighbors.map((h) => coordKey(h));
    expect(new Set(keys).size).toBe(6);
  });

  it('each neighbor is at hex-distance 1', () => {
    const center = { q: 4, r: 4 };
    const neighbors = getHexNeighbors(center);
    neighbors.forEach((n) => {
      expect(hexDistance(center, n)).toBe(1);
    });
  });

  it('neighbor of (0,0) does not include (0,0)', () => {
    const neighbors = getHexNeighbors({ q: 0, r: 0 });
    const keys = neighbors.map((h) => coordKey(h));
    expect(keys).not.toContain('0,0');
  });
});

describe('getValidNeighbors', () => {
  it('filters neighbors outside grid bounds', () => {
    // corner tile (0,0) should have fewer than 6 valid neighbors
    const valid = getValidNeighbors({ q: 0, r: 0 }, DEFAULT_GRID_CONFIG);
    expect(valid.length).toBeLessThan(6);
    valid.forEach((h) => {
      expect(isValidCoord(h, DEFAULT_GRID_CONFIG)).toBe(true);
    });
  });

  it('center tile has 6 valid neighbors', () => {
    const center = {
      q: Math.floor(DEFAULT_GRID_CONFIG.cols / 2),
      r: Math.floor(DEFAULT_GRID_CONFIG.rows / 2),
    };
    expect(getValidNeighbors(center, DEFAULT_GRID_CONFIG)).toHaveLength(6);
  });
});

describe('isValidCoord', () => {
  it('returns true for coords within bounds', () => {
    expect(isValidCoord({ q: 0, r: 0 }, DEFAULT_GRID_CONFIG)).toBe(true);
    expect(isValidCoord({ q: DEFAULT_GRID_CONFIG.cols - 1, r: DEFAULT_GRID_CONFIG.rows - 1 }, DEFAULT_GRID_CONFIG)).toBe(true);
  });

  it('returns false for negative coords', () => {
    expect(isValidCoord({ q: -1, r: 0 }, DEFAULT_GRID_CONFIG)).toBe(false);
    expect(isValidCoord({ q: 0, r: -1 }, DEFAULT_GRID_CONFIG)).toBe(false);
  });

  it('returns false for coords at or past cols/rows', () => {
    expect(isValidCoord({ q: DEFAULT_GRID_CONFIG.cols, r: 0 }, DEFAULT_GRID_CONFIG)).toBe(false);
    expect(isValidCoord({ q: 0, r: DEFAULT_GRID_CONFIG.rows }, DEFAULT_GRID_CONFIG)).toBe(false);
  });
});

describe('hexDistance', () => {
  it('distance from a hex to itself is 0', () => {
    expect(hexDistance({ q: 3, r: 3 }, { q: 3, r: 3 })).toBe(0);
  });

  it('distance to a direct neighbor is 1', () => {
    const center = { q: 5, r: 5 };
    const neighbors = getHexNeighbors(center);
    neighbors.forEach((n) => {
      expect(hexDistance(center, n)).toBe(1);
    });
  });

  it('distance is symmetric', () => {
    const a = { q: 2, r: 3 };
    const b = { q: 7, r: 1 };
    expect(hexDistance(a, b)).toBe(hexDistance(b, a));
  });
});
