// (function() {


var PCTFORMAT = d3.format(".0%");

var chartDimensions = {width_pg: 130, width_cnty: 220, height: 100, margin: {top: 20, right: 0, bottom: 5, left: 0}};

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

// function to make selector menus section stick to top of viewport (since IE doesn't support position: sticky)
$(window).on("load", function() {  // perform calculations only after DOM is fully rendered
    $(function() {
        var windowHeight = $(window).height();
        var visTop = $("#vis")[0].getBoundingClientRect().top + $(window).scrollTop(); //get the offset top of the element

        $(window).scroll(function() {
            // console.log($(window).scrollTop() - graphicTop, $(".main")[0].getBoundingClientRect().bottom);
            if($(window).scrollTop() - visTop >= -50) {
                // if content after the scrolly div appears above the fold, unstick #vis so it scrolls away instead
                // of remaining fixed over the footer
                var postScrollyTop = $(".content.afterScroll")[0].getBoundingClientRect().top;

                if(postScrollyTop < windowHeight) {
                    $('#vis').removeClass("sticky");
                    $('#vis').addClass("stickToBottom");
                }
                // if #vis is at the top but bottom of graphic container div isn't, make #vis sticky
                else {
                    $('#vis').addClass("sticky");
                    $('#vis').removeClass("stickToBottom");
                }
            }
            else {
                $('#vis').removeClass("sticky stickToBottom");
            }
        });
    });
})

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