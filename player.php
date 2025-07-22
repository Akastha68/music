<?php
header('Content-Type: application/json');

// Include getID3 library
require_once('lib/getID3/getid3.php');

// Initialize getID3
$getID3 = new getID3();

// Path to music directory
$musicDir = 'music/';
$thumbnailDir = 'thumbnails/';

// Check if music directory exists
if (!is_dir($musicDir)) {
    die(json_encode(['error' => 'Music directory not found']));
}

// Scan music directory for MP3 files
$files = scandir($musicDir);
$songs = [];

foreach ($files as $file) {
    if (pathinfo($file, PATHINFO_EXTENSION) === 'mp3') {
        $filePath = $musicDir . $file;
        
        // Analyze file with getID3
        $fileInfo = $getID3->analyze($filePath);
        
        // Extract relevant metadata
        $song = [
            'file' => $file,
            'title' => $fileInfo['tags']['id3v2']['title'][0] ?? pathinfo($file, PATHINFO_FILENAME),
            'artist' => $fileInfo['tags']['id3v2']['artist'][0] ?? 'Unknown Artist',
            'duration' => $fileInfo['playtime_seconds'] ?? 0,
            'cover' => null
        ];
        
        // Extract cover art if available
        if (isset($fileInfo['comments']['picture'][0])) {
            $picture = $fileInfo['comments']['picture'][0];
            $coverData = base64_encode($picture['data']);
            $coverMime = $picture['image_mime'];
            $song['cover'] = "data:$coverMime;base64,$coverData";
        } else {
            // Check for external thumbnail
            $thumbnailFile = pathinfo($file, PATHINFO_FILENAME) . '.jpg';
            if (file_exists($thumbnailDir . $thumbnailFile)) {
                $song['cover'] = $thumbnailDir . $thumbnailFile;
            }
        }
        
        $songs[] = $song;
    }
}

// Return songs as JSON
echo json_encode($songs);
?>