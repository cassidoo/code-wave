import { Scene } from "phaser";

export class Pause extends Scene {
	constructor() {
		super("Pause");
	}

	create() {
		this.cameras.main.setBackgroundColor(0x1a1a2e);

		this.add.image(512, 384, "background").setAlpha(0.3);

		this.add
			.text(512, 250, "Paused", {
				fontFamily: "Arial Black",
				fontSize: 64,
				color: "#F7CF76",
				stroke: "#3B2731",
				strokeThickness: 8,
				align: "center",
			})
			.setOrigin(0.5);

		const resumeText = this.add
			.text(512, 350, "Resume (ESC)", {
				fontFamily: "Arial Black",
				fontSize: 32,
				color: "#ffffff",
				stroke: "#3B2731",
				strokeThickness: 6,
				align: "center",
			})
			.setOrigin(0.5)
			.setInteractive({ useHandCursor: true });

		const restartText = this.add
			.text(512, 420, "Restart", {
				fontFamily: "Arial Black",
				fontSize: 32,
				color: "#ffffff",
				stroke: "#3B2731",
				strokeThickness: 6,
				align: "center",
			})
			.setOrigin(0.5)
			.setInteractive({ useHandCursor: true });

		const menuText = this.add
			.text(512, 490, "Main Menu", {
				fontFamily: "Arial Black",
				fontSize: 32,
				color: "#ffffff",
				stroke: "#3B2731",
				strokeThickness: 6,
				align: "center",
			})
			.setOrigin(0.5)
			.setInteractive({ useHandCursor: true });

		resumeText.on("pointerdown", () => {
			this.scene.resume("Game");
			this.scene.stop();
		});

		resumeText.on("pointerover", () => {
			resumeText.setColor("#F7CF76");
		});

		resumeText.on("pointerout", () => {
			resumeText.setColor("#ffffff");
		});

		restartText.on("pointerdown", () => {
			this.scene.stop("Game");
			this.scene.start("Game");
			this.scene.stop();
		});

		restartText.on("pointerover", () => {
			restartText.setColor("#F7CF76");
		});

		restartText.on("pointerout", () => {
			restartText.setColor("#ffffff");
		});

		menuText.on("pointerdown", () => {
			this.scene.stop("Game");
			this.scene.start("MainMenu");
			this.scene.stop();
		});

		menuText.on("pointerover", () => {
			menuText.setColor("#F7CF76");
		});

		menuText.on("pointerout", () => {
			menuText.setColor("#ffffff");
		});

		this.input.keyboard.once("keydown-ESC", () => {
			this.scene.resume("Game");
			this.scene.stop();
		});
	}
}
