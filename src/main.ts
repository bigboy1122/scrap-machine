import { AUTO, Game, Scale, type Types } from "phaser";
import { BootScene } from "./scenes/BootScene";
import { GridScene } from "./scenes/GridScene";

const config: Types.Core.GameConfig = {
  type: AUTO,
  width: 1280,
  height: 720,
  parent: "game",
  backgroundColor: "#1a1a1a",
  scale: {
    mode: Scale.FIT,
    autoCenter: Scale.CENTER_BOTH,
  },
  scene: [BootScene, GridScene],
};

new Game(config);
