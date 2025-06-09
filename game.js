const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 580,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 500 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    }
};

const game = new Phaser.Game(config);

let player;
let stars;
let traps; // Grup untuk jebakan
let score = 0;
let scoreText;
let musicButton;
let soundButton;
let repeatButton; // Tombol repeat di UI utama
let isMusicPlaying = true;
let isSoundEnabled = true;
let bgm;
let collectSound;
let jumpSound;
let hitTrapSound;
let currentLevel = 1;
const maxLevel = 10;
let levelPlatforms = [];
let levelTraps = [];
let levelText;
let doubleJump = true;
let gameStarted = false;
let playButton;
let gameTitle;

let darkOverlay;
let endScreenOverlay;
let gameOverImage;
let winImage;
let endScreenRepeatButton;

function preload() {
    this.load.image('sky', 'Assets/sky3.png');
    this.load.image('ground', 'Assets/platform.png');
    this.load.image('ground2', 'Assets/platform2.png');
    this.load.image('ground3', 'Assets/platform3.png');
    this.load.image('star', 'Assets/star.png');
    this.load.image('repeat', 'Assets/repeat2.png');
    this.load.image('soundOn', 'Assets/soundOn.png');
    this.load.image('soundOff', 'Assets/soundOff.png');
    this.load.image('musicOn', 'Assets/musicOn.png');
    this.load.image('musicOff', 'Assets/musicOff.png');
    this.load.image('btnPlay', 'Assets/btPlay.png');
    this.load.image('trap', 'Assets/trap.png');
    this.load.image('trap2', 'Assets/trap2.png');
    this.load.image('trap3', 'Assets/trap3.png');
    this.load.image('trap4', 'Assets/trap4.png');
    this.load.image('gameover', 'Assets/gameover.png');
    this.load.image('win', 'Assets/win.png');
    this.load.image('judul', 'Assets/judul.png');
    this.load.audio('bgm', 'Assets/BGM.mp3');
    this.load.audio('collect', 'Assets/collect3.mp3');
    this.load.audio('jump', 'Assets/jump2.mp3');
    this.load.audio('hitTrap', 'Assets/hittrap.mp3');
    this.load.audio('win', 'Assets/win.mp3');
    this.load.audio('lose', 'Assets/lose.mp3');

    this.load.spritesheet('dude', 'Assets/dude2.png', {
        frameWidth: 88,
        frameHeight: 89
    });
}

