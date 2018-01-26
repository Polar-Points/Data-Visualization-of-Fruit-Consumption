// Final Project ScatterPlot
// Quyen Ha and Marty Dang

//////////////////////////////////////////////////////////////////////
// Create a namespace to hold global variables

// Width and Height of SVG drawing area
var Width = 700;
var Height = 500;

//Padding around the edges, to make room for axes
var Padding = 65;

var regression; //regression line equation

//for menus, the choice for each one
var yearType = ""; 
var fruitType = "sum_oapplee";

//////////////////////////////////////////////////////////////////////
// functions start here
//////////////////////////////////////////////////////////////////////

d3.csv("2011Scatter.csv", function(error, data) {
  dataset = data;         // store data in namespace variable

  // error checking
  if (error) {
    console.log(error)
  }
  else {
    console.log(dataset)
    createScatterPlot(dataset)
  }
});

function createScatterPlot(dataset) {

    // nesting the data for color scale 
    var familiesByID = d3.nest()
            .key(function(d) { return d.income; })
            .entries(dataset);
    
    // arrange the control and legends for aesthetics reasons
    arrange();
    
    // create the svg context
    makeTitle(); 

    // create the svg context
    var svg = makeSVGScatter();
    
    // create the x, y, and color scales 
    var xScale = makeXScale(dataset);
    var yScale = makeYScale(dataset);
    var colorScale = makeColorScale(familiesByID);    
    
    // create the y and x axis 
    var xAxis = makeXAxis(xScale, svg);
    var yAxis = makeYAxis(yScale, svg); 

    //draw the scatterplot
    makeTotalScatterPlot(svg, xScale, yScale, dataset, colorScale);
    
    makeMenu(svg, dataset, yScale, xScale, colorScale, yAxis);
    
    // calculate the slope and y-intercept of the regression line
    var lg = calcLinear(dataset);

    // draw the regression line
    drawLine(svg, xScale, yScale, lg);

} //end of Create Scatter Plot

// arrange the buttons and legends for aesthetic reasons
function arrange () {

    // repositioning the buttons for aesthetic reasons
    var controls = document.getElementById("controls");
    controls.style.position = "absolute";
    controls.style.left = Width*1.15 + "px";
    controls.style.top = 50 + "px";

    // repositioning the legends for aesthetic reasons
    var legend = document.getElementById("legend");
    legend.style.position = "absolute";
    legend.style.left = Width*1.15 + "px";
    legend.style.top = 185 + "px";

    // repositioning the legends for aesthetic reasons
    var info = document.getElementById("info");
    info.style.position = "absolute";
    info.style.top = 625 + "px";

} // end arrange

// put a title at the top, which will be a different SVG element
function makeTitle () {
   
    // make the svg context 
    var headingSVG = d3.select("#title")
	    .append("svg")
	    .attr("width", Width)
	    .attr("height", 30);
    
    // add text title to svg element 
    headingSVG.append("g")
	.append("text")
	.attr("class", "heading")
	.attr("text-anchor", "middle")
	.attr("x", Width /1.8)
	.attr("y", 25)
	.attr("font-family", "sans-serif")
	.attr("font-size", "16px")
	.attr("font-weight", "bold")
	.attr("font-size", "16px")
	.text("Yearly Fruit Expenditure with Regression Line");

} //end makeTitle

// create the svg context for the graph
function makeSVGScatter () {

    var svg = d3.select("body")
	    .append("svg") 
	    .attr("width", Width)
	    .attr("height", Height);

    return svg;
    
} // end makeSVGScatter

// make the x scale
function makeXScale (dataset) { 

    var xScale = d3.scaleLinear()
	    .domain([
		//d3.min(dataset, function(d) { return parseInt(d.income); }),
		0,
		d3.max(dataset, function(d) { return parseInt(d.income); })
	    ])
	    .range([Padding, Width - Padding * 1]);
    
    return xScale;

} //end makeXScale

// make the y scale
function makeYScale (dataset) { 

    var yScale = d3.scaleLinear()
	    .domain([
		d3.min(dataset, function(d) { return +d[fruitType]; }),
    		d3.max(dataset, function(d) { return +d[fruitType]; })
	    ])
	    .range([Height - Padding, Padding]);
    
    return yScale;

} // end makeYScale

// make the colorScale
function makeColorScale (familiesByID) {

    // make the color scale
    var colorScale = d3.scaleOrdinal(d3.schemeCategory20c)
            .domain(familiesByID.map(function(c) { return c.income; }));
    
    return colorScale;

} // end makeColorScale

// make the xAxis
function makeXAxis (xScale, svg) { 
    
    // create the xAxis generator
    var xAxis = d3.axisBottom(xScale);   
    
    // draw the xAxis 
    svg.append("g") 
        .attr("class", "x axis")
        .attr("transform", "translate(0," + (Height - Padding/1.95) + ")")
        .call(xAxis);

    // create labels for xAxis
    svg.append("g")
	.append("text")
	.attr("class", "x label")
	.attr("text-anchor", "middle")
	.attr("transform", "translate(" + (Width/ 1.75- 25)  + "," + 
	      (Height - Padding/60) + ")")
	.attr("font-family", "Georgia")
	.attr("font-size", "13px")
	.attr("font-weight", "bold")
	.text("Codified Income Brackets");

    return xAxis;
    
} // end makeXAxis

