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

/*
    I've created a function here that is a simple d3 chart.
    This could be anthing that has discrete steps, as simple as changing
    the background color, or playing/pausing a video.
    The important part is that it exposes and update function that
    calls a new thing on a scroll trigger.
*/
window.createGraphic = function(graphicSelector) {
    var graphicEl = d3.select('#graphic');
    var graphicVisEl = graphicEl.select('#vis');
    var graphicProseEl = graphicEl.select('#sections');
    var chartTitle = graphicEl.select(".chartTitle");

    var margin = 20
    var size = 400
    var chartSize = size - margin * 2
    var scaleX = null
    var scaleR = null
    var data = [8, 6, 7, 5, 3, 0, 9]

    // actions to take on each step of our scroll-driven story
    var steps = [
        function step0() {
            console.log("spread out 100 dots");
            // // circles are centered and small
            // var t = d3.transition()
            //     .duration(800)
            //     .ease(d3.easeQuadInOut)


            // var item = graphicVisEl.selectAll('.item')

            // item.transition(t)
            //     .attr('transform', translate(chartSize / 2, chartSize / 2))

            // item.select('circle')
            //     .transition(t)
            //     .attr('r', minR)

            // item.select('text')
            //     .transition(t)
            //     .style('opacity', 0)
        },

        function step1() {
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

        function step2() {
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
        var svg = graphicVisEl.append('svg')
            .attr('width', size + 'px')
            .attr('height', size + 'px')

        var chart = svg.append('g')
            .classed('chart', true)
            .attr('transform', 'translate(' + margin + ',' + margin + ')')

        // scaleR = d3.scaleLinear()
        // scaleX = d3.scaleBand()

        // var domainX = d3.range(data.length)

        // scaleX
        //     .domain(domainX)
        //     .range([0, chartSize])
        //     .padding(1)

        // scaleR
        //     .domain(extent)
        //     .range([minR, maxR])

        // var item = chart.selectAll('.item')
        //     .data(data)
        //     .enter().append('g')
        //         .classed('item', true)
        //         .attr('transform', translate(chartSize / 2, chartSize / 2))
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

// d3.csv("data/chart_data.csv", function(d) {
//     return {
//         id: d.id,
//         name: d.name,
//         food_insecure_all: +d.food_insecure_all,
//         food_insecure_children: +d.food_insecure_children,
//         severely_housing_cost_burdened: +d.severely_housing_cost_burdened,
//         housing_cost_burdened: +d.housing_cost_burdened,
//         wage_fair_market_rent: +d.wage_fair_market_rent,
//         disability: +d.disability,
//         diabetes: +d.diabetes,
//         low_birthweight: +d.low_birthweight,
//         credit_score: +d.credit_score,
//         debt: +d.debt,
//         median_income: +d.median_income,
//         below_poverty: +d.below_poverty,
//         unemployment: +d.unemployment,
//         no_insurance: +d.no_insurance,
//         college_less: +d.college_less,
//         people_color: +d.people_color,
//         children: +d.children,
//         seniors: +d.seniors,
//         rural_population: +d.rural_population,
//         geography: d.geography
//     };
// }, function(error, data) {

//     if (error) throw error;

// });

// })();