import { Scene } from 'phaser';

export class Preloader extends Scene
{
    constructor ()
    {
        super('Preloader');
    }

    init ()
    {
        //  We loaded this image in our Boot Scene, so we can display it here
        this.add.image(360, 240, 'background');

        //  A simple progress bar. This is the outline of the bar.
        this.add.rectangle(360, 240, 468, 32).setStrokeStyle(1, 0xffffff);

        //  This is the progress bar itself. It will increase in size from the left based on the % of progress.
        const bar = this.add.rectangle(360-230, 240, 4, 28, 0xffffff);

        //  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
        this.load.on('progress', (progress) => {

            //  Update the progress bar (our bar is 464px wide, so 100% = 464px)
            bar.width = 4 + (460 * progress);

        });
    }

    preload ()
    {
        this.load.setPath('src/game/maps');
        
        // Load the spritesheet (25 columns x 11 rows, each tile is 16x16)
        this.load.spritesheet('sprites', 'sprites.png', {
            frameWidth: 16,
            frameHeight: 16
        });
        
        // Load TMX files as text to be parsed
        for (let i = 1; i <= 10; i++) {
            this.load.text(`level${i}`, `level${i}.tmx`);
        }
    }

    create ()
    {
        // Create player walk animation from the last 7 tiles of the bottom row
        // The spritesheet is 25 columns x 11 rows = 275 tiles (indices 0-274)
        // Last row starts at index 250 (10 * 25)
        // Last 7 columns of last row: indices 268-274 (25*10 + 18 to 25*10 + 24)
        this.anims.create({
            key: 'player-walk',
            frames: this.anims.generateFrameNumbers('sprites', { 
                frames: [268, 269, 270, 271, 272, 273, 274]
            }),
            frameRate: 10,
            repeat: -1
        });
        
        // Create player idle animation (just first frame of walk cycle)
        this.anims.create({
            key: 'player-idle',
            frames: [{ key: 'sprites', frame: 268 }],
            frameRate: 1,
            repeat: 0
        });

        //  Move to the MainMenu
        this.scene.start('MainMenu');
    }
}
