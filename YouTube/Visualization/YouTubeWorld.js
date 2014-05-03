$(document).ready(function () {
 });

var margin = {
    top: 75,
    right: 50,
    bottom: 50,
    left: 75
};

var width = 800 - margin.left - margin.right;
var height = 600 - margin.bottom - margin.top;
var centered;

var bar_height = 425;

var bbVis = {
    x: 30,
    y: 5,
    w: width - 100,
    h: 275
};

/* defaults */
var selected_city_1 = " ";
var selected_city_2 = " ";
var selected_videos = 3;
var current_selection;
var VidId;
var first_time = true;
var step = 100
var current_genre = "Comedy";
var size_by = "Total Entries";


//The svg in which the main visualization (map) will take place
var svg = d3.select("#vis").append("svg")
    .attr({
      width: width + margin.left + margin.right,
      height: height + margin.top + margin.bottom
      })
    .append("g").attr({
      transform: "translate(" + margin.left + "," + margin.top + ")"
    });


//The svg in which the bar chart displays
var svg2 = d3.select("#textLabel").append("svg")
    .attr({
      width: width + margin.left + margin.right - 400,
      height: height + margin.top + margin.bottom + 10
      })
    .append("g").attr({
      transform: "translate(" + margin.left + "," + (margin.top - 5) + ")"
    });


var projectionMethods = [
    {
        name:"mercator",
        method: d3.geo.mercator().translate([width/2, height/ 2])//.precision(.1);
    }]

var projection = d3.geo.mercator().translate([width / 2, height / 2]).precision(.1)
var path = d3.geo.path().projection(projectionMethods[0].method);

var circle_scale =  {"Total Entries" : d3.scale.log().domain([0.1,120000]).range([0,10]), 
  "Average Views" : d3.scale.log().domain([0.1,10000000]).range([0,10]), 
  "Average Rating" : d3.scale.linear().domain([0,5]).range([0,10])};

var legend_scale =  {"Total Entries" : d3.scale.linear().range([bar_height, 0]).domain([0, 100]), 
  "Average Views" : d3.scale.linear().range([bar_height, 0]).domain([0, 100]), 
  "Average Rating" : d3.scale.linear().range([bar_height, 0]).domain([0, 6])};



//tooltip 
var tooltip = d3.select("body")
  .append("div")
  .style("position", "absolute")
  .style("z-index", "10")
  .style("visibility", "hidden")
  .style("color", "black")
  .style("font-size", "15px")
  .attr("class", "tooltip");



//The genres we are displaying 
var genre_array = ["Comedy", "Music", "Entertainment", "News", "Sports"];

//Color scale assigning a color for each genre
var color_scale = d3.scale.ordinal()
         .range(['#0099cc','#9933cc','#669900','#ff8800','#cc0000'])
         .domain(genre_array);



  function isInt(n) {
   return n % 1 === 0;
}

function formatNumber(x) {

  if (isInt(x) && size_by != "Average Views") 
  {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
  else if (size_by == "Average Views")
  {
      return x.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");    
  }
  else
  {
      return x.toFixed(4);
  }
}




function world_genre_count (genre_data)
{
  genre_count = 0;
  counter = 0;
  list_of_genre_count = []
  for (j in genre_array)
  {
    for (i in genre_data)
    {
      if(i == genre_array[j]) {
        for (k in genre_data[i]) {
          for (j in genre_data[i][k]) 
          {
            genre_count += +genre_data[i][k][size_by]
          }
        }    
      }
      if (size_by == "Average Rating"){
        list_of_genre_count.push(genre_count/counter);
      }
      else{
        list_of_genre_count.push(genre_count);
      }
    }
  }
  return list_of_genre_count;
console.log(list_of_genre_count);
}

function get_world_average (genre_data){
  world_averages = {};
  for (g in genre_array){
    genre_total = 0;
    genre_count = 0;
    for (i in genre_data){
      if (i == genre_array[g]){
        for (c in genre_data[i]){
          genre_total += +genre_data[i][c][size_by];
          genre_count += 1;
        }
      }
    }
  world_averages[genre_array[g]] = genre_total/genre_count;
  }
    console.log(world_averages);

  return world_averages;
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
          var total_ratings = 0;
          var num_ratings = 0;
          var total_faves = 0;
          var num_faves = 0;
          var total_views = 0;
          var num_views = 0;
          for (i in new_data[c][g]){
            if (new_data[c][g][i]['avg_rating'] != null) {
              total_ratings += +new_data[c][g][i]['avg_rating'];
              num_ratings += 1;
            }
            if (new_data[c][g][i]['fave_count'] != null) {
              total_faves += +new_data[c][g][i]['fave_count'];
              num_faves += 1;
            }
            if (new_data[c][g][i]['view_count'] != null) {
              total_views += +new_data[c][g][i]['view_count'];
              num_views += 1;
            }
          }
          new_data[c][g]['Average Rating'] = total_ratings / num_ratings;
          new_data[c][g]['Average Views'] = total_views / num_views;
          new_data[c][g]['Average Favorites'] = total_faves / num_faves;       
        }
      }
    }
  }
  return new_data;
}

