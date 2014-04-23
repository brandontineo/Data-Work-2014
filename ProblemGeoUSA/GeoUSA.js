
// defining the margins, width, and height of page the page and the visualization
var margin = {
    top: 20,
    right: 50,
    bottom: 100,
    left: 100
};

var width = 1660 - margin.left - margin.right;
var height = 700 - margin.bottom - margin.top;
var centered;

var bbVis = {
    x: 100,
    y: 10,
    w: width - 100,
    h: 300
};


// appending an SVG canvas to work with
var canvas = d3.select("#vis").append("svg").attr({
    width: 1300,
    height: height + margin.top + margin.bottom
    })
// apppending a "g" tag to work with
var svg = canvas.append("g").attr({
        transform: "translate(" + margin.left + "," + (margin.top - 40) + ")"
    });

// creating the map
var projection = d3.geo.albersUsa().translate([width / 2, height / 2]);//.precision(.1);
var path = d3.geo.path().projection(projection);


// loaidng the stations from the CSV file
function loadStations() {
    d3.csv("../data/NSRDB_StationsMeta.csv",function(error,data){

          // description of the visualization
          var tooltip2 = d3.select("body")
          .append("div")
          .style("position", "absolute")
          .style("z-index", "10")
          .style("visibility", "visible")
          .style("color", "black")
          .style("font-size", "15px")
          .style("top", "450px")
          .style("left", "15px")
          .attr("class", "tooltip2")
          .html("<h2> Map Data: </h2><ul> <li> The USA map was created using a TopoJSON file.</li> <li> Station data was read in and parsed from a CSV file </li> <li> Solar radiation information was data wrangled from the NSRDB database into a compressed JavaScript object. </li></ul> <h2> Interactive USA Map Features: </h2><ul> <li> On click zoom of map </li> <li> Mouseover tooltips with station information </li> <li> On click detailed visualization of station (bar chart) </li> <li> On zoom and on mouseover highlighting of state  </li> <li> Station circles sized proportional to solar radiation </li> <li>Created with JavaScript (d3 library), HTML, and CSS </li></ul>");

    // data wrangling
    all_array = [];
    for (i in completeDataSet)
    {
     all_array.push(completeDataSet[i]['sum'])  
       
    }

    var max = all_array.sort(function(a,b){return b-a;})[0];


    var radiusscale = d3.scale.linear().domain([0,max]).range([1, 8]);  


    data.forEach(function (d,i) {

    if ((d['USAF'] != "785140") && (d['USAF'] !=  "785145")

      && (d['USAF'] != "785203") && (d['USAF'] != "785260")  
      && (d['USAF'] != "785263")  && (d['USAF'] != "785350") 
      && (d['USAF'] != "785430")  && (d['USAF'] != "910660")
      && (d['USAF'] != "912120") && (d['USAF'] != "912170") 
      && (d['USAF'] != "912180"))
    {
    if (completeDataSet[d['USAF']] == undefined)
    {
      var latitude = +d['NSRDB_LAT (dd)'];
      var longitude = +d['NSRDB_LON(dd)']; //console.log(latitude); console.log(longitude);
      var screencoord = projection([longitude, latitude]); //console.log(screencoord);
      svg.append("circle")
          .attr("cx", screencoord[0]) // projected location on map (pixel)
          .attr("cy", screencoord[1])
          .attr("fill", "blue")
          .attr("r", 2);
    }
    else
    {

      var agg_val =  completeDataSet[d['USAF']]['sum'];
      var new_rad =  radiusscale(completeDataSet[d['USAF']]['sum']);
      var stations_name = d['STATION'];
      var tooltip = d3.select("body")
          .append("div")
          .style("position", "absolute")
          .style("z-index", "10")
          .style("visibility", "hidden")
          .style("color", "black")
          .style("font-size", "15px")
          .attr("class", "tooltip")
          .text("Aggregated value for " + stations_name + " is: " + agg_val);    

      var latitude = +d['NSRDB_LAT (dd)'];
      var longitude = +d['NSRDB_LON(dd)']; //console.log(latitude); console.log(longitude);
      var screencoord = projection([longitude, latitude]); //console.log(screencoord);
      svg.append("circle")
          .attr("cx", screencoord[0]) // projected location on map (pixel)
          .attr("cy", screencoord[1])
          .on("mouseover", function(){return tooltip.style("visibility", "visible");})
          .on("mousemove", function(){return tooltip.style("top", (event.pageY-20)+"px").style("left",(event.pageX+20)+"px");})
          .on("mouseout", function(){return tooltip.style("visibility", "hidden");})
          .attr("r", new_rad)
          .on("click", function()
          {

          // remove any previous bar chart that was drawn
          updateDetailVis();

        // on click we create a bar chart detail visualization
        thisid = d['USAF'];

        var x = d3.scale.ordinal()
            .rangeRoundBands([0, 300], .1)
            .domain([0, bbVis.w]);

        var y = d3.scale.linear()
            .domain([bbVis.h/2, 0])
            .range([300, 0]);

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom");

        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left")
            .ticks(12);


        for (i in completeDataSet)
        {
          all_array.push(completeDataSet[i]['sum'])  
         
        }

        var max = all_array.sort(function(a,b){return b-a;})[0];




        var hours = completeDataSet[thisid]['hourly'];
        array_of_vals = [];
        array_of_hours = [];


        for (l in hours)
        {
          array_of_vals.push(hours[l]);
          array_of_hours.push(l);

        }

          x.domain(array_of_hours);


          y.domain([0, 18000000]);

          svg.append("g")
              .attr("class", "x axis")
              .attr("transform", "translate(0," + bbVis.h + ")")
              //.attr("class", "thedetail")
              .attr("class", "axis")
              .call(xAxis)
              .attr("class", "thedetail")
              .selectAll("text") 
              .style("text-anchor", "end")
              .attr("dx", "-.8em")
              .attr("dy", ".15em")
              .attr("transform", function(d) {
                  return "rotate(-65)" 
                  })
              .attr("class", "thedetail")
              ;

          svg.append("g")
              .attr("class", "y axis")
              .attr("class", "thedetail")
              .attr("class", "axis")
              .call(yAxis)
              .attr("class", "thedetail")
              .append("text")
              .attr("transform", "rotate(-90)")
              .attr("y", 6)
              .attr("dy", ".71em")
              .style("text-anchor", "end")
              .text("Values")
              .attr("class", "thedetail")
              .attr("x", -60);



          svg.selectAll(".bar")
              .data(array_of_vals)
              .enter().append("rect")
              .attr("class", "bar")
              .attr("class", "thedetail")
              .attr("x", function (d,i) { return x(array_of_hours[i]); })
              .attr("width", x.rangeBand())
              .attr("y", function(d) { console.log(d); return y(d); })
              .attr("height", function(d) { return bbVis.h - y(d); });

        var yTextPadding = 20;

        d3.select("g")
          .append("text")
          .style("color", "black")
          .style("font-size", "15px")
          .attr("class", "thedetail")
          .attr("x", 80)
          .attr("y", 20)
          .text(stations_name);


});

          }}})});}


