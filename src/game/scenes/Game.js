import { Scene } from 'phaser';
import { parseTmx, getLayer, getObjectGroup, extractLetterFromName } from '../utils/TmxParser';

// Words for each level (from README)
const LEVEL_WORDS = {
    1: 'AI',
    2: 'GIT',
    3: 'DATA',
    4: 'MERGE',
    5: 'COMMIT',
    6: 'BRANCH',
    7: 'GITHUB',
    8: 'PROGRAM',
    9: 'COPILOT',
    10: 'DEVELOPER'
};

export class Game extends Scene
{
    constructor ()
    {
        super('Game');
    }

    init(data)
    {
        this.currentLevel = data.level || 1;
        this.collectedLetters = [];
        this.targetWord = LEVEL_WORDS[this.currentLevel] || 'CODE';
        this.canCrossWater = false;
        this.isInBoat = false;
    }

    create ()
    {
        // Parse the TMX map data
        const tmxData = this.cache.text.get(`level${this.currentLevel}`);
        this.mapData = parseTmx(tmxData);
        
        const tileWidth = this.mapData.tilewidth;
        const tileHeight = this.mapData.tileheight;
        
        // Create tile layers
        this.createTileLayer('Ground', tileWidth, tileHeight);
        this.obstacleSprites = this.createTileLayer('Obstacles', tileWidth, tileHeight);
        this.waterSprites = this.createTileLayer('Water', tileWidth, tileHeight);
        this.goalSprites = this.createTileLayer('Goal', tileWidth, tileHeight);
        
        // Create physics groups for collision tiles
        this.obstacles = this.physics.add.staticGroup();
        this.waterTiles = this.physics.add.staticGroup();
        this.goalTiles = this.physics.add.staticGroup();
        
        this.createCollisionTiles('Obstacles', this.obstacles, tileWidth, tileHeight);
        this.createCollisionTiles('Water', this.waterTiles, tileWidth, tileHeight);
        this.createCollisionTiles('Goal', this.goalTiles, tileWidth, tileHeight);
        
        // Create letters group
        this.letters = this.physics.add.group();
        this.createLetters(tileWidth, tileHeight);
        
        // Create enemies
        this.bombs = this.physics.add.staticGroup();
        this.hovercrafts = this.physics.add.group();
        this.createEnemies(tileWidth, tileHeight);
        
        // Create player at spawn point
        this.createPlayer(tileWidth, tileHeight);
        
        // Set up camera to follow player with 4x zoom
        this.cameras.main.setZoom(4);
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
        this.cameras.main.setBounds(0, 0, this.mapData.width * tileWidth, this.mapData.height * tileHeight);
        
        // Set up collisions
        this.physics.add.collider(this.player, this.obstacles);
        this.physics.add.collider(this.player, this.waterTiles, this.handleWaterCollision, null, this);
        this.physics.add.overlap(this.player, this.goalTiles, this.handleGoalReached, null, this);
        this.physics.add.overlap(this.player, this.letters, this.collectLetter, null, this);
        this.physics.add.overlap(this.player, this.bombs, this.hitEnemy, null, this);
        this.physics.add.overlap(this.player, this.hovercrafts, this.hitEnemy, null, this);
        
        // Set up keyboard input
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D
        });
        
        // Create UI
        this.createUI();
        
        // Start hovercraft movement
        this.time.addEvent({
            delay: 1000,
            callback: this.updateHovercraftDirections,
            callbackScope: this,
            loop: true
        });
    }
    
    createTileLayer(layerName, tileWidth, tileHeight)
    {
        const layer = getLayer(this.mapData, layerName);
        if (!layer) return [];
        
        const sprites = [];
        for (let y = 0; y < layer.height; y++) {
            for (let x = 0; x < layer.width; x++) {
                const tileIndex = layer.data[y * layer.width + x];
                if (tileIndex > 0) {
                    // TMX uses 1-based indices, Phaser spritesheet uses 0-based
                    const sprite = this.add.sprite(
                        x * tileWidth + tileWidth / 2,
                        y * tileHeight + tileHeight / 2,
                        'sprites',
                        tileIndex - 1
                    );
                    sprites.push({ sprite, x, y, tileIndex });
                }
            }
        }
        return sprites;
    }
    
    createCollisionTiles(layerName, group, tileWidth, tileHeight)
    {
        const layer = getLayer(this.mapData, layerName);
        if (!layer) return;
        
        for (let y = 0; y < layer.height; y++) {
            for (let x = 0; x < layer.width; x++) {
                const tileIndex = layer.data[y * layer.width + x];
                if (tileIndex > 0) {
                    const zone = this.add.zone(
                        x * tileWidth + tileWidth / 2,
                        y * tileHeight + tileHeight / 2,
                        tileWidth,
                        tileHeight
                    );
                    group.add(zone);
                }
            }
        }
    }
    
    createLetters(tileWidth, tileHeight)
    {
        const letterGroup = getObjectGroup(this.mapData, 'Letter Layer');
        if (!letterGroup) return;
        
        letterGroup.objects.forEach(obj => {
            if (obj.type === 'letter') {
                const letter = extractLetterFromName(obj.name);
                // TMX object y is bottom-left, so adjust for center
                const letterSprite = this.physics.add.sprite(
                    obj.x + obj.width / 2,
                    obj.y - obj.height / 2,
                    'sprites',
                    obj.gid - 1
                );
                letterSprite.setData('letter', letter);
                letterSprite.setData('collected', false);
                this.letters.add(letterSprite);
            }
        });
    }
    
    createEnemies(tileWidth, tileHeight)
    {
        const enemyGroup = getObjectGroup(this.mapData, 'Enemy Layer');
        if (!enemyGroup) return;
        
        enemyGroup.objects.forEach(obj => {
            // TMX object y is bottom-left, so adjust for center
            const x = obj.x + (obj.width || tileWidth) / 2;
            const y = obj.y - (obj.height || tileHeight) / 2;
            
            if (obj.type === 'bomb') {
                const bomb = this.physics.add.sprite(x, y, 'sprites', obj.gid - 1);
                this.bombs.add(bomb);
            } else if (obj.type === 'hovercraft') {
                const hovercraft = this.physics.add.sprite(x, y, 'sprites', obj.gid - 1);
                hovercraft.setData('direction', Phaser.Math.Between(0, 3));
                hovercraft.setVelocity(0, 0);
                this.hovercrafts.add(hovercraft);
            }
        });
    }
    
    createPlayer(tileWidth, tileHeight)
    {
        const playerGroup = getObjectGroup(this.mapData, 'Player');
        let spawnX = 100;
        let spawnY = 100;
        
        if (playerGroup && playerGroup.objects.length > 0) {
            const spawn = playerGroup.objects.find(obj => obj.type === 'spawn');
            if (spawn) {
                spawnX = spawn.x;
                spawnY = spawn.y;
            }
        }
        
        this.player = this.physics.add.sprite(spawnX, spawnY, 'sprites', 268);
        this.player.setCollideWorldBounds(true);
        this.player.body.setSize(12, 12);
        this.player.setDepth(10);
        
        // Store boat sprite frame index (row 8, column 16 = index 7*25 + 15 = 190)
        this.boatFrame = 190;
        this.playerFrame = 268;
    }
    
    createUI()
    {
        // Background for UI (fixed to camera)
        this.add.rectangle(360, 20, 720, 40, 0x000000, 0.7).setDepth(100).setScrollFactor(0);
        
        // Level display
        this.levelText = this.add.text(10, 10, `Level ${this.currentLevel}`, {
            fontFamily: 'Arial',
            fontSize: 20,
            color: '#ffffff'
        }).setDepth(101).setScrollFactor(0);
        
        // Word to collect display
        this.wordText = this.add.text(360, 10, `Word: ${this.getWordDisplay()}`, {
            fontFamily: 'Arial',
            fontSize: 20,
            color: '#ffffff'
        }).setOrigin(0.5, 0).setDepth(101).setScrollFactor(0);
        
        // Instructions
        this.instructionText = this.add.text(710, 10, 'WASD/Arrows to move', {
            fontFamily: 'Arial',
            fontSize: 14,
            color: '#aaaaaa'
        }).setOrigin(1, 0).setDepth(101).setScrollFactor(0);
    }
    
    getWordDisplay()
    {
        let display = '';
        for (let i = 0; i < this.targetWord.length; i++) {
            const letter = this.targetWord[i];
            if (this.collectedLetters.includes(letter)) {
                display += letter;
            } else {
                display += '_';
            }
            if (i < this.targetWord.length - 1) display += ' ';
        }
        return display;
    }
    
    updateWordDisplay()
    {
        this.wordText.setText(`Word: ${this.getWordDisplay()}`);
        
        // Check if all letters are collected
        const allCollected = this.targetWord.split('').every(letter => 
            this.collectedLetters.includes(letter)
        );
        
        if (allCollected && !this.canCrossWater) {
            this.canCrossWater = true;
            this.wordText.setColor('#00ff00');
            
            // Remove water collision
            this.waterTiles.clear(true, true);
            
            // Show message
            const msg = this.add.text(360, 240, 'Water crossing unlocked!', {
                fontFamily: 'Arial Black',
                fontSize: 24,
                color: '#00ff00',
                stroke: '#000000',
                strokeThickness: 4
            }).setOrigin(0.5).setDepth(200);
            
            this.time.delayedCall(2000, () => {
                msg.destroy();
            });
        }
    }
    
    collectLetter(player, letterSprite)
    {
        if (letterSprite.getData('collected')) return;
        
        const letter = letterSprite.getData('letter');
        letterSprite.setData('collected', true);
        
        // Add to collected letters if it's part of the word and not already collected
        if (this.targetWord.includes(letter) && !this.collectedLetters.includes(letter)) {
            this.collectedLetters.push(letter);
            this.updateWordDisplay();
        }
        
        // Destroy the letter sprite with a small animation
        this.tweens.add({
            targets: letterSprite,
            alpha: 0,
            scale: 2,
            duration: 200,
            onComplete: () => {
                letterSprite.destroy();
            }
        });
    }
    
    handleWaterCollision(player, water)
    {
        // If player can't cross water, push them back
        if (!this.canCrossWater) {
            const pushBack = 5;
            if (player.body.velocity.x > 0) player.x -= pushBack;
            if (player.body.velocity.x < 0) player.x += pushBack;
            if (player.body.velocity.y > 0) player.y -= pushBack;
            if (player.body.velocity.y < 0) player.y += pushBack;
        }
    }
    
    handleGoalReached(player, goal)
    {
        if (!this.canCrossWater) return;
        
        // Prevent multiple triggers
        if (this.levelComplete) return;
        this.levelComplete = true;
        
        // Show level complete message
        const msg = this.add.text(360, 240, `Level ${this.currentLevel} Complete!`, {
            fontFamily: 'Arial Black',
            fontSize: 32,
            color: '#ffff00',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5).setDepth(200);
        
        this.time.delayedCall(2000, () => {
            if (this.currentLevel < 10) {
                this.scene.restart({ level: this.currentLevel + 1 });
            } else {
                // Game complete!
                this.scene.start('GameOver', { won: true });
            }
        });
    }
    
    hitEnemy(player, enemy)
    {
        // Player dies
        this.physics.pause();
        player.setTint(0xff0000);
        
        this.time.delayedCall(1000, () => {
            this.scene.start('GameOver', { won: false, level: this.currentLevel });
        });
    }
    
    updateHovercraftDirections()
    {
        this.hovercrafts.getChildren().forEach(hovercraft => {
            const direction = Phaser.Math.Between(0, 3);
            hovercraft.setData('direction', direction);
            
            const speed = 50;
            switch (direction) {
                case 0: // Up
                    hovercraft.setVelocity(0, -speed);
                    break;
                case 1: // Down
                    hovercraft.setVelocity(0, speed);
                    break;
                case 2: // Left
                    hovercraft.setVelocity(-speed, 0);
                    break;
                case 3: // Right
                    hovercraft.setVelocity(speed, 0);
                    break;
            }
        });
    }

    update ()
    {
        if (!this.player || !this.player.body) return;
        
        const speed = 100;
        let velocityX = 0;
        let velocityY = 0;
        
        // Check input
        if (this.cursors.left.isDown || this.wasd.left.isDown) {
            velocityX = -speed;
            this.player.setFlipX(true);
        } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
            velocityX = speed;
            this.player.setFlipX(false);
        }
        
        if (this.cursors.up.isDown || this.wasd.up.isDown) {
            velocityY = -speed;
        } else if (this.cursors.down.isDown || this.wasd.down.isDown) {
            velocityY = speed;
        }
        
        this.player.setVelocity(velocityX, velocityY);
        
        // Play animation based on movement
        if (velocityX !== 0 || velocityY !== 0) {
            if (!this.isInBoat) {
                this.player.play('player-walk', true);
            }
        } else {
            if (!this.isInBoat) {
                this.player.play('player-idle', true);
            }
        }
        
        // Check if player is on water (for boat sprite)
        if (this.canCrossWater) {
            const onWater = this.isPlayerOnWater();
            if (onWater && !this.isInBoat) {
                this.isInBoat = true;
                this.player.setFrame(this.boatFrame);
                this.player.stop();
            } else if (!onWater && this.isInBoat) {
                this.isInBoat = false;
                this.player.setFrame(this.playerFrame);
            }
        }
    }
    
    isPlayerOnWater()
    {
        const waterLayer = getLayer(this.mapData, 'Water');
        if (!waterLayer) return false;
        
        const tileX = Math.floor(this.player.x / this.mapData.tilewidth);
        const tileY = Math.floor(this.player.y / this.mapData.tileheight);
        
        if (tileX < 0 || tileX >= waterLayer.width || tileY < 0 || tileY >= waterLayer.height) {
            return false;
        }
        
        const tileIndex = waterLayer.data[tileY * waterLayer.width + tileX];
        return tileIndex > 0;
    }
}
