import videoData from './videoData.js';

const initialDiverseVideos = [
  videoData.find(v => v.hashtags.includes('funny')),      // ID 1
  videoData.find(v => v.hashtags.includes('conspiracy')), // ID 21
  videoData.find(v => v.hashtags.includes('health')),     // ID 29
  videoData.find(v => v.hashtags.includes('tech')),       // ID 36
  videoData.find(v => v.hashtags.includes('music')) || videoData.find(v => v.hashtags.includes('photography')) // Fallback ID 11/14
].filter(Boolean);

let simulationState = {
  feed: [],
  viewedIds: new Set(),
  maxVideos: 20,  // Increased for longer demo
  playerObjects: {},
  observer: null,
  currentIndex: 0,
  nextVideos: [],
  profileBuilt: false  // Track after initial 6
};

let userProfile = { engagement: {} }; // tech: 5, music 3
let ytReady = false;
let isLoading = false;

// Replace lines 28-32 with this:

function onYouTubeIframeAPIReady() {
  ytReady = true;
  initializeFeed();
}

// Expose to global scope for YouTube API
window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;

// Handle race condition: if YT API already loaded before this module
if (window.YT && window.YT.Player) {
  onYouTubeIframeAPIReady();
}

function initializeFeed() {
  const feedContainer = document.getElementById('feed-container');
  feedContainer.innerHTML = '';
  // Load FIRST 6 DIVERSE videos for profiling
  initialDiverseVideos.forEach(createPost);
  console.log('=== PROFILING PHASE STARTED ===');
  console.log('Initial diverse videos loaded:', initialDiverseVideos.map(v => ({title: v.title, hashtags: v.hashtags})));
  console.log('Goal: Engage with 6 to build accurate user profile before personalization.');
  computeNextVideos(2);
  setupObserver();
  setupSnapScroll();
}

function createPost(video) {
  // Add to feed SYNCHRONOUSLY first - this ensures feed order matches DOM order
  simulationState.feed.push(video);
  simulationState.viewedIds.add(video.id);
  const myIndex = simulationState.feed.length - 1;
  
  const feedContainer = document.getElementById('feed-container');
  const post = document.createElement('div');
  post.className = 'video-post';
  post.id = `post-video-${video.id}`;
  post.dataset.videoId = video.id;

  const playerContainer = document.createElement('div');
  playerContainer.className = 'player-container';
  playerContainer.id = `player-video-${video.id}`;

  const overlay = document.createElement('div');
  overlay.className = 'video-overlay';
  overlay.innerHTML = `
    <div class="video-info">
      <p class="author">@${video.author}</p>
      <p class="title">${video.title}</p>
    </div>
    <div class="video-actions">
      <i class="far fa-heart action-icon like-button" data-action="like" data-video-id="${video.id}"></i>
      <i class="far fa-comment action-icon" data-action="comment" data-video-id="${video.id}"></i>
      <i class="far fa-paper-plane action-icon" data-action="share" data-video-id="${video.id}"></i>
    </div>
  `;

  post.appendChild(playerContainer);
  post.appendChild(overlay);
  feedContainer.appendChild(post);

  if (ytReady) {
    const player = new YT.Player(`player-video-${video.id}`, {
      height: '640',
      width: '390',
      videoId: video.videoId,
      playerVars: {
        autoplay: 1,
        mute: 1,
        playsinline: 1,
        controls: 0,           // No controls
        fs: 0,                 // No fullscreen
        rel: 0,                // No related videos
        loop: 1,               // Loop the video
      },
      events: {
                'onReady': (e) => {
          e.target.mute();
          simulationState.playerObjects[video.id] = e.target;
          
          // Play if this video is at the current index (first visible)
          if (myIndex === simulationState.currentIndex) {
            e.target.playVideo();
            console.log(`▶️ Auto-playing: ${video.title} at index ${myIndex}`);
          }
          console.log(`Player ready: ${video.title} at index ${myIndex}`);
        },
        'onStateChange': (e) => {
          if (e.data === YT.PlayerState.ENDED) {
            e.target.playVideo();  // Force restart/loop
            console.log(`Restarted: ${video.title} (no end screen)`);
          }
        },
        'onStateChange': (e) => {
  // Track when video completes naturally (before loop restarts)
  if (e.data === YT.PlayerState.ENDED) {
    console.log(`✅ COMPLETED: ${video.title}`);
    trackEngagement(video, 'completedView');
    e.target.playVideo();  // Force restart/loop
    console.log(`Restarted: ${video.title} (no end screen)`);
  }
}
      }
    });
  }

  overlay.querySelectorAll('.action-icon').forEach(icon => {
    icon.addEventListener('click', handleFeedClick);
  });
  updateFocusClasses();
  simulationState.observer?.observe(post);
  return post;
}

