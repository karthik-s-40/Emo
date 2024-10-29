const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');
const SpotifyWebApi = require('spotify-web-api-node');
// Placeholder for deep learning models (e.g., sentiment analysis)
const sentimentAnalysis = require('sentiment'); // For example, a simple sentiment package

dotenv.config();
const app = express();
app.use(express.json());

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});
// Load environment variables
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const SPOTIFY_REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI;

// Initialize Spotify API
const spotifyApi = new SpotifyWebApi({
  clientId: SPOTIFY_CLIENT_ID,
  clientSecret: SPOTIFY_CLIENT_SECRET,
  redirectUri: SPOTIFY_REDIRECT_URI
});

// Mood mapping for facial emotion detection
const moodMap = {
  happy: 'happy',
  sad: 'depressed',
  angry: 'angry',
  surprise: 'happy',
  neutral: 'neutral',
  disgust: 'angry',
  fear: 'horror'
};

// Mood keywords for text-based mood detection
const moodKeywords = {
    party: ['party', 'celebrate', 'dance', 'club', 'fun'],
    angry: ['angry', 'mad', 'rage', 'furious', 'annoyed', 'aggressive', 'vicious'],
    depressed: ['depressed', 'down', 'unhappy', 'hopeless', 'sad', 'mournful', 'somber', 'melancholic'],
    indian: ['indian', 'bollywood', 'desi'],
    classical: ['classical', 'orchestra', 'symphony', 'instrumental'],
    indie: ['indie', 'alternative', 'folk', 'independent'],
    pop: ['pop', 'popular', 'chart', 'mainstream'],
    chill: ['chill', 'relax', 'calm', 'laid-back', 'easy', 'chilled', 'carefree', 'cool', 'laid back'],
    romantic: ['love', 'romantic', 'romance', 'lustful'],
    horror: ['horror', 'afraid', 'spooky', 'ghost', 'fear', 'scary', 'terrifying', 'terror'],
    action: ['action', 'energetic', 'intense', 'dynamic', 'driving'],
    adventurous: ['adventurous', 'daring', 'brave', 'bold'],
    ambient: ['ambient', 'ethereal', 'atmospheric', 'airy'],
    cinematic: ['cinematic', 'dramatic', 'epic'],
    emotional: ['emotional', 'sentimental', 'heartfelt', 'touching'],
    upbeat: ['upbeat', 'happy', 'positive', 'optimistic', 'cheerful', 'fun', 'sunny'],
    nintys: ['nostalgia', 'nostalgic', 'yesteryear', 'vintage', 'retro', 'reflective'],
    motivational: ['motivational', 'inspirational', 'empowering', 'encouraging', 'motivation'],
    calm: ['calm', 'peaceful', 'serene', 'tranquil', 'meditative'],
    danger: ['danger', 'dark', 'ominous', 'tense', 'suspenseful'],
    futuristic: ['futuristic', 'tech', 'industrial', 'digital', 'glitchy'],
    happy: ['happy', 'joyful', 'elated', 'euphoric', 'sunshine'],
    gym: ['gym', 'workout', 'driven', 'hard', 'determined', 'relentless'],
    rap: ['rap', 'hip-hop', 'beats', 'rhymes', 'trap', 'bars'],
    hindi: ['hindi', 'bollywood', 'desi', 'filmi'],
    tamil: ['tamil', 'kollywood', 'south indian', 'tamil cinema'],
    telugu: ['telugu', 'tollywood', 'south indian'],
    punjabi: ['punjabi', 'bhangra', 'punjab', 'punjabi beats'],
    bengali: ['bengali', 'bangla', 'bengali folk'],
    marathi: ['marathi', 'lavani', 'marathi folk'],
    kannada: ['kannada', 'sandalwood', 'kannada songs'],
    malayalam: ['malayalam', 'mollywood', 'malayalam songs'],
    gujarati: ['gujarati', 'garba', 'gujarati folk'],
    odia: ['odia', 'odia folk', 'odia songs'],
    assamese: ['assamese', 'bihu', 'assamese folk'],
    comedy: ['comedy', 'funny', 'humor', 'joke', 'laugh', 'hilarious'],
    drama: ['drama', 'tragic', 'emotional', 'intense', 'theatrical'],
    devotional: ['devotional', 'spiritual', 'worship', 'prayer', 'mantra', 'sacred'],
    lofi: ['lofi', 'lo-fi'],
    evergreen: ['90s', '80s', 'evergreen'],
    Melody: ['melody', 'melodious'],

  
};

// Function to analyze mood based on text input
function analyzeMood(userInput) {
  const sentiment = new sentimentAnalysis();
  const result = sentiment.analyze(userInput);
  const detectedMoods = new Set();

  Object.entries(moodKeywords).forEach(([mood, keywords]) => {
    if (keywords.some(keyword => userInput.toLowerCase().includes(keyword))) {
      detectedMoods.add(mood);
    }
  });

  if (detectedMoods.size > 0) {
    return Array.from(detectedMoods).join(' and ');
  }

  return result.score > 0 ? 'happy' : result.score < 0 ? 'sad' : 'neutral';
}

// Route to analyze mood based on text input
app.post('/text-mood', (req, res) => {
  const { text } = req.body;
  const mood = analyzeMood(text);
  res.json({ mood });
});

// Function to get songs based on mood from Spotify
async function getSongsBasedOnMood(mood, offset = 0, limit = 10) {
  const authData = await spotifyApi.clientCredentialsGrant();
  spotifyApi.setAccessToken(authData.body.access_token);

  const response = await spotifyApi.searchTracks(mood, { limit, offset });
  const songs = response.body.tracks.items.map(track =>
    `${track.name} by ${track.artists[0].name} (URL: ${track.external_urls.spotify})`
  );

  return {
    songs,
    next_offset: response.body.tracks.items.length === limit ? offset + limit : null
  };
}

// Route to get Spotify songs based on mood with pagination
app.post('/spotify-songs', async (req, res) => {
  const { mood = 'happy', offset = 0 } = req.body;
  const result = await getSongsBasedOnMood(mood, offset);
  res.json(result);
});

// Function to get YouTube videos based on mood
async function getYouTubeVideos(mood, maxResults = 5, pageToken = null) {
  const params = {
    part: 'snippet',
    q: mood,
    type: 'video',
    maxResults,
    key: YOUTUBE_API_KEY
  };
  if (pageToken) params.pageToken = pageToken;

  const response = await axios.get('https://www.googleapis.com/youtube/v3/search', { params });
    const videos = response.data.items.map(video => {
    const videoTitle = video.snippet.title;
    const videoId = video.id.videoId;
    return `${videoTitle} (URL: https://www.youtube.com/watch?v=${videoId})`;
  });


  return {
    videos,
    next_page_token: response.data.nextPageToken || null
  };
}

// Route to get YouTube videos based on mood with pagination
app.post('/youtube-videos', async (req, res) => {
  const { mood = 'happy', next_page_token = null } = req.body;
  const result = await getYouTubeVideos(mood, 5, next_page_token);
  res.json(result);
});

// Route to render the home page (HTML can be served statically or via a view engine like EJS)
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Start the server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
