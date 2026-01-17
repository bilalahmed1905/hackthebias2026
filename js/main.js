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
      }
      // Add more from your main.js when ready
    ];

    const commentData = [
      {
        topic: 'funny',
        comments: [
          'This made my day! 😂',
          'I can\'t stop laughing! 🤣',
          'Best video ever! 😆',
          'hilarious',
          'this is crazy']
      },
      {
        topic: 'pets',
        comments: [
          'So cute! 🥰',
          'I want',
          'Adorable!',
          'Love this!',
          'precious']
      },
      {
        topic: 'news',
        comments: [
          'Very informative.',
          'Thanks for sharing this.',
          'Eye-opening content.',
          'important info',
          'must watch']
      }

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
          <h1 class="author">${video.author}</h1>
          <h2 class="title">${video.title}</h2>
        </div>
        <div class="video-actions">
           <span class="action-icon like-button" data-action="like" data-video-id="${video.id}">
           <i class="far fa-heart"></i>
           </span>
           <span class="action-icon" data-video-id="${video.id}">
            <i class="far fa-comment" onClick="handleCommentClick(${video.id})"></i>
           </span>
           <span class="action-icon" data-action="share" data-video-id="${video.id}">
           <i class="far fa-paper-plane"></i>
           </span>

          

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
            // playsinline: 1,
            controls: 0,
            mute: 1,
            rel: 0,
            modestbranding: 1
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
          const playerId = post.querySelector('.player-container').id;
          const player = simulationState.playerObjects[post.dataset.videoId];

          if (entry.isIntersecting && player) {
            player.playVideo();
          } else if (player) {
            player.pauseVideo();
          }
        });
      }, { threshold: 0.5 });

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
          const heartIcon = target;
          heartIcon.classList.toggle('liked');
          heartIcon.classList.toggle('fas');     // filled heart
          heartIcon.classList.toggle('far');     // outline heart
          trackEngagement(videoData.find(v => v.id === videoId), 'like');
          break;
          // target.classList.toggle('liked');
          // trackEngagement(videoData.find(v => v.id === videoId), 'like');
          // break;
        case 'comment':
          handleCommentClick(videoId);
          break;
        case 'share':
          handleShareClick(videoId);
          break;
      }
    }

    function trackEngagement(video, type) {
      const weights = { like: 2, comment: 3, share: 4 };
      const weight = weights[type] || 1;
      
      video.hashtags.forEach(tag => {
        userProfile.engagement[tag] = (userProfile.engagement[tag] || 0) + weight;
      });
    }

    
    function handleCommentClick(videoId) {
      const video = videoData.find(v => v.id === videoId);
      const modalContainer = document.getElementById('modal-container');
      
      modalContainer.innerHTML = `
        <div class="modal is-active comment-modal">
          <div class="modal-background" onclick="document.getElementById('modal-container').innerHTML=''"></div>
          <div class="modal-content" style="max-width: 400px;">
            <div class="box has-background-black-bis has-text-white-bis" style="border-radius: 12px;">
              <div class="modal-card-head has-background-black-bis pb-4">
                <p class="modal-card-title has-text-white-bis mb-0">Comments</p>
                <button class="delete" style="position: absolute; right: 10px; top: 10px;" onclick="document.getElementById('modal-container').innerHTML=''"></button>
              </div>
              <div class="modal-card-body p-4">
                <p class="has-text-grey-light mb-4">No comments yet... 💬</p>
                <div class="field">
                  <div class="control">
                    <input class="input has-background-grey-darker has-text-white" type="text" placeholder="Add a comment...">
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
      
      trackEngagement(video, 'comment');
    }
    
    function handleCommentClick1(videoId) {
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