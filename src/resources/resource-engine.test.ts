import { describe, it, expect } from 'vitest';
import { ResourceEngine } from './resource-engine';
import { DEFAULT_RESOURCE_CONFIG, type ResourceConfig } from './types';

const TEST_CONFIG: ResourceConfig = {
  incomePerTile: 2,
  tickIntervalMs: 1000,
  baseCost: 10,
  scaleFactor: 0.5,
  baseUpgradeCost: 20,
  upgradeMultiplier: 2,
  maxLevel: 5,
};

function makeEngine(playerIds = [0, 1]): ResourceEngine {
  return new ResourceEngine(TEST_CONFIG, playerIds);
}

describe('ResourceEngine — tick', () => {
  it('adds income per tile count', () => {
    const engine = makeEngine([0]);
    engine.tick(new Map([[0, 5]]));
    expect(engine.getResources(0).scrap).toBe(10); // 5 tiles × 2/s
  });

  it('adds 0 income for 0 tiles', () => {
    const engine = makeEngine([0]);
    engine.tick(new Map([[0, 0]]));
    expect(engine.getResources(0).scrap).toBe(0);
  });

  it('accumulates scrap over multiple ticks', () => {
    const engine = makeEngine([0]);
    const counts = new Map([[0, 3]]);
    engine.tick(counts);
    engine.tick(counts);
    engine.tick(counts);
    expect(engine.getResources(0).scrap).toBe(18); // 3×2×3
  });

  it('tracks totalEarned correctly', () => {
    const engine = makeEngine([0]);
    engine.tick(new Map([[0, 4]]));
    engine.tick(new Map([[0, 4]]));
    expect(engine.getResources(0).totalEarned).toBe(16);
  });

  it('ticks all players independently', () => {
    const engine = makeEngine([0, 1]);
    engine.tick(new Map([[0, 2], [1, 5]]));
    expect(engine.getResources(0).scrap).toBe(4);
    expect(engine.getResources(1).scrap).toBe(10);
  });

  it('uses 0 tiles when player missing from map', () => {
    const engine = makeEngine([0]);
    engine.tick(new Map()); // no entry for player 0
    expect(engine.getResources(0).scrap).toBe(0);
  });
});

describe('ResourceEngine — getClaimCost', () => {
  it('equals baseCost at 0 tiles', () => {
    const engine = makeEngine([0]);
    expect(engine.getClaimCost(0)).toBe(TEST_CONFIG.baseCost);
  });

  it('increases with tile count', () => {
    const engine = makeEngine([0]);
    const cost0 = engine.getClaimCost(0);
    const cost10 = engine.getClaimCost(10);
    const cost20 = engine.getClaimCost(20);
    expect(cost10).toBeGreaterThan(cost0);
    expect(cost20).toBeGreaterThan(cost10);
  });
});

describe('ResourceEngine — trySpendClaim', () => {
  it('deducts scrap and returns true when affordable', () => {
    const engine = makeEngine([0]);
    engine.tick(new Map([[0, 10]])); // earn 20 scrap
    const cost = engine.getClaimCost(0);
    const result = engine.trySpendClaim(0, 0);
    expect(result).toBe(true);
    expect(engine.getResources(0).scrap).toBe(20 - cost);
  });

  it('returns false and does not deduct when unaffordable', () => {
    const engine = makeEngine([0]);
    // scrap is 0, claim costs at least baseCost
    const result = engine.trySpendClaim(0, 0);
    expect(result).toBe(false);
    expect(engine.getResources(0).scrap).toBe(0);
  });

  it('tracks totalSpent after a successful claim', () => {
    const engine = makeEngine([0]);
    engine.tick(new Map([[0, 10]]));
    const cost = engine.getClaimCost(0);
    engine.trySpendClaim(0, 0);
    expect(engine.getResources(0).totalSpent).toBe(cost);
  });

  it('returns false for unknown player', () => {
    const engine = makeEngine([0]);
    expect(engine.trySpendClaim(99, 0)).toBe(false);
  });
});

describe('ResourceEngine — getUpgradeCost', () => {
  it('equals baseUpgradeCost at level 0', () => {
    const engine = makeEngine([0]);
    expect(engine.getUpgradeCost('attack', 0)).toBe(TEST_CONFIG.baseUpgradeCost);
  });

  it('escalates exponentially with level', () => {
    const engine = makeEngine([0]);
    const cost0 = engine.getUpgradeCost('attack', 0);
    const cost1 = engine.getUpgradeCost('attack', 1);
    const cost2 = engine.getUpgradeCost('attack', 2);
    expect(cost1).toBeGreaterThan(cost0);
    expect(cost2).toBeGreaterThan(cost1);
  });
});

