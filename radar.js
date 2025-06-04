// radar.js

// Create radar chart with average features
function drawRadarChart(avgData) {
  const features = ["Danceability", "Energy", "Valence", "Acousticness", "Speechiness"];
  const width = 400;
  const height = 400;
  const radius = Math.min(width / 2, height / 2) - 40;
  const levels = 5;

  d3.select("#radar-chart").html("");

  const svg = d3.select("#radar-chart")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", `translate(${width / 2},${height / 2})`);

  // Draw levels
  for (let i = 0; i < levels; i++) {
    const r = ((i + 1) / levels) * radius;
    svg.append("polygon")
      .attr("points", features.map((_, j) => {
        const angle = (Math.PI * 2 * j) / features.length;
        return [Math.cos(angle) * r, Math.sin(angle) * r].join(",");
      }).join(" "))
      .attr("stroke", "#555")
      .attr("fill", "none")
      .attr("stroke-width", 0.5);
  }

  // Draw axes
  features.forEach((f, i) => {
    const angle = (Math.PI * 2 * i) / features.length;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    svg.append("line")
      .attr("x1", 0).attr("y1", 0)
      .attr("x2", x).attr("y2", y)
      .attr("stroke", "#aaa")
      .attr("stroke-width", 0.7);
    svg.append("text")
      .attr("x", x * 1.1)
      .attr("y", y * 1.1)
      .attr("text-anchor", "middle")
      .attr("font-size", "11px")
      .attr("fill", "#ccc")
      .text(f);
  });

  // Draw user profile shape
  const line = d3.lineRadial()
    .radius((d, i) => d * radius)
    .angle((d, i) => (Math.PI * 2 * i) / avgData.length)
    .curve(d3.curveCardinalClosed);

  svg.append("path")
    .datum(avgData)
    .attr("d", line)
    .attr("fill", "#a259ff")
    .attr("fill-opacity", 0.4)
    .attr("stroke", "#a259ff")
    .attr("stroke-width", 2);



    // radar.js

// Function to create radar chart from selected song features
function generateRadarChart(containerId, featureAverages) {
  const features = ["danceability", "energy", "valence", "acousticness", "speechiness"];
  const data = features.map(f => ({ axis: f, value: featureAverages[f] || 0 }));

  const width = 400;
  const height = 400;
  const radius = Math.min(width, height) / 2 - 40;
  const levels = 5;

  // Remove existing svg if any
  d3.select(`#${containerId}`).select("svg").remove();

  const svg = d3.select(`#${containerId}`)
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", `translate(${width / 2},${height / 2})`);

  // Scale for radius
  const rScale = d3.scaleLinear()
    .domain([0, 1])
    .range([0, radius]);

  // Create levels
  for (let i = 0; i <= levels; i++) {
    const levelFactor = radius * (i / levels);
    svg.selectAll(".levels")
      .data(features)
      .enter()
      .append("line")
      .attr("x1", (d, j) => levelFactor * Math.cos(2 * Math.PI * j / features.length - Math.PI / 2))
      .attr("y1", (d, j) => levelFactor * Math.sin(2 * Math.PI * j / features.length - Math.PI / 2))
      .attr("x2", (d, j) => levelFactor * Math.cos(2 * Math.PI * (j + 1) / features.length - Math.PI / 2))
      .attr("y2", (d, j) => levelFactor * Math.sin(2 * Math.PI * (j + 1) / features.length - Math.PI / 2))
      .attr("stroke", "gray")
      .attr("stroke-width", "0.5px");
  }

  // Axis lines
  const axis = svg.selectAll(".axis")
    .data(features)
    .enter()
    .append("g")
    .attr("class", "axis");

  axis.append("line")
    .attr("x1", 0)
    .attr("y1", 0)
    .attr("x2", (d, i) => rScale(1.1) * Math.cos(2 * Math.PI * i / features.length - Math.PI / 2))
    .attr("y2", (d, i) => rScale(1.1) * Math.sin(2 * Math.PI * i / features.length - Math.PI / 2))
    .attr("stroke", "#999");

  axis.append("text")
    .attr("x", (d, i) => rScale(1.2) * Math.cos(2 * Math.PI * i / features.length - Math.PI / 2))
    .attr("y", (d, i) => rScale(1.2) * Math.sin(2 * Math.PI * i / features.length - Math.PI / 2))
    .text(d => d)
    .style("font-size", "11px")
    .style("text-anchor", "middle");

  // Radar shape
  const line = d3.lineRadial()
    .radius(d => rScale(d.value))
    .angle((d, i) => i * 2 * Math.PI / features.length);

  svg.append("path")
    .datum(data)
    .attr("d", line)
    .attr("fill", "#69b3a2")
    .attr("stroke", "#2c7")
    .attr("stroke-width", 2)
    .attr("fill-opacity", 0.5);
}

}
