// // violin.js

// const violinMargin = { top: 30, right: 40, bottom: 50, left: 60 };
// const violinWidth = 800 - violinMargin.left - violinMargin.right;
// const violinHeight = 400 - violinMargin.top - violinMargin.bottom;

// const svgViolin = d3
//   .select("#violinPlot")
//   .append("svg")
//   .attr("width", violinWidth + violinMargin.left + violinMargin.right)
//   .attr("height", violinHeight + violinMargin.top + violinMargin.bottom)
//   .append("g")
//   .attr("transform", `translate(${violinMargin.left},${violinMargin.top})`);


// // Legend container
// const legendContainer = d3
//   .select("#violinPlot")
//   .append("div")
//   .attr("class", "violin-legend")
//   .style("position", "absolute")
//   .style("top", "40px")
//   .style("right", "40px")
//   .style("background", "rgba(0, 0, 0, 0.7)")
//   .style("padding", "10px 12px")
//   .style("border-radius", "6px")
//   .style("color", "white")
//   .style("font-size", "12px")
//   .style("line-height", "1.5em")
//   .style("z-index", "10");

// legendContainer.html(`
//   <div><svg width="12" height="12"><line x1="0" x2="12" y1="6" y2="6" stroke="white" stroke-width="2" stroke-dasharray="4,2"/></svg> Mean</div>
//   <div><svg width="12" height="12"><line x1="0" x2="12" y1="6" y2="6" stroke="#ccc" stroke-width="2" stroke-dasharray="2,2"/></svg> Median</div>
// `);


// const tooltipViolin = d3.select("#violin-tooltip");


// const violinFeatureSelect = document.getElementById("violinFeatureSelect");
// const violinCSV = "unique_songs.csv";

// d3.csv(violinCSV).then((rawData) => {
//   const parsedData = rawData.map((d) => ({
//   is_billboard: String(d.is_billboard || "").toLowerCase() === "true",
//   danceability: +d.danceability,
//   energy: +d.energy,
//   valence: +d.valence,
//   acousticness: +d.acousticness,
//   speechiness: +d.speechiness,
// }));


//   drawViolin("danceability");

//   violinFeatureSelect.addEventListener("change", (e) => {
//     drawViolin(e.target.value);
//   });

//   function drawViolin(feature) {
//   const groups = ["Billboard", "Non-Billboard"];
//   const grouped = {
//     Billboard: parsedData.filter((d) => d.is_billboard).map((d) => d[feature]),
//     "Non-Billboard": parsedData.filter((d) => !d.is_billboard).map((d) => d[feature]),
//   };

//   const x = d3.scaleBand().domain(groups).range([0, violinWidth]).padding(0.4);
//   const y = d3.scaleLinear().domain([0, 1]).nice().range([violinHeight, 0]);

//   const kde = kernelDensityEstimator(kernelEpanechnikov(0.05), y.ticks(40));

//   const transition = d3.transition().duration(800).ease(d3.easeCubicOut);

//   // Clear everything if it's the first render
//   if (svgViolin.selectAll(".axis").empty()) {
//     svgViolin.append("g")
//       .attr("class", "x-axis axis")
//       .attr("transform", `translate(0,${violinHeight})`)
//       .call(d3.axisBottom(x));

//     svgViolin.append("g")
//       .attr("class", "y-axis axis")
//       .call(d3.axisLeft(y));
//   } else {
//     svgViolin.select(".x-axis").transition(transition).call(d3.axisBottom(x));
//     svgViolin.select(".y-axis").transition(transition).call(d3.axisLeft(y));
//   }

//   // Bind data
//   const violinGroups = svgViolin.selectAll(".violin-group").data(groups);

//   // ENTER + UPDATE
//   violinGroups.enter()
//     .append("g")
//     .attr("class", "violin-group")
//     .merge(violinGroups)
//     .each(function (group) {
//       const values = grouped[group];
//       const density = kde(values);
//       const area = d3.area()
//         .curve(d3.curveCatmullRom)
//         .x0((d) => x(group) + x.bandwidth() / 2 - d[1] * 50)
//         .x1((d) => x(group) + x.bandwidth() / 2 + d[1] * 50)
//         .y((d) => y(d[0]));

//       // AREA PATH
//       let path = d3.select(this).selectAll(".violin-path").data([density]);

//       path.enter()
//         .append("path")
//         .attr("class", "violin-path")
//         .attr("fill", group === "Billboard" ? "#00ff99" : "#ff3399")
//         .attr("stroke", "#ccc")
//         .attr("opacity", 0.8)
//         .merge(path)
//         .transition(transition)
//         .attr("d", area);

