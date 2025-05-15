function createResponsiveBarChart() {
    const container = d3.select("#my_dataviz");

    const containerWidth = container.node().clientWidth;
    const containerHeight = container.node().clientHeight;

    const marginBar = {
        top: containerHeight * 0.1,
        right: containerWidth * 0.1,
        bottom: containerHeight * 0.175,
        left: containerWidth * 0.1
    };

    const widthBar = containerWidth - marginBar.left - marginBar.right;
    const heightBar = containerHeight - marginBar.top - marginBar.bottom;

    container.select("svg").remove();

    const svgBar = container
        .append("svg")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("viewBox", `0 0 ${containerWidth} ${containerHeight}`);
    // .attr("preserveAspectRatio", "none")
    // .classed("svg-content-responsive", true);

    const gBar = svgBar.append("g")
        .attr("transform", `translate(${marginBar.left},${marginBar.top})`);

    gBar.append("text")
        .attr("text-anchor", "middle")
        .attr("x", widthBar / 2)
        .attr("y", heightBar + marginBar.bottom * 0.8)
        .text("Weg")
        .style("fill", "black")
        .style("font-family", "Source Sans 3");

    gBar.append("text")
        .attr("text-anchor", "middle")
        .attr("transform", `rotate(-90)`)
        .attr("x", -heightBar / 2)
        .attr("y", -marginBar.left * 0.4)
        .text("Anzahl")
        .style("fill", "black")
        .style("font-family", "Source Sans 3");

    const xBar = d3.scaleBand().range([0, widthBar]).padding(0.2);
    const yBar = d3.scaleLinear().range([heightBar, 0]);

    const xAxisBar = gBar.append("g")
        .attr("class", "axis axis-x")
        .attr("transform", `translate(0,${heightBar})`);

    const yAxisBar = gBar.append("g")
        .attr("class", "axis axis-y");

    function updateBarplot(data) {
        xBar.domain(data.map(d => d.erreichen_in_zukunft));
        yBar.domain([0, d3.max(data, d => d.value)]);

        xAxisBar.transition()
            .duration(750)
            .call(d3.axisBottom(xBar));

        yAxisBar.transition()
            .duration(1000)
            .call(d3.axisLeft(yBar)
                //.tickValues([0, d3.max(data, d => d.value)]) 
                .tickValues(
                    d3.max(data, d => d.value) >= 5
                        ? d3.range(0, d3.max(data, d => d.value) + 1, d3.max(data, d => d.value) / 4)
                        : [0, d3.max(data, d => d.value)]
                )
                .tickFormat(d3.format("d"))
            );

        const bars = gBar.selectAll(".bar")
            .data(data, d => d.erreichen_in_zukunft);

        bars.exit().remove();

        bars.enter().append("rect")
            .attr("class", "bar")
            .attr("x", d => xBar(d.erreichen_in_zukunft))
            .attr("width", xBar.bandwidth())
            .attr("y", heightBar)
            .attr("height", 0)
            .attr("fill", "#ffea00")
            .attr('border', 'solid 1px ')
            .merge(bars)
            .transition()
            .duration(750)
            .attr("x", d => xBar(d.erreichen_in_zukunft))
            .attr("width", xBar.bandwidth())
            .attr("y", d => yBar(d.value))
            .attr("height", d => heightBar - yBar(d.value));
    }

    return updateBarplot;
}

const updateBarplot = createResponsiveBarChart();
