// main.js

const svg = d3.select("#parallax-bg");
const width = document.documentElement.clientWidth;
const height = document.documentElement.clientHeight;

svg.attr("width", width).attr("height", height);

const numCircles = 20;
const centerX = width / 2;
const centerY = height / 2;

const circles = svg
  .selectAll("ellipse")
  .data(d3.range(numCircles))
  .enter()
  .append("ellipse")
  .attr("cx", centerX)
  .attr("cy", centerY)
  .attr("rx", (d) => 20 + d * 40)
  .attr("ry", (d) => 20 + d * 20)
  .attr("stroke", "#a259ff")
  .attr("fill", "none")
  .attr("stroke-width", 1)
  .attr("opacity", (d) => 1 - d * 0.04);

// SCROLL + ZOOM ANIMATION
window.addEventListener("scroll", () => {
  const scrollY = window.scrollY;
  const zoomFactor = 1 + scrollY / 1000;

  circles
    .attr("transform", (d) => {
      const scale = zoomFactor + d * 0.01;
      return `translate(${centerX}, ${centerY}) scale(${scale}) translate(${-centerX}, ${-centerY})`;
    })
    .attr("stroke-width", (d) => 0.5 + d * 0.03)
    .attr("opacity", (d) => {
      const fade = Math.max(0.2, 1 - scrollY / 2500);
      return fade - d * 0.04;
    });

  document.querySelectorAll('.scroll-section').forEach((section) => {
    const rect = section.getBoundingClientRect();
    const fadeInStart = window.innerHeight * 0.2;
    const fadeOutEnd = window.innerHeight * 0.8;

    if (rect.top < fadeOutEnd && rect.bottom > fadeInStart) {
      section.style.opacity = 1;
      section.style.transition = 'opacity 1.2s ease-out';
    } else {
      section.style.opacity = 0.1;
      section.style.transition = 'opacity 1.2s ease-out';
    }
  });
});

// MOUSE MOVEMENT DRIFT
document.addEventListener("mousemove", (e) => {
  const mouseX = e.clientX / width - 0.5;
  const mouseY = e.clientY / height - 0.5;
  const scrollY = window.scrollY;
  const baseZoom = 1 + scrollY / 1000;

  circles.attr("transform", (d) => {
    const offsetX = mouseX * d * 20;
    const offsetY = mouseY * d * 10;
    const scale = baseZoom + d * 0.01;

    return `translate(${centerX + offsetX}, ${centerY + offsetY}) scale(${scale}) translate(${-centerX}, ${-centerY})`;
  });
});

// SCROLL TO FIRST SECTION
document.getElementById("scroll-btn").addEventListener("click", () => {
  document.getElementById("section-1").scrollIntoView({ behavior: "smooth" });
});

