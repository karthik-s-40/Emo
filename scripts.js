// Firebase Initialization
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyAF2orjhXEv3RQIGTV99CG17i83GdTJARI",
    authDomain: "emotiplay-f82ff.firebaseapp.com",
    databaseURL: "https://emotiplay-f82ff-default-rtdb.firebaseio.com",
    projectId: "emotiplay-f82ff",
    storageBucket: "emotiplay-f82ff.appspot.com",
    messagingSenderId: "501171966288",
    appId: "1:501171966288:web:0fc9fae5fac8a49e361c55",
    measurementId: "G-8HN90S2HWX"
};

// Initialize Firebase and Firebase Auth
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
console.log("Firebase initialized successfully");

// Firebase Auth State Change Listener
onAuthStateChanged(auth, user => {
    console.log("Auth state changed:", user);
    updateUI(user); // Update UI based on user's authentication state
});

// Initial UI setup
updateUI(null); // Show login page initially

// Function to handle login
function handleLogin() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    console.log("Email:", email);
    console.log("Password:", password);

    if (!email || !password) {
        document.getElementById('error-message').textContent = "Email and password cannot be empty.";
        return;
    }

    signInWithEmailAndPassword(auth, email, password)
        .then(userCredential => {
            console.log("Successfully signed in:", userCredential);
            updateUI(userCredential.user);
        })
        .catch(error => {
            document.getElementById('error-message').textContent = error.message; // Display error to user
            console.error("Error during sign in:", error);
        });
}

// Function to handle signup
function handleSignup() {
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;

    console.log("Email:", email);
    console.log("Password:", password);

    // Validate input fields
    if (!email || !password) {
        document.getElementById('error-message').textContent = "Email and password cannot be empty.";
        return;
    }

    createUserWithEmailAndPassword(auth, email, password)
        .then(userCredential => {
            console.log("Successfully signed up:", userCredential);
            updateUI(userCredential.user);
        })
        .catch(error => {
            document.getElementById('error-message').textContent = error.message; // Display error to user
            console.error("Error during sign up:", error);
        });
}

// Listen for DOMContentLoaded event
document.addEventListener('DOMContentLoaded', () => {
    console.log("Document loaded, setting up event listeners...");

    // Event listener for login button
    document.getElementById('login-btn').addEventListener('click', () => {
        console.log("Login button clicked");
        handleLogin(); // Call the handleLogin function
    });

    // Event listener for signup button
    document.getElementById('signup-btn').addEventListener('click', () => {
        console.log("Signup button clicked");
        handleSignup(); // Call the handleSignup function
    });
});

// Update UI based on authentication state
// Update UI based on authentication state
function updateUI(user) {
    console.log("User state:", user);
    if (user) {
        // User is signed in
        document.getElementById('login-page').style.display = 'none'; // Hide login page
        document.querySelector('.container').style.display = 'block'; // Show main content

        // Optional: Remove login section from DOM
         document.getElementById('login-page').remove(); // Uncomment this line if you want to completely remove it from the DOM
    } else {
        // User is signed out
        document.getElementById('login-page').style.display = 'block'; // Show login page
        document.querySelector('.container').style.display = 'none';
    }
}

// Additional code for mood detection and song/video choices...
// (Rest of your code for mood detection and song/video handling goes here.)

// Handle facial mood detection
document.getElementById('facial-mood-btn').addEventListener('click', () => {
    fetch('/facial-mood')
        .then(response => response.json())
        .then(data => {
            const detectedMood = data.mood;
            document.getElementById('detected-mood').textContent = detectedMood;
            document.getElementById('mood-detection').style.display = 'none';
            document.getElementById('confirm-mood-section').style.display = 'block';
        })
        .catch(error => {
            console.error('Error detecting facial mood:', error);
            document.getElementById('error-message').textContent = "Error detecting mood. Please try again.";
        });
});

// Handle mood confirmation
document.getElementById('confirm-mood-btn').addEventListener('click', () => {
    document.getElementById('confirm-mood-section').style.display = 'none';
    document.getElementById('choice-section').style.display = 'block';
});

// Handle mood rejection
document.getElementById('reject-mood-btn').addEventListener('click', () => {
    document.getElementById('confirm-mood-section').style.display = 'none';
    document.getElementById('manual-mood-section').style.display = 'block';
});

// Submit manual mood
document.getElementById('manual-mood-btn').addEventListener('click', () => {
    document.getElementById('mood-detection').style.display = 'none';
    document.getElementById('manual-mood-section').style.display = 'block';
});