//       // MEAN LINE
//       let meanLine = d3.select(this).selectAll(".mean-line").data([d3.mean(values)]);
//         meanLine.enter()
//             .append("line")
//             .attr("class", "mean-line")
//             .attr("stroke", "white")
//             .attr("stroke-width", 2)
//             .attr("stroke-dasharray", "4,2")
//             .on("mouseover", (event, d) => {
//                 tooltipViolin
//                 .style("opacity", 1)
//                 // .html(`<strong>Mean:</strong> ${d.toFixed(3)}`);
//                 .html(`<strong>Mean:</strong> ${d !== undefined ? d.toFixed(3) : "N/A"}`);

//             })
//             .on("mousemove", (event) => {
//                 tooltipViolin
//                 .style("left", `${event.pageX + 12}px`)
//                 .style("top", `${event.pageY - 20}px`);
//             })
//             .on("mouseout", () => {
//                 tooltipViolin.style("opacity", 0);
//             })
//             .merge(meanLine)
//             .transition(transition)
//             .attr("x1", x(group))
//             .attr("x2", x(group) + x.bandwidth())
//             .attr("y1", d => y(d))
//             .attr("y2", d => y(d));


//       // MEDIAN LINE
//       let medianLine = d3.select(this).selectAll(".median-line").data([d3.median(values)]);
//       medianLine.enter()
//   .append("line")
//   .attr("class", "median-line")
//   .attr("stroke", "#cccccc")
//   .attr("stroke-width", 1.5)
//   .attr("stroke-dasharray", "2,2")
//   .on("mouseover", (event, d) => {
//     tooltipViolin
//       .style("opacity", 1)
//       // .html(`<strong>Median:</strong> ${d.toFixed(3)}`);
//       .html(`<strong>Mean:</strong> ${d !== undefined ? d.toFixed(3) : "N/A"}`);

//   })
//   .on("mousemove", (event) => {
//     tooltipViolin
//       .style("left", `${event.pageX + 12}px`)
//       .style("top", `${event.pageY - 20}px`);
//   })
//   .on("mouseout", () => {
//     tooltipViolin.style("opacity", 0);
//   })
//   .merge(medianLine)
//   .transition(transition)
//   .attr("x1", x(group))
//   .attr("x2", x(group) + x.bandwidth())
//   .attr("y1", d => y(d))
//   .attr("y2", d => y(d));

//     });

//   // CLEAN UP
//   violinGroups.exit().remove();

//   // KDE helper functions
//   function kernelDensityEstimator(kernel, X) {
//     return function (V) {
//       return X.map(function (x) {
//         return [x, d3.mean(V, function (v) { return kernel(x - v); })];
//       });
//     };
//   }

//   function kernelEpanechnikov(k) {
//     return function (v) {
//       return Math.abs(v /= k) <= 1 ? (0.75 * (1 - v * v)) / k : 0;
//     };
//   }
// }


// });

// violin.js

const violinMargin = { top: 30, right: 40, bottom: 50, left: 60 };
const violinWidth = 800 - violinMargin.left - violinMargin.right;
const violinHeight = 400 - violinMargin.top - violinMargin.bottom;

const svgViolin = d3
  .select("#violinPlot")
  .append("svg")
  .attr("width", violinWidth + violinMargin.left + violinMargin.right)
  .attr("height", violinHeight + violinMargin.top + violinMargin.bottom)
  .append("g")
  .attr("transform", `translate(${violinMargin.left},${violinMargin.top})`);

const legendContainer = d3
  .select("#violinPlot")
  .append("div")
  .attr("class", "violin-legend")
  .style("position", "absolute")
  .style("top", "40px")
  .style("right", "40px")
  .style("background", "rgba(0, 0, 0, 0.7)")
  .style("padding", "10px 12px")
  .style("border-radius", "6px")
  .style("color", "white")
  .style("font-size", "12px")
  .style("line-height", "1.5em")
  .style("z-index", "10");

legendContainer.html(`
  <div><svg width="12" height="12"><line x1="0" x2="12" y1="6" y2="6" stroke="white" stroke-width="2" stroke-dasharray="4,2"/></svg> Mean</div>
  <div><svg width="12" height="12"><line x1="0" x2="12" y1="6" y2="6" stroke="#ccc" stroke-width="2" stroke-dasharray="2,2"/></svg> Median</div>
`);

const tooltipViolin = d3.select("#violin-tooltip");
const violinFeatureSelect = document.getElementById("violinFeatureSelect");
const violinCSV = "unique_songs.csv";

