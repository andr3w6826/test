// // tinder.js

// // 1. Hardcoded song sets for each mood (10 songs each)
// const moodSongs = {
//   chill: [
//     { title: "Slow Burn", artist: "Kacey Musgraves", vibe: "Mellow", features: [0.5, 0.3, 0.4, 0.6, 0.1] },
//     { title: "Holocene", artist: "Bon Iver", vibe: "Dreamy", features: [0.4, 0.2, 0.5, 0.8, 0.2] },
//     // ... 8 more from your dataset
//   ],
//   party: [
//     { title: "Levitating", artist: "Dua Lipa", vibe: "Dance Pop", features: [0.9, 0.8, 0.7, 0.2, 0.3] },
//     // ...
//   ],
//   heartbreak: [
//     { title: "Someone Like You", artist: "Adele", vibe: "Ballad", features: [0.3, 0.4, 0.2, 0.7, 0.6] },
//     // ...
//   ],
//   focus: [
//     { title: "Weightless", artist: "Marconi Union", vibe: "Lo-fi Ambient", features: [0.2, 0.1, 0.5, 0.9, 0.1] },
//     // ...
//   ],
//   mainchar: [
//     { title: "Blinding Lights", artist: "The Weeknd", vibe: "Cinematic Pop", features: [0.8, 0.9, 0.6, 0.2, 0.4] },
//     // ...
//   ]
// };

// let selectedMood = null;
// let currentIndex = 0;
// let likedSongs = [];

// const trackCard = document.getElementById("track-card");
// const swipeSection = document.getElementById("track-swipe-section");
// const resultSection = document.getElementById("results-section");

// // Mood button selection
// const moodButtons = document.querySelectorAll(".mood-buttons button");
// moodButtons.forEach((btn) => {
//   btn.addEventListener("click", () => {
//     selectedMood = btn.dataset.mood;
//     currentIndex = 0;
//     likedSongs = [];
//     swipeSection.style.display = "block";
//     resultSection.style.display = "none";
//     renderTrack();
//   });
// });

// // Render track card
// function renderTrack() {
//   const song = moodSongs[selectedMood][currentIndex];
//   if (!song) return showResults();

//   trackCard.innerHTML = `
//     <h3>${song.title}</h3>
//     <p><strong>${song.artist}</strong></p>
//     <p style="color:#a259ff">${song.vibe}</p>
//   `;
// }

// // Swipe buttons
// const likeBtn = document.getElementById("likeBtn");
// const dislikeBtn = document.getElementById("dislikeBtn");

// likeBtn.onclick = () => {
//   const song = moodSongs[selectedMood][currentIndex];
//   likedSongs.push(song.features);
//   currentIndex++;
//   renderTrack();
// };

// dislikeBtn.onclick = () => {
//   currentIndex++;
//   renderTrack();
// };

// // Show personalized results
// function showResults() {
//   swipeSection.style.display = "none";
//   resultSection.style.display = "block";

//   const avg = averageFeatures(likedSongs);
//   drawRadarChart(avg);

//   const badge = getClusterBadge(avg);
//   document.getElementById("badge-name").innerText = `🎧 You are: ${badge.label}`;

//   const recommendations = badge.recs;
//   const ul = document.getElementById("recommendations");
//   ul.innerHTML = "";
//   recommendations.forEach((r) => {
//     const li = document.createElement("li");
//     li.innerText = `${r.title} — ${r.artist}`;
//     ul.appendChild(li);
//   });
// }

// // Feature utilities
// function averageFeatures(arr) {
//   const sum = arr.reduce((acc, val) => acc.map((a, i) => a + val[i]), Array(arr[0].length).fill(0));
//   return sum.map((s) => s / arr.length);
// }

// // Basic mock clustering logic
// function getClusterBadge(avg) {
//   const clusters = [
//     { label: "The Soulful Synth", center: [0.6, 0.5, 0.6, 0.4, 0.3], recs: moodSongs.chill.slice(0, 3) },
//     { label: "The Energetic Underdog", center: [0.8, 0.9, 0.7, 0.2, 0.3], recs: moodSongs.party.slice(0, 3) },
//     { label: "The Rainy Day Romantic", center: [0.3, 0.4, 0.2, 0.6, 0.5], recs: moodSongs.heartbreak.slice(0, 3) }
//   ];

//   let minDist = Infinity;
//   let best = clusters[0];
//   clusters.forEach((c) => {
//     const dist = Math.sqrt(c.center.reduce((sum, val, i) => sum + (val - avg[i]) ** 2, 0));
//     if (dist < minDist) {
//       minDist = dist;
//       best = c;
//     }
//   });
//   return best;
// }
