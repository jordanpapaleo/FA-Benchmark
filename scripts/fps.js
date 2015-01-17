(function() {
    /*var FPS = function(config) {
        this.config = config;
        this.init(config.duration);
        this.fpsRecords = [];
    };*/

   /* FPS.prototype.init = function (duration) {
        this.appendFlashScreen();
        this.setEventHandlers(duration);
    };*/

/*    FPS.prototype.setEventHandlers = function(duration) {
        var self = this;

        window.addEventListener('DOMContentLoaded', function() {
            self.start();

            setTimeout(function() {
                self.stop()
            }, duration);
        });
    };*/

    /*FPS.prototype.appendFlashScreen = function() {
        var div = document.createElement('div');
            div.id = 'flashScreen';
            div.style.backgroundColor = "hotpink";
            div.style.position = "absolute";
            div.style.top = 0;
            div.style.bottom = 0;
            div.style.left = 0;
            div.style.right = 0;
            div.style.zIndex = 1000000;
            div.style.display = "none";
            div.style.opacity = .75;

        document.body.appendChild(div);
    };*/

    var frames = 0;
    var startTime;
    var endTime;
    var isCollecting = false;
    var allFrames = [];
    var rate = 250; // Take a reading every 500ms

    /*FPS.prototype.start = function () {
        startTime = window.performance.now();
        isCollecting = true;

        var recordFPS = setInterval(function() {
            if(isCollecting) {
                allFrames.push(getFPS(frames, startTime));
            } else {
                clearInterval(recordFPS);
            }
        }, rate);

        setTimeout(function() {
            isCollecting = false;
        }, 5000);

        frame();
    };*/


    var frame = function () {
        frames++;

        if (isCollecting) {
            window.requestAnimationFrame(frame);
        } else {
            endTime = window.performance.now();
        }
    };

/*    function getFPS(currentFrame, starttime) {
        var fps;

        var time = (window.performance.now() - starttime) / 1000;
        fps = Math.round((currentFrame / time) * 100) / 100;
        console.info('fps',fps);

        return fps;
    }*/

    FPS.prototype.stop = function () {
        var self = this;


        console.info('start', startTime);
        console.info('end', endTime);

        var time = (endTime - startTime) / 1000;
        var fps = Math.round((frames / time) * 100) / 100;

        console.info("Average fps:", fps);

        /*
        var fpsInfo = {
            userAgent: self.getUserAgent(navigator.userAgent),
            avg: self.getAverage(self.fpsRecords),
            records: self.fpsRecords,
            timeStamp: Date.now()
        };

        if(fpsInfo.avg && fpsInfo.records.length > 0) {
            self.save(fpsInfo)
        } else {
            console.error('No FPS data collected', fpsInfo);
        }*/
    };

   /* FPS.prototype.getAverage = function(records) {
        var averageFps;

        var totalRecords = records.length;
        var sum = records.reduce(function(total, num){ return total + num }, 0);
        averageFps = Math.round((sum / totalRecords) * 100) / 100;

        return averageFps;
    };*/

/*    FPS.prototype.save = function (data) {
        var self = this;

        console.info('data',data);

        var ajaxObj = {
            url: self.config.connectionString,
            type: 'POST',
            dataType: 'json',
            contentType: "application/json",
            data: JSON.stringify(data)
        };

        $.ajax(ajaxObj)
            .done(function (data) {
                console.log("Success",data);
            })
            .error(function (err) {
                console.log("Error", err);
            });
    };*/

    /*FPS.prototype.getUserAgent = function(uaString) {
        var userAgent = "";

        var i = uaString.indexOf("(");
        var j = uaString.indexOf(")");

        userAgent = uaString.substring(i + 1, j);
        userAgent = userAgent.replace(/;/g, "");

        return userAgent;
    };*/

    /*FPS.prototype.toggleFlashScreen = function() {
        var flashScreen = document.getElementById("flashScreen");
            flashScreen.style.display = "block";

        setTimeout(function() {
            flashScreen.style.display = "none";
        }, 200);
    };*/

    window.FPS = {
        init: function(configObj) {
            new FPS(configObj);
        }
    };
}());
