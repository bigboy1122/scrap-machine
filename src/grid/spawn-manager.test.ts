import { describe, it, expect } from 'vitest';
import { calculateSpawnPositions, getSpawnCluster } from './spawn-manager';
import { isValidCoord } from './hex-math';
import { DEFAULT_GRID_CONFIG, type GridConfig } from './types';

const SMALL_CONFIG: GridConfig = { cols: 20, rows: 20, tileRadius: 20 };

describe('calculateSpawnPositions', () => {
  [2, 3, 4, 6, 8].forEach((count) => {
    it(`returns ${count} positions for ${count} players`, () => {
      const positions = calculateSpawnPositions(DEFAULT_GRID_CONFIG, count);
      expect(positions).toHaveLength(count);
    });
  });

  it('all positions are within grid bounds', () => {
    for (let n = 2; n <= 8; n++) {
      const positions = calculateSpawnPositions(DEFAULT_GRID_CONFIG, n);
      positions.forEach((pos) => {
        expect(isValidCoord(pos, DEFAULT_GRID_CONFIG)).toBe(true);
      });
    }
  });

  it('is deterministic — same input produces same output', () => {
    const a = calculateSpawnPositions(DEFAULT_GRID_CONFIG, 4);
    const b = calculateSpawnPositions(DEFAULT_GRID_CONFIG, 4);
    expect(a).toEqual(b);
  });

  it('positions are distinct for small player counts', () => {
    const positions = calculateSpawnPositions(DEFAULT_GRID_CONFIG, 4);
    const keys = positions.map((p) => `${p.q},${p.r}`);
    expect(new Set(keys).size).toBe(positions.length);
  });

  it('works for 2 players on small grid', () => {
    const positions = calculateSpawnPositions(SMALL_CONFIG, 2);
    expect(positions).toHaveLength(2);
    positions.forEach((p) => expect(isValidCoord(p, SMALL_CONFIG)).toBe(true));
  });
});

describe('getSpawnCluster', () => {
  it('returns at least 1 tile (the center)', () => {
    const cluster = getSpawnCluster({ q: 5, r: 5 }, DEFAULT_GRID_CONFIG);
    expect(cluster.length).toBeGreaterThanOrEqual(1);
  });

  it('first tile in cluster is the center coord', () => {
    const center = { q: 8, r: 8 };
    const cluster = getSpawnCluster(center, DEFAULT_GRID_CONFIG);
    expect(cluster[0]).toEqual(center);
  });

  it('all cluster tiles are valid grid coords', () => {
    const cluster = getSpawnCluster({ q: 5, r: 5 }, DEFAULT_GRID_CONFIG);
    cluster.forEach((c) => {
      expect(isValidCoord(c, DEFAULT_GRID_CONFIG)).toBe(true);
    });
  });

  it('returns 3 tiles for a center tile with 6 valid neighbors', () => {
    // Center of a large grid has 6 neighbors — cluster should be 3
    const center = {
      q: Math.floor(DEFAULT_GRID_CONFIG.cols / 2),
      r: Math.floor(DEFAULT_GRID_CONFIG.rows / 2),
    };
    const cluster = getSpawnCluster(center, DEFAULT_GRID_CONFIG);
    expect(cluster).toHaveLength(3);
  });
});
