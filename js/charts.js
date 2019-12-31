// (function() {


var PCTFORMAT = d3.format(".0%");

var isIE = navigator.userAgent.indexOf("MSIE") !== -1 || navigator.userAgent.indexOf("Trident") !== -1;

window.createGraphic = function(graphicSelector) {
    var graphicEl = d3.select('#graphic');
    var graphicVisEl = graphicEl.select('#chart');
    var graphicProseEl = graphicEl.select('#sections');
    var chartTitle = graphicEl.select(".chartTitle");

    var margin = 20;
    var width = 600,
        height = 550;
    var r = 5;
    // var chartSize = size - margin * 2
    var titleHeight = d3.select(".chartTitle").node().getBoundingClientRect().height;
    var dotsData;

    var xScale = d3.scaleOrdinal()
        .domain(["no", "yes"])
        .range([0.25*width, 0.75*width]);

    var yScale_inc = d3.scaleBand()
        .domain(["Dep+80k", "Dep40k-80k", "Dep<=40k", "Ind+30k", "Ind15k-30k", "Ind<=15k"])
        // .range([50, 150, 250, 350, 450, 550]);
        .rangeRound([margin, height - margin])
        .padding(margin);

    var yScale_race = d3.scaleBand()
        .domain(["American Indian or Alaka Native, Native Hawaiian/other Pacific Islanders, or more than one race", "Asian", "Black or African American", "Hispanic or Latino", "White"])
        .rangeRound([margin, height - margin])
        .padding(margin);

    var yScale_loan = d3.scaleBand()
        .domain(["loans", "no loans"])
        .rangeRound([margin, height - margin])
        .padding(margin);

    var scrollDirection;

    // actions to take on each step of our scroll-driven story
    var steps = [
        allDotsCentered,            // step 0
        spreadOut100Dots,           // step 1
        splitCurrentFreeCollege,    // step 2
        function step3() {          // step 3
            (scrollDirection === "up") && splitCurrentFreeCollege();
        },
        splitCurrentByIncome,       // step 4
        function highlightElleAbed() {  // step 5
            highlightPersonas("Elle", "Abed");
        },
        function step6() {          // step 6
            if(scrollDirection === "down") removeHighlighting();
            else splitCurrentByIncome();
        },
        freeCollegeForAll,        // step 7
        freeCollegeBelow400FPL,   // step 8
        function step9() {
            (scrollDirection === "up") && freeCollegeBelow400FPL();
        },    // step 9
        freeCollegeBelow400FPLPublic,      // step 10
        function highlightDevonJustina() { // step 11
            (scrollDirection === "up") && freeCollegeBelow400FPLPublic();
            highlightPersonas("Devon", "Justina");
        },
        splitFreeCollege400FPLPublic,       // step 12
        splitFreeCollege400FPLPublicByRace, // step 13
        function step14() {                 // step 14
            if(scrollDirection === "up") splitFreeCollege400FPLPublicByRace();
            highlightJustina();
        },
        splitFreeCollege400FPLPublic,       // step 15
        function step16() {                 // step 16
            if(scrollDirection === "up") removeHighlighting();
            else splitFreeCollege400FPLPublicByLoan();
        },
        function highlightAnaDenise() {     // step 17
            highlightPersonas("Ana", "Denise");
        },
        function step18() {                 // step 18
            removeHighlighting();
            d3.selectAll(".student").classed("hasStipend", false);
            d3.select(".legendEntry.stipend").classed("invisible", true);
        },
        showStipend,                        // step 19
        function step20() {},               // step 20
        removeHighlighting,                 // step 21
        function highlightStephenSally() {  // step 22
            highlightPersonas("Stephen", "Sally");
        }
    ]

    // update our chart
    function update(step, direction) {
        scrollDirection = direction;
        steps[step].call()
        // console.log(direction);
    }


    function setupCharts() {
        d3.csv("data/final_data.csv", function(d) {
            return {
                char_id: d.char_id,
                race: d.race,
                incomegroup: d.incomegroup,
                loan: d.loan,
                public: d.public,
                freecollege: d.freecollege,
                fpl: d.fpl,
                name: d.name,
                income: +d.income,
                currentFreeCollege: d.currentFreeCollege,
                allFreeCollege: d.allFreeCollege,
                freeCollege400FPL: d.freeCollege400FPL,
                freeCollege400FPLPublic: d.freeCollege400FPLPublic
            };
        }, function(error, data) {
            if (error) throw error;
            // console.log(data);
            dotsData = data;

            var svg = graphicVisEl.append('svg')
                .attr('width', width)
                .attr('height', height)

            var chart = svg.append('g');
                // .attr('transform', 'translate(0,' + margin + ')')

            var item = chart.selectAll('.item')
                .data(data)
                .enter()
                .append('circle')
                .attr("class", function(d) { return d.name !== "NA" ? d.name + " student" : "student"; })
                .attr("cx", width / 2)
                .attr("cy", (height - titleHeight) / 2)
                .attr("r", r);
        });
    }

    // function setupProse() {
    //     var height = window.innerHeight * 0.5
    //     graphicProseEl.selectAll('.step')
    //         .style('height', height + 'px')
    // }

    function allDotsCentered() {
        d3.selectAll(".dotLabel").remove();

        d3.selectAll(".student")
            .transition()
            .attr("cx", width / 2)
            .attr("cy", (height - titleHeight) / 2);
    }

    function spreadOut100Dots() {
        // console.log("spread out 100 dots");
        d3.selectAll(".dotLabel").remove();
        d3.selectAll(".columnLabel").remove();
        // d3.select(".legend").classed("invisible", true);
        removeHighlighting();

        var t = d3.transition()
            .duration(800)
            .ease(d3.easeQuadInOut)

        var simulation = d3.forceSimulation(dotsData)
            .force('charge', d3.forceManyBody().strength(-10))
            .force('center', d3.forceCenter(width / 2, (height - titleHeight)/2))
            .force('x', d3.forceX().x(width / 2))
            .force('y', d3.forceY().y((height - titleHeight) / 2))
            .force('collision', d3.forceCollide().radius(r))
            .stop();
            // .on('tick', ticked);

        // function ticked() {
        //   var dots = d3.selectAll('.student')
        //     .attr('r', r)
        //     .attr('cx', function(d) { return d.x; })
        //     .attr('cy', function(d) { return d.y; })
        // }
        // only update dot positions after simulation has finished running: https://bl.ocks.org/mbostock/1667139
        d3.timeout(function() {
            // See https://github.com/d3/d3-force/blob/master/README.md#simulation_tick
            for (var i = 0, n = Math.ceil(Math.log(simulation.alphaMin()) / Math.log(1 - simulation.alphaDecay())); i < n; ++i) {
                simulation.tick();
            }

            var students = d3.selectAll(".student");

            students
                .transition(t)
                .attr("cx", function(d) { return d.x; })
                .attr("cy", function(d) { return d.y; });

            students.classed("noFreeCollege", false);

            // label number of dots
            var lowestDotY = d3.max(students.data(), function(d) { return d.y; });
            d3.select("svg g").append("text")
                .attr("class", "dotLabel")
                .attr("x", width / 2)
                .attr("y", lowestDotY + 60)
                .text(dotsData.length + " students");
        });
    }

    function splitCurrentFreeCollege() {
        // console.log("split into two groups: those who have free college and those who don't");
        d3.selectAll(".catLabel").remove();
        d3.selectAll(".dividerLine").remove();
        removeHighlighting();

        d3.select(".chartTitle").text("");

        var t = d3.transition()
            .duration(800)
            .ease(d3.easeQuadInOut)

        var simulation = d3.forceSimulation(dotsData)
            .force('charge', d3.forceManyBody().strength(-10))
            .force('x', d3.forceX().x(function(d) { return xScale(d.currentFreeCollege); }).strength(0.15))  // seem to need to add an adjustment factor here
            .force('y', d3.forceY().y((height - titleHeight) / 2).strength(0.15))
            .force('collision', d3.forceCollide().radius(r))
            .stop();

        d3.timeout(function() {
          // See https://github.com/d3/d3-force/blob/master/README.md#simulation_tick
          for (var i = 0, n = Math.ceil(Math.log(simulation.alphaMin()) / Math.log(1 - simulation.alphaDecay())); i < n; ++i) {
            simulation.tick();
          }

            d3.select(".legend").classed("invisible", true);

            var students = d3.selectAll(".student");

            students
                .transition(t)
                .attr("cx", function(d) { return d.x; })
                .attr("cy", function(d) { return d.y; });

            students.classed("noFreeCollege", function(d) { return d.currentFreeCollege === "no" ? true : false; });

            // label "Free College" and "No free college" columns
            var svg = d3.select("svg g");

            svg.append("text")
                .attr("class", "columnLabel")
                .attr("x", xScale("yes"))
                .attr("y", margin)
                .text("Free college");

            svg.append("text")
                .attr("class", "columnLabel")
                .attr("x", xScale("no"))
                .attr("y", margin)
                .text("No free college");

            // update label below dots
            if(d3.selectAll(".dotLabel").nodes().length !== 2) {
                d3.selectAll(".dotLabel").remove();

                var numFreeCollege = students.data().filter(function(d) { return d.currentFreeCollege !== "no"; }).length;
                var numNoFreeCollege = 100 - numFreeCollege;

                var lowestDotY = d3.max(students.data(), function(d) { return d.y; });

                svg.append("text")
                    .attr("class", "dotLabel")
                    .attr("x", xScale("yes"))
                    .attr("y", lowestDotY + 40)
                    .text(numFreeCollege + " students");

                svg.append("text")
                    .attr("class", "dotLabel noFreeCollege")
                    .attr("x", xScale("no"))
                    .attr("y", lowestDotY + 40)
                    .text(numNoFreeCollege + " students");
            }
        });
    }

    function splitCurrentByIncome() {
        // console.log("separate into income groups");
        (d3.selectAll(".dotLabel").nodes().length < 6) && d3.selectAll(".dotLabel").remove();
        removeHighlighting();

        d3.select(".chartTitle").text("Current situation");
        d3.select(".legend").classed("invisible", false);

        var t = d3.transition()
            .duration(800)
            .ease(d3.easeQuadInOut)

        var simulation = d3.forceSimulation(dotsData)
            .force('charge', d3.forceManyBody().strength(-10))
            .force('x', d3.forceX().x(function(d) { return xScale(d.currentFreeCollege); }).strength(0.2))  // seem to need to add an adjustment factor here
            .force('y', d3.forceY().y(function(d) { return yScale_inc(d.incomegroup); }).strength(0.2))
            .force('collision', d3.forceCollide().radius(r))
            .stop();

        d3.timeout(function() {
          // See https://github.com/d3/d3-force/blob/master/README.md#simulation_tick
          for (var i = 0, n = Math.ceil(Math.log(simulation.alphaMin()) / Math.log(1 - simulation.alphaDecay())); i < n; ++i) {
            simulation.tick();
          }

            var students = d3.selectAll(".student");

            students
                .transition(t)
                .attr("cx", function(d) { return d.x; })
                .attr("cy", function(d) { return d.y; });

            students.classed("noFreeCollege", function(d) { return d.currentFreeCollege === "no" ? true : false; });

            // add labels for income groups and divider lines
            var svg = d3.select("svg g");

            svg.selectAll(".catLabel")
                .data(yScale_inc.domain())
                .enter()
                .append("text")
                .attr("class", "catLabel")
                .attr("x", width / 2)
                .attr("y", function(d) { return yScale_inc(d); })
                .text(function(d) { return d; })
                .style("opacity", 1);

            svg.selectAll(".dividerLine")
                .data(yScale_inc.domain().slice(0, 5))
                .enter()
                .append("line")
                .attr("class", "dividerLine")
                .attr("x1", 0)
                .attr("x2", width)
                .attr("y1", function(d) { return yScale_inc(d) + yScale_inc.step()/2; })
                .attr("y2", function(d) { return yScale_inc(d) + yScale_inc.step()/2; })
                .style("opacity", 1);

            // add labels with group totals
            var sums = groupBySums("currentFreeCollege", yScale_inc.domain(), "incomegroup");
            var leftmostDot = d3.min(students.data(), function(d) { return d.x; });
            var rightmostDot = d3.max(students.data(), function(d) { return d.x; });
            // console.log(sums)

            svg.selectAll(".dotLabel")
                .data(sums)
                .enter()
                .append("text")
                .attr("class", function(d) { return d.freecollege === "yes" ? "dotLabel" : "dotLabel noFreeCollege"; })
                .attr("x", function(d) { return d.freecollege === "yes" ? rightmostDot + margin*4.5 : leftmostDot - margin*2; })
                .attr("y", function(d) { return yScale_inc(d.group); })
                .text(function(d) { return d.sum + " students"; })
                .style("text-anchor", "end");
        });
    }

    function highlightPersonas(student1, student2) {
        d3.select(".student." + student1).classed("highlighted1", true);
        d3.select(".student." + student2).classed("highlighted2", true);
    }

    function removeHighlighting() {
        d3.selectAll(".student").classed("highlighted1", false);
        d3.selectAll(".student").classed("highlighted2", false);
    }

   function freeCollegeForAll() {
        d3.select(".chartTitle").text("Free tuition and fees for all");

        var t = d3.transition()
            .duration(800)
            .ease(d3.easeQuadInOut)

        var simulation = d3.forceSimulation(dotsData)
            .force('charge', d3.forceManyBody().strength(-10))
            .force('x', d3.forceX().x(function(d) { return xScale("yes"); }).strength(0.2))  // seem to need to add an adjustment factor here
            .force('y', d3.forceY().y(function(d) { return yScale_inc(d.incomegroup); }).strength(0.2))
            .force('collision', d3.forceCollide().radius(r))
            .stop();

        d3.timeout(function() {
          // See https://github.com/d3/d3-force/blob/master/README.md#simulation_tick
          for (var i = 0, n = Math.ceil(Math.log(simulation.alphaMin()) / Math.log(1 - simulation.alphaDecay())); i < n; ++i) {
            simulation.tick();
          }

            var students = d3.selectAll(".student");

            students
                .transition(t)
                .attr("cx", function(d) { return d.x; })
                .attr("cy", function(d) { return d.y; });

            students.classed("noFreeCollege", function(d) { return d.currentFreeCollege === "no" ? true : false; });

            // add labels for income groups and divider lines
            var svg = d3.select("svg g");

            // add labels with group totals
            var sums = groupBySums("allFreeCollege", yScale_inc.domain(), "incomegroup");
            // var leftmostDot = d3.min(students.data(), function(d) { return d.x; });
            var rightmostDot = d3.max(students.data(), function(d) { return d.x; });
            // console.log(sums)

            var labels = svg.selectAll(".dotLabel")
                .data(sums);

            labels.exit().remove();

            labels.enter()
                .append("text")
                .attr("class", function(d) { return d.freecollege === "yes" ? "dotLabel" : "dotLabel noFreeCollege"; })
                .attr("x", function(d) { return d.freecollege === "yes" ? rightmostDot + margin*4.5 : leftmostDot - margin*2; })
                .attr("y", function(d) { return yScale_inc(d.group); })
                .style("text-anchor", "end");

            labels.text(function(d) { return d.sum + " students"; })
                .style("opacity", function(d) { return d.sum === 0 ? 0 : 1; });
        });
    }

    function freeCollegeBelow400FPL() {
        d3.select(".chartTitle").text("Free tuition and fees for 400% of federal poverty level");

        var t = d3.transition()
            .duration(800)
            .ease(d3.easeQuadInOut)

        var simulation = d3.forceSimulation(dotsData)
            .force('charge', d3.forceManyBody().strength(-10))
            .force('x', d3.forceX().x(function(d) { return xScale(d.freeCollege400FPL); }).strength(0.2))  // seem to need to add an adjustment factor here
            .force('y', d3.forceY().y(function(d) { return yScale_inc(d.incomegroup); }).strength(0.2))
            .force('collision', d3.forceCollide().radius(r))
            .stop();

        d3.timeout(function() {
          // See https://github.com/d3/d3-force/blob/master/README.md#simulation_tick
          for (var i = 0, n = Math.ceil(Math.log(simulation.alphaMin()) / Math.log(1 - simulation.alphaDecay())); i < n; ++i) {
            simulation.tick();
          }

            var students = d3.selectAll(".student");

            students
                .transition(t)
                .attr("cx", function(d) { return d.x; })
                .attr("cy", function(d) { return d.y; });

            students.classed("noFreeCollege", function(d) { return d.currentFreeCollege === "no" ? true : false; });

            // add labels for income groups and divider lines
            var svg = d3.select("svg g");

            // add labels with group totals
            var sums = groupBySums("freeCollege400FPL", yScale_inc.domain(), "incomegroup");
            var leftmostDot = d3.min(students.data(), function(d) { return d.x; });
            var rightmostDot = d3.max(students.data(), function(d) { return d.x; });
            // console.log(sums)

            var labels = svg.selectAll(".dotLabel")
                .data(sums);

            labels.exit().remove();

            labels.enter()
                .append("text")
                .attr("class", function(d) { return d.freecollege === "yes" ? "dotLabel" : "dotLabel noFreeCollege"; })
                .attr("x", function(d) { return d.freecollege === "yes" ? rightmostDot + margin*4.5 : leftmostDot - margin*2; })
                .attr("y", function(d) { return yScale_inc(d.group); })
                .style("text-anchor", "end");

            labels.text(function(d) { return d.sum + " students"; })
                .style("opacity", 1);
        });
    }

    function freeCollegeBelow400FPLPublic() {
        d3.select(".chartTitle").text("Free tuition and fees for 400% of federal poverty level and attending public institutions only");
        removeHighlighting();

        var t = d3.transition()
            .duration(800)
            .ease(d3.easeQuadInOut)

        var simulation = d3.forceSimulation(dotsData)
            .force('charge', d3.forceManyBody().strength(-10))
            .force('x', d3.forceX().x(function(d) { return xScale(d.freeCollege400FPLPublic); }).strength(0.2))  // seem to need to add an adjustment factor here
            .force('y', d3.forceY().y(function(d) { return yScale_inc(d.incomegroup); }).strength(0.2))
            .force('collision', d3.forceCollide().radius(r))
            .stop();

        d3.timeout(function() {
          // See https://github.com/d3/d3-force/blob/master/README.md#simulation_tick
          for (var i = 0, n = Math.ceil(Math.log(simulation.alphaMin()) / Math.log(1 - simulation.alphaDecay())); i < n; ++i) {
            simulation.tick();
          }

            var students = d3.selectAll(".student");

            students
                .transition(t)
                .attr("cx", function(d) { return d.x; })
                .attr("cy", function(d) { return d.y; });

            students.classed("noFreeCollege", function(d) { return d.currentFreeCollege === "no" ? true : false; });

            // add labels for income groups and divider lines
            var svg = d3.select("svg g");

            if(svg.selectAll(".catLabel").nodes().length < 6) {
                svg.selectAll(".catLabel")
                    .data(yScale_inc.domain())
                    .enter()
                    .append("text")
                    .attr("class", "catLabel")
                    .attr("x", width / 2)
                    .attr("y", function(d) { return yScale_inc(d); })
                    .text(function(d) { return d; });
            }

            if(svg.selectAll(".dividerLine").nodes().length < 5) {
                svg.selectAll(".dividerLine")
                    .data(yScale_inc.domain().slice(0, 5))
                    .enter()
                    .append("line")
                    .attr("class", "dividerLine")
                    .attr("x1", 0)
                    .attr("x2", width)
                    .attr("y1", function(d) { return yScale_inc(d) + yScale_inc.step()/2; })
                    .attr("y2", function(d) { return yScale_inc(d) + yScale_inc.step()/2; });
            }

            // add labels with group totals
            var sums = groupBySums("freeCollege400FPLPublic", yScale_inc.domain(), "incomegroup");
            var leftmostDot = d3.min(students.data(), function(d) { return d.x; });
            var rightmostDot = d3.max(students.data(), function(d) { return d.x; });

            if(svg.selectAll(".dotLabel").nodes().length < 12) svg.selectAll(".dotLabel").remove();

            var labels = svg.selectAll(".dotLabel")
                .data(sums);

            labels.exit().remove();

            labels.enter()
                .append("text")
                .attr("class", function(d) { return d.freecollege === "yes" ? "dotLabel" : "dotLabel noFreeCollege"; })
                .attr("x", function(d) { return d.freecollege === "yes" ? rightmostDot + margin*4.5 : leftmostDot - margin*2; })
                .attr("y", function(d) { return yScale_inc(d.group); })
                .style("text-anchor", "end")
                .text(function(d) { return d.sum + " students"; });

            labels.text(function(d) { return d.sum + " students"; })
                .style("opacity", 1);
        });
    }

    // function fadeOut() {
    //     d3.selectAll(".catLabel")
    //         .transition(5000)
    //         .style("opacity", 0);

    //     d3.selectAll(".dividerLine")
    //         .transition(5000)
    //         .style("opacity", 0);

    //     d3.selectAll(".dotLabel")
    //         .transition(5000)
    //         .style("opacity", 0);
    // }

    function splitFreeCollege400FPLPublic() {  // split dots into two groups (free college/no free college) under free college for < 400% FPL and attending public school proposal
        d3.selectAll(".catLabel").remove();
        d3.selectAll(".dividerLine").remove();
        d3.selectAll(".dotLabel").remove();
        removeHighlighting();

        var t = d3.transition()
            .duration(800)
            .ease(d3.easeQuadInOut)

        var simulation = d3.forceSimulation(dotsData)
            .force('charge', d3.forceManyBody().strength(-10))
            .force('x', d3.forceX().x(function(d) { return xScale(d.freeCollege400FPLPublic); }).strength(0.15))  // seem to need to add an adjustment factor here
            .force('y', d3.forceY().y((height - titleHeight) / 2).strength(0.15))
            .force('collision', d3.forceCollide().radius(r))
            .stop();

        d3.timeout(function() {
          // See https://github.com/d3/d3-force/blob/master/README.md#simulation_tick
          for (var i = 0, n = Math.ceil(Math.log(simulation.alphaMin()) / Math.log(1 - simulation.alphaDecay())); i < n; ++i) {
            simulation.tick();
          }

            var students = d3.selectAll(".student");

            students
                .transition(t)
                .attr("cx", function(d) { return d.x; })
                .attr("cy", function(d) { return d.y; });

            students.classed("noFreeCollege", function(d) { return d.currentFreeCollege === "no" ? true : false; });

            // label "Free College" and "No free college" columns
            var svg = d3.select("svg g");

            // update label below dots
            var numFreeCollege = students.data().filter(function(d) { return d.freeCollege400FPLPublic !== "no"; }).length;
            var numNoFreeCollege = 100 - numFreeCollege;

            var lowestDotY = d3.max(students.data(), function(d) { return d.y; });

            svg.append("text")
                .attr("class", "dotLabel")
                .attr("x", xScale("yes"))
                .attr("y", lowestDotY + 40)
                .text(numFreeCollege + " students");

            svg.append("text")
                .attr("class", "dotLabel noFreeCollege")
                .attr("x", xScale("no"))
                .attr("y", lowestDotY + 40)
                .text(numNoFreeCollege + " students");
        });

    }

    function splitFreeCollege400FPLPublicByRace() {
        (d3.selectAll(".dotLabel").nodes().length < 10) && d3.selectAll(".dotLabel").remove();
        removeHighlighting();

        var t = d3.transition()
            .duration(800)
            .ease(d3.easeQuadInOut)

        var simulation = d3.forceSimulation(dotsData)
            .force('charge', d3.forceManyBody().strength(-10))
            .force('x', d3.forceX().x(function(d) { return xScale(d.freeCollege400FPLPublic); }).strength(0.2))  // seem to need to add an adjustment factor here
            .force('y', d3.forceY().y(function(d) { return yScale_race(d.race); }).strength(0.2))
            .force('collision', d3.forceCollide().radius(r))
            .stop();

        d3.timeout(function() {
          // See https://github.com/d3/d3-force/blob/master/README.md#simulation_tick
          for (var i = 0, n = Math.ceil(Math.log(simulation.alphaMin()) / Math.log(1 - simulation.alphaDecay())); i < n; ++i) {
            simulation.tick();
          }

            var students = d3.selectAll(".student");

            students
                .transition(t)
                .attr("cx", function(d) { return d.x; })
                .attr("cy", function(d) { return d.y; });

            students.classed("noFreeCollege", function(d) { return d.currentFreeCollege === "no" ? true : false; });

            // add labels for income groups and divider lines
            var svg = d3.select("svg g");

            svg.selectAll(".catLabel")
                .data(yScale_race.domain())
                .enter()
                .append("text")
                .attr("class", "catLabel")
                .attr("x", width / 2)
                .attr("y", function(d) { return yScale_race(d); })
                .text(function(d) { return d; })
                .style("opacity", 1);

            svg.selectAll(".dividerLine")
                .data(yScale_race.domain().slice(0, 4))
                .enter()
                .append("line")
                .attr("class", "dividerLine")
                .attr("x1", 0)
                .attr("x2", width)
                .attr("y1", function(d) { return yScale_race(d) + yScale_race.step()/2; })
                .attr("y2", function(d) { return yScale_race(d) + yScale_race.step()/2; })
                .style("opacity", 1);

            // add labels with group totals
            var sums = groupBySums("freeCollege400FPLPublic", yScale_race.domain(), "race");
            var leftmostDot = d3.min(students.data(), function(d) { return d.x; });
            var rightmostDot = d3.max(students.data(), function(d) { return d.x; });
            // console.log(sums)

            svg.selectAll(".dotLabel")
                .data(sums)
                .enter()
                .append("text")
                .attr("class", function(d) { return d.freecollege === "yes" ? "dotLabel" : "dotLabel noFreeCollege"; })
                .attr("x", function(d) { return d.freecollege === "yes" ? rightmostDot + margin*4.5 : leftmostDot - margin*2; })
                .attr("y", function(d) { return yScale_race(d.group); })
                .text(function(d) { return d.sum + " students"; })
                .style("text-anchor", "end");
        });
    }

    function highlightJustina() {
        d3.select(".student.Justina").classed("highlighted1", true);
        // show Danielle's tooltip
    }

    function splitFreeCollege400FPLPublicByLoan() {
        (d3.selectAll(".dotLabel").nodes().length < 4) && d3.selectAll(".dotLabel").remove();
        removeHighlighting();

        var t = d3.transition()
            .duration(800)
            .ease(d3.easeQuadInOut)

        var simulation = d3.forceSimulation(dotsData)
            .force('charge', d3.forceManyBody().strength(-10))
            .force('x', d3.forceX().x(function(d) { return xScale(d.freeCollege400FPLPublic); }).strength(0.2))  // seem to need to add an adjustment factor here
            .force('y', d3.forceY().y(function(d) { return yScale_loan(d.loan); }).strength(0.2))
            .force('collision', d3.forceCollide().radius(r))
            .stop();

        d3.timeout(function() {
          // See https://github.com/d3/d3-force/blob/master/README.md#simulation_tick
          for (var i = 0, n = Math.ceil(Math.log(simulation.alphaMin()) / Math.log(1 - simulation.alphaDecay())); i < n; ++i) {
            simulation.tick();
          }

            var students = d3.selectAll(".student");

            students
                .transition(t)
                .attr("cx", function(d) { return d.x; })
                .attr("cy", function(d) { return d.y; });

            students.classed("noFreeCollege", function(d) { return d.currentFreeCollege === "no" ? true : false; });

            // add labels for income groups and divider lines
            var svg = d3.select("svg g");

            svg.selectAll(".catLabel")
                .data(yScale_loan.domain())
                .enter()
                .append("text")
                .attr("class", "catLabel")
                .attr("x", width / 2)
                .attr("y", function(d) { return yScale_loan(d); })
                .text(function(d) { return d; })
                .style("opacity", 1);

            svg.selectAll(".dividerLine")
                .data(yScale_loan.domain().slice(0, 1))
                .enter()
                .append("line")
                .attr("class", "dividerLine")
                .attr("x1", 0)
                .attr("x2", width)
                .attr("y1", function(d) { return yScale_loan(d) + yScale_loan.step()/2; })
                .attr("y2", function(d) { return yScale_loan(d) + yScale_loan.step()/2; })
                .style("opacity", 1);

            // add labels with group totals
            var sums = groupBySums("freeCollege400FPLPublic", yScale_loan.domain(), "loan");
            var leftmostDot = d3.min(students.data(), function(d) { return d.x; });
            var rightmostDot = d3.max(students.data(), function(d) { return d.x; });
            // console.log(sums)

            svg.selectAll(".dotLabel")
                .data(sums)
                .enter()
                .append("text")
                .attr("class", function(d) { return d.freecollege === "yes" ? "dotLabel" : "dotLabel noFreeCollege"; })
                .attr("x", function(d) { return d.freecollege === "yes" ? rightmostDot + margin*4.5 : leftmostDot - margin*2; })
                .attr("y", function(d) { return yScale_loan(d.group); })
                .text(function(d) { return d.sum + " students"; })
                .style("text-anchor", "end");
        });
    }

    function showStipend() {
        d3.selectAll(".legendEntry").classed("invisible", false);

        d3.selectAll(".student").classed("hasStipend", function(d) { return d.freecollege === "tuition&stipend" ? true : false; });
    }

    function groupBySums(freeCollegeScenarioName, group, groupName) {
        // first set up a shell object with all of the combinations and sum initialized to zero
        var sums = [];
        ["yes", "no"].forEach(function(d1) {
            group.forEach(function(d2) {
                var obs = {freecollege: d1, group: d2, sum: 0};
                sums.push(obs);
            })
        })

        // loop through data and update the sum for the group the observation falls in
        dotsData.forEach(function(d) {
            sums.forEach(function(s) {
                if(d[freeCollegeScenarioName] === s.freecollege && d[groupName] === s.group) {
                    s.sum += 1;
                }
            });
        });

        return sums;
    }

    function init() {
        setupCharts()
        // setupProse()
        update(0)
    }

    init()

    return {
        update: update,
    }
}

// })();