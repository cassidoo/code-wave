import { Scene } from "phaser";

export class GameOver extends Scene {
	constructor() {
		super("GameOver");
	}

	create() {
		this.cameras.main.setBackgroundColor(0x1a1a2e);

		this.add.image(512, 384, "background").setAlpha(0.3);

		this.add
			.text(512, 300, "Congratulations!", {
				fontFamily: "Arial Black",
				fontSize: 64,
				color: "#00ff00",
				stroke: "#000000",
				strokeThickness: 8,
				align: "center",
			})
			.setOrigin(0.5);

		this.add
			.text(512, 400, "You completed all 10 levels!", {
				fontFamily: "Arial",
				fontSize: 32,
				color: "#ffffff",
				stroke: "#000000",
				strokeThickness: 6,
				align: "center",
			})
			.setOrigin(0.5);

		this.add
			.text(512, 500, "Click to return to menu", {
				fontFamily: "Arial",
				fontSize: 24,
				color: "#cccccc",
				stroke: "#000000",
				strokeThickness: 4,
				align: "center",
			})
			.setOrigin(0.5);

		this.input.once("pointerdown", () => {
			this.scene.start("MainMenu");
		});
	}
}