function return_totals (array_of_values)
{
  var total = 0;
  console.log(array_of_values);

  for (i in array_of_values) 
  {
    total += array_of_values[i] << 0;
  }
  console.log(total);

  for (i in array_of_values) 
  {
    array_of_values[i] = (array_of_values[i] / total)*100;
  }
  console.log(array_of_values);
  return array_of_values
}

var make_bars = function(d) 
{

d3.selectAll(".thedetail").remove();
/* Building a bar chart */
original_world_values = [];


  city_total = {}
  city_total2 = {}

  for (i in genre_array)
   {
    city_total[genre_array[i]] = (d[genre_array[i]][size_by]);
    city_total2[genre_array[i]] = (d[genre_array[i]][size_by]);
   }
  if (size_by != "Average Rating")
  {
    city_total = return_totals(city_total);
    
    world_values = return_totals(world_values);

  } 

  city_lst = make_list(city_total);
  city_lst2 = make_list(city_total2);
  world_lst = make_list(world_values);


 var x = d3.scale.ordinal()
      .rangeRoundBands([0, 250], .1)
      .domain(genre_array);



var y = legend_scale[size_by];


  var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom");

  var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left")
      .ticks(12);



/* make an x-axis */
svg2.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + (bar_height) + ")")
    .attr("class", "axis")
    .call(xAxis)
    .attr("class", "thedetail")
    .selectAll("text") 
    .style("text-anchor", "end")
    .attr("dx", "-.8em")
    .attr("dy", ".15em")
    .attr("transform", function(d) {
        return "rotate(-35)" 
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
        .attr("y", -50)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text(function () { if (size_by == "Average Rating") {return size_by} else { return size_by + " %"}})
        .attr("class", "thedetail")
        .attr("x", -30);


/* make the bars */
    svg2.selectAll(".bar")
        .data(city_lst)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("class", "thedetail")
        .attr("x", function (d,i) { return x(genre_array[i])+ 20; })
        .attr("width", x.rangeBand() - 25)
        .attr("y", function(d) {  return y(d); })
        .attr("height", function(d) { return bar_height - y(d); })
        .style("fill", function(d,i){return color_scale(genre_array[i]);})
        .on("mouseover", function (d, i){ tooltip.style("visibility", "visible"); tooltip.html(formatNumber(city_lst[i]) + " <strong> city </strong> " + genre_array[i].toLowerCase() + " " + size_by.toLowerCase() + "" )})
        .on("mousemove", function(){return tooltip.style("top", (event.pageY-20)+"px").style("left",(event.pageX+20)+"px");})
        .on("mouseout", function(){ return tooltip.style("visibility", "hidden");});


    svg2.selectAll(".bar")
        .data(world_lst)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("class", "thedetail")
        .attr("x", function (d,i) { return x(genre_array[i]); })
        .attr("width", x.rangeBand() - 25)
        .attr("y", function (d,i) { return y(d); })
        .attr("height", function (d,i) { return bar_height - y(d); })
        .style("fill", function(d,i){return color_scale(genre_array[i])})
        .style("opacity", 0.25)
        .on("mouseover", function (d, i){ tooltip.style("visibility", "visible"); tooltip.html(formatNumber(world_lst[i]) + " " + "<strong>world</strong> " + genre_array[i].toLowerCase() + " " + size_by.toLowerCase() + "")})
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


    var ext_color_domain = [];

    for (i in genre_array)
    {
     ext_color_domain.push(color_scale(genre_array[i]));
    }

    var legend_labels = [d.name + " Data", "World Data", ]

    var legend = svg2.selectAll("g.legend")
    .data(ext_color_domain)
    .enter().append("g")
    .attr("class", "legend")
    .attr("class", "thedetail");

    var ls_w = 20, ls_h = 20;

    legend.append("rect")
    .attr("class", "legendgradient")
    .attr("x", 45)
    .attr("y", function(d, i){ return (height - (i*ls_h) - 600);})
    .attr("width", ls_w)
    .attr("height", ls_h)
    .style("fill", function(d, i) { return ext_color_domain[i]; })
     .attr("transform", function(d) {
          return "rotate(90)" 
          });

    legend.append("rect")
    .attr("class", "legendgradient")
    .attr("x", 15)
    .attr("y", function(d, i){ return (height - (i*ls_h) - 600);})
    .attr("width", ls_w)
    .attr("height", ls_h)
    .style("fill", function(d, i) { return ext_color_domain[i]; })
    .attr("opacity", 0.25)
     .attr("transform", function(d) {
          return "rotate(90)" 
          });



    legend.append("text")
    .attr("x", 210)
    .attr("y", function(d, i){ return (height - (i*ls_h*1.5) - 414);})
    .text(function(d, i){ return legend_labels[i]; });

}

function make_list (obj){
  lst = [];
  for (i in obj){
    lst.push(obj[i]);
  }
  return lst;
}


var make_bars2 = function(city1, city2) {
console.log(world_values);

d3.selectAll(".thedetail").remove();
/* Building a bar chart */

city_total = []
city_total2 = []

city_total3 = []
city_total4 = []


 for (i in genre_array)
 {
  city_total[genre_array[i]] = (city1[genre_array[i]][size_by]);
  city_total2[genre_array[i]] = (city1[genre_array[i]][size_by]);
  city_total3[genre_array[i]] = (city2[genre_array[i]][size_by]);
  city_total4[genre_array[i]] = (city2[genre_array[i]][size_by]);
 }

if (size_by != "Average Rating")
{
  world_values = return_totals(world_values);
  city_total = return_totals(city_total);
  city_total3 = return_totals(city_total3);
}

console.log(world_values);
world_values_lst = make_list(world_values);
console.log(world_values_lst);
city_values_lst = make_list(city_total);
city_values_lst_2 = make_list(city_total3);


var y = legend_scale[size_by];


 var x = d3.scale.ordinal()
      .rangeRoundBands([0, 250], .1)
      .domain(genre_array);

  var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom");

  var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left")
      .ticks(12);

/* make an x-axis */
svg2.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + bar_height + ")")
    .attr("class", "axis")
    .call(xAxis)
    .attr("class", "thedetail")
    .selectAll("text") 
    .style("text-anchor", "end")
    .attr("dx", "-.8em")
    .attr("dy", ".15em")
    .attr("transform", function(d) {
        return "rotate(-35)" 
        })
    .attr("class", "thedetail");

/* make a y-axis */
    svg2.append("g")
        .attr("class", "y axis")
        .attr("class", "thedetail")
        .attr("class", "axis")
        .call(yAxis)
        .attr("class", "thedetail")
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -50)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text(function () { if (size_by == "Average Rating") {return size_by} else { return size_by + " %"}})
        .attr("class", "thedetail")
        .attr("x", -30);

