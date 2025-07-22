<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Glass Music Player</title>
    <meta name="theme-color" content="#2980b9">
    <link rel="stylesheet" href="style.css">
    <link rel="icon" href="thumbnails/default.jpg" id="dynamicFavicon">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body>
    <div class="container">
        <div class="player glass">
            <div class="player-header">
                <h1>Glass Player</h1>
                <div class="theme-toggle">
                    <i class="fas fa-moon"></i>
                </div>
            </div>
            
            <div class="now-playing">
                <div class="album-art">
                    <img id="albumArt" src="thumbnails/default.jpg" alt="Album Art">
                    <div class="waveform">
                        <div class="wave"></div>
                        <div class="wave"></div>
                        <div class="wave"></div>
                        <div class="wave"></div>
                        <div class="wave"></div>
                    </div>
                </div>
                <div class="song-info">
                    <h2 id="songTitle">No song selected</h2>
                    <p id="songArtist">Artist</p>
                </div>
            </div>
            
            <div class="progress-container">
                <div class="progress-bar">
                    <div class="progress" id="progress"></div>
                </div>
                <div class="time-info">
                    <span id="currentTime">0:00</span>
                    <span id="duration">0:00</span>
                </div>
            </div>
            
            <div class="controls">
                <button class="control-btn" id="shuffleBtn" title="Shuffle">
                    <i class="fas fa-random"></i>
                </button>
                <button class="control-btn" id="prevBtn" title="Previous">
                    <i class="fas fa-step-backward"></i>
                </button>
                <button class="control-btn" id="back10Btn" title="-10 seconds">
                    <i class="fas fa-backward"></i>
                </button>
                <button class="control-btn play-btn" id="playBtn" title="Play/Pause">
                    <i class="fas fa-play"></i>
                </button>
                <button class="control-btn" id="forward10Btn" title="+10 seconds">
                    <i class="fas fa-forward"></i>
                </button>
                <button class="control-btn" id="nextBtn" title="Next">
                    <i class="fas fa-step-forward"></i>
                </button>
                <button class="control-btn" id="repeatBtn" title="Repeat">
                    <i class="fas fa-redo"></i>
                </button>
            </div>
            
            <div class="volume-control">
                <button class="control-btn" id="muteBtn" title="Mute">
                    <i class="fas fa-volume-up"></i>
                </button>
                <input type="range" id="volumeSlider" min="0" max="1" step="0.01" value="0.7">
            </div>
            
            <div class="playlist-container">
                <div class="playlist-header">
                    <h3>Playlist</h3>
                    <div class="sort-options">
                        <select id="sortSelect">
                            <option value="title">By Title</option>
                            <option value="artist">By Artist</option>
                            <option value="duration">By Duration</option>
                        </select>
                    </div>
                </div>
                <div class="playlist" id="playlist"></div>
            </div>
        </div>
    </div>

    <audio id="audioPlayer"></audio>
    
    <script src="script.js"></script>
</body>
</html>