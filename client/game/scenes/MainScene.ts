import Phaser from "phaser";

export default class MainScene extends Phaser.Scene {
  slash!: Phaser.GameObjects.Graphics;
  points: { x: number; y: number }[] = [];

  fruits!: Phaser.Physics.Arcade.Group;
  bombs!: Phaser.Physics.Arcade.Group;
  halves!: Phaser.Physics.Arcade.Group;
  lives!: Phaser.GameObjects.Group;

  emitter!: Phaser.GameObjects.Particles.ParticleEmitter;
  scoreText!: Phaser.GameObjects.Text;

  rng!: Phaser.Math.RandomDataGenerator;
  seed!: string;

  score = 0;
  multiplier = 1.0;
  difficulty = 0;
  health = 3;

  spawnTimer?: Phaser.Time.TimerEvent;

  worldWidth!: number;
  worldHeight!: number;

  constructor() {
    super("MainScene");
  }

  init(data: { seed: string }) {
    this.seed = data.seed;
    this.rng = new Phaser.Math.RandomDataGenerator();
    this.rng.init(this.seed);
  }

  preload() {
    this.load.image("background", "assets/background.png");
    this.load.image("bomb", "assets/bomb.png");

    const fruits = ["apple", "banana", "coco", "orange", "melon", "pineapple"];
    fruits.forEach(f => {
      this.load.image(f, `assets/${f}.png`);
      this.load.image(`${f}_1`, `assets/${f}_half_1.png`);
      this.load.image(`${f}_2`, `assets/${f}_half_2.png`);
    });

    this.load.image("particle", "assets/star.png");
    this.load.image("heart", "assets/heart.png");
  }

  create() {
    const cam = this.cameras.main;
    this.worldWidth = cam.width;
    this.worldHeight = cam.height;

    this.add
      .image(this.worldWidth / 2, this.worldHeight / 2, "background")
      .setDisplaySize(this.worldWidth, this.worldHeight);

    this.fruits = this.physics.add.group();
    this.bombs = this.physics.add.group();
    this.halves = this.physics.add.group();
    this.lives = this.add.group();

    this.scoreText = this.add.text(
      this.worldWidth * 0.03,
      this.worldHeight * 0.03,
      "SCORE: 0",
      {
        fontSize: `${this.worldWidth * 0.04}px`,
        color: "#ffffff",
        fontStyle: "bold",
        stroke: "#000",
        strokeThickness: 4,
      }
    );

    const heartSize = this.worldWidth * 0.04;
    for (let i = 0; i < this.health; i++) {
      const heart = this.add
        .image(
          this.worldWidth - heartSize * (i + 1.5),
          heartSize * 1.2,
          "heart"
        )
        .setScale(heartSize / 1000 * 2); ;

      this.lives.add(heart);
    }

    this.emitter = this.add.particles(0, 0, "particle", {
      speed: { min: -300, max: 300 },
      scale: { start: 0.008, end: 0 },
      lifespan: 500,
      gravityY: this.worldHeight,
      emitting: false,
    });

    this.slash = this.add.graphics();

    this.spawnTimer = this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: this.spawnObject,
      callbackScope: this,
    });

    /** Difficulty scaling */   
    this.time.addEvent({
      delay: 15000,
      loop: true,
      callback: () => {
        if (!this.scene.isActive()) return;

        this.multiplier += 0.1;
        this.difficulty = Math.min(this.difficulty + 25, 100);
        this.physics.world.timeScale = Math.max(
          0.6,
          this.physics.world.timeScale - 0.1
        );
      },
    });
  }

  update() {
    const pointer = this.input.activePointer;

    if (pointer.isDown) {
      this.points.push({ x: pointer.x, y: pointer.y });
      if (this.points.length > 12) this.points.shift();

      this.slash.clear();
      for (let i = 0; i < this.points.length - 1; i++) {
        this.slash.lineStyle(2, 0xffffff, 1);
        this.slash.beginPath();
        this.slash.moveTo(this.points[i].x, this.points[i].y);
        this.slash.lineTo(this.points[i + 1].x, this.points[i + 1].y);
        this.slash.strokePath();
      }
    } else {
      this.points = [];
      this.slash.clear();
    }

    this.checkBounds();
  }

  spawnObject() {
    const marginX = this.worldWidth * 0.1;
    const spawnY = this.worldHeight + 50;

    const x = this.rng.between(marginX, this.worldWidth - marginX);
    const isBomb = this.rng.frac() < 0.4;

    const vx = this.rng.between(
      -this.worldWidth * 0.15,
      this.worldWidth * 0.15
    );
    const vy = -this.worldHeight * this.rng.realInRange(1.1, 1.6); 

    if (isBomb) {
      const bomb = this.bombs.create(x, spawnY, "bomb");
      bomb
        .setScale(this.worldWidth * 0.00025)
        .setVelocity(vx, vy)
        .setAngularVelocity(this.rng.between(-300, 300))
        .setInteractive(this.input.makePixelPerfect());

      bomb.on("pointerover", () => {
        if (this.input.activePointer.isDown) this.handleBombHit();
      });
    } else {
      const types = ["apple", "banana", "coco", "orange", "melon", "pineapple"];
      const type = this.rng.pick(types);
      const fruit = this.fruits.create(x, spawnY, type);

      fruit
        .setScale(this.worldWidth * 0.00023)
        .setVelocity(vx, vy)
        .setAngularVelocity(this.rng.between(-300, 300))
        .setInteractive(this.input.makePixelPerfect());

      fruit.on("pointerover", () => {
        if (this.input.activePointer.isDown) this.sliceFruit(fruit, type);
      });
    }
  }

  sliceFruit(fruit: Phaser.Physics.Arcade.Sprite, type: string) {
    this.score += Math.floor(10 * this.multiplier);
    this.scoreText.setText(`SCORE: ${this.score}`);

    this.emitter.explode(20, fruit.x, fruit.y);

    const offset = this.worldWidth * 0.015;
    this.halves.create(fruit.x - offset, fruit.y, `${type}_1`)
      .setScale(fruit.scale)
      .setVelocity(-200, -200);

    this.halves.create(fruit.x + offset, fruit.y, `${type}_2`)
      .setScale(fruit.scale)
      .setVelocity(200, -200);

    fruit.destroy();
  }

  handleBombHit() {
    this.cameras.main.shake(400, 0.03);
    this.spawnTimer?.remove();
    this.physics.pause();

    this.game.events.emit("gameover", {
      score: this.score,
      seed: this.seed,
      multiplier: this.multiplier,
      difficulty: this.difficulty,
    });

    this.scene.pause();
  }

  checkBounds() {
    const limit = this.worldHeight + 100;

    this.fruits.getChildren().forEach((fruit: any) => {
      if (fruit.y > limit) {
        fruit.destroy();
        this.health--;
        this.lives.getChildren()[this.health]?.destroy();
        if (this.health <= 0) this.handleBombHit();
      }
    });

    [this.bombs, this.halves].forEach(group => {
      group.getChildren().forEach((obj: any) => {
        if (obj.y > limit) obj.destroy();
      });
    });
  }
}
