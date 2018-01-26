//////////////////////////////////////////////////////////////////////////////////
// global variables
//   "constant gobal variables put on top, useful for updating
//   set the margin of the SVG
var Margin = {top: 20, right: 80, bottom: 60, left: 50};
var Width = 860 - Margin.left - Margin.right;
var Height = 500 - Margin.top - Margin.bottom;
//////////////////////////////////////////////////////////////////////////////////
// functions start here

function initialize(data) {

    // format the data
    data.forEach(function(d) {
	d.cumExp = +parseFloat(d.cumoexpmkt);
	d.cumInc = + parseFloat(d.cumincmkt);
	d.mktName = d.mktname;
    });

    // nesting the data by market name (mktName)
    var nestedExpInc = d3.nest()
	    .key(function(d) { return d.mktName; })
	    .entries(data);

    // create the title
    var svgTitle = makeTitle ();

    // make the svg
    var svgLine = makeLineSVG (); 

    // make the scales
    var xScale = makexScale (nestedExpInc);
    var yScale = makeyScale (nestedExpInc);
    var colorScale = makeColorScale (nestedExpInc);

    // draw the expenditure/income line
    drawLines (svgLine, nestedExpInc, xScale, yScale, colorScale);

    // draw the x and y axes
    var xAxis = makexAxis (svgLine, xScale);
    var yAxis = makeyAxis (svgLine, yScale);

    // make the drop down menu
    makeMenu (svgLine, nestedExpInc, xScale, yScale, colorScale, xAxis, yAxis);

    // create the home buttom to return to original graph
    returnHome (svgLine, nestedExpInc, xScale, yScale, colorScale, xAxis, yAxis);

    // move things around for aesthetics purposes
    aesthetics ();

} // end initialize

// put a title at the bottom. this is a distinct SVG element
function makeTitle () {

    // title is a separate SVG element
    var headingsvg = d3.select("body")
            .append("svg")
	    .attr("id", "svgTitle")
            .attr("width", Width)
            // height for the heading is 30 pixels
            .attr("height", 30);
    
    // add text title to the svg element
    headingsvg.append("g")
	.append("text")
	.attr("class", "heading")
	.attr("text-anchor", "middle")
	.attr("font-family", "sans-serif")
	.attr("x", Width/2)
	.attr("y", 20)
	.attr("font-size", "16px")
	.attr("font-weight", "bold")
	.text("Graph of Market Income Share and Market Expenditure of Organic Fruit Share");
    
} // end makeTitle

// make svg context
function makeLineSVG () { 
    
    // add svg element
    var svgLine = d3.select("body")
	    .attr("id", "svgLine")
            .append("svg")
            .style("width", Width + Margin.left + Margin.right + "px")
            .style("height", Height + Margin.top + Margin.bottom + "px")
            .attr("width", Width + Margin.left + Margin.right)
            .attr("height", Height + Margin.top + Margin.bottom)
            .append("g")
            .attr("transform","translate(" + Margin.left + "," + Margin.top + ")");

    return svgLine;

} // end makeLineSVG

// make the xScale
function makexScale (nestedExpInc) {

    // make the x scale
    var xScale = d3.scaleLinear()
	    .domain([
		d3.min(nestedExpInc, function(c) {
		    return d3.min(c.values, function(d) { return d.cumInc; });
		}),
		d3.max(nestedExpInc, function(c) { 
		    return d3.max(c.values, function(d) { return d.cumInc; });
		})
	    ])
	    .range([0, Width]);

    return xScale;

} // end makexScale

// make the yScale
function makeyScale (nestedExpInc) {

    // make the y scale
    var yScale = d3.scaleLinear()
	    .domain([
		d3.min(nestedExpInc, function(c) {
		    return d3.min(c.values, function(d) { return d.cumExp; });
		}),
		d3.max(nestedExpInc, function(c) { 
		    return d3.max(c.values, function(d) { return d.cumExp; });
		})
	    ])
	    .range([Height, 0]);

    return yScale;

} // end makeyScale

// make the colorScale
function makeColorScale (nestedExpInc) {

    // make the color scale
    var colorScale = d3.scaleOrdinal(d3.schemeCategory20c)
            .domain(nestedExpInc.map(function(c) { return c.id; }));

    return colorScale;

} // end the colorScale

