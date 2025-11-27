import { GameObjects } from "phaser";

export class MenuButton extends GameObjects.Text {
	constructor(scene, x, y, text, onClick) {
		super(scene, x, y, text, {
			fontFamily: "Arial Black",
			fontSize: 28,
			color: "#ffffff",
			stroke: "#3B2731",
			strokeThickness: 8,
			align: "center",
		});

		this.scene = scene;
		this.setOrigin(0.5);
		this.setInteractive({ useHandCursor: true });

		this.on("pointerover", () => {
			this.setColor("#F7CF76");
		});

		this.on("pointerout", () => {
			this.setColor("#ffffff");
		});

		this.on("pointerdown", onClick);

		scene.add.existing(this);
	}
}
