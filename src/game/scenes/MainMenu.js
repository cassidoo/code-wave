import { Scene } from "phaser";
import { MuteButton } from "../components/MuteButton.js";
import { MenuButton } from "../components/MenuButton.js";

export class MainMenu extends Scene {
	constructor() {
		super("MainMenu");
		this.selectedButtonIndex = 0;
		this.allButtons = [];
		this.splashActive = true;
	}

	create() {
		this.add.image(512, 384, "background");

		const logo = this.add.image(512, 300, "logo");
		logo.setAlpha(0);

		this.tweens.add({
			targets: logo,
			alpha: 1,
			duration: 150,
			ease: "Power2",
			onComplete: () => {
				this.splashActive = false;
			},
		});

		let bgMusic = this.game.registry.get("bgMusic");
		const isMuted = this.game.registry.get("isMuted");

		if (!bgMusic || !bgMusic.isPlaying) {
			bgMusic = this.sound.add("bgmusic", { loop: true });
			this.game.registry.set("bgMusic", bgMusic);
			if (!isMuted) {
				bgMusic.play();
			}
		}

		this.muteButton = new MuteButton(this, 980, 20);

		// Initialize difficulty if not set
		if (!this.game.registry.get("difficulty")) {
			this.game.registry.set("difficulty", "easy");
		}

		const startButton = new MenuButton(this, 512, 520, "Start", () => {
			this.scene.start("Game", { level: 1, elapsedTime: 0 });
		});
		startButton.setFontSize(32);
		this.allButtons.push(startButton);

		this.difficulties = ["easy", "medium", "hard"];
		this.difficultyButtons = [];

		this.difficulties.forEach((diff, index) => {
			const button = new MenuButton(
				this,
				412 + index * 100,
				560,
				diff.charAt(0).toUpperCase() + diff.slice(1),
				() => {
					this.game.registry.set("difficulty", diff);
					this.updateDifficultyButtons();
				}
			);
			button.setFontSize(20);
			button.difficulty = diff;
			this.difficultyButtons.push(button);
			this.allButtons.push(button);
		});

		this.updateDifficultyButtons();

		const helpButton = new MenuButton(this, 512, 620, "How to Play", () => {
			this.scene.start("HowToPlay");
		});
		this.allButtons.push(helpButton);

		// Setup keyboard controls
		this.cursors = this.input.keyboard.createCursorKeys();
		this.enterKey = this.input.keyboard.addKey(
			Phaser.Input.Keyboard.KeyCodes.ENTER
		);
		this.spaceKey = this.input.keyboard.addKey(
			Phaser.Input.Keyboard.KeyCodes.SPACE
		);

		this.enterKey.on("down", () => {
			if (this.splashActive) {
				this.scene.start("Game", { level: 1, elapsedTime: 0 });
			} else {
				this.allButtons[this.selectedButtonIndex].emit("pointerdown");
			}
		});

		this.spaceKey.on("down", () => {
			if (this.splashActive) {
				this.scene.start("Game", { level: 1, elapsedTime: 0 });
			} else {
				this.allButtons[this.selectedButtonIndex].emit("pointerdown");
			}
		});

		this.cursors.down.on("down", () => {
			if (!this.splashActive) {
				this.selectedButtonIndex =
					(this.selectedButtonIndex + 1) % this.allButtons.length;
				this.updateSelectedButton();
			}
		});

		this.cursors.right.on("down", () => {
			if (!this.splashActive) {
				this.selectedButtonIndex =
					(this.selectedButtonIndex + 1) % this.allButtons.length;
				this.updateSelectedButton();
			}
		});

		this.cursors.up.on("down", () => {
			if (!this.splashActive) {
				this.selectedButtonIndex =
					(this.selectedButtonIndex - 1 + this.allButtons.length) %
					this.allButtons.length;
				this.updateSelectedButton();
			}
		});

		this.cursors.left.on("down", () => {
			if (!this.splashActive) {
				this.selectedButtonIndex =
					(this.selectedButtonIndex - 1 + this.allButtons.length) %
					this.allButtons.length;
				this.updateSelectedButton();
			}
		});

		this.updateSelectedButton();

		/*
		const testGameOverButton = this.add
			.text(950, 700, "Test Game Over", {
				fontFamily: "Arial",
				fontSize: 16,
				color: "#ffffff",
				stroke: "#3B2731",
				strokeThickness: 4,
				align: "center",
			})
			.setOrigin(0.5)
			.setInteractive();

		testGameOverButton.on("pointerover", () => {
			testGameOverButton.setColor("#F7CF76");
		});

		testGameOverButton.on("pointerout", () => {
			testGameOverButton.setColor("#ffffff");
		});

		testGameOverButton.on("pointerdown", () => {
			this.scene.start("GameOver", { elapsedTime: 123456 });
		});
		*/
	}

	updateSelectedButton() {
		this.allButtons.forEach((button, index) => {
			if (index === this.selectedButtonIndex) {
				button.setScale(1.1);
			} else {
				button.setScale(1.0);
			}
		});
	}

	updateDifficultyButtons() {
		const currentDifficulty = this.game.registry.get("difficulty");
		this.difficultyButtons.forEach((button) => {
			// Remove existing hover listeners
			button.off("pointerover");
			button.off("pointerout");

			if (button.difficulty === currentDifficulty) {
				button.setColor("#F7CF76");
			} else {
				button.setColor("#ffffff");

				// Re-add hover effects for non-selected buttons
				button.on("pointerover", () => {
					if (button.difficulty !== this.game.registry.get("difficulty")) {
						button.setColor("#F7CF76");
					}
				});

				button.on("pointerout", () => {
					if (button.difficulty !== this.game.registry.get("difficulty")) {
						button.setColor("#ffffff");
					}
				});
			}
		});
	}
}