// make the yAxis
function makeYAxis(yScale, svg) { 

    // create the yAxis generator
    var yAxis = d3.axisLeft(yScale);

    // draw the yAxis
    svg.append("g") 
        .attr("class", "y axis")
        .attr("transform", "translate(" + Padding + ",0)")
        .call(yAxis);
    
    // create label for yAxiss
    svg.append("g")
	.append("text")
	.attr("class", "y label")
	.attr("text-anchor", "middle")
	.attr("transform", "translate(15," + (Height/2) + ")" +
	      "rotate(-90)")
	.attr("font-family", "Georgia")
	.attr("font-size", "13px")
	.attr("font-weight", "bold")
	.text("Total Expenditure in $"); 
    
    return yAxis; 

} // end makeYAXis

// make the scatterplot
function makeTotalScatterPlot(svg, xScale, yScale, dataset, colorScale){ 
    
    //make the circles
    svg.selectAll("circle")
        .data(dataset)
        .enter()
        .append("circle")
        .attr('stroke', 'black')
        .attr("cx", function(d) {
            return xScale(d.income);
        })
        .attr("cy", function(d) {
            return yScale(+d[fruitType]);
        })
        .attr("r", function(d) {
        	return (1.5*d.hhsize);
        })
        .style("fill", function(d) { return colorScale(d.income); })
        .append("title")
	.text(function(d) {
	    return "Household Size: " + d.hhsize + "\n" + 
		"Income: " + d.income + "\n" +
		"Fruit Consumption: " + "$"+ (+d[fruitType]).toFixed(2);
	})
	.on("mouseover", function(d) {
	    d3.select(this).attr("r", 3.5*d.hhsize).style("opacity", "0.6");
	})                  
	.on("mouseout", function(d) {
	    d3.select(this).attr("r", 1.5*d.hhsize).style("opacity", "0.6");
	});         
}

// make the menu so I can choose which year 
function makeMenu(svg, dataset, yScale, xScale, colorScale, yAxis){
  
    //change fruit being displayed
    d3.select("#ySelect").on("change", function () {
	    fruitType = this.value;      // set the menu 
	updateFruitAxis(svg, dataset, colorScale, yScale, xScale, yAxis);
    })

    //change year being displayed
    d3.select("#xSelect").on("change", function () {
        yearType = this.value;      // set the menu 
    updateYear(svg, yearType, xScale, yScale); 
    });

    
}

//update the year being displayed
function updateYear(svg, yearType, xScale, yScale){

    d3.selectAll("svg").remove();

    if(yearType == "dataset2011"){
        d3.csv("2011Scatter.csv", function(error, data) {
            dataset = data;         // store data in namespace variable

            // error checking
            if (error) {
                console.log(error)
            }
            else {
                console.log(dataset)
                createScatterPlot(dataset)
            }
        });
    }

    if(yearType == "dataset2012"){
        d3.csv("2012Scatter.csv", function(error, data) {
            dataset = data;         // store data in namespace variable

            // error checking
            if (error) {
                console.log(error)
            }
            else {
                console.log(dataset)
                createScatterPlot(dataset)
            }
        });
    }

    if(yearType == "dataset2013"){
        d3.csv("2013Scatter.csv", function(error, data) {
            dataset = data;         // store data in namespace variable

            // error checking
            if (error) {
                console.log(error)
            }
            else {
                console.log(dataset)
                createScatterPlot(dataset)
            }
        });
    }

    // recalculate the slope and y-intercept of the regression line
    var lg = calcLinear(dataset);

    // redraw the regression line
    drawLine(svg, xScale, yScale, lg);

} //end of updateYear

// function to update when a new expenditure is selected
function updateFruitAxis(svg, dataset, colorScale, yScale, xScale, yAxis){

    // calculate the slope and y-intercept of the regression line
    var lg = calcLinear(dataset);

    // draw the regression line
    drawLine(svg, xScale, yScale, lg);
    
    // update the yScale
    yScale.domain([
		d3.min(dataset, function(d) { return +d[fruitType]; }),
    		d3.max(dataset, function(d) { return +d[fruitType]; })
    ]);

    // update the circles
    svg.selectAll("circle")  
        .data(dataset)
        .transition()
        .duration(50)
        .attr("cy", function(d) {
            return yScale(+d[fruitType]);
        });

    // update the circles' titles
    svg.selectAll("circle.title")
	.append("title")
	.text(function(d) {
	    return "Household Size: " + d.hhsize + "\n" + 
		"Income: " + d.income + "\n" +
		"Fruit Consumption: " + "$"+ (+d[fruitType]).toFixed(2);
	});
        
    // update Y axis label 
    svg.select(".y.label")
	.text("Total Expenditure in $");
    
    // update Y axis
    svg.select(".y.axis")
        .transition()
        .duration(100)
        .call(yAxis);

} // end updateFruitAxis