/* make the bars */
    svg2.selectAll(".bar")
        .data(city_values_lst)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("class", "thedetail")
        .attr("x", function (d,i) { return x(genre_array[i])+ 20; })
        .attr("width", x.rangeBand() - 25)
        .attr("y", function(d) { return y(d); })
        .attr("height", function(d) { return bar_height - y(d); })
        .style("fill", function(d,i){ return color_scale(genre_array[i]);})
        .on("mouseover", function (d, i){ tooltip.style("visibility", "visible"); tooltip.html(formatNumber(city_values_lst[i]) + " City " + genre_array[i] + " Entries." )})
        .on("mousemove", function(){return tooltip.style("top", (event.pageY-20)+"px").style("left",(event.pageX+20)+"px");})
        .on("mouseout", function(){ return tooltip.style("visibility", "hidden");});


    if (city1 == city2)
    {
     svg2.selectAll(".bar")
        .data(world_values_lst)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("class", "thedetail")
        .attr("x", function (d,i) { return x(genre_array[i]); })
        .attr("width", x.rangeBand() - 25)
        .attr("y", function (d,i) {  return y(d); })
        .attr("height", function (d,i) { return bar_height - y(d); })
        .style("fill", function(d,i){return color_scale(genre_array[i])})
        .style("opacity", 0.25)
        .on("mouseover", function (d, i){ tooltip.style("visibility", "visible"); tooltip.html(formatNumber(world_values_lst[i]) + " " + "world " + genre_array[i].toLowerCase() + " entries." )})
        .on("mousemove", function(){return tooltip.style("top", (event.pageY-20)+"px").style("left",(event.pageX+20)+"px");})
        .on("mouseout", function(){ return tooltip.style("visibility", "hidden");});

      
     svg2
        .append("text")
        .style("color", "black")
        .style("font-size", "15px")
        .attr("class", "thedetail")
        .attr("x", 80)
        .attr("y", -10)
        .text(city1.name);     

    var legend_labels = [city2.name + "Data", "World Data"];

    }

    else
    {
    svg2.selectAll(".bar")
        .data(city_values_lst_2)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("class", "thedetail")
        .attr("x", function (d,i) { return x(genre_array[i]); })
        .attr("width", x.rangeBand() - 25)
        .attr("y", function (d,i) {  return y(d); })
        .attr("height", function (d,i) { return bar_height - y(d); })
        .style("fill", function(d,i){return color_scale(genre_array[i])})
        .style("opacity", 0.4)
        .on("mouseover", function (d, i){ tooltip.style("visibility", "visible"); tooltip.html(formatNumber(city_values_lst_2[i]) + " City " + genre_array[i] + " Entries." )})
        .on("mousemove", function(){return tooltip.style("top", (event.pageY-20)+"px").style("left",(event.pageX+20)+"px");})
        .on("mouseout", function(){ return tooltip.style("visibility", "hidden");});


     svg2
    .append("text")
    .style("color", "black")
    .style("font-size", "15px")
    .attr("class", "thedetail")
    .attr("x", 80)
    .attr("y", -10)
    .text(city2.name + " vs. " + city1.name); 

    var legend_labels = [city1.name + " Data", city2.name+ " Data"]    

    }


    var ext_color_domain = [];

    for (i in genre_array)
    {
     ext_color_domain.push(color_scale(genre_array[i]));
    }


      var legend = svg2.selectAll("g.legend")
      .data(ext_color_domain)
      .enter().append("g")
      .attr("class", "legend")
      .attr("class", "thedetail");

      var ls_w = 20, ls_h = 20;

      legend.append("rect")
      .attr("class", "legendgradient")
      .attr("x", 45)
      .attr("y", function(d, i){ return (height - (i*ls_h) - 600);})
      .attr("width", ls_w)
      .attr("height", ls_h)
      .style("fill", function(d, i) { return ext_color_domain[i]; })
       .attr("transform", function(d) {
            return "rotate(90)" 
            });

        legend.append("rect")
      .attr("class", "legendgradient")
      .attr("x", 15)
      .attr("y", function(d, i){ return (height - (i*ls_h) - 600);})
      .attr("width", ls_w)
      .attr("height", ls_h)
      .style("fill", function(d, i) { return ext_color_domain[i]; })
      .attr("opacity", 0.25)
       .attr("transform", function(d) {
            return "rotate(90)" 
            });



      legend.append("text")
      .attr("x", 210)
      .attr("y", function(d, i){ return (height - (i*ls_h*1.5) - 414);})
      .text(function(d, i){ return legend_labels[i]; });

}


