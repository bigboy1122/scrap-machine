import { Scene, Input } from 'phaser';
import { GridModel, GridRenderer, InputHandler, calculateSpawnPositions, getSpawnCluster, hexToPixel, DEFAULT_GRID_CONFIG } from '../grid';
import { ResourceEngine, ResourceHUD, createTickEngine, DEFAULT_RESOURCE_CONFIG } from '../resources';
import type { HexCoord } from '../grid';
import type { TickEngine } from '../resources/tick-engine';
import { logger } from '../utils/logger';

const log = logger;

const LOCAL_PLAYER = 0;
const AI_PLAYER_COUNT = 2; // 1 local + 2 AI for demo
const TOTAL_PLAYERS = 1 + AI_PLAYER_COUNT;
const AI_TICK_MS = 1400; // AI claims a tile every 1.4 seconds

export class GridScene extends Scene {
  private gridModel!: GridModel;
  private gridRenderer!: GridRenderer;
  private resourceEngine!: ResourceEngine;
  private resourceHud!: ResourceHUD;
  private tickEngine!: TickEngine;

  private gridOffsetX = 0;
  private gridOffsetY = 0;
  private hoveredCoord: HexCoord | null = null;

  private aiTimers: Map<number, number> = new Map();
  private cameraDragStartX = 0;
  private cameraDragStartY = 0;
  private isDragging = false;

  constructor() {
    super({ key: 'GridScene' });
  }

  create(): void {
    log.info('GridScene starting', { players: TOTAL_PLAYERS });

    this.gridModel = new GridModel(DEFAULT_GRID_CONFIG);

    // Center grid in the world
    const gridPixelW = DEFAULT_GRID_CONFIG.cols * DEFAULT_GRID_CONFIG.tileRadius * 1.5;
    const gridPixelH =
      DEFAULT_GRID_CONFIG.rows * DEFAULT_GRID_CONFIG.tileRadius * Math.sqrt(3);
    const { width, height } = this.cameras.main;
    this.gridOffsetX = (width - gridPixelW) / 2;
    this.gridOffsetY = (height - gridPixelH) / 2;

    this.spawnPlayers();

    const playerIds = Array.from({ length: TOTAL_PLAYERS }, (_, i) => i);
    this.resourceEngine = new ResourceEngine(DEFAULT_RESOURCE_CONFIG, playerIds);

    this.gridRenderer = new GridRenderer(
      this,
      this.gridModel,
      this.gridOffsetX,
      this.gridOffsetY,
    );

    this.resourceHud = new ResourceHUD(this, this.resourceEngine, LOCAL_PLAYER);

    this.setupInput();
    this.setupResourceTick();
    this.setupAI();
    this.setupCamera();
    this.setupKeyboard();

    // Initial HUD render
    this.resourceHud.onTick(this.gridModel.getTerritoryCount(LOCAL_PLAYER));

    log.info('GridScene ready');
  }

  private spawnPlayers(): void {
    const positions = calculateSpawnPositions(this.gridModel.config, TOTAL_PLAYERS);

    positions.forEach((center, playerId) => {
      const cluster = getSpawnCluster(center, this.gridModel.config);
      cluster.forEach((coord) => {
        // Use forceSetOwner to bypass frontier check during initialization
        this.gridModel.forceSetOwner(coord, playerId);
      });
      log.debug('Player spawned', { playerId, center });
    });
  }

  private setupInput(): void {
    new InputHandler(
      this,
      this.gridModel.config,
      this.gridOffsetX,
      this.gridOffsetY,
      this.gridModel,
      this.resourceEngine,
      LOCAL_PLAYER,
      {
        onClaim: (coord) => {
          const claimed = this.gridModel.claimTile(coord, LOCAL_PLAYER);
          if (claimed) {
            this.gridRenderer.markDirty();
          }
        },
        onHoverChange: (coord) => {
          this.hoveredCoord = coord;
        },
        onCannotAfford: () => {
          this.resourceHud.showCannotAfford();
        },
      },
    );
  }

  private setupResourceTick(): void {
    this.tickEngine = createTickEngine(
      DEFAULT_RESOURCE_CONFIG.tickIntervalMs,
      () => {
        const counts = new Map<number, number>();
        for (let i = 0; i < TOTAL_PLAYERS; i++) {
          counts.set(i, this.gridModel.getTerritoryCount(i));
        }
        this.resourceEngine.tick(counts);
        this.resourceHud.onTick(counts.get(LOCAL_PLAYER) ?? 0);
      },
    );
    this.tickEngine.start();
  }

  private setupAI(): void {
    for (let i = 1; i < TOTAL_PLAYERS; i++) {
      this.aiTimers.set(i, AI_TICK_MS + Math.random() * 500);
    }
  }

