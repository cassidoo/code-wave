import { Scene } from "phaser";
import { VirtualJoystick } from "../components/VirtualJoystick.js";
import { MuteButton } from "../components/MuteButton.js";
import { PauseButton } from "../components/PauseButton.js";

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

		this.collectedLetters = [];
		this.hasAllLetters = false;
		this.isInWater = false;
		this.isInBoat = false;

		this.spawnPoint = { x: 0, y: 0 };

		this.timerStarted = false;
		this.timerPaused = false;
		this.elapsedTime = data.elapsedTime || 0; // carry over from previous level
		this.lastTime = 0;

		this.isMuted = data.isMuted !== undefined ? data.isMuted : false;

		// Get difficulty setting from registry
		this.difficulty = this.game.registry.get("difficulty") || "easy";
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

		this.cameras.main.setZoom(5);

		this.uiCamera = this.cameras.add(0, 0, 1024, 768);
		this.uiCamera.setName("uiCamera");

		this.uiCamera.ignore([this.groundLayer, this.waterLayer, this.goalLayer]);

		if (this.obstaclesLayer) {
			this.uiCamera.ignore(this.obstaclesLayer);
		}

		this.createPlayer();
		this.createLetters();
		this.createEnemies();
		this.createPlayerAnimations();

		this.cursors = this.input.keyboard.createCursorKeys();
		this.wasd = this.input.keyboard.addKeys({
			up: Phaser.Input.Keyboard.KeyCodes.W,
			down: Phaser.Input.Keyboard.KeyCodes.S,
			left: Phaser.Input.Keyboard.KeyCodes.A,
			right: Phaser.Input.Keyboard.KeyCodes.D,
		});

		this.virtualJoystick = new VirtualJoystick(this);

		this.input.keyboard.on("keydown-ESC", () => {
			this.scene.pause();
			this.scene.launch("Pause");
		});

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

		// Collisions with enemies
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

		// Create pause button in top right
		this.pauseButton = new PauseButton(this, 980, 60);

		// Create mute/unmute button in top right
		this.muteButton = new MuteButton(this, 980, 20);

		this.cameras.main.ignore([
			this.uiBackground,
			this.uiText,
			this.muteButton,
			this.pauseButton,
		]);
		this.updateUI();
	}

	updateUI() {
		const collected = this.currentWord
			.split("")
			.map((char, idx) => {
				const foundIdx = this.collectedLetters.findIndex(
					(l, i) => l === char && !this.collectedLetters.used?.[i]
				);
				if (foundIdx !== -1) {
					this.collectedLetters.used = this.collectedLetters.used || [];
					this.collectedLetters.used[foundIdx] = true;
					return char;
				}
				return "-";
			})
			.join("");
		// Reset usage tracking for next update
		if (this.collectedLetters.used) delete this.collectedLetters.used;
		const minutes = Math.floor(this.elapsedTime / 60000);
		const seconds = Math.floor((this.elapsedTime % 60000) / 1000);
		const timeString = `${minutes.toString().padStart(2, "0")}:${seconds
			.toString()
			.padStart(2, "0")}`;

		this.uiText.setText([
			`${this.currentWord}`, // current word for the level
			`${collected}`, // letters collected so far
			`${timeString}`, // timer
		]);
	}

	collectLetter(player, letter) {
		// Extract the letter character from the name (e.g., "Letter A" -> "A")
		const letterChar = letter.letterName.split(" ")[1];

		// Hard difficulty: check if letter is in correct order
		if (this.difficulty === "hard") {
			const nextExpectedIndex = this.collectedLetters.length;
			const expectedLetter = this.currentWord[nextExpectedIndex];

			if (letterChar !== expectedLetter) {
				// Flash the letter red and don't collect it
				this.tweens.add({
					targets: letter,
					tint: 0xe44436,
					duration: 100,
					yoyo: true,
					repeat: 2,
					onComplete: () => {
						letter.clearTint();
					},
				});

				const wrongOrderText = this.add
					.text(512, 384, `Collect letters in order! Next: ${expectedLetter}`, {
						fontFamily: "'Arial Black', Courier, monospace",
						fontSize: 24,
						color: "#E44436",
						stroke: "#3B2731",
						strokeThickness: 8,
					})
					.setOrigin(0.5);

				this.cameras.main.ignore(wrongOrderText);

				this.time.delayedCall(1500, () => {
					this.tweens.add({
						targets: wrongOrderText,
						alpha: 0,
						duration: 500,
						onComplete: () => wrongOrderText.destroy(),
					});
				});

				return; // Don't collect the letter
			}
		}

		this.collectedLetters.push(letterChar);

		letter.destroy();
		this.sound.play("collect");

		this.updateUI();

		if (this.collectedLetters.length >= this.currentWord.length) {
			this.hasAllLetters = true;
			this.waterLayer.setCollisionByExclusion([]);

			const canCrossText = this.add
				.text(512, 384, "Code word complete! Cross those waves!", {
					fontFamily: "'Arial Black', Courier, monospace",
					fontSize: 28,
					color: "#F7CF76",
					stroke: "#3B2731",
					strokeThickness: 8,
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
		this.sound.play("boom");

		let resetString = ["Boom!", "Restarting level..."];

		if (
			this.collectedLetters.length > 0 &&
			(this.difficulty === "medium" || this.difficulty === "hard")
		) {
			resetString = ["Boom!", "You lost your letters!"];
		}

		this.tweens.add({
			targets: enemy,
			scale: 1.2,
			alpha: 0,
			tint: 0xe44436,
			duration: 1500,
			ease: "Power2",
		});

		this.tweens.add({
			targets: this.player,
			angle: 360,
			alpha: 0,
			duration: 500,
			ease: "Power2",
		});

		// HEX red #E44436 converted to RGB at 0.5 alpha
		// this.cameras.main.flash(500, 228, 68, 54, false, null, 0.2);

		const resetText = this.add
			.text(512, 384, resetString, {
				fontFamily: "'Arial Black', Courier, monospace",
				fontSize: 36,
				color: "#E44436",
				stroke: "#3B2731",
				strokeThickness: 8,
				align: "center",
			})
			.setOrigin(0.5);

		this.cameras.main.ignore(resetText);

		if (this.difficulty === "medium" || this.difficulty === "hard") {
			this.time.delayedCall(1500, () => {
				this.scene.restart({
					level: this.currentLevel,
					elapsedTime: this.elapsedTime,
				});
			});
		} else {
			this.time.delayedCall(1500, () => {
				this.tweens.killTweensOf(player);
				this.tweens.killTweensOf(enemy);

				this.player.setPosition(this.spawnPoint.x, this.spawnPoint.y);
				this.player.setVelocity(0, 0);
				this.player.angle = 0;
				this.player.alpha = 1;

				enemy.setScale(1);
				enemy.alpha = 1;
				enemy.clearTint();
				this.updateUI();
			});
		}

		this.time.delayedCall(500, () => {
			if (resetText && resetText.scene) {
				this.tweens.add({
					targets: resetText,
					alpha: 0,
					duration: 500,
					onComplete: () => resetText.destroy(),
				});
			}
		});
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
		this.timerPaused = true;

		this.tweens.add({
			targets: this.player,
			angle: 720,
			alpha: 0,
			duration: 1500,
			ease: "Power2",
		});

		const completeText = this.add
			.text(512, 384, `Level ${this.currentLevel} Complete!`, {
				fontFamily: "'Arial Black', Courier, monospace",
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
				this.scene.restart({
					level: this.currentLevel + 1,
					elapsedTime: this.elapsedTime,
				});
			} else {
				this.scene.start("GameOver", { elapsedTime: this.elapsedTime });
			}
		});
	}

	update() {
		if (!this.player || !this.player.body) {
			return;
		}

		const speed = 70; // specifically player speed

		this.player.setVelocity(0);

		const joystickDir = this.virtualJoystick.getDirection();

		let moveX = 0;
		let moveY = 0;

		if (this.cursors.left.isDown || this.wasd.left.isDown) {
			moveX = -1;
		} else if (this.cursors.right.isDown || this.wasd.right.isDown) {
			moveX = 1;
		}

		if (this.cursors.up.isDown || this.wasd.up.isDown) {
			moveY = -1;
		} else if (this.cursors.down.isDown || this.wasd.down.isDown) {
			moveY = 1;
		}

		if (
			moveX === 0 &&
			moveY === 0 &&
			(joystickDir.x !== 0 || joystickDir.y !== 0)
		) {
			moveX = joystickDir.x;
			moveY = joystickDir.y;
		}

		if (moveX !== 0) {
			this.player.setVelocityX(moveX * speed);
			this.player.setFlipX(moveX < 0);
		}

		if (moveY !== 0) {
			this.player.setVelocityY(moveY * speed);
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

		// Start timer on first movement per level
		const isMoving =
			this.player.body.velocity.x !== 0 || this.player.body.velocity.y !== 0;
		if (isMoving && !this.timerStarted && !this.timerPaused) {
			this.timerStarted = true;
			this.lastTime = this.time.now;
		}

		if (this.timerStarted && !this.timerPaused) {
			const currentTime = this.time.now;
			this.elapsedTime += currentTime - this.lastTime;
			this.lastTime = currentTime;
			this.updateUI();
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
			this.sound.play("splash");
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
