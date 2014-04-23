var margin = {
    top: 75,
    right: 50,
    bottom: 50,
    left: 75
};

var width = 860 - margin.left - margin.right;
var height = 600 - margin.bottom - margin.top;
var centered;



var bbVis = {
    x: 30,
    y: 5,
    w: width - 100,
    h: 275
};

var dataSet = {};

var svg = d3.select("#vis").append("svg").attr({
    width: width + margin.left + margin.right,
    height: height + margin.top + margin.bottom
}).append("g").attr({
        transform: "translate(" + margin.left + "," + margin.top + ")"
    });


/* if we want the bar chart to be on the right hand side of the map */
var svg2 = d3.select("#textLabel").append("svg").attr({
    width: width + margin.left + margin.right - 400,
    height: height + margin.top + margin.bottom
}).append("g").attr({
        transform: "translate(" + margin.left + "," + (margin.top - 5) + ")"
    });



var projectionMethods = [
    {
        name:"mercator",
        method: d3.geo.mercator().translate([width / 2, height / 2])//.precision(.1);
    },{
        name:"equiRect",
        method: d3.geo.equirectangular().translate([width / 2, height / 2])//.precision(.1);
    },{
        name:"stereo",
        method: d3.geo.stereographic().translate([width / 2, height / 2])//.precision(.1);
    }
];


var actualProjectionMethod = 0;
var colorMin = colorbrewer.Greens[3][0];
var colorMax = colorbrewer.Greens[3][2];

var newCountries = [];

var projection = d3.geo.mercator().translate([width / 2, height / 2]).precision(.1)
var path = d3.geo.path().projection(projectionMethods[0].method);


var color_domain = [50, 150, 350, 750, 1500];

var color = d3.scale.quantize().range(colorbrewer.Greens[9]).domain(color_domain);

var circle_scale = d3.scale.log()
  .domain([0.1,120000])
  .range([0,10]);   

//the current genre, will be changed depending on what the user selects
var current_genre = "Comedy";

var tooltip = d3.select("body")
  .append("div")
  .style("position", "absolute")
  .style("z-index", "10")
  .style("visibility", "hidden")
  .style("color", "black")
  .style("font-size", "15px")
  .attr("class", "tooltip");

var showButton = d3.select("div")
    .append("button")    
    .text(" Update Visualization ")
    .on("click", function() {console.log("Update Hit")});

var genre_array = ["Comedy", "Music", "Entertainment", "News", "Sports"];

/* defaults */
var selected_city_1 = "Abia ";
var selected_city_2 = "Abia ";

function world_genre_count (genre_data)
{
  genre_count = 0;
  list_of_genre_count = []
  for (j in genre_array)
  {
    for (i in genre_data[genre_array[j]])
    {
     genre_count = genre_count + (+genre_data[genre_array[j]][i]["Total Entries"]);
    }
    list_of_genre_count.push(genre_count);
  }
  return list_of_genre_count;
}



function merge (city_data,genre_data){
  new_data = {};
  for (c in city_data){
    new_data[c] = city_data[c];
    new_data[c]["name"] = c;
    for (g in genre_data){
      for (c1 in genre_data[g]){
        if(c1 == c){
          new_data[c][g] = genre_data[g][c1];
        }
      }
    }
  }
  return new_data;
}

function return_totals (array_of_values)
{
      var total = 0;

      for (var i = 0; i < array_of_values.length; i++) 
      {
          total += array_of_values[i] << 0;
      }


      for (var i = 0; i < array_of_values.length; i++) 
      {
          array_of_values[i] = (array_of_values[i] / total)*100;

      }

return array_of_values
}

