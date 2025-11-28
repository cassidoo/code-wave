import { Scene } from "phaser";
import { MuteButton } from "../components/MuteButton.js";
import { MenuButton } from "../components/MenuButton.js";

export class MainMenu extends Scene {
	constructor() {
		super("MainMenu");
	}

	create() {
		this.add.image(512, 384, "background");

		const logo = this.add.image(512, 300, "logo");
		logo.setAlpha(0);

		this.tweens.add({
			targets: logo,
			alpha: 1,
			duration: 300,
			ease: "Power2",
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
		});

		this.updateDifficultyButtons();

		const helpButton = new MenuButton(this, 512, 600, "How to Play", () => {
			this.scene.start("HowToPlay");
		});

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
