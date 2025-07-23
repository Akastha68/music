document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const audioPlayer = document.getElementById('audioPlayer');
    const playBtn = document.getElementById('playBtn');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const progressBar = document.getElementById('progress');
    const currentTimeEl = document.getElementById('currentTime');
    const durationEl = document.getElementById('duration');
    const albumArt = document.getElementById('albumArt');
    const songTitle = document.getElementById('songTitle');
    const songArtist = document.getElementById('songArtist');
    const playlistEl = document.getElementById('playlist');
    const volumeSlider = document.getElementById('volumeSlider');
    const muteBtn = document.getElementById('muteBtn');
    const baseUrl = "";
    // Player State
    let songs = [];
    let currentSongIndex = 0;
    let isPlaying = false;
    let isShuffled = false;
    let isRepeated = false;
    let isMuted = false;
    let originalVolume = audioPlayer.volume;
    let notificationGranted = false;
    let notification = null;

    // Initialize
    initPlayer();
    initNotifications();
    initMediaSession();

    // Event Listeners
    playBtn.addEventListener('click', togglePlay);
    prevBtn.addEventListener('click', prevSong);
    nextBtn.addEventListener('click', nextSong);
    progressBar.parentElement.addEventListener('click', setProgress);
    audioPlayer.addEventListener('timeupdate', updateProgress);
    audioPlayer.addEventListener('ended', handleSongEnd);
    audioPlayer.addEventListener('play', () => updatePlayState(true));
    audioPlayer.addEventListener('pause', () => updatePlayState(false));
    audioPlayer.addEventListener('loadedmetadata', updateSongInfo);
    volumeSlider.addEventListener('input', setVolume);
    muteBtn.addEventListener('click', toggleMute);

    // Keyboard Shortcuts
    document.addEventListener('keydown', handleKeyDown);
    // Dark Mode Elements
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');

// Initialize theme
const savedTheme = localStorage.getItem('theme') || 'dark';
document.body.classList.toggle('light-mode', savedTheme === 'light');
updateThemeIcon(savedTheme);

// Theme toggle event listener
themeToggle.addEventListener('click', toggleTheme);

function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    
    // Update icon and save preference
    updateThemeIcon(isDark ? 'dark' : 'light');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

