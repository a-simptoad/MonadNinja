import Phaser from "phaser";
import MainScene from "./scenes/MainScene";

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: "#000000",
  parent: "phaser-game", // 👈 DOM container ID
  scene: [MainScene],
  physics: {
    default: "arcade",
    arcade: {
      debug: import.meta.env.DEV,
    },
  },
};