function create() {
    this.add.image(400, 300, 'sky').setScale(0.8);

    darkOverlay = this.add.rectangle(0, 0, config.width, config.height, 0x000000, 0.5).setOrigin(0,0);
    darkOverlay.setDepth(5);

    gameTitle = this.add.image(config.width / 2, -200, 'judul')
    .setOrigin(0.5)
    .setScale(0.9)
    .setDepth(6);

    playButton = this.add.image(config.width / 2, config.height + 200, 'btnPlay')
        .setOrigin(0.5)
        .setDepth(6)
        .setScale(0.9)
        .setInteractive({ useHandCursor: true });
        
    this.tweens.add({
        targets: gameTitle,
        y: config.height / 2 - 100, // Posisi akhir Y
        duration: 1000,
        ease: 'Bounce.out',
        delay: 200
    });

    this.tweens.add({
        targets: playButton,
        y: config.height / 2 + 130, // Posisi akhir Y
        duration: 800,
        ease: 'Back.out',
        delay: 400
    });


    playButton.on('pointerdown', () => {
        this.tweens.add({
            targets: playButton,
            scale: 1,
            duration: 100,
            ease: 'Power1',
            yoyo: true, // Kembali ke skala semula
            onComplete: () => {
                this.tweens.add({
                    targets: gameTitle,
                    alpha: 0,
                    duration: 300,
                    ease: 'Power1'
                });

                this.tweens.add({
                    targets: playButton,
                    alpha: 0,
                    duration: 300,
                    ease: 'Power1',
                    onComplete: () => {
                        startGame.call(this);
                    }
                });
            }
        });
    });

    this.platformGroup = this.physics.add.staticGroup();
    traps = this.physics.add.staticGroup();

    levelPlatforms = [
        // ... (data level platform Anda tidak berubah)
        [ { x: 400, y: 520, key: 'ground', scale: 0.5 }, { x: 600, y: 400, key: 'ground', scale: 0.4 }, { x: 100, y: 250, key: 'ground', scale: 0.4 }, { x: 750, y: 220, key: 'ground', scale: 0.4 }, { x: 300, y: 320, key: 'ground2', scale: 0.35 }, { x: 210, y: 560, key: 'ground3', scale: 0.35 } ], [ { x: 500, y: 520, key: 'ground2', scale: 0.5 }, { x: 200, y: 420, key: 'ground', scale: 0.4 }, { x: 80, y: 300, key: 'ground3', scale: 0.4 }, { x: 360, y: 200, key: 'ground2', scale: 0.35 }, { x: 700, y: 400, key: 'ground', scale: 0.4 } ], [ { x: 400, y: 520, key: 'ground3', scale: 0.5 }, { x: 675, y: 450, key: 'ground3', scale: 0.4 }, { x: 498, y: 400, key: 'ground2', scale: 0.4 }, { x: 250, y: 300, key: 'ground', scale: 0.35 }, { x: 700, y: 220, key: 'ground2', scale: 0.3 }, { x: 100, y: 180, key: 'ground', scale: 0.3 } ], [ { x: 300, y: 520, key: 'ground', scale: 0.5 }, { x: 500, y: 440, key: 'ground2', scale: 0.4 }, { x: 390, y: 270, key: 'ground3', scale: 0.35 }, { x: 200, y: 350, key: 'ground3', scale: 0.4 }, { x: 700, y: 250, key: 'ground', scale: 0.35 }, { x: 100, y: 180, key: 'ground2', scale: 0.3 } ], [ { x: 510, y: 520, key: 'ground2', scale: 0.4 }, { x: 650, y: 420, key: 'ground2', scale: 0.4 }, { x: 350, y: 300, key: 'ground', scale: 0.35 }, { x: 200, y: 450, key: 'ground', scale: 0.35 }, { x: 90, y: 200, key: 'ground3', scale: 0.3 }, { x: 750, y: 150, key: 'ground2', scale: 0.3 } ], [ { x: 400, y: 520, key: 'ground', scale: 0.5 }, { x: 660, y: 460, key: 'ground3', scale: 0.4 }, { x: 200, y: 370, key: 'ground2', scale: 0.35 }, { x: 750, y: 370, key: 'ground2', scale: 0.38 }, { x: 500, y: 270, key: 'ground', scale: 0.35 }, { x: 300, y: 170, key: 'ground3', scale: 0.3 }, { x: 90, y: 270, key: 'ground3', scale: 0.3 } ], [ { x: 350, y: 520, key: 'ground3', scale: 0.5 }, { x: 220, y: 380, key: 'ground2', scale: 0.4 }, { x: 700, y: 320, key: 'ground', scale: 0.35 }, { x: 80, y: 560, key: 'ground', scale: 0.38 }, { x: 400, y: 220, key: 'ground3', scale: 0.3 }, { x: 600, y: 140, key: 'ground2', scale: 0.3 }, { x: 500, y: 140, key: 'ground2', scale: 0.3 } ], [ { x: 500, y: 520, key: 'ground2', scale: 0.5 }, { x: 250, y: 440, key: 'ground', scale: 0.4 }, { x: 650, y: 340, key: 'ground3', scale: 0.35 }, { x: 390, y: 200, key: 'ground3', scale: 0.4 }, { x: 150, y: 250, key: 'ground2', scale: 0.3 }, { x: 750, y: 180, key: 'ground', scale: 0.35 } ], [ { x: 370, y: 520, key: 'ground', scale: 0.5 }, { x: 800, y: 520, key: 'ground', scale: 0.4 }, { x: 30, y: 420, key: 'ground', scale: 0.4 }, { x: 550, y: 420, key: 'ground2', scale: 0.4 }, { x: 350, y: 320, key: 'ground3', scale: 0.35 }, { x: 200, y: 240, key: 'ground2', scale: 0.3 }, { x: 670, y: 150, key: 'ground3', scale: 0.3 } ], [ { x: 440, y: 520, key: 'ground3', scale: 0.5 }, { x: 650, y: 450, key: 'ground', scale: 0.4 }, { x: 300, y: 350, key: 'ground2', scale: 0.35 }, { x: 500, y: 250, key: 'ground', scale: 0.3 }, { x: 200, y: 550, key: 'ground', scale: 0.3 }, { x: 100, y: 170, key: 'ground3', scale: 0.25 }, { x: 780, y: 150, key: 'ground2', scale: 0.35 } ]
    ];

    levelTraps = [
        // ... (data level trap Anda tidak berubah)
        [], [ { x: 390, y: 570, key: 'trap3', scale: 0.2 } ], [ { x: 620, y: 570, key: 'trap4', scale: 0.25 }, { x: 60, y: 155, key: 'trap3', scale: 0.2 } ], [ { x: 650, y: 570, key: 'trap2', scale: 0.25 }, { x: 380, y: 482, key: 'trap3', scale: 0.2 } ], [ { x: 400, y: 565, key: 'trap2', scale: 0.3 }, { x: 700, y: 350, key: 'trap', scale: 0.24 } ], [ { x: 5, y: 190, key: 'trap', scale: 0.3 }, { x: 570, y: 570, key: 'trap2', scale: 0.23 } ], [ { x: 500, y: 567, key: 'trap2', scale: 0.3 }, { x: 150, y: 480, key: 'trap', scale: 0.23 } ], [ { x: 400, y: 320, key: 'trap', scale: 0.25 }, { x: 670, y: 565, key: 'trap2', scale: 0.3 } ], [ { x: 370, y: 482, key: 'trap3', scale: 0.2 }, { x: 120, y: 60, key: 'trap', scale: 0.25 }, {x: 800, y: 300, key: 'trap', scale: 0.3 } ], [ { x: 790, y: 400, key: 'trap', scale: 0.3 }, { x: 454, y: 482, key: 'trap3', scale: 0.2 }, { x: 5, y: 230, key: 'trap', scale: 0.3 } ]
    ];

    player = this.physics.add.sprite(50, 450, 'dude');
    player.setBounce(0.14);
    player.setCollideWorldBounds(true);
    player.body.setEnable(false);
    player.setVisible(false);

    this.anims.create({ key: 'left', frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }), frameRate: 10, repeat: -1 });
    this.anims.create({ key: 'turn', frames: [{ key: 'dude', frame: 4 }], frameRate: 20 });
    this.anims.create({ key: 'right', frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }), frameRate: 10, repeat: -1 });

    stars = this.physics.add.group();

    scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#000' });
    scoreText.setVisible(false).setDepth(1);

    levelText = this.add.text(650, 530, 'Level ' + currentLevel, { fontSize: '28px', fill: '#000' });
    levelText.setVisible(false).setDepth(1);

    this.physics.add.collider(player, this.platformGroup);
    this.physics.add.collider(stars, this.platformGroup);
    this.physics.add.overlap(player, stars, collectStar, null, this);
    this.physics.add.collider(player, traps, hitTrap, null, this);

    bgm = this.sound.add('bgm', { loop: true });
    collectSound = this.sound.add('collect');
    jumpSound = this.sound.add('jump');
    hitTrapSound = this.sound.add('hitTrap');
    winSound = this.sound.add('win');
    loseSound = this.sound.add('lose');

    const buttonX = 630, buttonY = 50, buttonSpacing = 60;
    musicButton = this.add.image(buttonX, buttonY, isMusicPlaying ? 'musicOn' : 'musicOff').setInteractive().on('pointerdown', toggleMusic);
    musicButton.setVisible(false).setDepth(1);
    soundButton = this.add.image(buttonX + buttonSpacing, buttonY, isSoundEnabled ? 'soundOn' : 'soundOff').setInteractive().on('pointerdown', toggleSound);
    soundButton.setVisible(false).setDepth(1);
    repeatButton = this.add.image(buttonX + 2 * buttonSpacing, buttonY, 'repeat').setInteractive().on('pointerdown', () => { restartGame.call(this); });
    repeatButton.setVisible(false).setDepth(1);

    endScreenOverlay = this.add.rectangle(0, 0, config.width, config.height, 0x000000, 0.7).setOrigin(0,0);
    endScreenOverlay.setDepth(10).setVisible(false);

    gameOverImage = this.add.image(config.width / 2, config.height / 2 - 50, 'gameover').setScale(0.7);
    gameOverImage.setDepth(11).setVisible(false);

    winImage = this.add.image(config.width / 2, config.height / 2 - 50, 'win').setScale(0.7);
    winImage.setDepth(11).setVisible(false);

    endScreenRepeatButton = this.add.image(config.width / 2, config.height / 2 + 80, 'btnPlay')
        .setInteractive()
        .on('pointerdown', () => { 
            this.tweens.add({
                targets: endScreenRepeatButton,
                scale: 0.9,
                duration: 100,
                yoyo: true,
                onComplete: () => {
                    restartGame.call(this);
                }
            });
        });
    endScreenRepeatButton.setScale(0);
    endScreenRepeatButton.setDepth(11).setVisible(false);

    loadInitialAssets.call(this, currentLevel);
}

