////////////// RESPONSIVE MAP //////////////

function createResponsiveChoroplethMap() {
    const containerMap = d3.select("#map");

    const containerWidthMap = containerMap.node().clientWidth;
    const containerHeightMap = containerMap.node().clientHeight;

    const mapSize = Math.min(containerWidthMap, containerHeightMap);

    containerMap.select("svg").remove();

    const svgMap = containerMap.append("svg")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("viewBox", `0 0 ${containerWidthMap} ${containerHeightMap}`)
        .attr("preserveAspectRatio", "xMidYMid meet")
        .classed("svg-content-responsive", true);

    const projectionMap = d3.geoMercator()
        .scale(89900 * (mapSize / 470))
        .center([13.7583, 51.0704])
        .translate([containerWidthMap / 2, containerHeightMap / 2]);

    const pathMap = d3.geoPath().projection(projectionMap);

    const dataMap = d3.map();

    fetch('/stb_dd.json')
        .then(response => response.json())
        .then(topo => {
            ready(null, topo);
        })
        .catch(error => {
            console.error('Error fetching the GeoJSON file:', error);
        });

    let colorScaleMap = d3.scaleSequential(d3.interpolateViridis);

    function ready(error, topo) {
        if (error) throw error;

        const stadtbezirke = svgMap.append("g")
            .attr("class", "dresden")
            .selectAll("path")
            .data(topo.features)
            .enter()
            .append("g");

        stadtbezirke.append("path")
            .attr("d", pathMap)
            .attr("data-name", function (d) {
                return d.properties.bez;
            })
            .attr("fill", function (d) {
                d.total = dataMap.get(d.id) || 0;
                return colorScaleMap(d.total);
            })
            .style("stroke", "white")
            .attr("class", "Stadtbezirk")
            .attr("id", function (d) {
                return d.properties.bez;
            })
            .style("opacity", 1);

        stadtbezirke.append("text")
            .attr("class", "label")
            .attr("x", function (d) {
                return pathMap.centroid(d)[0];
            })
            .attr("y", function (d) {
                return pathMap.centroid(d)[1];
            })
            .attr("dy", ".35em")
            .text(function (d) {
                return dataMap.get(d.id) || 0;
            })
            .style("fill", "black")
            .style("font-size", "12px")
            .style("text-anchor", "middle");
    }

    return function updateMap(mapData) {
        dataMap.each(function (value, key) {
            dataMap.set(key, 0);
        });

        mapData.forEach(function (d) {
            dataMap.set(d.stadtbezirk, +d.visitor_count);
        });

        const extent = d3.extent(mapData, d => +d.visitor_count);

        colorScaleMap.domain(extent);

        svgMap.selectAll("path.Stadtbezirk")
            .transition()
            .duration(750)
            .attr("fill", function (d) {
                d.total = dataMap.get(d.id) || 0;
                return colorScaleMap(d.total);
            });

        svgMap.selectAll(".label")
            .transition()
            .duration(750)
            .attr("x", function (d) {
                return pathMap.centroid(d)[0];
            })
            .attr("y", function (d) {
                return pathMap.centroid(d)[1];
            })
            .text(function (d) {
                return dataMap.get(d.id) || 0;
            });
    };
}

const updateDDMap = createResponsiveChoroplethMap();

