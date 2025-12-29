import Phaser from "phaser";
import { gameConfig } from "./config";

let game: Phaser.Game | null = null;

export function startGame(seed) {
  if (!game) {
    game = new Phaser.Game(gameConfig);
    game.registry.set('randomSeed', seed);
  }
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
