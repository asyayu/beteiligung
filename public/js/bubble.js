function createResponsiveBubbleMap() {
    const containerBubble = d3.select("#bubblemap");
    const containerWidthBubble = containerBubble.node().clientWidth;
    const containerHeightBubble = containerBubble.node().clientHeight;

    const aspectRatio = 2.2;
    const widthBubble = containerWidthBubble;
    const heightBubble = containerWidthBubble / aspectRatio;

    containerBubble.select("svg").remove();

    const svgBubbles = containerBubble.append("svg")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("viewBox", `0 0 ${widthBubble} ${heightBubble}`)
        .attr("preserveAspectRatio", "xMidYMid meet")
        .attr("class", "bubble");

    const bubble = d3.pack()
        .size([heightBubble, heightBubble - 5])
        .padding(3);

    function processParticipationData(data) {
        var newParticipationDataset = data.map(d => ({
            name: d.beteiligung,
            className: d.beteiligung.toLocaleLowerCase().replace(/\s/g, ''),
            size: d.value
        }));
        return { children: newParticipationDataset };
    }

    function updateBubbles(data) {
        var root = d3.hierarchy(processParticipationData(data))
            .sum(function (d) { return d.size; });

        var nodes = bubble(root).leaves();

        const scaleX = widthBubble / heightBubble;
        const scaleY = heightBubble / heightBubble;

        const spacingFactor = 1;

        const radiusScalingFactor = 1.5;

        var circles = svgBubbles.selectAll('circle')
            .data(nodes, function (d) { return d.data.name; });

        circles.transition()
            .duration(1000)
            .attr('transform', function (d) {
                const x = d.x * scaleX * spacingFactor;
                const y = d.y * scaleY * spacingFactor;
                return 'translate(' + x + ',' + y + ')';
            })
            .attr('r', function (d) {
                return d.r * Math.min(scaleX, scaleY) * radiusScalingFactor;
            });

        circles.enter().append('circle')
            .attr('transform', function (d) {
                const x = d.x * scaleX * spacingFactor;
                const y = d.y * scaleY * spacingFactor;
                return 'translate(' + x + ',' + y + ')';
            })
            .attr('r', function (d) {
                return d.r * Math.min(scaleX, scaleY) * radiusScalingFactor;
            })
            .attr('class', function (d) { return d.data.className; })
            .style('opacity', 0)
            .transition()
            .duration(1200)
            .style('opacity', 1);

        circles.exit()
            .transition()
            .duration(1000)
            .style('opacity', 0)
            .remove();


        var labels = svgBubbles.selectAll('text')
            .data(nodes, function (d) { return d.data.name; });

        const totalResponses = d3.sum(data, d => d.value);

        labels.transition()
            .duration(1000)
            .attr('transform', function (d) {
                const x = d.x * scaleX * spacingFactor;
                const y = d.y * scaleY * spacingFactor;
                return 'translate(' + x + ',' + y + ')';
            })
            .text(function (d) {
                const percentage = ((d.data.size / totalResponses) * 100).toFixed(0);
                return `${d.data.name} (${percentage}%)`;
            });

        labels.enter().append('text')
            .attr('transform', function (d) {
                const x = d.x * scaleX * spacingFactor;
                const y = d.y * scaleY * spacingFactor;
                return 'translate(' + x + ',' + y + ')';
            })
            .attr('class', 'bubble-text')
            .text(function (d) {
                const percentage = ((d.data.size / totalResponses) * 100).toFixed(0);
                return `${d.data.name} (${percentage}%)`;
            })
            .style('opacity', 0)
            .transition()
            .duration(1200)
            .style('opacity', 1);

        labels.exit()
            .transition()
            .duration(1000)
            .style('opacity', 0)
            .remove();
    }

    return updateBubbles;
}

const updateBubbleMap = createResponsiveBubbleMap();