// Handle Enter key for manual mood input
document.getElementById('manual-mood-input').addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        submitManualMood();
    }
});

// Handle manual mood submission
document.getElementById('submit-manual-mood-btn').addEventListener('click', submitManualMood);

function submitManualMood() {
    const manualMood = document.getElementById('manual-mood-input').value;
    if (manualMood) {
        document.getElementById('manual-mood-section').style.display = 'none';
        document.getElementById('detected-mood').textContent = manualMood;
        document.getElementById('choice-section').style.display = 'block';
    } else {
        document.getElementById('error-message').textContent = "Please enter a mood.";
    }
}

// Handle song choice
document.getElementById('choose-songs-btn').addEventListener('click', () => {
    const mood = document.getElementById('detected-mood').textContent;
    fetchSpotifySongs(mood);
});

// Fetch Spotify songs
let currentSpotifyOffset = 0;

function fetchSpotifySongs(mood) {
    fetch('/spotify-songs', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mood: mood, offset: currentSpotifyOffset }),
    })
        .then(response => response.json())
        .then(data => {
            const resultsList = document.getElementById('results-list');
            resultsList.innerHTML = ''; // Clear previous results
            data.songs.forEach(song => {
                const li = document.createElement('li');
                li.textContent = song;
                resultsList.appendChild(li);
            });

            document.getElementById('pagination-songs').style.display = data.next_offset !== null ? 'block' : 'none';
            currentSpotifyOffset = data.next_offset || 0;
            document.getElementById('next-songs-btn').onclick = () => loadMoreSpotifySongs(mood);

            document.getElementById('choice-section').style.display = 'none';
            document.getElementById('results-section').style.display = 'block';
        })
        .catch(error => {
            console.error('Error getting Spotify songs:', error);
            document.getElementById('error-message').textContent = "Error fetching songs. Please try again.";
        });
}

// Load more Spotify songs
function loadMoreSpotifySongs(mood) {
    fetch('/spotify-songs', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mood: mood, offset: currentSpotifyOffset }),
    })
        .then(response => response.json())
        .then(data => {
            const resultsList = document.getElementById('results-list');
            data.songs.forEach(song => {
                const li = document.createElement('li');
                li.textContent = song;
                resultsList.appendChild(li);
            });

            currentSpotifyOffset = data.next_offset || 0;
            document.getElementById('pagination-songs').style.display = data.next_offset !== null ? 'block' : 'none';
        })
        .catch(error => {
            console.error('Error loading more Spotify songs:', error);
            document.getElementById('error-message').textContent = "Error loading more songs. Please try again.";
        });
}

// Handle video choice
document.getElementById('choose-videos-btn').addEventListener('click', () => {
    const mood = document.getElementById('detected-mood').textContent;
    fetchYouTubeVideos(mood);
});

// Fetch YouTube videos
let currentYouTubePageToken = null;

function fetchYouTubeVideos(mood) {
    fetch('/youtube-videos', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mood: mood, next_page_token: currentYouTubePageToken }),
    })
        .then(response => response.json())
        .then(data => {
            const resultsList = document.getElementById('results-list');
            resultsList.innerHTML = ''; // Clear previous results
            data.videos.forEach(video => {
                const li = document.createElement('li');
                li.textContent = video;
                resultsList.appendChild(li);
            });

            document.getElementById('pagination-videos').style.display = data.next_page_token ? 'block' : 'none';
            currentYouTubePageToken = data.next_page_token || null;
            document.getElementById('next-videos-btn').onclick = () => loadMoreYouTubeVideos(mood);

            document.getElementById('choice-section').style.display = 'none';
            document.getElementById('results-section').style.display = 'block';
        })
        .catch(error => {
            console.error('Error getting YouTube videos:', error);
            document.getElementById('error-message').textContent = "Error fetching videos. Please try again.";
        });
}

// Load more YouTube videos
function loadMoreYouTubeVideos(mood) {
    fetch('/youtube-videos', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mood: mood, next_page_token: currentYouTubePageToken }),
    })
        .then(response => response.json())
        .then(data => {
            const resultsList = document.getElementById('results-list');
            data.videos.forEach(video => {
                const li = document.createElement('li');
                li.textContent = video;
                resultsList.appendChild(li);
            });

            currentYouTubePageToken = data.next_page_token || null;
            document.getElementById('pagination-videos').style.display = data.next_page_token ? 'block' : 'none';
        })
        .catch(error => {
            console.error('Error loading more YouTube videos:', error);
            document.getElementById('error-message').textContent = "Error loading more videos. Please try again.";
        });
}
