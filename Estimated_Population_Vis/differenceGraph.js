
// defining some variables to be used in this visualization
    var bbVis, brush, createVis, dataSet, handle, height, margin, svg, svg2, width;

// margins, height, width for this page
    margin = {
        top: 50,
        right: 70,
        bottom: 50,
        left: 150
    };

    width = 1200 - margin.left - margin.right;

    height = 525 - margin.bottom - margin.top;

// position, width, and height of the visualization
    bbVis = {
        x: 0 + 100,
        y: 10,
        w: width - 80,
        h: 375
    };

    dataSet = [];

  // appending and translating the main SVG
    svg = d3.select("#vis").append("svg").attr({
        width: width + margin.left + margin.right,
        height: height + 10
    }).append("g").attr({
            transform: "translate(" + margin.left + "," + 5 + ")"
        });


// calling the data from the CSV file
  var remaining = 1;

  d3.csv("finaldata.csv", function(data) {
    if(! --remaining) {
      return createVis(data);
    }});

    // main function used to create the visualization
    createVis = function(data) {

        // making the color scale
        var color = d3.scale.category10();
        color.domain(d3.keys(data[0]).filter(function(key) { return key !== "year"; }));

        // description of this visualization
        var tooltip2 = d3.select("body")
          .append("div")
          .style("position", "absolute")
          .style("z-index", "10")
          .style("visibility", "visible")
          .style("color", "black")
          .style("font-size", "15px")
          .style("top", "70px")
          .style("left", "180px")
          .attr("class", "tooltip2")
          .html("<u1><h2> Line Graph Data: </h2> <ul> <li>Population estimates were scraped from Wikipedia</li> <li> Scraped data was stored in a CSV file </li></ul><h2> Line Graph  Features: </h2> <ul> <li> Data created through interpolation is not shaded </li> <li> Radio buttons reveal error bars </li> <li> Consensus Line can be drawn with or without interpolated points </li><li> Bars are sized and colored according to lack of consensus </li><li>Created with JavaScript (d3 library), HTML, and CSS </li></ul></u1>");

        // defining the X and Y scale for the graph
        var xAxis, xScale, yAxis,  yScale;

          xScale = d3.scale.ordinal().domain(data.map(function (d) { return d.year; })).rangePoints([1, bbVis.w]);
          yScale = d3.scale.linear().range([bbVis.h, 0]);
         

            xAxis = d3.svg.axis()
            .scale(xScale)
            .orient("bottom");

            yAxis = d3.svg.axis()
             .scale(yScale)
             .orient("left");


  // re-structing the data we have to a better format
  var pop = color.domain().map(function(name) {
    return {
      name: name,
      values: data.map(function(d) {
        return {date: d.year, population: +d[name]};
      })
    };
  });

// function to clone objects
// http://stackoverflow.com/questions/728360/most-elegant-way-to-clone-a-javascript-object
function clone(obj) {
    // Handle the 3 simple types, and null or undefined
    if (null == obj || "object" != typeof obj) return obj;

    // Handle Date
    if (obj instanceof Date) {
        var copy = new Date();
        copy.setTime(obj.getTime());
        return copy;
    }

    // Handle Array
    if (obj instanceof Array) {
        var copy = [];
        for (var i = 0, len = obj.length; i < len; i++) {
            copy[i] = clone(obj[i]);
        }
        return copy;
    }

    // Handle Object
    if (obj instanceof Object) {
        var copy = {};
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
        }
        return copy;
    }

    throw new Error("Unable to copy obj! Its type isn't supported.");
}


pop[5] = clone (pop[0]);
pop[5].name = "ConsensusData";
pop[5].values.forEach(function (d,i){
  d.population = 0;
})

/* http://javascript.about.com/library/blaravg.htm*/
Array.prototype.avg = function() 
{
  var av = 0;
  var cnt = 0;
  var len = this.length;
  for (var i = 0; i < len; i++) 
  {
    var e = +this[i];
    if(!e && this[i] !== 0 && this[i] !== '0') e--;
    if (this[i] == e) {av += e; cnt++;}
  }
      return av/cnt;
}



pop.forEach(function (d,i) {
    var toggler = false;
   d.values.forEach(function (e,j) { 
   if (! toggler)
   {
    if (e.population > 0)
      {

        d.beginning = e.date;
        toggler = true;
     }
   }
    else 
      {
        if (e.population > 0)
        {
          d.ending = e.date;
        }
      }
   });
  });

