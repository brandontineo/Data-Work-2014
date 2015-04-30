$( document ).ready(function() {


  $(".borA").addClass("hideIt");
  $(".borB").addClass("hideIt");
  $(".borC").addClass("hideIt");
  $(".borD").addClass("hideIt");
  $(".borE").addClass("hideIt");

var dict = {

"Borrower Name" : "Individual or institution receiving funds in the form of a loan and obligated to repay the loan, usually with interest.", 
"Mortgage Interest" : "The amount charged, expressed as a percentage of principal, by a lender to a borrower for the use of assets",
"Original Principal Balance Amount" : "Original loan amount",
"Current Principal Amount": "Outstanding loan amount",
"Mortgage Term" : "Period over which a loan agreement is in force, and before or at the end of which the loan should either be repaid or renegotiated for another term.",
"Mortgage Origination Date": "The date that the mortgage was orginated",
"Mortgage Payoff Date" :"The date that the mortgage needs to be fully paid."
}

var titles = ["Borrower Name", "Mortgage Interest", "Original Principal Balance Amount", "Current Principal Amount", "Mortgage Term", "Mortgage Origination Date", "Mortgage Payoff Date"];


//tooltip 
var tooltip = d3.select("body")
  .append("div")
  .style("position", "absolute")
  .style("z-index", "9999")
  .style("visibility", "hidden")
  .style("color", "black")
  .style("font-size", "15px")
  .attr("class", "tooltip2");


d3.selectAll(".correct > th")
  .data(titles)
  .on("mouseover", function (d, i){ tooltip.style("visibility", "visible"); tooltip.html("<strong>Definition</strong>: " + dict[d])})
  .on("mousemove", function(){return tooltip.style("top", (d3.event.pageY+30)+"px").style("left",(d3.event.pageX-180)+"px");})
  .on("mouseout", function(){ return tooltip.style("visibility", "hidden");});


d3.selectAll(".correctSeg > th")
  .data(titles)
  .on("mouseover", function (d, i){ tooltip.style("visibility", "visible"); tooltip.html(dict[d])})
  .on("mousemove", function(){return tooltip.style("top", (d3.event.pageY+30)+"px").style("left",(d3.event.pageX-180)+"px");})
  .on("mouseout", function(){ return tooltip.style("visibility", "hidden");});

});



var width_p = 200,
    height_p = 300,
    radius = 100; //Math.min(width, height) / 2;

var generateTable =function(number){

  if (number === 15){

  $(".borA").addClass("hideIt");
  $(".borB").addClass("hideIt");
  $(".borC").removeClass("hideIt");
  $(".borD").removeClass("hideIt");
  $(".borE").addClass("hideIt");

  $(".segmentTitle").text("Segmented Data - 15 Year Mortgage Term")


  }
  else if (number === 30){

  $(".borA").removeClass("hideIt");
  $(".borB").removeClass("hideIt");
  $(".borC").addClass("hideIt");
  $(".borD").addClass("hideIt");
  $(".borE").addClass("hideIt");

    $(".segmentTitle").text("Segmented Data - 30 Year Mortgage Term")


  }
  else{

  $(".borA").addClass("hideIt");
  $(".borB").addClass("hideIt");
  $(".borC").addClass("hideIt");
  $(".borD").addClass("hideIt");
  $(".borE").removeClass("hideIt");

    $(".segmentTitle").text("Segmented Data - 5 Year Mortgage Term")


  }


}