// draw the lines 
function drawLines (svgLine, nestedExpInc, xScale, yScale, colorScale) {

    // create variable originalLines to hold the lines 
    var originalLines = svgLine.selectAll(".originalLines")
            .data(nestedExpInc)
            .enter()
            .append("g")
            .attr("class", "originalLines");

    // define the line generator
    var closeLine = d3.line()
            .x(function(d) { return xScale(d.cumInc); })
            .y(function(d) { return yScale(+d.cumExp); })
	    .curve(d3.curveBasis);

    // draw the lines
    originalLines.append("path")
	.attr("class", "line")
	.attr("d", function(d) {
	    return closeLine(d.values);
	})
	.style("stroke", function(d) { return colorScale(d.key); })
	.on("mouseover", function(d) { 
	    d3.select(this).style("stroke-width", "5px");
	})
	.on("mouseout", function(d, i) {
	    d3.select(this).style("stroke-width", "1.5px");
	});

} // end drawLines

// draw the x Axis
function makexAxis (svgLine, xScale) {

    // make the axis generator
    var xAxis = d3.axisBottom(xScale)
        .ticks(14);

    // add xAxis to svgLine
    svgLine.append("g")
	.attr("class", "x axis")
	.attr("transform", "translate(0, " + Height + ")")
	.call(xAxis);

    // add label to yAxis
    svgLine.append("text")
	.attr("class", "x label")
	.attr("x", Width + 75)
	.attr("y", Height)
	.style("text-anchor", "end")
	.style("font", "11px sans-serif")
	.text("Market Income");

    return xAxis;

}// end makexAxis

// draw the y Axis
function makeyAxis (svgLine, yScale) { 

    // make the axis generator
    var yAxis = d3.axisLeft(yScale)
        .ticks(14);

    // add yAxis to svgLine
    svgLine.append("g")
	.attr("class", "y axis")
	.call(yAxis);
    
    // add label to yAxis
    svgLine.append("text")
	.attr("class", "y label")
	.attr("transform", "rotate(-90)")
	.attr("x", -95)
	.attr("y", 6)
	.attr("dy", "0.71em")
	.attr("fill", "#000")
	.style("font", "11px sans-serif")
	.text("Market Expenditure");

    return yAxis;

} // end makeyAxis

// add the menu option
function makeMenu (svgLine, nestedExpInc, xScale, yScale, colorScale, xAxis, yAxis) {

    // select the menu from the HTML
    var marketMenu = d3.select("#marketDropDown");

    // create the drop down menu with options for stock names
    marketMenu.selectAll("optgroup")
	.data(nestedExpInc)
	.enter()
	.append("option")
	.attr("value", function (d) {
	    return d.key;
	})
	.text(function (d) {
	    return d.key;
	});

    // run update function when drop down selection changes
    d3.select("#market").on("change", function () { 

	// find which market was selected from the drop down menu
	var selectedMarket = d3.select(this)
		.property("value");

	// remove multiseries lines after a stock is selected from menu
	d3.selectAll(".originalLines")
	    .remove();

	// remove last selected lines if a different stock is selected from menu
	d3.selectAll(".newLines")
	    .remove();

	// remove the mouseover effect of the previously selected line
	d3.selectAll(".mouse-over-effects")
	    .remove();

	// run the update function
	updateGraph(selectedMarket, nestedExpInc, svgLine, 
		        xScale, yScale, colorScale, xAxis, yAxis);

    });

} // end makeMenu

// update the original graph with the new 45-degree line graph for the selected market
function updateGraph(selectedMarket, nestedExpInc, svgLine, 
		        xScale, yScale, colorScale, xAxis, yAxis) {

    // filter the data to include only the market of interest
    var filteredMarket = nestedExpInc.filter(
	function(d) {
	        return d.key === selectedMarket;
	    });

    // recaliberating the xScale with the new market income
    xScale.domain([
	d3.min(filteredMarket, function(c) {
	    return d3.min(c.values, function(d) { return d.cumInc; });
	}),
	d3.max(filteredMarket, function(c) { 
	    return d3.max(c.values, function(d) { return d.cumInc; });
	})
    ]);

    // recaliberating the yScale with the new market expenditure
    yScale.domain([
	d3.min(filteredMarket, function(c) {
	    return d3.min(c.values, function(d) { return d.cumExp; });
	}),
	d3.max(filteredMarket, function(c) { 
	    return d3.max(c.values, function(d) { return d.cumExp; });
	})
    ]);

    // draw the new expenditure/income line with the updated scale
    updateLines(filteredMarket, svgLine, xScale, yScale, colorScale);

    // update the xAxis
    svgLine.select(".x.axis")
	.transition()
	.duration(800)
	.call(xAxis);

    // update the yAxis
    svgLine.select(".y.axis")
	.transition()
	.duration(800)
	.call(yAxis);

    // create the hovering effect that traces the closing price
    hoverEffect (filteredMarket, svgLine, xScale, yScale, colorScale);

} // end updateGraph