// function to load the stats from a JSON fiile
// this function calls the loadstations function
function loadStats() {

    d3.json("../data/reducedMonthStationHour2003_2004.json", function(error,data){
    completeDataSet= data;
    all_array = [];	   
    for (i in completeDataSet)
    {
     all_array.push(completeDataSet[i]['sum'])  
       
    }
  loadStations();

    })}

// actually draws out the map
d3.json("../data/us-named.json", function(error, data) {

  var usMap = topojson.feature(data,data.objects.states).features

  svg.selectAll(".country").data(usMap).enter().append("path")
      .attr("d", path).attr("classed", "country").on("click", zooming);

  svg.append("path")
      .datum(topojson.mesh(data, data.objects.states, function(a, b) { return a !== b; }))
      .attr("id", "state-borders")
      .attr("d", path);

    loadStats();
});


// updates the Visualization
function updateDetailVis() 
{
  d3.selectAll(".thedetail").remove();
}
  

// zooms the visualization on click
function zooming(d) {
  var x, y, k;

  if (d && centered !== d) {
    var centroid = path.centroid(d);
    x = centroid[0];
    y = centroid[1];
    k = 4;
    centered = d;
  } else {
    x = width / 2;
    y = height / 2;
    k = 0.9;
    centered = null;
  }

  svg.selectAll("path")
      .classed("active", centered && function(d) { return d === centered; });


  svg.transition()
      .duration(750)
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
      .style("stroke-width", 1.5 / k + "px");
}


