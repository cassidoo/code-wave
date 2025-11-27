import { Boot } from "./scenes/Boot";
import { Game as MainGame } from "./scenes/Game";
import { GameOver } from "./scenes/GameOver";
import { MainMenu } from "./scenes/MainMenu";
import { Preloader } from "./scenes/Preloader";
import { Pause } from "./scenes/Pause";
import { AUTO, Game } from "phaser";

const config = {
	type: AUTO,
	width: 1024,
	height: 768,
	parent: "game-container",
	backgroundColor: "#9CD687",
	physics: {
		default: "arcade",
		arcade: {
			gravity: { y: 0 },
			debug: false,
		},
	},
	scale: {
		mode: Phaser.Scale.FIT,
		autoCenter: Phaser.Scale.CENTER_BOTH,
	},
	render: {
		pixelArt: true,
		antialias: false,
		roundPixels: true,
	},
	scene: [Boot, Preloader, MainMenu, MainGame, Pause, GameOver],
};

const StartGame = (parent) => {
	const game = new Game({ ...config, parent });
	game.registry.set("isMuted", false);
	game.registry.set("bgMusic", null);
	return game;
};

export default StartGame;
