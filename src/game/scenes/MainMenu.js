import { Scene } from 'phaser';

export class MainMenu extends Scene
{
    constructor ()
    {
        super('MainMenu');
    }

    create ()
    {
        this.add.image(360, 240, 'background');

        this.add.image(360, 180, 'logo').setScale(0.8);

        this.add.text(360, 320, 'Click or Press Enter to Start', {
            fontFamily: 'Arial Black', fontSize: 28, color: '#ffffff',
            stroke: '#000000', strokeThickness: 6,
            align: 'center'
        }).setOrigin(0.5);
        
        this.add.text(360, 380, 'Collect letters to form words!\nAvoid enemies and cross the water to win!', {
            fontFamily: 'Arial', fontSize: 16, color: '#ffffff',
            stroke: '#000000', strokeThickness: 3,
            align: 'center'
        }).setOrigin(0.5);

        this.input.once('pointerdown', () => {
            this.scene.start('Game', { level: 1 });
        });
        
        // Also allow starting with Enter or Space
        this.input.keyboard.once('keydown-ENTER', () => {
            this.scene.start('Game', { level: 1 });
        });
        this.input.keyboard.once('keydown-SPACE', () => {
            this.scene.start('Game', { level: 1 });
        });
    }
}
