(function() {
    // helper function so we can map over dom selection
    function selectionToArray(selection) {
        var len = selection.length
        var result = []
        for (var i = 0; i < len; i++) {
            result.push(selection[i])
        }
        return result
    }
    function waypoints() {
        // select elements
        var graphicEl = document.querySelector('#graphic')
        var graphicVisEl = graphicEl.querySelector('#vis')
        var triggerEls = selectionToArray(graphicEl.querySelectorAll('.step'))

        // viewport height
        var viewportHeight = window.innerHeight - 51;  // adjust for height of header which is sticky
        var halfViewportHeight = Math.floor(viewportHeight / 2)

        // a global function creates and handles all the vis + updates
        var graphic = createGraphic('.graphic')
        // handle the fixed/static position of grahpic
        var toggle = function(fixed, bottom) {
            if (fixed) graphicVisEl.classList.add('sticky')
            else graphicVisEl.classList.remove('sticky')
            if (bottom) graphicVisEl.classList.add('stickToBottom')
            else graphicVisEl.classList.remove('stickToBottom')
        }

        // setup a waypoint trigger for each trigger element
        var waypoints = triggerEls.map(function(el) {

            // get the step, cast as number
            var step = +el.getAttribute('data-step')
            return new Waypoint({
                element: el, // our trigger element
                handler: function(direction) {
                    // if the direction is down then we use that number,
                    // else, we want to trigger the previous one
                    var nextStep = direction === 'down' ? step : Math.max(0, step - 1)
console.log(step);
                    // tell our graphic to update with a specific step and pass in direction of scroll
                    graphic.update(nextStep, direction)
                },
                offset: '90%',  // trigger halfway up the viewport
            })
        })
        // enter (top) / exit (bottom) graphic (toggle fixed position)
        var enterWaypoint = new Waypoint({
            element: graphicEl,
            handler: function(direction) {
                var fixed = direction === 'down'
                var bottom = false
                toggle(fixed, bottom)
            },
            offset: 51
        })
        var exitWaypoint = new Waypoint({
            element: graphicEl,
            handler: function(direction) {
                var fixed = direction === 'up'
                var bottom = !fixed
                toggle(fixed, bottom)
            },
            offset: 'bottom-in-view', // waypoints convenience instead of a calculation
        })
    }
    waypoints()
})()