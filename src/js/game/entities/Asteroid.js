(function () {
    var properties = require('../properties');

    // Asteroid constructor
    var Asteroid = function (game, x, y, size) {
        Phaser.Sprite.call(this, game, x, y, 'large-asteroid_01');
        this.asteroids;
        this.rotateSpeed = 0.05 + Math.random();
        //game.add.existing(this);
    };

    Asteroid.prototype = Object.create(Phaser.Sprite.prototype);
    Asteroid.prototype.constructor = Asteroid;

    /*Asteroid.prototype.create = function () {
        new Asteroid(game, game.world.randomX, game.world.randomY, 'large-asteroid_01');
    };*/
    Asteroid.prototype.update = function () {
        
    };

    Asteroid.setupAsteroidGroup = function () {
        this.asteroids = game.add.group();
        //phaser's random number generator
        var numAsteroids = game.rnd.integerInRange(50, 100);
        this.asteroids.createMultiple(numAsteroids, 'large-asteroid_01');
        this.asteroids.setAll('anchor.x', 0.5);
        this.asteroids.setAll('anchor.y', 0.5);
        this.asteroids.setAll('outOfBoundsKill', true);
        this.asteroids.setAll('checkWorldBounds', true);
        this.asteroids.setAll('enableBody', true);

        for (var i = 0; i < numAsteroids; i++) {
            //add sprite
            var asteroid = this.asteroids.getFirstExists(false);
            var randomScale = 1 + Math.random();
            //physics properties
            game.physics.arcade.enable(asteroid);
            asteroid.enableBody = true;
            asteroid.body.velocity.x = game.rnd.integerInRange(10, 50);
            asteroid.body.velocity.y = game.rnd.integerInRange(10, 50);
            asteroid.acceleration = 25;
            asteroid.body.allowGravity = true;
            asteroid.body.immovable = false;
            asteroid.gravity = 0;
            asteroid.health = 10;
            asteroid.rotation = Math.random();
            asteroid.body.collideWorldBounds = false;
            asteroid.scale.setTo(randomScale, randomScale)
                // spawn at a random location at the top  
            asteroid.reset(game.world.randomX, game.world.randomY);
        }
    };

    module.exports = Asteroid;
}).call(this);