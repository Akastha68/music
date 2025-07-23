<?php
// fetch_and_save.php

// Step 1: Fetch JSON data from player.php
$apiUrl = 'http://73raxkkpc.localto.net/player1.php';
$json = file_get_contents($apiUrl);

if ($json === false) {
    die("❌ Failed to fetch JSON from $apiUrl");
}

// Decode JSON into array
$songs = json_decode($json, true);

if (!is_array($songs)) {
    die("❌ Failed to decode JSON.");
}

// Step 2: Connect to SQLite
$db = new SQLite3('songs.db');

// Step 3: Create songs table if it doesn't exist
$db->exec('
CREATE TABLE IF NOT EXISTS songs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    file_url TEXT,
    title TEXT,
    artist TEXT,
    duration REAL,
    cover TEXT
)');

// Step 4: Insert each song
foreach ($songs as $song) {
    $file_url = $song['file'];
    $title = $song['title'] ?? '';
    $artist = $song['artist'] ?? '';
    $duration = $song['duration'] ?? 0;
    $cover = $song['cover'] ?? '';

    $stmt = $db->prepare('
        INSERT INTO songs (file_url, title, artist, duration, cover)
        VALUES (:file_url, :title, :artist, :duration, :cover)
    ');

    if (!$stmt) {
        die("❌ SQL Prepare failed: " . $db->lastErrorMsg());
    }

    $stmt->bindValue(':file_url', $file_url, SQLITE3_TEXT);
    $stmt->bindValue(':title', $title, SQLITE3_TEXT);
    $stmt->bindValue(':artist', $artist, SQLITE3_TEXT);
    $stmt->bindValue(':duration', $duration, SQLITE3_FLOAT);
    $stmt->bindValue(':cover', $cover, SQLITE3_TEXT);

    $stmt->execute();
}

// Step 5: Done
echo "✅ All songs successfully saved to database.\n";
?>
