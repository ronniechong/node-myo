'use strict';

var arr = [],
    hasTakeOff = false,
    timer;

window.onload = function() {
    //var canvas = document.getElementById('canvas');
    //var context = canvas.getContext('2d');
    //tracking.ColorTracker.registerColor('purple', function(r, g, b) {
    //    var dx = r - 120;
    //    var dy = g - 60;
    //    var dz = b - 210;
    //    if ((b - g) >= 100 && (r - g) >= 60) {
    //        return true;
    //    }
    //    return dx * dx + dy * dy + dz * dz < 3500;
    //});
    //var tracker = new tracking.ColorTracker(['yellow', 'purple']);
    //tracker.setMinDimension(5);
    //tracking.track('#videoFeed', tracker);
    //tracker.on('track', function(event) {
    //    context.clearRect(0, 0, canvas.width, canvas.height);
    //    event.data.forEach(function(rect) {
    //        if (rect.color === 'custom') {
    //            rect.color = tracker.customColor;
    //        }
    //        context.strokeStyle = rect.color;
    //        context.strokeRect(rect.x, rect.y, rect.width, rect.height);
    //        context.font = '11px Helvetica';
    //        context.fillStyle = "#fff";
    //        context.fillText('x: ' + rect.x + 'px', rect.x + rect.width + 5, rect.y + 11);
    //        context.fillText('y: ' + rect.y + 'px', rect.x + rect.width + 5, rect.y + 22);
    //    });
    //});
    //initGUIControllers(tracker);
};


$(function() {
    var socket = io.connect('http://localhost:1337');

    var debug;
    var video = document.querySelector('video');

    video.addEventListener('track', function(event) {
        event.detail.data.forEach(function(rect) {
            debug = plotRectangle(video, rect, debug);
        });
    });

    function plotRectangle(el, rect, opt_div) {
        var div = opt_div || document.createElement('div');
        div.style.position = 'absolute';
        div.style.border = '2px solid ' + (rect.color || 'magenta');
        div.style.width = rect.width + 'px';
        div.style.height = rect.height + 'px';
        div.style.left = el.offsetLeft + rect.x + 'px';
        div.style.top = el.offsetTop + rect.y + 'px';
        document.body.appendChild(div);
        return div;
    }

    //var video = document.querySelector("#videoFeed");
    //
    //navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia || navigator.oGetUserMedia;
    //
    //if (navigator.getUserMedia) {
    //    navigator.getUserMedia({video: true}, handleVideo, videoError);
    //}

    function handleVideo(stream) {
        //video.src = window.URL.createObjectURL(stream);

        //var colours = new tracking.ColorTracker(['magenta', 'cyan', 'yellow']);
        //
        //colours.on('track', function(event) {
        //    if (event.data.length === 0) {
        //        // No colors were detected in this frame.
        //    } else {
        //        event.data.forEach(function(rect) {
        //            console.log(rect.x, rect.y, rect.height, rect.width, rect.color);
        //        });
        //    }
        //});
        //
        //tracking.track('#videoFeed', colours);
    }

    function videoError(e) {
        // do something
    }


    socket.on('connect', function(data) {
        console.log('Socketio: connected');
        socket.emit('success', 'Success');
        $('#console').empty();
    });

    socket.on('imu', function(data) {
        updateInfoDetails(data);
    });

    socket.on('console', function(data) {
        updateConsoleDetails(data);
    });

    socket.on('drone', function(data) {
        updateDrone(data);
    });
    socket.on('droneStatus', function(bFlag) {
        hasTakeOff = bFlag;
        console.log('droneStatus = ', hasTakeOff)
    });

    $(window).on('keypress', function(e){
        var key = e.which,
            obj = {};
        switch(key){
            case 32:
                //space
                obj = {
                    type: 'takeoff',
                    data: 'GUI: Takeoff'
                };
                break;
            case 122:
                //z
                obj = {
                    type: 'land',
                    data: 'GUI: Land'
                };
                break;
            case 97:
                //a
                obj = {
                    type: 'calibrate',
                    data: 'GUI: Calibrate'
                };
                break;
            case 120:
                //x
                obj = {
                    type: 'togglelock',
                    data:'GUI: Toggle Lock'
                };
                break;
        }

        console.log('Key: Drone = ', e.which);

        updateConsoleDetails(obj);
        socket.emit('keypress',obj.type);

        e.preventDefault();
    });
});

function updateDrone(raw){
    var data = raw.data;
    console.log('Drone: ', data);
    //if (data === 'land') hasTakeOff = false;
    //if (data === 'takeoff') hasTakeOff = true;

    if (data !== 'land'){
        $('#drone')
            .removeClass('land')
            //.removeClass('animTakeoff')
            .addClass('takeoff')
            .addClass((data === 'takeoff' || typeof(data) === 'undefined') ? '' : data);

        window.clearTimeout(timer);
        timer = window.setTimeout(function(){
            $('#drone').attr('class', 'visual__drone takeoff ')
        },1000);
    } else{
        window.clearTimeout(timer);
        //hasTakeOff = false;
        $('#drone').attr('class', 'visual__drone land');
    }
}

function updateConsoleDetails(raw){
    if (arr.length > 5){
        arr.shift();
    }else{
        arr.push(raw.data);
    }

    $('#console').empty();
    for (var i=arr.length - 1; i >=  0; i--){
        $('#console').append(
            $('<span>')
                .addClass('info__item')
                .html(arr[i])
        );
    }
}

function updateInfoDetails(raw){
    var data = raw.data;
    $.each(data, function(k,v){
        var $list = $('#'+k);
        $.each(v,function(i,j){
            $list
                .find('li[data-type="'+ i +'"]')
                .empty()
                .append(
                    $('<div>').addClass('list__label').html(i)
                )
                .append(
                    $('<div>').addClass('list__text').html(round(j,3))
                );
        });
    });
}

function round(value, decimals) {
    return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
}