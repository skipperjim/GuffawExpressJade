var socket = io('http://localhost:3000');

socket.on('connect', function () {
    console.log('socket.client connected');
});

socket.on('news', function (data) {
    //console.log("Player connected: "+data);
    socket.emit('my other event', {
        my: 'data'
    });
});