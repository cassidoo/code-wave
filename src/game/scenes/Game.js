import { Scene } from "phaser";

export class Game extends Scene {
	constructor() {
		super("Game");
	}

	init(data) {
		this.currentLevel = data.level || 1; // change this for testing other levels

		this.words = [
			"AI",
			"GIT",
			"CODE",
			"MERGE",
			"COMMIT",
			"BRANCH",
			"GITHUB",
			"PROGRAM",
			"COPILOT",
			"DEVELOPER",
		];
		this.currentWord = this.words[this.currentLevel - 1];

		// Game state
		this.collectedLetters = [];
		this.hasAllLetters = false;
		this.isInWater = false;
		this.isInBoat = false;

		this.spawnPoint = { x: 0, y: 0 };
	}

	create() {
		this.map = this.make.tilemap({ key: `level${this.currentLevel}` });
		const tileset = this.map.addTilesetImage("sprites", "tiles");

		this.groundLayer = this.map.createLayer("Ground", tileset, 0, 0);
		this.groundLayer.setDepth(0);

		this.waterLayer = this.map.createLayer("Water", tileset, 0, 0);
		this.waterLayer.setDepth(1);
		this.waterLayer.setCollisionByExclusion([-1]);

		if (this.map.getLayer("Obstacles")) {
			this.obstaclesLayer = this.map.createLayer("Obstacles", tileset, 0, 0);
			this.obstaclesLayer.setDepth(2);
			this.obstaclesLayer.setCollisionByProperty({ collides: true });
			this.obstaclesLayer.setCollisionByExclusion([-1]);
		}

		this.goalLayer = this.map.createLayer("Goal", tileset, 0, 0);
		this.goalLayer.setDepth(3);

		this.cameras.main.setBounds(
			0,
			0,
			this.map.widthInPixels,
			this.map.heightInPixels
		);
		this.physics.world.setBounds(
			0,
			0,
			this.map.widthInPixels,
			this.map.heightInPixels
		);

		// Set camera zoom to better fill viewport (optional)
		// Since map is 720x480 and canvas is 1024x768, we can zoom in slightly
		this.cameras.main.setZoom(5);

		// Create UI camera
		this.uiCamera = this.cameras.add(0, 0, 1024, 768);
		this.uiCamera.setName("uiCamera");

		this.uiCamera.ignore([this.groundLayer, this.waterLayer, this.goalLayer]);

		if (this.obstaclesLayer) {
			this.uiCamera.ignore(this.obstaclesLayer);
		}

		// Create player
		this.createPlayer();

		// Create letters
		this.createLetters();

		// Create enemies
		this.createEnemies();

		// Create player animations
		this.createPlayerAnimations();

		// Set up input
		this.cursors = this.input.keyboard.createCursorKeys();
		this.wasd = this.input.keyboard.addKeys({
			up: Phaser.Input.Keyboard.KeyCodes.W,
			down: Phaser.Input.Keyboard.KeyCodes.S,
			left: Phaser.Input.Keyboard.KeyCodes.A,
			right: Phaser.Input.Keyboard.KeyCodes.D,
		});

		// UI - Show current word and collected letters
		this.createUI();
	}

	createPlayerAnimations() {
		// Create walk animation using last 7 tiles
		if (!this.anims.exists("walk")) {
			this.anims.create({
				key: "walk",
				frames: this.anims.generateFrameNumbers("tiles", {
					start: 268,
					end: 274,
				}),
				frameRate: 10,
				repeat: -1,
			});
		}
	}

	createPlayer() {
		const spawnLayer = this.map.getObjectLayer("Player");
		const spawnObject = spawnLayer.objects.find((obj) => obj.type === "spawn");

		if (spawnObject) {
			this.spawnPoint.x = spawnObject.x;
			this.spawnPoint.y = spawnObject.y;
		}

		this.player = this.physics.add.sprite(
			this.spawnPoint.x,
			this.spawnPoint.y,
			"tiles",
			268
		);

		this.player.setSize(14, 14);
		this.player.setCollideWorldBounds(true);
		this.player.setDepth(10);

		this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

		this.uiCamera.ignore(this.player);

		if (this.obstaclesLayer) {
			this.physics.add.collider(this.player, this.obstaclesLayer);
		}

		// Don't let player enter water until all letters collected
		this.physics.add.collider(this.player, this.waterLayer);
	}

