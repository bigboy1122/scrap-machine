import type { Scene, Input } from 'phaser';
import { pixelToHex, isValidCoord } from './hex-math';
import type { GridConfig, HexCoord } from './types';
import { NEUTRAL_OWNER } from './types';
import type { GridModel } from './grid-model';
import type { ResourceEngine } from '../resources/resource-engine';
import { logger } from '../utils/logger';

const log = logger;

export interface InputHandlerCallbacks {
  onClaim(coord: HexCoord): void;
  onHoverChange(coord: HexCoord | null): void;
  onCannotAfford(): void;
}

export class InputHandler {
  private readonly config: GridConfig;
  private readonly offsetX: number;
  private readonly offsetY: number;
  private hoveredCoord: HexCoord | null = null;

  constructor(
    scene: Scene,
    config: GridConfig,
    offsetX: number,
    offsetY: number,
    model: GridModel,
    resourceEngine: ResourceEngine,
    localPlayerId: number,
    callbacks: InputHandlerCallbacks,
  ) {
    this.config = config;
    this.offsetX = offsetX;
    this.offsetY = offsetY;

    scene.input.on('pointermove', (pointer: Input.Pointer) => {
      const coord = this.worldToHex(pointer.worldX, pointer.worldY);
      const valid = coord !== null && isValidCoord(coord, this.config);
      const next = valid ? coord : null;

      const changed =
        next?.q !== this.hoveredCoord?.q || next?.r !== this.hoveredCoord?.r;
      if (changed) {
        this.hoveredCoord = next;
        callbacks.onHoverChange(next);
      }
    });

    scene.input.on('pointerdown', (pointer: Input.Pointer) => {
      if (pointer.rightButtonDown()) return; // right click = camera pan
      const coord = this.worldToHex(pointer.worldX, pointer.worldY);
      if (!coord || !isValidCoord(coord, this.config)) return;

      const tile = model.getTile(coord);
      if (!tile || tile.owner !== NEUTRAL_OWNER) return;
      if (!model.isFrontierTile(coord, localPlayerId)) return;

      const tileCount = model.getTerritoryCount(localPlayerId);
      const canAfford = resourceEngine.trySpendClaim(localPlayerId, tileCount);
      if (!canAfford) {
        log.info('Cannot afford tile claim', {
          playerId: localPlayerId,
          tileCount,
          cost: resourceEngine.getClaimCost(tileCount),
          scrap: resourceEngine.getResources(localPlayerId).scrap,
        });
        callbacks.onCannotAfford();
        return;
      }

      log.info('Tile claimed', { playerId: localPlayerId, q: coord.q, r: coord.r });
      callbacks.onClaim(coord);
    });
  }

  getHoveredCoord(): HexCoord | null {
    return this.hoveredCoord;
  }

  private worldToHex(worldX: number, worldY: number): HexCoord | null {
    const localX = worldX - this.offsetX;
    const localY = worldY - this.offsetY;
    return pixelToHex(localX, localY, this.config.tileRadius);
  }
}
