<?php
// Run once to populate songs.db from music folder

require_once('lib/getID3/getid3.php');
$getID3 = new getID3();

$musicDir = 'music/';
$thumbnailDir = 'thumbnails/';

$db = new SQLite3('songs.db');

// Create table
$db->exec("CREATE TABLE IF NOT EXISTS songs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    file TEXT,
    title TEXT,
    artist TEXT,
    duration REAL,
    cover TEXT
)");

// Clear existing data (optional)
$db->exec("DELETE FROM songs");

$files = scandir($musicDir);

foreach ($files as $file) {
    if (pathinfo($file, PATHINFO_EXTENSION) === 'mp3') {
        $filePath = $musicDir . $file;
        $fileInfo = $getID3->analyze($filePath);

        $title = $fileInfo['tags']['id3v2']['title'][0] ?? pathinfo($file, PATHINFO_FILENAME);
        $artist = $fileInfo['tags']['id3v2']['artist'][0] ?? 'Unknown Artist';
        $duration = $fileInfo['playtime_seconds'] ?? 0;

        $cover = null;
        if (isset($fileInfo['comments']['picture'][0])) {
            $picture = $fileInfo['comments']['picture'][0];
            $coverData = base64_encode($picture['data']);
            $coverMime = $picture['image_mime'];
            $cover = "data:$coverMime;base64,$coverData";
        } else {
            $thumbnailFile = pathinfo($file, PATHINFO_FILENAME) . '.jpg';
            if (file_exists($thumbnailDir . $thumbnailFile)) {
                $cover = $thumbnailDir . $thumbnailFile;
            }
        }

        // Save to DB
        $stmt = $db->prepare("INSERT INTO songs (file, title, artist, duration, cover)
                              VALUES (:file, :title, :artist, :duration, :cover)");
        $stmt->bindValue(':file', $file, SQLITE3_TEXT);
        $stmt->bindValue(':title', $title, SQLITE3_TEXT);
        $stmt->bindValue(':artist', $artist, SQLITE3_TEXT);
        $stmt->bindValue(':duration', $duration, SQLITE3_FLOAT);
        $stmt->bindValue(':cover', $cover, SQLITE3_TEXT);
        $stmt->execute();
    }
}

echo "✅ Metadata saved to database.\n";
?>
