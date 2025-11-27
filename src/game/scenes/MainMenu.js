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

		const startButton = new MenuButton(this, 512, 520, "Start", () => {
			this.scene.start("Game", { level: 1, elapsedTime: 0 });
		});
		startButton.setFontSize(32);

		const helpButton = new MenuButton(this, 512, 590, "How to Play", () => {
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
}