// redraw the income/expenditure line after rescaling x and yScales
function updateLines(filteredMarket, svgLine, xScale, yScale, colorScale) {

    // create variable newLines to hold the new lines and points
    var newLines = svgLine.selectAll(".newLines")
            .data(filteredMarket)
            .enter()
            .append("g")
            .attr("class", "newLines");

    // define the line generator for the income and expenditure line
    var newLine = d3.line()
            .x(function(d) { return xScale(d.cumInc); })
            .y(function(d) { return yScale(+d.cumExp); })
    	    .curve(d3.curveBasis);

    // draw the line for income and expenditure line
    newLines.append("path")
	.attr("class", "line")
	.attr("d", function(d) { return newLine(d.values); })
	.style("stroke", function(d) { return colorScale(d.key); });;
    
    // draw the 45 degree line
    svgLine.append("line")
	.attr("class", "45Degree")
	.style("stroke-width", "1px")
	.style("stroke", "red")
	.attr("x1", xScale(0))
	.attr("y1", yScale(0))
	.attr("x2", xScale(1))
	.attr("y2", yScale(1));

} // end updateLines

// create mouseover effects for high and low values of stocks
function hoverEffect (filteredMarket, svgLine, xScale, yScale, colorScale)  {

    // read all element of class "line" into variable lines
    var lines = document.getElementsByClassName('line');
    
    // create the variable that will hold the entire mouseover effect
    var mouseG = svgLine.append("g")
            .attr("class", "mouse-over-effects");

    // create the black vertical line to follow mouse
    mouseG.append("path")
	.attr("class", "mouse-line")
	.style("stroke", "black")
	.style("stroke-width", "1px")
	.style("opacity", "0");

    // create the variable that will hold the circle and text 
    var mousePerLine = mouseG.selectAll(".mouse-per-line")
            .data(filteredMarket)
            .enter()
            .append("g")
            .attr("class", "mouse-per-line");

    // draw the circle that follows the lines
    mousePerLine.append("circle")
	.attr("r", 4.5);

    // add the text next to the circle that tells the circle's y_coordinate 
    // which is already scaled 
    mousePerLine.append("text")
	.attr("transform", "translate(10, 3)");

    // append a rect to catch mouse movements on canvas
    // since cannot catch mouse events on paths
    mouseG.append("rect")
	.attr("width", Width)
	.attr("height", Height)
	.attr("fill", "none")
	.attr("pointer-events", "all")
    
        // when mouse is not in the rect, all effects are turned off
	.on("mouseout", function () { 
	    // make line invisible
	    d3.select(".mouse-line")
		.style("opacity", "0");
	    // make circle invisible
            d3.selectAll(".mouse-per-line circle")
		.style("opacity", "0");
	    // make text invisible
            d3.selectAll(".mouse-per-line text")
		.style("opacity", "0");
	})

        // when mouse is in the rect, the effects are turned on
	.on("mouseover", function () {
	    // make line appear
	    d3.select(".mouse-line")
		.style("opacity", "1");
	    // make circle appear
            d3.selectAll(".mouse-per-line circle")
		.style("opacity", "1");
	    // make text appear
            d3.selectAll(".mouse-per-line text")
		.style("opacity", "1");
	})

        // when mousemove, creates the mouseover effect that records movement on path
	.on("mousemove", function () { 
	    
	    // pass on the mouse's position to variable mouse
	    var mouse = d3.mouse(this);

	    // function creates the mouseover effect
	    followMouse (filteredMarket, mouse, lines, xScale, yScale); 
	});

} // end hoverEffect

