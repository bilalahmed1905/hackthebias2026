/* 
  main.js - Core logic for the scrolling simulation
*/

// -----------------------------------------------------------------------------
// STEP 1: DEFINE THE "UNIVERSE" OF VIDEOS
// -----------------------------------------------------------------------------
// - Find 50-80 YouTube Shorts.
// - For each video, get the Video ID from the URL.
//   (e.g., for https://www.youtube.com/shorts/ABCDEFG, the ID is "ABCDEFG")
// - Categorize them with hashtags. Create a mix of broad and niche/extreme tags.
//   This is the most important step for creating the "rabbit hole" effect.
// -----------------------------------------------------------------------------

const videoData = [
  // --- Start with some neutral, popular content ---
    { id: 1, videoId: 'UhVc3B-OQIs', title: 'Ranking The Best Slow Motion Dogs', author: '@pettastic-clip', hashtags: ['#funny', '#pets', '#dogs'] },
  { id: 10, videoId: '8_4-Qa2a_Cg', title: 'Cute Cat Video', author: '@catlover', hashtags: ['#animals', '#funny', '#cute'] },
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
  playerObjects: {}, // To store the YT.Player instances
};


// -----------------------------------------------------------------------------
// STEP 3: IMPLEMENT THE YOUTUBE PLAYER AND FEED LOGIC
// -----------------------------------------------------------------------------

// This function will be called by the YouTube IFrame API when it's ready.
// This function is automatically called by the YouTube IFrame API script when it's ready.
function onYouTubeIframeAPIReady() {
  console.log("YouTube API is ready. Initializing feed.");
  initializeFeed();
}

/**
 * Kicks off the simulation.
 * This function's job is to prepare the feed. For now, it just loads the first video.
 */
function initializeFeed() {
  const feedContainer = document.getElementById('feed-container');
  feedContainer.innerHTML = ''; // Clear the feed of any previous content, just in case.

  // Make sure we have videos in our dataset before trying to create a player.
  if (videoData.length > 0) {
    // Create a player for the very first video in our videoData array.
    createPlayer(videoData[0]);
  } else {
    console.error("videoData is empty. Please add video objects to the array in main.js.");
  }
  // TODO: Set up IntersectionObserver here
}

/**
 * Creates a single video post and embeds the YouTube player.
 * @param {object} video - The video object from videoData.
 */
function createPlayer(video) {
  const feedContainer = document.getElementById('feed-container');

  const postElement = document.createElement('div');
  postElement.className = 'video-post';
  postElement.id = `post-${video.id}`;
  postElement.dataset.videoId = video.id; // Store video id for easy access

  const playerElement = document.createElement('div');
  const playerId = `player-${video.id}`;
  playerElement.id = playerId;
  
  const overlayElement = document.createElement('div');
  overlayElement.className = 'video-overlay';
  overlayElement.innerHTML = `
    <div class="video-info">
      <p class="author">${video.author}</p>
      <p class="title">${video.title}</p>
    </div>
    <div class="video-actions">                                                                                      
      <span class="like-button">❤️</span>
    </div>
  `;

  // 4. Assemble the post: add the player placeholder and the overlay to the main post container.
  postElement.appendChild(playerElement);
  postElement.appendChild(overlayElement);
  
  // 5. Add the fully assembled post to our feed on the webpage.
  feedContainer.appendChild(postElement);

  // 6. This is the core step: Instantiate the YouTube player.
  //    We tell the API to replace the div with the ID `playerId` with a YouTube IFrame.
  const player = new YT.Player(playerId, {
    height: '100%',
    width: '100%',
    videoId: video.videoId,
    playerVars: {
      'autoplay': 1,       // Autoplay the video on load.
      'playsinline': 1,     // Play the video inline on mobile devices. 
      'controls': 0,       // **This is the key: it hides the YouTube player controls.**
      'mute': 1,           // Mute is required by most browsers for autoplay to work reliably.
      'rel': 0,            // Don't show related videos when the video ends.
      'showinfo': 0,       // Hide the video title and uploader info (part of the native YT UI).
      'modestbranding': 1  // Remove the YouTube logo from the control bar (which is hidden anyway).
    },
    events: {
      'onReady': (event) => {
        // This event fires when the player is ready. We can ensure it plays.
        event.target.playVideo();
      }
      // TODO: Add the 'onStateChange' event to detect when the user manually pauses/plays,
      // which can be another form of engagement.
    }
  });

  simulationState.playerObjects[video.id] = player;
  simulationState.feed.push(video);
  simulationState.viewedIds.add(video.id);
  
  console.log(`Created player for: ${video.title}`);
}


