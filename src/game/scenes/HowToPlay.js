import { Scene } from "phaser";
import { MuteButton } from "../components/MuteButton.js";
import { MenuButton } from "../components/MenuButton.js";

export class HowToPlay extends Scene {
	constructor() {
		super("HowToPlay");
	}

	init(data) {
		this.fromPause = data.fromPause || false;
	}

	create() {
		this.cameras.main.setBackgroundColor(0x1a1a2e);

		this.add.image(512, 384, "background").setAlpha(0.3);

		this.add
			.text(512, 150, "How to Play", {
				fontFamily: "Arial Black",
				fontSize: 64,
				color: "#F7CF76",
				stroke: "#3B2731",
				strokeThickness: 8,
				align: "center",
			})
			.setOrigin(0.5);

		this.muteButton = new MuteButton(this, 1000, 20);

		const helpText = [
			"• Use Arrow Keys or WASD to move around the map.",
			"",
			"• Collect all letters to spell each level's code word!",
			"",
			"• Avoid bombs and hovercrafts. If you touch one,",
			"  you have to start the level over.",
			"",
			"• You can cross the water to finish the level when",
			"  you complete the code word!",
		].join("\n");

		this.add
			.text(512, 380, helpText, {
				fontFamily: "Arial",
				fontSize: 24,
				color: "#ffffff",
				stroke: "#3B2731",
				strokeThickness: 4,
				align: "left",
			})
			.setOrigin(0.5);

		const backButton = new MenuButton(this, 512, 600, "Back", () => {
			if (this.fromPause) {
				this.scene.start("Pause");
			} else {
				this.scene.start("MainMenu");
			}
		});
		backButton.setFontSize(32);

		this.input.keyboard.once("keydown-ESC", () => {
			if (this.fromPause) {
				this.scene.start("Pause");
			} else {
				this.scene.start("MainMenu");
			}
		});
	}
}
