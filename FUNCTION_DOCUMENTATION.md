# Function Documentation - main.js

## Overview
This file contains all the core functions for the Instagram DoomScroll Simulator. The app creates a personalized video feed based on user engagement, blocks backward scrolling, and saves user profile data to localStorage at the end.

---

## Core Initialization Functions

### `onYouTubeIframeAPIReady()`
**Purpose**: Callback function triggered when YouTube's iframe API finishes loading.

**What it does**:
- Sets `ytReady = true` to indicate YouTube API is available
- Calls `initializeFeed()` to start building the video feed
- Exposed to global scope via `window.onYouTubeIframeAPIReady`

---

### `initializeFeed()`
**Purpose**: Initializes the entire video feed on page load.

**What it does**:
1. Clears the feed container
2. Loads the first 5 **profiling videos** (diverse content from different categories)
3. Logs profiling phase start
4. Pre-computes the next 2 videos
5. Sets up the Intersection Observer
6. Sets up snap scrolling behavior

---

## Video Creation & Management

### `createPost(video)`
**Purpose**: Creates a single video post element and YouTube player.

**Parameters**: `video` - video object with id, videoId, title, author, hashtags

**What it does**:
1. **Synchronously** adds video to `simulationState.feed` and `viewedIds` (ensures feed order = DOM order)
2. Captures video's index position (`myIndex`)
3. Creates DOM structure:
   - Video post container
   - Player container for YouTube iframe
   - Overlay with author, title, action icons (like, comment, share)
4. Initializes YouTube player with:
   - Autoplay, muted, looping
   - No controls, no fullscreen
5. Registers event listeners:
   - `onReady`: Autoplays if at current index
   - `onStateChange`: Tracks **completed view** when video ends (7 pts!), then loops
6. Adds click handlers for action icons
7. Registers with Intersection Observer

**Key fix**: Feed array is populated **before** player loads, ensuring consistent indexing.

---

### `deletePlayer(videoId)`
**Purpose**: Frees memory by destroying YouTube players after scrolling past them.

**Parameters**: `videoId` - ID of video to clean up

**What it does**:
1. Calls `player.destroy()` to free YouTube iframe resources
2. Removes player from `simulationState.playerObjects`
3. Clears the iframe HTML (`innerHTML = ''`)
4. **Does NOT remove DOM element** - keeps container to preserve scroll indexes

**Why it matters**: Without this, all 20 videos would stay loaded in memory = laggy performance.

---

## Video Selection & Personalization

### `computeNextVideos(num = 2)`
**Purpose**: Pre-calculates which videos to show next.

**Parameters**: `num` - number of videos to compute (default 2)

**What it does**:
1. Calls `getNextVideo()` multiple times
2. Stores results in `simulationState.nextVideos`
3. Logs preview of upcoming videos with hashtags

---

### `preloadNextVideos()`
**Purpose**: Actually creates the next video posts when user approaches the end of loaded content.

**What it does**:
1. Checks if already loading or hit max (20 videos)
2. **If simulation complete (20 videos)**: Saves profile to localStorage 💾
3. Creates posts for next 2 videos from `simulationState.nextVideos`
4. Calls `computeNextVideos()` to queue up more
5. Uses `viewedIds` to prevent duplicates

**Trigger**: Called when user scrolls to index `currentIndex + 3 >= feed.length`

---

### `getNextVideo()`
**Purpose**: Smart algorithm that selects the next video based on user engagement.

**Returns**: Video object OR null if feed is full

**How it works**:

**Phase 1: Profiling (first ~6 videos OR engagement < 10 pts)**
- Returns random unseen videos
- Builds diverse profile
- Logs: "⏳ Still profiling..."

**Phase 2: Personalization (after profile built)**
1. Identifies user's top 3 hashtags by engagement score
2. Creates candidate list:
   - All videos matching top hashtags (weighted by score)
   - 30% random unseen videos (for exploration)
3. Randomly picks from weighted candidates
4. Logs selected video + reasoning

**Example**:
```
User profile: { tech: 15, funny: 8, conspiracy: 5 }
Top tags: [tech, funny, conspiracy]
→ Prioritizes tech/funny videos, but still shows some variety
```

---

## Scroll & Interaction Management

### `setupObserver()`
**Purpose**: Uses Intersection Observer API to detect which video is currently visible.

**What it does**:
1. Creates observer with 50% threshold (video is "visible" when 50% on screen)
2. When video enters view AND matches `currentIndex`:
   - Plays that video
   - Pauses all other videos
   - Sets 3-second timer to track "longView" (2 pts)
3. Ensures only one video plays at a time

---

### `setupSnapScroll()`
**Purpose**: Main scroll controller - handles snap behavior, deletion, preloading, and localStorage saving.

**What it does**:

**Setup**:
- Tracks `deletedVideoIds` Set to prevent double-deletion
- Blocks Arrow Up key (preventDefault)

