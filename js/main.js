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

    /**
     * Create nodes for the given metric
     * @param metric
     * @param placedNodes
     * @param maxX
     * @param maxY
     * @param lines
     * @returns {*}
     */
    var createNodesFromMetric = function(metric, placedNodes, maxX, maxY, lines) {
        var collision = false,
            createdNodes = {}, // nodes need to be an object to preserve unique key
            loops = 0, circle;

        if (!placedNodes) {
            placedNodes = [];
        }

        for (var x = 0 ; x < parseInt(metric.count, 10) ; x++) {
            do {
                loops++;
                collision = false;
                circle = createCircle(maxX, maxY, parseInt(metric.value, 10));
                collision = isColliding(circle, placedNodes);
                if (loops > 1000) {
                    break;
                }
            } while (!pointInPolygon(circle, lines) || collision);
            loops = 0;

            circle.color = metric.color;

            placedNodes.push(circle);
            createdNodes[placedNodes.length] = circle;
        }

        return {
            placedNodes : placedNodes,
            createdNodes : createdNodes
        };
    };

    /**
     * Because we fetch the data initially we need to trick d3 into thinking data was appended
     * @param allData
     * @param requestedData
     * @returns {*}
     */
    var fakeNewData = function (allData, requestedData) {
        for (var key in requestedData) {
            if (requestedData.hasOwnProperty(key)) {
                allData.push(requestedData[key]);
            }
        }

        return allData;
    };

    // Select the svg element
    var svg = d3.selectAll("svg");

    // Create series of points from our shape
    var polygon = d3.selectAll("polygon");
    var pointsString = polygon.attr("points");
    var lines = parsePoints(pointsString);

    d3.json("./data/engagorTeam.json", function(error, json) {
        if (error) return console.warn(error);

        var placedNodes = [],
            allNodes = [],
            nodes = [];

        for (var key in json) {
            if  (json.hasOwnProperty(key)) {
                allNodes = createNodesFromMetric(json[key], placedNodes, 800, 800, lines);
                placedNodes = allNodes.placedNodes;
                nodes[key] = allNodes.createdNodes;
            }
        }

        var treeData = [];
        var loop = 0;

        for (var x in json) {
            window.setTimeout(function () {
                treeData = fakeNewData(treeData, nodes[loop]);

                var circles = svg.selectAll("circle")
                    .data(treeData);
                circles.enter().append("circle")
                    .attr("r", function(d) { return d.r; })
                    .attr("cx", function(d) { return 900 })
                    .attr("cy", function(d) { return 400 - d.r; })
                    .style("fill", function(d) { return d.color })
                    .transition()
                        .delay(function(d, i) { return 100 })
                        .duration(300)
                        .attr('cx', function(d) { return d.cx; })
                        .attr('cy', function(d) { return d.cy; });

                circles.exit();

                loop++;
            }, 1000 * x);
        }
    });
}(d3));
