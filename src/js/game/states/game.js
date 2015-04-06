(function () {
    var Stats = require('Stats');
    var properties = require('../properties');
    var Missile = require('../entities/Missile')
    var Asteroid = require('../entities/Asteroid')


    var Game = function (game) {

    };

    Game.prototype = {

        create: function () {
            //  This will run in Canvas mode, so let's gain a little speed and display
            this.game.renderer.clearBeforeRender = false;
            this.game.renderer.roundPixels = true;
            this.game.physics.startSystem(Phaser.Physics.ARCADE);
            this.game.world.setBounds(0, 0, 1920, 1324);

            // Game functions
            this.setupBackground();
            this.setupPlayer();
            this.setupTrail();
            this.setupAsteroids();
            this.setupEnemies();
            this.setupMissiles();
            this.setupBullets();
            this.setupExplosions();
            this.setupPlayerIcons();
            this.setupText();

            // Create four arrow keys
            this.cursors = this.input.keyboard.createCursorKeys();
            // And add KeyCaptures for WASD and Spacebar
            this.game.input.keyboard.addKeyCapture([Phaser.Keyboard.W]);
            this.game.input.keyboard.addKeyCapture([Phaser.Keyboard.A]);
            this.game.input.keyboard.addKeyCapture([Phaser.Keyboard.S]);
            this.game.input.keyboard.addKeyCapture([Phaser.Keyboard.D]);
            this.game.input.keyboard.addKeyCapture([Phaser.Keyboard.SPACEBAR]);

            // Define constants
            this.SHOT_DELAY = 100; // milliseconds (10 bullets/second)
            this.BULLET_SPEED = 400; // pixels/second
            this.NUMBER_OF_BULLETS = 20;

            // Simulate a pointer click/tap input at the center of the stage
            // when the example begins running.
            this.game.input.activePointer.x = this.game.width / 2;
            this.game.input.activePointer.y = this.game.height / 2;

        },

        update: function () {
            this.checkCollisions();
            //this.spawnEnemies();
            //this.enemyFire();
            this.processPlayerInput();
            this.processDelayedEffects();
            //this.renderBitmapTrail();

            this.updateMissile();
            //Asteroid.prototype.update();

            // These functions below are not needed/implemented, but do not delete
            //this.scrollBackground();
            /*this.screenWrap(this.player);
            this.bulletPool.forEachExists(this.screenWrap, this);*/
        },

        updateMissile: function () {
            // If there aren't any missiles, launch one
            if (this.missileGroup.countLiving() === 0) {
                this.launchMissile(this.game.width / 2, this.game.height - 16);
            }

            // If any missile is within a certain distance of the mouse pointer, blow it up
            this.missileGroup.forEachAlive(function (m) {
                var distance = this.game.math.distance(m.x, m.y,
                    this.game.input.activePointer.x, this.game.input.activePointer.y);
                if (distance < 25) {
                    m.kill();
                    this.explode(m);
                }
            }, this);
        },

        // create()- related functions
        setupBackground: function () {
            //this.background = this.game.add.sprite(0, 0, 'milkyway');
            this.background = this.game.add.tileSprite(0, 0, 1920, 1324, 'milkyway');
        },

        setupPlayer: function () {
            this.player = this.add.sprite(this.game.width / 2, this.game.height / 2, 'player');
            this.player.anchor.setTo(0.5);

            //  and its physics settings
            this.physics.enable(this.player, Phaser.Physics.ARCADE);
            this.player.body.drag.set(50);
            this.player.body.maxVelocity.set(250);

            // 25 x 25 pixel hitbox, centered
            this.player.body.setSize(25, 25, 0, 0);
            this.player.body.collideWorldBounds = true;

            // Player Properties
            this.weaponLevel = 0;
            //this.player.speed = 300;
            this.acceleration = 600;
            this.drag = 400;
            this.maxSpeed = 400;
            // Have the camera follow player ship
            this.game.camera.follow(this.player);
        },

        setupTrail: function () {
            //create an emitter
            this.emitter = this.game.add.emitter(0, 0, 50);
            this.emitter.makeParticles('jets');
            this.emitter.gravity = 0;
            // Attach the emitter to the sprite
            this.player.addChild(this.emitter);
            //position the emitter relative to the sprite's anchor location
            this.emitter.y = 0;
            this.emitter.x = -16;

            var px = this.player.body.velocity.x * 10;
            var py = this.player.body.velocity.y * 10;

            px *= -1;
            py *= -1;

            // setup options for the emitter
            this.emitter.lifespan = 500;
            this.emitter.maxParticleSpeed = new Phaser.Point(-100, 50);
            this.emitter.minParticleSpeed = new Phaser.Point(-200, -50);

        },

        setupAsteroids: function () {
            Asteroid.setupAsteroidGroup();
        },
        hitAsteroid: function (player, asteroid) {
            console.log('nailing the asteroid');
            //this.explode(player);
            //this.player.destroy();
        },

        setupEnemies: function () {
            // Green enemy 'enemy'
            this.enemyPool = this.add.group();
            this.enemyPool.enableBody = true;
            this.enemyPool.physicsBodyType = Phaser.Physics.ARCADE;
            this.enemyPool.createMultiple(50, 'frigate_02');
            this.enemyPool.setAll('anchor.x', 0.5);
            this.enemyPool.setAll('anchor.y', 0.5);
            this.enemyPool.setAll('outOfBoundsKill', true);
            this.enemyPool.setAll('checkWorldBounds', true);
            this.enemyPool.setAll('reward', 100, false, false, 0, true);
            this.enemyPool.setAll('dropRate', 0.2, false, false, 0, true);

            // Set the animation for each sprite
            this.enemyPool.forEach(function (enemy) {
                enemy.animations.add('fly', [0, 1, 2], 20, true);
                enemy.animations.add('hit', [3, 1, 3, 2], 20, false);
                enemy.events.onAnimationComplete.add(function (e) {
                    e.play('fly');
                }, this);
            });
            this.nextEnemyAt = 0;
            this.enemyDelay = Phaser.Timer.SECOND;
            // White enemy 'shooter'
            this.shooterPool = this.add.group();
            this.shooterPool.enableBody = true;
            this.shooterPool.physicsBodyType = Phaser.Physics.ARCADE;
            this.shooterPool.createMultiple(20, 'frigate_01');
            this.shooterPool.setAll('anchor.x', 0.5);
            this.shooterPool.setAll('anchor.y', 0.5);
            this.shooterPool.setAll('outOfBoundsKill', true);
            this.shooterPool.setAll('checkWorldBounds', true);
            this.shooterPool.setAll('reward', 200, false, false, 0, true);
            this.shooterPool.setAll('dropRate', 0.2, false, false, 0, true);

            // Set the animation for each sprite
            this.shooterPool.forEach(function (enemy) {
                enemy.animations.add('fly', [0, 1, 2], 20, true);
                enemy.animations.add('hit', [3, 1, 3, 2], 20, false);
                enemy.events.onAnimationComplete.add(function (e) {
                    e.play('fly');
                }, this);
            });
            // start spawning 5 seconds into the game
            this.nextShooterAt = this.time.now + Phaser.Timer.SECOND * 5;
            this.shooterDelay = Phaser.Timer.SECOND * 3;
            // Boss sprite pool
            this.bossPool = this.add.group();
            this.bossPool.enableBody = true;
            this.bossPool.physicsBodyType = Phaser.Physics.ARCADE;
            this.bossPool.createMultiple(1, 'boss');
            this.bossPool.setAll('anchor.x', 0.5);
            this.bossPool.setAll('anchor.y', 0.5);
            this.bossPool.setAll('outOfBoundsKill', true);
            this.bossPool.setAll('checkWorldBounds', true);
            this.bossPool.setAll('reward', 5000, false, false, 0, true);
            this.bossPool.setAll('dropRate', 0, false, false, 0, true);
            // Set the animation for each sprite
            this.bossPool.forEach(function (enemy) {
                enemy.animations.add('fly', [0, 1, 2], 20, true);
                enemy.animations.add('hit', [3, 1, 3, 2], 20, false);
                enemy.events.onAnimationComplete.add(function (e) {
                    e.play('fly');
                }, this);
            });
            this.boss = this.bossPool.getTop();
            this.bossApproaching = false;
        },

        setupBullets: function () {
            this.enemyBulletPool = this.add.group();
            this.enemyBulletPool.enableBody = true;
            this.enemyBulletPool.physicsBodyType = Phaser.Physics.ARCADE;
            this.enemyBulletPool.createMultiple(100, 'enemyBullet');
            this.enemyBulletPool.setAll('anchor.x', 0.5);
            this.enemyBulletPool.setAll('anchor.y', 0.5);
            this.enemyBulletPool.setAll('outOfBoundsKill', true);
            this.enemyBulletPool.setAll('checkWorldBounds', true);
            this.enemyBulletPool.setAll('reward', 0, false, false, 0, true);
            // Add an empty sprite group into our game
            this.bulletPool = this.add.group();
            // Enable physics to the whole sprite group
            this.bulletPool.enableBody = true;
            this.bulletPool.physicsBodyType = Phaser.Physics.ARCADE;
            // Add 100 'bullet' sprites in the group.
            // By default this uses the first frame of the sprite sheet and
            //   sets the initial state as non-existing (i.e. killed/dead)
            this.bulletPool.createMultiple(100, 'bullet');
            // Sets anchors of all sprites
            this.bulletPool.setAll('anchor.x', 0.5);
            this.bulletPool.setAll('anchor.y', 0.5);
            // Automatically kill the bullet sprites when they go out of bounds
            this.bulletPool.setAll('outOfBoundsKill', true);
            this.bulletPool.setAll('checkWorldBounds', true);

            // Rate of fire
            this.nextShotAt = 0;
            this.shotDelay = Phaser.Timer.SECOND * 0.1;
        },

        setupMissiles: function () {
            // Create a group to hold the missile
            this.missileGroup = this.game.add.group();

            // If there aren't any missiles, launch one
            if (this.missileGroup.countLiving() === 0) {
                this.fireMissile(this.game.width / 2, this.game.height - 16);
            }

            // If any missile is within a certain distance of the mouse pointer, blow it up
            this.missileGroup.forEachAlive(function (m) {
                var distance = this.game.math.distance(m.x, m.y,
                    this.player.x, this.player.y);
                if (distance < 50) {
                    m.kill();
                    this.explode(m);
                }
            }, this);

        },

        fireMissile: function (x, y) {
            // // Get the first dead missile from the missileGroup
            var missile = this.missileGroup.getFirstDead();

            // If there aren't any available, create a new one
            if (missile === null) {
                missile = new Missile(this.game);
                this.missileGroup.add(missile);
            }

            // Revive the missile (set it's alive property to true)
            // You can also define a onRevived event handler in your explosion objects
            // to do stuff when they are revived.
            missile.revive();

            // Move the missile to the given coordinates
            missile.x = x;
            missile.y = y;

            return missile;
        },

        setupExplosions: function () {
            this.explosionPool = this.add.group();
            this.explosionPool.enableBody = true;
            this.explosionPool.physicsBodyType = Phaser.Physics.ARCADE;
            this.explosionPool.createMultiple(100, 'explosion');
            this.explosionPool.setAll('anchor.x', 0.5);
            this.explosionPool.setAll('anchor.y', 0.5);
            this.explosionPool.forEach(function (explosion) {
                explosion.animations.add('boom');
            });
        },

        setupEmitterExplosions: function () {
            var emitter = this.game.add.emitter(this.player.x, this.player.y, 100);
            emitter.makeParticles('playerParticle');
            emitter.minParticleSpeed.setTo(-200, -200);
            emitter.maxParticleSpeed.setTo(200, 200);
            emitter.gravity = 0;
            emitter.start(true, 1000, null, 100);
        },

        setupPlayerIcons: function () {
            // Setup sprite group for Power-Ups
            this.powerUpPool = this.add.group();
            this.powerUpPool.enableBody = true;
            this.powerUpPool.physicsBodyType = Phaser.Physics.ARCADE;
            this.powerUpPool.createMultiple(5, 'powerup1');
            this.powerUpPool.setAll('anchor.x', 0.5);
            this.powerUpPool.setAll('anchor.y', 0.5);
            this.powerUpPool.setAll('outOfBoundsKill', true);
            this.powerUpPool.setAll('checkWorldBounds', true);
            this.powerUpPool.setAll('reward', 100, false, false, 0, true);

            this.lives = this.add.group();
            // calculate location of first life icon
            var firstLifeIconX = this.game.width - 10 - (3 * 30);
            for (var i = 0; i < 3; i++) {
                var life = this.lives.create(firstLifeIconX + (30 * i), 30, 'frigate_01');
                life.scale.setTo(0.5, 0.5);
                life.anchor.setTo(0.5, 0.5);
            }
        },

        setupText: function () {
            this.instructions = this.add.text(this.game.width / 2, this.game.height - 100, 'Use Arrow Keys to Move, Press SPACE to Fire\n' + 'Tapping/clicking does both', {
                font: '20px monospace',
                fill: '#fff',
                align: 'center'
            });
            this.instructions.anchor.setTo(0.5, 0.5);
            this.instExpire = this.time.now + 6000;
            this.score = 0;
            this.scoreText = this.add.text(this.game.width / 2, 30, '' + this.score, {
                font: '20px monospace',
                fill: '#fff',
                align: 'center'
            });
            this.scoreText.anchor.setTo(0.5, 0.5);

        },

        setupBitmapTrail: function () {
            this.bmd = this.game.add.bitmapData(1920, 1324);
            this.bmd.context.fillStyle = '#ffffff';
            var bg = this.game.add.sprite(0, 0, this.bmd);
        },

        setupAudio: function () {
            this.explosionSFX = this.add.audio('explosion');
            this.playerExplosionSFX = this.add.audio('playerExplosion');
            this.enemyFireSFX = this.add.audio('enemyFire');
            this.playerFireSFX = this.add.audio('playerFire');
            this.powerUpSFX = this.add.audio('powerUp');
        },

        // update()- related functions
        checkCollisions: function () {
            //collision between player and asteroids
            this.physics.arcade.collide(this.player, Asteroid.asteroids, this.hitAsteroid, null, this);
            this.physics.arcade.overlap(this.bulletPool, this.enemyPool, this.enemyHit, null, this);
            this.physics.arcade.overlap(this.bulletPool, this.shooterPool, this.enemyHit, null, this);
            this.physics.arcade.overlap(this.bulletPool, Asteroid.asteroids, this.asteroidHit, null, this);
            this.physics.arcade.overlap(this.player, this.enemyPool, this.playerHit, null, this);
            this.physics.arcade.overlap(this.player, this.shooterPool, this.playerHit, null, this);
            this.physics.arcade.overlap(this.player, this.enemyBulletPool, this.playerHit, null, this);
            this.physics.arcade.overlap(this.player, this.powerUpPool, this.playerPowerUp, null, this);
            if (this.bossApproaching === false) {
                this.physics.arcade.overlap(this.bulletPool, this.bossPool, this.enemyHit, null, this);
                this.physics.arcade.overlap(this.player, this.bossPool, this.playerHit, null, this);
            }
        },

        spawnEnemies: function () {
            if (this.nextEnemyAt < this.time.now && this.enemyPool.countDead() > 0) {
                this.nextEnemyAt = this.time.now + this.enemyDelay;
                var enemy = this.enemyPool.getFirstExists(false);
                // spawn at a random location top of the screen
                enemy.reset(this.rnd.integerInRange(20, this.game.width - 20), 0, 2);
                // also randomize the speed
                enemy.body.velocity.y = this.rnd.integerInRange(30, 60);
                enemy.angle = 180;
                enemy.play('fly');
            }
            if (this.nextShooterAt < this.time.now && this.shooterPool.countDead() > 0) {
                this.nextShooterAt = this.time.now + this.shooterDelay;
                var shooter = this.shooterPool.getFirstExists(false);
                // spawn at a random location at the top  
                shooter.reset(
                    this.rnd.integerInRange(20, this.game.width - 20), 0, 5);
                // choose a random target location at the bottom
                var target = this.rnd.integerInRange(20, this.game.width - 20);
                // move to target and rotate the sprite accordingly  
                shooter.rotation = this.physics.arcade.moveToXY(
                    shooter, target, this.game.height,
                    this.rnd.integerInRange(35, 80)) - Math.PI / 2;

                shooter.play('fly');
                // each shooter has their own shot timer 
                shooter.nextShotAt = 0;
            }
        },

        enemyFire: function () {
            this.shooterPool.forEachAlive(function (enemy) {
                if (this.time.now > enemy.nextShotAt && this.enemyBulletPool.countDead() > 0) {
                    var bullet = this.enemyBulletPool.getFirstExists(false);
                    bullet.reset(enemy.x, enemy.y);
                    this.physics.arcade.moveToObject(bullet, this.player, 150);
                    enemy.nextShotAt = this.time.now + Phaser.Timer.SECOND * 2;
                    //this.enemyFireSFX.play();
                }
            }, this);
            // Boss fire code
            if (this.bossApproaching === false && this.boss.alive && this.boss.nextShotAt < this.time.now && this.enemyBulletPool.countDead() >= 10) {
                this.boss.nextShotAt = this.time.now + Phaser.Timer.SECOND;
                //this.enemyFireSFX.play();
                for (var i = 0; i < 5; i++) {
                    // process 2 bullets at a time
                    var leftBullet = this.enemyBulletPool.getFirstExists(false);
                    leftBullet.reset(this.boss.x - 10 - i * 10, this.boss.y + 20);
                    var rightBullet = this.enemyBulletPool.getFirstExists(false);
                    rightBullet.reset(this.boss.x + 10 + i * 10, this.boss.y + 20);
                    if (this.boss.health > 200 / 2) {
                        // aim directly at the player
                        this.physics.arcade.moveToObject(leftBullet, this.player, 150);
                        this.physics.arcade.moveToObject(rightBullet, this.player, 150);
                    } else {
                        // aim slightly off center of the player
                        this.physics.arcade.moveToXY(leftBullet, this.player.x - i * 100, this.player.y, 150);
                        this.physics.arcade.moveToXY(rightBullet, this.player.x + i * 100, this.player.y, 150);
                    }
                }
            }
        },

        processPlayerInput: function () {
            //  This will update the sprite.rotation so that it points to the currently active pointer
            //  On a Desktop that is the mouse, on mobile the most recent finger press.
            this.player.rotation = this.game.physics.arcade.angleToPointer(this.player);

            // Up and Down movement
            if (this.cursors.up.isDown || this.input.keyboard.isDown(Phaser.Keyboard.W)) {
                this.game.physics.arcade.accelerationFromRotation(this.player.rotation, 200, this.player.body.acceleration);
                this.renderTrail();
            } else if (this.cursors.down.isDown || this.input.keyboard.isDown(Phaser.Keyboard.S)) {
                this.game.physics.arcade.accelerationFromRotation(this.player.rotation, -100, this.player.body.acceleration);
            } else {
                this.player.body.acceleration.set(0);
            }

            // Left and Right movement
            if (this.cursors.left.isDown || this.input.keyboard.isDown(Phaser.Keyboard.A)) {
                // This used to turn the ship: this.player.body.angularVelocity = -300;
            } else if (this.cursors.right.isDown || this.input.keyboard.isDown(Phaser.Keyboard.D)) {
                // This used to turn the ship: this.player.body.angularVelocity = 300;
            } else {
                //this.player.body.angularVelocity = 0;
            }

            // Fire the weapon when SPACEBAR or Left-Mouse is pressed
            if (this.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR) || this.input.activePointer.isDown) {
                if (this.returnText && this.returnText.exists) {
                    this.quitGame();
                } else {
                    this.fire();
                }
            }
        },

        processDelayedEffects: function () {
            if (this.instructions.exists && this.time.now > this.instExpire) {
                this.instructions.destroy();
            }
            if (this.ghostUntil && this.ghostUntil < this.time.now) {
                this.ghostUntil = null;
                this.player.play('fly');
            }
            if (this.showReturn && this.time.now > this.showReturn) {
                this.returnText = this.add.text(this.game.width / 2, this.game.height / 2 + 20, 'Press Z or Tap Game to go back to Main Menu', {
                    font: '16px sans-serif',
                    fill: '#fff'
                });
                this.returnText.anchor.setTo(0.5, 0.5);
                this.showReturn = false;
            }
            if (this.bossApproaching && this.boss.y > 80) {
                this.bossApproaching = false;
                this.boss.nextShotAt = 0;
                this.boss.body.velocity.y = 0;
                this.boss.body.velocity.x = 200;
                // allow bouncing off world bounds
                this.boss.body.bounce.x = 1;
                this.boss.body.collideWorldBounds = true;
            }
        },

        renderTrail: function () {
            // emit a single particle every frame that the mouse is down
            this.emitter.emitParticle();
            //this.emitter.start(true, 1000, 8);
        },

        renderBitmapTrail: function () {
            this.bmd.context.fillRect(this.player.x, this.player.y, 1, 1);
            this.bmd.dirty = true;
        },

        enemyHit: function (bullet, enemy) {
            bullet.kill();
            this.damageEnemy(enemy, 1);
        },

        asteroidHit: function (bullet, asteroid) {
            bullet.kill();
            this.damageAsteroid(asteroid, 1);
        },
        
        playerHit: function (player, enemy) {
            //this.playerExplosionSFX.play();
            // crashing into an enemy only deals 5 damage
            this.damageEnemy(enemy, 5);
            this.explode(player);
            player.kill();
            var life = this.lives.getFirstAlive();
            if (life !== null) {
                life.kill();
                this.weaponLevel = 0;
            } else {
                this.explode(player);
                player.kill();
                this.displayEnd(false);
            }
        },

        damageEnemy: function (enemy, damage) {
            enemy.damage(damage);
            if (enemy.alive) {
                enemy.play('hit');
            } else {
                this.explode(enemy);
                //this.explosionSFX.play();
                this.spawnPowerUp(enemy);
                this.addToScore(enemy.reward);
                // We check the sprite key (e.g. 'greenEnemy') to see if the sprite is a boss
                // For full games, it would be better to set flags on the sprites themselves
                if (enemy.key === 'boss') {
                    this.enemyPool.destroy();
                    this.shooterPool.destroy();
                    this.bossPool.destroy();
                    this.enemyBulletPool.destroy();
                    this.displayEnd(true);
                }
            }
        },

        damageAsteroid: function (asteroid, damage) {
            asteroid.damage(damage);
            if (asteroid.alive) {
                console.log("asteroid being hit is alive");
                //asteroid.play('hit');
            } else {
                //this.explode(asteroid);
                console.log("asteroid should be dead");
                //this.explosionSFX.play();
                //this.spawnPowerUp(enemy);
                //this.addToScore(enemy.reward);
            }
        },
        
        addToScore: function (score) {
            this.score += score;
            this.scoreText.text = this.score;
            // this approach prevents the boss from spawning again upon winning
            if (this.score >= 20000 && this.bossPool.countDead() == 1) {
                this.spawnBoss();
            }
        },

        playerPowerUp: function (player, powerUp) {
            this.addToScore(powerUp.reward);
            powerUp.kill();
            //this.powerUpSFX.play();
            if (this.weaponLevel < 5) {
                this.weaponLevel++;
            }
        },

        displayEnd: function (win) {
            // you can't win and lose at the same time
            if (this.endText && this.endText.exists) {
                return;
            }

            var msg = win ? 'You Win! Greeaat Jooob!!!' : 'Game Over nub!';
            this.endText = this.add.text(this.game.width / 2, this.game.height / 2 - 60, msg, {
                font: '72px serif',
                fill: '#fff'
            });
            this.endText.anchor.setTo(0.5, 0);

            this.showReturn = this.time.now + Phaser.Timer.SECOND * 2;
        },

        explode: function (sprite) {
            if (this.explosionPool.countDead() === 0) {
                return;
            }
            var explosion = this.explosionPool.getFirstExists(false);
            explosion.reset(sprite.x, sprite.y);
            explosion.play('boom', 15, false, true);
            // Add the original sprite's velocity to the explosion
            explosion.body.velocity.x = sprite.body.velocity.x;
            explosion.body.velocity.y = sprite.body.velocity.y;
        },

        spawnPowerUp: function (enemy) {
            if (this.powerUpPool.countDead() === 0 || this.weaponLevel === 5) {
                return;
            }
            if (this.rnd.frac() < enemy.dropRate) {
                var powerUp = this.powerUpPool.getFirstExists(false);
                powerUp.reset(enemy.x, enemy.y);
                powerUp.body.velocity.y = 100;
            }
        },

        spawnBoss: function () {
            this.bossApproaching = true;
            this.boss.reset(this.game.width / 2, 0, 250);
            this.physics.enable(this.boss, Phaser.Physics.ARCADE);
            this.boss.body.velocity.y = 15;
            this.boss.play('fly');
        },

        fire: function () {
            // Rate of fire
            if (!this.player.alive || this.nextShotAt > this.time.now) {
                return;
            }
            // Rate of fire
            this.nextShotAt = this.time.now + this.shotDelay;
            //this.playerFireSFX.play();
            var bullet;
            if (this.weaponLevel === 0) {
                if (this.bulletPool.countDead() === 0) {
                    return;
                }
                // Revives the first dead bullet from the bulletPool
                bullet = this.bulletPool.getFirstExists(false);
                // Set the bullet position to the gun position.
                bullet.reset(this.player.x, this.player.y);
                bullet.rotation = this.player.rotation;
                // Shoot it in the right direction
                bullet.body.velocity.x = Math.cos(bullet.rotation) * this.BULLET_SPEED;
                bullet.body.velocity.y = Math.sin(bullet.rotation) * this.BULLET_SPEED;
            } else {
                if (this.bulletPool.countDead() < this.weaponLevel * 2) {
                    return;
                }
                for (var i = 0; i < this.weaponLevel; i++) {
                    bullet = this.bulletPool.getFirstExists(false);
                    // spawn left bullet slightly left off center
                    bullet.reset(this.player.x - (10 + i * 6), this.player.y - 20);
                    // the left bullets spread from -95 degrees to -135 degrees
                    this.physics.arcade.velocityFromAngle(-95 - i * 10, 500, bullet.body.velocity);

                    bullet = this.bulletPool.getFirstExists(false);
                    // spawn right bullet slightly right off center
                    bullet.reset(this.player.x + (10 + i * 6), this.player.y - 20);
                    // the right bullets spread from -85 degrees to -45
                    this.physics.arcade.velocityFromAngle(-85 + i * 10, 500, bullet.body.velocity);
                }
            }
        },

        quitGame: function (pointer) {
            //  Here you should destroy anything you no longer need.
            //  Stop music, delete sprites, purge caches, free resources, all that good stuff.
            this.sea.destroy();
            this.player.destroy();
            this.enemyPool.destroy();
            this.bulletPool.destroy();
            this.explosionPool.destroy();
            this.shooterPool.destroy();
            this.enemyBulletPool.destroy();
            this.powerUpPool.destroy();
            this.bossPool.destroy();
            this.instructions.destroy();
            this.scoreText.destroy();
            this.endText.destroy();
            this.returnText.destroy();
            //  Then let's go back to the main menu.
            this.state.start('MainMenu');
        },

        screenWrap: function (sprite) {
            // Player and bullets will exit one side of the screen and enter from the other side - Like galaga
            if (sprite.x < 0) {
                sprite.x = this.game.width;
            } else if (sprite.x > this.game.width) {
                sprite.x = 0;
            }

            if (sprite.y < 0) {
                sprite.y = this.game.height;
            } else if (sprite.y > this.game.height) {
                sprite.y = 0;
            }
        },

        scrollBackground: function () {
            // This function is needed for the a TileMap
            // Scroll background image as player moves
            if (!this.game.camera.atLimit.x) {
                this.background.tilePosition.x += (this.player.body.velocity.x * 0.5) * this.game.time.physicsElapsed;
            }

            if (!this.game.camera.atLimit.y) {
                this.background.tilePosition.y += (this.player.body.velocity.y * 0.5) * this.game.time.physicsElapsed;
            }
        },
        render: function () {
            // debug blocks around sprites and sheit
            //this.game.debug.body(this.player);
            //this.game.debug.body(this.bullet);  
            //this.game.debug.body(this.enemy);
            this.game.debug.spriteInfo(this.player, 32, 32);
            this.game.debug.text('activePointerCoords: ' + this.game.input.activePointer.x + ", " + this.game.input.activePointer.y, 32, 170);
            //this.game.debug.text('angleToActivePointer: ' + this.game.physics.arcade.angleToPointer(this.player), 32, 170);
            //this.game.debug.text('angularVelocity: ' + this.player.body.angularVelocity, 32, 200);
            //this.game.debug.text('angularAcceleration: ' + this.player.body.angularAcceleration, 32, 232);
            //this.game.debug.text('angularDrag: ' + this.player.body.angularDrag, 32, 264);
            //this.game.debug.text('deltaZ: ' + this.player.body.deltaZ(), 32, 296);
        },

    };
    module.exports = Game;

}).call(this);