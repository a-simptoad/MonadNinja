import Phaser from "phaser";

export default class MainScene extends Phaser.Scene {
  constructor() {
    super("MainScene");
  }

  preload() {
  }

  create() {
    this.add.text(400, 300, "Hello Phaser!", {
      fontSize: "32px",
      color: "#ffffff",
    }).setOrigin(0.5);
  }
}