function updateThemeIcon(theme) {
    const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    
    if (theme === 'dark') {
        themeIcon.classList.replace('fa-moon', 'fa-sun');
        themeColorMeta.content = '#1a1a2e'; // Dark theme color
    } else {
        themeIcon.classList.replace('fa-sun', 'fa-moon');
        themeColorMeta.content = '#2980b9'; // Light theme color
    }
}// Notification Setup
    function initNotifications() {
        if ('Notification' in window) {
            Notification.requestPermission().then(permission => {
                notificationGranted = permission === 'granted';
            });
        }
        
        // Register service worker
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('notification-sw.js')
                .then(registration => {
                    console.log('ServiceWorker registered');
                })
                .catch(err => {
                    console.log('ServiceWorker registration failed: ', err);
                });
        }
    }

    // Media Session Setup
    function initMediaSession() {
        if ('mediaSession' in navigator) {
            navigator.mediaSession.setActionHandler('play', togglePlay);
            navigator.mediaSession.setActionHandler('pause', togglePlay);
            navigator.mediaSession.setActionHandler('previoustrack', prevSong);
            navigator.mediaSession.setActionHandler('nexttrack', nextSong);
        }
    }

    // Player Controls
    function togglePlay() {
        if (isPlaying) {
            audioPlayer.pause();
        } else {
            audioPlayer.play().catch(console.error);
        }
    }

    function prevSong() {
        currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
        loadSong(currentSongIndex);
    }

    function nextSong() {
        if (isRepeated) {
            audioPlayer.currentTime = 0;
            audioPlayer.play().catch(console.error);
            return;
        }else{
        audioPlayer.currentTime = 0;
        currentSongIndex = (currentSongIndex + 1) % songs.length;
        loadSong(currentSongIndex);
        audioPlayer.play();
    }
    }

    function loadSong(index) {
        currentSongIndex = index;
        const song = songs[index];
        
        audioPlayer.src = `${baseUrl}music/${song.file}`;
        if (isPlaying) audioPlayer.play().catch(console.error);
        
        updateSongInfo();
        highlightCurrentSong();
    }

    // Notification Handling
    function updateNotification() {
        if (!notificationGranted) return;
        
        const song = songs[currentSongIndex];
        const options = {
            body: `by ${song.artist || 'Unknown Artist'}`,
            icon: song.cover || 'thumbnails/default.jpg',
            badge: 'thumbnails/default.jpg',
            tag: 'music-player',
            renotify: false,
            actions: [
                { action: 'prevSong', title: 'Previous', icon: 'icons/prev.png' },
                { action: 'nextSong', title: 'Next', icon: 'icons/next.png' }
		],
            data: { songIndex: currentSongIndex }
        };

        // Close previous notification if exists
        if (notification) notification.close();

        if (navigator.serviceWorker?.controller) {
            navigator.serviceWorker.controller.postMessage({
                type: 'UPDATE_NOTIFICATION',
                title: song.title || 'Unknown Title',
                options
            });
        } else {
            notification = new Notification(song.title || 'Unknown Title', options);
            
            notification.onclick = () => window.focus();
            notification.onclose = () => notification = null;
        }
    }

    // Media Session Updates
    function updateMediaSession() {
        if (!('mediaSession' in navigator)) return;
        
        const song = songs[currentSongIndex];
        navigator.mediaSession.metadata = new MediaMetadata({
            title: song.title || 'Unknown',
            artist: song.artist || 'Artist',
            album: 'Glass Player',
            artwork: generateArtworkArray(song.cover)
        });
        navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
    }

    function generateArtworkArray(coverUrl) {
        const sizes = [96, 128, 192, 256, 384, 512];
        return sizes.map(size => ({
            src: coverUrl || 'thumbnails/default.jpg',
            sizes: `${size}x${size}`,
            type: 'image/jpeg'
        }));
    }

    // UI Updates
    function updateSongInfo() {
        const song = songs[currentSongIndex];
        
        // Update DOM
        songTitle.textContent = song.title || 'Unknown Title';
        songArtist.textContent = song.artist || 'Unknown Artist';
        albumArt.src = song.cover || 'thumbnails/default.jpg';
        document.title = `${song.title} - Glass Player`;
        
        // Update favicon
        updateFavicon(song.cover);
        
        // Update notifications and media session
        updateNotification();
        updateMediaSession();
    }

    function updateFavicon(coverUrl) {
        const favicon = document.querySelector('link[rel="icon"]');
        if (coverUrl) {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = 32;
                canvas.height = 32;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, 32, 32);
                favicon.href = canvas.toDataURL('image/png');
            };
            img.src = coverUrl;
        } else {
            favicon.href = 'thumbnails/default.jpg';
        }
    }

    function highlightCurrentSong() {
        document.querySelectorAll('.playlist-item').forEach((item, index) => {
            item.classList.toggle('active', index === currentSongIndex);
        });
    }

    function updatePlayState(playing) {
        isPlaying = playing;
        playBtn.innerHTML = `<i class="fas fa-${isPlaying ? 'pause' : 'play'}"></i>`;
        document.querySelector('.album-art').classList.toggle('playing', isPlaying);
        if ('mediaSession' in navigator) {
            navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
        }
        if (isPlaying && !document.hasFocus()) {
            updateNotification();
        }
    }

    // Utility Functions
    function setProgress(e) {
        const percent = e.offsetX / this.clientWidth;
        audioPlayer.currentTime = percent * audioPlayer.duration;
    }

    function updateProgress() {
        const percent = (audioPlayer.currentTime / audioPlayer.duration) * 100;
        progressBar.style.width = `${percent}%`;
        currentTimeEl.textContent = formatTime(audioPlayer.currentTime);
        durationEl.textContent = formatTime(audioPlayer.duration);
    }

    function handleSongEnd() {
    if (isRepeated) {
        audioPlayer.currentTime = 0;
        audioPlayer.play().catch(console.error);  // repeats current song
    } else {
        nextSong(); // plays next song if not repeatin
    }
}
    function toggleMute() {
        isMuted = !isMuted;
        if (isMuted) {
            originalVolume = audioPlayer.volume;
            audioPlayer.volume = 0;
            volumeSlider.value = 0;
            muteBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
        } else {
            audioPlayer.volume = originalVolume;
            volumeSlider.value = originalVolume;
            muteBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
        }
    }

    function setVolume() {
        audioPlayer.volume = this.value;
        isMuted = this.value == 0;
        muteBtn.innerHTML = `<i class="fas fa-volume-${isMuted ? 'mute' : 'up'}"></i>`;
        if (!isMuted) originalVolume = this.value;
    }

    function handleKeyDown(e) {
        switch (e.code) {
            case 'Space': e.preventDefault(); togglePlay(); break;
            case 'ArrowLeft': seek(-10); break;
            case 'ArrowRight': seek(10); break;
            case 'KeyM': toggleMute(); break;
        }
    }

    function seek(seconds) {
        audioPlayer.currentTime += seconds;
    }
    // Add this with your other player state variables
