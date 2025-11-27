import { Scene } from "phaser";

export class MainMenu extends Scene {
	constructor() {
		super("MainMenu");
	}

	create() {
		this.add.image(512, 384, "background");

		this.add.image(512, 300, "logo");

		const startButton = this.add
			.text(512, 520, "Start", {
				fontFamily: "Arial Black",
				fontSize: 32,
				color: "#ffffff",
				stroke: "#3B2731",
				strokeThickness: 8,
				align: "center",
			})
			.setOrigin(0.5)
			.setInteractive();

		startButton.on("pointerover", () => {
			startButton.setColor("#F7CF76");
		});

		startButton.on("pointerout", () => {
			startButton.setColor("#ffffff");
		});

		startButton.on("pointerdown", () => {
			this.scene.start("Game");
		});

		// Help button
		const helpButton = this.add
			.text(512, 590, "How to Play", {
				fontFamily: "Arial Black",
				fontSize: 28,
				color: "#ffffff",
				stroke: "#3B2731",
				strokeThickness: 8,
				align: "center",
			})
			.setOrigin(0.5)
			.setInteractive();

		helpButton.on("pointerover", () => {
			helpButton.setColor("#F7CF76");
		});

		helpButton.on("pointerout", () => {
			helpButton.setColor("#ffffff");
		});

		helpButton.on("pointerdown", () => {
			this.showHelp();
		});
	}

	showHelp() {
		const overlay = this.add
			.rectangle(512, 384, 1024, 768, 0x3b2731, 0.9)
			.setInteractive();

		const helpText = [
			"How to play Code Wave!",
			"",
			"• Use Arrow Keys or WASD to move around the map.",
			"• Collect all letters to spell each level's code word!",
			"• Avoid bombs and hovercrafts. If you touch one, you have to start the level over.",
			"• You can cross the water to finish the level when you complete the code word!",
			"",
			"(Click or hit ESC to close)",
		].join("\n");

		const text = this.add
			.text(512, 384, helpText, {
				fontFamily: "Arial",
				fontSize: 24,
				color: "#ffffff",
				stroke: "#3B2731",
				strokeThickness: 8,
				align: "left",
			})
			.setOrigin(0.5);

		overlay.on("pointerdown", () => {
			overlay.destroy();
			text.destroy();
			this.input.keyboard.off("keydown-ESC", escHandler);
		});

		const escHandler = () => {
			overlay.destroy();
			text.destroy();
			this.input.keyboard.off("keydown-ESC", escHandler);
		};
		this.input.keyboard.on("keydown-ESC", escHandler);
	}
}