var make_circles = function(current_genre)
{
      d3.selectAll("circle").remove();

      svg.selectAll("circle")
         .data(data_list)
           .enter()
           .append("circle")
           .attr("cx", function (d) {
            return projection([d["longitude"], d["latitude"]])[0]})
           .attr("cy",function (d) {
            return projection([d["longitude"], d["latitude"]])[1]})
           .attr("r", function (d){ 
              value = d[current_genre][size_by]; 
              if (value != 0) {scaled_value = circle_scale[size_by](d[current_genre][size_by])} 
              else scaled_value = 0 ; return scaled_value})
           .attr("city",function (d){return d.city})
           .style("opacity",0.75)
           .style("fill", function(d){
              max = 0;
              max_genre = "";
              genre_array.forEach(function(g){
                if(+d[g][size_by] > max){
                  max = +d[g][size_by];
                  max_genre = g;
                }
              });
             
              return color_scale(max_genre);
           })
           .on("mouseover", function(d) { 
               tooltip.style("visibility", "visible");
              tooltip.html("City: " + d.name + " <br>Total number of videos in the " + current_genre + " genre : " + d[current_genre]["Total Entries"]);
              tooltip.html("<center><strong> " + d.name + " </strong></center><br>" + size_by + " in the " + current_genre.toLowerCase() + " genre : " + formatNumber(d[current_genre][size_by]));
            })
           .on("mousemove", function(){
              return tooltip.style("top", (event.pageY-20)+"px").style("left",(event.pageX+20)+"px");})
           .on("mouseout", function(){ 
              return tooltip.style("visibility", "hidden");})
               .on("click", function (d) {

                make_bars(d);

            d3.select("#left").style("display", "inline")
            d3.select("#right").style("display", "inline")

            d3.select(".cityname").html(d.name);
            d3.select(".playcount").html(size_by + ": " + formatNumber(d[current_genre][size_by]));
            d3.select(".genres").html(current_genre);

            current_selection = d; 

            VidId1 = d[current_genre][0]["video_id"];
            VidId2 = d[current_genre][1]["video_id"];
            VidId3 = d[current_genre][2]["video_id"];
            VidId4 = d[current_genre][3]["video_id"];
            VidId5 = d[current_genre][4]["video_id"];
            VidId6 = d[current_genre][5]["video_id"];
            VidId7 = d[current_genre][6]["video_id"];
            VidId8 = d[current_genre][7]["video_id"];
            VidId9 = d[current_genre][8]["video_id"];
            if (d.name != "Kano ")
            {
            VidId10 = d[current_genre][9]["video_id"];
            }
            

            if (first_time)
            {
            first_time = false;

            var params = { allowScriptAccess: "always" };
            var atts = { id: "myytplayer" };
            swfobject.embedSWF("http://www.youtube.com/v/" + VidId1 + "?enablejsapi=1&playerapiid=ytplayer&version=3",
                               "ytapiplayer", "375", "250", "0", null, null, params, atts);
            var params = { allowScriptAccess: "always" };
            var atts = { id: "myytplayer" };
            swfobject.embedSWF("http://www.youtube.com/v/" + VidId2 + "?enablejsapi=1&playerapiid=ytplayer&version=3",
                               "ytapiplayer", "375", "250", "0", null, null, params, atts);
            var params = { allowScriptAccess: "always" };
            var atts = { id: "myytplayer" };
            swfobject.embedSWF("http://www.youtube.com/v/" + VidId3 + "?enablejsapi=1&playerapiid=ytplayer&version=3",
                               "ytapiplayer", "375", "250", "0", null, null, params, atts);
            var params = { allowScriptAccess: "always" };
            var atts = { id: "myytplayer" };
            swfobject.embedSWF("http://www.youtube.com/v/" + VidId4 + "?enablejsapi=1&playerapiid=ytplayer&version=3",
                               "ytapiplayer", "375", "250", "0", null, null, params, atts);
            var params = { allowScriptAccess: "always" };
            var atts = { id: "myytplayer" };
            swfobject.embedSWF("http://www.youtube.com/v/" + VidId5 + "?enablejsapi=1&playerapiid=ytplayer&version=3",
                               "ytapiplayer", "375", "250", "0", null, null, params, atts);

            var params = { allowScriptAccess: "always" };
            var atts = { id: "myytplayer" };
            swfobject.embedSWF("http://www.youtube.com/v/" + VidId6 + "?enablejsapi=1&playerapiid=ytplayer&version=3",
                               "ytapiplayer", "375", "250", "0", null, null, params, atts);
            var params = { allowScriptAccess: "always" };
            var atts = { id: "myytplayer" };
            swfobject.embedSWF("http://www.youtube.com/v/" + VidId7 + "?enablejsapi=1&playerapiid=ytplayer&version=3",
                               "ytapiplayer", "375", "250", "0", null, null, params, atts);
            var params = { allowScriptAccess: "always" };
            var atts = { id: "myytplayer" };
            swfobject.embedSWF("http://www.youtube.com/v/" + VidId8 + "?enablejsapi=1&playerapiid=ytplayer&version=3",
                               "ytapiplayer", "375", "250", "0", null, null, params, atts);
            var params = { allowScriptAccess: "always" };
            var atts = { id: "myytplayer" };
            swfobject.embedSWF("http://www.youtube.com/v/" + VidId9 + "?enablejsapi=1&playerapiid=ytplayer&version=3",
                               "ytapiplayer", "375", "250", "0", null, null, params, atts);
            var params = { allowScriptAccess: "always" };
            var atts = { id: "myytplayer" };
            swfobject.embedSWF("http://www.youtube.com/v/" + VidId10 + "?enablejsapi=1&playerapiid=ytplayer&version=3",
                               "ytapiplayer", "375", "250", "0", null, null, params, atts);

            
            d3.selectAll("object").attr("class", function(d, i) { return "object" + i}).style("padding", "5px");

            array_of_objects = d3.selectAll("object");

            for (i = 0; i < 10; i++)
            {
              d3.selectAll(".object" + i).style("display", "none");
            }
            
            for (i= 0; i< selected_videos; i++)
            {
              d3.selectAll(".object"+ i).style("display", "inline");
            }

          }
          else
          {
            array_of_objects = d3.selectAll("object");

            for (i = 0; i < 10; i++)
            {
              d3.selectAll(".object" + i).style("display", "none");
            }
            
            for (i= 0; i< selected_videos; i++)
            {
              d3.selectAll(".object"+ i).style("display", "inline");
            }
          d3.selectAll("#myytplayer").filter(function(d,i) {return i==0;}).attr("data", "http://www.youtube.com/v/" + VidId1 + "?enablejsapi=1&playerapiid=ytplayer&version=3")
          d3.selectAll("#myytplayer").filter(function(d,i) {return i==1;}).attr("data", "http://www.youtube.com/v/" + VidId2 + "?enablejsapi=1&playerapiid=ytplayer&version=3")
          d3.selectAll("#myytplayer").filter(function(d,i) {return i==2;}).attr("data", "http://www.youtube.com/v/" + VidId3 + "?enablejsapi=1&playerapiid=ytplayer&version=3")
          d3.selectAll("#myytplayer").filter(function(d,i) {return i==3;}).attr("data", "http://www.youtube.com/v/" + VidId4 + "?enablejsapi=1&playerapiid=ytplayer&version=3")
          d3.selectAll("#myytplayer").filter(function(d,i) {return i==4;}).attr("data", "http://www.youtube.com/v/" + VidId5 + "?enablejsapi=1&playerapiid=ytplayer&version=3")
          d3.selectAll("#myytplayer").filter(function(d,i) {return i==5;}).attr("data", "http://www.youtube.com/v/" + VidId6 + "?enablejsapi=1&playerapiid=ytplayer&version=3")
          d3.selectAll("#myytplayer").filter(function(d,i) {return i==6;}).attr("data", "http://www.youtube.com/v/" + VidId7 + "?enablejsapi=1&playerapiid=ytplayer&version=3")
          d3.selectAll("#myytplayer").filter(function(d,i) {return i==7;}).attr("data", "http://www.youtube.com/v/" + VidId8 + "?enablejsapi=1&playerapiid=ytplayer&version=3")
          d3.selectAll("#myytplayer").filter(function(d,i) {return i==8;}).attr("data", "http://www.youtube.com/v/" + VidId9 + "?enablejsapi=1&playerapiid=ytplayer&version=3")
          d3.selectAll("#myytplayer").filter(function(d,i) {return i==9;}).attr("data", "http://www.youtube.com/v/" + VidId10 + "?enablejsapi=1&playerapiid=ytplayer&version=3")

          }

           })
}


