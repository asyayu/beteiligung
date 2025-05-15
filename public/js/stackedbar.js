function createResponsiveStackedBarChart() {
    const container = d3.select("#stackedBar");

    const containerWidth = container.node().clientWidth * 5;
    const containerHeight = container.node().clientHeight * 5;

    const marginBar = {
        top: containerHeight * 0.1,
        right: containerWidth * 0.06,
        bottom: containerHeight * 0.15,
        left: containerWidth * 0.06
    };

    const widthBar = containerWidth - marginBar.left - marginBar.right;
    const heightBar = containerHeight - marginBar.top - marginBar.bottom;

    container.select("svg").remove();

    const svgBar = container.append("svg")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("viewBox", `0 0 ${containerWidth} ${containerHeight}`);

    const gBar = svgBar.append("g")
        .attr("id", "stackedBarGroup")
        .attr("transform", `translate(${marginBar.left},${marginBar.top})`);

    const xBar = d3.scaleLinear()
        .range([0, widthBar]);

    const yBar = d3.scaleBand()
        .domain(["total"])
        .range([0, heightBar / 1 - 70])
        .padding(0.2);

    const xAxisBar = gBar.append("g")
        .attr("class", "axis axis-x")
        .attr("transform", `translate(0,${heightBar})`);

    const yAxisBar = gBar.append("g")
        .attr("class", "axis axis-y");

    function updateStackedBar(data) {
        let formattedData = { analog: 0, digital: 0 };

        data.forEach(d => {
            if (d.type === "analog") {
                formattedData.analog = d.value;
            } else if (d.type === "digital") {
                formattedData.digital = d.value;
            }
        });

        const totalValue = formattedData.analog + formattedData.digital;

        xBar.domain([0, totalValue]);

        const stack = d3.stack()
            .keys(["digital", "analog"])
            .value((d, key) => d[key] || 0);

        const stackedData = stack([formattedData]);

        const colorScale = d3.scaleOrdinal()
            .domain(["digital", "analog"])
            .range(["#f4d60d", "#2296cf"]);

        xAxisBar.style("display", "none");

        const bars = gBar.selectAll(".bar")
            .data(stackedData, d => d.key);

        bars.enter().append("rect")
            .attr("class", "bar")
            .attr("y", yBar("total"))
            .attr("height", yBar.bandwidth())
            .attr("x", 0)
            .attr("width", 0)
            .attr("fill", d => colorScale(d.key))
            .merge(bars)
            .transition()
            .duration(750)
            .attr("x", d => xBar(d[0][0]))
            .attr("width", d => xBar(d[0][1]) - xBar(d[0][0]));

        gBar.selectAll(".bar-label").remove();

        gBar.selectAll(".bar-label")
            .data(stackedData, d => d.key)
            .enter().append("text")
            .attr("class", "bar-label")
            .attr("text-anchor", "middle")
            .attr("alignment-baseline", "middle")
            .style("fill", "#fff")
            .style("font-size", "7rem")
            .attr("x", d => {
                const startX = xBar(d[0][0]);
                const endX = xBar(d[0][1]);
                return (startX + endX) / 2;
            })
            .attr("y", yBar("total") + (yBar.bandwidth() / 2))
            .text(d => {
                const value = d[0][1] - d[0][0];
                const percentage = ((value / totalValue) * 100).toFixed(0);
                return `${d.key} (${percentage}%)`;
            });

        bars.exit().transition().duration(500).attr("width", 0).remove();
    }

    return updateStackedBar;
}

const updateStackedBar = createResponsiveStackedBarChart();