var color = d3.scale.ordinal()
    .range(["steelblue", "red", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

var arc = d3.svg.arc()
    .outerRadius(radius - 10)
    .innerRadius(0);

var pie = d3.layout.pie()
    .sort(null)
    .value(function(d) { return d.count; });

var svg = d3.select("#pieVis")
  .append("g")
    .attr("transform", "translate(" + width_p / 2 + "," + height_p / 2 + ")");


d3.csv("pie_data.csv", function(error, data) {


  data.forEach(function(d) {
    d.count = +d.count;
  });


  var g = svg.selectAll(".arc")
      .data(pie(data))
    .enter().append("g")
      .attr("class", "arc")
      .attr("class", function(d, i){
        return d.data.mortgage_term;
      });


  g.append("path")
      .attr("d", arc)
      .attr("class", function(d,i){ return "path"+i})
     .style("fill", function(d) { return color(d.data.mortgage_term); });

  g.append("text")
      .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
      .attr("dy", ".35em")
      .style("text-anchor", "middle")
      .text(function(d) { return d.data.mortgage_term; });


var tip_pie = d3.tip()
  .attr('class', 'd3-tip')
  .offset([-5, 0])
  .html(function(d,i) {
    if (i == 1){
      return "<strong>Term:</strong> <span style='color:red'>" + d.data.mortgage_term + "</span><br><strong>Count: </strong><span style='color:red'>" + d.data.count + "</span><br><strong>Borrowers: </strong>: <span style='color:red'>C, D</span>";
    }
    else if (i == 2){
      return "<strong>Term:</strong> <span style='color:red'>" + d.data.mortgage_term + "</span><br><strong>Count: </strong> <span style='color:red'>" + d.data.count + "</span><br><strong>Borrowers: </strong>: <span style='color:red'>A, B</span>"
    }
    else{
      return "<strong>Term:</strong> <span style='color:red'>" + d.data.mortgage_term + "</span><br><strong>Count: </strong> <span style='color:red'>" + d.data.count + "</span><br><strong>Borrowers: </strong>: <span style='color:red'>E</span>"

    }
  })
svg.call(tip_pie)

d3.selectAll(".years")
      .on('mouseover', tip_pie.show)
      .on('mouseout',  tip_pie.hide)


d3.selectAll(".path1")
      .on('mouseover',  function(d,i){
        d3.selectAll(".path0").attr('fill-opacity', 0.2);
        d3.selectAll(".path2").attr('fill-opacity', 0.2);

      })
      .on('mouseout',  function(d,i){
        d3.selectAll(".path0").attr('fill-opacity', 1);
        d3.selectAll(".path2").attr('fill-opacity', 1);

      })

d3.selectAll(".path0")
      .on('mouseover',  function(d,i){
        d3.selectAll(".path1").attr('fill-opacity', 0.2);
        d3.selectAll(".path2").attr('fill-opacity', 0.2);

      })
      .on('mouseout',  function(d,i){
        d3.selectAll(".path1").attr('fill-opacity', 1);
        d3.selectAll(".path2").attr('fill-opacity', 1);
      })

d3.selectAll(".path2")
      .on('mouseover',  function(d,i){
        d3.selectAll(".path1").attr('fill-opacity', 0.2);
        d3.selectAll(".path0").attr('fill-opacity', 0.2);

      })
      .on('mouseout',  function(d,i){
        d3.selectAll(".path1").attr('fill-opacity', 1);
        d3.selectAll(".path0").attr('fill-opacity', 1);
      })



$( ".15" ).click(function() {
  generateTable(15);
});


$( ".30" ).click(function() {
  generateTable(30);
});


$( ".5" ).click(function() {
  generateTable(5);
});

});



// BAR CHART

var margin = {top: 40, right: 20, bottom: 30, left: 40},
    width_bar = 650 - margin.left - margin.right,
    height_bar = 330 - margin.top - margin.bottom;

var formatPercent = d3.format(".0%");

var x_bar = d3.scale.ordinal()
    .rangeRoundBands([0, width_bar], .1);

var y_bar = d3.scale.linear()
    .range([height_bar, 0]);

var xAxis_bar = d3.svg.axis()
    .scale(x_bar)
    .orient("bottom");

var yAxis_bar = d3.svg.axis()
    .scale(y_bar)
    .orient("left")
    .tickFormat(formatPercent);

var tip = d3.tip()
  .attr('class', 'd3-tip')
  .offset([-10, 0])
  .html(function(d) {
    return "<strong>Interest:</strong> <span style='color:red'>" + Math.round(d.frequency * 100 * 100) / 100 + " %</span>";
  })

var svg2 = d3.select("#barVis")
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

svg2.call(tip);

d3.csv("interest.csv", type, function(error, data) {
  x_bar.domain(data.map(function(d) { return d.letter; }));
  y_bar.domain([0, d3.max(data, function(d) { return d.frequency; })]);

  svg2.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(10," + height_bar + ")")
      .call(xAxis_bar);

  svg2.append("g")
      .attr("transform", "translate(" + 20 + ",0)")      
      .attr("class", "y axis")
      .call(yAxis_bar)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 2)
      .attr("x", -60)
      .attr("dy", "-3.5em")
      .style("text-anchor", "end")
      .text("Interest Rate");

  svg2.selectAll(".bar")
      .data(data)
    .enter().append("rect")
      .attr("transform", "translate(" + 10 + ",0)")      
      .attr("class", "bar")
      .attr("x", function(d) { return x_bar(d.letter); })
      .attr("width", x_bar.rangeBand())
      .attr("y", function(d) { return y_bar(d.frequency); })
      .attr("height", function(d) { return height_bar - y_bar(d.frequency); })
      .on('mouseover', tip.show)
      .on('mouseout', tip.hide)

d3.selectAll(".bar").on("click", function(d,i){


  if (i == 0 || i == 2){
    $(".borA").removeClass("hideIt");
    $(".borB").addClass("hideIt");
    $(".borC").removeClass("hideIt");
    $(".borD").addClass("hideIt");
    $(".borE").addClass("hideIt");
    $(".segmentTitle").text("Segmented Data - 4% Interest Rate")

  }
  if (i == 1){
  
    $(".borA").addClass("hideIt");
    $(".borB").removeClass("hideIt");
    $(".borC").addClass("hideIt");
    $(".borD").addClass("hideIt");
    $(".borE").addClass("hideIt");  
    $(".segmentTitle").text("Segmented Data - 10% Interest Rate")

  }   
  if (i == 3){

    $(".borA").addClass("hideIt");
    $(".borB").addClass("hideIt");
    $(".borC").addClass("hideIt");
    $(".borD").removeClass("hideIt");
    $(".borE").addClass("hideIt");
    $(".segmentTitle").text("Segmented Data - 5% Interest Rate")

    
  }  
  if (i ==4){

  $(".borA").addClass("hideIt");
  $(".borB").addClass("hideIt");
  $(".borC").addClass("hideIt");
  $(".borD").addClass("hideIt");
  $(".borE").removeClass("hideIt");
  $(".segmentTitle").text("Segmented Data - 3.5% Interest Rate")

    
  }




})

});

function type(d) {
  d.frequency = +d.frequency;
  return d;
}





