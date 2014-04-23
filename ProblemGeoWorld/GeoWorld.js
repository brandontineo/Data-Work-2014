var margin = {
    top: 50,
    right: 50,
    bottom: 50,
    left: 50
};

var width = 960 - margin.left - margin.right;
var height = 700 - margin.bottom - margin.top;



var bbVis = {
    x: 100,
    y: 10,
    w: width - 100,
    h: 300
};

var dataSet = {};

var svg = d3.select("#vis").append("svg").attr({
    width: width + margin.left + margin.right,
    height: height + margin.top + margin.bottom
}).append("g").attr({
        transform: "translate(" + margin.left + "," + margin.top + ")"
    });

// --- this is just for fun.. play arround with it iof you like :)
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
// --- this is just for fun.. play arround with it iof you like :)


var actualProjectionMethod = 0;
var colorMin = colorbrewer.Greens[3][0];
var colorMax = colorbrewer.Greens[3][2];

var newCountries = [];


var path = d3.geo.path().projection(projectionMethods[0].method);

/*

var color = d3.scale.quantize()
                    .range(["rgb(237,248,233)", "rgb(186,228,179)",
                     "rgb(116,196,118)", "rgb(49,163,84)","rgb(0,109,44)"]);

                    */

var color_domain = [50, 150, 350, 750, 1500];

var color = d3.scale.quantize().range(colorbrewer.Greens[9]).domain(color_domain);



var updateVis = function (data) {
    var newDataCountry = {};
    var arrays = [];
    for (i in data){
        arrays.push(data[i]["value"]);
   // console.log(data[i]);


            //Grab country name
            var dataCountry = data[i]["country"]["id"];
        //    console.log(dataCountry);

             for (j in newCountries) {
             //   console.log(j);
               if(newCountries[j] == dataCountry){
                    newDataCountry["key"]=  j;
                    newDataCountry["value"] = data[i]["value"];
               }
            }


};


       
 color.domain([
                d3.min(data, function(d) { return parseFloat(d["value"]); }),
                d3.max(data, function(d) { return parseFloat(d["value"]); })  ]);
 

    svg.selectAll("path")
    .data(data)
   // .attr("class", function(d) { return color(rate.get(d["value"])); });
        .style("fill", function(d) {
        //    console.log(d);
            if(d["value"]){
                 var dataCountry = d["country"]["id"]
                     for (j in newCountries) {
                       if(newCountries[j] == dataCountry){
                          var value = d["value"];
                          console.log(value);
                         return color(value);
                        }
                    }
                }

           else {
                    return "#ccc";
 
            }

    });

    
};




var initVis = function(error, indicators, world, countries){



var country_name;
var country_value;

 var tooltip = d3.select("body")
          .append("div")
          .style("position", "absolute")
          .style("z-index", "10")
          .style("visibility", "hidden")
          .style("color", "black")
          .style("font-size", "15px")
          .attr("class", "tooltip")
    


     svg.selectAll("path")
        .data(world.features.filter(function(d) { return d.id != -99; }))
        .enter()
        .append("path")
        .attr("d", path)
        .attr("class", "country");
       /* .on("mouseover", function(d){ console.log(d); tooltip.style("visibility", "visible");

                    tooltip.text("You're currently mousing over " + d["country"]["value"] + " and it has an ID of " + d["country"]["id"] + 
                        ". You are currently looking at the indicator for " + d["indicator"]["value"]+ " which has an ID of " +
                        d["indicator"]["id"] + ". The shading for this country was determined using the value " + d["value"] +
                        " because you selected the year " + d["date"] + "!"


                        );

            })
                .on("mousemove", function(){return tooltip.style("top", (event.pageY-20)+"px").style("left",(event.pageX+20)+"px"); country_name = "hello";})
                .on("mouseout", function(){return tooltip.style("visibility", "hidden");});
        

*/

    var ind;
    var year;
 
 var indDrop = d3.select("#table_container")
    .append("select")
    .on("change", function() {
      ind = this.options[this.selectedIndex].value;
      //console.log(ind);
    });


var indicatorOpts = indDrop.selectAll("option")
    .data(indicators)
    .enter()
    .append("option")
      .text(function (d) { return d.IndicatorName; })
      .attr("value", function (d) { return d.IndicatorCode; });


counter = 1963;
counter_end = 2013;
years_array  = [];

for (var i=0; i<=49; i++)
{
    counter++;
    years_array.push(counter);
}



  var yearDrop = d3.select("#table_container2")
    .append("select")
    .on("change", function() { 
      year = this.options[this.selectedIndex].value;
    //  console.log(year);
    });


var yearOpts = yearDrop.selectAll("option")
    .data(years_array)
    .enter()
    .append("option")
      .text(function (d) { return d; })
      .attr("value", function (d) { return d; });

       countries.map(function(d) {
    newCountries[d["Alpha-3 code"]] = d["Alpha-2 code"];
  });

      // console.log(newCountries);



function runAQueryOn(ind,year) {
   // console.log(ind);
   // console.log(year);

   console.log(ind);
   console.log(year);

    $.ajax({

        url: "http://api.worldbank.org/countries/all/indicators/" + ind + "?format=jsonP&prefix=Getdata&per_page=500&date=" + (year),
        jsonpCallback:'getdata',
        dataType:'jsonp',
        success: function (data, status){
         //  console.log(data);
           updateVis(data[1]);
        }

    });

//updateVis();

}

var dind = "SP.DYN.CDRT.IN";
var dyear = 2000;

runAQueryOn(dind, dyear);


var showButton = d3.select("body")
    .append("button")
    .text("Select All")
    .on("click",function() {runAQueryOn(ind,year); });

}

// end of invit vis



var legend_labels = ["Very Low", "Low", "Medium Low", "Medium", "High", "Really High"]
var ext_color_domain = [0, 50, 150, 350, 750, 1500]

  var legend = svg.selectAll("g.legend")
  .data(ext_color_domain)
  .enter().append("g")
  .attr("class", "legend");

  var ls_w = 20, ls_h = 20;

  legend.append("rect")
  .attr("x", 20)
  .attr("y", function(d, i){ return height - (i*ls_h) - 2*ls_h;})
  .attr("width", ls_w)
  .attr("height", ls_h)
  .style("fill", function(d, i) { return color(d); })
  .style("opacity", 0.8);

  legend.append("text")
  .attr("x", 50)
  .attr("y", function(d, i){ return height - (i*ls_h) - ls_h - 4;})
  .text(function(d, i){ return legend_labels[i]; });




queue()
    .defer(d3.csv,"../data/worldBank_indicators.csv")
    .defer(d3.json,"../data/world_data.json")
    .defer(d3.json,"../data/WorldBankCountries.json")
    .await(initVis);
 