function startGame() {
    if (gameStarted) return;
    gameStarted = true;

    // Sembunyikan judul, tombol play, dan overlay
    // setVisible(false) tidak lagi diperlukan karena sudah di-handle oleh animasi alpha
    darkOverlay.setVisible(false);

    hideEndScreen.call(this);

    player.setVisible(true);
    player.body.setEnable(true);
    player.clearTint();
    player.setPosition(50, 450);
    player.setVelocity(0,0);

    scoreText.setVisible(true);
    levelText.setVisible(true);
    musicButton.setVisible(true);
    soundButton.setVisible(true);
    repeatButton.setVisible(true);

    loadLevel.call(this, currentLevel);

    if (isMusicPlaying && !bgm.isPlaying) {
        bgm.play();
    }
    this.physics.resume();
}

function update() {
    if (!gameStarted) {
        return;
    }
    const cursors = this.input.keyboard.createCursorKeys();

    if (cursors.left.isDown) {
        player.setVelocityX(-160);
        player.anims.play('left', true);
    } else if (cursors.right.isDown) {
        player.setVelocityX(160);
        player.anims.play('right', true);
    } else {
        player.setVelocityX(0);
        player.anims.play('turn');
    }

    if (cursors.up.isDown && Phaser.Input.Keyboard.JustDown(cursors.up)) {
        if (player.body.onFloor()) {
            player.setVelocityY(-330);
            doubleJump = true;
            if (isSoundEnabled) jumpSound.play();
        } else if (doubleJump) {
            player.setVelocityY(-330);
            doubleJump = false;
            if (isSoundEnabled) jumpSound.play();
        }
    }
}