function followMouse (filteredMarket, mouse, lines, xScale, yScale) {

    // draw the black line that follows the mouse using mouse's position
    d3.select(".mouse-line")
	.attr("d", function () { 
	    var d = "M" + mouse[0] + "," + Height;
	    d += " " + mouse[0] + "," + 0;
	    return d;
	}); 

    d3.selectAll(".mouse-per-line")
        .attr("transform", function(d) {  

	    // set beginning to 0 and end to the length of the line
	    var beginning = 0;
	    var end = lines[0].getTotalLength();

	    var target = null;

	    // add a new date into the d.date array by scaling mouse's xposition
	    var xDate = xScale.invert(mouse[0]);
	    // find the index of the new date using d3.bisector
	    var bisect = d3.bisector(function(d) { return d.date; }).right;
	    // approximate new d.values using xDate
	    var idx = bisect(d.values, xDate);
	    
	    // when mouse is still within svg
	    while (true) {
		    target = Math.floor((beginning + end) / 2);
		    // compute a point from position on svg path
		    var pos = lines[0].getPointAtLength(target);
		    // if xposition of mouse is not the same as xposition of 
		    // point on svg path, or target equals end, or target
		    // equals beginning, break
		    if ((target === end || target === beginning) && 
			pos.x !== mouse[0]) {
			break;
			    }
		    // if xposition of mouse is smaller than xposition of point
		    // on svg path, set end to target
		    if (pos.x > mouse[0]) {
			end = target;
			    }
		    // if xposition of mouse larger than xposition of point on 
		    // svg path, set beginning to target
		    else if (pos.x < mouse[0]) {
			beginning = target; }
		    // else, position found
		    else {
			break; 
			    }
		}
	    
	    // add text next to circle
	    // value is y-coordinate accounted for yScale
	    d3.select(this).select('text')
	        .text(yScale.invert(pos.y).toFixed(2));
	    
	    // transform the position of mouse-per-line to follow mouse
	    return "translate(" + mouse[0] + "," + pos.y +")"; 
	});
}


// return to original multiseries graph when Home button is selected 
function returnHome (svgLine, nestedExpInc,
		          xScale, yScale, colorScale, xAxis, yAxis) { 

    // when button "Home" is selected
    d3.select("#returnHome")
	.on("click", function() {
	    
	    // remove all the old exp/inc line when home button is selected
	    d3.selectAll(".newLines")
		.remove();

	    // remove the hover effect when home button is selected
	    d3.selectAll(".mouse-over-effects")
		.remove();

	    // recaliberating the xScale with the new market income
	    xScale.domain([
		d3.min(nestedExpInc, function(c) {
		    return d3.min(c.values, function(d) { return d.cumInc; });
		}),
		d3.max(nestedExpInc, function(c) { 
		    return d3.max(c.values, function(d) { return d.cumInc; });
		})
	    ]);

	    // recaliberating the yScale with the new market expenditure
	    yScale.domain([
		d3.min(nestedExpInc, function(c) {
		    return d3.min(c.values, function(d) { return d.cumExp; });
		}),
		d3.max(nestedExpInc, function(c) { 
		    return d3.max(c.values, function(d) { return d.cumExp; });
		})
	    ]);

	    
	    // redrawing the lines
	    drawLines (svgLine, nestedExpInc, xScale, yScale, colorScale);
	    
	    // update the xAxis
	    svgLine.select(".x.axis")
		.transition()
		.duration(800)
		.call(xAxis);

	    // update the yAxis
	    svgLine.select(".y.axis")
		.transition()
		.duration(800)
		.call(yAxis);
	});

} // end returnHome

// moving things around for aesthetics reason
function aesthetics () {

    var controlHolder = document.getElementById("controls");
    controlHolder.style.position = "absolute";
    controlHolder.style.left = 900 + "px";
    
    var title = document.getElementById("svgTitle");
    title.style.position = "absolute";
    title.style.left = 35 + "px";
    title.style.top = 70 + "px";

} // end aesthetics

//////////////////////////////////////////////////////////////////////
// read the data file and set up the visualization 
d3.csv("Modified45Degree.csv", function(error, data) {
    // if error log to console
    if (error) { 
	console.log(error);
    } else {
	// call the initialize function
	initialize(data);
    }
});
