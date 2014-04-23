var bbDetail, bbOverview, dataSet, svg;

var margin = {
    top: 100,
    right: 50,
    bottom: 50,
    left: 100
};

var width = 860 - margin.left - margin.right;

var height = 800 - margin.bottom - margin.top;

bbOverview = {
    x: 0,
    y: 10,
    w: width,
    h: 100
};

bbDetail = {
    x: 0,
    y: 300,
    w: width,
    h: 300
};



dataSet = [];

svg = d3.select("#visUN").append("svg").attr({
    width: width + margin.left + margin.right,
    height: height + margin.top + margin.bottom}).append("g").attr({
        transform: "translate(" + margin.left + "," + margin.top + ")"
    }).style("float", "left");

var convertToInt = function(s) 
{
    return parseInt(s.replace(/,/g, ""), 10);
};


var parseDate = d3.time.format("%m/%_d/%y").parse;

//example of formatting dates!
var format = d3.time.format("%B %Y");
var what = format.parse("September 2009");


var tooltip2 = d3.select("body")
        .append("div")
        .style("position", "absolute")
        .style("z-index", "10")
        .style("visibility", "visible")
        .style("color", "black")
        .style("font-size", "15px")
        .style("top", "75px")
        .style("left", "850px")
        .attr("class", "tooltip2")
        .html("<u1><h2> Graph Data:</h2><ul> <li> The data for these visualization was scraped from UN Global Pulse Website.</li> <li> Scraped data was then saved to a CSV file </li> <li> Dates were parsed to create data scale. </li></ul> <h2> Interactive Graph Features: </h2><ul> <li> Linking and Brushing between the top and bottom graphs  </li> <li> Highlights of data picks by clicking on blue and yellow rects </li> <li>Created with JavaScript (d3 library), HTML, and CSS </li></ul></u1>");


var remaining = 1;
d3.csv("unHealth.csv", function(data) {
        if(! --remaining) {
       createVis(data);
    }
});


createVis = function(data) {
   // console.log(data);
    data.forEach(function (d,i) {  d.AnalysisDate = format.parse(d.AnalysisDate) ;})
    data.forEach(function (d,i) {  d.WomensH = convertToInt(d.WomensH);})

    var color = d3.scale.category10();
    color.domain(d3.keys(data[0]).filter(function(key) { return key !== "AnalysisDate"; }));

    var xAxis, xScale, yAxis,  yScale;


    xScale = d3.time.scale().domain(d3.extent(data.map(function (d) { return d.AnalysisDate;}))).range([0, bbOverview.w]);
    yScale = d3.scale.linear().range([bbOverview.h +00, 0]).domain(d3.extent(data.map(function (d) { return d.WomensH;})));       

    xAxis = d3.svg.axis()
    .scale(xScale)
    .orient("bottom");

    yAxis = d3.svg.axis()
     .scale(yScale)
     .orient("left");

    svg.append("g")
      .attr("class", "y axis ")
      .attr({
          "transform": "translate(" + (bbOverview.x) + "," + (bbOverview.y + bbOverview.h +00) + ")",})
      .call(xAxis)
            .selectAll("text")  
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", function(d) {
                return "rotate(-65)"});

  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -90).attr("x", 0)
      .attr("dy", ".71em")
      .style("text-anchor", "End")
      .text("Womens' Health");


  var cities = color.domain().map(function(name) {
    return {
      name: name,
      values: data.map(function(d) {
      return {date: d.AnalysisDate, population: +d[name]};
      })};});

var line = d3.svg.line()
    .interpolate("linear")
    .x(function(d) { return xScale(d.date); })
    .y(function(d) { return yScale(d.population); });

var points = svg.selectAll(".point")
    .data(cities[0].values)
    .enter()
    .append("svg:circle")
         .attr("stroke", color(cities[0].name))
         .attr("fill", color(cities[0].name))
         .attr("cx", function(d, i) { return xScale(d.date) })
         .attr("cy", function(d, i) { return yScale(d.population)})
         .attr("r", function(d, i) { return 3 });


var padding = 100;

var city = svg.selectAll(".city")
   .data(cities)
   .enter().append("g")
   .attr("class", "city");

city.append("path")
    .attr("class", "line")
    .attr("d", function(d) { return line(d.values); })
    .style("fill", "none")
    .style("stroke", function(d) { return color(d.name); });


var xOverviewScale = d3.time.scale().domain(d3.extent(data.map(function (d) 
    { return d.AnalysisDate;}))).range([-5, bbOverview.w]);


brush = d3.svg.brush().x(xOverviewScale).on("brush", brushed);


