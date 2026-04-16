export interface HexCoord {
  readonly q: number; // column (offset)
  readonly r: number; // row (offset)
}

export interface CubeCoord {
  readonly q: number;
  readonly r: number;
  readonly s: number; // always: q + r + s === 0
}

export const NEUTRAL_OWNER = -1 as const;
export type TileOwnerId = typeof NEUTRAL_OWNER | number; // player IDs are 0-indexed

export interface TileState {
  readonly coord: HexCoord;
  owner: TileOwnerId;
  claimedAt: number | null;
}

export interface GridConfig {
  readonly cols: number;
  readonly rows: number;
  readonly tileRadius: number; // outer radius: center to vertex (px)
}

export const PLAYER_COLORS = [
  0xe06c45, // rust orange  — player 0 (local)
  0x4a90d9, // steel blue
  0x5cb85c, // machine green
  0xd9534f, // warning red
  0xf0ad4e, // spark yellow
  0x9b59b6, // scrap purple
  0x1abc9c, // teal cyan
  0xe67e22, // copper orange
] as const;

export type PlayerColor = (typeof PLAYER_COLORS)[number];

export const COLORS = {
  NEUTRAL_FILL: 0x2e2e2e,
  NEUTRAL_STROKE: 0x484848,
  HOVER_VALID_FILL: 0x4a4a4a,
  HOVER_INVALID_FILL: 0x343434,
  STROKE_WIDTH: 1.5,
} as const;

export const DEFAULT_GRID_CONFIG: GridConfig = {
  cols: 32,
  rows: 22,
  tileRadius: 18,
};