let originalOrder = []; // To store the original playlist order

// Initialize Player (update your existing initPlayer function)
function initPlayer() {
    fetch(`${baseUrl}player.php`)
        .then(response => response.json())
        .then(data => {
            songs = data;
            originalOrder = [...songs]; // Store original order
            renderPlaylist();
            loadSong(0);
        })
        .catch(console.error);
}

// Shuffle Functionality (add these functions)
function toggleShuffle() {
    isShuffled = !isShuffled;
    shuffleBtn.classList.toggle('active', isShuffled);
    
    if (1==1) {
        // Shuffle the playlist (keeping current song first)
        const currentSong = songs[currentSongIndex];
        const remainingSongs = songs.filter((_, i) => i !== currentSongIndex);
        shuffleArray(remainingSongs);
        songs = [currentSong, ...remainingSongs];
        currentSongIndex = 0; // Reset to first song (which is the current song)
    } else {
        // Restore original order and find current song's position
        songs = [...originalOrder];
        currentSongIndex = songs.findIndex(song => 
            song.file === songs[currentSongIndex].file);
    }
    
    renderPlaylist();
}

// Helper function to shuffle array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Add this to your event listeners
shuffleBtn.addEventListener('click', toggleShuffle);

    // Add these functions to your existing code
function seekForward() {
    audioPlayer.currentTime = Math.min(audioPlayer.currentTime + 10, audioPlayer.duration);
}

function seekBackward() {
    audioPlayer.currentTime = Math.max(audioPlayer.currentTime - 10, 0);
}

// Update your event listeners
back10Btn.addEventListener('click', seekBackward);
forward10Btn.addEventListener('click', seekForward);

// Also update your keyboard shortcuts handler
function handleKeyDown(e) {
    switch (e.code) {
        case 'Space': e.preventDefault(); togglePlay(); break;
        case 'ArrowLeft': seekBackward(); break;
        case 'ArrowRight': seekForward(); break;
        case 'KeyM': toggleMute(); break;
    }
}
    // Add these with your other DOM elements
const songsDropdownBtn = document.getElementById('songsDropdownBtn');
const songsDropdown = document.getElementById('songsDropdown');
const dropdownClose = document.getElementById('dropdownClose');
const dropdownOverlay = document.getElementById('dropdownOverlay');
const songsList = document.getElementById('songsList');
const songSearch = document.getElementById('songSearch');

// Toggle dropdown
function toggleDropdown() {
  songsDropdown.classList.toggle('active');
  dropdownOverlay.classList.toggle('active');
}

// Event listeners
songsDropdownBtn.addEventListener('click', toggleDropdown);
dropdownClose.addEventListener('click', toggleDropdown);
dropdownOverlay.addEventListener('click', toggleDropdown);

// Close dropdown when song is selected
document.addEventListener('click', (e) => {
  if (e.target.closest('.dropdown-song-item')) {
    toggleDropdown();
  }
});

// Render songs in dropdown
function renderSongsDropdown() {
  songsList.innerHTML = songs.map((song, index) => `
    <div class="dropdown-song-item ${index === currentSongIndex ? 'active' : ''}" 
         data-index="${index}">
      <div class="dropdown-song-info">
        <div class="dropdown-song-title">${song.title || 'Unknown Title'}</div>
        <div class="dropdown-song-artist">${song.artist || 'Unknown Artist'}</div>
      </div>
      <div class="dropdown-song-duration">${formatTime(song.duration)}</div>
    </div>
  `).join('');

  // Add click handlers
  document.querySelectorAll('.dropdown-song-item').forEach(item => {
    item.addEventListener('click', function() {
      const index = parseInt(this.getAttribute('data-index'));
      loadSong(index);
    });
  });
}

// Search functionality
songSearch.addEventListener('input', function() {
  const searchTerm = this.value.toLowerCase();
  const items = songsList.querySelectorAll('.dropdown-song-item');
  
  items.forEach(item => {
    const title = item.querySelector('.dropdown-song-title').textContent.toLowerCase();
    const artist = item.querySelector('.dropdown-song-artist').textContent.toLowerCase();
    const matches = title.includes(searchTerm) || artist.includes(searchTerm);
    item.style.display = matches ? 'flex' : 'none';
  });
});

