import Phaser from "phaser";
import MainScene from "./scenes/MainScene";
import HowToPlayScene from "./scenes/HowToPlay";

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  backgroundColor: "#000000",
  parent: "phaser-game", // 👈 DOM container ID
  scene: [HowToPlayScene, MainScene],
  physics: {
    default: "arcade",
    arcade: {
      gravity: {x: 0, y: 600 },
      debug: false,
    },
  },
  scale:{
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  }
};
