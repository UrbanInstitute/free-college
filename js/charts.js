// (function() {


var PCTFORMAT = d3.format(".0%");

// var chartDimensions = {width_pg: 130, width_cnty: 220, height: 100, margin: {top: 20, right: 0, bottom: 5, left: 0}};

// var xScalePG = d3.scaleBand()
//     .domain(["peer_group", "national"])
//     .range([0, chartDimensions.width_pg])
//     .padding(0.4);

// var yScale = d3.scaleLinear()
//     .range([chartDimensions.height, 0]);

// var colorScale = d3.scaleOrdinal()
//     .domain(["", "no", "diff"])
//     .range(["#1696d2", "#e3e3e3", "#fdbf11"]);


var isIE = navigator.userAgent.indexOf("MSIE") !== -1 || navigator.userAgent.indexOf("Trident") !== -1;

window.createGraphic = function(graphicSelector) {
    var graphicEl = d3.select('#graphic');
    var graphicVisEl = graphicEl.select('#vis');
    var graphicProseEl = graphicEl.select('#sections');
    var chartTitle = graphicEl.select(".chartTitle");

    var margin = 20
    var size = 600
    var chartSize = size - margin * 2
    var scaleX = null
    var scaleR = null
    var dotsData;

    // actions to take on each step of our scroll-driven story
    var steps = [
        function step0() {
            d3.selectAll(".student")
                .transition()
                .attr("cx", size / 2)
                .attr("cy", size / 2);
        },
        function step1() {
            console.log("spread out 100 dots");
            var t = d3.transition()
                .duration(800)
                .ease(d3.easeQuadInOut)

            var simulation = d3.forceSimulation(dotsData)
              .force('charge', d3.forceManyBody().strength(-1))
              .force('center', d3.forceCenter(chartSize / 2, chartSize / 2))
              .force('collision', d3.forceCollide().radius(6))
              .on('tick', ticked);

            function ticked() {
              var dots = d3.selectAll('.student')
                .attr('r', 6)
                .attr('cx', function(d) { return d.x; })
                .attr('cy', function(d) { return d.y; })
            }

            // var item = graphicVisEl.selectAll('.item')

            // item.transition(t)
            //     .attr('transform', translate(chartSize / 2, chartSize / 2))
        },

        function step2() {
            console.log("split into two groups: those who have free college and those who don't");
            // var t = d3.transition()
            //     .duration(800)
            //     .ease(d3.easeQuadInOut)

            // // circles are positioned
            // var item = graphicVisEl.selectAll('.item')

            // item.transition(t)
            //     .attr('transform', function(d, i) {
            //         return translate(scaleX(i), chartSize / 2)
            //     })

            // item.select('circle')
            //     .transition(t)
            //     .attr('r', minR)

            // item.select('text')
            //     .transition(t)
            //     .style('opacity', 0)
        },

        function step3() {
            console.log("keep groups the same");
            // var t = d3.transition()
            //     .duration(800)
            //     .ease(d3.easeQuadInOut)

            // // circles are sized
            // var item = graphicVisEl.selectAll('.item')

            // item.select('circle')
            //     .transition(t)
            //     .delay(function(d, i) { return i * 200 })
            //     .attr('r', function(d, i) {
            //         return scaleR(d)
            //     })

            // item.select('text')
            //     .transition(t)
            //     .delay(function(d, i) { return i * 200 })
            //     .style('opacity', 1)
        },
        // function step3() {
        //     console.log()
        // }
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
        d3.csv("data/source/best_output_final.csv", function(d) {
            return {
                char_id: d.char_id,
                characteristics: d.characteristics,
                percent: +d.percent,
                frequency: +d.frequency,
                race: d.race,
                incomegroup: d.incomegroup,
                loan: d.loan,
                public: d.public,
                freecollege: d.freecollege,
                fpl: d.fpl,
                total: +d.total,
                ticket_num: +d.ticket_num,
                pick: +d.pick,
                orig_name: d.orig_name,
                new_name: d.new_name,
                income: +d.income
            };
        }, function(error, data) {
            if (error) throw error;
            // console.log(data);
            dotsData = data;

            var svg = graphicVisEl.append('svg')
                .attr('width', size)
                .attr('height', size)

            var chart = svg.append('g')
                .attr('transform', 'translate(' + margin + ',' + margin + ')')

            var item = chart.selectAll('.item')
                .data(data)
                .enter()
                .append('circle')
                .attr("class", "student")
                .attr("cx", size / 2)
                .attr("cy", size / 2)
                .attr("r", 6);
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