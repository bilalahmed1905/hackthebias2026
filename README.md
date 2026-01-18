# Scroll The Bias

**An interactive social media simulator that reveals how algorithmic bias shapes what you see.**

🔗 **[Try it live](https://scrollthebias.netlify.app)**

## What is this?

Scroll The Bias is an educational web experience that simulates a social media feed to demonstrate how recommendation algorithms can create filter bubbles and reinforce cognitive biases. By tracking your engagement (likes, watch time), the simulator gradually personalizes your feed—showing you firsthand how your online behavior shapes the content you see.

At the end of the simulation, you'll receive a personalized "Wrapped" summary revealing how algorithmic bias quietly influenced your scrolling journey.

> **Note:** We're not judging your taste or preferences—we're simply opening your eyes to the invisible mechanisms that shape your digital experience.

## Why does this matter?

Social media algorithms are designed to maximize engagement by showing you content similar to what you've already interacted with. While this can feel convenient, it creates **filter bubbles** that:
- Reinforce existing beliefs (confirmation bias)
- Limit exposure to diverse perspectives
- Can gradually lead users toward more extreme or niche content
- Operate invisibly, without users realizing their feed is being personalized

This project makes those invisible forces visible.

## Features

1.  **Fake Social Media Feed:** A vertically scrolling feed of video content that mimics popular social media platforms.
2.  **Engagement Tracking:** The application will track user interactions, such as "liking" a post and how long they watch each video.
3.  **Dynamic Content "Algorithm":** A simple, rule-based algorithm that adjusts the content shown to the user based on their engagement. The algorithm will favor content with hashtags similar to the content the user has engaged with most.
4.  **Scrolling "Wrapped" Summary:** A final summary page that visualizes the user's scrolling journey, highlighting how their feed changed over time and explaining the biases that were reinforced.

## Tech Stack

- **Frontend:** Vanilla JavaScript (ES6+), HTML5, CSS3
- **Video Embedding:** YouTube IFrame Player API
- **Data Persistence:** localStorage
- **Styling:** Bulma CSS framework + custom CSS
- **Hosting:** Netlify

## Project Structure

```
hackthebias2026/
├── index.html          # Main simulation feed
├── wrap.html           # "Wrapped" results page
├── css/
│   ├── style.css       # Feed styling
│   └── wrapper.css     # Wrapped page styling
├── js/
│   ├── main.js         # Core algorithm & engagement tracking
│   └── videoData.js    # Curated video dataset
└── videos/             # Video thumbnails/assets
```

---

## Technical Implementation

<details>
<summary><strong>How the Algorithm Works</strong></summary>

### Phase 1: Profiling (First ~6 videos)
- Shows diverse content across all topics
- **100% random selection** to build an accurate user profile
- Tracks engagement: likes (+3 pts), comments (+4 pts), shares (+3 pts), long views (+2 pts), completed views (+7 pts)

### Phase 2: Personalization (After 6+ videos)
- Identifies your top 3 most-engaged hashtags
- Creates a candidate pool:
  - **70% weight:** Videos matching your interests
  - **30% weight:** Random exploration videos
- Uses weighted random selection to pick the next video

**Example:** If you engage heavily with `#tech` (15 points), tech videos are 15x more likely to appear than random content.

</details>

<details>
<summary><strong>Video Content Strategy</strong></summary>

We use a curated list of **pre-selected YouTube video IDs** embedded via the YouTube IFrame Player API:
- ✅ No API key required
- ✅ Total control over content diversity
- ✅ Professional video player experience
- ✅ Reliable (no API quota issues)

Each video is tagged with hashtags (`#tech`, `#conspiracy`, `#health`, etc.) that power the recommendation algorithm.

</details>

---

## Implementation Details

### Phase 1: Setup and Feed Creation

1.  **Create Project Structure:**
    -   `index.html`
    -   `wrapped.html`
    -   `css/style.css`
    -   `js/main.js`
    -   `js/wrapped.js`
    -   `videos/` (a directory to store video files)

2.  **Source Video Content (The Hybrid Approach - Controlled & Realistic):**
    -   **The Challenge:** Using a live API to fetch random videos is complex (requires API keys, quotas) and doesn't truly simulate a *personalized* feed. Hardcoding local video files is safe but less realistic.
    -   **The Solution (Best of Both Worlds):** We will **pre-select a curated list of YouTube video IDs** and use the official **YouTube IFrame Player API** to embed them. This gives us the polished look and feel of the YouTube player without the complexity and unreliability of live API search calls.
    -   **Why this is the best approach for this project:**
        -   **No API Key Needed:** The IFrame Player API does not require an API key or authentication. It's free and unlimited for embedding.
        -   **Total Control:** We can hand-pick the exact videos to create a balanced and diverse starting pool, which is essential for demonstrating the algorithm's filtering effect.
        -   **High Reliability:** The app won't break during the demo due to API quota issues or network errors from a search request.
        -   **Looks Professional:** The embedded YouTube player is high quality and handles all the video streaming logic for us.

3.  **Create Video Content Data (`js/main.js`):**
    -   In `js/main.js`, create a JavaScript array of objects. This will be our "database" of content. Each object will represent a video and contain the pre-selected YouTube video ID.
        -   `id`: A unique identifier.
        -   `videoId`: The YouTube video ID we copied from a YouTube Short's URL.
        -   `title`: A short, descriptive title.
        -   `hashtags`: An array of hashtags we assign to categorize the video (e.g., `['#tech', '#positive', '#news']`). This is the key to our simulated algorithm.
        -   `author`: A fake author name.

4.  **Build the Feed UI (`index.html` & `style.css`):**
    -   Create the basic HTML structure for a scrolling feed.
    -   Style the feed to look like a mobile social media app. Each post should take up the full viewport height.
    -   Add a "like" button icon to each post.

### Phase 2: Core Logic and Algorithm

1.  **Dynamically Load Videos (`js/main.js`):**
    -   Write a function to dynamically create and add video elements to the feed from the data array.
    -   Implement logic to load an initial, balanced set of videos to start the simulation.

2.  **Implement Engagement Tracking (`js/main.js`):**
    -   Add an event listener to the "like" button. When a user clicks it, store the hashtags of that video.
    -   Use the `Intersection Observer API` to detect which video is currently in the viewport. Track the time a user spends on each video. If they spend more than a certain threshold (e.g., 3 seconds), consider it engagement and store the hashtags.

3.  **Simulate the "Algorithm" (The Core of the Simulation):**
    -   **Clarification:** We are not building a real machine-learning algorithm. We are simulating its *effect* with a simple, rule-based system. The goal is to show the outcome of an algorithm, not to replicate its complexity.
    -   **The Mechanism for "Gradual Absurdity":**
        1.  **Curated Universe:** Our pre-selected list of 70-100 videos acts as the "universe" of content. This list will be intentionally diverse, containing broad topics (`#funny`, `#travel`) as well as niche or more extreme topics (`#conspiracy-theories`, `#weird-facts`).
        2.  **User Profile:** We'll create a simple JavaScript object to store the user's "interest profile." This profile will track the hashtags they engage with (through likes or watch time).
        3.  **The Feedback Loop:** A function `getNextVideo()` will decide what to show next.
            -   It starts by showing broad, neutral content.
            -   If the user engages with a video tagged `#weird-facts`, that hashtag gets a point in their interest profile.
            -   The next time `getNextVideo()` runs, it will have a higher probability of selecting another video from our "universe" that is also tagged with `#weird-facts`.
            -   If the user engages again, the preference becomes stronger. This creates the feedback loop where the content gets progressively more niche and "absurd," demonstrating how a user can be led down a rabbit hole.
        4.  **Injecting Randomness:** To keep it realistic, the algorithm won't be 100% deterministic. We'll use a probability model (e.g., 70% chance of a recommended video, 30% chance of a random one) to mimic how real platforms try to introduce new topics.

4.  **Implement Finite Scroll & Simulation End (`js/main.js`):**
    -   This is **not an infinite scroll**. The simulation will be designed to last for a fixed duration (e.g., 10-15 videos).
    -   As the user scrolls, use the `getNextVideo()` function to add new videos to the bottom of the feed.
    -   Keep track of how many videos have been shown. After the limit is reached, trigger the end of the simulation.

### Phase 3: The "Wrapped" Summary

1.  **Data Transfer (`js/main.js`):**
    -   When the simulation ends, store the engagement data (liked hashtags, most-watched topics, snapshots of the feed at different points) in `localStorage`.
    -   Redirect the user to `wrapped.html`.

2.  **Build the Wrapped UI (`wrapped.html` & `style.css`):**
    -   Design a visually appealing summary page.
    -   Create sections for:
        -   "Your Top Bias: Confirmation Bias"
        -   A timeline showing how the feed's topics narrowed over time.
        -   Snapshots of the 1st, 5th, and 10th and 20th videos to show the change.
        - as you engage, noise fills your feed because now (based on engagement) your feed is filled with the same type of things you engage with (hence quieting down the other side of the story)
        - Have an animation kinda zooming out the thumbnails of a bunch of videos that were engaged with at the end to add to that feel of being lost in noise
        -  MAYBE: Explanations of the different biases.

3.  **Display Personalized Data (`js/wrapped.js`):**
    -   On page load, retrieve the data from `localStorage`.
    -   Dynamically populate the `wrapped.html` page with the user's specific data.
    -   Use a simple charting library (like Chart.js) or just CSS to create visualizations of their engagement data.

## Demonstrated Biases

### Confirmation Bias
As you engage with content, the algorithm feeds you more of the same, confirming and reinforcing your initial interests—creating an echo chamber.

### Anchoring Bias
Your early interactions disproportionately influence what you see later, anchoring your entire feed to those first choices.

### Systemic Bias
Even the initial "diverse" feed has built-in biases based on which videos are included in the platform's content pool.

### Filter Bubble Effect
The gradual narrowing of content diversity as personalization increases, limiting exposure to alternative viewpoints.

---

## Local Development

```bash
# Clone the repository
git clone <repository-url>
cd hackthebias2026

# Open with a local server (required for ES6 modules)
# Option 1: Python
python -m http.server 8000

# Option 2: Node.js
npx http-server

# Option 3: VS Code Live Server extension
# Right-click index.html → "Open with Live Server"

# Navigate to localhost:8000
```

---

## Credits

Built for **Hack the Bias 2026** to raise awareness about algorithmic bias in social media.

**Disclaimer:** This is an educational simulation. No real user data is collected or stored beyond your browser's localStorage during the simulation session.

---

## License

MIT License - Feel free to use this project for educational purposes.
