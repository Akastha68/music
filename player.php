<?php
header('Content-Type: application/json');

$db = new SQLite3('songs.db');

// Fetch all songs
$result = $db->query("SELECT file, title, artist, duration, cover FROM songs");

$songs = [];
while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
    // If needed, prepend full URL to file
    //$row['file'] = "https://73raxkkpc.localto.net/" . 
    $row['file'];
    $songs[] = $row;
}

echo json_encode($songs, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
?>
