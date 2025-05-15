function createResponsivePieChart() {
    const containerPie = d3.select("#pieChart");

    const containerWidthPie = containerPie.node().clientWidth;
    const containerHeightPie = containerPie.node().clientHeight;

    const radiusPie = Math.min(containerWidthPie, containerHeightPie) / 2;

    containerPie.select("svg").remove();

    const svgPie = containerPie.append("svg")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("viewBox", `0 0 ${containerWidthPie} ${containerHeightPie}`)
        .attr("preserveAspectRatio", "xMidYMid meet")
        .classed("svg-content-responsive", true);

    const gPie = svgPie.append("g")
        .attr("transform", `translate(${containerWidthPie / 2 - 80},${containerHeightPie / 2})`);

    const color = d3.scaleOrdinal()
        .range(["#ffea00", "#F4D60D", "#DC911B", "#CA4F1C", "#85170F", "#A2C037", "#839B2E", "#4C6047", "#3C3F36", "#2296CF"]);

    const pie = d3.pie().value(d => d.value);

    const arc = d3.arc()
        .outerRadius(radiusPie - 10)
        .innerRadius(60);

    const labelArc = d3.arc()
        .outerRadius(radiusPie - 40)
        .innerRadius(radiusPie - 40);

    function addLegend(data) {
        const legend = svgPie.selectAll(".legend-item")
            .data(data, d => d.kanal);

        legend.exit()
            .transition()
            .duration(500)
            .style("opacity", 0)
            .remove();

        const newLegendItems = legend.enter()
            .append("g")
            .attr("class", "legend-item")
            .attr("transform", (d, i) => `translate(${containerWidthPie / 2 + radiusPie}, ${i * 25 + 20})`)
            .style("opacity", 0);

        newLegendItems.append("rect")
            .attr("width", 18)
            .attr("height", 18)
            .style("fill", d => color(d.kanal));

        newLegendItems.append("svg:image")
            .attr("xlink:href", d => `img/${d.kanal}.svg`)
            .attr("width", 18)
            .attr("height", 18)
            .attr("x", 0)
            .attr("y", 0)
            .attr("filter", "invert(100%)");

        newLegendItems.append("text")
            .attr("x", 24)
            .attr("y", 9)
            .attr("dy", "0.35em")
            .text(d => d.kanal)
            .style("font-size", "1rem")
            .style("text-anchor", "start");

        newLegendItems.transition()
            .duration(500)
            .style("opacity", 1);

        legend.transition()
            .duration(500)
            .attr("transform", (d, i) => `translate(${containerWidthPie / 2 + radiusPie}, ${i * 25 + 20})`);
    }

    function updatePie(data) {
        const pieData = pie(data);

        const arcs = gPie.selectAll(".arc")
            .data(pieData, d => d.data.kanal);

        arcs.exit().remove();

        const newArcs = arcs.enter().append("g")
            .attr("class", "arc");

        newArcs.append("path")
            .attr("d", arc)
            .style("fill", d => color(d.data.kanal))
            .each(function (d) { this._current = d; })
            .merge(arcs.select("path"))
            .transition()
            .duration(750)
            .attrTween("d", function (d) {
                const i = d3.interpolate(this._current, d);
                this._current = i(0);
                return t => arc(i(t));
            });


        const totalResponses = d3.sum(data, d => d.value);

        arcs.select("text.pie-label").remove();


        gPie.selectAll("g.icon-percentage").remove();

        const labelGroups = gPie.selectAll("g.icon-percentage")
            .data(pieData, d => d.data.kanal)
            .enter()
            .append("g")
            .attr("class", "icon-percentage")
            .attr("transform", d => {
                const [x, y] = labelArc.centroid(d);
                return `translate(${x},${y})`;
            });

        labelGroups.append("svg:image")
            .attr("xlink:href", d => `img/${d.data.kanal}.svg`)
            .attr("width", d => (d.endAngle - d.startAngle) < 0.2 ? 16 : 24)
            .attr("height", d => (d.endAngle - d.startAngle) < 0.2 ? 16 : 24)
            .attr("x", d => ((d.endAngle - d.startAngle) < 0.2 ? -8 : -12))
            .attr("y", d => ((d.endAngle - d.startAngle) < 0.2 ? -20 : -24))
            .attr("filter", "invert(100%)");

        labelGroups.append("text")
            .attr("y", d => ((d.endAngle - d.startAngle) < 0.2 ? 10 : 14))
            .attr("text-anchor", "middle")
            .style("font-size", "0.8rem")
            .style("fill", "#fff")
            .text(d => `${((d.data.value / totalResponses) * 100).toFixed(0)}%`);


        addLegend(data);
    }

    return updatePie;
}

const updatePieChart = createResponsivePieChart();