  private setupCamera(): void {
    this.cameras.main.setBounds(
      -100,
      -100,
      this.scale.width + 200,
      this.scale.height + 200,
    );

    // Center camera on local player's territory
    const playerTiles = this.gridModel.getTerritory(LOCAL_PLAYER);
    if (playerTiles.length > 0) {
      const centerTile = playerTiles[Math.floor(playerTiles.length / 2)];
      const { x, y } = hexToPixel(centerTile.coord, DEFAULT_GRID_CONFIG.tileRadius);
      this.cameras.main.centerOn(x + this.gridOffsetX, y + this.gridOffsetY);
    }

    // Right-click drag to pan
    this.input.on('pointerdown', (pointer: Input.Pointer) => {
      if (pointer.rightButtonDown()) {
        this.isDragging = true;
        this.cameraDragStartX = pointer.x;
        this.cameraDragStartY = pointer.y;
      }
    });

    this.input.on('pointermove', (pointer: Input.Pointer) => {
      if (this.isDragging && pointer.rightButtonDown()) {
        const dx = this.cameraDragStartX - pointer.x;
        const dy = this.cameraDragStartY - pointer.y;
        this.cameras.main.scrollX += dx;
        this.cameras.main.scrollY += dy;
        this.cameraDragStartX = pointer.x;
        this.cameraDragStartY = pointer.y;
      }
    });

    this.input.on('pointerup', () => {
      this.isDragging = false;
    });
  }

  private setupKeyboard(): void {
    const KC = Input.Keyboard.KeyCodes;
    const keys = this.input.keyboard!.addKeys({
      up: KC.UP,
      down: KC.DOWN,
      left: KC.LEFT,
      right: KC.RIGHT,
      w: KC.W,
      s: KC.S,
      a: KC.A,
      d: KC.D,
      atkUpgrade: KC.ONE,
      defUpgrade: KC.TWO,
    }) as Record<string, Input.Keyboard.Key>;

    // upgrade keys
    keys.atkUpgrade.on('down', () => {
      if (this.resourceEngine.tryUpgrade(LOCAL_PLAYER, 'attack')) {
        log.info('Attack upgraded', {
          level: this.resourceEngine.getResources(LOCAL_PLAYER).attackLevel,
        });
        this.resourceHud.onUpgrade('attack');
      } else {
        this.resourceHud.showCannotAfford();
      }
    });

    keys.defUpgrade.on('down', () => {
      if (this.resourceEngine.tryUpgrade(LOCAL_PLAYER, 'defense')) {
        log.info('Defense upgraded', {
          level: this.resourceEngine.getResources(LOCAL_PLAYER).defenseLevel,
        });
        this.resourceHud.onUpgrade('defense');
      } else {
        this.resourceHud.showCannotAfford();
      }
    });

    this.events.on('update', () => {
      const speed = 4;
      const cam = this.cameras.main;
      if (keys.up?.isDown || keys.w?.isDown) cam.scrollY -= speed;
      if (keys.down?.isDown || keys.s?.isDown) cam.scrollY += speed;
      if (keys.left?.isDown || keys.a?.isDown && !keys.atkUpgrade?.isDown) cam.scrollX -= speed;
      if (keys.right?.isDown || keys.d?.isDown && !keys.defUpgrade?.isDown) cam.scrollX += speed;
    });
  }

  update(_time: number, delta: number): void {
    this.gridRenderer.update(this.gridModel, this.hoveredCoord, LOCAL_PLAYER);
    this.resourceHud.updateDelta(delta);
    this.tickAI(delta);
  }

  private tickAI(delta: number): void {
    for (const [playerId, timer] of this.aiTimers) {
      const newTimer = timer - delta;
      if (newTimer <= 0) {
        this.doAIMove(playerId);
        this.aiTimers.set(playerId, AI_TICK_MS + Math.random() * 600);
      } else {
        this.aiTimers.set(playerId, newTimer);
      }
    }
  }

  private doAIMove(playerId: number): void {
    const frontier = this.gridModel.getFrontier(playerId);
    if (frontier.length === 0) return;

    const target = frontier[Math.floor(Math.random() * frontier.length)];
    const tileCount = this.gridModel.getTerritoryCount(playerId);

    if (this.resourceEngine.trySpendClaim(playerId, tileCount)) {
      const claimed = this.gridModel.claimTile(target.coord, playerId);
      if (claimed) {
        this.gridRenderer.markDirty();
        log.debug('AI claimed tile', { playerId, q: target.coord.q, r: target.coord.r });
      }
    }
  }

  shutdown(): void {
    this.tickEngine?.stop();
    log.info('GridScene shutdown');
  }
}