// D3 Feature vs Popularity and Song Comparison
window.addEventListener("DOMContentLoaded", () => {
  const margin = { top: 30, right: 20, bottom: 40, left: 60 };
  const width = 900 - margin.left - margin.right;
  const height = 450 - margin.top - margin.bottom;

  const svg = d3
    .select("#chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const tooltip = d3.select("#tooltip");
  let data;
  const CSV_FILE = "unique_songs.csv";
  const defaultSong1 = "Don't Hold Back";
  const defaultSong2 = "Love Myself";
  const input1 = document.getElementById("song1");
  const input2 = document.getElementById("song2");
  const compareBtn = document.getElementById("compareBtn");

  d3.csv(CSV_FILE).then((rawData) => {
    console.log("Raw data preview:", rawData.slice(0, 5));  // Debug line
    data = rawData.map((d) => ({
      song_name: d.song_name,
      artists: d.artists, 
      popularity: +d.popularity,
      danceability: +d.danceability,
      energy: +d.energy,
      valence: +d.valence,
      acousticness: +d.acousticness,
      speechiness: +d.speechiness,
    }));

    updateChart("danceability");
    input1.value = defaultSong1;
    input2.value = defaultSong2;
    triggerComparison();
  });

  document.getElementById("featureSelect").addEventListener("change", (e) => {
    updateChart(e.target.value);
  });

  compareBtn.addEventListener("click", triggerComparison);

  function updateChart(feature) {
    svg.selectAll("*").remove();

    const x = d3.scaleLinear().domain([0, d3.max(data, (d) => d[feature])]).range([0, width]);
    const y = d3.scaleLinear().domain([0, 100]).range([height, 0]);

    svg.append("g").attr("transform", `translate(0,${height})`).call(d3.axisBottom(x));
    svg.append("g").call(d3.axisLeft(y));

    svg
      .append("text")
      .attr("class", "axis-label x-label")
      .attr("text-anchor", "middle")
      .attr("x", width / 2)
      .attr("y", height + margin.bottom - 5)
      .text(feature.charAt(0).toUpperCase() + feature.slice(1));

    svg
      .append("text")
      .attr("class", "axis-label y-label")
      .attr("text-anchor", "middle")
      .attr("transform", `translate(${-margin.left + 15},${height / 2}) rotate(-90)`)
      .text("Popularity");

    svg
      .selectAll("circle")
      .data(data)
      .join("circle")
      .attr("cx", (d) => x(d[feature]))
      .attr("cy", (d) => y(d.popularity))
      .attr("r", 5)
      .attr("fill", "#00ff99")
      .on("mouseover", (event, d) => {
        tooltip
          .style("opacity", 1)
          // .html(`<strong>${d.song_name}</strong><br>${feature}: ${d[feature]}<br>Popularity: ${d.popularity}`)
          .html(`
      <strong>${d.song_name}</strong><br>
      <em>by ${d.artists}</em><br>
      ${feature}: ${d[feature]}<br>
      Popularity: ${d.popularity}
    `)
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 28 + "px");
      })
      .on("mouseout", () => tooltip.style("opacity", 0));
  }

  function triggerComparison() {
    const name1 = (input1.value || defaultSong1).trim().toLowerCase();
    const name2 = (input2.value || defaultSong2).trim().toLowerCase();
    // const songA = data.find((d) => d.song_name.toLowerCase().includes(name1));
    // const songB = data.find((d) => d.song_name.toLowerCase().includes(name2));
    const songA = data.find((d) => d.song_name && d.song_name.toLowerCase().includes(name1));
const songB = data.find((d) => d.song_name && d.song_name.toLowerCase().includes(name2));

    

    if (!songA || !songB) {
      d3.select("#compareChart").html(`<p style="text-align:center;color:#888;">Enter two valid songs to compare.</p>`);
      return;
    }
    drawCompare(songA, songB);
  }

  function drawCompare(songA, songB) {
    const features = ["danceability", "energy", "valence", "acousticness", "speechiness"];

    const compareMargin = { top: 30, right: 20, bottom: 40, left: 60 };
    const compareWidth = 600 - compareMargin.left - compareMargin.right;
    const compareHeight = 300 - compareMargin.top - compareMargin.bottom;

    const compareDiv = d3.select("#compareChart").html("");
    const svg2 = compareDiv
      .append("svg")
      .attr("width", compareWidth + compareMargin.left + compareMargin.right)
      .attr("height", compareHeight + compareMargin.top + compareMargin.bottom)
      .append("g")
      .attr("transform", `translate(${compareMargin.left},${compareMargin.top})`);

    const x0 = d3.scaleBand().domain(features).range([0, compareWidth]).padding(0.1);
    const x1 = d3.scaleBand().domain(["song1", "song2"]).range([0, x0.bandwidth()]).padding(0.05);

    const yMax = d3.max([...features.map((f) => songA[f]), ...features.map((f) => songB[f])]);
    const y = d3.scaleLinear().domain([0, yMax]).nice().range([compareHeight, 0]);

    const color = d3.scaleOrdinal().domain(["song1", "song2"]).range(["#00ff99", "#ff9933"]);

    svg2.append("g").call(d3.axisLeft(y));
    svg2.append("g").attr("transform", `translate(0,${compareHeight})`).call(d3.axisBottom(x0));

    const featureGroups = svg2
      .selectAll("g.feature")
      .data(features)
      .join("g")
      .attr("class", "feature")
      .attr("transform", (d) => `translate(${x0(d)},0)`);

    featureGroups
      .selectAll("rect")
      .data((d) => [
        { key: "song1", value: songA[d] },
        { key: "song2", value: songB[d] },
      ])
      .join("rect")
      .attr("x", (d) => x1(d.key))
      .attr("y", (d) => y(d.value))
      .attr("width", x1.bandwidth())
      .attr("height", (d) => compareHeight - y(d.value))
      .attr("fill", (d) => color(d.key));

    const legend = compareDiv.append("div").attr("class", "legend");
    [songA.song_name, songB.song_name].forEach((title, i) => {
      legend
        .append("span")
        .style("display", "inline-block")
        .style("margin-right", "10px")
        .html(`<span style="display:inline-block;width:12px;height:12px;background:${i === 0 ? "#00ff99" : "#ff9933"};margin-right:4px"></span>${title}`);
    });
  }


//   // main.js
// import { generateRadarChart } from './radar.js';

// const moodSongs = {
//   chill: [...], // placeholder for 10 curated songs
//   party: [...],
//   heartbreak: [...],
//   focus: [...],
//   mainCharacter: [...]
// };

// let selectedMood = null;
// let swipeIndex = 0;
// let likedSongs = [];

// function startMoodSelection(mood) {
//   selectedMood = mood;
//   swipeIndex = 0;
//   likedSongs = [];
//   displayNextSong();
// }

// function displayNextSong() {
//   const song = moodSongs[selectedMood][swipeIndex];
//   if (!song) return;

//   const card = document.getElementById("song-card");
//   card.className = "";
//   card.innerHTML = `
//     <h2>${song.title}</h2>
//     <p>${song.artist}</p>
//     <p><em>${song.vibe}</em></p>
//   `;
// }

// function swipe(direction) {
//   const card = document.getElementById("song-card");
//   card.classList.add(direction === "right" ? "swipe-right" : "swipe-left");

//   setTimeout(() => {
//     const song = moodSongs[selectedMood][swipeIndex];
//     if (direction === "right") {
//       likedSongs.push(song);
//     }

//     swipeIndex++;
//     if (swipeIndex < 5) {
//       displayNextSong();
//     } else {
//       showRadarAndRecommendations();
//     }
//   }, 300);
// }

// function showRadarAndRecommendations() {
//   const avgFeatures = calculateAverageFeatures(likedSongs);
//   document.getElementById("song-card").style.display = "none";
//   generateRadarChart("results-container", avgFeatures);
//   displayRecommendations(likedSongs);
// }

// function calculateAverageFeatures(songs) {
//   const keys = ["danceability", "energy", "valence", "acousticness", "speechiness"];
//   const sums = keys.reduce((acc, key) => ({ ...acc, [key]: 0 }), {});

//   songs.forEach(song => {
//     keys.forEach(key => {
//       sums[key] += parseFloat(song[key]);
//     });
//   });

//   return keys.reduce((acc, key) => ({
//     ...acc,
//     [key]: sums[key] / songs.length
//   }), {});
// }

// function displayRecommendations(songs) {
//   // Display 5 mock recommendations below radar chart
//   const container = document.getElementById("recommendations");
//   container.innerHTML = `<h3>Your Hit Type: The Chill Dreamer</h3>`;
//   songs.slice(0, 5).forEach(song => {
//     container.innerHTML += `<p>${song.title} — ${song.artist}</p>`;
//   });
// }

// // Attach event listeners
// const hearts = document.querySelectorAll(".heart-button");
// hearts.forEach(btn => btn.addEventListener("click", () => swipe("right")));
// const skips = document.querySelectorAll(".skip-button");
// skips.forEach(btn => btn.addEventListener("click", () => swipe("left")));

// // Call startMoodSelection("chill") or similar on mood button click

});
