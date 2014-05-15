var margin = {
    top: 50,
    right: 50,
    bottom: 50,
    left: 50
};

var width = 900 - margin.left - margin.right;
var height = 650 - margin.bottom - margin.top;
var centered;


var bar_height = 270;


var bbVis = {
    x: 100,
    y: 10,
    w: width - 100,
    h: 300
};

Months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
browser_array = ["None", "Other", "Mobile", "Safari", "Opera", "IE", "Firefox", "Chrome"];
browser_array2 = ["Other", "Mobile", "Safari", "Opera", "IE", "Firefox", "Chrome"];
color_display = ["Most Popular", "2nd Most Popular", "3rd Most Popular"];
Years = [2010, 2011, 2012, 2013, 2014];



var country_name;
var year_selected_text = "May 2014";
var selected_country;

var color_option = "Most Popular";
var color_option_val = "Most Popular N"

var dataSet = {};

var bar_check = true;
var pie_check = false;
var running = false;

var textOffset = 35;
var labelr = 120;


var ls_w = 20, ls_h = 20;



var svg = d3.select("#vis").append("svg").attr({
    width: width, //+ margin.left + margin.right,
    height: height, //+ margin.top + margin.bottom
}).style("z-index", "10").append("g").attr({
        transform: "translate(" + 0 + "," + (margin.top + 40) + ")"
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

var newCountries = [];

var projection = d3.geo.mercator().translate([width / 2, height / 2]).precision(.1)
var path = d3.geo.path().projection(projectionMethods[0].method);


var color_domain = [10, 20, 30, 40, 45];
var color_domain_green = [10, 20, 30, 40, 50, 60];
var color_domain_red = [10, 20, 30];
var color_domain_brown = [0, 5];


var green_color = d3.scale.quantize().range(colorbrewer.Greens[8]).domain(color_domain_green);
var orange_color = d3.scale.quantize().range(colorbrewer.Oranges[4]).domain(color_domain);
var blue_color = d3.scale.quantize().range(colorbrewer.Blues[5]).domain(color_domain);
var red_color = d3.scale.quantize().range(colorbrewer.Reds[5]).domain(color_domain_red);
var yellow_color = d3.scale.quantize().range(colorbrewer.Yellows[5]).domain(color_domain);
var purple_color = d3.scale.quantize().range(colorbrewer.Purples[9]).domain(color_domain);
var brown_color = d3.scale.quantize().range(colorbrewer.Browns[5]).domain(color_domain_brown);
var grey_color = d3.scale.quantize().range(colorbrewer.Greys[5]).domain(color_domain);



  var tooltip = d3.select("body")
          .append("div")
          .style("position", "absolute")
          .style("z-index", "1")
          .style("visibility", "hidden")
          .style("color", "black")
          .style("font-size", "20px")
          .attr("class", "tooltip");


        var tooltip2 = d3.select("body")
          .append("div")
          .style("position", "absolute")
          .style("z-index", "1")
          .style("visibility", "visble")
          .style("color", "black")
          .style("font-size", "15px")
          .attr("class", "tooltip2")
          .style("height", "350px")
          .style("width", "300px")
          .style("top", "140px").style("left", "820px")
          .html("<svg id='pie_chart_place' style='height:350px; width:300px''><svg>");






/* function to match between two states that 
might just be named differently between the
two files */

var match_countries = function(string1, string2){
  array1 = string1.split(" ");
  array2 = string2.split(" ");

  for (i in array1){
    for (j in array2)
    {
      if (array1[i] == array2[j])
      {
        if (array1[i] != "of" && array1[i] != "Guinea" && array1[i] != "Ireland" 
          && array1[i] != "Northern" && array1[i] != "Southern"  && array1[i] != "French" 
          && array1[i] != "Democratic" && array1[i] != "Island" && array1[i] != "Islands" 
          && array1[i] != "the" && array1[i] != "and" && array1[i] != "Republic" && array1[i] != "People's" 
          && array1[i] != "United" && array1[i] != "South" && array1[i] != "North")
        {
          return true;
        }
      }
  }
}
}

/* // Some testing for my function
test1 = match_string("hello how are you", "goodbye sir, have a great day!");
console.log(test1);
test2 = match_string("hello how are you", "goodbye to you sir!");
console.log(test2);
test3 = match_string("Republic of Ghana", "Ghana");
console.log(test3);
*/


var merge_data = function (world, usage)
{
complete_data = {}
  for (i in world['features'])
  {
    complete_data[world['features'][i]['properties']['name']] = 0;
    world_name = world['features'][i]['properties']['name'].concat(" ");
    for (j in usage){
      data_name = usage[j]['Continent'];
      if (data_name == world_name)
      {
        complete_data[world['features'][i]['properties']['name']] = usage[j];
      }
    }
  }
  for (m in complete_data)
  {
    if (complete_data[m] == 0)
    {
      for (n in usage)
      {
        data_name2 = usage[n]['Continent'];
        if (match_countries(data_name2, m)){
          complete_data[m] = usage[n];
        }

      }
    }
  }
  return complete_data;
}

var sort_object = function(object)
{
  for (i in object)
  {
    if (object[i] != 0)
    {
      var list = object[i]
      keysSorted = Object.keys(list).sort(function(a,b){return list[b]-list[a]});
      console.log(keysSorted);
    }
  }
}


var percentages = function(object_of_values)
{
  for (country in object_of_values)
  {
    var total = 0;
    for (browser in object_of_values[country])
    {
      total = object_of_values[country][browser] + total;
    }
    for (browser2 in object_of_values[country])
    {
      object_of_values[country][browser2] = ((object_of_values[country][browser2] / total)*100).toFixed(2);
    } 
  }
  return object_of_values;
}


var cleaning_and_aggregation = function(object)
{
  clean_object = {}

  for (country0 in object)
  {
    clean_object[country0] = {}
  }
 
  
  for (country in object)
  {
    clean_object[country]["Mobile"] = 0;
    clean_object[country]["Other"] = 0;
   
    for (browser in object[country])
    {

      if ((browser == "iPhone"))
      {
        clean_object[country]["Safari"] = parseFloat(object[country]["Safari"]) + (parseFloat(object[country][browser])); 
      }
      else if ((browser == "iPod Touch"))
      {
        clean_object[country]["Safari"] = parseFloat(clean_object[country]["Safari"]) + (parseFloat(object[country][browser])); 
      }

      else if (browser == "IEMobile")
      {
        clean_object[country]["IE"] = parseFloat(object[country]["IE"]) + parseFloat(object[country][browser]);
      }
      else if (browser == "Android" || browser == "Nokia" || browser == "Blackberry" || browser == "Openwave Mobile Browser" 
        || browser == "SonyEricsson" || browser == "Samsung" || browser =="Motorola Internet Browser")
      {
        clean_object[country]["Mobile"] = parseFloat(object[country][browser]) + parseFloat(clean_object[country]["Mobile"]);
      }
      else if (browser == "Chrome" || browser == "IE" || browser == "Opera" || browser =="Firefox")
      {
        clean_object[country][browser] = parseFloat(object[country][browser]);
      }
      else if (browser == "360 Safe Browser" || browser == "CoRom+" || browser == "Dolfin" || browser == "Iceweasel" 
        || browser == "Iron" || browser == "Maxthon" || browser == "NetFront" || browser == "Obigo" 
        || browser == "Openwave Mobile Browser" || browser == "Phantom" || browser == "Puffin" 
        || browser == "QQ Browser" || browser == "Silk" || browser == "Sogou Explorer" || browser == "UC Browser"
        || browser == "Unknown" || browser == "Yandex Browser" || browser == "Maxthon" || browser == "SeaMonkey" 
        || browser == "AppleWebKit" || browser == "Windows Media Player" || browser == "Sony PS3" 
        || browser == "Bolt" || browser == "The World" || browser == "Chromium" || browser =="Kindle" || browser=="Pale Moon")
      {
        clean_object[country]["Other"] = parseFloat(clean_object[country]["Other"]) + parseFloat(object[country][browser]);
      }
    }
  }
  clean_object["World"] = {};
  clean_object["World"]["Safari"] = 0;
  clean_object["World"]["Chrome"] = 0;
  clean_object["World"]["Firefox"] = 0;
  clean_object["World"]["Opera"] = 0;
  clean_object["World"]["IE"] = 0;
  clean_object["World"]["Mobile"] = 0;
  clean_object["World"]["Other"] = 0;

  for (country2 in clean_object)
  {
    for (browser2 in clean_object[country2])
    {
      clean_object["World"][browser2] = clean_object["World"][browser2] + clean_object[country2][browser2];

    }
  }

  return clean_object

}



 function compareNumbers(a, b) {return parseFloat(b) - parseFloat(a);}

 function data_sort(a,b) {if (compareNumbers(a[1], b[1]) == 0) { return d3.descending(a[0], b[0]);}
        else { return compareNumbers(a[1], b[1]);}}



var sorting_object = function(object)
{
  for (country in object)
  {
    sorted_list = (_.pairs(object[country])).sort(data_sort);
    if (sorted_list.length != 7)
    {
      object[country] = [];
      object[country]["Most Popular"] = "None";
      object[country]["2nd Most Popular"] = "None";
      object[country]["3rd Most Popular"] = "None";
      object[country]["Most Popular N"] = "20";
      object[country]["2nd Most Popular N"] = "20";
      object[country]["3rd Popular N"] = "20";

    }
    else
    {
      object[country] = sorted_list;
      object[country]["Most Popular"] = sorted_list[0][0];
      object[country]["3rd Most Popular"] = sorted_list[2][0];
      object[country]["Most Popular N"] = sorted_list[0][1];
      object[country]["3rd Most Popular N"] = sorted_list[2][1];
      object[country]["2nd Most Popular"] = sorted_list[1][0];
      object[country]["2nd Most Popular N"] = sorted_list[1][1];
    }
  }
  return object;
}


var colorDict = {};

colorDict["Firefox"] = "#e59400"; //orange
colorDict["IE"] = "#1E90FF"; //blue
colorDict["Safari"] = "yellow"; //yellow
colorDict["Opera"] = "#B22222";//red 
colorDict["Chrome"] = "#00933B"; //green
colorDict["Mobile"] = "#4B0082"; //purple
colorDict["Other"] = "#614126"; //brown
colorDict["None"] = "#808080"; //grey


/* icons: https://www.iconfinder.com/icons/10625/16_colors_browser_internet_explorer_microsoft_icon */


var make_piechart = function(country_obj, country_name)
{


d3.selectAll(".arc").remove();
d3.selectAll(".thedetail").remove();
tooltip2.style("display", "block");

keys = Object.keys(country_obj);
values = []
for(var key in country_obj) {
    var value = country_obj[key];
    values.push(value);
}


radius = Math.min(200, 200) / 2;

var arc = d3.svg.arc()
  .outerRadius(radius - 10)
  .innerRadius(0);

var pie = d3.layout.pie()
    .sort(null)
    .value(function(d) { return d; });


 var g = d3.select("#pie_chart_place").selectAll(".arc")
      .data(pie(values))
    .enter().append("g")
      .attr("class", "arc")
      .attr("transform", "translate(" + 150 + "," + 175 + ")");

d3.select("#pie_chart_place")
.append("text")
.attr("class", "arc thedetail")
.html(country_name).attr("transform", "translate(" +50 + "," + 10 + ")")
.style("float","center");    

g.append("path")
  .attr("d", arc)
  .style("fill", function (d,i) { return colorDict[keys[i]];});     

  var labels = g.append("text")
      .attr("class", "thedetail")
      .attr("transform", function(d) {
        var c = arc.centroid(d),
        x = c[0],
        y = c[1],
        // pythagorean theorem for hypotenuse
        h = Math.sqrt(x*x + y*y);
        return "translate(" + (x/h * labelr) +  ',' + (y/h * labelr) +  ")";})
      .attr("dy", ".35em")
      .style("text-anchor", "middle")
      .text(function (d,i) { if (values[i] == 0.00) {return ""} else {return values[i] + "%"; }
       });


var prev;
labels.each(function(d, i) {
  if(i > 0) {
    var thisbb = this.getBoundingClientRect(),
        prevbb = prev.getBoundingClientRect();
    // move if they overlap
    if(!(thisbb.right < prevbb.left || 
            thisbb.left > prevbb.right || 
            thisbb.bottom < prevbb.top || 
            thisbb.top > prevbb.bottom)) {
        var ctx = thisbb.left + (thisbb.right - thisbb.left)/2,
            cty = thisbb.top + (thisbb.bottom - thisbb.top)/2,
            cpx = prevbb.left + (prevbb.right - prevbb.left)/2,
            cpy = prevbb.top + (prevbb.bottom - prevbb.top)/2,
            off = Math.sqrt(Math.pow(ctx - cpx, 2) + Math.pow(cty - cpy, 2))/2;
        d3.select(this).attr("transform",
            "translate(" + Math.cos(((d.startAngle + d.endAngle - Math.PI) / 2)) *
                                    (radius + textOffset + 10 + off) + "," +
                           Math.sin((d.startAngle + d.endAngle - Math.PI) / 2) *
                                    (radius + textOffset + off) + ")");
    }
  }
  prev = this;
});


}


var colorMap = function(d, merged_data)
{
  if (merged_data[d["properties"]["name"]][color_option] == "Chrome")
          {
            return green_color(merged_data[d["properties"]["name"]][color_option_val]);
          }
          if (merged_data[d["properties"]["name"]][color_option] == "IE")
          {
            return blue_color(merged_data[d["properties"]["name"]][color_option_val]);
          }
          if (merged_data[d["properties"]["name"]][color_option] == "Mobile")
          {
            return purple_color(merged_data[d["properties"]["name"]][color_option_val]);
          }
          if (merged_data[d["properties"]["name"]][color_option] == "Opera")
          {
            return red_color(merged_data[d["properties"]["name"]][color_option_val]);
          }
          if (merged_data[d["properties"]["name"]][color_option] == "Safari")
          {
            return yellow_color(merged_data[d["properties"]["name"]][color_option_val]);
          }
          if (merged_data[d["properties"]["name"]][color_option] == "None")
          {
            return colorDict[merged_data[d["properties"]["name"]][color_option]];
          }
          if (merged_data[d["properties"]["name"]][color_option] == "Firefox")
          {
            return orange_color(merged_data[d["properties"]["name"]][color_option_val]);
          }
          if (merged_data[d["properties"]["name"]][color_option] == "Other")
          {
            return brown_color(merged_data[d["properties"]["name"]][color_option_val]);
          }
}



yeararray = []

for (year in Years)
{
    for (month in Months)
    {
      yeararray.push(Months[month] + " " + Years[year]);
    }
}

for (i = 0; i < 7 ; i++)
{
yeararray.pop();
}


var svg2 = d3.select("#textLabel").append("svg")
    .attr({
      width: width + margin.left + margin.right - 400,
      height: 400
      })
    .append("g").attr({
      transform: "translate(" + margin.left + "," + (margin.top - 20) + ")"
    });



var initVis = function(error, world, cities, usage1, usage2, usage3, usage4, usage5, usage6, usage7, usage8, usage9, usage10, usage11, usage12, usage13, usage14, usage15, usage16, usage17, usage18, usage19, usage20, usage21, usage22, usage23, usage24, usage25, usage26, usage27, usage28, usage29, usage30, usage31, usage32, usage33, usage34, usage35, usage36, usage37, usage38, usage39, usage40, usage41, usage42, usage43, usage44, usage45, usage46, usage47, usage48, usage49, usage50, usage51, usage52, usage53){
{


year_selected = usage53;

var usage_list = [usage1, usage2, usage3, usage4, usage5, usage6, usage7, usage8, 
usage9, usage10, usage11, usage12, usage13, usage14, usage15, usage16, usage17, 
usage18, usage19, usage20, usage21, usage22, usage23, usage24, usage25, usage26, 
usage27, usage28, usage29, usage30, usage31, usage32, usage33, usage34, usage35, 
usage36, usage37, usage38, usage39, usage40, usage41, usage42, usage43, usage44,
 usage45, usage46, usage47, usage48, usage49, 
usage50, usage51, usage52, usage53];

var yearDict = {};

for (i = 0 ;  i <53 ; i ++)
{
  yearDict[yeararray[i]] = usage_list[i];
}



var tooltipSearch = d3.select("body")
  .append("div")
  .style("position", "absolute")
  .style("z-index", "10")
  .style("visibility", "visble")
  .style("color", "black")
  .style("font-size", "15px")
  .style("width", "0px")
  .style("top", "540px").style("left", "670px");



var make_bars = function(selected_country, country_name, world_data)
{

d3.selectAll(".arc").remove();

d3.selectAll(".thedetail").remove();

tooltip2.style("display", "none");



country_list = [];
world_list = [];

browser_list = Object.keys(selected_country);

console.log(browser_list);


for (i in selected_country)
{
  country_list.push(+selected_country[i]);
  world_list.push(+world_data[i])
}




var x2 = d3.scale.ordinal()
  .rangeRoundBands([0, 350], .1)
  .domain(browser_list);

var y2 = d3.scale.linear()
  .range([bar_height, 0])
  .domain([0, 100]);


  var xAxis2 = d3.svg.axis()
      .scale(x2)
      .orient("bottom");

  var yAxis2 = d3.svg.axis()
      .scale(y2)
      .orient("left")
      .ticks(12);


    svg2.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + (bar_height + 2) + ")")
    //.attr("class", "axis")
    .call(xAxis2)
    .attr("class", "x axis thedetail")
    .selectAll("text") 
    .style("text-anchor", "end")
    .attr("dx", "-.8em")
    .attr("dy", ".15em")
    .attr("transform", function(d) {return "rotate(-35)"});
   // .attr("class", "thedetail");

/* make a y-axis */
    svg2.append("g")
        .attr("class", "y axis")
        .attr("class", "thedetail")
        .attr("class", "axis")
        .call(yAxis2)
        .attr("class", "y axis thedetail")
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -50)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text(function () { "Browser Usage %"})
        .attr("class", "thedetail")
        .attr("x", -30);


    svg2.selectAll(".bar")
        .data(country_list)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("class", "thedetail")
        .attr("x", function (d,i) { return x2(browser_list[i])+ 20; })
        .attr("width", x2.rangeBand() - 23)
        .attr("y", function(d) {  return y2(d); })
        .attr("height", function(d) {console.log(d); return bar_height - y2(d); })
        .style("fill", function(d,i){return colorDict[browser_list[i]];})


    svg2.selectAll(".bar")
        .data(world_list)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("class", "thedetail")
        .attr("x", function (d,i) { return x2(browser_list[i]); })
        .attr("width", x2.rangeBand() - 24)
        .attr("y", function (d,i) { return y2(d); })
        .attr("height", function (d,i) { return bar_height - y2(d); })
        .style("fill", function(d,i){return colorDict[browser_list[i]]})
        .style("opacity", 0.25)

    svg2.append("text")
      .attr("class", "arc thedetail")
      .html(country_name)
      .attr("transform", "translate(" +50 + "," + 10 + ")")
      .style("float","center");    


    var ext_color_domain = [];

    for (i in browser_list)
    {
     ext_color_domain.push(colorDict[browser_list[i]]);
    }

    var legend_labels = [country_name + " Data", "World Data", ]

    var legend = svg2.selectAll("g.legend")
    .data(ext_color_domain)
    .enter().append("g")
    .attr("class", "legend")
    .attr("class", "thedetail");

    var ls_w = 15, ls_h = 15;

    legend.append("rect")
    .attr("class", "legendgradient")
    .attr("x", 90)
    .attr("y", function(d, i){ return (height - (i*ls_h) - 670);})
    .attr("width", ls_w)
    .attr("height", ls_h)
    .style("fill", function(d, i) { return ext_color_domain[i]; })
     .attr("transform", function(d) {
          return "rotate(90)" 
          });

    legend.append("rect")
    .attr("class", "legendgradient")
    .attr("x", 70)
    .attr("y", function(d, i){ return (height - (i*ls_h) - 670);})
    .attr("width", ls_w)
    .attr("height", ls_h)
    .style("fill", function(d, i) { return ext_color_domain[i]; })
    .attr("opacity", 0.25)
     .attr("transform", function(d) {
          return "rotate(90)" 
          });



    legend.append("text")
    .attr("x", 220)
    .attr("y", function(d, i){ return (height - (i*ls_h*1.25) - 448);})
    .text(function(d, i){ return legend_labels[i]; });

}



var createLineGraph = function(lineDisplayOption)
{



d3.selectAll(".lineDetail").remove();

  svg3 = d3.select("#lineVis").append("svg")
  .attr({width: width + margin.left + margin.right, height: height - 100})
  .attr("class", "lineDetail")
  .append("g");

  var lineDict = {};


console.log(yeararray);
for (k in usage_list)
{

  inner_dict = percentages(cleaning_and_aggregation(merge_data(world, usage_list[k])))[lineDisplayOption];
  inner_dict["year"] = yeararray[k];
  lineDict[k] = inner_dict;
}

lineList = [];

for (i in lineDict)
{
  lineList.push(lineDict[i])
}

  // defining the X and Y scale for the graph
var xAxis, xScale, yAxis,  yScale;

xScale = d3.scale.ordinal().domain(yeararray.map(function (d, i) { return d; })).rangePoints([1, bbVis.w]);
yScale = d3.scale.linear().range([bbVis.h -10, 0]).domain([0, 100]);


xAxis = d3.svg.axis()
  .scale(xScale)
  .orient("bottom");

yAxis = d3.svg.axis()
  .scale(yScale)
  .orient("left");

// appending x axis
 d3.select(".lineDetail").append("g")
  .attr("class", "x axis lineDetail")
  .attr({"transform": "translate(" + (margin.left*2) + "," + (bbVis.y + bbVis.h + margin.top) + ")",})
  .call(xAxis)
    .selectAll("text")  
    .style("text-anchor", "end")
    .style("font-size", "11px")
    .attr("dx", "-.8em")
    .attr("dy", ".15em")
    .attr("transform", function(d) {
        return "rotate(-65)"});
 

// appending y axis
 d3.select(".lineDetail").append("g")
    .attr("class", "y axis lineDetail")
    .attr({"transform": "translate(" + (margin.left*2) + "," + (margin.top) + ")",})
    .call(yAxis)
  .append("text")
    .attr("class", "lineDetail")
    .attr("transform", "rotate(-90)")
    .attr("y", -150)
    .attr("x", -150)
    .attr("dy", ".71em")
    .style("text-anchor", "End")
    .text("Percentages");


/* WRANGLING */

  var browsers = browser_array2.map(function(name) { //console.log(name);
    return {
      name: name,
      values: lineList.map(function(d) { 
        return {date: d.year, usage: +d[name], browser_name: name};
      })
    };
  });


var line = d3.svg.line()
    .interpolate("linear")
    .x(function(d) { return xScale(d.date); })
    .y(function(d) { return yScale(d.usage); });

  var browser =  d3.select(".lineDetail").selectAll(".browser")
      .data(browsers)
       .enter().append("g")
      .attr("class", "browser")
      .attr({"transform": "translate(" + (margin.left*2) + "," + (margin.top) + ")",});

  browser.append("path")
      .attr("browser", "line")
      .attr("d", function(d) { return line(d.values); })
      .style("fill", "none")
      .style("stroke", function(d) { return colorDict[d.name]; });
 
for (var y =0 ; y <7; y++)
{
      var points =  d3.select(".lineDetail").selectAll(".point")
        .data(browsers[y].values)
      .enter().append("svg:circle")
         .attr("stroke", colorDict[browsers[y].name])
         .attr("fill", colorDict[browsers[y].name])
         .attr("cx", function(d, i) { return xScale(d.date) })
         .attr("cy", function(d, i) { return yScale(d.usage) })
         .attr("r", function(d, i) { return 4 })
         .attr({"transform": "translate(" + (margin.left*2) + "," + (margin.top) + ")",})
         .on("mouseover", function(d){ console.log(d); tooltip.style("visibility", "visible"); tooltip.html("<strong>" + d.usage + "%</strong>");})
         .on("mousemove", function(){return tooltip.style("top", (event.pageY-20)+"px").style("left",(event.pageX+20)+"px");})
         .on("mouseout", function(){return tooltip.style("visibility", "hidden");})
         .on("click", function (d) {console.log(d.date)

          tooltipSearch.html("<iframe id='lineSearch' width='600' height='475' src='http://www.bing.com/search?q=" + lineDisplayOption + "+" + d.date + "+" + d.browser_name + "+web+browser' style='-webkit-transform:scale(0.75);  -ms-transform: scale(0.75); transform: scale(0.90); -moz-transform-scale(0.75);''></iframe>");
        });
      
}


 d3.select(".lineDetail")
 .append("text")
 .html(lineDisplayOption + " Data")
 .attr({"transform": "translate(" + (margin.left*8) + "," + (margin.top) + ")",});

}




var updateVis = function(year_selected, year_title)

{

d3.selectAll(".country").remove();
d3.selectAll("form").remove();
d3.selectAll(".thedetail").remove();
d3.selectAll(".thedetails").remove();


var merged_data = sorting_object(percentages(cleaning_and_aggregation(merge_data(world, year_selected))));

if (selected_country != undefined)
{
  selected_country = _.object(merged_data[country_name]);
  if (bar_check)
  {
    make_bars(selected_country, country_name, world_data);
  }
  if (pie_check)
  {
    make_piechart(selected_country, country_name);
  }
}


var tooltip3 = d3.select("body")
    .append("div")
    .style("position", "absolute")
    .style("z-index", "1")
    .style("visibility", "visible")
    .style("color", "black")
    .style("font-size", "15px")
    .style("top", "64px")
    .style("left", "65px")
    .style("height", "0px")
    .attr("class", "tooltip3");

    if (year_title == "<Select a date>")
    {
      tooltip3.html("<h2 class='thedetails city_name'>" + "Select a date!" + "</h2>").attr("class", "thedetails");
    }
    else
    {
    tooltip3.html("<h2 class='thedetails city_name'>" + year_title + "</h2>").attr("class", "thedetails");
    }

var country_paths = svg.selectAll("path")
    .data(world.features.filter(function(d) {return d.id != -99; }))
    .enter()
    .append("path")
    .attr("d", path)
    .attr("class", "country")
    .style("fill", function(d) {return colorMap(d, merged_data);})
    .on("mouseover", function(d){country_name = d["properties"]["name"];
      selected_country = _.object(merged_data[country_name]);
      world_data = _.object(merged_data["World"]);
      if (bar_check)
      {
        make_bars(selected_country, country_name, world_data);
      }
      if (pie_check)
      {
          make_piechart(selected_country, country_name);
      } 
    })
    .on("click", function(d){ zooming(d);});
      
    data_list = []

    for (x in cities)
    {
      data_list.push({city : x, latitude : cities[x].latitude, longitude : cities[x].longitude});
    }

    browser_array = ["None", "Other", "Mobile", "Safari", "Opera", "IE", "Firefox", "Chrome"]
    ext_color_domain = [];

    for (i in browser_array)
    {
     ext_color_domain.push(colorDict[browser_array[i]]);
    }


  var legend = svg.selectAll("g.legend")
  .data(ext_color_domain)
  .enter().append("g")
  .attr("class", "legend");

  legend.append("rect")
  .attr("x", 20)
  .attr("y", function(d, i){ return (height - (i*ls_h) - 2*ls_h) - 110;})
  .attr("width", ls_w)
  .attr("height", ls_h)
  .style("fill", function(d, i) { return ext_color_domain[i]; })

  legend.append("text")
  .attr("x", 50)
  .attr("y", function(d, i){ return (height - (i*ls_h) - ls_h - 4) - 110;})
  .text(function(d, i){ return browser_array[i]; });



var all_keys = []

for (i in merged_data)
{
  all_keys.push(i);
}


all_keys.unshift("<Select a country>")

  var countryDrop = d3.select("#table_container1")
    .data(all_keys)
    .append("form")
    .attr("class", "dropdown")
    .append("select")
    .attr("class", "dropdown")
    .on("change", function() {
      country_name = this.options[this.selectedIndex].value;

      selected_country = _.object(merged_data[country_name]);
      if (bar_check)
      {
        make_bars(selected_country, country_name, world_data);
      }
      if (pie_check)
      {
      make_piechart(selected_country, country_name);
      }

    });



var countryOpts = countryDrop.selectAll("option")
    .data(all_keys)
    .enter()
    .append("option")
      .text(function (d) { return d; })
      .attr("value", function (d) { return d; });

  var countryDrop = d3.select("#table_container2")
    .data(color_display)
    .append("form")
    .append("select")
    .on("change", function() {
      color_option = this.options[this.selectedIndex].value;
      color_option_val = color_option + " N";

      country_paths.style("fill", function(d) {
          console.log(merged_data[d["properties"]["name"]][color_option]);

          return colorMap(d, merged_data);

        });

    });


var countryOpts2 = countryDrop.selectAll("option")
    .data(color_display)
    .enter()
    .append("option")
      .text(function (d) { return d; })
      .attr("value", function (d) { return d; });

}

var yeararrayOptions = yeararray.slice(0);

yeararrayOptions.unshift("<Select a date>");

console.log(yeararrayOptions);

  var yearDrop = d3.select("#table_container3")
    .data(yeararrayOptions)
    .append("form2")
    .append("select")
    .on("change", function() {
      year_selected_text = this.options[this.selectedIndex].value;

      var color_option = "Most Popular";
      var color_option_val = "Most Popular N"
      updateVis(yearDict[year_selected_text], year_selected_text)   
        });
    


var yearOpts2 = yearDrop.selectAll("option")
    .data(yeararrayOptions)
    .enter()
    .append("option")
      .text(function (d) { return d; })
      .attr("value", function (d) { return d; });

d3.selectAll("dropdown").remove()
}


d3.select("#BarButton").on("click", function() {
  bar_check = true;
  pie_check = false;
  make_bars(selected_country, country_name, world_data);
});

d3.select("#PieButton").on("click", function() {
      pie_check = true;
      bar_check = false;
      make_piechart(selected_country, country_name);
});

d3.select("#LineButton").on("click", function() {createLineGraph(country_name);});


d3.select("#lebutton2").on("click", function() {

 if (running == false) { 

 running = true; 

setTimeout(function() { updateVis(year_selected, "January 2010"); }, 100);
setTimeout(function() { updateVis(usage13, "January 2011"); }, 500);
setTimeout(function() { updateVis(usage25, "January 2012"); }, 900);
setTimeout(function() { updateVis(usage37, "January 2013"); }, 1300);
setTimeout(function() { updateVis(usage49, "January 2014"); }, 1700);
setTimeout(function() { running = false; }, 1700);



}

});



d3.select("#lebutton").on("click", function() {

if (running == false) {  

   running = true; 

setTimeout(function() { updateVis(usage1, "January 2010"); }, 100);
setTimeout(function() { updateVis(usage6, "June 2010"); }, 500);
setTimeout(function() { updateVis(usage13, "January 2011"); }, 1000);
setTimeout(function() { updateVis(usage18, "June 2011"); }, 1500);
setTimeout(function() { updateVis(usage25, "January 2012"); }, 2000);
setTimeout(function() { updateVis(usage30, "June 2012"); }, 2500);
setTimeout(function() { updateVis(usage37, "January 2013"); }, 3000);
setTimeout(function() { updateVis(usage42, "June 2013"); }, 3500);
setTimeout(function() { updateVis(usage49, "January 2014"); }, 4000);
setTimeout(function() { running = false; }, 4000);

}

});



d3.select("#lebutton3").on("click", function() {

  if (running == false) {  

   running = true; 


setTimeout(function() { updateVis(usage1, "January 2010"); }, 100);
setTimeout(function() { updateVis(usage2, "February 2010"); }, 500);
setTimeout(function() { updateVis(usage3, "March 2010"); }, 1000);
setTimeout(function() { updateVis(usage4, "April 2010"); }, 1500);
setTimeout(function() { updateVis(usage5, "May 2010"); }, 2000);
setTimeout(function() { updateVis(usage6, "June 2010"); }, 2500);
setTimeout(function() { updateVis(usage7, "July 2010"); }, 3000);
setTimeout(function() { updateVis(usage8, "August 2010"); }, 3500);
setTimeout(function() { updateVis(usage9, "September 2010"); }, 4000);
setTimeout(function() { updateVis(usage10, "October 2010"); }, 4500);
setTimeout(function() { updateVis(usage1, "November 2010"); }, 5000);
setTimeout(function() { updateVis(usage12, "December 2010"); }, 5500);
setTimeout(function() { updateVis(usage13, "January 2011"); }, 6000);
setTimeout(function() { updateVis(usage14, "February 2011"); }, 6500);
setTimeout(function() { updateVis(usage15, "March 2011"); }, 7000);
setTimeout(function() { updateVis(usage16, "April 2011"); }, 7500);
setTimeout(function() { updateVis(usage17, "May 2011"); }, 8000);
setTimeout(function() { updateVis(usage18, "June 2011"); }, 8500);
setTimeout(function() { updateVis(usage19, "July 2011"); }, 9000);
setTimeout(function() { updateVis(usage20, "August 2011"); }, 9500);
setTimeout(function() { updateVis(usage21, "September 2011"); }, 10000);
setTimeout(function() { updateVis(usage22, "October 2011"); }, 10500);
setTimeout(function() { updateVis(usage23, "November 2011"); }, 11000);
setTimeout(function() { updateVis(usage24, "December 2011"); }, 11500);
setTimeout(function() { updateVis(usage25, "January 2012"); }, 12000);
setTimeout(function() { updateVis(usage26, "February 2012"); }, 12500);
setTimeout(function() { updateVis(usage27, "March 2012"); }, 13000);
setTimeout(function() { updateVis(usage28, "April 2012"); }, 13500);
setTimeout(function() { updateVis(usage29, "May 2012"); }, 14000);
setTimeout(function() { updateVis(usage30, "June 2012"); }, 14500);
setTimeout(function() { updateVis(usage31, "July 2012"); }, 15000);
setTimeout(function() { updateVis(usage32, "August 2012"); }, 15500);
setTimeout(function() { updateVis(usage33, "September 2012"); }, 16000);
setTimeout(function() { updateVis(usage34, "October 2012"); }, 16500);
setTimeout(function() { updateVis(usage35, "November 2012"); }, 17000);
setTimeout(function() { updateVis(usage36, "December 2012"); }, 17500);
setTimeout(function() { updateVis(usage37, "January 2013"); }, 18000);
setTimeout(function() { updateVis(usage38, "February 2013"); }, 18500);
setTimeout(function() { updateVis(usage39, "March 2013"); }, 19000);
setTimeout(function() { updateVis(usage40, "April 2013"); }, 19500);
setTimeout(function() { updateVis(usage41, "May 2013"); }, 20000);
setTimeout(function() { updateVis(usage42, "June 2013"); }, 20500);
setTimeout(function() { updateVis(usage43, "July 2013"); }, 21000);
setTimeout(function() { updateVis(usage44, "August 2013"); }, 21500);
setTimeout(function() { updateVis(usage45, "September 2013"); }, 22000);
setTimeout(function() { updateVis(usage46, "October 2013"); }, 22500);
setTimeout(function() { updateVis(usage47, "November 2013"); }, 23000);
setTimeout(function() { updateVis(usage48, "December 2013"); }, 23500);
setTimeout(function() { updateVis(usage49, "January 2014"); }, 24000);
setTimeout(function() { updateVis(usage50, "February 2014"); }, 24500);
setTimeout(function() { updateVis(usage51, "March 2014"); }, 25000);
setTimeout(function() { updateVis(usage52, "April 2014"); }, 25500);
setTimeout(function() { updateVis(usage53, "May 2014"); }, 26000);
setTimeout(function() { running = false; }, 26000);

}

});

d3.select("#lebutton4").on("click", function() {

    if (running == false) {  

   running = true; 


setTimeout(function() { updateVis(usage1, "January 2010"); }, 100);
setTimeout(function() { updateVis(usage2, "February 2010"); }, 300);
setTimeout(function() { updateVis(usage3, "March 2010"); }, 500);
setTimeout(function() { updateVis(usage4, "April 2010"); }, 700);
setTimeout(function() { updateVis(usage5, "May 2010"); }, 900);
setTimeout(function() { updateVis(usage6, "June 2010"); }, 1100);
setTimeout(function() { updateVis(usage7, "July 2010"); }, 1300);
setTimeout(function() { updateVis(usage8, "August 2010"); }, 1500);
setTimeout(function() { updateVis(usage9, "September 2010"); }, 1700);
setTimeout(function() { updateVis(usage10, "October 2010"); }, 1900);
setTimeout(function() { updateVis(usage1, "November 2010"); }, 2100);
setTimeout(function() { updateVis(usage12, "December 2010"); }, 2300);
setTimeout(function() { updateVis(usage13, "January 2011"); }, 2500);
setTimeout(function() { updateVis(usage14, "February 2011"); }, 2700);
setTimeout(function() { updateVis(usage15, "March 2011"); }, 2900);
setTimeout(function() { updateVis(usage16, "April 2011"); }, 3100);
setTimeout(function() { updateVis(usage17, "May 2011"); }, 3300);
setTimeout(function() { updateVis(usage18, "June 2011"); }, 3500);
setTimeout(function() { updateVis(usage19, "July 2011"); }, 3700);
setTimeout(function() { updateVis(usage20, "August 2011"); }, 3900);
setTimeout(function() { updateVis(usage21, "September 2011"); }, 4100);
setTimeout(function() { updateVis(usage22, "October 2011"); }, 4300);
setTimeout(function() { updateVis(usage23, "November 2011"); }, 4500);
setTimeout(function() { updateVis(usage24, "December 2011"); }, 4700);
setTimeout(function() { updateVis(usage25, "January 2012"); }, 4900);
setTimeout(function() { updateVis(usage26, "February 2012"); }, 5100);
setTimeout(function() { updateVis(usage27, "March 2012"); }, 5300);
setTimeout(function() { updateVis(usage28, "April 2012"); }, 5500);
setTimeout(function() { updateVis(usage29, "May 2012"); }, 5700);
setTimeout(function() { updateVis(usage30, "June 2012"); }, 5900);
setTimeout(function() { updateVis(usage31, "July 2012"); }, 6100);
setTimeout(function() { updateVis(usage32, "August 2012"); }, 6300);
setTimeout(function() { updateVis(usage33, "September 2012"); }, 6500);
setTimeout(function() { updateVis(usage34, "October 2012"); }, 6700);
setTimeout(function() { updateVis(usage35, "November 2012"); }, 6900);
setTimeout(function() { updateVis(usage36, "December 2012"); }, 7100);
setTimeout(function() { updateVis(usage37, "January 2013"); }, 7300);
setTimeout(function() { updateVis(usage38, "February 2013"); }, 7500);
setTimeout(function() { updateVis(usage39, "March 2013"); }, 7700);
setTimeout(function() { updateVis(usage40, "April 2013"); }, 7900);
setTimeout(function() { updateVis(usage41, "May 2013"); }, 8100);
setTimeout(function() { updateVis(usage42, "June 2013"); }, 8300);
setTimeout(function() { updateVis(usage43, "July 2013"); }, 8500);
setTimeout(function() { updateVis(usage44, "August 2013"); }, 8700);
setTimeout(function() { updateVis(usage45, "September 2013"); }, 8900);
setTimeout(function() { updateVis(usage46, "October 2013"); }, 9100);
setTimeout(function() { updateVis(usage47, "November 2013"); }, 9300);
setTimeout(function() { updateVis(usage48, "December 2013"); }, 9500);
setTimeout(function() { updateVis(usage49, "January 2014"); }, 9700);
setTimeout(function() { updateVis(usage50, "February 2014"); }, 9900);
setTimeout(function() { updateVis(usage51, "March 2014"); }, 10100);
setTimeout(function() { updateVis(usage52, "April 2014"); }, 10300);
setTimeout(function() { updateVis(usage53, "May 2014"); }, 10500);
setTimeout(function() { running = false; }, 10500);

}

});

updateVis(year_selected, year_selected_text);

}