function computeNextVideos(num = 2) {
  simulationState.nextVideos = [];
  for (let i = 0; i < num; i++) {
    const next = getNextVideo();
    if (next) simulationState.nextVideos.push(next);
  }
  console.log('🔮 Precomputed next 2:', simulationState.nextVideos.map(v => `${v.title} (${v.hashtags.join(',')})`));
}

function preloadNextVideos() {
  if (isLoading || simulationState.feed.length >= simulationState.maxVideos) {
    // ✅ ADD THIS: Save when we hit max videos
    if (simulationState.feed.length >= simulationState.maxVideos) {
      console.log('🎉 SIMULATION COMPLETE!');
      console.log('Final profile:', userProfile);
      localStorage.setItem('userProfile', JSON.stringify(userProfile));
      console.log('💾 Saved complete profile to localStorage');
    }
    return;
  }
  isLoading = true;
  simulationState.nextVideos.slice(0, 2).forEach(video => {
    if (!simulationState.viewedIds.has(video.id)) createPost(video);
  });
  computeNextVideos(2);
  isLoading = false;
}

function getNextVideo() {
  if (simulationState.feed.length >= simulationState.maxVideos) return null;
  const unseen = videoData.filter(v => !simulationState.viewedIds.has(v.id));
  if (unseen.length === 0) return null;

  const totalEngagement = Object.values(userProfile.engagement).reduce((a, b) => a + b, 0);
  console.log(`📊 Current profile:`, userProfile.engagement, `Total score: ${totalEngagement}`);

  if (!simulationState.profileBuilt || totalEngagement < 10) {  // Delay personalization until ~6 views + some engagement
    simulationState.profileBuilt = simulationState.feed.length >= 6;
    console.log(simulationState.profileBuilt ? '✅ Profile built - now personalizing!' : '⏳ Still profiling...');
    return unseen[Math.floor(Math.random() * unseen.length)];
  }

  let candidates = [];
  const topTags = Object.entries(userProfile.engagement)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([tag]) => tag);

  topTags.forEach(tag => {
    unseen.forEach(video => {
      if (video.hashtags.includes(tag)) {
        candidates.push({ video, score: userProfile.engagement[tag] });
      }
    });
  });

  for (let i = 0; i < Math.floor(unseen.length * 0.3); i++) {
    const randomVideo = unseen[Math.floor(Math.random() * unseen.length)];
    candidates.push({ video: randomVideo, score: 1 });
  }

  const rand = Math.random() * 1.5;
  const pick = candidates[Math.floor(rand * candidates.length)];
  console.log(`🎯 Selected "${pick?.video.title}" (score: ${pick?.score}) | Top tags: [${topTags.join(', ')}]`);
  return pick?.video;
}

// Rest of functions unchanged: setupObserver, setupSnapScroll, updateFocusClasses, handleFeedClick, trackEngagement (enhanced log), handleCommentClick, handleShareClick

function setupObserver() {
  const observerOptions = {
    root: document.getElementById('feed-container'),
    threshold: 0.5
  };
  simulationState.observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const index = simulationState.feed.findIndex(v => `post-video-${v.id}` === entry.target.id);
      if (entry.isIntersecting && index === simulationState.currentIndex) {
        const player = simulationState.playerObjects[simulationState.feed[index].id];
        if (player) {
          player.playVideo();
          console.log(`▶️ Playing: ${simulationState.feed[index].title} (${simulationState.feed[index].hashtags.join(', ')})`);
        }
        Object.values(simulationState.playerObjects).forEach((p, idx) => {
          if (idx !== index) p.pauseVideo();
        });
        setTimeout(() => trackEngagement(simulationState.feed[index], 'longView'), 3000);
      }
    });
  }, observerOptions);
}
function deletePlayer(videoId) {
  // Destroy the YT player instance first (frees memory)
  const player = simulationState.playerObjects[videoId];
  if (player) {
    player.destroy();
    delete simulationState.playerObjects[videoId];
    console.log(`🗑️ Destroyed YT player for video ID: ${videoId}`);
  }
  
  // DON'T remove the DOM element - just clear the iframe to keep indexes aligned
  // The .item-hide class already hides it visually
  const playerContainer = document.getElementById(`player-video-${videoId}`);
  if (playerContainer) {
    playerContainer.innerHTML = ''; // Clear iframe but keep the container
    console.log(`🗑️ Cleared player container for video ID: ${videoId}`);
  }
}

