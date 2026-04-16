import type { CubeCoord, GridConfig, HexCoord } from './types';

// ─── Key ────────────────────────────────────────────────────────────────────

/** Stable string key for use in Maps/Sets. */
export function coordKey(hex: HexCoord): string {
  return `${hex.q},${hex.r}`;
}

export function keyToCoord(key: string): HexCoord {
  const [q, r] = key.split(',').map(Number);
  return { q, r };
}

// ─── Offset ↔ Cube conversion ────────────────────────────────────────────────
// Flat-top hexagons, odd-q offset (odd columns shift DOWN).

export function offsetToCube(hex: HexCoord): CubeCoord {
  const x = hex.q;
  const z = hex.r - (hex.q - (hex.q & 1)) / 2;
  const y = -x - z;
  return { q: x, r: y, s: z };
}

export function cubeToOffset(cube: CubeCoord): HexCoord {
  const col = cube.q;
  const row = cube.s + (cube.q - (cube.q & 1)) / 2;
  return { q: col, r: row };
}

// ─── Cube rounding ──────────────────────────────────────────────────────────

function cubeRound(fq: number, fr: number, fs: number): CubeCoord {
  let rq = Math.round(fq);
  let rr = Math.round(fr);
  let rs = Math.round(fs);

  const qDiff = Math.abs(rq - fq);
  const rDiff = Math.abs(rr - fr);
  const sDiff = Math.abs(rs - fs);

  if (qDiff > rDiff && qDiff > sDiff) {
    rq = -rr - rs;
  } else if (rDiff > sDiff) {
    rr = -rq - rs;
  } else {
    rs = -rq - rr;
  }

  return { q: rq, r: rr, s: rs };
}

// ─── Pixel conversion ────────────────────────────────────────────────────────
// Origin (0,0) in pixel space = center of hex (0,0).

export function hexToPixel(hex: HexCoord, radius: number): { x: number; y: number } {
  return {
    x: radius * 1.5 * hex.q,
    y: radius * Math.sqrt(3) * (hex.r + (hex.q & 1) * 0.5),
  };
}

export function pixelToHex(px: number, py: number, radius: number): HexCoord {
  const fq = (2 / 3) * px / radius;
  const fs = (Math.sqrt(3) / 3 * py - (1 / 3) * px) / radius;
  const fr = -fq - fs;
  return cubeToOffset(cubeRound(fq, fr, fs));
}

// ─── Distance ───────────────────────────────────────────────────────────────

export function cubeDistance(a: CubeCoord, b: CubeCoord): number {
  return (Math.abs(a.q - b.q) + Math.abs(a.r - b.r) + Math.abs(a.s - b.s)) / 2;
}

export function hexDistance(a: HexCoord, b: HexCoord): number {
  return cubeDistance(offsetToCube(a), offsetToCube(b));
}

// ─── Neighbors ──────────────────────────────────────────────────────────────

const CUBE_DIRECTIONS: CubeCoord[] = [
  { q: 1, r: -1, s: 0 },
  { q: 1, r: 0, s: -1 },
  { q: 0, r: 1, s: -1 },
  { q: -1, r: 1, s: 0 },
  { q: -1, r: 0, s: 1 },
  { q: 0, r: -1, s: 1 },
];

/** All 6 neighbors of a hex in offset space (may be outside grid bounds). */
export function getHexNeighbors(hex: HexCoord): HexCoord[] {
  const cube = offsetToCube(hex);
  return CUBE_DIRECTIONS.map((dir) =>
    cubeToOffset({ q: cube.q + dir.q, r: cube.r + dir.r, s: cube.s + dir.s }),
  );
}

/** Neighbors filtered to valid grid coordinates. */
export function getValidNeighbors(hex: HexCoord, config: GridConfig): HexCoord[] {
  return getHexNeighbors(hex).filter((h) => isValidCoord(h, config));
}

export function isValidCoord(hex: HexCoord, config: GridConfig): boolean {
  return hex.q >= 0 && hex.q < config.cols && hex.r >= 0 && hex.r < config.rows;
}

// ─── Vertex positions (for drawing) ─────────────────────────────────────────

/** 6 vertex positions for a flat-top hex centered at (cx, cy). */
export function hexVertices(
  cx: number,
  cy: number,
  radius: number,
): Array<{ x: number; y: number }> {
  return Array.from({ length: 6 }, (_, i) => {
    const angle = (Math.PI / 3) * i; // 0°, 60°, 120°, 180°, 240°, 300°
    return { x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) };
  });
}
