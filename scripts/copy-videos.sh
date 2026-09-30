#!/bin/bash

# Script to copy all video files from test-results directories to public with directory names

# Destination directory
DEST_DIR="$PWD/public/videos"

echo "Copying video files from test-results directory..."

# Create the videos directory if missing
mkdir -p "$DEST_DIR"

# Delete only previously generated game-at-work videos and posters:
# the other files in public/videos (e.g. music emotion mp4s) are used by the game
echo "Deleting existing game-at-work videos in: $DEST_DIR"
rm -f "$DEST_DIR"/game-at-work-*

# Counter for copied files
copied_count=0
error_count=0

# Iterate through all directories in test-results
for dir in test-results/*/; do
    # Skip if no directories found
    [ ! -d "$dir" ] && continue
    
    # Extract directory name (remove path and trailing slash)
    dir_name=$(basename "$dir")
    
    # Source video file path
    SOURCE_FILE="$dir/video.webm"
    SOURCE_PATH="$PWD/$SOURCE_FILE"
    
    # Destination filename with directory name
    DEST_FILE="${dir_name}.webm"
    DEST_PATH="$DEST_DIR/$DEST_FILE"
    
    echo "Processing: $dir_name"
    
    # Check if video file exists in this directory
    if [ -f "$SOURCE_PATH" ]; then
        echo "Found video file: $SOURCE_FILE"
        echo "Copying to: public/$DEST_FILE"
        
        # Copy and rename the file
        cp "$SOURCE_PATH" "$DEST_PATH"
        
        if [ $? -eq 0 ]; then
            echo "Successfully copied"
            ((copied_count++))
        else
            echo "Error copying video file"
            ((error_count++))
        fi
    else
        echo "No video.webm file found in $dir_name"
    fi
done

echo "Files copied successfully: $copied_count"
if [ $error_count -gt 0 ]; then
    echo "Errors encountered: $error_count"
fi

if [ $copied_count -eq 0 ] && [ $error_count -eq 0 ]; then
    echo "No video files found to copy."
    exit 1
fi

