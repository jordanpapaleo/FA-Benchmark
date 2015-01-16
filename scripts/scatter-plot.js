function getFamousData() {
    callDb({
        url: 'https://api.mongolab.com/api/1/databases/perftest/collections/famous?apiKey=' + APIKEY,
        type: 'GET',
        dataType: 'json',
        contentType: "application/json"
    }).then(function(data) {
        plotData(data, 'famous');
    });
}



function getGreensockData() {
    callDb({
        url: 'https://api.mongolab.com/api/1/databases/perftest/collections/greensock?apiKey=' + APIKEY,
        type: 'GET',
        dataType: 'json',
        contentType: "application/json"
    }).then(function(data) {
        plotData(data, 'greensock');
    });
}

function callDb(ajaxObj) {
    return $.ajax(ajaxObj)
        .done(function (data) {
            return data;
        })
        .error(function (XMLHttpRequest, textStatus, errorThrown) {
            console.log('error', errorThrown);
        });
}

function plotData(data, className) {
    var chartable = [];

    for(var i = 0, j = data.length; i < j; i++) {
        var records = mutateData(data[i].records);

        for(var k = 0, l = records.length; k < l; k++) {
            chartable.push(records[k]);
        }
    }

    plotRange(chartable, className);
}

//creates a data set of value over time
function mutateData(data) {
    var records = [];

    for(var i = 0, j = data.length; i < j; i++) {
        var record = data[i];

        records.push([i, record]);
    }

    return records;
}



function plotRange(data, className) {
    var margin = {top: 20, right: 15, bottom: 20, left: 40};
    var width = 800 - (margin.left + margin.right);
    var height = 500 - (margin.top + margin.bottom);

    var svg = d3.select('#charts').select('svg');

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
        .attr('class', 'main ' + className);


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

    g.selectAll("scatter-dots")
        .data(data)
        .enter().append("svg:circle")
        .attr("cx", function (d,i) { return x(d[0]); } )
        .attr("cy", function (d) { return y(d[1]); } )
        .attr("r", 2);
}

getFamousData();
getGreensockData();
