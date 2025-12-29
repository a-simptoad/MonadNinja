import Phaser from "phaser";

export default class MainScene extends Phaser.Scene {
    slash: Phaser.GameObjects.Graphics;
    points: { x: number; y: number }[] = [];
    fruits: Phaser.Physics.Arcade.Group;
    bombs: Phaser.Physics.Arcade.Group; 
    halves: Phaser.Physics.Arcade.Group;
    lives: Phaser.GameObjects.Group;
    emitter: Phaser.GameObjects.Particles.ParticleEmitter;

    score: number = 0;
    scoreText: Phaser.GameObjects.Text;

    rng: Phaser.Math.RandomDataGenerator;
    seed: string = "0x0";

    health: number = 3;

    constructor() {
        super("MainScene");
    }
    
    preload() {
        this.load.image("background", 'assets/background.png');
        this.load.image("bomb", 'assets/bomb.png');

        // Fruits
        this.load.image("apple", 'assets/apple.png');
        this.load.image("apple_1", 'assets/apple_half_1.png');
        this.load.image("apple_2", 'assets/apple_half_2.png');
        this.load.image("banana", 'assets/banana.png');
        this.load.image("banana_1", 'assets/banana_half_1.png');
        this.load.image("banana_2", 'assets/banana_half_2.png');
        this.load.image("coco", "assets/coconut.png");
        this.load.image("coco_1", "assets/coconut_half_1.png");
        this.load.image("coco_2", "assets/coconut_half_2.png");
        this.load.image("orange", 'assets/orange.png');
        this.load.image("orange_1", 'assets/orange_half_1.png');
        this.load.image("orange_2", 'assets/orange_half_2.png');
        this.load.image("melon", 'assets/watermelon.png');
        this.load.image("melon_1", 'assets/watermelon_half_1.png');
        this.load.image("melon_2", 'assets/watermelon_half_2.png');
        this.load.image("pineapple", 'assets/pineapple.png');
        this.load.image("pineapple_1", 'assets/pineapple_half_1.png');
        this.load.image("pineapple_2", 'assets/pineapple_half_2.png');
        
        this.load.image("particle", "assets/star.png");  // Need to get a particle image
        this.load.image("heart", "assets/heart.png");

        this.seed = this.game.registry.get('randomSeed');
        this.rng = new Phaser.Math.RandomDataGenerator([this.seed]);
    }

    create() {
        this.add.image(400, 300, 'background');
        
        this.fruits = this.physics.add.group();
        this.bombs = this.physics.add.group();
        this.halves = this.physics.add.group();
        this.lives = this.add.group();

        for (let i = 0; i < this.health; i++) {
            const heart = this.add.image(750 - i * 40, 50, 'heart').setScale(0.05);
            this.lives.add(heart);
        }

        this.scoreText = this.add.text(20, 20, 'SCORE: 0', {
            fontSize: '32px',
            color: '#ffffff',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4
        });

        this.emitter = this.add.particles(0, 0, 'particle', {
            speed: { min: -200, max: 200 },
            angle: { min: 0, max: 360 },
            scale: { start: 0.01, end: 0 },
            lifespan: 400,
            gravityY: 400,
            emitting: false
        });

        this.slash = this.add.graphics();
        this.spawnObject();
    }

    update() {
        const pointer = this.input.activePointer;

        if (pointer.isDown) {
            this.points.push({ x: pointer.x, y: pointer.y });
            if (this.points.length > 10) this.points.shift();

            this.slash.clear();
            for (let i = 0; i < this.points.length - 1; i++) {
                const size = i * 1.5;
                this.slash.lineStyle(size, 0xffffff, 1); 
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
        const bombChance = 0.4; 
        const isBomb = this.rng.frac() < bombChance;

        const x = this.rng.between(100, 700);

        if (isBomb) {
            const bomb = this.bombs.create(x, 650, 'bomb');
            bomb.setScale(0.2).setInteractive(this.input.makePixelPerfect());
            bomb.setVelocity(this.rng.between(-50, 50), -this.rng.between(600, 800));
            bomb.setAngularVelocity(this.rng.between(-200, 200));

            bomb.on('pointerover', () => {
                if (this.input.activePointer.isDown) {
                    this.handleBombHit();
                }
            });
        } else {
            const fruitTypes = ['apple', 'banana', 'coco', 'orange', 'melon', 'pineapple'];
            const fruitType = this.rng.pick(fruitTypes);
            const fruit = this.fruits.create(x, 650, fruitType);
            fruit.setScale(0.15).setInteractive(this.input.makePixelPerfect());
            fruit.setVelocity(this.rng.between(-100, 100), -this.rng.between(600, 800));
            fruit.setAngularVelocity(this.rng.between(-200, 200));

            fruit.on('pointerover', () => {
                if (this.input.activePointer.isDown) {
                    this.sliceFruit(fruit, fruitType);
                }
            });
        }

        this.time.delayedCall(1000, this.spawnObject, [], this);
    }

    sliceFruit(fruit: Phaser.Physics.Arcade.Sprite, type: string) {
        this.score += 10;
        this.scoreText.setText(`SCORE: ${this.score}`);

        const x = fruit.x;
        const y = fruit.y;
        this.emitter.explode(15, x, y); 

        const leftHalf = this.halves.create(x - 10, y, `${type}_1`).setScale(0.15);
        const rightHalf = this.halves.create(x + 10, y, `${type}_2`).setScale(0.15);

        leftHalf.setVelocity(-200, -200).setAngularVelocity(-300);
        rightHalf.setVelocity(200, -200).setAngularVelocity(300);

        fruit.destroy();
    }

    handleBombHit() {
        this.cameras.main.shake(500, 0.03);
        this.physics.pause();
        
        this.game.events.emit('gameover', {score: this.score, seed: this.seed});
    }

    checkBounds() {
        this.fruits.getChildren().forEach((fruit: any) => {
            if (fruit.y > 700) {
                this.health -= 1;
                fruit.destroy();
                this.lives.getChildren()[this.health].destroy();
                if(this.health == 0) {
                    this.handleBombHit();
                }
            }
        });

        [this.bombs, this.halves].forEach(group => {
            group.getChildren().forEach((obj: any) => {
                if (obj.y > 700) obj.destroy();
            });
        });
    }
}