(function () {
    "use strict";

    var parsePoints = function (pointsString) {
        var points = pointsString.split(' ');
        var parsedPoints = [];

        for (var key in points) {
            var xy  = points[key].split(',');

            // we don't care about digit after the comma bit more random
            xy[0] = parseInt(xy[0], 10);
            xy[1] = parseInt(xy[1], 10);

            parsedPoints.push(xy);
        }

        return parsedPoints;
    };

    var randPoint = function(min, max) {
        return Math.floor(Math.random() * (max-min)) + min;
    };

    var randCircleCoordinate = function(width, height, radius) {
        return {
            x : randPoint(105, 720),
            y : randPoint(0, height),
            radius: radius
        }
    };

    var pointInPolygon = function(point, vs) {
        // ray-casting algorithm based on
        // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html
        var xi, xj, i, intersect, j, yi, yj,
            x = point.x,
            y = point.y,
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

    // todo try with quadtree
    var isColliding = function(node, nodes) {
        for (var j in nodes) {
            if (Math.pow(node.x - nodes[j].x, 2) + Math.pow(node.y - nodes[j].y, 2) <= Math.pow(node.radius + nodes[j].radius, 2)) {
                return true;
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

    console.log(pointInPolygon({
        x: 256,
        y: 767
    }, lines));

    var nodes = d3.range(350).map(function(d, i) {
        var color;
        var radius;

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
            var cor = randCircleCoordinate(800, 800, radius);
            collision = isColliding(cor, placedNodes);
        } while (!pointInPolygon(cor, lines) || collision);

        var node = {
            radius: cor.radius,
            x: cor.x,
            y: cor.y,
            color: color
        };

        placedNodes.push(node);

        return node;
    });

    svg.selectAll("circle")
        .data(nodes.slice(1))
        .enter().append("circle")
        .attr("r", function(d) { return d.radius; })
        .attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; })
        .style("fill", function(d, i) { return d.color });

}($, d3));