describe('ResourceEngine — tryUpgrade', () => {
  it('increments attack level and deducts scrap', () => {
    const engine = makeEngine([0]);
    engine.tick(new Map([[0, 20]])); // earn 40 scrap — covers first upgrade (20)
    const result = engine.tryUpgrade(0, 'attack');
    expect(result).toBe(true);
    expect(engine.getResources(0).attackLevel).toBe(1);
    expect(engine.getResources(0).scrap).toBe(40 - TEST_CONFIG.baseUpgradeCost);
  });

  it('increments defense level independently', () => {
    const engine = makeEngine([0]);
    engine.tick(new Map([[0, 20]]));
    engine.tryUpgrade(0, 'defense');
    expect(engine.getResources(0).defenseLevel).toBe(1);
    expect(engine.getResources(0).attackLevel).toBe(0);
  });

  it('returns false when unaffordable', () => {
    const engine = makeEngine([0]);
    const result = engine.tryUpgrade(0, 'attack');
    expect(result).toBe(false);
    expect(engine.getResources(0).attackLevel).toBe(0);
  });

  it('returns false at maxLevel', () => {
    const engine = makeEngine([0]);
    // Force level to max
    const res = engine.getResources(0);
    res.attackLevel = TEST_CONFIG.maxLevel;
    res.scrap = 10000;
    const result = engine.tryUpgrade(0, 'attack');
    expect(result).toBe(false);
    expect(engine.getResources(0).attackLevel).toBe(TEST_CONFIG.maxLevel);
  });

  it('tracks totalSpent after upgrade', () => {
    const engine = makeEngine([0]);
    engine.tick(new Map([[0, 20]]));
    const cost = engine.getUpgradeCost('attack', 0);
    engine.tryUpgrade(0, 'attack');
    expect(engine.getResources(0).totalSpent).toBe(cost);
  });
});

describe('ResourceEngine — canAfford helpers', () => {
  it('canAffordClaim returns true when enough scrap', () => {
    const engine = makeEngine([0]);
    engine.tick(new Map([[0, 10]])); // 20 scrap, base cost is 10
    expect(engine.canAffordClaim(0, 0)).toBe(true);
  });

  it('canAffordClaim returns false when not enough scrap', () => {
    const engine = makeEngine([0]);
    expect(engine.canAffordClaim(0, 0)).toBe(false);
  });

  it('canAffordUpgrade returns false at maxLevel regardless of scrap', () => {
    const engine = makeEngine([0]);
    const res = engine.getResources(0);
    res.attackLevel = TEST_CONFIG.maxLevel;
    res.scrap = 99999;
    expect(engine.canAffordUpgrade(0, 'attack')).toBe(false);
  });
});

describe('ResourceEngine — serialize / deserialize', () => {
  it('round-trips all player state', () => {
    const engine = makeEngine([0, 1]);
    engine.tick(new Map([[0, 5], [1, 3]]));
    engine.tryUpgrade(0, 'attack');
    engine.tick(new Map([[0, 5], [1, 3]]));

    const snapshot = engine.serialize();
    const engine2 = new ResourceEngine(TEST_CONFIG, [0, 1]);
    engine2.deserialize(snapshot);

    expect(engine2.getResources(0).scrap).toBeCloseTo(engine.getResources(0).scrap);
    expect(engine2.getResources(0).attackLevel).toBe(engine.getResources(0).attackLevel);
    expect(engine2.getResources(1).scrap).toBeCloseTo(engine.getResources(1).scrap);
  });

  it('serialize returns a copy (not shared reference)', () => {
    const engine = makeEngine([0]);
    const snap1 = engine.serialize();
    engine.tick(new Map([[0, 10]]));
    const snap2 = engine.serialize();
    expect(snap1[0].scrap).not.toBe(snap2[0].scrap);
  });
});

describe('ResourceEngine — getIncomeRate', () => {
  it('is proportional to tile count', () => {
    const engine = makeEngine([0]);
    expect(engine.getIncomeRate(0)).toBe(0);
    expect(engine.getIncomeRate(5)).toBe(10);
    expect(engine.getIncomeRate(10)).toBe(20);
  });
});

describe('ResourceEngine — DEFAULT_RESOURCE_CONFIG', () => {
  it('constructs without errors', () => {
    const engine = new ResourceEngine(DEFAULT_RESOURCE_CONFIG, [0, 1, 2]);
    expect(engine.getResources(0).scrap).toBe(0);
  });
});
