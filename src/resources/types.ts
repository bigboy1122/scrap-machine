export interface ResourceConfig {
  readonly incomePerTile: number;     // scrap earned per owned tile per tick
  readonly tickIntervalMs: number;    // ms between income ticks
  readonly baseCost: number;          // base scrap cost to claim a tile
  readonly scaleFactor: number;       // how much claim cost rises per tile owned
  readonly baseUpgradeCost: number;   // cost of the first upgrade (level 0 → 1)
  readonly upgradeMultiplier: number; // each level costs this × more than the last
  readonly maxLevel: number;          // hard cap on attack/defense levels
}

export interface PlayerResources {
  scrap: number;
  attackLevel: number;
  defenseLevel: number;
  totalEarned: number;
  totalSpent: number;
}

export type UpgradeType = 'attack' | 'defense';

export const DEFAULT_RESOURCE_CONFIG: ResourceConfig = {
  incomePerTile: 2,
  tickIntervalMs: 1000,
  baseCost: 8,
  scaleFactor: 0.3,
  baseUpgradeCost: 25,
  upgradeMultiplier: 1.8,
  maxLevel: 10,
};