**On scroll event (debounced 100ms)**:
1. **Block upward scrolling**: If `newIndex < previousIndex`, snaps back down
2. Updates `simulationState.currentIndex`
3. **End-of-simulation check**: If at last video + 20 videos loaded → saves profile to localStorage 💾
4. **Delete previous video**: Destroys player for `feed[previousIndex]` (the one we just left)
5. **Preload check**: If within 3 videos of end → calls `preloadNextVideos()`
6. Updates CSS focus classes

**Key innovation**: Deletes video we scrolled AWAY from, not the one "above" current position.

---

### `updateFocusClasses()`
**Purpose**: Updates CSS classes to show/hide/focus videos based on scroll position.

**CSS classes applied**:
- `.item-hide` - Videos before current (opacity 0, scaled down)
- `.item-focus` - Current video (opacity 1, scale 1)
- `.item-next` - Next video (opacity 1, scale 1, preloaded)

---

## User Interaction Handlers

### `handleFeedClick(e)`
**Purpose**: Routes clicks on action icons (like, comment, share) to appropriate handlers.

**What it does**:
1. Checks if click target is an action icon
2. Extracts action type and video ID from data attributes
3. Routes to handler:
   - **Like**: Toggles heart icon (far ↔ fas), calls `trackEngagement(video, 'like')` (3 pts)
   - **Comment**: Opens modal, calls `trackEngagement(video, 'comment')` (4 pts)
   - **Share**: Logs share, calls `trackEngagement(video, 'share')` (3 pts)
4. Calls `preloadNextVideos()` after each action

---

### `trackEngagement(video, type)`
**Purpose**: Records user engagement and updates their profile for personalization.

**Parameters**:
- `video` - Video object
- `type` - Engagement type: `like`, `comment`, `share`, `longView`, `completedView`

**Engagement Weights**:
```javascript
{
  like: 3,
  comment: 4,
  share: 3,
  longView: 2,
  completedView: 7  // 🎯 HIGHEST - watching full video shows strong interest
}
```

**What it does**:
1. Gets weight for engagement type
2. Adds weight to ALL hashtags on the video
3. Logs before/after engagement scores

**Example**:
```
Video hashtags: ['tech', 'business']
Action: completedView (7 pts)
Result: tech += 7, business += 7
```

**Note**: Does NOT save to localStorage here - only at end of simulation!

---

### `handleCommentClick(videoId)`
**Purpose**: Opens a comment modal overlay.

**What it does**:
1. Creates modal HTML with dark theme styling
2. Shows "No comments yet..." placeholder
3. Includes input field for adding comments
4. Click outside or close button → clears modal

**Note**: Comments aren't actually saved/functional - just for UX simulation.

---

### `handleShareClick(videoId)`
**Purpose**: Simulates sharing a video.

**What it does**:
- Logs share action to console
- In real app, would open share dialog/copy link

---

## Key Data Structures

### `simulationState`
```javascript
{
  feed: [],              // Array of video objects in DOM order
  viewedIds: Set(),      // IDs of videos already shown (prevents duplicates)
  maxVideos: 20,         // Total videos in simulation
  playerObjects: {},     // Map of videoId → YouTube player instance
  observer: null,        // IntersectionObserver instance
  currentIndex: 0,       // Current scroll position (0-19)
  nextVideos: [],        // Pre-computed next 2 videos
  profileBuilt: false    // Switches to personalization after ~6 views
}
```

### `userProfile`
```javascript
{
  engagement: {
    'tech': 15,
    'funny': 8,
    'conspiracy': 5,
    'health': 3,
    // ... scores for each hashtag
  }
}
```

**Saved to localStorage** at simulation end as:
```javascript
localStorage.setItem('userProfile', JSON.stringify(userProfile));
```

---

## Engagement Scoring Summary

| Action | Points | When it fires |
|--------|--------|--------------|
| **Completed View** | 7 | User watches video to the end |
| **Comment** | 4 | Clicks comment icon |
| **Like** | 3 | Clicks heart icon |
| **Share** | 3 | Clicks share icon |
| **Long View** | 2 | Watches for 3+ seconds |

Higher scores = stronger signal for personalization algorithm.

---

## Flow Diagram

```
Page Load
  ↓
YouTube API Ready → onYouTubeIframeAPIReady()
  ↓
initializeFeed()
  ↓
Load 5 profiling videos → createPost() × 5
  ↓
setupObserver() + setupSnapScroll()
  ↓
User scrolls/interacts
  ↓
setupSnapScroll() → Delete previous, preload next
  ↓
getNextVideo() → Personalized selection
  ↓
User reaches video 20
  ↓
Save to localStorage 💾
```

---

## localStorage Access

**To view saved data** (in browser console):
```javascript
JSON.parse(localStorage.getItem('userProfile'))
```

**To clear data** (reset simulation):
```javascript
localStorage.removeItem('userProfile')
```
