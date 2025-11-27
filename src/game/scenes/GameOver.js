import { Scene } from "phaser";

export class GameOver extends Scene {
	constructor() {
		super("GameOver");
	}

	create(data) {
		const elapsedTime = data.elapsedTime || 0;
		const minutes = Math.floor(elapsedTime / 60000);
		const seconds = Math.floor((elapsedTime % 60000) / 1000);

		this.cameras.main.setBackgroundColor(0x1a1a2e);

		this.add.image(512, 384, "background").setAlpha(0.3);

		this.add
			.text(512, 300, "Congratulations!", {
				fontFamily: "Arial Black",
				fontSize: 64,
				color: "#F7CF76",
				stroke: "#3B2731",
				strokeThickness: 8,
				align: "center",
			})
			.setOrigin(0.5);

		this.add
			.text(
				512,
				400,
				[
					`You found all of the code words `,
					`in ${minutes} minutes and ${seconds} seconds!`,
				],
				{
					fontFamily: "Arial Black",
					fontSize: 32,
					color: "#ffffff",
					stroke: "#3B2731",
					strokeThickness: 6,
					align: "center",
				}
			)
			.setOrigin(0.5);

		this.add
			.text(512, 500, "Click or hit ESC to return to menu and play again.", {
				fontFamily: "Arial Black",
				fontSize: 24,
				color: "#cccccc",
				stroke: "#3B2731",
				strokeThickness: 4,
				align: "center",
			})
			.setOrigin(0.5);

		this.input.once("pointerdown", () => {
			this.scene.start("MainMenu");
		});
		this.input.keyboard.once("keydown-ESC", () => {
			this.scene.start("MainMenu");
		});
	}
}
