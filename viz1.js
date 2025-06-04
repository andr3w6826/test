
let interval = null;
let isPaused = false;
let startAnimation = null;

function initArtistBarRace() {
    const svg = d3.select("#rise-hit-chart");
    const margin = { top: 20, right: 200, bottom: 60, left: 180 };
    const width = 1000 - margin.left - margin.right;
    const height = +svg.attr("height") - margin.top - margin.bottom;
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
  
    d3.csv("artist_year_scores.csv").then(raw => {
      const data = raw.map(d => ({
        name: d.name,
        year: +d.year,
        score: +d.year_end_score,
        main_genre: d.main_genre,
        image_url: d.image_url
      }));
  
      const years = [...new Set(data.map(d => d.year))].sort((a, b) => a - b);
      let yearIndex = 0;
  
      const x = d3.scaleLinear().range([0, width]);
      const y = d3.scaleBand().range([0, height]).padding(0.1);
  
      const genreColor = d3.scaleOrdinal()
        .domain([...new Set(data.map(d => d.main_genre))])
        .range(d3.schemeTableau10);
      
  
      const rankHistory = new Map();
  
      const interpolateData = (startData, endData, alpha) => {
        const allNames = new Set([...startData.map(d => d.name), ...endData.map(d => d.name)]);
        const startMap = new Map(startData.map(d => [d.name, d]));
        const endMap = new Map(endData.map(d => [d.name, d]));
  
        const interpolated = [];
        for (let name of allNames) {
          const start = startMap.get(name) || { score: 0, main_genre: endMap.get(name)?.main_genre, image_url: endMap.get(name)?.image_url };
          const end = endMap.get(name) || { score: 0, main_genre: startMap.get(name)?.main_genre, image_url: startMap.get(name)?.image_url };
  
          interpolated.push({
            name,
            main_genre: start.main_genre || end.main_genre,
            image_url: start.image_url || end.image_url,
            score: start.score + (end.score - start.score) * alpha
          });
        }
  
        interpolated.sort((a, b) => b.score - a.score);
        interpolated.forEach((d, i) => {
          if (!rankHistory.has(d.name)) rankHistory.set(d.name, i);
          d.prevRank = rankHistory.get(d.name);
        });
  
        interpolated.sort((a, b) => a.prevRank - b.prevRank);
        interpolated.forEach((d, i) => rankHistory.set(d.name, i));
        return interpolated.slice(0, 7);
      };
  
      const render = (frameData, year) => {
        x.domain([0, d3.max(frameData, d => d.score)]);
        y.domain(frameData.map(d => d.name));
  
        g.selectAll(".y-axis").data([null]).join("g")
          .attr("class", "y-axis")
          .call(d3.axisLeft(y).tickSize(0).tickPadding(5))
          .selectAll("text").style("fill", "#fff");
  
        g.selectAll(".x-axis").data([null]).join("g")
          .attr("class", "x-axis")
          .attr("transform", `translate(0,${height})`)
          .call(d3.axisBottom(x).ticks(5))
          .selectAll("text").style("fill", "#fff");
  
        const bars = g.selectAll("rect.bar").data(frameData, d => d.name);
        bars.join(
          enter => enter.append("rect")
            .attr("class", "bar")
            .attr("x", 0)
            .attr("y", height)
            .attr("height", y.bandwidth())
            .attr("width", d => x(d.score))
            .attr("fill", d => genreColor(d.main_genre || "Other"))
            .transition().duration(500).ease(d3.easeCubicOut)
            .attr("y", d => y(d.name)),
          update => update.transition().duration(500).ease(d3.easeCubicOut)
            .attr("y", d => y(d.name))
            .attr("width", d => x(d.score)),
          exit => exit.remove()
        );
  
        const labels = g.selectAll(".label").data(frameData, d => d.name);
        labels.join(
          enter => enter.append("text")
            .attr("class", "label")
            .attr("x", 0)
            .attr("y", height)
            .style("fill", "#fff")
            .style("font-size", "12px")
            .text(d => d3.format(",")(d.score))
            .transition().duration(500).ease(d3.easeCubicOut)
            .attr("x", d => x(d.score) + 5)
            .attr("y", d => y(d.name) + y.bandwidth() / 2 + 4),
          update => update.transition().duration(500).ease(d3.easeCubicOut)
            .attr("x", d => x(d.score) + 5)
            .attr("y", d => y(d.name) + y.bandwidth() / 2 + 4)
            .text(d => d3.format(",")(d.score)),
          exit => exit.remove()
        );
  
        const images = g.selectAll("image.artist-img").data(frameData, d => d.name);
        images.join(
          enter => enter.append("image")
            .attr("class", "artist-img")
            .attr("href", d => d.image_url)
            .attr("width", y.bandwidth())
            .attr("height", y.bandwidth())
            .attr("x", d => x(d.score) - y.bandwidth())
            .attr("y", height)
            .attr("clip-path", "circle(40%)")
            .transition().duration(500).ease(d3.easeCubicOut)
            .attr("y", d => y(d.name)),
          update => update.transition().duration(500).ease(d3.easeCubicOut)
            .attr("x", d => x(d.score) - y.bandwidth())
            .attr("y", d => y(d.name)),
          exit => exit.remove()
        );
  
        g.selectAll(".year-bottom").data([year]).join("text")
          .attr("class", "year-bottom")
          .attr("x", width + 50)
          .attr("y", height + 50)
          .attr("text-anchor", "end")
          .attr("font-size", "32px")
          .style("fill", "#fff")
          .text(year);
        };
  
        const tickRate = 28;
        const animateYearTransition = (startYear, endYear) => {
        const startData = data.filter(d => d.year === startYear).sort((a, b) => b.score - a.score).slice(0, 10);
        const endData = data.filter(d => d.year === endYear).sort((a, b) => b.score - a.score).slice(0, 10);
  
        let tick = 0;
        const tickInterval = d3.interval(() => {
          const alpha = tick / tickRate;
          const interpolated = interpolateData(startData, endData, alpha);
          render(interpolated, endYear);
          tick++;
          if (tick > tickRate) tickInterval.stop();
        }, 100);
        };


        startAnimation = () => {
            interval = d3.interval(() => {
                if (yearIndex < years.length - 1) {
                animateYearTransition(years[yearIndex], years[yearIndex + 1]);
                yearIndex++;
                } else {
                interval.stop(); // Stop if we reach the last year
                }
            }, 2500);
        };

    // Start initially
    startAnimation();
      
    });
    document.getElementById("pause-btn").addEventListener("click", () => {
        if (isPaused) {
          startAnimation();
          document.getElementById("pause-btn").textContent = "Pause";
          console.log('pause')
        } else {
          interval.stop();
          document.getElementById("pause-btn").textContent = "Resume";
            console.log('resume')
        }
        isPaused = !isPaused;
      });
  }
  
  initArtistBarRace();