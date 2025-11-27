import { Scene } from "phaser";

export class Preloader extends Scene {
	constructor() {
		super("Preloader");
	}

	init() {
		this.add.image(512, 384, "background");
	}

	preload() {
		this.load.setPath("assets");
		this.load.image("logo", "logo.png");
		this.load.image("ui-background", "find-have.png");

		// 25 columns x 11 rows of 16x16 tiles = 400x176 pixels
		this.load.spritesheet("tiles", "maps/sprites.png", {
			frameWidth: 16,
			frameHeight: 16,
			startFrame: 0,
			endFrame: 274,
		});

		for (let i = 1; i <= 10; i++) {
			this.load.tilemapTiledJSON(`level${i}`, `maps/level${i}.tmj`);
		}

		this.load.audio("collect", "sounds/collect.ogg");
		this.load.audio("boom", "sounds/boom.ogg");
		this.load.audio("splash", "sounds/splash.ogg");
		this.load.audio("bgmusic", "sounds/heart-of-pixels.ogg");
	}

	create() {
		this.scene.start("MainMenu");
	}
}