var make_bars = function(d) 
{

d3.selectAll(".thedetail").remove();
/* Building a bar chart */


city_total = []
city_total2 = []


 for (i in genre_array)
 {
  city_total.push(d[genre_array[i]]["Total Entries"]);
  city_total2.push(d[genre_array[i]]["Total Entries"]);
 }

  city_total = return_totals(city_total);
  world_values = return_totals(world_values);


 var x = d3.scale.ordinal()
      .rangeRoundBands([0, 250], .1)
      .domain([0, bbVis.w]);

  var y = d3.scale.linear()
      .domain([bbVis.h/2, 0])
      .range([bbVis.h, 0]);

  var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom");

  var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left")
      .ticks(12);

x.domain(genre_array);

y.domain([0, 100]);

/* make an x-axis */
svg2.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + bbVis.h + ")")
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

/* make a y-axis */
    svg2.append("g")
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
        .text("Total Entries %")
        .attr("class", "thedetail")
        .attr("x", -30);

/* make the bars */
    svg2.selectAll(".bar")
        .data(city_total)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("class", "thedetail")
        .attr("x", function (d,i) { return x(genre_array[i])+ 20; })
        .attr("width", x.rangeBand() - 25)
        .attr("y", function(d) {  return y(d); })
        .attr("height", function(d) { return bbVis.h - y(d); })
        .attr("fill", "red")
        .on("mouseover", function (d, i){ tooltip.style("visibility", "visible"); tooltip.html(city_total2[i] + " City " + genre_array[i] + " Entries." )})
        .on("mousemove", function(){return tooltip.style("top", (event.pageY-20)+"px").style("left",(event.pageX+20)+"px");})
        .on("mouseout", function(){ return tooltip.style("visibility", "hidden");});


    svg2.selectAll(".bar")
        .data(world_values)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("class", "thedetail")
        .attr("x", function (d,i) { return x(genre_array[i]); })
        .attr("width", x.rangeBand() - 25)
        .attr("y", function (d,i) {  return y(d); })
        .attr("height", function (d,i) { return bbVis.h - y(d); })
        .attr("fill", "gray")
        .attr("opacity", 0.50)
        .on("mouseover", function (d, i){ tooltip.style("visibility", "visible"); tooltip.html(world_values2[i] + " " + "World " + genre_array[i] + " Entries." )})
        .on("mousemove", function(){return tooltip.style("top", (event.pageY-20)+"px").style("left",(event.pageX+20)+"px");})
        .on("mouseout", function(){ return tooltip.style("visibility", "hidden");});



     svg2
    .append("text")
    .style("color", "black")
    .style("font-size", "15px")
    .attr("class", "thedetail")
    .attr("x", 80)
    .attr("y", -10)
    .text(d.name);     




var legend_labels = ["World Data", d.name + " Data"]
var ext_color_domain = ["lightgray", "red"]

  var legend = svg2.selectAll("g.legend")
  .data(ext_color_domain)
  .enter().append("g")
  .attr("class", "legend")
  .attr("class", "thedetail");

  var ls_w = 20, ls_h = 20;

  legend.append("rect")
  .attr("x", 180)
  .attr("y", function(d, i){ return (bbVis.h - (i*ls_h) - 240);})
  .attr("width", ls_w)
  .attr("height", ls_h)
  .style("fill", function(d, i) { return ext_color_domain[i]; })
  .style("opacity", 0.8);

  legend.append("text")
  .attr("x", 210)
  .attr("y", function(d, i){ return (bbVis.h - (i*ls_h) - 224);})
  .text(function(d, i){ return legend_labels[i]; });



}


var make_bars2 = function(city1, city2) 
{


d3.selectAll(".thedetail").remove();
/* Building a bar chart */


city_total = []
city_total2 = []

city_total3 = []
city_total4 = []


 for (i in genre_array)
 {
  city_total.push(city1[genre_array[i]]["Total Entries"]);
  city_total2.push(city1[genre_array[i]]["Total Entries"]);
  city_total3.push(city2[genre_array[i]]["Total Entries"]);
  city_total4.push(city2[genre_array[i]]["Total Entries"]);
 }

  city_total = return_totals(city_total);
  city_total3 = return_totals(city_total3);




 var x = d3.scale.ordinal()
      .rangeRoundBands([0, 250], .1)
      .domain([0, bbVis.w]);

  var y = d3.scale.linear()
      .domain([bbVis.h/2, 0])
      .range([bbVis.h, 0]);

  var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom");

  var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left")
      .ticks(12);

x.domain(genre_array);

y.domain([0, 100]);

/* make an x-axis */
svg2.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + bbVis.h + ")")
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