d3.csv(violinCSV).then((rawData) => {
  const parsedData = rawData.map((d) => ({
    is_billboard: String(d.is_billboard || "").toLowerCase() === "true",
    danceability: +d.danceability,
    energy: +d.energy,
    valence: +d.valence,
    acousticness: +d.acousticness,
    speechiness: +d.speechiness,
  }));

  drawViolin("danceability");

  violinFeatureSelect.addEventListener("change", (e) => {
    drawViolin(e.target.value);
  });

  function drawViolin(feature) {
    const groups = ["Billboard", "Non-Billboard"];
    const grouped = {
      Billboard: parsedData.filter((d) => d.is_billboard).map((d) => d[feature]).filter((v) => !isNaN(v)),
      "Non-Billboard": parsedData.filter((d) => !d.is_billboard).map((d) => d[feature]).filter((v) => !isNaN(v)),
    };

    const x = d3.scaleBand().domain(groups).range([0, violinWidth]).padding(0.4);
    const y = d3.scaleLinear().domain([0, 1]).nice().range([violinHeight, 0]);
    const kde = kernelDensityEstimator(kernelEpanechnikov(0.05), y.ticks(40));
    const transition = d3.transition().duration(800).ease(d3.easeCubicOut);

    svgViolin.selectAll(".axis").remove();
    svgViolin.append("g").attr("class", "x-axis axis").attr("transform", `translate(0,${violinHeight})`).call(d3.axisBottom(x));
    svgViolin.append("g").attr("class", "y-axis axis").call(d3.axisLeft(y));

    const violinGroups = svgViolin.selectAll(".violin-group").data(groups);
    violinGroups.enter().append("g").attr("class", "violin-group").merge(violinGroups).each(function (group) {
      const values = grouped[group];
      if (!values.length || values.some((v) => isNaN(v))) return;

      const density = kde(values);
      const xCenter = x(group);
      if (isNaN(xCenter)) return;

      const area = d3.area()
        .curve(d3.curveCatmullRom)
        .x0((d) => xCenter + x.bandwidth() / 2 - d[1] * 50)
        .x1((d) => xCenter + x.bandwidth() / 2 + d[1] * 50)
        .y((d) => y(d[0]));

      d3.select(this).selectAll(".violin-path").data([density]).join("path")
        .attr("class", "violin-path")
        .attr("fill", group === "Billboard" ? "#00ff99" : "#ff3399")
        .attr("stroke", "#ccc")
        .attr("opacity", 0.8)
        .transition(transition)
        .attr("d", area);

      const mean = d3.mean(values);
      const median = d3.median(values);

      d3.select(this).selectAll(".mean-line").data([mean]).join("line")
        .attr("class", "mean-line")
        .attr("stroke", "white")
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "4,2")
        .on("mouseover", (event, d) => tooltipViolin.style("opacity", 1).html(`<strong>Mean:</strong> ${d?.toFixed(3) ?? "N/A"}`))
        .on("mousemove", (event) => tooltipViolin.style("left", `${event.pageX + 12}px`).style("top", `${event.pageY - 20}px`))
        .on("mouseout", () => tooltipViolin.style("opacity", 0))
        .transition(transition)
        .attr("x1", xCenter)
        .attr("x2", xCenter + x.bandwidth())
        .attr("y1", (d) => y(d))
        .attr("y2", (d) => y(d));

      d3.select(this).selectAll(".median-line").data([median]).join("line")
        .attr("class", "median-line")
        .attr("stroke", "#cccccc")
        .attr("stroke-width", 1.5)
        .attr("stroke-dasharray", "2,2")
        .on("mouseover", (event, d) => tooltipViolin.style("opacity", 1).html(`<strong>Median:</strong> ${d?.toFixed(3) ?? "N/A"}`))
        .on("mousemove", (event) => tooltipViolin.style("left", `${event.pageX + 12}px`).style("top", `${event.pageY - 20}px`))
        .on("mouseout", () => tooltipViolin.style("opacity", 0))
        .transition(transition)
        .attr("x1", xCenter)
        .attr("x2", xCenter + x.bandwidth())
        .attr("y1", (d) => y(d))
        .attr("y2", (d) => y(d));
    });

    violinGroups.exit().remove();
  }

  function kernelDensityEstimator(kernel, X) {
    return function (V) {
      return X.map((x) => [x, d3.mean(V, (v) => kernel(x - v))]);
    };
  }

  function kernelEpanechnikov(k) {
    return function (v) {
      return Math.abs((v /= k)) <= 1 ? (0.75 * (1 - v * v)) / k : 0;
    };
  }
});