function loadInitialAssets(levelNumber) {
    this.platformGroup.clear(true, true);
    if (levelPlatforms[levelNumber - 1]) {
        levelPlatforms[levelNumber - 1].forEach(p => {
            this.platformGroup.create(p.x, p.y, p.key).setScale(p.scale).refreshBody();
        });
    }

    traps.clear(true, true);
    if (levelTraps[levelNumber - 1]) {
        levelTraps[levelNumber - 1].forEach(t => {
            traps.create(t.x, t.y, t.key).setScale(t.scale || 0.4).refreshBody(); // Beri default scale jika tidak ada
        });
    }
}


function loadLevel(levelNumber) {
    loadInitialAssets.call(this, levelNumber); // Memuat platform dan jebakan

    if (player) {
        player.setPosition(50, 450);
        player.setVelocity(0,0);
        player.body.setEnable(true);
        player.setVisible(true);
        player.clearTint();
    }

    stars.clear(true, true);
    if (currentLevel <= maxLevel) { // Hanya buat bintang jika bukan level setelah menang
        const newStars = this.physics.add.group({
            key: 'star',
            repeat: 11, // Jumlah bintang -1
            setXY: { x: 90, y: 0, stepX: 60 }
        });
        newStars.children.iterate(function (child) {
            child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
            child.setScale(0.15);
            child.body.setAllowGravity(true);
        });
        stars = newStars;
    }


    this.physics.world.colliders.getActive().forEach(collider => {
        if (collider.object1 === stars || collider.object2 === stars ||
            (collider.object1 === player && (collider.object2 === this.platformGroup || collider.object2 === traps)) || // Hapus collider player spesifik
            (collider.object2 === player && (collider.object1 === this.platformGroup || collider.object1 === traps))
           ) {
        }
    });
    this.physics.world.colliders.destroy(); // Hapus semua collider

    this.physics.add.collider(player, this.platformGroup);
    this.physics.add.collider(stars, this.platformGroup); // Collider bintang dengan platform
    this.physics.add.collider(player, traps, hitTrap, null, this); // Collider player dengan jebakan
    this.physics.add.overlap(player, stars, collectStar, null, this); // Overlap player dengan bintang


    if (levelText) {
        levelText.setText('Level ' + levelNumber);
        levelText.setVisible(true);
    }
}

