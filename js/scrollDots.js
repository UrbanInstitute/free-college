// code modified from: https://github.com/CodyHouse/vertical-fixed-navigation
$(document).ready(function($){
    var contentSections = $('.navDotStep'),
        navigationItems = $('#navDots a');

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
        contentSections.each(function(){
            $this = $(this);
            var activeSection = $this.attr('id');

            // if element appears 10% up the window (when the scrollytelling step is triggered) and bottom of the element is below the top of the screen, make its dot active
            if (($this.offset().top - $(window).height()*0.9 < $(window).scrollTop()) && ($this.offset().top + $this.height() - $(window).height()*0.9 > $(window).scrollTop())) {
                d3.selectAll("#navDots .navDot").classed("is-selected", false);
                d3.select("#navDots a[href='#" + activeSection + "'] .navDot").classed("is-selected", true);
            }
        });
    }

    function smoothScroll(target) {
        $('body,html').animate(
            {'scrollTop':target.offset().top - 100},
            1000
        );
    }
});