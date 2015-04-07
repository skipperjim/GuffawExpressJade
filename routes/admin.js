var express = require('express');
var router = express.Router();

/* GET admin panel view. */
router.get('/', function (req, res, next) {
    res.render('authfailed', {
        title: 'Failed Authentication',
        message: 'You have to login and have the proper rights to view this page.'
    });
});

/* GET admin panel view. */
router.get('/panel', function (req, res, next) {
    console.log("rendering admin panel");
    res.render('admin', {
        title: 'Admin Panel'
    });
});

/*
 * GET userlist.
 */
router.get('/userlist', function (req, res) {
    var db = req.db;
    db.collection('userlist').find().toArray(function (err, items) {
        res.json(items);
    });
});

/*
 * POST to adduser.
 */
router.post('/adduser', function (req, res) {
    var encrypt = req.crypto;
    console.log("Encrypting " + req.body.password);
    var hashedpass = encrypt.hashSync(req.body.password);
    req.body.password = hashedpass;
    console.log("HASH:: " + req.body.password);
    var db = req.db;
    db.collection('userlist').insert(req.body, function (err, result) {
        res.send(
            (err === null) ? {
                msg: ''
            } : {
                msg: err
            }
        );
    });
});

/*
 * DELETE to deleteuser.
 */
router.delete('/deleteuser/:id', function (req, res) {
    var db = req.db;
    var userToDelete = req.params.id;
    db.collection('userlist').removeById(userToDelete, function (err, result) {
        res.send((result === 1) ? {
            msg: ''
        } : {
            msg: 'error: ' + err
        });
    });
});

/*
bcrypt.hash("bacon", null, null, function (err, hash) {
    // Store hash in your password DB.
});
// Load hash from your password DB.
bcrypt.compare("bacon", hash, function (err, res) {
    // res == true
});
bcrypt.compare("veggies", hash, function (err, res) {
    // res = false
});
*/

module.exports = router;