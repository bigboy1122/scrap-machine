import type { PlayerResources, ResourceConfig, UpgradeType } from './types';

export type ResourceSnapshot = Record<number, PlayerResources>;

/** Pure resource logic — no Phaser dependency. Fully unit-testable. */
export class ResourceEngine {
  readonly config: ResourceConfig;
  private readonly players: Map<number, PlayerResources>;

  constructor(config: ResourceConfig, playerIds: number[]) {
    this.config = config;
    this.players = new Map(
      playerIds.map((id) => [
        id,
        { scrap: 0, attackLevel: 0, defenseLevel: 0, totalEarned: 0, totalSpent: 0 },
      ]),
    );
  }

  getResources(playerId: number): PlayerResources {
    const res = this.players.get(playerId);
    if (!res) throw new Error(`Unknown player id: ${playerId}`);
    return res;
  }

  /**
   * Advance one income tick. Adds scrap to each player based on their tile count.
   * @param tileCountByPlayer - Map of playerId → number of tiles owned
   */
  tick(tileCountByPlayer: Map<number, number>): void {
    for (const [playerId, res] of this.players) {
      const tiles = tileCountByPlayer.get(playerId) ?? 0;
      const income = this.getIncomeRate(tiles);
      res.scrap += income;
      res.totalEarned += income;
    }
  }

  getIncomeRate(tileCount: number): number {
    return tileCount * this.config.incomePerTile;
  }

  getClaimCost(currentTileCount: number): number {
    return this.config.baseCost + Math.floor(currentTileCount * this.config.scaleFactor);
  }

  /**
   * Attempt to spend scrap for a tile claim.
   * Returns true and deducts scrap if the player can afford it.
   */
  trySpendClaim(playerId: number, currentTileCount: number): boolean {
    const res = this.players.get(playerId);
    if (!res) return false;
    const cost = this.getClaimCost(currentTileCount);
    if (res.scrap < cost) return false;
    res.scrap -= cost;
    res.totalSpent += cost;
    return true;
  }

  getUpgradeCost(type: UpgradeType, currentLevel: number): number {
    return Math.round(
      this.config.baseUpgradeCost * Math.pow(this.config.upgradeMultiplier, currentLevel),
    );
  }

  /**
   * Attempt to upgrade attack or defense.
   * Returns true and deducts scrap if the player can afford it and is below maxLevel.
   */
  tryUpgrade(playerId: number, type: UpgradeType): boolean {
    const res = this.players.get(playerId);
    if (!res) return false;

    const currentLevel = type === 'attack' ? res.attackLevel : res.defenseLevel;
    if (currentLevel >= this.config.maxLevel) return false;

    const cost = this.getUpgradeCost(type, currentLevel);
    if (res.scrap < cost) return false;

    res.scrap -= cost;
    res.totalSpent += cost;
    if (type === 'attack') {
      res.attackLevel++;
    } else {
      res.defenseLevel++;
    }
    return true;
  }

  canAffordClaim(playerId: number, currentTileCount: number): boolean {
    const res = this.players.get(playerId);
    if (!res) return false;
    return res.scrap >= this.getClaimCost(currentTileCount);
  }

  canAffordUpgrade(playerId: number, type: UpgradeType): boolean {
    const res = this.players.get(playerId);
    if (!res) return false;
    const level = type === 'attack' ? res.attackLevel : res.defenseLevel;
    if (level >= this.config.maxLevel) return false;
    return res.scrap >= this.getUpgradeCost(type, level);
  }

  serialize(): ResourceSnapshot {
    const snapshot: ResourceSnapshot = {};
    for (const [id, res] of this.players) {
      snapshot[id] = { ...res };
    }
    return snapshot;
  }

  deserialize(snapshot: ResourceSnapshot): void {
    for (const [id, res] of Object.entries(snapshot)) {
      const existing = this.players.get(Number(id));
      if (existing) {
        Object.assign(existing, res);
      }
    }
  }
}