// interpolating data's missing values
// Now we go back through each of the census to do actual interpolation
pop.forEach(function(d,i) { //<-- go back through each census one at a time
      domain_array = [];
      range_array = [];
      var toggler = false;  
   d.values.forEach(function(e,j) 
   { //<-- go through this particular census values
    if (e.date == d.beginning) {toggler = true;}
    if  (toggler)
      { if (e.population > 0)
        {
        domain_array.push(e.date);
        range_array.push(e.population);
        e.real_value = true;
        }
        else
        {
          e.toInterpolate = true;
          e.real_value = false;
        }
      }
 if (e.date == d.ending) {toggler = false;}});
   
  var interpolateScale = d3.scale.linear().domain(domain_array).rangeRound(range_array);
   d.values.map(function(f,k) { 
   if (f.toInterpolate)
   {
    f.population = interpolateScale(f.date);
   }

   });
});



yScale.domain([0, (d3.max(pop, function(c) { return d3.max(c.values, function(v) { return v.population; }); }))]);

// using interpolation to draw the line graph
var line = d3.svg.line()
    .interpolate("linear")
    .x(function(d) { return xScale(d.date); })
    .y(function(d) { return yScale(d.population); });



pop.forEach(function(d,i) { //<-- go back through each census one at a time
   d.values.map(function(f,k) { 
   if (f.toInterpolate)
   {
  // console.log(i);
  // console.log(f);
    //console.log(f.population);
   }
   });
});

// appending the points to our line graph
for (var y =0 ; y <5; y++)
{

var points = svg.selectAll(".point")
    .data(pop[y].values)
    .enter().append("svg:circle")
     .attr("stroke", function (d,i) {if (d.population > 0) {return color(pop[y].name);} else {return "white"}})
     .attr("fill", function(d,i) { if (d.real_value && d.population > 0) {return color(pop[y].name);}
      else { return "white"}})
     .attr("cx", function(d, i) { return xScale(d.date) })
     .attr("cy", function(d, i) { return yScale(d.population) })
     .attr("r", function(d, i) { return 4.5 });

}

// x and y scale for the bar chart visualization
rectYScale = d3.scale.linear().range([0, bbVis.h/30]);
rectYScale.domain([0, (d3.max(pop, function(c) { return d3.max(c.values, function(v) { return v.population; }); }))/100]);


// appending x axis
 svg.append("g")
      .attr("class", "x axis")
      .attr({"transform": "translate(" + (bbVis.x - margin.left + 50) + "," + (bbVis.y + bbVis.h) + ")",})
      .call(xAxis)
            .selectAll("text")  
            .style("text-anchor", "end")
            .style("font-size", "14px")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", function(d) {
                return "rotate(-65)"});
 

  // appending y axis
  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -150)
      .attr("x", -150)
      .attr("dy", ".71em")
      .style("text-anchor", "End")
      .text("Population Estimates");


    // creating the legend for our graph
      var legend = svg.selectAll(".city")
      .data(pop)
      .enter()
      .append("g")
      .attr("class", "legend");

      
    legend.append('rect')
        .attr('x', width - 340)
        .attr('y', function(d, i){return (i *  20 + height -19 - bbVis.x*3) + 120 ;})
        .attr('width', 10)
        .attr('height', 10)
        .style('fill', function(d) { 
          return color(d.name);
        });

    legend.append('text')
        .attr('x', width - 308)
        .attr('y', function(d, i){ return ((i *  20) + height -10 - bbVis.x *3) + 120;})
        .text(function(d){ return d.name; });



  var city = svg.selectAll(".city")
      .data(pop)
       .enter().append("g")
      .attr("class", "city");


d3.select("input[value=\"combo\"]").on("click", function(d){

svg.selectAll(".thebars").remove();
svg.selectAll(".line").remove();
svg.selectAll(".thebars2").remove();
svg.selectAll(".line2").remove();

 
// calcualting uncertainty in the data
uncertainty = [];
for (m = 0; m < 65; m++)
{
thisyear = [];
allvalues = [];

pop.forEach(function (d,i){
    if (d.name != "ConsensusData"){
      if (d.values[m].population > 0 && (d.values[m].real_value))
      {
        thisyear.push(d.values[m].population);
      }
      if (d.values[m].population > 0)
      {

        allvalues.push(d.values[m].population);
      }

    }});

themax = allvalues.sort(function(a,b){return b-a;})[0];
themin = allvalues.sort(function(a,b){return a-b;})[0];
un_val = themax - themin;

console.log("max min uncert");
console.log(themax);
console.log(themin);
console.log(un_val);


uncertainty.push(un_val);

pop[5].values[m].population = thisyear.avg();

}



// color scale for the bars
 var colorbars = d3.scale.linear()
      .domain([d3.min(uncertainty),d3.max(uncertainty) ])
      .interpolate(d3.interpolateRgb)
      .range(["lightblue", "darkblue"]);


        // appending the bars to the graph
        var bars = svg.selectAll(".bars")
        .data(pop[0].values)
      .enter().append("svg:rect")
         .style("fill", function (d,i) { return colorbars(uncertainty[i])})
          .attr("class", "thebars3")
         .attr("x", function(d, i) { return xScale(d.date) })
         .attr("y", function(d, i) { return bbVis.h - rectYScale(uncertainty[i]) +10 ;})
         .attr("height", function(d, i) { size = rectYScale(uncertainty[i]) ; /*console.log(size) ;*/ return size;})
         .attr("width", 6);

  // appending the consensus line
 city.append("path")
   .attr("class", "line3")
   .attr("d", function(d,i) {{ return line(d.values);}})
   .style("fill", "none")
  .style("stroke", function (d,i) { if (i == 6) {return "none";} else if (i==5) {return color(d.name);}})
  .style("stroke-width", 2.5);});



