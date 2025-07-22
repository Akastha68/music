#!/bin/bash

# === CONFIG ===
REPO_URL="https://github.com/Akastha68/music_player.git"
BRANCH="main"
MUSIC_DIR="./music"

# === INIT REPO ===
echo "🔁 Initializing git repo (if not exists)..."

# === PUSH EACH SONG ===
echo "🚀 Starting upload of songs from $MUSIC_DIR..."
count=0

for file in "$MUSIC_DIR"/*; do
  if [ -f "$file" ]; then
    size=$(du -m "$file" | cut -f1)
    filename=$(basename "$file")
    
    if [ "$size" -ge 100 ]; then
      echo "❌ Skipping $filename - file is $size MB (exceeds 100MB GitHub limit)"
      continue
    fi

    echo "📤 Uploading: $filename ($size MB)"
    
    git add "$file"
    git commit -m "Add song: $filename"
    
    git push origin "$BRANCH"
    
    if [ $? -ne 0 ]; then
      echo "❌ Push failed for $filename. Skipping..."
      git reset HEAD~1
      continue
    fi

    ((count++))
    echo "✅ Uploaded $count files so far..."
  fi
done

echo "🎉 Done! Uploaded $count songs to $REPO_URL"
