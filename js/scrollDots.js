// code modified from: https://github.com/CodyHouse/vertical-fixed-navigation / https://codyhouse.co/gem/vertical-fixed-navigation/
$(document).ready(function($){
    var contentSections = $('.navDotStep'),
        navigationItems = $('#navDots a');

    var contentSectionTops = [];

    // get the vertical location of where each "chapter" begins
    contentSections.each(function() {
        contentSectionTops.push($(this).offset().top - $(window).height());
    });
    console.log(contentSectionTops);
    // update which navigation dot is selected
    // updateNavigation();
    $(window).on('scroll', function(){
        updateNavigation();
    });

    // smooth scroll to the section when clicking on a dot
    navigationItems.on('click', function(event){
        event.preventDefault();
        smoothScroll($(this.hash));
    });

    // //open-close navigation on touch devices
    // $('.touch .cd-nav-trigger').on('click', function(){
    //     $('.touch #cd-vertical-nav').toggleClass('open');

    // });
    // //close navigation on touch devices when selectin an elemnt from the list
    // $('.touch #cd-vertical-nav a').on('click', function(){
    //     $('.touch #cd-vertical-nav').removeClass('open');
    // });

    function updateNavigation() {
        var windowScrollTop = $(window).scrollTop();

        d3.selectAll("#navDots .navDot").classed("is-selected", false);

        if(windowScrollTop < contentSectionTops[0]) {
            d3.select("#navDots .navDot").classed("is-selected", true);
        }
        else if(windowScrollTop > contentSectionTops[contentSectionTops.length - 1]) {
            d3.selectAll("#navDots .navDot").filter(function(d, i) { return i === contentSectionTops.length - 1; }).classed("is-selected", true);
        }
        else {
            for(var j = 0; j < contentSectionTops.length - 1; j++) {
                if(windowScrollTop >= contentSectionTops[j] && windowScrollTop < contentSectionTops[j+1]){
                    d3.selectAll("#navDots .navDot").filter(function(d, i) { return i === j; }).classed("is-selected", true);
                    break;
                }
            }
        }
    }

    function smoothScroll(target) {
        $('body,html').animate(
            {'scrollTop':target.offset().top - 100},
            1000
        );
    }
});