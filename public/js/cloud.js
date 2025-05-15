function wordCloud(selector) {
    var fill = d3.scaleOrdinal()
        .range(["#F4D60D", "#DC911B", "#CA4F1C", "#85170F", "#A2C037", "#839B2E", "#4C6047",
            "#3C3F36", "#83BEEB", "#2296CF"
        ]);

    function getContainerDimensions() {
        var container = d3.select(selector);
        var width = container.node().clientWidth;
        var height = container.node().clientHeight;
        return { width: width, height: height };
    }

    function createSvg(containerWidth, containerHeight) {
        var svg = d3.select(selector).append("svg")
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("viewBox", `0 0 ${containerWidth} ${containerHeight}`)
            .attr("preserveAspectRatio", "xMidYMid meet")
            .append("g")
            .attr("transform", `translate(${containerWidth / 2}, ${containerHeight / 2})`);

        return svg;
    }

    function draw(svg, data) {
        var cloud = svg.selectAll("g text")
            .data(data, function (d) { return d.text; });

        cloud.enter()
            .append("text")
            .style("font-family", "Source Sans 3")
            .style("font-weight", 900)
            .style("fill", function (d, i) { return fill(i); })
            .attr("text-anchor", "middle")
            .attr('font-size', 2)
            .text(function (d) { return d.text; })
            .merge(cloud)
            .transition()
            .duration(600)
            .attr("transform", function (d) {
                return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
            })
            .style("font-size", function (d) { return d.size + "px"; })
            .style("fill-opacity", 1)
            .text(function (d) { return d.text; });

        cloud.transition()
            .duration(600)
            .style("font-size", function (d) { return d.size + "px"; })
            .attr("transform", function (d) {
                return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
            })
            .style("fill-opacity", 1);

        cloud.exit()
            .transition()
            .duration(200)
            .style('fill-opacity', 1e-6)
            .attr('font-size', 50)
            .remove();
    }

    return {
        update: function (data) {
            var { width, height } = getContainerDimensions();

            d3.select(selector).select("svg").remove();

            var svg = createSvg(width, height);

            d3.layout.cloud()
                .size([width, height])
                .words(data)
                .padding(5)
                .rotate(function () {
                    return (Math.floor(Math.random() * 3) - 1) * 5;
                })
                .fontSize(function (d) { return d.size; })
                .on("end", function (words) { draw(svg, words); })
                .start();
        }
    };
}

function prepareWords(words) {
    var minSize = 20;
    var maxSize = 35;
    var minFreq = d3.min(words, d => d.value);
    var maxFreq = d3.max(words, d => d.value);

    var sizeScale = d3.scaleLinear()
        .domain([minFreq, maxFreq])
        .range([minSize, maxSize]);

    const totalWords = d3.sum(words, d => d.value);

    return words.map(function (d) {
        const percentage = ((d.value / totalWords) * 100).toFixed(0);
        return {
            text: `${d.beteiligungsformat} (${percentage}%)`,
            size: sizeScale(d.value)
        };
    });

}

var myWordCloud = wordCloud('#wordCloud');

