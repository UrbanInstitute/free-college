// (function() {


var PCTFORMAT = d3.format(".0%");

var isIE = navigator.userAgent.indexOf("MSIE") !== -1 || navigator.userAgent.indexOf("Trident") !== -1;

window.createGraphic = function(graphicSelector) {
    var graphicEl = d3.select('#graphic');
    var graphicVisEl = graphicEl.select('#chart');
    var graphicProseEl = graphicEl.select('#sections');
    var chartTitle = graphicEl.select(".chartTitle");
    var currentStep;  // need this for figuring out which yScale to use when resizing chart

    var titleHeight = d3.select(".chartTitle").node().getBoundingClientRect().height;
    var legendHeight = d3.select(".legend").node().getBoundingClientRect().height;

    var isMobile = d3.select("#isMobile").style("display") === "block";
    var isSmallMobile = d3.select("#isPhoneSm").style("display") === "block";
    var windowHeight = window.innerHeight - titleHeight - legendHeight - 52;

    var margin = 20;
    var width = isMobile ? document.querySelector("#isMobile").clientWidth : 600,
        height = (windowHeight < 500) ? windowHeight : 500;
    var r = isMobile ? 4 : 5;

    var forceStrengthFactor = isMobile ? -5 : -10;
    var dotsData;

    var xScale = d3.scaleOrdinal()
        .domain(["no", "yes"])
        .range([0.25*width, 0.75*width]);

    if(isSmallMobile) xScale.range([0.2*width, 0.8*width]);

    var yScale_inc = d3.scaleBand()
        .domain(["Higher-income dependent (more than $80,000)",
                 "Middle-income dependent ($40,001 to $80,000)",
                 "Lower-income dependent (less than $40,000)",
                 "Higher-income independent (more than $30,000)",
                 "Middle-income independent ($15,001 to $30,000)",
                 "Lower-income independent (less than $15,000)"])
        .rangeRound([margin, height])
        .padding(margin);

    var yScale_race = d3.scaleBand()
        .domain(["White", "Black", "Asian", "Latino", "Other race or ethnicity"])
        .rangeRound([margin, height])
        .padding(margin);

    var yScale_loan = d3.scaleBand()
        .domain(["Students without loans", "Students with loans"])
        .rangeRound([margin, height])
        .padding(margin);

    var scrollDirection;

    // actions to take on each step of our scroll-driven story
    var steps = [
        allDotsCentered,            // step 0
        spreadOut100Dots,           // step 1
        function step2() {          // step 2
            (scrollDirection === "down") && splitCurrentFreeCollege();
        },
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
        function step12() {
            splitFreeCollege400FPLPublic();
            // if(scrollDirection === "up") d3.select(".chartTitle").text("Who gets free tuition and fees under this plan?");
        },       // step 12
        splitFreeCollege400FPLPublicByRace, // step 13
        function step14() {                 // step 14
            if(scrollDirection === "up") splitFreeCollege400FPLPublicByRace();
            highlightJustina();
        },
        function step15() {
            splitFreeCollege400FPLPublic()
            // d3.select(".chartTitle").text("Who gets free tuition and fees under this plan?");
        },       // step 15
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
            d3.selectAll(".student").attr("r", r);
            d3.select(".legendEntry.stipend").classed("invisible", true);
            d3.select(".chartTitle").text("Who gets free tuition and fees under this plan, by student loan status?");
        },
        showStipend,                        // step 19
        function step20() {},               // step 20
        removeHighlighting,                 // step 21
        function highlightStephenSally() {  // step 22
            if(scrollDirection === "up") {
                splitFreeCollege400FPLPublicByLoan();
                showStipend();
            }
            highlightPersonas("Stephen", "Sally");
        },
        function step23() {
            splitFreeCollege400FPLPublic();
            // d3.select(".chartTitle").text("Who gets free tuition and fees under this plan?");
        },                                  // step 23
        switchToPublic,                     // step 24
        moreDotsJoin                        // step 25
    ]

    // update our chart
    function update(step, direction) {
        scrollDirection = direction;
        steps[step].call()
        currentStep = step;

        // change opacity of selected text
        d3.selectAll(".step").classed("inView", false);
        d3.select(".step[data-step='" + step + "']").classed("inView", true);
        // console.log(direction);
    }


    function setupCharts() {
        d3.csv("data/final_data.csv", function(d) {
            return {
                orig_id: d.orig_id,
                race: d.race,
                incomegroup_tooltip: d.incomegroup_tooltip,
                incomegroup: d.incomegroup,
                loan_tooltip: d.loan_tooltip,
                loan: d.loan,
                sector: d.sector,
                freecollege: d.freecollege,
                fpl: d.fpl,
                name: d.name,
                income: +d.income,
                currentFreeCollege: d.currentFreeCollege,
                allFreeCollege: d.allFreeCollege,
                freeCollege400FPL: d.freeCollege400FPL,
                freeCollege400FPLPublic: d.freeCollege400FPLPublic,
                switchToPublic: d.switchToPublic,
                char_id: d.char_id
            };
        }, function(error, data) {
            if (error) throw error;
            // console.log(data);
            dotsData = data;

            window.addEventListener("resize", redraw);

            var svg = graphicVisEl.append('svg')
                .attr('width', width)
                .attr('height', height)

            var chart = svg.append('g');
                // .attr('transform', 'translate(0,' + margin + ')')

            var student = chart.selectAll('.student')
                .data(data)
                .enter()
                .append('circle')
                .attr("class", function(d) { return d.name !== "NA" ? d.name + " student id_" + d.char_id : "student id_" + d.char_id; })
                .attr("cx", width / 2)
                .attr("cy", (height - titleHeight) / 2)
                .attr("r", r)
                .on("mouseover", showTooltip)
                .on("mouseout", hideTooltip);
        });
    }

    function redraw() {
        // get new width and height
        isMobile = d3.select("#isMobile").style("display") === "block";
        isSmallMobile = d3.select("#isPhoneSm").style("display") === "block";
        windowHeight = window.innerHeight - titleHeight - legendHeight;

        // update svg dimensions and circle size
        width = isMobile ? document.querySelector("#isMobile").clientWidth : 600;
        height = (windowHeight < 550) ? windowHeight : 550;
        r = isMobile ? 4 : 5;

        forceStrengthFactor = isMobile ? -5 : -10;

        // update scales
        xScale.range([0.25*width, 0.75*width]);
        if(isSmallMobile) xScale.range([0.2*width, 0.8*width]);

        yScale_inc.rangeRound([margin, height - margin]);
        yScale_race.rangeRound([margin, height - margin]);
        yScale_loan.rangeRound([margin, height - margin]);

        // update chart
        $("#chart").empty();

        var svg = graphicVisEl.append("svg")
            .attr("width", width)
            .attr("height", height);

        var chart = svg.append("g");

        var student = chart.selectAll('.student')
                .data(dotsData)
                .enter()
                .append('circle')
                .attr("class", function(d) { return d.name !== "NA" ? d.name + " student" : "student"; })
                .attr("cx", width / 2)
                .attr("cy", height / 2)
                .attr("r", r)
                .on("mouseover", showTooltip)
                .on("mouseout", hideTooltip);

        steps[currentStep].call();
    }

    function allDotsCentered() {
        d3.selectAll(".dotLabel").remove();
        d3.selectAll(".columnLabel").remove();
        d3.selectAll(".catLabel").remove();
        d3.selectAll(".dividerLine").remove();
        d3.select(".legend").classed("invisible", true);
        removeHighlighting();
        d3.select(".chartTitle").text("");

        d3.selectAll(".student")
            .transition()
            .attr("cx", width / 2)
            .attr("cy", (height - titleHeight) / 2);
    }

    function spreadOut100Dots() {
        d3.selectAll(".dotLabel").remove();
        d3.selectAll(".columnLabel").remove();
        d3.selectAll(".catLabel").remove();
        d3.selectAll(".dividerLine").remove();
        d3.select(".legend").classed("invisible", true);
        removeHighlighting();
        d3.select(".chartTitle").text("");

        var t = d3.transition()
            .duration(800)
            .ease(d3.easeQuadInOut)

        var simulation = d3.forceSimulation(dotsData)
            .force('charge', d3.forceManyBody().strength(forceStrengthFactor))
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
        // Plan: current reality
        // Split: two groups - those who have free college and those who don't

        d3.selectAll(".catLabel").remove();
        d3.selectAll(".dividerLine").remove();
        d3.select(".legend").classed("invisible", true);
        removeHighlighting();
        (d3.selectAll(".dotLabel").nodes().length !== 2) && d3.selectAll(".dotLabel").remove();

        d3.select(".chartTitle").text("Who has free college now?");

        var t = d3.transition()
            .duration(800)
            .ease(d3.easeQuadInOut)

        var simulation = d3.forceSimulation(dotsData)
            .force('charge', d3.forceManyBody().strength(forceStrengthFactor))
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
            var numTransitions = 0;

            students
                .transition(t)
                .attr("cx", function(d) { return d.x; })
                .attr("cy", function(d) { return d.y; })
                .on("interrupt", function() { })
                .on("end", function() {
                    numTransitions++;

                    if(numTransitions == 100) {  // fade in labels gracefully after dots have finished transitioning
                        students.classed("noFreeCollege", function(d) { return d.currentFreeCollege === "no" ? true : false; });

                        var svg = d3.select("svg g");

                        // label "Free College" and "No free college" columns
                        showColumnLabels(svg);

                        // update labels below dots
                        if(d3.selectAll(".dotLabel").nodes().length !== 2) {
                            var numFreeCollege = students.data().filter(function(d) { return d.currentFreeCollege !== "no"; }).length;
                            var numNoFreeCollege = 100 - numFreeCollege;

                            var lowestDotY = d3.max(students.data(), function(d) { return d.y; });

                            svg.append("text")
                                .attr("class", "dotLabel")
                                .attr("x", xScale("yes"))
                                .attr("y", lowestDotY + 40)
                                .text(numFreeCollege + " students")
                                .style("opacity", 0);

                            svg.append("text")
                                .attr("class", "dotLabel noFreeCollege")
                                .attr("x", xScale("no"))
                                .attr("y", lowestDotY + 40)
                                .text(numNoFreeCollege + " students")
                                .style("opacity", 0);

                            d3.selectAll(".dotLabel")
                                .transition(800)
                                .style("opacity", 1);
                        }
                    }
                });
        });
    }

    function splitCurrentByIncome() {
        // Plan: current reality
        // Split: by income

        (d3.selectAll(".dotLabel").nodes().length < 6) && d3.selectAll(".dotLabel").remove();
        removeHighlighting();
        d3.select(".chartTitle").text("Who has free college now?");

        var t = d3.transition()
            .duration(800)
            .ease(d3.easeQuadInOut)

        var simulation = d3.forceSimulation(dotsData)
            .force('charge', d3.forceManyBody().strength(forceStrengthFactor))
            .force('x', d3.forceX().x(function(d) { return xScale(d.currentFreeCollege); }).strength(0.2))  // seem to need to add an adjustment factor here
            .force('y', d3.forceY().y(function(d) { return yScale_inc(d.incomegroup); }).strength(0.2))
            .force('collision', d3.forceCollide().radius(r))
            .stop();

        d3.timeout(function() {
          // See https://github.com/d3/d3-force/blob/master/README.md#simulation_tick
          for (var i = 0, n = Math.ceil(Math.log(simulation.alphaMin()) / Math.log(1 - simulation.alphaDecay())); i < n; ++i) {
            simulation.tick();
          }

            var numTransitions = 0;
            var students = d3.selectAll(".student");

            students
                .transition(t)
                .attr("cx", function(d) { return d.x; })
                .attr("cy", function(d) { return d.y; })
                .on("interrupt", function() { })
                .on("end", function() {
                    numTransitions++;

                    if(numTransitions == 100) {
                        students.classed("noFreeCollege", function(d) { return d.currentFreeCollege === "no" ? true : false; });

                        // add labels for income groups and divider lines
                        var svg = d3.select("svg g");

                        if(d3.selectAll(".columnLabel").nodes().length !== 2) showColumnLabels(svg);

                        showCategoryLabels(svg, yScale_inc);
                        showDividerLines(svg, yScale_inc);

                        // add labels with group totals
                        var sums = groupBySums("currentFreeCollege", yScale_inc.domain(), "incomegroup");
                        if(d3.selectAll(".dotLabel").nodes().length !== 12) {
                            var leftmostDot = d3.min(students.data(), function(d) { return d.x; });
                            var rightmostDot = d3.max(students.data(), function(d) { return d.x; });
                            // console.log(sums)

                            showDotLabels(svg, sums, leftmostDot, rightmostDot, yScale_inc);

                            d3.select(".legend").classed("invisible", false);
                        }
                        else {
                            d3.selectAll(".dotLabel")
                                .data(sums)
                                .text(function(d) { return d.sum + " students"; })
                                .style("opacity", 1);
                        }
                    }
                });
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
        // Plan: grant free college to all
        // Split: by income

        d3.select(".chartTitle").text("Free tuition and fees for all students");

        var t = d3.transition()
            .duration(800)
            .ease(d3.easeQuadInOut)

        var simulation = d3.forceSimulation(dotsData)
            .force('charge', d3.forceManyBody().strength(forceStrengthFactor))
            .force('x', d3.forceX().x(function(d) { return xScale("yes"); }).strength(0.2))  // seem to need to add an adjustment factor here
            .force('y', d3.forceY().y(function(d) { return yScale_inc(d.incomegroup); }).strength(0.2))
            .force('collision', d3.forceCollide().radius(r))
            .stop();

        d3.timeout(function() {
          // See https://github.com/d3/d3-force/blob/master/README.md#simulation_tick
          for (var i = 0, n = Math.ceil(Math.log(simulation.alphaMin()) / Math.log(1 - simulation.alphaDecay())); i < n; ++i) {
            simulation.tick();
          }

            var numTransitions = 0;
            var students = d3.selectAll(".student");

            students
                .transition(t)
                .attr("cx", function(d) { return d.x; })
                .attr("cy", function(d) { return d.y; })
                .on("interrupt", function() { })
                .on("end", function() {
                    numTransitions++;

                    if(numTransitions === 100) {
                        // add labels for income groups and divider lines
                        var svg = d3.select("svg g");

                        // add labels with group totals
                        var sums = groupBySums("allFreeCollege", yScale_inc.domain(), "incomegroup");

                        var labels = svg.selectAll(".dotLabel")
                            .data(sums)
                            .transition(800)
                            .style("opacity", function(d) { return d.sum === 0 ? 0 : 1; })
                            .on("end", function() {
                                            d3.selectAll(".dotLabel").text( function(d) { return d.sum + " students"; });
                            });
                            // .text(function(d) { return d.sum + " students"; });
                    }
                });
        });
    }

    function freeCollegeBelow400FPL() {
        // Plan: grant free college to those < 400% of FPL
        // Split: by income

        d3.select(".chartTitle").text("Free tuition and fees, capped for family finances");

        var t = d3.transition()
            .duration(800)
            .ease(d3.easeQuadInOut)

        var simulation = d3.forceSimulation(dotsData)
            .force('charge', d3.forceManyBody().strength(forceStrengthFactor))
            .force('x', d3.forceX().x(function(d) { return xScale(d.freeCollege400FPL); }).strength(0.2))  // seem to need to add an adjustment factor here
            .force('y', d3.forceY().y(function(d) { return yScale_inc(d.incomegroup); }).strength(0.2))
            .force('collision', d3.forceCollide().radius(r))
            .stop();

        d3.timeout(function() {
          // See https://github.com/d3/d3-force/blob/master/README.md#simulation_tick
          for (var i = 0, n = Math.ceil(Math.log(simulation.alphaMin()) / Math.log(1 - simulation.alphaDecay())); i < n; ++i) {
            simulation.tick();
          }

            var numTransitions = 0;
            var students = d3.selectAll(".student");

            students
                .transition(t)
                .attr("cx", function(d) { return d.x; })
                .attr("cy", function(d) { return d.y; })
                .on("interrupt", function() { })
                .on("end", function() {
                    numTransitions++;

                    if(numTransitions === 100) {
                        var svg = d3.select("svg g");

                        // add labels with group totals
                        var sums = groupBySums("freeCollege400FPL", yScale_inc.domain(), "incomegroup");

                        var labels = svg.selectAll(".dotLabel")
                            .data(sums)
                            .transition(800)
                            .style("opacity", 1)
                            .text(function(d) { return d.sum + " students"; });
                    }
                });
        });
    }

    function freeCollegeBelow400FPLPublic() {
        // Plan: free college to those < 400% of FPL and attending public institutions
        // Split: by income

        d3.select(".chartTitle").text("Free tuition and fees, at public institutions and capped for family finances");
        removeHighlighting();
        d3.selectAll(".newStudent").remove();
        (d3.selectAll(".dotLabel").nodes().length < 12) && d3.selectAll(".dotLabel").remove();

        var t = d3.transition()
            .duration(800)
            .ease(d3.easeQuadInOut)

        var simulation = d3.forceSimulation(dotsData)
            .force('charge', d3.forceManyBody().strength(forceStrengthFactor))
            .force('x', d3.forceX().x(function(d) { return xScale(d.freeCollege400FPLPublic); }).strength(0.2))  // seem to need to add an adjustment factor here
            .force('y', d3.forceY().y(function(d) { return yScale_inc(d.incomegroup); }).strength(0.2))
            .force('collision', d3.forceCollide().radius(r))
            .stop();

        d3.timeout(function() {
          // See https://github.com/d3/d3-force/blob/master/README.md#simulation_tick
          for (var i = 0, n = Math.ceil(Math.log(simulation.alphaMin()) / Math.log(1 - simulation.alphaDecay())); i < n; ++i) {
            simulation.tick();
          }

            var numTransitions = 0;
            var students = d3.selectAll(".student");

            students
                .transition(t)
                .attr("cx", function(d) { return d.x; })
                .attr("cy", function(d) { return d.y; })
                .on("interrupt", function() { })
                .on("end", function() {
                    numTransitions++;

                    if(numTransitions === 100) {
                        // add labels for income groups and divider lines
                        var svg = d3.select("svg g");

                        if(svg.selectAll(".catLabel").nodes().length < 6) showCategoryLabels(svg, yScale_inc);
                        if(svg.selectAll(".dividerLine").nodes().length < 5) showDividerLines(svg, yScale_inc);

                        // add labels with group totals
                        var sums = groupBySums("freeCollege400FPLPublic", yScale_inc.domain(), "incomegroup");
                        var leftmostDot = d3.min(students.data(), function(d) { return d.x; });
                        var rightmostDot = d3.max(students.data(), function(d) { return d.x; });

                        if(svg.selectAll(".dotLabel").nodes().length < 12) {
                            svg.selectAll(".dotLabel").remove();
                            showDotLabels(svg, sums, leftmostDot, rightmostDot, yScale_inc);
                        }
                        else {
                            svg.selectAll(".dotLabel")
                                .data(sums)
                                .text(function(d) { return d.sum + " students"; });
                        }
                    }
                });
        });
    }

    function splitFreeCollege400FPLPublic() {
        // Plan: free college for < 400% FPL and attending public school
        // Split: two groups (free college/no free college)

        d3.selectAll(".catLabel").remove();
        d3.selectAll(".dividerLine").remove();
        d3.selectAll(".dotLabel").remove();
        removeHighlighting();
        d3.selectAll(".student").classed("hasStipend", false);
        d3.select(".legendEntry.stipend").classed("invisible", true);

        d3.select(".chartTitle").text("Who gets free tuition and fees under this plan?");

        var t = d3.transition()
            .duration(800)
            .ease(d3.easeQuadInOut)

        var simulation = d3.forceSimulation(dotsData)
            .force('charge', d3.forceManyBody().strength(forceStrengthFactor))
            .force('x', d3.forceX().x(function(d) { return xScale(d.freeCollege400FPLPublic); }).strength(0.15))  // seem to need to add an adjustment factor here
            .force('y', d3.forceY().y((height - titleHeight) / 2).strength(0.15))
            .force('collision', d3.forceCollide().radius(r))
            .stop();

        d3.timeout(function() {
          // See https://github.com/d3/d3-force/blob/master/README.md#simulation_tick
          for (var i = 0, n = Math.ceil(Math.log(simulation.alphaMin()) / Math.log(1 - simulation.alphaDecay())); i < n; ++i) {
            simulation.tick();
          }

            var numTransitions = 0;
            var students = d3.selectAll(".student");

            students
                .transition(t)
                .attr("cx", function(d) { return d.x; })
                .attr("cy", function(d) { return d.y; })
                .on("interrupt", function() { })
                .on("end", function() {
                    numTransitions++;

                    if(numTransitions === 100) {
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
                            .text(numFreeCollege + " students")
                            .style("opacity", 0);

                        svg.append("text")
                            .attr("class", "dotLabel noFreeCollege")
                            .attr("x", xScale("no"))
                            .attr("y", lowestDotY + 40)
                            .text(numNoFreeCollege + " students")
                            .style("opacity", 0);

                        d3.selectAll(".dotLabel")
                            .transition(800)
                            .style("opacity", 1);
                    }
                });

            students.classed("noFreeCollege", function(d) { return d.currentFreeCollege === "no" ? true : false; });
        });

    }

    function splitFreeCollege400FPLPublicByRace() {
        // Plan: free college to those < 400% of FPL and attending public institutions
        // Split: by race

        (d3.selectAll(".dotLabel").nodes().length < 10) && d3.selectAll(".dotLabel").remove();
        removeHighlighting();
        d3.select(".chartTitle").text("Who gets free tuition and fees under this plan, by race or ethnicity?");

        var t = d3.transition()
            .duration(800)
            .ease(d3.easeQuadInOut)

        var simulation = d3.forceSimulation(dotsData)
            .force('charge', d3.forceManyBody().strength(forceStrengthFactor))
            .force('x', d3.forceX().x(function(d) { return xScale(d.freeCollege400FPLPublic); }).strength(0.2))  // seem to need to add an adjustment factor here
            .force('y', d3.forceY().y(function(d) { return yScale_race(d.race); }).strength(0.2))
            .force('collision', d3.forceCollide().radius(r))
            .stop();

        d3.timeout(function() {
          // See https://github.com/d3/d3-force/blob/master/README.md#simulation_tick
          for (var i = 0, n = Math.ceil(Math.log(simulation.alphaMin()) / Math.log(1 - simulation.alphaDecay())); i < n; ++i) {
            simulation.tick();
          }

            var numTransitions = 0;
            var students = d3.selectAll(".student");

            students
                .transition(t)
                .attr("cx", function(d) { return d.x; })
                .attr("cy", function(d) { return d.y; })
                .on("interrupt", function() { })
                .on("end", function() {
                    numTransitions++;

                    if(numTransitions === 100) {
                        students.classed("noFreeCollege", function(d) { return d.currentFreeCollege === "no" ? true : false; });
                        d3.select(".legend").classed("invisible", false);

                        // add labels for income groups and divider lines
                        var svg = d3.select("svg g");

                        if(d3.selectAll(".columnLabel").nodes().length !== 2) showColumnLabels(svg);

                        showCategoryLabels(svg, yScale_race);
                        showDividerLines(svg, yScale_race);

                        // add labels with group totals
                        var sums = groupBySums("freeCollege400FPLPublic", yScale_race.domain(), "race");
                        var leftmostDot = d3.min(students.data(), function(d) { return d.x; });
                        var rightmostDot = d3.max(students.data(), function(d) { return d.x; });
                        showDotLabels(svg, sums, leftmostDot, rightmostDot, yScale_race);
                    }
                });
        });
    }

    function highlightJustina() {
        d3.select(".student.Justina").classed("highlighted2", true);
        // show Justina's tooltip
    }

    function splitFreeCollege400FPLPublicByLoan() {
        // Plan: free college to those < 400% of FPL and attending public institutions
        // Split: loan status
        (d3.selectAll(".dotLabel").nodes().length < 4) && d3.selectAll(".dotLabel").remove();
        removeHighlighting();
        d3.select(".chartTitle").text("Who gets free tuition and fees under this plan, by student loan status?");

        var t = d3.transition()
            .duration(800)
            .ease(d3.easeQuadInOut)

        var simulation = d3.forceSimulation(dotsData)
            .force('charge', d3.forceManyBody().strength(forceStrengthFactor))
            .force('x', d3.forceX().x(function(d) { return xScale(d.freeCollege400FPLPublic); }).strength(0.2))  // seem to need to add an adjustment factor here
            .force('y', d3.forceY().y(function(d) { return yScale_loan(d.loan); }).strength(0.2))
            .force('collision', d3.forceCollide().radius(r))
            .stop();

        d3.timeout(function() {
          // See https://github.com/d3/d3-force/blob/master/README.md#simulation_tick
          for (var i = 0, n = Math.ceil(Math.log(simulation.alphaMin()) / Math.log(1 - simulation.alphaDecay())); i < n; ++i) {
            simulation.tick();
          }

            var numTransitions = 0;
            var students = d3.selectAll(".student");

            students
                .transition(t)
                .attr("cx", function(d) { return d.x; })
                .attr("cy", function(d) { return d.y; })
                .on("interrupt", function() { })
                .on("end", function() {
                    numTransitions++;

                    if(numTransitions === 100) {
                        students.classed("noFreeCollege", function(d) { return d.currentFreeCollege === "no" ? true : false; });
                        d3.select(".legend").classed("invisible", false);

                        // add labels for income groups and divider lines
                        var svg = d3.select("svg g");

                        if(d3.selectAll(".columnLabel").nodes().length !== 2) showColumnLabels(svg);

                        showCategoryLabels(svg, yScale_loan);
                        showDividerLines(svg, yScale_loan);

                        // add labels with group totals
                        var sums = groupBySums("freeCollege400FPLPublic", yScale_loan.domain(), "loan");
                        var leftmostDot = d3.min(students.data(), function(d) { return d.x; });
                        var rightmostDot = d3.max(students.data(), function(d) { return d.x; });
                        showDotLabels(svg, sums, leftmostDot, rightmostDot, yScale_loan);
                    }
                });
        });
    }

    function showStipend() {
        d3.select(".chartTitle").text("Who gets free tuition, fees, and a stipend under this plan, by student loan status?");

        // highlight students currently receiving a stipend in pink
        d3.selectAll(".legendEntry").classed("invisible", false);
        d3.selectAll(".student").classed("hasStipend", function(d) { return d.freecollege === "tuition&stipend" ? true : false; });
    }

    function switchToPublic() {
        // show some dots moving from no free college to free college group, representing them changing the type of school they went to
        d3.select(".student.Justina").classed("highlighted2", true);
        d3.selectAll(".newStudent").remove();
        d3.select(".chartTitle").text("Who moves to a public institution to get free college?");

        var studentsWhoSwitch = ["47", "59", "117", "128", "139"];

        var simulation = d3.forceSimulation(dotsData)
            .force('charge', d3.forceManyBody().strength(forceStrengthFactor))
            .force('x', d3.forceX().x(function(d) { return xScale(d.switchToPublic); }).strength(0.15))  // seem to need to add an adjustment factor here
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
                .transition()
                .delay(function(d, i) { return i * 60; })
                .duration(4000)
                .ease(d3.easeQuadInOut)
                .attr("cx", function(d) { return d.x; })
                .attr("cy", function(d) { return d.y; })
                .on("start", function(d) { if(studentsWhoSwitch.indexOf(d.orig_id) > -1) d3.select(this).classed("animation-target", true); })
                .on("end", function() { d3.select(this).classed("animation-target", false); })
                .on("interrupt", function() { d3.selectAll(".student").classed("animation-target", false); });

            students.classed("noFreeCollege", function(d) { return d.currentFreeCollege === "no" ? true : false; });
        });
    }

    function moreDotsJoin() {
        // more kids decide to attend college

        d3.selectAll(".catLabel").remove();
        d3.selectAll(".dividerLine").remove();
        (d3.selectAll(".dotLabel").nodes().length > 2) && d3.selectAll(".dotLabel").remove();
        removeHighlighting();
        d3.selectAll(".student").classed("animation-target", false);
        d3.select(".chartTitle").text("Who moves to a public institution to get free college?");

        // create data for new students
        var newStudentsData = [
            {char_id: "new", currentFreeCollege: "no", switchToPublic: "yes"},
            {char_id: "new", currentFreeCollege: "no", switchToPublic: "yes"},
            {char_id: "new", currentFreeCollege: "no", switchToPublic: "yes"},
            {char_id: "new", currentFreeCollege: "no", switchToPublic: "yes"},
            {char_id: "new", currentFreeCollege: "no", switchToPublic: "yes"},
            {char_id: "new", currentFreeCollege: "no", switchToPublic: "yes"},
            {char_id: "new", currentFreeCollege: "no", switchToPublic: "yes"},
            {char_id: "new", currentFreeCollege: "no", switchToPublic: "yes"},
            {char_id: "new", currentFreeCollege: "no", switchToPublic: "yes"},
            {char_id: "new", currentFreeCollege: "no", switchToPublic: "yes"}
        ];

        var newData = dotsData.concat(newStudentsData);
        var svg = d3.select("#chart svg g");

        // initialize all new dots off screen
        svg.selectAll(".newStudent")
            .data(newStudentsData)
            .enter()
            .append("circle")
            .attr("class", "student newStudent noFreeCollege")
            .attr("cx", Math.random() * width)
            .attr("cy", -15)
            .attr("r", r);

        // immediately add one dot upon reaching this step (d3.interval only starts adding two seconds later)
        addNewDot(newData, 101);

        var totalDots = 102;

        // add each new dot one at a time (with 2 seconds in between) and recompute force layout each time new circle is added
        var t = d3.interval(function(elapsed) {

            addNewDot(newData, totalDots);

            totalDots++;

            if (elapsed > 18000) t.stop();

        }, 2000);
    }

    function addNewDot(newData, totalDots) {
        var simulation = d3.forceSimulation(newData.filter(function(d, i) { return i < totalDots; }))
            .force('charge', d3.forceManyBody().strength(forceStrengthFactor))
            .force('x', d3.forceX().x(function(d) { return xScale(d.switchToPublic); }).strength(0.15))  // seem to need to add an adjustment factor here
            .force('y', d3.forceY().y((height - titleHeight) / 2).strength(0.15))
            .force('collision', d3.forceCollide().radius(r))
            .stop();

        d3.timeout(function() {
          for (var i = 0, n = Math.ceil(Math.log(simulation.alphaMin()) / Math.log(1 - simulation.alphaDecay())); i < n; ++i) {
            simulation.tick();
          }

            d3.selectAll(".student")
                .transition()
                .duration(2000)
                .ease(d3.easeQuadInOut)
                .attr("cx", function(d) { return (Object.keys(d).indexOf("x") > -1) ? d.x : Math.random() * width; })
                .attr("cy", function(d) { return (Object.keys(d).indexOf("y") > -1) ? d.y : -15; });

            d3.selectAll(".student").classed("newCircle", false);
        });
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

    function wrap(text, width) {
        text.each(function() {
            var text = d3.select(this),
                words = text.text().split(/\s+/).reverse(),
                word,
                line = [],
                lineNumber = 0,
                lineHeight = 1.3, // ems
                x = text.attr("x"),
                y = text.attr("y"),
                dy = parseFloat(text.attr("dy")),
                tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");
            while (word = words.pop()) {
                line.push(word);
                tspan.text(line.join(" "));
                if (tspan.node().getComputedTextLength() > width) {
                    line.pop();
                    tspan.text(line.join(" "));
                    line = [word];
                    tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
                }
            }
        });
    }

    function showTooltip(d) {
        // populate tooltip
        if(d.name !== "NA") {
            d3.select(".tooltip img")
                .attr("src", "img/" + d.name.toLowerCase() + ".png");
            d3.select(".tooltip .studentPic").classed("hidden", false);
            d3.select(".tooltip .studentName").text(d.name);
        }
        else {
            d3.select(".tooltip .studentPic").classed("hidden", true);
            d3.select(".tooltip .studentName").text("Student profile");
        }
        d3.select(".tooltip .studentIncome span").text(d3.format("$,.0f")(d.income));
        d3.select(".tooltip .studentIncGroup").text(d.incomegroup_tooltip);
        d3.select(".tooltip .studentRace").text(d.race);
        d3.select(".tooltip .studentInstitutionType").text(d.sector);
        d3.select(".tooltip .studentLoanStatus").text(d.loan_tooltip);

        // position and show tooltip
        if(((d.name !== "NA") && (height - d.y < 310)) || ((d.name === "NA") && (height - d.y < 145))) {  // if tooltip won't fit above the bottom of the screen, shift it upwards
            d3.select(".tooltip")
                .style("top", "auto")
                .style("bottom", "50px")
                .style("left", (d.x + r * 2) + "px")
                .classed("hidden", false);
        }
        else {
            d3.select(".tooltip")
                .style("top", (d.y + 51 + r * 2) + "px")
                .style("bottom", "auto")
                .style("left", (d.x + r * 2) + "px")
                .classed("hidden", false);
        }

        // make dot larger and bring to front in case it overlaps
        makeDotsBigger(".student.id_" + d.char_id);
    }

    function hideTooltip(d) {
        d3.select(".tooltip").classed("hidden", true);
        makeDotsSmaller(".student.id_" + d.char_id);
    }

    function showColumnLabels(svg) {
        svg.append("text")
            .attr("class", "columnLabel yesFree")
            .attr("x", xScale("yes"))
            .attr("y", margin)
            .text("Free college")
            .style("opacity", 0);

        svg.append("text")
            .attr("class", "columnLabel noFree")
            .attr("x", xScale("no"))
            .attr("y", margin)
            .text("No free college")
            .style("opacity", 0);

        d3.selectAll(".columnLabel")
            .transition(800)
            .style("opacity", 1);
    }

    function showCategoryLabels(svg, yScale) {
        if(yScale == yScale_inc) {
          svg.selectAll(".catLabel")
                .data(yScale.domain())
                .enter()
                .append("text")
                .attr("class", "catLabel")
                .attr("x", width / 2)
                .attr("y", function(d) { return yScale(d); })
                .attr("dy", 0)
                .text(function(d) { return d; })
                .style("opacity", 0)
                .call(wrap, isMobile ? 150 : 185);
        }
        else if(yScale == yScale_loan & isSmallMobile) {
            svg.selectAll(".catLabel")
                .data(yScale.domain())
                .enter()
                .append("text")
                .attr("class", "catLabel")
                .attr("x", width / 2)
                .attr("y", function(d) { return yScale(d); })
                .attr("dy", 0)
                .text(function(d) { return d; })
                .style("opacity", 0)
                .call(wrap, 100);
        }
        else {
            svg.selectAll(".catLabel")
                .data(yScale.domain())
                .enter()
                .append("text")
                .attr("class", "catLabel")
                .attr("x", width / 2)
                .attr("y", function(d) { return yScale(d); })
                .text(function(d) { return d; })
                .style("opacity", 0);
        }

        d3.selectAll(".catLabel")
            .transition(1000)
            .style("opacity", 1);
    }

    function showDividerLines(svg, yScale) {
        svg.selectAll(".dividerLine")
            .data(yScale.domain().slice(0, yScale.domain().length - 1))
            .enter()
            .append("line")
            .attr("class", "dividerLine")
            .attr("x1", 0)
            .attr("x2", width)
            .attr("y1", function(d) { return yScale(d) + yScale.step()/2; })
            .attr("y2", function(d) { return yScale(d) + yScale.step()/2; })
            .style("opacity", 0);

        d3.selectAll(".dividerLine")
            .transition(1000)
            .style("opacity", 1);
    }

    function showDotLabels(svg, sums, leftmostDot, rightmostDot, yScale) {
        svg.selectAll(".dotLabel")
            .data(sums)
            .enter()
            .append("text")
            .attr("class", function(d) { return d.freecollege === "yes" ? "dotLabel" : "dotLabel noFreeCollege"; })
            .attr("x", function(d) { return d.freecollege === "yes" ? rightmostDot + margin*4.5 : leftmostDot - margin*2; })
            .attr("y", function(d) { return yScale(d.group); })
            .text(function(d) { return d.sum + " students"; })
            .style("text-anchor", "end")
            .style("opacity", 0);

        d3.selectAll(".dotLabel")
            .transition(1000)
            .style("opacity", 1);
    }

    // functions for interactivity on text highlights
    d3.selectAll(".personaTextHighlight").on("mouseover", function() { makeDotsBigger(".Justina"); });
    d3.selectAll(".personaTextHighlight").on("mouseout", function() { makeDotsSmaller(".Justina"); });

    d3.selectAll(".stipendTextHighlight").on("mouseover", function() { makeDotsBigger(".student.hasStipend"); });
    d3.selectAll(".stipendTextHighlight").on("mouseout", function() { makeDotsSmaller(".student.hasStipend"); });

    function makeDotsBigger(dotClass) {
        // move dot(s) to front
        d3.selectAll(dotClass).moveToFront();

        // make the dots bigger
        d3.selectAll(dotClass).attr("r", r * 1.5);
    }

    function makeDotsSmaller(dotClass) {
        d3.selectAll(dotClass).attr("r", r);
    }

    d3.selection.prototype.moveToFront = function() {
            return this.each(function(){
                this.parentNode.appendChild(this);
        });
    };

    function init() {
        setupCharts()
        update(0)
    }

    init()

    return {
        update: update,
    }
}

// })();