/* make a y-axis */
    svg2.append("g")
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
        .text("Total Entries %")
        .attr("class", "thedetail")
        .attr("x", -30);

/* make the bars */
    svg2.selectAll(".bar")
        .data(city_total)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("class", "thedetail")
        .attr("x", function (d,i) { return x(genre_array[i])+ 20; })
        .attr("width", x.rangeBand() - 25)
        .attr("y", function(d) {  return y(d); })
        .attr("height", function(d) { return bbVis.h - y(d); })
        .attr("fill", "red")
        .on("mouseover", function (d, i){ tooltip.style("visibility", "visible"); tooltip.html(city_total2[i] + " City " + genre_array[i] + " Entries." )})
        .on("mousemove", function(){return tooltip.style("top", (event.pageY-20)+"px").style("left",(event.pageX+20)+"px");})
        .on("mouseout", function(){ return tooltip.style("visibility", "hidden");});

/* make the bars for total world data -- in progress */

/* these were hard coded just for testing */
//world_values = [40, 25, 10, 15, 10 ];

    svg2.selectAll(".bar")
        .data(city_total3)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("class", "thedetail")
        .attr("x", function (d,i) { return x(genre_array[i]); })
        .attr("width", x.rangeBand() - 25)
        .attr("y", function (d,i) {  return y(d); })
        .attr("height", function (d,i) { return bbVis.h - y(d); })
        .attr("fill", "gray")
        .attr("opacity", 0.50)
        .on("mouseover", function (d, i){ tooltip.style("visibility", "visible"); tooltip.html(city_total4[i] + " City " + genre_array[i] + " Entries." )})
        .on("mousemove", function(){return tooltip.style("top", (event.pageY-20)+"px").style("left",(event.pageX+20)+"px");})
        .on("mouseout", function(){ return tooltip.style("visibility", "hidden");});




     svg2
    .append("text")
    .style("color", "black")
    .style("font-size", "15px")
    .attr("class", "thedetail")
    .attr("x", 80)
    .attr("y", -10)
    .text(city1.name + " vs. " + city2.name);     




var legend_labels = [city2.name, city1.name]
var ext_color_domain = ["lightgray", "red"]

  var legend = svg2.selectAll("g.legend")
  .data(ext_color_domain)
  .enter().append("g")
  .attr("class", "legend")
  .attr("class", "thedetail");

  var ls_w = 20, ls_h = 20;

  legend.append("rect")
  .attr("x", 180)
  .attr("y", function(d, i){ return (bbVis.h - (i*ls_h) - 240);})
  .attr("width", ls_w)
  .attr("height", ls_h)
  .style("fill", function(d, i) { return ext_color_domain[i]; })
  .style("opacity", 0.8);

  legend.append("text")
  .attr("x", 210)
  .attr("y", function(d, i){ return (bbVis.h - (i*ls_h) - 224);})
  .text(function(d, i){ return legend_labels[i]; });



}

var make_circles = function(current_genre)
{
      svg.selectAll("circle")
         .data(data_list)
           .enter()
           .append("circle")
           .attr("cx", function (d) {
            return projection([d["longitude"], d["latitude"]])[0]})
           .attr("cy",function (d) {
            return projection([d["longitude"], d["latitude"]])[1]})
           .attr("r", function (d){ value = d[current_genre]["Total Entries"] ; 
              if (value != 0) {scaled_value = circle_scale(d[current_genre]["Total Entries"])} 
                else scaled_value = 0 ; return scaled_value})
           .attr("city",function (d){return d.city})
           .style("opacity", 0.75)
           .on("mouseover", function(d){ make_bars(d); console.log(d); tooltip.style("visibility", "visible");
                    tooltip.html("City: " + d.name + " <br>Total number of videos in the " + current_genre + " genre : " + d[current_genre]["Total Entries"]);})

           .on("mousemove", function(){return tooltip.style("top", (event.pageY-20)+"px").style("left",(event.pageX+20)+"px");})
           .on("mouseout", function(){ return tooltip.style("visibility", "hidden");})
}

