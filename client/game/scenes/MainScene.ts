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

    worldWidth! : number;
    worldHeight! : number;

    constructor() {
        super("MainScene");
    }

    init(data: { seed: string }) {
        this.seed = data.seed;
        console.log(this.seed, "received in MainScene init");
        this.rng = new Phaser.Math.RandomDataGenerator();
    }

    preload() {
        this.load.image("background", "assets/background.png");
        this.load.image("bomb", "assets/bomb.png");

        // Fruits
        this.load.image("apple", "assets/apple.png");
        this.load.image("apple_1", "assets/apple_half_1.png");
        this.load.image("apple_2", "assets/apple_half_2.png");

        this.load.image("banana", "assets/banana.png");
        this.load.image("banana_1", "assets/banana_half_1.png");
        this.load.image("banana_2", "assets/banana_half_2.png");

        this.load.image("coco", "assets/coconut.png");
        this.load.image("coco_1", "assets/coconut_half_1.png");
        this.load.image("coco_2", "assets/coconut_half_2.png");

        this.load.image("orange", "assets/orange.png");
        this.load.image("orange_1", "assets/orange_half_1.png");
        this.load.image("orange_2", "assets/orange_half_2.png");

        this.load.image("melon", "assets/watermelon.png");
        this.load.image("melon_1", "assets/watermelon_half_1.png");
        this.load.image("melon_2", "assets/watermelon_half_2.png");

        this.load.image("pineapple", "assets/pineapple.png");
        this.load.image("pineapple_1", "assets/pineapple_half_1.png");
        this.load.image("pineapple_2", "assets/pineapple_half_2.png");

        this.load.image("particle", "assets/star.png");
        this.load.image("heart", "assets/heart.png");
    }

    create() {
        let cam = this.cameras.main;
        this.worldWidth = cam.width;
        this.worldHeight = cam.height;

        let s = this.seed.toString();
        this.rng.init(s);

        console.log("Seed:", this.seed);
        console.log("RNG test:", this.rng.frac(), this.rng.frac());

        this.add.image(this.worldWidth / 2, this.worldHeight / 2, "background");

        this.fruits = this.physics.add.group();
        this.bombs = this.physics.add.group();
        this.halves = this.physics.add.group();
        this.lives = this.add.group();

        for (let i = 0; i < this.health; i++) {
            const heart = this.add.image(this.worldWidth - this.worldWidth / 10 - i * 40, this.worldHeight / 10, "heart").setScale(0.05);
            this.lives.add(heart);
        }

        this.scoreText = this.add.text(this.worldWidth / 15, this.worldHeight / 15, "SCORE: 0", {
            fontSize: "32px",
            color: "#ffffff",
            fontStyle: "bold",
            stroke: "#000000",
            strokeThickness: 4,
        });

        this.emitter = this.add.particles(0, 0, "particle", {
            speed: { min: -200, max: 200 },
            angle: { min: 0, max: 360 },
            scale: { start: 0.01, end: 0 },
            lifespan: 400,
            gravityY: 400,
            emitting: false,
        });

        this.slash = this.add.graphics();

        this.spawnTimer = this.time.addEvent({
            delay: 1000,
            callback: this.spawnObject,
            callbackScope: this,
            loop: true,
        });

        this.game.events.emit("log", {
            type: "event",
            message: "Game Started",
            timestamp: new Date().toLocaleTimeString(),
        });

        this.physics.world.timeScale = 2;

        this.time.delayedCall(5000, () => {
            this.physics.world.timeScale = 1;
        });

        this.time.addEvent({
            delay: 15000,
            loop: true,
            callback: () => {
                if(this.scene.isActive() === false) return;
                if (this.difficulty < 100) {
                    this.physics.world.timeScale -= 0.14;
                    this.difficulty += 25;

                    this.game.events.emit("difficulty", {
                        timestamp: new Date().toLocaleTimeString(),
                        message: `Difficulty Increased to ${this.difficulty}%`,
                        type: "event",
                    });
                }
                this.multiplier += 0.1;
            },
        });
    }

    update() {
        const pointer = this.input.activePointer;

        if (pointer.isDown) {
            this.points.push({ x: pointer.x, y: pointer.y });
            if (this.points.length > 10) this.points.shift();

            this.slash.clear();
            for (let i = 0; i < this.points.length - 1; i++) {
                this.slash.lineStyle(i * 1.5, 0xffffff, 1);
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
        if (!this.scene.isActive()) return;

        const BOMB_CHANCE = 0.3;
        const isBomb = this.rng.frac() < BOMB_CHANCE; // 30% chance for a bomb to spawn
        const x = this.rng.between(this.worldWidth / 10, this.worldWidth - this.worldWidth / 10);

        if (isBomb) {
            const bomb = this.bombs.create(x, this.worldHeight + this.worldHeight / 10, "bomb");
            bomb.setScale(0.2).setInteractive();
            bomb.setVelocity(this.rng.between(-50, 50), -this.rng.between(600, 800));
            bomb.setAngularVelocity(this.rng.between(-200, 200));

            bomb.on("pointerover", () => {
                if (this.input.activePointer.isDown) this.handleBombHit();
            });
        } else {
            const fruitTypes = ["apple", "banana", "coco", "orange", "melon", "pineapple"];
            const type = this.rng.pick(fruitTypes);
            const fruit = this.fruits.create(x, this.worldHeight + this.worldHeight / 10, type);

            fruit.setScale(0.15).setInteractive();
            fruit.setVelocity(this.rng.between(-100, 100), -this.rng.between(600, 800));
            fruit.setAngularVelocity(this.rng.between(-200, 200));

            fruit.on("pointerover", () => {
                if (this.input.activePointer.isDown) this.sliceFruit(fruit, type);
            });
        }
    }

    sliceFruit(fruit: Phaser.Physics.Arcade.Sprite, type: string) {
        this.score += 10;
        this.scoreText.setText(`SCORE: ${this.score}`);

        this.emitter.explode(15, fruit.x, fruit.y);

        this.halves.create(fruit.x - 10, fruit.y, `${type}_1`).setScale(0.15).setVelocity(-200, -200);
        this.halves.create(fruit.x + 10, fruit.y, `${type}_2`).setScale(0.15).setVelocity(200, -200);

        fruit.destroy();
    }

    handleBombHit() {
        this.cameras.main.shake(500, 0.03);
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
        this.fruits.getChildren().forEach((fruit: any) => {
            if (fruit.y > this.worldHeight + this.worldHeight / 8) {
                this.health--;
                fruit.destroy();
                this.lives.getChildren()[this.health]?.destroy();

                if (this.health <= 0) this.handleBombHit();
            }
        });

        [this.bombs, this.halves].forEach(group => {
            group.getChildren().forEach((obj: any) => {
                if (obj.y > this.worldHeight + this.worldHeight / 8) obj.destroy();
            });
        });
    }
}
