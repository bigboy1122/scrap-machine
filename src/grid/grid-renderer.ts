import type { GameObjects, Scene } from 'phaser';
import { hexToPixel, hexVertices } from './hex-math';
import { NEUTRAL_OWNER, COLORS, PLAYER_COLORS, type GridConfig, type HexCoord, type TileState } from './types';
import type { GridModel } from './grid-model';

const INNER_RADIUS_FACTOR = 0.92; // slight gap between tiles

function darkenColor(color: number, factor: number): number {
  const r = Math.floor(((color >> 16) & 0xff) * factor);
  const g = Math.floor(((color >> 8) & 0xff) * factor);
  const b = Math.floor((color & 0xff) * factor);
  return (r << 16) | (g << 8) | b;
}

function getPlayerColor(playerId: number): number {
  return PLAYER_COLORS[playerId % PLAYER_COLORS.length];
}

export class GridRenderer {
  private readonly bgGraphics: GameObjects.Graphics;
  private readonly hoverGraphics: GameObjects.Graphics;
  private readonly config: GridConfig;
  private readonly offsetX: number;
  private readonly offsetY: number;
  private dirty = true;
  private lastHoverKey: string | null = null;

  constructor(scene: Scene, model: GridModel, offsetX: number, offsetY: number) {
    this.config = model.config;
    this.offsetX = offsetX;
    this.offsetY = offsetY;

    this.bgGraphics = scene.add.graphics();
    this.hoverGraphics = scene.add.graphics();
    this.hoverGraphics.setDepth(1);

    this.renderAll(model);
  }

  markDirty(): void {
    this.dirty = true;
  }

  update(model: GridModel, hoveredCoord: HexCoord | null, localPlayerId: number): void {
    if (this.dirty) {
      this.renderAll(model);
      this.dirty = false;
    }

    const hoverKey = hoveredCoord ? `${hoveredCoord.q},${hoveredCoord.r}` : null;
    if (hoverKey !== this.lastHoverKey) {
      this.renderHover(model, hoveredCoord, localPlayerId);
      this.lastHoverKey = hoverKey;
    }
  }

  private renderAll(model: GridModel): void {
    this.bgGraphics.clear();

    for (const tile of model.allTiles()) {
      this.drawTile(this.bgGraphics, tile, false, false, 0);
    }
  }

  private renderHover(
    model: GridModel,
    coord: HexCoord | null,
    localPlayerId: number,
  ): void {
    this.hoverGraphics.clear();
    if (!coord) return;

    const tile = model.getTile(coord);
    if (!tile) return;

    const isValidTarget =
      tile.owner === NEUTRAL_OWNER && model.isFrontierTile(coord, localPlayerId);

    this.drawTile(this.hoverGraphics, tile, true, isValidTarget, localPlayerId);
  }

  private drawTile(
    g: GameObjects.Graphics,
    tile: TileState,
    isHover: boolean,
    isValidTarget: boolean,
    localPlayerId: number,
  ): void {
    const { x: px, y: py } = hexToPixel(tile.coord, this.config.tileRadius);
    const cx = px + this.offsetX;
    const cy = py + this.offsetY;
    const innerRadius = this.config.tileRadius * INNER_RADIUS_FACTOR;

    let fillColor: number;
    let strokeColor: number;
    let strokeWidth = COLORS.STROKE_WIDTH;

    if (tile.owner === NEUTRAL_OWNER) {
      if (isHover && isValidTarget) {
        fillColor = COLORS.HOVER_VALID_FILL;
        strokeColor = (getPlayerColor(localPlayerId) & 0xfefefe) >> 1; // 50% alpha approximation via darkening
        strokeWidth = 2;
      } else if (isHover) {
        fillColor = COLORS.HOVER_INVALID_FILL;
        strokeColor = COLORS.NEUTRAL_STROKE;
      } else {
        fillColor = COLORS.NEUTRAL_FILL;
        strokeColor = COLORS.NEUTRAL_STROKE;
      }
    } else {
      const playerColor = getPlayerColor(tile.owner);
      fillColor = isHover ? darkenColor(playerColor, 0.85) : playerColor;
      strokeColor = darkenColor(playerColor, 0.6);
      strokeWidth = 1.5;
    }

    const verts = hexVertices(cx, cy, innerRadius);

    g.fillStyle(fillColor, 1);
    g.lineStyle(strokeWidth, strokeColor, 1);
    g.beginPath();
    g.moveTo(verts[0].x, verts[0].y);
    for (let i = 1; i < 6; i++) {
      g.lineTo(verts[i].x, verts[i].y);
    }
    g.closePath();
    g.fillPath();
    g.strokePath();
  }
}
