import Phaser from "phaser";
import { gameConfig } from "./config";

let game: Phaser.Game | null = null;

export function startGame() {
  if (!game) {
    game = new Phaser.Game(gameConfig);
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
