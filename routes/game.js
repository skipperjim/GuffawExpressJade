var express = require('express');
var router = express.Router();

/* GET game canvas view. */
router.get('/', function (req, res, next) {
    res.render('game', {
        title: 'Intension: Space'
    });
});

router.get('/absoluterror', function (req, res) {
    res.sendFile('public/index.html');
});

router.get('/game', function (req, res) {
    res.sendFile(__dirname + '/game');
});

module.exports = router;