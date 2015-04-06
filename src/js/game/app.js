Phaser = require('Phaser');
properties = require('./properties');
//Player = require('./entities/Player.js');
Asteroid = require('./entities/Asteroid.js');

var BaseGame = {
    Boot: require('./states/boot.js'),
    Preloader: require('./states/preloader.js'),
    MainMenu: require('./states/mainMenu.js'),
    Game: require('./states/game.js')
};

//var game = new Phaser.Game(properties.size.x, properties.size.y, Phaser.CANVAS, 'gameContainer');
game = new Phaser.Game(properties.size.x, properties.size.y, Phaser.CANVAS, 'gameContainer');

//  Add the States your game has.
//  You don't have to do this in the html, it could be done in your Boot state too, but for simplicity I'll keep it here.
game.state.add('Boot', BaseGame.Boot);
game.state.add('Preloader', BaseGame.Preloader);
game.state.add('MainMenu', BaseGame.MainMenu);
game.state.add('Game', BaseGame.Game);

//  Now start the Boot state.
game.state.start('Boot');