var color2 = d3.scale.category10();
color2.domain(d3.keys(data[0]).filter(function(key) { return key !== "AnalysisDate"; }));

// similar to what I did above, but for the detail viz

var xAxis2, xScale2, yAxis2,  yScale2;


the_domain = d3.extent(data.map(function (d) { return d.AnalysisDate;}));


xScale2 = d3.time.scale().domain(the_domain).range([6, bbDetail.w]);
yScale2 = d3.scale.linear().range([bbDetail.h +bbDetail.y, bbDetail.y]).domain(d3.extent(data.map(function (d) { return d.WomensH;})));
             

  xAxis2 = d3.svg.axis()
  .scale(xScale2)
  .orient("bottom");

  yAxis2 = d3.svg.axis()
   .scale(yScale2)
   .orient("left");

    svg.append("g")
      .attr("class", "x axis ")
      .attr({
          "transform": "translate(" + (bbDetail.x) + "," + (bbDetail.y + bbDetail.h +00) + ")",})
      .call(xAxis2)
            .selectAll("text")  
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", function(d) {
                return "rotate(-65)"});

  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis2)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -90).attr("x", -bbDetail.h)
      .attr("dy", ".71em")
      .style("text-anchor", "End")
      .text("Womens' Health");


  var cities2 = color.domain().map(function(name) {
    return {
      name: name,
      values: data.map(function(d) {
        return {date: d.AnalysisDate, population: +d[name]};
      })
    };
  });


var line2 = d3.svg.line()
    .interpolate("linear")
    .x(function(d) { return xScale(d.date); })
    .y(function(d) { return yScale(d.population); });


var area = d3.svg.area()
    .x(function(d) {var dat = xScale2(d.AnalysisDate); return dat })
    .y0(bbDetail.y + bbDetail.h -1)
    .y1(function(d) { var pop = yScale2(d.WomensH); return pop });


var city2 = svg.selectAll(".city2")
    .data(cities2)
    .enter().append("g")
    .attr("class", "city2");

svg.append("path")
        .datum(data)
        .attr("class", "area")
        .attr("d", area);


city2.append("path")
    .attr("class", "line2")
    .attr("d", function(d) { return line(d.values); })
    .style("fill", "none")
    .style("stroke", function(d) { return color2(d.name); });


var points2 = svg.selectAll(".point2")
      .data(cities2[0].values)
       .enter().append("svg:circle")
       .attr("stroke", color2(cities[0].name))
       .attr("fill", color2(cities[0].name))
       .attr("cx", function(d, i) { return xScale2(d.date) })
       .attr("cy", function(d, i) { return yScale2(d.population) })
       .attr("r", function(d, i) { return 3 })
       .attr("class", "thecircles");


  svg.append("g").attr("class", "brush").call(brush)
    .selectAll("rect").attr({
      height: bbOverview.h + 10,
      transform: "translate(5, -5)"
  });


  svg.select(".background").attr({
    height: bbOverview.h + 100,
    transform: "translate(5, -5)"});

svg.append("defs").append("clipPath")
    .attr("id", "clip")
  .append("rect")
    .attr("width", width)
    .attr("height", height);          


function brushed() 
{
  xScale2.domain(brush.empty() ? xOverviewScale.domain() : brush.extent());
  xScale2.range([1, bbDetail.w]);
 
  svg.select(".area").attr("d", area);
  svg.selectAll(".thecircles").attr("cx", function(d, i) { return xScale2(d.date) });
  svg.select(".x.axis").call(xAxis2).selectAll("text")  
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", function(d) {
                return "rotate(-65)"});
}


/*
The first peak (February 2012) coincides with the
Obama Administration's announcement of new rules requiring private health plans to cover
preventive services for women without charging co-pay. 

The second peak (August 2012) 
coincides with the date those new rules went into effect.
*/

