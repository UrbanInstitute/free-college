// (function() {


var PCTFORMAT = d3.format(".0%");

// var xScalePG = d3.scaleBand()
//     .domain(["peer_group", "national"])
//     .range([0, chartDimensions.width_pg])
//     .padding(0.4);

// var colorScale = d3.scaleOrdinal()
//     .domain(["", "no", "diff"])
//     .range(["#1696d2", "#e3e3e3", "#fdbf11"]);


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


    // actions to take on each step of our scroll-driven story
    var steps = [
        function step0() {
            d3.selectAll(".dotLabel").remove();
            d3.select(".legend").classed("invisible", true);

            d3.selectAll(".student")
                .transition()
                .attr("cx", width / 2)
                .attr("cy", (height - titleHeight) / 2);
        },
        function step1() {
            // console.log("spread out 100 dots");
            d3.selectAll(".dotLabel").remove();

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

                students.classed("noFreeCollege", false);

                // label number of dots
                var lowestDotY = d3.max(students.data(), function(d) { return d.y; });
                d3.select("svg g").append("text")
                    .attr("class", "dotLabel")
                    .attr("x", width / 2)
                    .attr("y", lowestDotY + 60)
                    .text(dotsData.length + " students");
            });
        },

        function step2() {
            // console.log("split into two groups: those who have free college and those who don't");
            d3.selectAll(".dotLabel").remove();

            var t = d3.transition()
                .duration(800)
                .ease(d3.easeQuadInOut)

            var simulation = d3.forceSimulation(dotsData)
                .force('charge', d3.forceManyBody().strength(-10))
                .force('x', d3.forceX().x(function(d) { return xScale(d.currentFreeCollege); }))  // seem to need to add an adjustment factor here
                .force('y', d3.forceY().y((height - titleHeight) / 2))
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
            });
        },
        function step3() {
        },
        function step4() {
            // console.log("separate into income groups");
            d3.selectAll(".dotLabel").remove();

            d3.select(".chartTitle").text("Current situation");
            d3.select(".legend").classed("invisible", false);

            var t = d3.transition()
                .duration(800)
                .ease(d3.easeQuadInOut)

            var simulation = d3.forceSimulation(dotsData)
                .force('charge', d3.forceManyBody().strength(-10))
                .force('x', d3.forceX().x(function(d) { return xScale(d.currentFreeCollege); }))  // seem to need to add an adjustment factor here
                .force('y', d3.forceY().y(function(d) { return yScale_inc(d.incomegroup); }))
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

                // update label below dots
                // var numFreeCollege = students.data().filter(function(d) { return d.currentFreeCollege !== "no"; }).length;
                // var numNoFreeCollege = 100 - numFreeCollege;

                // var lowestDotY = d3.max(students.data(), function(d) { return d.y; });

                // d3.select("svg g")
                //     .append("text")
                //     .attr("class", "dotLabel")
                //     .attr("x", xScale("yes"))
                //     .attr("y", lowestDotY + 40)
                //     .text(numFreeCollege + " students");

                // d3.select("svg g")
                //     .append("text")
                //     .attr("class", "dotLabel noFreeCollege")
                //     .attr("x", xScale("no"))
                //     .attr("y", lowestDotY + 40)
                //     .text(numNoFreeCollege + " students");
            });
        },
        function step5() {

        }
    ]

    // update our chart
    function update(step) {
        steps[step].call()
    }

    // little helper for string concat if using es5
    // function translate(x, y) {
    //     return 'translate(' + x + ',' + y + ')'
    // }

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
                currentFreeCollege: d.currentFreeCollege
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
                .attr("class", "student")
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