	createLetters() {
		this.letters = this.physics.add.group();

		const letterLayer = this.map.getObjectLayer("Letter Layer");

		if (letterLayer) {
			letterLayer.objects.forEach((letterObj) => {
				if (letterObj.type === "letter") {
					const letter = this.letters.create(letterObj.x, letterObj.y, "tiles");
					letter.setFrame(letterObj.gid - 1);
					letter.setOrigin(0, 1);
					letter.setDepth(5);
					letter.letterName = letterObj.name;
					letter.body.setAllowGravity(false);
					letter.body.immovable = true;
				}
			});
		}

		this.uiCamera.ignore(this.letters.getChildren());

		this.physics.add.overlap(
			this.player,
			this.letters,
			this.collectLetter,
			null,
			this
		);
	}

	createEnemies() {
		this.bombs = this.physics.add.group();
		this.hovercrafts = this.physics.add.group();

		const enemyLayer = this.map.getObjectLayer("Enemy Layer");

		if (enemyLayer) {
			enemyLayer.objects.forEach((enemyObj) => {
				if (enemyObj.type === "bomb") {
					const bomb = this.bombs.create(enemyObj.x, enemyObj.y, "tiles");
					bomb.setFrame(enemyObj.gid - 1);
					bomb.setOrigin(0, 1);
					bomb.setDepth(5);
					bomb.body.setAllowGravity(false);
					bomb.body.immovable = true;
				} else if (enemyObj.type === "hovercraft") {
					const hovercraft = this.hovercrafts.create(
						enemyObj.x,
						enemyObj.y,
						"tiles"
					);
					hovercraft.setFrame(enemyObj.gid - 1);
					hovercraft.setOrigin(0, 1);
					hovercraft.setDepth(5);
					hovercraft.body.setAllowGravity(false);

					const directions = [
						{ x: 20, y: 0 },
						{ x: -20, y: 0 },
						{ x: 0, y: 20 },
						{ x: 0, y: -20 },
					];
					const randomDir = Phaser.Math.RND.pick(directions);
					hovercraft.setVelocity(randomDir.x, randomDir.y);

					if (randomDir.x < 0) {
						hovercraft.setFlipX(true);
					}

					this.time.addEvent({
						delay: 2000,
						callback: () => {
							if (hovercraft.active) {
								const newDir = Phaser.Math.RND.pick(directions);
								hovercraft.setVelocity(newDir.x, newDir.y);

								if (newDir.x < 0) {
									hovercraft.setFlipX(true);
								} else if (newDir.x > 0) {
									hovercraft.setFlipX(false);
								}
							}
						},
						loop: true,
					});
				}
			});
		}

		// Make UI camera ignore enemies
		this.uiCamera.ignore(this.bombs.getChildren());
		this.uiCamera.ignore(this.hovercrafts.getChildren());

		// Set up collisions with enemies
		this.physics.add.overlap(
			this.player,
			this.bombs,
			this.hitEnemy,
			null,
			this
		);
		this.physics.add.overlap(
			this.player,
			this.hovercrafts,
			this.hitEnemy,
			null,
			this
		);
	}

	createUI() {
		this.uiBackground = this.add.image(16, 16, "ui-background");
		this.uiBackground.setOrigin(0, 0);
		this.uiBackground.setDisplaySize(400, 150);

		this.uiText = this.add.text(230, 30, "", {
			fontSize: 24,
			color: "#3B2731",
			lineSpacing: 25,
		});

		this.cameras.main.ignore([this.uiBackground, this.uiText]);
		this.updateUI();
	}

	updateUI() {
		const collected = this.collectedLetters.join("");
		this.uiText.setText([`${this.currentWord}`, `${collected}`, `00:00`]);
	}

