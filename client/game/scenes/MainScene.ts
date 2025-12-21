import Phaser from "phaser";

export default class MainScene extends Phaser.Scene {
  constructor() {
    super("MainScene");
  }

  preload() {
    this.load.image("background", 'assets/background.png');
  }

  create() {
    this.add.image(400, 300, 'background');
    this.add.text(400, 300, "Hello Phaser!", {
      fontSize: "32px",
      color: "#000000",
    }).setOrigin(0.5);
  }
}