// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

// Your web app's Firebase configuration
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
console.log("Firebase initialized:", app);

// Handle Signup with Firebase Authentication
document.getElementById('signup-submit-btn').addEventListener('click', (event) => {
    event.preventDefault();
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const errorMessage = document.getElementById('signup-error-message');

    if (errorMessage) errorMessage.textContent = "";

    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            console.log("Signup successful:", userCredential);
            alert("Signup successful! You can now log in.");
            document.getElementById('signup-page').style.display = 'none';
            document.getElementById('login-page').style.display = 'block';
            document.getElementById('mood-detection').style.display = 'none';
        })
        .catch((error) => {
            console.error("Error during signup:", error);
            if (errorMessage) errorMessage.textContent = error.message;
        });
});


// Handle Login with Firebase Authentication
document.getElementById('login-btn').addEventListener('click', (event) => {
    event.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const errorMessage = document.getElementById('login-error-message');

    if (errorMessage) errorMessage.textContent = "";

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            alert("Login successful! Welcome to EmotiPlay.");
            document.getElementById('login-page').style.display = 'none';
            document.getElementById('mood-detection').style.display = 'block';
        })
        .catch((error) => {
            if (errorMessage) errorMessage.textContent = error.message;
        });
});

// Open manual mood input section
document.getElementById('manual-mood-btn').addEventListener('click', () => {
    document.getElementById('mood-detection').style.display = 'none';
    document.getElementById('manual-mood-section').style.display = 'block';
});

// Submit manual mood
document.getElementById('submit-manual-mood-btn').addEventListener('click', submitManualMood);
document.getElementById('manual-mood-input').addEventListener('keydown', (event) => {
    if (event.key === 'Enter') submitManualMood();
});

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
    fetch('http://127.0.0.1:5001/spotify-songs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mood: mood, offset: currentSpotifyOffset }),
    })
        .then(response => response.json())
        .then(data => {
            const resultsList = document.getElementById('results-list');
            resultsList.innerHTML = '';
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
        .catch(error => console.error('Error getting Spotify songs:', error));
}
document.getElementById('signup-btn-toggle').addEventListener('click', () => {
    // Hide login page and show signup page
    document.getElementById('login-page').style.display = 'none';
    document.getElementById('signup-page').style.display = 'block';
});

// Emoji animation
function createEmoji() {
    const emojis = ['🙂', '😊', '🥰', '😭', '😄', '😎', '🥳', '😤', '😝', '😌'];
    const emojiContainer = document.querySelector('.emoji-background');
    const emojiElement = document.createElement('div');
    emojiElement.className = 'emoji';
    emojiElement.innerText = emojis[Math.floor(Math.random() * emojis.length)];
    emojiElement.style.left = Math.random() * 100 + 'vw';
    emojiElement.style.top = Math.random() * 100 + 'vh';
    emojiElement.style.fontSize = Math.random() * 3 + 2 + 'rem';
    emojiElement.style.opacity = Math.random() * 0.8 + 0.2;
    emojiElement.style.transform = `rotate(${Math.random() * 360}deg)`;
    emojiContainer.appendChild(emojiElement);
    setTimeout(() => {
        emojiElement.classList.add('fade-out');
        setTimeout(() => emojiContainer.removeChild(emojiElement), 2000);
    }, 3000);
}

// Create emojis at regular intervals
setInterval(createEmoji, 1000);
