# Algorithmic Bias Simulator - Implementation Plan

This document outlines the high-level implementation plan for creating a "doom scroll" simulation to bring awareness to systemic and cognitive biases present in social media algorithms.

## 1. Project Overview

The goal of this project is to create an interactive web application that simulates a social media feed. Users will scroll through content, and their engagement (likes, time spent on a video) will dynamically alter the feed to demonstrate how algorithms can create filter bubbles and reinforce biases like confirmation bias, anchoring bias, and systemic bias. At the end of the simulation, users will be presented with a personalized "Wrapped" summary of their scrolling behavior and its impact.

## 2. Core Features

1.  **Fake Social Media Feed:** A vertically scrolling feed of video content that mimics popular social media platforms.
2.  **Engagement Tracking:** The application will track user interactions, such as "liking" a post and how long they watch each video.
3.  **Dynamic Content "Algorithm":** A simple, rule-based algorithm that adjusts the content shown to the user based on their engagement. The algorithm will favor content with hashtags similar to the content the user has engaged with most.
4.  **Scrolling "Wrapped" Summary:** A final summary page that visualizes the user's scrolling journey, highlighting how their feed changed over time and explaining the biases that were reinforced.

## 3. Technical Stack

-   **HTML:** For the structure of the web pages.
-   **CSS:** For styling the feed, videos, and the wrapped summary to look like a modern social media app.
-   **JavaScript (JS):** For all the client-side logic, including engagement tracking, the content algorithm, and dynamically updating the feed.
-   **jQuery (Optional):** Can be used for simplifying DOM manipulation and creating smooth animations/transitions between videos.

## 4. Page Structure

We will use two main HTML pages. While a single-page application is possible, a two-page approach is recommended for this project to keep the code simple, organized, and focused. It separates the logic of the simulation from the logic of the results, which is a cleaner approach for a time-constrained project.

1.  **`index.html` (The Feed):**
    -   This will be the main page for the scrolling simulation.
    -   It will contain the video feed.
    -   It will handle all the engagement tracking logic.
    -   When the simulation is over, it will redirect the user to the `wrapped.html` page, passing the collected data.

2.  **`wrapped.html` (The Summary):**
    -   This page will display the results of the user's session.
    -   It will receive data from `index.html` (e.g., via `localStorage`).
    -   It will feature visualizations and explanations of the biases demonstrated during the scroll.

## 5. Implementation Steps

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

## 6. Bias Demonstration Plan
- EMPHASIZE WE ARE NOT JUDGING THE USERS TASTE BUT SIMPLY OPENING THEIR EYES TO THE HABITS
-   **Confirmation & Anchoring Bias:** The core algorithm simulation will demonstrate this naturally. As a user engages with a topic, they will be fed more of it, confirming their initial "choice" and anchoring them to that perspective. The "Wrapped" page will explicitly state this.
-   **Systemic Bias:** This can be shown by having the initial pool of videos slightly favor certain topics, showing how the platform itself can have a built-in bias even before user engagement.
-   **Positive vs. Negative Loop:** The video content should be a mix of positive/uplifting content and more negative/divisive content. The "Wrapped" summary can show which path the user went down, illustrating that the same mechanisms can create both positive and negative feedback loops.
