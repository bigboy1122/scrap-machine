import { describe, it, expect, beforeEach } from 'vitest';
import { GridModel } from './grid-model';
import { NEUTRAL_OWNER, DEFAULT_GRID_CONFIG, type GridConfig } from './types';

const SMALL_CONFIG: GridConfig = { cols: 10, rows: 10, tileRadius: 20 };

describe('GridModel — initialization', () => {
  it('creates the correct number of tiles', () => {
    const model = new GridModel(SMALL_CONFIG);
    let count = 0;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for (const _t of model.allTiles()) count++;
    expect(count).toBe(SMALL_CONFIG.cols * SMALL_CONFIG.rows);
  });

  it('all tiles start as neutral', () => {
    const model = new GridModel(SMALL_CONFIG);
    for (const tile of model.allTiles()) {
      expect(tile.owner).toBe(NEUTRAL_OWNER);
      expect(tile.claimedAt).toBeNull();
    }
  });

  it('getTile returns undefined for out-of-bounds coord', () => {
    const model = new GridModel(SMALL_CONFIG);
    expect(model.getTile({ q: -1, r: 0 })).toBeUndefined();
    expect(model.getTile({ q: 100, r: 0 })).toBeUndefined();
  });
});

describe('GridModel — claimTile', () => {
  let model: GridModel;

  beforeEach(() => {
    model = new GridModel(SMALL_CONFIG);
    // Place player 0 at (5,5) to set up a frontier
    const tile = model.getTile({ q: 5, r: 5 })!;
    tile.owner = 0;
    tile.claimedAt = Date.now();
  });

  it('claims a neutral frontier tile and returns true', () => {
    const frontier = model.getFrontier(0);
    expect(frontier.length).toBeGreaterThan(0);
    const target = frontier[0];
    const result = model.claimTile(target.coord, 0);
    expect(result).toBe(true);
    expect(model.getTile(target.coord)!.owner).toBe(0);
  });

  it('returns false for a non-frontier neutral tile', () => {
    // (0,0) is far from player 0's territory at (5,5)
    const result = model.claimTile({ q: 0, r: 0 }, 0);
    expect(result).toBe(false);
    expect(model.getTile({ q: 0, r: 0 })!.owner).toBe(NEUTRAL_OWNER);
  });

  it('returns false for a tile already owned by same player', () => {
    const result = model.claimTile({ q: 5, r: 5 }, 0);
    expect(result).toBe(false);
  });

  it('returns false for a tile owned by another player', () => {
    const tile = model.getTile({ q: 3, r: 3 })!;
    tile.owner = 1;
    const result = model.claimTile({ q: 3, r: 3 }, 0);
    expect(result).toBe(false);
  });

  it('sets claimedAt timestamp after claim', () => {
    const frontier = model.getFrontier(0);
    const target = frontier[0];
    const before = Date.now();
    model.claimTile(target.coord, 0);
    const after = Date.now();
    const ts = model.getTile(target.coord)!.claimedAt;
    expect(ts).not.toBeNull();
    expect(ts!).toBeGreaterThanOrEqual(before);
    expect(ts!).toBeLessThanOrEqual(after);
  });
});

describe('GridModel — getFrontier', () => {
  it('returns empty frontier for player with no tiles', () => {
    const model = new GridModel(SMALL_CONFIG);
    expect(model.getFrontier(99)).toHaveLength(0);
  });

  it('frontier tiles are all neutral', () => {
    const model = new GridModel(SMALL_CONFIG);
    const tile = model.getTile({ q: 5, r: 5 })!;
    tile.owner = 0;
    const frontier = model.getFrontier(0);
    frontier.forEach((t) => {
      expect(t.owner).toBe(NEUTRAL_OWNER);
    });
  });

  it('all frontier tiles are adjacent to player territory', () => {
    const model = new GridModel(SMALL_CONFIG);
    const tile = model.getTile({ q: 5, r: 5 })!;
    tile.owner = 0;
    const frontier = model.getFrontier(0);
    frontier.forEach((t) => {
      const isAdjacentToPlayer = model.getNeighbors(t.coord).some((n) => n.owner === 0);
      expect(isAdjacentToPlayer).toBe(true);
    });
  });

  it('frontier grows after claiming a tile', () => {
    const model = new GridModel(SMALL_CONFIG);
    const tile = model.getTile({ q: 5, r: 5 })!;
    tile.owner = 0;
    const before = model.getFrontier(0).length;
    const toClaimCoord = model.getFrontier(0)[0].coord;
    model.claimTile(toClaimCoord, 0);
    const after = model.getFrontier(0).length;
    expect(after).toBeGreaterThanOrEqual(before);
  });
});

describe('GridModel — getTerritory / getTerritoryCount', () => {
  it('returns correct territory for a player', () => {
    const model = new GridModel(SMALL_CONFIG);
    const coords = [{ q: 2, r: 2 }, { q: 2, r: 3 }, { q: 3, r: 3 }];
    coords.forEach((c) => {
      const t = model.getTile(c)!;
      t.owner = 0;
    });
    const territory = model.getTerritory(0);
    expect(territory).toHaveLength(3);
  });

  it('getTerritoryCount matches getTerritory().length', () => {
    const model = new GridModel(SMALL_CONFIG);
    const t1 = model.getTile({ q: 1, r: 1 })!;
    const t2 = model.getTile({ q: 1, r: 2 })!;
    t1.owner = 0;
    t2.owner = 0;
    expect(model.getTerritoryCount(0)).toBe(model.getTerritory(0).length);
  });

  it('returns 0 for player with no tiles', () => {
    const model = new GridModel(SMALL_CONFIG);
    expect(model.getTerritoryCount(5)).toBe(0);
    expect(model.getTerritory(5)).toHaveLength(0);
  });
});

describe('GridModel — serialize / deserialize', () => {
  it('round-trips ownership data', () => {
    const model = new GridModel(SMALL_CONFIG);
    const t = model.getTile({ q: 3, r: 3 })!;
    t.owner = 1;

    const snapshot = model.serialize();
    const model2 = new GridModel(SMALL_CONFIG);
    model2.deserialize(snapshot);

    expect(model2.getTile({ q: 3, r: 3 })!.owner).toBe(1);
    expect(model2.getTile({ q: 0, r: 0 })!.owner).toBe(NEUTRAL_OWNER);
  });

  it('snapshot contains all tiles', () => {
    const model = new GridModel(SMALL_CONFIG);
    const snapshot = model.serialize();
    expect(Object.keys(snapshot)).toHaveLength(SMALL_CONFIG.cols * SMALL_CONFIG.rows);
  });
});

describe('GridModel — DEFAULT_GRID_CONFIG', () => {
  it('creates tiles for full default grid', () => {
    const model = new GridModel(DEFAULT_GRID_CONFIG);
    let count = 0;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for (const _t2 of model.allTiles()) count++;
    expect(count).toBe(DEFAULT_GRID_CONFIG.cols * DEFAULT_GRID_CONFIG.rows);
  });
});
