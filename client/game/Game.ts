import Phaser from "phaser";
import { gameConfig } from "./config";

let game: Phaser.Game | null = null;

export function startGame(seed: string) {
  if (game) {
    game.destroy(true);
    game = null;
  }

  game = new Phaser.Game(gameConfig);
  game.scene.start("HowToPlayScene", { seed });
}

export function getGameInstance(): Phaser.Game | null {
  return game;
}

export function destroyGame() {
  if (game) {
    game.destroy(true);
    game = null;
  }
}
