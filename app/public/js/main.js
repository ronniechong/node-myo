var arr = [],
    hasTakeOff = true,
    timer;

$(function() {
    var socket = io.connect('http://localhost:1337');


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
    });

    //$(window).on('keypress', function(e){
    //    var key = e.which,
    //        type;
    //    switch(key){
    //        case 32:
    //            //space
    //            type = 'takeoff';
    //            break;
    //        case 122:
    //            //z
    //            type = 'land';
    //            break;
    //        case 97:
    //            //a
    //            type = 'calibrate';
    //            break;
    //        case 120:
    //            //x
    //            type = 'togglelock';
    //            break;
    //    }
    //
    //    console.log('Key: Drone = ', type);
    //
    //    socket.emit('keypress',type);
    //
    //    e.preventDefault();
    //});
});

function updateDrone(raw){
    var data = raw.data;
    console.log('Drone: ', data);
    if (data === 'land') hasTakeOff = false;
    if (data === 'takeoff') hasTakeOff = true;

    if (hasTakeOff){
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
        hasTakeOff = false;
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