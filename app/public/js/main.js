var socket = io.connect('http://localhost:1337');

socket.on('connect', function(data) {
    console.log('connected');
    socket.emit('success', 'Success');
});