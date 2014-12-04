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

                xy[0] = parseFloat(xy[0], 10);
                xy[1] = parseFloat(xy[1], 10);

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
    var randPoint = function(min, max, factor) {
        var rnd = Math.floor(Math.random() * (max-min)) + min;

        if (factor) {
            if (factor < max) {
                rnd -= Math.random() * factor + factor;
            }
        }

        return rnd;
    };

    /**
     * Creates a circle with random coordinates
     * @param width of the space
     * @param height of the space
     * @param radius of the circle
     * @returns {{cx, cy, r: *}}
     */
    var createCircle = function(minWidth, minHeight, width, height, radius) {
        return {
            cx : randPoint(minWidth, width),
            cy : randPoint(minHeight, height, radius),
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
    var createNodesFromMetric = function(metric, placedNodes, minX, minY, maxX, maxY, lines) {
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
                circle = createCircle(minX, minY, maxX, maxY, parseInt(metric.value, 10));
                collision = isColliding(circle, placedNodes);
                if (loops > 1500) {
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
    var box = svg.node().getBBox();

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
                allNodes = createNodesFromMetric(json[key], placedNodes, box.x, box.y, box.width + box.x, box.height + box.y, lines);
                placedNodes = allNodes.placedNodes;
                nodes[key] = allNodes.createdNodes;
            }
        }

        var treeData = [];
        window.addEventListener('nextSet', function (e) {
            var countBefore = treeData.length;
            treeData = fakeNewData(treeData, nodes[e.detail]);
            var circles = svg.selectAll("circle")
                .data(treeData);
            circles.enter().append("circle")
                .attr("r", function(d) { return d.r; })
                .attr("cx", function(d) { return 500 + d.r })
                .attr("cy", function(d) { return 275 - d.r; })
                .style("fill", function(d) { return d.color })
                .transition()
                .delay(function(d, i) { return (i - countBefore) * 100 })
                .duration(900)
                .attr('cx', function(d) { return d.cx; })
                .attr('cy', function(d) { return d.cy; });

            circles.exit();
        }, false);
    });
}(d3));
