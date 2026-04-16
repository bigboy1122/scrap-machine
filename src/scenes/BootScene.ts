import { Scene } from "phaser";

export class BootScene extends Scene {
  constructor() {
    super({ key: "BootScene" });
  }

  create(): void {
    const { width, height } = this.cameras.main;

    this.add
      .text(width / 2, height / 2 - 40, "SCRAP MACHINE", {
        fontSize: "48px",
        color: "#e0a030",
        fontFamily: "monospace",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height / 2 + 20, "Gamedev.js Jam 2026", {
        fontSize: "20px",
        color: "#888",
        fontFamily: "monospace",
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height / 2 + 70, "Loading world...", {
        fontSize: "14px",
        color: "#555",
        fontFamily: "monospace",
      })
      .setOrigin(0.5);

    this.time.delayedCall(1500, () => {
      this.scene.start("GridScene");
    });
  }
}