d3.select("input[value=\"with\"]").on("click", function(d){

// this could all be abstracted out into one function
svg.selectAll(".thebars2").remove();
svg.selectAll(".line2").remove();

svg.selectAll(".thebars3").remove();
svg.selectAll(".line3").remove();
 

uncertainty = [];

for (m = 0; m < 65; m++)
{
    thisyear = [];
    allvalues = [];

    pop.forEach(function (d,i){
        if (d.name != "ConsensusData")
        {  
          if (d.values[m].population > 0 && (d.values[m].real_value || d.values[m].toInterpolate))
          {
            thisyear.push(d.values[m].population);
          }
          if (d.values[m].population > 0 && (d.values[m].real_value || d.values[m].toInterpolate))
          {

            allvalues.push(d.values[m].population);
          }

        }});

    themax = allvalues.sort(function(a,b){return b-a;})[0];
    themin = allvalues.sort(function(a,b){return a-b;})[0];
    un_val = themax - themin;
    uncertainty.push(un_val);
    pop[5].values[m].population = thisyear.avg();

}

var colorbars = d3.scale.linear()
  .domain([d3.min(uncertainty),d3.max(uncertainty) ])
  .interpolate(d3.interpolateRgb)
  .range(["lightblue", "darkblue"]);


var bars = svg.selectAll(".bars")
  .data(pop[0].values)
  .enter().append("svg:rect")
  .style("fill", function (d,i) { return colorbars(uncertainty[i])})
  .attr("class", "thebars")
  .attr("x", function(d, i) { return xScale(d.date) })
  .attr("y", function(d, i) { return bbVis.h - rectYScale(uncertainty[i]) +10 ;})
  .attr("height", function(d, i) { return rectYScale(uncertainty[i]) ;})
  .attr("width", 6);


 city.append("path")
  .attr("class", "line")
  .attr("d", function(d,i) {{ return line(d.values);}})
  .style("fill", "none")
  .style("stroke", function (d,i) { if (i == 6) {return "none";} else if (i==5) {return color(d.name);}}).style("stroke-width", 2.5);

});

d3.select("input[value=\"without\"]").on("click",  function(d){

svg.selectAll(".thebars").remove();
svg.selectAll(".line").remove();
svg.selectAll(".thebars3").remove();
svg.selectAll(".line3").remove();


uncertainty = [];

for (m = 0; m < 65; m++)
{
    thisyear = [];
    allvalues = [];

    pop.forEach(function (d,i){
        if (d.name != "ConsensusData"){
          if (d.values[m].population > 0 && d.values[m].real_value)
          {
            thisyear.push(d.values[m].population);
          }
          if (d.values[m].population > 0 && d.values[m].real_value)
          {

            allvalues.push(d.values[m].population);
          }

        }
      });

    themax = allvalues.sort(function(a,b){return b-a;})[0];
    themin = allvalues.sort(function(a,b){return a-b;})[0];
    un_val = themax - themin;


    uncertainty.push(un_val);

    pop[5].values[m].population = thisyear.avg();

}


 var colorbars = d3.scale.linear()
      .domain([d3.min(uncertainty),d3.max(uncertainty) ])
      .interpolate(d3.interpolateRgb)
      .range(["lightblue", "darkblue"]);


 var bars = svg.selectAll(".bars")
      .data(pop[0].values)
      .enter().append("svg:rect")
      .style("fill", function (d,i) {return colorbars(uncertainty[i])})
      .attr("class", "thebars2")
      .attr("x", function(d, i) { return xScale(d.date) })
      .attr("y", function(d, i) { return bbVis.h - rectYScale(uncertainty[i]) +10 ;})
      .attr("height", function(d, i) { return rectYScale(uncertainty[i]) ;})
      .attr("width", 6);



 city.append("path")
   .attr("class", "line2")
   .attr("d", function(d,i) {{ return line(d.values);}})
   .style("fill", "none")
  .style("stroke", function (d,i) { if (i == 6) {return "none";} else if (i==5) {return color(d.name);}}).style("stroke-width", 2.5);});


d3.select("input[value=\"reset\"]").on("click",  function(d){
svg.selectAll(".thebars").remove();
svg.selectAll(".line").remove();
svg.selectAll(".thebars2").remove();
svg.selectAll(".line2").remove();
svg.selectAll(".thebars3").remove();
svg.selectAll(".line3").remove();});


    };
