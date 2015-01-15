//attempt with window.requestAnimationFrame

window.addEventListener('DOMContentLoaded', function() {
    countdown(1500);

    setTimeout(function() {
        stop()
    }, 10000);
});

var active = false, frames = 0, startPerf = undefined, fpsRecords = [];

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

var frame = function () {
    frames++;

    if (active) {
        //window.performance.get
        window.requestAnimationFrame(frame);
    }
};

function start() {
    active = true;
    frames = 0;
    startPerf = window.performance.now();
    frame();
}

function stop() {
    active = false;
    var seconds = (window.performance.now() - startPerf) / 1000;

    var fps = Math.round((frames / seconds) * 100) / 100;
    console.info("Average fps:", fps);
}