var initVis = function(error, world, cities, genre_data){
  world_values = get_world_average(genre_data);

                $('.nav-tabs').click(function(e){
                    var classname = e.target.className;
                    $('li').removeClass('active');
                      if (classname == "rating"){
                        $('li').eq(1).addClass('active');
                        size_by = "Average Rating"; make_circles(current_genre);
                        world_values = get_world_average(genre_data);
                        d3.selectAll(".thedetail").remove();
                        
                      }
                      else if (classname == "views"){
                        $('li').eq(2).addClass('active');
                        size_by = "Average Views"; make_circles(current_genre);
                        world_values = get_world_average(genre_data);
                        d3.selectAll(".thedetail").remove();
                      }
                      else {
                        $('li').eq(0).addClass('active');
                        world_values = get_world_average(genre_data);
                        size_by = "Total Entries"; make_circles(current_genre);
                        d3.selectAll(".thedetail").remove();
                      }})
  


var genreDrop = d3.select("#dropdown")
    .data(genre_array)
    .append("form")
    .append("select")
    .on("change", function() {
      gen = "" + this.options[this.selectedIndex].value;
      make_circles(gen);
      d3.selectAll(".thedetail").remove();
    });

var genreOpts = genreDrop.selectAll("option")
    .data(genre_array)
    .enter()
    .append("option")
    .text(function (d) { return d})
    .attr("value", function (d) { return d; });


world_genre_count(genre_data);




  d3.select("#lebutton").on("click", function() {make_bars2(selected_city_1, selected_city_2)});

  merged_data = merge(cities,genre_data);



     svg.selectAll("path")
        .data(world.features.filter(function(d) {return d.id != -99; }))
        .enter()
        .append("path")
        .attr("d", path)
        .attr("class", "country")
        .on("click", zooming)  
      ;
      data_list = []

      for (x in merged_data){
        data_list.push(merged_data[x]);
      }
  make_circles(current_genre);



var city_list = [];
for(var k in cities) city_list.push(k);

city_list.sort();;

city_list.unshift("<Select a city>")


  var cityDrop = d3.select("#table_container2")
    .data(city_list)
    .append("form")
    .append("select")
    .on("change", function() {
      selected_city_1 = this.options[this.selectedIndex].value;

      for (i in data_list)
      {
        if (data_list[i]["name"] == selected_city_1)
          {
            selected_city_1 =  data_list[i];

          };
      }
    });


var cityOpts = cityDrop.selectAll("option")
    .data(city_list)
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
          {            selected_city_2 = data_list[i];

          };
      }

 for (i in data_list)
      {
        if (data_list[i]["name"] == selected_city_1)
          {
            selected_city_1 = data_list[i];

          };
      }


