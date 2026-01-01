import Phaser from "phaser";
import { gameConfig } from "./config";

let game: Phaser.Game | null = null;

export function startGame(seed: string) {
  // Always destroy old game when starting with a new seed
  if (game) {
    game.destroy(true);
    game = null;
  }

  game = new Phaser.Game(gameConfig);

  // IMPORTANT: start scene with seed
  game.scene.start("MainScene", { seed });
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
