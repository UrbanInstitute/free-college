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