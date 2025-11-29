import { GameObjects } from "phaser";

export class PauseButton extends GameObjects.Text {
	constructor(scene, x, y) {
		super(scene, x, y, "Pause (ESC)", {
			fontSize: 20,
			color: "#3B2731",
			backgroundColor: "#F7CF76",
			padding: { x: 10, y: 5 },
		});

		this.scene = scene;
		this.setOrigin(1, 0);
		this.setInteractive({ useHandCursor: true });

		this.on("pointerdown", () => {
			this.pauseGame();
		});

		scene.add.existing(this);
	}

	pauseGame() {
		this.scene.scene.pause();
		this.scene.scene.launch("Pause");
	}
}
