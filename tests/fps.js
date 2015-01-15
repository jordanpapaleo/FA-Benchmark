//Logging using fpsmeter.js

window.addEventListener('DOMContentLoaded', function() {
    countdown(1500);

    setTimeout(function() {
        stop()
    }, 10000);
});

var fpsRecords = [];

function countdown(countdown) {
    var step = 3;

    var finalCountdown = setInterval(function() {
        if(step > 0) {
            console.info(step);
            step--;
        } else {
            clearInterval(finalCountdown);
            console.info('GO');
            start();
        }
    }, countdown / 3);
}

function start() {
    document.addEventListener("fps", function(evt) {
        fpsRecords.push(evt.fps);
    }, false);

    FPSMeter.run(0.5);
}

function stop() {
    FPSMeter.stop();
    var totalRecords = fpsRecords.length;
    var sum = fpsRecords.reduce(function(total, num){ return total + num }, 0);

    var fps = Math.round((sum / totalRecords) * 100) / 100;
    console.info("Average fps:", {
        avgFps: fps,
        records: fpsRecords,
        timeStamp: Date.now()
    });

    console.info(JSON.stringify({
        avgFps: fps,
        records: fpsRecords,
        timeStamp: Date.now()
    }));

    save(fps, fpsRecords);
}

function save(fps, fpsRecords) {
    if(fps && fpsRecords && fpsRecords.length > 0) {
        var ajaxObj = {
            url: 'https://api.mongolab.com/api/1/databases/perftest/collections/greensock?apiKey=vGKkyQqFj2AyYkDjQHNP-zARZaD-7jbl',
            type: 'POST',
            dataType: 'json',
            contentType: "application/json",
            data: JSON.stringify({
                avgFps: fps,
                records: fpsRecords,
                timeStamp: Date.now()
            })
        };

        $.ajax(ajaxObj)
            .done(function (data) {
                console.log('success', data);
            })
            .error(function (XMLHttpRequest, textStatus, errorThrown) {
                console.log('error', errorThrown);
            });
    }
}