number_of_videos = [3, 5, 10];
 
  var vidDrop = d3.select("#table_container4")
    .data(data_list)
    .append("form")
    .append("select")
    .on("change", function() {
      selected_videos = this.options[this.selectedIndex].value;

      VidId1 = current_selection[current_genre][0]["video_id"];
      VidId2 = current_selection[current_genre][1]["video_id"];
      VidId3 = current_selection[current_genre][2]["video_id"];
      VidId4 = current_selection[current_genre][3]["video_id"];
      VidId5 = current_selection[current_genre][4]["video_id"];
      VidId6 = current_selection[current_genre][5]["video_id"];
      VidId7 = current_selection[current_genre][6]["video_id"];
      VidId8 = current_selection[current_genre][7]["video_id"];
      VidId9 = current_selection[current_genre][8]["video_id"];
      VidId10 = current_selection[current_genre][9]["video_id"];
            
      array_of_objects = d3.selectAll("object");

      for (i = 0; i < 10; i++)
      {
        d3.selectAll(".object" + i).style("display", "none");
      }
      
      for (i= 0; i< selected_videos; i++)
      {
        d3.selectAll(".object"+ i).style("display", "inline");
      }

      d3.selectAll("#myytplayer").filter(function(d,i) {return i==0;}).attr("data", "http://www.youtube.com/v/" + VidId1 + "?enablejsapi=1&playerapiid=ytplayer&version=3")
      d3.selectAll("#myytplayer").filter(function(d,i) {return i==1;}).attr("data", "http://www.youtube.com/v/" + VidId2 + "?enablejsapi=1&playerapiid=ytplayer&version=3")
      d3.selectAll("#myytplayer").filter(function(d,i) {return i==2;}).attr("data", "http://www.youtube.com/v/" + VidId3 + "?enablejsapi=1&playerapiid=ytplayer&version=3")
      d3.selectAll("#myytplayer").filter(function(d,i) {return i==3;}).attr("data", "http://www.youtube.com/v/" + VidId4 + "?enablejsapi=1&playerapiid=ytplayer&version=3")
      d3.selectAll("#myytplayer").filter(function(d,i) {return i==4;}).attr("data", "http://www.youtube.com/v/" + VidId5 + "?enablejsapi=1&playerapiid=ytplayer&version=3")
      d3.selectAll("#myytplayer").filter(function(d,i) {return i==5;}).attr("data", "http://www.youtube.com/v/" + VidId6 + "?enablejsapi=1&playerapiid=ytplayer&version=3")
      d3.selectAll("#myytplayer").filter(function(d,i) {return i==6;}).attr("data", "http://www.youtube.com/v/" + VidId7 + "?enablejsapi=1&playerapiid=ytplayer&version=3")
      d3.selectAll("#myytplayer").filter(function(d,i) {return i==7;}).attr("data", "http://www.youtube.com/v/" + VidId8 + "?enablejsapi=1&playerapiid=ytplayer&version=3")
      d3.selectAll("#myytplayer").filter(function(d,i) {return i==8;}).attr("data", "http://www.youtube.com/v/" + VidId9 + "?enablejsapi=1&playerapiid=ytplayer&version=3")
      d3.selectAll("#myytplayer").filter(function(d,i) {return i==9;}).attr("data", "http://www.youtube.com/v/" + VidId10 + "?enablejsapi=1&playerapiid=ytplayer&version=3")


    });