var initVis = function(error, world, cities, genre_data){

  merged_data = merge(cities,genre_data);


  world_values = world_genre_count(genre_data);
  world_values2 = world_genre_count(genre_data);

     svg.selectAll("path")
        .data(world.features.filter(function(d) {return d.id != -99; }))
        .enter()
        .append("path")
        .attr("d", path)
        .attr("class", "country")
        .style("fill", "#ccc")
        .on("mouseover", function(d){ tooltip.style("visibility", "visible");
                    tooltip.text("You're currently mousing over " + d["properties"]["name"] + "!");})
        .on("mousemove", function(){return tooltip.style("top", (event.pageY-20)+"px").style("left",(event.pageX+20)+"px");})
        .on("mouseout", function(){return tooltip.style("visibility", "hidden");})
        .on("click", zooming)  
      ;
      data_list = []

      for (x in merged_data){
        data_list.push(merged_data[x]);
      }
  make_circles(current_genre);


  var yearDrop = d3.select("#table_container")
    .data(data_list)
    .append("form")
    .append("select")
    .on("change", function() {
      genre = this.options[this.selectedIndex].value;

      d3.selectAll("circle").remove();
      d3.selectAll(".thedetail").remove();

      make_circles(genre);

    });


var yearOpts = yearDrop.selectAll("option")
    .data(genre_array)
    .enter()
    .append("option")
      .text(function (d) { return d; })
      .attr("value", function (d) { return d; });




var city_list = [];
for(var k in cities) city_list.push(k);


  var cityDrop = d3.select("#table_container2")
    .data(city_list.sort())
    .append("form")
    .append("select")
    .on("change", function() {
      selected_city_1 = this.options[this.selectedIndex].value;

      for (i in data_list)
      {
        if (data_list[i]["name"] == selected_city_1)
          {
           // console.log(data_list[i]);
            selected_city_1 =  data_list[i];

          };
      }
    });


var cityOpts = cityDrop.selectAll("option")
    .data(city_list.sort())
    .enter()
    .append("option")
      .text(function (d) { return d; })
      .attr("value", function (d) { return d; });

var cityDrop2 = d3.select("#table_container3")
    .data(city_list.sort())
    .append("form")
    .append("select")
    .on("change", function() {
      selected_city_2 = this.options[this.selectedIndex].value;

      for (i in data_list)
      {
        if (data_list[i]["name"] == selected_city_2)
          {
            //console.log(data_list[i]);
            selected_city_2 = data_list[i];

          };
      }
    });


var cityOpts2 = cityDrop2.selectAll("option")
    .data(city_list.sort())
    .enter()
    .append("option")
      .text(function (d) { return d; })
      .attr("value", function (d) { return d; });

/* for default input */
 for (i in data_list)
      {
        if (data_list[i]["name"] == selected_city_2)
          {
            //console.log(data_list[i]);
            selected_city_2 = data_list[i];

          };
      }

 for (i in data_list)
      {
        if (data_list[i]["name"] == selected_city_1)
          {
            //console.log(data_list[i]);
            selected_city_1 = data_list[i];

          };
      }

var showButton = d3.select("#table_container3")
    .append("button")    
    .text(" Update Bar Chart ")
    //.style("height", "130px")
    .on("click", function() {make_bars2(selected_city_1, selected_city_2)});






}




queue()
    .defer(d3.json,"../data/world_data.json")
    .defer(d3.json, "../CityInfo/cities.json")
    .defer(d3.json,"../data/genre_data.json")
    .await(initVis);


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