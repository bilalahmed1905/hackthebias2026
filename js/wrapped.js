/* 
  wrapped.js - Logic for the summary page
*/

document.addEventListener('DOMContentLoaded', () => {
  // TODO:
  // 1. Retrieve the simulation data from localStorage.
  let engagementData = JSON.parse(localStorage.getItem('userEngagement'));
  console.log('Engagement Data:', engagementData);
  let feedHistory = JSON.parse(localStorage.getItem('feedHistory'));

  if (!engagementData || !feedHistory) {
    // Handle case where there is no data - maybe redirect back to index.html
    const wrappedContent = document.getElementById('wrapped-content');
    wrappedContent.innerHTML = '<p>No simulation data found. Please <a href="index.html">start the simulation</a> first.</p>';
    engagementData = { funny: 15, pets: 12, news: 3, dogs: 8 };
    feedHistory = [
      { id: 1, videoId: 'UhVc3B-OQIs', title: 'Ranking The Best Slow Motion Dogs 🐶', hashtags: ['funny', 'pets', 'dogs'] },
      { id: 2, videoId: '0tng6DqwT3w', title: 'Ranking Dramatic Husky Moments 😂', hashtags: ['funny', 'pets', 'dogs'] }
    ];
    // return;
  }

  // 2. Analyze the data and populate the page.
  displayDominantBias(engagementData);
  displayTopHashtags(engagementData);
  displaySnapshots(feedHistory);
});

function displayDominantBias(engagementData) {
  // TODO:
  // - Analyze the engagement data to determine the primary bias.
  // - For now, we can default to "Confirmation Bias" as it's the easiest to demonstrate.
  // - A more advanced version could check if the user was led down a "conspiracy" path, etc.
  const biasElement = document.getElementById('dominant-bias');
  biasElement.textContent = 'Confirmation Bias'; // Placeholder
}

function displayTopHashtags(engagementData) {
  const hashtagsContainer = document.getElementById('top-hashtags');
  
  // TODO:
  // 1. Convert the engagementData object into an array of [hashtag, score] pairs.
  // 2. Sort the array in descending order based on score.
  // 3. Take the top 3-5 hashtags.
  // 4. Create and append elements to display them.
  
  // Example placeholder:
  hashtagsContainer.innerHTML = `
    <span class="tag is-large is-primary">#conspiracy</span>
    <span class="tag is-large is-info">#tech</span>
    <span class="tag is-large is-success">#finance</span>
  `;
}

function displaySnapshots(feedHistory) {
  // TODO:
  // - Get the video data for the 1st, 5th, and 10th videos from the feedHistory.
  // - Create a small card or element to represent each video.
  // - You can use the YouTube thumbnail URL: `https://img.youtube.com/vi/<VIDEO_ID>/0.jpg`
  
  const snapshot1 = document.getElementById('snapshot-1');
  const snapshot5 = document.getElementById('snapshot-5');
  const snapshot10 = document.getElementById('snapshot-10');

  // Example placeholder:
  if (feedHistory[0]) {
    snapshot1.innerHTML = `<img src="https://img.youtube.com/vi/${feedHistory[0].videoId}/0.jpg" alt="${feedHistory[0].title}">`;
  }
  if (feedHistory[4]) {
    snapshot5.innerHTML = `<img src="https://img.youtube.com/vi/${feedHistory[4].videoId}/0.jpg" alt="${feedHistory[4].title}">`;
  }
  if (feedHistory[9]) {
    snapshot10.innerHTML = `<img src="https://img.youtube.com/vi/${feedHistory[9].videoId}/0.jpg" alt="${feedHistory[9].title}">`;
  }
}
