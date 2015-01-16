//Requires FPSMeter.js

var FPS = function(duration, type) {
    this.init(duration);
    this.type = type;
    this.fpsRecords = [];
};

FPS.prototype.init = function (duration) {
    this.setEventHandlers(duration)
};

FPS.prototype.setEventHandlers = function(duration) {
    var self = this;

    window.addEventListener('DOMContentLoaded', function() {
        self.countdown(duration);
    });
};

FPS.prototype.countdown = function (duration) {
    var self = this;
    var step = 3;

    var finalCountdown = setInterval(function() {
        if(step > 0) {
            console.info(step);
            step--;
        } else {
            clearInterval(finalCountdown);
            console.info('GO');
            self.start();

            setTimeout(function() {
                self.stop()
            }, duration);
        }
    }, 500);
};

FPS.prototype.start = function () {
    var self = this;

    document.addEventListener("fps", function(evt) {
        self.fpsRecords.push(evt.fps);
    }, false);

    FPSMeter.run(0.5);
};

FPS.prototype.stop = function () {
    var self = this;
    self.flashScreen();

    FPSMeter.stop();

    var totalRecords = self.fpsRecords.length;
    var sum = self.fpsRecords.reduce(function(total, num){ return total + num }, 0);
    var fps = Math.round((sum / totalRecords) * 100) / 100;

    var fpsInfo = {
        avgFps: fps,
        records: self.fpsRecords,
        timeStamp: Date.now()
    };

    console.info("Average fps:", fpsInfo);

    this.save(fpsInfo)
};

FPS.prototype.flashScreen = function() {
    $('.flashScreen').toggleClass('flash');
};

FPS.prototype.save = function (data) {
    var self = this;

    if(data) {
        var ajaxObj = {
            url: 'https://api.mongolab.com/api/1/databases/perftest/collections/' + this.type + '?apiKey=' + APIKEY,
            type: 'POST',
            dataType: 'json',
            contentType: "application/json",
            data: JSON.stringify(data)
        };

        $.ajax(ajaxObj)
            .done(function (data) {
                self.flashScreen();
            })
            .error(function (XMLHttpRequest, textStatus, errorThrown) {
                self.flashScreen();
            });
    }
};