queue()
    .defer(d3.json,"../data/world_data.json")
    .defer(d3.json, "../CityInfo/cities.json")
    .defer(d3.csv, "../data/Jan2010.csv")
    .defer(d3.csv, "../data/Feb2010.csv")
    .defer(d3.csv, "../data/Mar2010.csv")
    .defer(d3.csv, "../data/April2010.csv")
    .defer(d3.csv, "../data/May2010.csv")
    .defer(d3.csv, "../data/June2010.csv")
    .defer(d3.csv, "../data/July2010.csv")
    .defer(d3.csv, "../data/Aug2010.csv")
    .defer(d3.csv, "../data/Sept2010.csv")
    .defer(d3.csv, "../data/Oct2010.csv")
    .defer(d3.csv, "../data/Nov2010.csv")
    .defer(d3.csv, "../data/Dec2010.csv")
    .defer(d3.csv, "../data/Jan2011.csv")
    .defer(d3.csv, "../data/Feb2011.csv")
    .defer(d3.csv, "../data/Mar2011.csv")
    .defer(d3.csv, "../data/April2011.csv")
    .defer(d3.csv, "../data/May2011.csv")
    .defer(d3.csv, "../data/June2011.csv")
    .defer(d3.csv, "../data/July2011.csv")
    .defer(d3.csv, "../data/Aug2011.csv")
    .defer(d3.csv, "../data/Sept2011.csv")
    .defer(d3.csv, "../data/Oct2011.csv")
    .defer(d3.csv, "../data/Nov2011.csv")
    .defer(d3.csv, "../data/Dec2011.csv")
    .defer(d3.csv, "../data/Jan2012.csv")
    .defer(d3.csv, "../data/Feb2012.csv")
    .defer(d3.csv, "../data/Mar2012.csv")
    .defer(d3.csv, "../data/April2012.csv")
    .defer(d3.csv, "../data/May2012.csv")
    .defer(d3.csv, "../data/June2012.csv")
    .defer(d3.csv, "../data/July2012.csv")
    .defer(d3.csv, "../data/Aug2012.csv")
    .defer(d3.csv, "../data/Sept2012.csv")
    .defer(d3.csv, "../data/Oct2012.csv")
    .defer(d3.csv, "../data/Nov2012.csv")
    .defer(d3.csv, "../data/Dec2012.csv")
    .defer(d3.csv, "../data/Jan2013.csv")
    .defer(d3.csv, "../data/Feb2013.csv")
    .defer(d3.csv, "../data/Mar2013.csv")
    .defer(d3.csv, "../data/April2013.csv")
    .defer(d3.csv, "../data/May2013.csv")
    .defer(d3.csv, "../data/June2013.csv")
    .defer(d3.csv, "../data/July2013.csv")
    .defer(d3.csv, "../data/Aug2013.csv")
    .defer(d3.csv, "../data/Sept2013.csv")
    .defer(d3.csv, "../data/Oct2013.csv")
    .defer(d3.csv, "../data/Nov2013.csv")
    .defer(d3.csv, "../data/Dec2013.csv")
    .defer(d3.csv, "../data/Jan2014.csv")
    .defer(d3.csv, "../data/Feb2014.csv")
    .defer(d3.csv, "../data/Mar2014.csv")
    .defer(d3.csv, "../data/April2014.csv")
    .defer(d3.csv, "../data/May2014.csv")
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
    x = width / 2 ;
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

function zooming2(d) {
  var x, y, k;

  if (d && centered !== d) {
    var centroid = path.centroid(d);
    x = centroid[0];
    y = centroid[1];
    k = 4;
    centered = d;
  } else {
    x = width / 2 ;
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
