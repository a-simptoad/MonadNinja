import Phaser from "phaser";

export default class HowToPlayScene extends Phaser.Scene {
  seed!: string;

  constructor() {
    super("HowToPlayScene");
  }

  init(data: { seed: string }) {
    this.seed = data.seed;
  }

  preload() {
    this.load.image("background", "assets/background.png");
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    this.add.image(width / 2, height / 2, "background").setDisplaySize(width, height);

    this.add.rectangle(0, 0, width, height, 0x000000, 0.6).setOrigin(0);

    this.add.text(width / 2, height / 2 - height / 3, "HOW TO PLAY", {
      fontSize: "48px",
      fontStyle: "bold",
      color: "#ffffff",
    }).setOrigin(0.5);

    const instructions = "Desktop: Click & Drag to Slice\nMobile: Swipe to Slice\n\nAvoid the Bombs! 💣\nMissing a fruit loses a life! ❤️\nP.S. You have 3. Have Fun!";
    this.add.text(width / 2, height / 2, instructions, {
      fontSize: "21px",
      align: "center",
      color: "#cccccc",
      lineSpacing: 10,
    }).setOrigin(0.5);

    const button = this.add.text(width / 2, height / 2 + height / 3, "GOT IT!", {
      fontSize: "32px",
      fontStyle: "bold",
      backgroundColor: "#228B22",
      padding: { x: 20, y: 10 },
      color: "#ffffff",
    })
    .setOrigin(0.5)
    .setInteractive({ useHandCursor: true });

    button.on("pointerover", () => button.setStyle({ backgroundColor: "#32CD32" })); // Lighter green
    button.on("pointerout", () => button.setStyle({ backgroundColor: "#228B22" }));

    button.on("pointerdown", () => {
      this.scene.start("MainScene", { seed: this.seed });
    });
  }
}