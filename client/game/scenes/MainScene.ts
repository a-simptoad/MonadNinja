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

    constructor() {
        super("MainScene");
    }

    /** 🔑 Seed must come from scene restart data */
    init(data: { seed: string }) {
        this.seed = data.seed;
        console.log(this.seed, "received in MainScene init");
        this.rng = new Phaser.Math.RandomDataGenerator();
        // this.rng.init(this.seed);
        // console.log(this.rng, "RNG initialized in MainScene with seed");
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
        const MAX_TIMESCALE = 0.7;

        /** ✅ RNG is recreated per scene start */
        let s = this.seed.toString();
        this.rng.init(s);

        console.log("Seed:", this.seed);
        console.log("RNG test:", this.rng.frac(), this.rng.frac());

        this.add.image(400, 300, "background");

        this.fruits = this.physics.add.group();
        this.bombs = this.physics.add.group();
        this.halves = this.physics.add.group();
        this.lives = this.add.group();

        for (let i = 0; i < this.health; i++) {
            const heart = this.add.image(750 - i * 40, 50, "heart").setScale(0.05);
            this.lives.add(heart);
        }

        this.scoreText = this.add.text(20, 20, "SCORE: 0", {
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

        /** ✅ Controlled spawn loop */
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
            delay: 7000,
            loop: true,
            callback: () => {
                if (this.physics.world.timeScale > MAX_TIMESCALE) {
                    this.physics.world.timeScale -= 0.1;
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

        const isBomb = this.rng.frac() < 0.4;
        const x = this.rng.between(100, 700);

        if (isBomb) {
            const bomb = this.bombs.create(x, 650, "bomb");
            bomb.setScale(0.2).setInteractive();
            bomb.setVelocity(this.rng.between(-50, 50), -this.rng.between(600, 800));
            bomb.setAngularVelocity(this.rng.between(-200, 200));

            bomb.on("pointerover", () => {
                if (this.input.activePointer.isDown) this.handleBombHit();
            });
        } else {
            const fruitTypes = ["apple", "banana", "coco", "orange", "melon", "pineapple"];
            const type = this.rng.pick(fruitTypes);
            const fruit = this.fruits.create(x, 650, type);

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
        this.spawnTimer?.remove();
        this.physics.pause();

        this.game.events.emit("gameover", {
            score: this.score,
            seed: this.seed,
            multiplier: this.multiplier,
            difficulty: this.difficulty,
        });
    }

    checkBounds() {
        this.fruits.getChildren().forEach((fruit: any) => {
            if (fruit.y > 700) {
                this.health--;
                fruit.destroy();
                this.lives.getChildren()[this.health]?.destroy();

                if (this.health <= 0) this.handleBombHit();
            }
        });

        [this.bombs, this.halves].forEach(group => {
            group.getChildren().forEach((obj: any) => {
                if (obj.y > 700) obj.destroy();
            });
        });
    }
}
