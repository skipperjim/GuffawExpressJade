var express = require('express');
var router = express.Router();

/* GET admin panel view. */
router.get('/', function (req, res, next) {
    res.render('dexter', {
        title: 'Dexter\'s Gallery'
    });
});

module.exports = router;