// -----------------------------------------------------------------------------
// STEP 4: IMPLEMENT THE "ALGORITHM"
// -----------------------------------------------------------------------------

function getNextVideo() {
  // TODO: Implement algorithm logic
  // For now, just get the next unseen video
  const nextVideo = videoData.find(v => !simulationState.viewedIds.has(v.id));
  return nextVideo;
}


// -----------------------------------------------------------------------------
// STEP 5: TRACK ENGAGEMENT & HANDLE UI CLICKS
// -----------------------------------------------------------------------------

/**
 * Handles all clicks within the feed container.
 * @param {Event} event The click event.
 */
function handleFeedClick(event) {
    const target = event.target;
    if (!target.classList.contains('action-icon')) return;

    const action = target.dataset.action;
    const videoId = parseInt(target.dataset.videoId, 10);

    switch (action) {
        case 'like':
            handleLikeClick(videoId, target);
            break;
        case 'comment':
            handleCommentClick(videoId);
            break;
        case 'share':
            handleShareClick(videoId);
            break;
    }
}

/**
 * Handles the logic when a like button is clicked.
 * @param {number} videoId The ID of the video.
 * @param {HTMLElement} iconElement The icon element that was clicked.
 */
function handleLikeClick(videoId, iconElement) {
    iconElement.classList.toggle('liked');
    const video = videoData.find(v => v.id === videoId);
    if (iconElement.classList.contains('liked')) {
        trackEngagement(video, 'like');
    }
    // Optional: Add logic to "unlike" and remove engagement points.
}

/**
 * Handles the logic when a comment button is clicked.
 * @param {number} videoId The ID of the video.
 */
function handleCommentClick(videoId) {
    const video = videoData.find(v => v.id === videoId);
    if (!video || !video.comments || video.comments.length === 0) {
        console.log("No comments for this video.");
        return;
    }

    const modalContainer = document.getElementById('modal-container');
    let commentsHtml = '';
    video.comments.forEach(comment => {
        commentsHtml += `
            <div class="comment">
                <span class="comment-author">${comment.author}</span>
                <span>${comment.text}</span>
            </div>
        `;
    });

    modalContainer.innerHTML = `
        <div class="modal is-active comment-modal">
            <div class="modal-background"></div>
            <div class="modal-content">
                <div class="box">
                    <h3 class="title is-4">Comments</h3>
                    ${commentsHtml}
                </div>
            </div>
            <button class="modal-close is-large" aria-label="close"></button>
        </div>
    `;

    // Add event listener to close the modal
    modalContainer.querySelector('.modal-close').addEventListener('click', () => {
        modalContainer.innerHTML = '';
    });
    modalContainer.querySelector('.modal-background').addEventListener('click', () => {
        modalContainer.innerHTML = '';
    });
    
    trackEngagement(video, 'comment');
}

/**
 * Handles the logic when a share button is clicked.
 * @param {number} videoId The ID of the video.
 */
function handleShareClick(videoId) {
    const video = videoData.find(v => v.id === videoId);
    console.log(`Sharing video: ${video.title}`);
    // In a real app, this would open a share sheet.
    // For our simulation, we can just track it as an engagement.
    trackEngagement(video, 'share');
    alert('Sharing is not implemented in this simulation, but your engagement has been noted!');
}


function trackEngagement(video, engagementType) {
  // engagementType can be 'like', 'share', 'comment', 'long_watch', etc.
  console.log(`Engagement with: ${video.title}, type: ${engagementType}`);
  
  const engagementWeight = {
    'like': 2,
    'comment': 3,
    'share': 4,
    'long_watch': 1
  };

  const weight = engagementWeight[engagementType] || 1;

  video.hashtags.forEach(tag => {
    if (userProfile.engagement[tag]) {
      userProfile.engagement[tag] += weight;
    } else {
      userProfile.engagement[tag] = weight;
    }
  });
  console.log('Current user profile:', userProfile.engagement);
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
