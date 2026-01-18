// Keep your video data structure but start with first 2
    const videoData = [
      {
        id: 1,
        videoId: 'UhVc3B-OQIs',
        title: 'Ranking The Best Slow Motion Dogs 🐶',
        author: 'pettastic-clip',
        hashtags: ['funny', 'pets', 'dogs']
      },
      {
        id: 2,
        videoId: '0tng6DqwT3w',
        title: 'Ranking Dramatic Husky Moments 😂',
        author: 'accidentalentertianment',
        hashtags: ['funny', 'pets', 'dogs']
      }, 
      {
        id: 3,
        videoId: 'GWkswyays5M',
        title: 'Fate of Ophelia - Taylor Swift', 
        author: 'Taylor Swift',
        hashtags: ['music', 'pop']
      },
      {
        id: 4,
        videoId: '3tmd-ClpJxA',
        title: 'Dynamite - BTS',}
      // Add more from your main.js when ready
    ];

    let simulationState = {
      feed: [],
      viewedIds: new Set(),
      simulationLength: 10,
      playerObjects: {},
      observer: null,
      currentIndex: 0
    };

    let userProfile = {
      engagement: {}
    };

    let ytReady = false;

    // YouTube API ready
    function onYouTubeIframeAPIReady() {
      console.log('YouTube API ready');
      ytReady = true;
      initializeFeed();
    }

    function initializeFeed() {
      const feedContainer = document.getElementById('feed-container');
      feedContainer.innerHTML = '';

      // Always load first 2 videos
      videoData.slice(0, 2).forEach(video => {
        const post = createPlayer(video);
        simulationState.feed.push(video);
        simulationState.viewedIds.add(video.id);
      });

      setupObserver();
      setupSnapScroll();
    }

    const threshold = 5000; // 5 second threshhold long 

    function createPlayer(video) {
      const feedContainer = document.getElementById('feed-container');
      
      const postElement = document.createElement('div');
      postElement.className = 'video-post';
      postElement.id = `post-video-${video.id}`;
      postElement.dataset.videoId = video.id;

      const playerContainer = document.createElement('div');
      playerContainer.className = 'player-container';
      playerContainer.id = `player-video-${video.id}`;

      const overlayElement = document.createElement('div');
      overlayElement.className = 'video-overlay';
      overlayElement.innerHTML = `
        <div class="video-info">
          <h1 style='color:white;' class="author">${video.author}</h1>
          <h2 style='color:white;' class="title">${video.title}</h2>
        </div>
        <div class="video-actions">
          <span class="action-icon like-button" data-action="like" data-video-id="${video.id}">❤️</span>
          <span class="action-icon" data-action="comment" data-video-id="${video.id}">💬</span>
          <span class="action-icon" data-action="share" data-video-id="${video.id}">📤</span>
        </div>
      `;

      postElement.appendChild(playerContainer);
      postElement.appendChild(overlayElement);
      feedContainer.appendChild(postElement);

      // Create YouTube player
      if (ytReady) {
        const player = new YT.Player(`player-video-${video.id}`, {
          height: '640',
          width: '390',
          videoId: video.videoId,
          playerVars: {
            autoplay: 1,
            mute: 1,  // REQUIRED for autoplay to work reliably
            playsinline: 1,
            controls: 0,
            fs: 0,     // disable fullscreen
            rel: 0,
            color: 'white',
            showinfo: 0,  // hide title/uploader
            iv_load_policy: 3  // hide annotations
          },
          events: {
            onReady: (event) => {
              event.target.playVideo();
            }
          }
        });

        simulationState.playerObjects[video.id] = player;
      }

      // Event listeners for actions
      overlayElement.querySelectorAll('.action-icon').forEach(icon => {
        icon.addEventListener('click', handleFeedClick);
      });

      // Update focus classes
      updateFocusClasses();

      return postElement;
    }

    function setupObserver() {
        const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
        const post = entry.target;
        const videoId = parseInt(post.dataset.videoId);
        const player = simulationState.playerObjects[videoId];
        const video = videoData.find(v => v.id === videoId);
      
      if (entry.isIntersecting && player) {
        player.playVideo();
        // Start 8s long view timer
        const longViewTimer = setTimeout(() => {
          trackEngagement(video, 'longView');
          console.log('Long view 8s+:', video.title);
        }, 8000); // 8 seconds
        
        player.longViewTimer = longViewTimer; // Store to clear later
      } else if (player) {
        player.pauseVideo();
        // Clear timer if not viewed 8s
        if (player.longViewTimer) {
          clearTimeout(player.longViewTimer);
          player.longViewTimer = null;
        }
      }
    });
  }, { threshold: 0.6 }); // Higher threshold for "real" view

  simulationState.observer = observer;
  document.querySelectorAll('.video-post').forEach(post => observer.observe(post));
}


    function setupSnapScroll() {
      const feedContainer = document.getElementById('feed-container');
      let scrollTimeout;

      feedContainer.addEventListener('scroll', () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          const scrollTop = feedContainer.scrollTop;
          const newIndex = Math.round(scrollTop / window.innerHeight);
          simulationState.currentIndex = Math.max(0, Math.min(newIndex, simulationState.feed.length - 1));
          updateFocusClasses();
        }, 100);
      });

      // Keyboard navigation
      document.addEventListener('keydown', (e) => {
        const feedContainer = document.getElementById('feed-container');
        if (e.key === 'ArrowDown' || e.key === ' ') {
          e.preventDefault();
          if (simulationState.currentIndex < simulationState.feed.length - 1) {
            simulationState.currentIndex++;
            feedContainer.scrollTo({
              top: simulationState.currentIndex * window.innerHeight,
              behavior: 'smooth'
            });
          }
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          if (simulationState.currentIndex > 0) {
            simulationState.currentIndex--;
            feedContainer.scrollTo({
              top: simulationState.currentIndex * window.innerHeight,
              behavior: 'smooth'
            });
          }
        }
      });
    }

    function loadNextVideo() {
      const unseenVideos = videoData.filter(v => !simulationState.viewedIds.has(v.id));
      if (unseenVideos.length === 0) return;

      const nextVideo = unseenVideos[Math.floor(Math.random() * unseenVideos.length)];
      createPlayer(nextVideo);
      simulationState.feed.push(nextVideo);
      simulationState.viewedIds.add(nextVideo.id);
    }

    function updateFocusClasses() {
      document.querySelectorAll('.video-post').forEach((post, index) => {
        post.classList.remove('item-focus', 'item-next', 'item-hide');
        if (index < simulationState.currentIndex) {
          post.classList.add('item-hide');
        } else if (index === simulationState.currentIndex) {
          post.classList.add('item-focus');
        } else if (index === simulationState.currentIndex + 1) {
          post.classList.add('item-next');
        }
      });
    }

    function handleFeedClick(event) {
      const target = event.target;
      if (!target.classList.contains('action-icon')) return;

      const action = target.dataset.action;
      const videoId = parseInt(target.dataset.videoId);

      switch (action) {
        case 'like':
          target.classList.toggle('liked');
          trackEngagement(videoData.find(v => v.id === videoId), 'like');
          break;
        case 'comment':
          handleCommentClick(videoId);
          break;
        case 'share':
          handleShareClick(videoId);
          break;
      }
    }

    function trackEngagement(video, type) {
      const weights = { like: 2, comment: 3, share: 4, longView: 1 };
      const weight = weights[type] || 1;
      
      video.hashtags.forEach(tag => {
        userProfile.engagement[tag] = (userProfile.engagement[tag] || 0) + weight;
      });
    }

    function handleCommentClick(videoId) {
      const video = videoData.find(v => v.id === videoId);
      const modalContainer = document.getElementById('modal-container');
      modalContainer.innerHTML = `
        <div class="modal is-active">
          <div class="modal-background" onclick="document.getElementById('modal-container').innerHTML=''"></div>
          <div class="modal-content">
            <div class="box has-background-black has-text-white">
              <h3 class="title is-4 has-text-white">Comments</h3>
              <p>No comments yet...</p>
            </div>
          </div>
          <button class="modal-close is-large" onclick="document.getElementById('modal-container').innerHTML=''"></button>
        </div>
      `;
      trackEngagement(video, 'comment');
    }

    function handleShareClick(videoId) {
      const video = videoData.find(v => v.id === videoId);
      trackEngagement(video, 'share');
      console.log('Shared:', video.title);
    }
