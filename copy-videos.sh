#!/bin/bash

# Script to copy all video files from test-results directories to public with directory names

# Destination directory
DEST_DIR="$PWD/public/videos"

echo "Copying video files from test-results directory..."

# Delete and recreate the public/videos directory
if [ -d "$DEST_DIR" ]; then
    echo "Deleting existing videos directory: $DEST_DIR"
    rm -rf "$DEST_DIR"
fi

# Create the videos directory
mkdir -p "$DEST_DIR"
echo "Created destination directory: $DEST_DIR"

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
