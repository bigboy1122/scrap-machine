import { hexToPixel, pixelToHex, getValidNeighbors } from './hex-math';
import type { GridConfig, HexCoord } from './types';

/**
 * Calculate deterministic spawn positions evenly distributed on a circle
 * centered on the grid. Returns one center coord per player.
 */
export function calculateSpawnPositions(
  config: GridConfig,
  playerCount: number,
): HexCoord[] {
  const centerQ = Math.floor(config.cols / 2);
  const centerR = Math.floor(config.rows / 2);
  const centerPx = hexToPixel({ q: centerQ, r: centerR }, config.tileRadius);

  const minDim = Math.min(config.cols, config.rows);
  const circleRadiusPx = minDim * config.tileRadius * 0.55;

  return Array.from({ length: playerCount }, (_, i) => {
    const angle = (2 * Math.PI * i) / playerCount - Math.PI / 2; // start at top
    const px = centerPx.x + circleRadiusPx * Math.cos(angle);
    const py = centerPx.y + circleRadiusPx * Math.sin(angle);
    const hex = pixelToHex(px, py, config.tileRadius);
    return clampToGrid(hex, config, 2);
  });
}

/** 3-tile cluster for a spawn: center + 2 valid neighbors. */
export function getSpawnCluster(center: HexCoord, config: GridConfig): HexCoord[] {
  const neighbors = getValidNeighbors(center, config);
  return [center, ...neighbors.slice(0, 2)];
}

function clampToGrid(hex: HexCoord, config: GridConfig, margin: number): HexCoord {
  return {
    q: Math.max(margin, Math.min(config.cols - 1 - margin, hex.q)),
    r: Math.max(margin, Math.min(config.rows - 1 - margin, hex.r)),
  };
}
