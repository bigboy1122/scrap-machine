import type { Scene, GameObjects } from 'phaser';
import type { ResourceEngine } from './resource-engine';
import type { UpgradeType } from './types';

const PAD = 14;
const LINE_H = 22;

export class ResourceHUD {
  private readonly scene: Scene;
  private readonly engine: ResourceEngine;
  private readonly playerId: number;

  private scrapText!: GameObjects.Text;
  private incomeText!: GameObjects.Text;
  private atkText!: GameObjects.Text;
  private defText!: GameObjects.Text;
  private hintText!: GameObjects.Text;
  private cannotAffordText!: GameObjects.Text;
  private cannotAffordTimer = 0;

  private displayedScrap = 0;

  constructor(scene: Scene, engine: ResourceEngine, playerId: number) {
    this.scene = scene;
    this.engine = engine;
    this.playerId = playerId;
    this.build();
  }

  private build(): void {
    const style = (size: number, color: string): Record<string, string | number> => ({
      fontSize: `${size}px`,
      color,
      fontFamily: 'monospace',
    });

    const bg = this.scene.add.rectangle(0, 0, 200, 108, 0x111111, 0.75);
    bg.setOrigin(0, 0).setScrollFactor(0).setDepth(10).setPosition(10, 10);

    this.scrapText = this.scene.add
      .text(PAD, PAD + LINE_H * 0, '⚙ 0 scrap', style(14, '#f0ad4e'))
      .setScrollFactor(0)
      .setDepth(11);

    this.incomeText = this.scene.add
      .text(PAD, PAD + LINE_H * 1, '+0/s', style(12, '#aaaaaa'))
      .setScrollFactor(0)
      .setDepth(11);

    this.atkText = this.scene.add
      .text(PAD, PAD + LINE_H * 2, 'ATK: 0', style(12, '#e06c45'))
      .setScrollFactor(0)
      .setDepth(11);

    this.defText = this.scene.add
      .text(PAD + 80, PAD + LINE_H * 2, 'DEF: 0', style(12, '#4a90d9'))
      .setScrollFactor(0)
      .setDepth(11);

    this.hintText = this.scene.add
      .text(PAD, PAD + LINE_H * 3, '[A]tk  [D]ef', style(10, '#666666'))
      .setScrollFactor(0)
      .setDepth(11);

    this.cannotAffordText = this.scene.add
      .text(10, 125, 'Not enough scrap!', style(13, '#ff4444'))
      .setScrollFactor(0)
      .setDepth(11)
      .setAlpha(0);
  }

  onTick(tileCount: number): void {
    const res = this.engine.getResources(this.playerId);
    const income = this.engine.getIncomeRate(tileCount);

    this.displayedScrap = res.scrap;
    this.scrapText.setText(`⚙ ${Math.floor(res.scrap)} scrap`);
    this.incomeText.setText(`+${income}/s`);
    this.atkText.setText(`ATK: ${res.attackLevel}`);
    this.defText.setText(`DEF: ${res.defenseLevel}`);
    this.refreshUpgradeTints();
  }

  onUpgrade(type: UpgradeType): void {
    const res = this.engine.getResources(this.playerId);
    if (type === 'attack') {
      this.atkText.setText(`ATK: ${res.attackLevel}`);
    } else {
      this.defText.setText(`DEF: ${res.defenseLevel}`);
    }
    this.refreshUpgradeTints();
  }

  showCannotAfford(): void {
    this.cannotAffordText.setAlpha(1);
    this.cannotAffordTimer = 1800;
  }

  updateDelta(delta: number): void {
    if (this.cannotAffordTimer > 0) {
      this.cannotAffordTimer -= delta;
      if (this.cannotAffordTimer <= 0) {
        this.cannotAffordText.setAlpha(0);
        this.cannotAffordTimer = 0;
      }
    }
  }

  private refreshUpgradeTints(): void {
    const res = this.engine.getResources(this.playerId);
    const canAtk = this.engine.canAffordUpgrade(this.playerId, 'attack');
    const canDef = this.engine.canAffordUpgrade(this.playerId, 'defense');

    const atkAtMax = res.attackLevel >= this.engine.config.maxLevel;
    const defAtMax = res.defenseLevel >= this.engine.config.maxLevel;

    this.atkText.setColor(atkAtMax ? '#888' : canAtk ? '#ffcc44' : '#e06c45');
    this.defText.setColor(defAtMax ? '#888' : canDef ? '#66ccff' : '#4a90d9');
  }
}
