(function () {
    "use strict";

    /**
     * Converts the svg polygon to an array of points
     * @param pointsString
     * @returns {Array}
     */
    var parsePoints = function (pointsString) {
        var points = pointsString.split(' ');
        var parsedPoints = [];

        for (var key in points) {
            if (points.hasOwnProperty(key)) {
                var xy  = points[key].split(',');

                // we don't care about digit after the comma bit more random
                xy[0] = parseInt(xy[0], 10);
                xy[1] = parseInt(xy[1], 10);

                parsedPoints.push(xy);
            }
        }

        return parsedPoints;
    };

    /**
     * Generates a random value
     * @param min
     * @param max
     * @returns {*}
     */
    var randPoint = function(min, max) {
        return Math.floor(Math.random() * (max-min)) + min;
    };

    /**
     * Creates a circle with random coordinates
     * @param width of the space
     * @param height of the space
     * @param radius of the circle
     * @returns {{cx, cy, r: *}}
     */
    var createCircle = function(width, height, radius) {
        return {
            cx : randPoint(0, width),
            cy : randPoint(0, height),
            r: radius
        }
    };

    /**
     * Checks if the given point resides in the polygon
     * ray-casting algorithm based on
     * http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html
     * @param point
     * @param vs polygon as an array of points
     * @returns {boolean}
     */
    var pointInPolygon = function(point, vs) {
        var xi, xj, i, intersect, j, yi, yj,
            x = point.cx,
            y = point.cy,
            inside = false;
        for (i = 0, j = vs.length - 1; i < vs.length; j = i++) {
            xi = vs[i][0],
                yi = vs[i][1],
                xj = vs[j][0],
                yj = vs[j][1],
                intersect = ((yi > y) != (yj > y))
                && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
            if (intersect) inside = !inside;
        }
        return inside;
    };

    /**
     * Checked if a node is colliding with other nodes
     * todo try with quadtree
     * @param node
     * @param nodes
     * @returns {boolean}
     */
    var isColliding = function(node, nodes) {
        for (var j in nodes) {
            if (nodes.hasOwnProperty(j)) {
                if (Math.pow(node.cx - nodes[j].cx, 2) + Math.pow(node.cy - nodes[j].cy, 2) <= Math.pow(node.r + nodes[j].r, 2)) {
                    return true;
                }
            }
        }

        return false;
    };

    // Select the svg element
    var svg = d3.selectAll("svg");

    // Create series of points from our shape
    var polygon = d3.selectAll("polygon");
    var pointsString = polygon.attr("points");
    var lines = parsePoints(pointsString);

    var placedNodes = [];

    var nodes = d3.range(340).map(function(d, i) {
        var color;
        var radius;

        // todo change to mapping with data
        if (i <= 15) {
            color = '#3CB9BB';
            radius = 12;
        }
        else if  (i <= 30) {
            color = '#D03C60';
            radius = 15;
        }
        else if (i <= 60) {
            color = '#618853';
            radius = 14;
        }
        else if (i <= 100) {
            color = '#A072A3';
            radius = 12;
        }
        else if (i <= 140) {
            color = '#A2BB94';
            radius = 11;
        }
        else if (i <= 180) {
            color = '#B2CCA7';
            radius = 11;
        }
        else {
            color = '#C9E1C1';
            radius = 10;
        }

        var collision = false;

        do {
            collision = false;
            var circle = createCircle(800, 800, radius);
            collision = isColliding(circle, placedNodes);
        } while (!pointInPolygon(circle, lines) || collision);

        var node = {
            r: circle.r,
            cx: circle.cx,
            cy: circle.cy,
            color: color
        };

        placedNodes.push(node);

        return node;
    });

    svg.selectAll("circle")
        .data(nodes.slice(1))
        .enter().append("circle")
        .attr("r", function(d) { return d.r; })
        .attr("cx", function(d) { return d.cx; })
        .attr("cy", function(d) { return d.cy; })
        .style("fill", function(d, i) { return d.color });

}($, d3));