// should go back and change these to tooltips. Much cleaner 
cities = ["Story1", "Feb 2012", "Aug 2012", "Reset Vis"];

      var legend = svg.selectAll(".city")
      .data(cities)
      .enter()
      .append("g")
      .attr("class", "legend")
      .on("click", function (d) {

  if (d=="Feb 2012"){ 

    d3.selectAll(".storystuff").remove();

      var circle = svg.selectAll(".city")
            .append("line")
              .attr("class", "storystuff")
              .attr("x1", 395)
              .attr("y1", 5)
              .attr("x2", 100)
              .attr("y2", -80)
              .attr("stroke-width", 2)
              .attr("class", "storystuff")
              .attr("stroke", "blue");

    var story1 = svg.selectAll(".city")
                    .append('rect')
                      .attr('x', 0)
                      .attr('y', -80)
                      .attr('width', 250)
                      .attr('height', 60)
                      .attr("class", "storystuff")
                      .style('fill', "blue");



  var stor1text = svg.selectAll(".city").append('text')
        .attr('x', 6)
        .attr('y', -61)
        .style("fill", "white")
        .style("font-size","12px")
        .attr("class", "storystuff")
        .html("Obama announces new rules requiring private");


  var stor2text = svg.selectAll(".city").append('text')
        .attr('x', 6)
        .attr('y', -48)
        .style("fill", "white")
        .style("font-size","12px")
        .attr("class", "storystuff")
        .html("health plans to cover preventive services for");


  var stor3text = svg.selectAll(".city").append('text')
        .attr('x', 6)
        .attr('y', -35)
        .style("fill", "white")
        .style("font-size","12px")
        .attr("class", "storystuff")
        .html("women without charging co-pay");


brush.extent([parseDate('1/1/12'),parseDate('3/1/12')]); brushed();

}

else if (d=="Aug 2012")
{

 d3.selectAll(".storystuff").remove(); 

 var circle2 = svg.selectAll(".city")
                .append("line")
                  .attr("x1", 480)
                  .attr("y1", 0)
                  .attr("x2", 400)
                  .attr("y2", -30)
                  .attr("stroke-width", 2)
                  .attr("class", "storystuff")
                  .attr("stroke", "yellow");


var story2 = svg.selectAll(".city")
              .append('rect')
                .attr('x', 300)
                .attr('y', -85)
                .attr('width', 250)
                .attr('height', 60)
                .attr("class", "storystuff")
                .style('fill', "yellow");


var stor1text = svg.selectAll(".city")
            .append('text')
              .attr('x', 305)
              .attr('y', -65)
              .style("fill", "black")
              .style("font-size","12px")
              .attr("class", "storystuff")
              .html("The changes in insurance plan that were");

var stor2text = svg.selectAll(".city")
            .append('text')
              .attr('x', 305)
              .attr('y', -52)
              .style("fill", "black")
              .style("font-size","12px")
              .attr("class", "storystuff")
              .html("announced on Feb 2012 were actually put");

var stor3text = svg.selectAll(".city")
            .append('text')
              .attr('x', 305)
              .attr('y', -39)
              .style("fill", "black")
              .style("font-size","12px")
              .attr("class", "storystuff")
              .html("into effect on this date.");


brush.extent([parseDate('7/1/12'),parseDate('9/1/12')]); brushed();

}

else if (d=="Reset Vis")
{

var cities2 = color.domain().map(function(name) {
    return {
      name: name,
      values: data.map(function(d) {
        return {date: d.AnalysisDate, population: +d[name]};
      })
    };
  });


the_domain = d3.extent(data.map(function (d) { return d.AnalysisDate;}));


xScale2 = d3.time.scale().domain(the_domain).range([6, bbDetail.w]);
yScale2 = d3.scale.linear().range([bbDetail.h +bbDetail.y, bbDetail.y])
          .domain(d3.extent(data.map(function (d) { return d.WomensH;})));
        

xAxis2 = d3.svg.axis()
  .scale(xScale2)
  .orient("bottom");

yAxis2 = d3.svg.axis()
  .scale(yScale2)
  .orient("left");



svg.select(".area").attr("d", area);
svg.selectAll(".thecircles").attr("cx", function(d, i) { return xScale2(d.date) });
svg.select(".x.axis").call(xAxis2).selectAll("text")  
          .style("text-anchor", "end")
          .attr("dx", "-.8em")
          .attr("dy", ".15em")
          .attr("transform", function(d) {
              return "rotate(-65)" 
              });


the_domain = d3.extent(data.map(function (d) { return d.AnalysisDate;}));
svg.selectAll(".storystuff").remove();

}
});;;
  
  legend.append('rect')
      .attr('x', 00)
      .attr('y', function (d) {if (d=="Feb 2012") {return 180} 
        else if (d=="Aug 2012") {return 210} else {return 240}})
      .attr('width', 100)
      .attr('height', 30)
      .style('fill', function (d) {if (d=="Feb 2012") {return 'blue'} 
        else if (d=="Aug 2012") {return 'yellow'} else {return "red"}})


  legend.append('text')
      .attr('x', 15)
      .attr('y', function (d) {if (d=="Feb 2012") {return 200} 
        else if (d=="Aug 2012") {return 230} else {return 260}})
      .text(function (d,i){ return d; })
      .style("fill", function (d) {if (d=="Aug 2012") {return "black"} else {return "white"}});

}
