(function () {
    var Stats = require('Stats');
    var properties = require('../properties');

    // Missile constructor
    var Missile = function (game, x, y) {
        Phaser.Sprite.call(this, game, x, y, 'missile');
    };
    
    // Missiles are a type of Phaser.Sprite
    Missile.prototype = Object.create(Phaser.Sprite.prototype);
    Missile.prototype.constructor = Missile;

    Missile.prototype.update = function () {
        
    };
    module.exports = Missile;

}).call(this);