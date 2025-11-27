import { GameObjects } from "phaser";

export class MuteButton extends GameObjects.Text {
	constructor(scene, x, y) {
		const isMuted = scene.game.registry.get("isMuted") || false;

		super(scene, x, y, isMuted ? "Unmute (M)" : "Mute (M)", {
			fontSize: 20,
			color: "#3B2731",
			backgroundColor: "#F7CF76",
			padding: { x: 10, y: 5 },
		});

		this.scene = scene;
		this.setOrigin(1, 0);
		this.setInteractive({ useHandCursor: true });

		this.on("pointerdown", () => {
			this.toggleMute();
		});

		this.scene.input.keyboard.on("keydown-M", () => {
			this.toggleMute();
		});

		scene.add.existing(this);
	}

	toggleMute() {
		const currentMuted = this.scene.game.registry.get("isMuted") || false;
		const newMuted = !currentMuted;
		this.scene.game.registry.set("isMuted", newMuted);
		this.setText(newMuted ? "Unmute (M)" : "Mute (M)");

		const bgMusic = this.scene.game.registry.get("bgMusic");
		if (bgMusic) {
			if (newMuted) {
				bgMusic.pause();
			} else {
				bgMusic.resume();
			}
		}

		if (newMuted) {
			this.scene.sound.mute = true;
		} else {
			this.scene.sound.mute = false;
		}
	}
}
