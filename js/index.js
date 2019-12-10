let phaserConfig = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {y: 300},
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
}

let game = new Phaser.Game(phaserConfig);

function preload() {
    this.load.image('sky', 'assets/sky.png');
    this.load.image('ground', 'assets/platform.png');
    this.load.image('star', 'assets/star.png');
    this.load.image('bomb', 'assets/bomb.png');

    this.load.spritesheet('dude', 'assets/dude.png', {
        frameWidth: 32, frameHeight:48
    });
}

function create() {
    this.add.image(400, 300, 'sky');
    
    platforms = this.physics.add.staticGroup();

    platforms.create(400, 568, 'ground').setScale(2).refreshBody();

    platforms.create(600, 400, 'ground');
    platforms.create(50, 250, 'ground');
    platforms.create(750, 220, 'ground');

    // players
    players = this.physics.add.sprite(100, 450, 'dude');

    players.setBounce(0.2);
    players.setCollideWorldBounds(true);

    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('dude', {start: 0, end: 3}),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
       key: 'turn',
       frames: [{key: 'dude', frame: 4}],
       frameRate: 20 
    });

    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('dude', {start: 5, end: 8}),
        frameRate: 10,
        repeat: -1
    });

    // add collider to the ground
    this.physics.add.collider(players, platforms);

    // add cursor control
    cursors = this.input.keyboard.createCursorKeys();


    // add stars
    stars = this.physics.add.group({
        key: 'star',
        repeat: 11,
        setXY: {x: 12, y: 0, stepX: 70}
    });

    stars.children.iterate(function (child) {
        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
    });

    this.physics.add.collider(stars, platforms);

    // add overlap to stars and players
    this.physics.add.overlap(players, stars, collectStar, null, this);

    function collectStar (player, star) {
        star.disableBody(true, true);

        // update score
        score +=1;
        textScore.setText('Score: ' + score);

        if (stars.countActive(true) === 0) {
            stars.children.iterate(function (child) {
                child.enableBody(true, child.x, 0, true, true);
            });

            let x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);

            let bomb = bombs.create(x, 16, 'bombs');
            bomb.setBounce(1);
            bomb.setCollideWorldBounds(true);
            bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
        }
    }

    // create text score
    let score = 0;
    let textScore = this.add.text(16,16, 'score: 0', { fontSize: '32px', fill: '#000' });


    // add bomb
    bombs = this.physics.add.group();
    this.physics.add.collider(bombs, platforms);
    this.physics.add.collider(players, bombs, hitBombs, null, this);

    function hitBombs (player, bomb) {
        this.physics.pause();
        player.setTint(0xff0000);
        player.anims.play('turn');

        gameOver = true;
    }
}

function update() {
    // control cursor
    if (cursors.left.isDown) {
        players.setVelocityX(-160);
        players.anims.play('left', true);

    } else if (cursors.right.isDown) {
        players.setVelocityX(160);
        players.anims.play('right', true);
    } else if (cursors.down.isDown) {
        players.setVelocityY(100);
    } else {
        players.setVelocityX(0);
        players.anims.play('turn');
    }

    if (cursors.up.isDown && players.body.touching.down) {
        players.setVelocityY(-320);
    }
}