var vidOpts = vidDrop.selectAll("option")
    .data(number_of_videos)
    .enter()
    .append("option")
      .text(function (d) { return d; })
      .attr("value", function (d) { return d; });


 

  var legend = svg.selectAll("g.legend")
  .data(genre_array)
  .enter().append("g")
  .attr("class", "legend");

  var ls_w = 20, ls_h = 20;

  legend.append("rect")
  .attr("x", -40)
  .attr("y", function(d, i){ return (height - (i*ls_h) - 2*ls_h) - 150;})
  .attr("width", ls_w)
  .attr("height", ls_h)
  .style("fill", function(d, i) { return color_scale(d); })
  .style("opacity", 0.8);

  legend.append("text")
  .attr("x", -10)
  .attr("y", function(d, i){ return (height - (i*ls_h) - ls_h - 4) - 150;})
  .text(function(d, i){ return genre_array[i]; });


var tooltip2 = d3.select("body")
        .append("div")
        .style("position", "absolute")
        .style("z-index", "10")
        .style("visibility", "visible")
        .style("color", "black")
        .style("font-size", "15px")
        .style("top", "88px")
        .style("left", "60px")
        .style("height", "15px")
        .attr("class", "tooltip")
        .html("<h3 class='cityname text' padding-top='-10px'>Click on a city</h3>");




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
    x = width / 2 - margin.left;
    y = height / 2 - margin.top;
    k = 1;
    centered = null;
  }

  svg.selectAll("path")
      .classed("active", centered && function(d) { return d === centered; });

  svg.transition()
      .duration(750)
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
      .style("stroke-width", 1.5 / k + "px");
}

function toLeft(id) {
    document.getElementById(id).scrollLeft -= step
    timerDown = setTimeout("toLeft('" + id + "')", 10)
}

function toRight(id) {
    document.getElementById(id).scrollLeft += step
    timerUp = setTimeout("toRight('" + id + "')", 10)
}