	collectLetter(player, letter) {
		// Extract the letter character from the name (e.g., "Letter A" -> "A")
		const letterChar = letter.letterName.split(" ")[1];
		this.collectedLetters.push(letterChar);

		letter.destroy();

		// Play sound effect (TODO)
		// this.sound.play('collect');

		this.updateUI();

		if (this.collectedLetters.length >= this.currentWord.length) {
			this.hasAllLetters = true;
			this.waterLayer.setCollisionByExclusion([]);

			const canCrossText = this.add
				.text(512, 100, "All letters collected! Cross those waves!", {
					fontFamily: "Arial Black",
					fontSize: 28,
					color: "#F7CF76",
					stroke: "#3B2731",
					strokeThickness: 6,
				})
				.setOrigin(0.5);

			this.cameras.main.ignore(canCrossText);

			this.time.delayedCall(2000, () => {
				this.tweens.add({
					targets: canCrossText,
					alpha: 0,
					duration: 500,
					onComplete: () => canCrossText.destroy(),
				});
			});
		}
	}

	hitEnemy(player, enemy) {
		// Reset player to spawn point
		this.player.setPosition(this.spawnPoint.x, this.spawnPoint.y);
		this.player.setVelocity(0, 0);

		// Flash the screen red
		this.cameras.main.flash(200, 255, 0, 0);
	}

	checkGoalReached() {
		const playerTileX = this.goalLayer.worldToTileX(this.player.x);
		const playerTileY = this.goalLayer.worldToTileY(this.player.y);
		const tile = this.goalLayer.getTileAt(playerTileX, playerTileY);

		if (tile && tile.index !== -1 && this.hasAllLetters) {
			this.levelComplete();
		}
	}

	levelComplete() {
		this.player.setVelocity(0, 0);

		const completeText = this.add
			.text(512, 384, `Level ${this.currentLevel} Complete!`, {
				fontFamily: "Arial Black",
				fontSize: 28,
				color: "#F7CF76",
				stroke: "#3B2731",
				strokeThickness: 8,
			})
			.setOrigin(0.5)
			.setDepth(20);

		// Use UI camera for this text too
		this.cameras.main.ignore(completeText);

		this.time.delayedCall(2000, () => {
			if (this.currentLevel < 10) {
				this.scene.restart({ level: this.currentLevel + 1 });
			} else {
				this.scene.start("GameOver");
			}
		});
	}

	update() {
		if (!this.player || !this.player.body) {
			return;
		}

		const speed = 70; // specifically player speed

		this.player.setVelocity(0);

		if (this.cursors.left.isDown || this.wasd.left.isDown) {
			this.player.setVelocityX(-speed);
			this.player.setFlipX(true);
		} else if (this.cursors.right.isDown || this.wasd.right.isDown) {
			this.player.setVelocityX(speed);
			this.player.setFlipX(false);
		}

		if (this.cursors.up.isDown || this.wasd.up.isDown) {
			this.player.setVelocityY(-speed);
		} else if (this.cursors.down.isDown || this.wasd.down.isDown) {
			this.player.setVelocityY(speed);
		}

		if (
			this.player.body.velocity.x !== 0 &&
			this.player.body.velocity.y !== 0
		) {
			this.player.setVelocity(
				this.player.body.velocity.x * 0.707,
				this.player.body.velocity.y * 0.707
			);
		}

		const playerTileX = this.waterLayer.worldToTileX(this.player.x);
		const playerTileY = this.waterLayer.worldToTileY(this.player.y);
		const waterTile = this.waterLayer.getTileAt(playerTileX, playerTileY);
		const isOnWater = waterTile && waterTile.index !== -1;

		if (isOnWater && !this.isInBoat && this.hasAllLetters) {
			this.isInBoat = true;
			this.player.anims.stop();
			this.player.setFrame(266);
			if (!this.anims.exists("boat")) {
				this.anims.create({
					key: "boat",
					frames: this.anims.generateFrameNumbers("tiles", {
						start: 266,
						end: 267,
					}),
					frameRate: 4,
					repeat: -1,
				});
			}
			this.player.anims.play("boat", true);
		} else if (!isOnWater && this.isInBoat) {
			this.isInBoat = false;
			this.player.setFrame(268);
		}

		if (!this.isInBoat) {
			if (
				this.player.body.velocity.x !== 0 ||
				this.player.body.velocity.y !== 0
			) {
				this.player.anims.play("walk", true);
			} else {
				this.player.anims.stop();
				this.player.setFrame(268);
			}
		}

		this.checkGoalReached();
	}
}