function hitTrap(player, trap) {
    if (!gameStarted) return;

    gameStarted = false;
    this.physics.pause();
    player.setTint(0xff0000);
    player.anims.play('turn');
    if (bgm.isPlaying) bgm.stop();
    if (isSoundEnabled && hitTrapSound) hitTrapSound.play();

    // Hide main game UI
    scoreText.setVisible(false);
    levelText.setVisible(false);
    musicButton.setVisible(false);
    soundButton.setVisible(false);
    repeatButton.setVisible(false);

    // Show game over screen with animation
    endScreenOverlay.setVisible(true);
    gameOverImage.setVisible(true)
        .setScale(0)
        .setAlpha(0);
    endScreenRepeatButton.setVisible(true)
        .setScale(0)
        .setAlpha(0);

    // Animation sequence
    this.tweens.add({
        targets: gameOverImage,
        scale: 0.65,
        alpha: 1,
        duration: 500,
        ease: 'Back.out'
    });

    this.tweens.add({
        targets: endScreenRepeatButton,
        scale: 0.8,
        alpha: 1,
        duration: 500,
        ease: 'Back.out',
        delay: 200
    });

    if (isSoundEnabled) loseSound.play();
}

function collectStar(player, star) {
    if (!gameStarted) return;

    star.disableBody(true, true);
    score += 10;
    scoreText.setText('Score: ' + score);

    if (isSoundEnabled) collectSound.play();

    if (stars.countActive(true) === 0) {
        if (!this.scene.isActive()) return;

        if (currentLevel < maxLevel) {
            currentLevel++;
            loadLevel.call(this, currentLevel);
        } else {
            gameStarted = false;
            this.physics.pause();
            player.anims.play('turn');
            if (bgm.isPlaying) bgm.stop();

            if (isSoundEnabled) winSound.play();

            scoreText.setVisible(false);
            levelText.setVisible(false);
            musicButton.setVisible(false);
            soundButton.setVisible(false);
            repeatButton.setVisible(false);

            endScreenOverlay.setVisible(true);
            winImage.setVisible(true)
                .setScale(0)
                .setAlpha(0);
            endScreenRepeatButton.setVisible(true)
                .setScale(0)
                .setAlpha(0);

            this.tweens.add({
                targets: winImage,
                scale: 0.55,
                alpha: 1,
                duration: 500,
                ease: 'Back.out'
            });

            this.tweens.add({
                targets: endScreenRepeatButton,
                scale: 0.7,
                alpha: 1,
                duration: 500,
                ease: 'Back.out',
                delay: 200
            });
        }
    }
}

function hideEndScreen() {
    if(endScreenOverlay) endScreenOverlay.setVisible(false);
    if(gameOverImage) gameOverImage.setVisible(false);
    if(winImage) winImage.setVisible(false);
    if(endScreenRepeatButton) endScreenRepeatButton.setVisible(false);
}

function toggleMusic() {
    if (bgm.isPlaying) {
        bgm.pause();
        musicButton.setTexture('musicOff');
        isMusicPlaying = false;
    } else {
        if (gameStarted) {
           bgm.resume();
        }
        musicButton.setTexture('musicOn');
        isMusicPlaying = true;
    }
}

function toggleSound() {
    isSoundEnabled = !isSoundEnabled;
    soundButton.setTexture(isSoundEnabled ? 'soundOn' : 'soundOff');
}

function restartGame() {
    gameStarted = false; 
    this.physics.resume();
    score = 0;
    currentLevel = 1;

    hideEndScreen.call(this);

    if (bgm && bgm.isPlaying) {
        bgm.stop();
    }

    scoreText.setText('Score: ' + score);

    startGame.call(this);
}