import { Scene } from "phaser";
import { MuteButton } from "../components/MuteButton.js";
import { MenuButton } from "../components/MenuButton.js";

export class Pause extends Scene {
	constructor() {
		super("Pause");
	}

	create() {
		this.cameras.main.setBackgroundColor(0x1a1a2e);

		this.add.image(512, 384, "background").setAlpha(0.3);

		this.add
			.text(512, 250, "Paused", {
				fontFamily: "'Arial Black', Courier, monospace",
				fontSize: 64,
				color: "#F7CF76",
				stroke: "#3B2731",
				strokeThickness: 8,
				align: "center",
			})
			.setOrigin(0.5);

		this.muteButton = new MuteButton(this, 1000, 20);

		const resumeText = new MenuButton(this, 512, 350, "Resume (ESC)", () => {
			this.scene.resume("Game");
			this.scene.stop();
		});
		resumeText.setFontSize(32);

		const restartText = new MenuButton(this, 512, 420, "Restart Game", () => {
			this.scene.stop("Game");
			this.scene.start("Game", { level: 1, elapsedTime: 0 });
			this.scene.stop();
		});
		restartText.setFontSize(32);

		const howToPlayText = new MenuButton(this, 512, 490, "How to Play", () => {
			this.scene.start("HowToPlay", { fromPause: true });
			this.scene.stop();
		});
		howToPlayText.setFontSize(32);

		const menuText = new MenuButton(this, 512, 560, "Main Menu", () => {
			this.scene.stop("Game");
			this.scene.start("MainMenu");
			this.scene.stop();
		});
		menuText.setFontSize(32);

		this.input.keyboard.once("keydown-ESC", () => {
			this.scene.resume("Game");
			this.scene.stop();
		});
	}
}
