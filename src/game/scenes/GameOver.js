import { Scene } from 'phaser';

export class GameOver extends Scene
{
    constructor ()
    {
        super('GameOver');
    }
    
    init(data)
    {
        this.won = data.won || false;
        this.level = data.level || 1;
    }

    create ()
    {
        if (this.won) {
            this.cameras.main.setBackgroundColor(0x00aa00);
            
            this.add.text(360, 180, '🎉 Congratulations! 🎉', {
                fontFamily: 'Arial Black', fontSize: 40, color: '#ffffff',
                stroke: '#000000', strokeThickness: 8,
                align: 'center'
            }).setOrigin(0.5);
            
            this.add.text(360, 260, 'You completed all levels!', {
                fontFamily: 'Arial Black', fontSize: 28, color: '#ffff00',
                stroke: '#000000', strokeThickness: 6,
                align: 'center'
            }).setOrigin(0.5);
        } else {
            this.cameras.main.setBackgroundColor(0xaa0000);
            
            this.add.text(360, 180, 'Game Over', {
                fontFamily: 'Arial Black', fontSize: 64, color: '#ffffff',
                stroke: '#000000', strokeThickness: 8,
                align: 'center'
            }).setOrigin(0.5);
            
            this.add.text(360, 260, `You reached level ${this.level}`, {
                fontFamily: 'Arial', fontSize: 24, color: '#ffffff',
                stroke: '#000000', strokeThickness: 4,
                align: 'center'
            }).setOrigin(0.5);
        }

        this.add.text(360, 360, 'Click to play again', {
            fontFamily: 'Arial', fontSize: 24, color: '#ffffff',
            stroke: '#000000', strokeThickness: 4,
            align: 'center'
        }).setOrigin(0.5);

        this.input.once('pointerdown', () => {

            this.scene.start('MainMenu');

        });
    }
}