// Update your existing loadSong function to highlight in dropdown
function loadSong(index) {
  currentSongIndex = index;
  const song = songs[index];
  
  audioPlayer.src = `${baseUrl}music/${song.file}`;
  if (isPlaying) audioPlayer.play().catch(console.error);
  
  updateSongInfo();
  highlightCurrentSong();
  highlightInDropdown();
}

function highlightInDropdown() {
  document.querySelectorAll('.dropdown-song-item').forEach(item => {
    const index = parseInt(item.getAttribute('data-index'));
    item.classList.toggle('active', index === currentSongIndex);
  });
}

// Call this after loading songs
function initPlayer() {
  fetch(`${baseUrl}player.php`)
    .then(response => response.json())
    .then(data => {
      songs = data;
      renderPlaylist();
      renderSongsDropdown(); // Add this line
      loadSong(0);
    })
    .catch(console.error);
}
    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }

    function renderPlaylist() {
        playlistEl.innerHTML = songs.map((song, index) => `
            <div class="playlist-item ${index === currentSongIndex ? 'active' : ''}">
                <div class="song-details">
                    <div class="song-title">${song.title || 'Unknown Title'}</div>
                    <div class="song-artist">${song.artist || 'Unknown Artist'}</div>
                </div>
                <div class="song-duration">${formatTime(song.duration)}</div>
            </div>
        `).join('');

        document.querySelectorAll('.playlist-item').forEach((item, index) => {
            item.addEventListener('click', () => loadSong(index));
        });
    }
    // DOM Elements
const totalSongs = document.getElementById('totalSongs');
const totalDuration = document.getElementById('totalDuration');
const currentYear = document.getElementById('currentYear');
const githubBtn = document.getElementById('githubBtn');
const settingsBtn = document.getElementById('settingsBtn');

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function updateFooterStats() {
  totalSongs.textContent = `${songs.length} ${songs.length === 1 ? 'song' : 'songs'}`;
  const totalSeconds = songs.reduce((sum, song) => sum + (song.duration || 0), 0);
  totalDuration.textContent = formatTime(totalSeconds);
  currentYear.textContent = `© ${new Date().getFullYear()}`;
}

function initPlayer() {
  fetch(`${baseUrl}player.php`)
    .then(response => response.json())
    .then(data => {
      if (!Array.isArray(data) || data.length === 0) {
        console.warn('No songs found or invalid data');
        return;
      }
      songs = data;
      renderPlaylist();
      renderSongsDropdown();
      loadSong(0);
      updateFooterStats();
    })
    .catch(console.error);
}

// Button actions
githubBtn.addEventListener('click', () => {
  window.open('https://github.com/Akastha68', '_blank');
});
    // Add these with your other DOM elements
const settingsModal = document.getElementById('settingsModal');
const modalOverlay = document.getElementById('modalOverlay');
const modalClose = document.getElementById('modalClose');
const darkModeToggle = document.getElementById('darkModeToggle');
const crossfade = document.getElementById('crossfade');
const crossfadeValue = document.getElementById('crossfadeValue');

// Settings button functionality
settingsBtn.addEventListener('click', () => {
    settingsModal.classList.add('active');
    modalOverlay.classList.add('active');
    
    // Initialize settings with current values
    darkModeToggle.checked = document.body.classList.contains('dark-mode');
    crossfade.value = localStorage.getItem('crossfadeDuration') || 3;
    crossfadeValue.textContent = `${crossfade.value} seconds`;
});

// Close modal
modalClose.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', closeModal);

function closeModal() {
    settingsModal.classList.remove('active');
    modalOverlay.classList.remove('active');
}

// Dark mode toggle in settings
darkModeToggle.addEventListener('change', function() {
    document.body.classList.toggle('dark-mode', this.checked);
    localStorage.setItem('theme', this.checked ? 'dark' : 'light');
    updateThemeIcon(this.checked ? 'dark' : 'light');
});

// Crossfade setting
crossfade.addEventListener('input', function() {
    crossfadeValue.textContent = `${this.value} seconds`;
    localStorage.setItem('crossfadeDuration', this.value);
});

// Initialize settings from localStorage
function initSettings() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.body.classList.toggle('dark-mode', savedTheme === 'dark');
    darkModeToggle.checked = savedTheme === 'dark';
    
    const savedCrossfade = localStorage.getItem('crossfadeDuration') || 3;
    crossfade.value = savedCrossfade;
    crossfadeValue.textContent = `${savedCrossfade} seconds`;
}

// Call this in your initialization
initSettings();
});
