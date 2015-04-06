var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
// Database
var mongo = require('mongoskin');
var db = mongo.db("mongodb://localhost:27017/GuffawSite", {
    native_parser: true
});

var routes = require('./routes/index');
var game = require('./routes/game');
var admin = require('./routes/admin');

var app = express();

//////////////////////////////////////////////////////////////////
var port = 3000;
var io = require('socket.io').listen(app.listen(port));
var fs = require('fs');
console.log("Listening on port " + port);

/*app.get('/', function (req, res) {
    res.sendFile(__dirname + '/build/index.html');
});*/

io.sockets.on('connection', function (socket) {
    socket.emit('message', {
        message: 'welcome to the chatroom'
    });
    socket.on('send', function (data) {
        io.sockets.emit('message', data);
    });
});
//////////////////////////////////////////////////////////////////

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
//app.use(express.static(path.join(__dirname, 'build')));

// Make our db accessible to our router
app.use(function (req, res, next) {
    req.db = db;
    next();
});

app.use('/', routes);
app.use('/game', game);
app.use('/admin', admin);

/// catch 404 and forwarding to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;