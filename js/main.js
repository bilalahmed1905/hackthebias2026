/* 
  main.js - Core logic for the scrolling simulation
*/

// -----------------------------------------------------------------------------
// STEP 1: DEFINE THE "UNIVERSE" OF VIDEOS
// -----------------------------------------------------------------------------
// - Find 20-30 YouTube Shorts.
// - For each video, get the Video ID from the URL.
//   (e.g., for https://www.youtube.com/shorts/ABCDEFG, the ID is "ABCDEFG")
// - Categorize them with hashtags. Create a mix of broad and niche/extreme tags.
//   This is the most important step for creating the "rabbit hole" effect.
// -----------------------------------------------------------------------------

const videoData = [
  // --- Start with some neutral, popular content ---
  { id: 1, videoId: '8_4-Qa2a_Cg', title: 'Cute Cat Video', author: '@catlover', hashtags: ['#animals', '#funny', '#cute'] },
  { id: 2, videoId: 'v4pi1LxuDHc', title: 'Amazing Travel Destination', author: '@wanderlust', hashtags: ['#travel', '#nature', '#adventure'] },
  { id: 3, videoId: '3G1PFLuTrgM', title: 'Simple Cooking Recipe', author: '@cheflife', hashtags: ['#food', '#cooking', '#recipe'] },

  // --- Introduce some more specific/niche topics ---
  { id: 4, videoId: '6_pru8U2RmM', title: 'New Tech Gadgets', author: '@techie', hashtags: ['#tech', '#gadgets', '#future'] },
  { id: 5, videoId: '5qap5aO4i9A', title: 'Stock Market Tips', author: '@investpro', hashtags: ['#finance', '#stocks', '#investing'] },
  
  // --- Add content that can lead down a "rabbit hole" ---
  { id: 6, videoId: 'a_jt1h_d4yM', title: 'Is AI Taking Over?', author: '@futurescope', hashtags: ['#tech', '#ai', '#danger'] },
  { id: 7, videoId: 'Y_plhkz34II', title: 'The Truth About Area 51', author: '@conspiracyfiles', hashtags: ['#conspiracy', '#aliens', '#secret'] },
  { id: 8, videoId: 'OPEE7s0-u8s', title: 'Simulation Theory Explained', author: '@deepthinker', hashtags: ['#conspiracy', '#philosophy', '#reality'] },
  { id: 9, videoId: 'l_a_qR4Xq_I', title: 'Financial System is a Scam?', author: '@truthseeker', hashtags: ['#finance', '#conspiracy', '#money'] },

  // TODO: Add 10-20 more videos to make the pool larger and more diverse.
  // The more videos, the more effective the simulation will be.
];


// -----------------------------------------------------------------------------
// STEP 2: SET UP THE SIMULATION STATE
// -----------------------------------------------------------------------------
const userProfile = {
  engagement: {}, // e.g., { '#tech': 2, '#conspiracy': 5 }
};

const simulationState = {
  feed: [], // Array of video objects shown to the user
  viewedIds: new Set(), // To avoid showing the same video twice
  simulationLength: 10, // End simulation after 10 videos
};


// -----------------------------------------------------------------------------
// STEP 3: IMPLEMENT THE YOUTUBE PLAYER AND FEED LOGIC
// -----------------------------------------------------------------------------

// This function will be called by the YouTube IFrame API when it's ready.
function onYouTubeIframeAPIReady() {
  // TODO:
  // 1. Load the initial set of videos into the feed.
  //    - Pick 3-4 random videos from `videoData` to start.
  //    - For each video, call a function like `createPlayer(videoObject)`.
  // 2. Set up the Intersection Observer to detect which video is in view.
  console.log("YouTube API is ready.");
  initializeFeed();
}

function initializeFeed() {
  // TODO:
  // - Clear the feed container.
  // - Get the first few videos to display.
  // - Create player for each initial video.
  // - Add them to the DOM.
}

function createPlayer(video) {
  // TODO:
  // - Create a div element for the video post.
  // - Inside it, create another div that the YouTube player will attach to.
  // - Use `new YT.Player()` to create the player.
  //   - Set the `videoId` from the video object.
  // - Set playerVars like `autoplay: 1`, `controls: 0`, `loop: 1`.
  //   - Add event listeners (`onStateChange`) to detect when the video plays or ends.
  // - Append the post to the #feed-container.
  // - Add the video to `simulationState.feed` and its ID to `simulationState.viewedIds`.
}


// -----------------------------------------------------------------------------
// STEP 4: IMPLEMENT THE "ALGORITHM"
// -----------------------------------------------------------------------------

function getNextVideo() {
  // TODO:
  // 1. Analyze `userProfile.engagement` to find the most engaged-with hashtags.
  // 2. Decide whether to show a "recommended" video or a "random" one (e.g., 70/30 split).
  // 3. **If recommended:**
  //    - Filter `videoData` to find videos that have the top hashtags AND have not been viewed yet.
  //    - If matches are found, pick one.
  // 4. **If random (or no recommendation found):**
  //    - Pick a random video from `videoData` that has not been viewed.
  // 5. Return the chosen video object.
}


// -----------------------------------------------------------------------------
// STEP 5: TRACK ENGAGEMENT
// -----------------------------------------------------------------------------

function trackEngagement(video, engagementType) {
  // engagementType can be 'like', 'long_watch', etc.
  
  // TODO:
  // - For each hashtag in `video.hashtags`:
  //   - If the hashtag is already in `userProfile.engagement`, increment its score.
  //   - Otherwise, add it with a score of 1.
  console.log(`Engagement with: ${video.title}, type: ${engagementType}`);
}

// The Intersection Observer callback
function handleIntersection(entries) {
  // TODO:
  // - Loop through entries.
  // - If an entry is intersecting (visible on screen):
  //   - Play the video using the Player API (`player.playVideo()`).
  //   - Start a timer. If the video is visible for > 3 seconds, call `trackEngagement(video, 'long_watch')`.
  // - If an entry is not intersecting:
  //   - Pause the video (`player.pauseVideo()`).
}


// -----------------------------------------------------------------------------
// STEP 6: END THE SIMULATION
// -----------------------------------------------------------------------------

function endSimulation() {
  // TODO:
  // 1. Save the necessary data to localStorage.
  //    - `simulationState.feed` (to get the snapshots)
  //    - `userProfile.engagement` (to calculate top hashtags and bias)
  // 2. Redirect the user to the wrapped page.
  //    - `window.location.href = 'wrapped.html';`
  console.log("Simulation ended. Redirecting to wrapped page.");
}

// Example of how you might check to end the simulation
function checkEndOfSimulation() {
  if (simulationState.feed.length >= simulationState.simulationLength) {
    endSimulation();
  }
}