//REGRESSION LINE
//https://bl.ocks.org/HarryStevens/be559bed98d662f69e68fc8a7e0ad097

// Calculate a linear regression from the data

// Takes 5 parameters:
    // (1) Your data
    // (2) The column of data plotted on your x-axis
    // (3) The column of data plotted on your y-axis
    // (4) The minimum value of your x-axis
    // (5) The minimum value of your y-axis

// function to calculate the slope and y-intercept of the regression line
function calcLinear(dataset) {

    var minX = 0; // min value of x axis
    var minY = 0; // min value of y axis
    var x = [];   // array of income
    var y = [];   // array of fruit 
    
    // push the income and expenditure into, respectively, x and y arrays
    dataset.forEach(function(d) {
        x.push(parseInt(d.income));
        y.push(+d[fruitType]);
    });

    //get the min values of x and y 
    minX = d3.min(dataset, function(d) { return parseInt(d.income); });
    maxX = d3.max(dataset, function(d) { return parseInt(d.income); });
    minY = d3.min(dataset, function(d) { return +d[fruitType]; });

    /////////
    //SLOPE//
    /////////

    // Let n = the number of data points
    var n = dataset.length;

    // create an array of points
    var pts = []; 

    // each point is an object of three keys
    // mult, which is calculated by multiplying x and y
    // x and y keys, which correspond to x and y values (income and expenditure)

    for (i = 0; i < y.length; i++) {
        var obj = {};
        obj.x = x[i],
        obj.y = y[i],
        obj.mult = obj.x * obj.y; 
        pts.push(obj)
    }

    // sum is the summation of all x-values multiplied by corresponding y-values
    var sum = 0;

    // xSum is the sum of all x-values 
    var xSum = 0;

    // ySum is the sum of all y-values
    var ySum = 0;

    // sumSq is the squared sum of all x-values
    var sumSq = 0;

    // calculate sum, xSum, ySum, sumSq
    pts.forEach(function(pt){
    	sum = sum + pt.mult;
        xSum = xSum + pt.x;
        ySum = ySum + pt.y;
        sumSq = sumSq + (pt.x * pt.x);
    });

    // Let a = n times the summation of all x-values multiplied by their corresponding y-values
    //calculated hand value = 20,933,352,056.31
    var a = sum * n;

    // Let t = the sum of all x-values times the sum of all y-values
    //calculated hand value = 18994647445
    var b = xSum * ySum;

    // Let c = n times the sum of all squared x-values
    //calculated hand value = 1338503709312
    var c = sumSq * n;

    // Let d = the squared sum of all x-values
    //caclculated hand value = 1233961062244
    var d = xSum * xSum;

    // The slope of the regression line is calculated as m = (a - b) / (c - d) 
    //hand calculated value = 0.01856376
    var m = (a - b) / (c - d);

    /////////////
    //INTERCEPT//
    /////////////

    // Let e equal the sum of all y-values
    //calculated hand value = 17099.38573
    var e = ySum;

    // Let f equal the slope times the sum of all x-values
    //calculatd hand value 20621.33003
    var f = m * xSum;

    // The regression line y-intercept is calculated as b = (e - f) / n
    //calculated hand value -0.0643312748
    var b = (e - f) / n;

    console.log( "y = " + m + "x + " + b);
    console.log("x = ( y - " + b + " ) / " + m);

    //calculate the last point for the y coordinate
    lastPoint = (m*maxX) + b

    // Returns an object with two points, 
    // where each point is an object with an x and y coordinate
      return {
          
          //These points are calculated by plugging 0 and 27
          //in for x using the y=mx+b formula
          ptA: { x:0, y: b},
          ptB:  { x: maxX, y: lastPoint  },
          Equ: {mValue: m, bValue: b}

      };

} // end calcLinear

// draw the regression line
function drawLine(svg, xScale, yScale, lg){

	//remove any old line first 
	d3.select("line.regression").remove();

	//Then add a line to it
    svg.append("line")
        .attr("class", "regression")
        // x_position of the first point is minX 
        .attr("x1", xScale(lg.ptA.x))
        // y_position of the first point is slope * minX + y-intercept
        .attr("y1", yScale(lg.ptA.y))
        // x_position of the second point is (minY - y-intercept) / slope
        .attr("x2", xScale(lg.ptB.x))
        // y_position of the second point is (minY)
        .attr("y2", yScale(lg.ptB.y))
        .append("title")
        .text(function(d) {
        return("y = " + lg.Equ.mValue + "x + " + lg.Equ.bValue+ "\n" + 
            "x = ( y - " + lg.Equ.bValue + " ) / " + lg.Equ.mValue);
    })

}