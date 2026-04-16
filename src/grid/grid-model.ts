import { coordKey, getValidNeighbors } from './hex-math';
import { NEUTRAL_OWNER, type GridConfig, type HexCoord, type TileOwnerId, type TileState } from './types';

export type GridSnapshot = Record<string, TileOwnerId>;

export class GridModel {
  readonly config: GridConfig;
  private readonly tiles: Map<string, TileState>;

  constructor(config: GridConfig) {
    this.config = config;
    this.tiles = new Map();
    this.initTiles();
  }

  private initTiles(): void {
    for (let q = 0; q < this.config.cols; q++) {
      for (let r = 0; r < this.config.rows; r++) {
        const coord: HexCoord = { q, r };
        const key = coordKey(coord);
        this.tiles.set(key, { coord, owner: NEUTRAL_OWNER, claimedAt: null });
      }
    }
  }

  getTile(coord: HexCoord): TileState | undefined {
    return this.tiles.get(coordKey(coord));
  }

  getNeighbors(coord: HexCoord): TileState[] {
    return getValidNeighbors(coord, this.config)
      .map((h) => this.tiles.get(coordKey(h)))
      .filter((t): t is TileState => t !== undefined);
  }

  /** Neutral tiles adjacent to at least one tile owned by playerId. */
  getFrontier(playerId: number): TileState[] {
    const frontier = new Map<string, TileState>();

    for (const tile of this.tiles.values()) {
      if (tile.owner !== playerId) continue;
      for (const neighbor of this.getNeighbors(tile.coord)) {
        if (neighbor.owner === NEUTRAL_OWNER) {
          frontier.set(coordKey(neighbor.coord), neighbor);
        }
      }
    }

    return [...frontier.values()];
  }

  isFrontierTile(coord: HexCoord, playerId: number): boolean {
    const tile = this.getTile(coord);
    if (!tile || tile.owner !== NEUTRAL_OWNER) return false;
    return this.getNeighbors(coord).some((n) => n.owner === playerId);
  }

  getTerritory(playerId: number): TileState[] {
    return [...this.tiles.values()].filter((t) => t.owner === playerId);
  }

  getTerritoryCount(playerId: number): number {
    let count = 0;
    for (const tile of this.tiles.values()) {
      if (tile.owner === playerId) count++;
    }
    return count;
  }

  /**
   * Unconditionally set a tile's owner — used only for spawn initialization.
   * Bypasses the frontier check; does not check resource costs.
   */
  forceSetOwner(coord: HexCoord, playerId: number): boolean {
    const tile = this.getTile(coord);
    if (!tile) return false;
    tile.owner = playerId;
    tile.claimedAt = Date.now();
    return true;
  }

  /**
   * Claim a tile for a player. Returns true if the claim was valid and applied.
   * Does NOT check resource costs — that is the caller's responsibility.
   */
  claimTile(coord: HexCoord, playerId: number): boolean {
    const tile = this.getTile(coord);
    if (!tile) return false;
    if (tile.owner !== NEUTRAL_OWNER) return false;
    if (!this.isFrontierTile(coord, playerId)) return false;

    tile.owner = playerId;
    tile.claimedAt = Date.now();
    return true;
  }

  /** Returns all tiles, for rendering. */
  allTiles(): IterableIterator<TileState> {
    return this.tiles.values();
  }

  serialize(): GridSnapshot {
    const snapshot: GridSnapshot = {};
    for (const [key, tile] of this.tiles) {
      snapshot[key] = tile.owner;
    }
    return snapshot;
  }

  deserialize(snapshot: GridSnapshot): void {
    for (const [key, owner] of Object.entries(snapshot)) {
      const tile = this.tiles.get(key);
      if (tile) {
        tile.owner = owner;
        tile.claimedAt = owner !== NEUTRAL_OWNER ? Date.now() : null;
      }
    }
  }
}
