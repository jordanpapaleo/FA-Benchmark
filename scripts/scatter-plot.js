var averagedResults = {};

function getDataCollections() {
    var dataCollections = ['famous', 'famous-iphone', 'famous-nexus', 'famous-safari', 'famous-chrome', 'greensock', 'greensock-iphone', 'greensock-nexus', 'greensock-safari', 'greensock-chrome'];

    for(var i = 0, j = dataCollections.length; i < j; i++) {
        var collectionName = dataCollections[i];
        var dbConfig = getDbConfig(collectionName);

        callDb(dbConfig).then(function(data) {
            mergeResults(data);
            plotData(data);
        });
    }
}

function getDbConfig(collectionName) {
    return {
        url: 'https://api.mongolab.com/api/1/databases/perftest/collections/' + collectionName + '?apiKey=vGKkyQqFj2AyYkDjQHNP-zARZaD-7jbl',
        type: 'GET',
        dataType: 'json',
        contentType: "application/json",
        collectionName: collectionName
    };
}

function callDb(ajaxObj) {
    return $.ajax(ajaxObj)
        .done(function (data) {
            data.collectionName = ajaxObj.collectionName;
            return data;
        })
        .error(function (XMLHttpRequest, textStatus, errorThrown) {
            console.log('error', errorThrown);
        });
}

function mergeResults(data) {
    var clonedData = Object.create(data);
    var collection = clonedData.collectionName;

    if(!averagedResults.hasOwnProperty(collection)) {
        averagedResults[collection] = [];
    }

    for(var i = 0, j = clonedData.length; i < j; i++) {
        var records = clonedData[i].records;

        for(var k = 0, l = records.length; k < l; k++) {
            if(!averagedResults[collection][k]) {
                averagedResults[collection].push([records[k]]);
            } else {
                averagedResults[collection][k].push(records[k])
            }
        }
    }

    averageResults();
}

function averageResults() {
    for(var collection in averagedResults) {
        for(var i = 0, j = averagedResults[collection].length; i < j; i++) {
            //if the array has already been reduced skip

            if(typeof averagedResults[collection][i] === 'number') {
                continue;
            }

            averagedResults[collection][i] = _averageArray(averagedResults[collection][i]);
        }

        var mutantData = mutateData(averagedResults[collection]);
        scatterPlotRange(mutantData, collection, true);
    }
}

function _averageArray(array) {
    var totalRecords = array.length;
    var sum = array.reduce(function(total, num) {
        return total + num;
    }, 0);
    return Math.round((sum / totalRecords) * 100) / 100;
}

function plotData(data) {
    var chartable = [];
    var collectionName = data.collectionName;
    delete data.collectionName;

    for(var i = 0, j = data.length; i < j; i++) {
        var records = mutateData(data[i].records);

        for(var k = 0, l = records.length; k < l; k++) {
            chartable.push(records[k]);
        }
    }

    scatterPlotRange(chartable, collectionName);
}

//creates a data set of value over time
function mutateData(data) {
    var records = [];

    for(var i = 0, j = data.length; i < j; i++) {
        records.push([i, data[i]]);
    }

    return records;
}

function scatterPlotRange(data, collectionName, isLine) {
    var type = (collectionName.indexOf('famous') != -1) ? 'famous' : 'greensock';
    var interface = collectionName.replace(type + '-', '');

    var margin = {top: 20, right: 15, bottom: 20, left: 40};
    var width = 800 - (margin.left + margin.right);
    var height = 500 - (margin.top + margin.bottom);

    var svg = d3.select('#' + interface).select('svg');

    svg.attr('width', width + margin.right + margin.left)
        .attr('height', height + margin.top + margin.bottom)
        .attr('class', 'chart ');

    svg.append("svg:text")
        .attr("class", "title")
        .attr("x", 375)
        .attr("y", 20)
        .text("FPS Over Time");

    var main = svg.append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
        .attr('width', width)
        .attr('height', height)
        .attr('class', 'main ' + type);


    // draw the x axis
    var x = d3.scale.linear()
        .domain([0, 18])//d3.max(data, function(d) { return d[0]; })
        .range([ 0, width ]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient('bottom');

    main.append('g')
        .attr('transform', 'translate(0,' + height + ')')
        .attr('class', 'main axis date')
        .call(xAxis);
    // end draw x axis

    // draw the y axis
    var y = d3.scale.linear()
        .domain([0, 70]) //d3.max(data, function(d) { return d[1]; })
        .range([ height, 0 ]);

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient('left');

    main.append('g')
        .attr('transform', 'translate(0,0)')
        .attr('class', 'main axis date')
        .call(yAxis);
    // end draw y axis


    var g = main.append("svg:g");

    if(isLine) {
        var line = d3.svg.line()
            .x(function (d,i) { return x(d[0]); })
            .y(function (d) { return y(d[1]); });

        g.append("path")
            .datum(data)
            .attr("class", "line")
            .attr("d", line);
    } else {
        g.selectAll("scatter-dots")
            .data(data)
            .enter().append("svg:circle")
            .attr("cx", function (d,i) { return x(d[0]); } )
            .attr("cy", function (d) { return y(d[1]); } )
            .attr("r", 2);
    }
}

getDataCollections();