// Expose to global scope for YouTube API callback
window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;
// Update setupSnapScroll:
function setupSnapScroll() {
  const feedContainer = document.getElementById('feed-container');
  let scrollTimeout;
  let deletedVideoIds = new Set(); // Track which videos we've already deleted

  // Block arrow up key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      console.log('⛔ Arrow Up blocked!');
    }
  });

  feedContainer.addEventListener('scroll', () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      const scrollTop = feedContainer.scrollTop;
      const newIndex = Math.round(scrollTop / window.innerHeight);
      const previousIndex = simulationState.currentIndex;
      
      // Block scrolling up - snap back
      if (newIndex < previousIndex) {
        feedContainer.scrollTo({
          top: previousIndex * window.innerHeight,
          behavior: 'smooth'
        });
        console.log('⛔ Upward scroll blocked!');
        return;
      }
      
      simulationState.currentIndex = Math.max(0, Math.min(newIndex, simulationState.feed.length - 1));

    // Save when reaching the last video
    if (simulationState.currentIndex === simulationState.feed.length - 1 && 
        simulationState.feed.length >= simulationState.maxVideos) {
        console.log('🎉 REACHED END OF SIMULATION!');
        console.log('Final profile:', userProfile);
        localStorage.setItem('userProfile', JSON.stringify(userProfile));
        console.log('💾 Saved complete profile to localStorage');
    }
      
      // Delete the video DIRECTLY above when scrolling forward
      if (simulationState.currentIndex > previousIndex && previousIndex >= 0) {
        const videoToDelete = simulationState.feed[previousIndex];
        
        // Only delete if we haven't already AND it's not the current video
        if (videoToDelete && !deletedVideoIds.has(videoToDelete.id)) {
          deletePlayer(videoToDelete.id);
          deletedVideoIds.add(videoToDelete.id);
          console.log(`🗑️ Deleted video at index ${previousIndex}: ${videoToDelete.title}`);
        }
      }
      
      if (simulationState.currentIndex + 3 >= simulationState.feed.length) {
        preloadNextVideos();
      }
      updateFocusClasses();
    }, 100);
  }, { passive: true });
}

function updateFocusClasses() {
  document.querySelectorAll('.video-post').forEach((post, idx) => {
    post.classList.remove('item-focus', 'item-next', 'item-hide');
    if (idx < simulationState.currentIndex) post.classList.add('item-hide');
    else if (idx === simulationState.currentIndex) post.classList.add('item-focus');
    else if (idx === simulationState.currentIndex + 1) post.classList.add('item-next');
  });
}

function handleFeedClick(e) {
  const target = e.target;
  if (!target.classList.contains('action-icon')) return;
  const action = target.dataset.action;
  const videoId = parseInt(target.dataset.videoId);
  const video = videoData.find(v => v.id === videoId);

  switch (action) {
    case 'like':
      target.classList.toggle('liked');
      if (target.classList.contains('liked')) target.classList.replace('far', 'fas');
      else target.classList.replace('fas', 'far');
      trackEngagement(video, 'like');
      preloadNextVideos();
      break;
    case 'comment':
      handleCommentClick(videoId);
      trackEngagement(video, 'comment');
      preloadNextVideos();
      break;
    case 'share':
      handleShareClick(videoId);
      trackEngagement(video, 'share');
      preloadNextVideos();
      break;
  }
}

function trackEngagement(video, type) {
  const weights = { like: 3, comment: 4, share: 3, longView: 2, completedView: 7};
  const weight = (weights[type] || 1);
  const before = { ...userProfile.engagement };
  video.hashtags.forEach(tag => {
    userProfile.engagement[tag] = (userProfile.engagement[tag] || 0) + weight;
  });
  console.log(`💥 ${type.toUpperCase()} on "${video.title}" (+${weight} pts)`);
  console.log('Before:', before);
  console.log('After:', userProfile.engagement);
  console.log('---');
}

function handleCommentClick(videoId) {
  const modalContainer = document.getElementById('modal-container');
  modalContainer.innerHTML = `
  <form id="comment-form" onsubmit=""; document.getElementById('modal-container').innerHTML='';">
    <div class="modal is-active comment-modal">
      <div class="modal-background" onclick="document.getElementById('modal-container').innerHTML=''"></div>
      <div class="modal-content" style="max-width: 400px;">
        <div class="box">
          <div style="padding:20px; background: #262626; color: white; border-radius: 12px;">
            <h3 style="margin-bottom:16px;">Comments</h3>
            <p style="color: #8e8e8e;">No comments yet...</p>
            <input class="input mt-3" type="text" placeholder="Add a comment..." style="background: #1e1e1e; color: white; border: 1px solid #404040;">
          </div>
        </div>
      </div>
    </div>
    </form>
  `;
}

function handleShareClick(videoId) {
  const video = videoData.find(v => v.id === videoId);
  console.log('📱 Shared', video.title);
}





