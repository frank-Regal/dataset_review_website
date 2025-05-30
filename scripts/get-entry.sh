#!/bin/bash

# Check if a variable is passed as an argument
if [ -z "$1" -o -z "$2" ]; then
  echo "Usage:"
  echo "  $0 get-entry_annotations.sh <table_name> <video_filename>"
  echo "Options:"
  echo "  <table_name>: [dev, prod]_annotations"
  echo "  <video_filename>: <video_filename>"
fi

# Check if both arguments are provided
if [ ! -z "$1" ] && [ ! -z "$2" ]; then
  # Assign the first command-line argument to a variable
  TABLE_NAME="$1"
  VIDEO_FILENAME="$2"

  # # Define the URL and query parameters
  URL="http://localhost:3001/$TABLE_NAME?video_filename=eq.$VIDEO_FILENAME"

  # # Make the POST request using curl
  curl -s "$URL" | jq .

  ANNOTATION_ID=$(curl -s "$URL" | jq '.[0].id')

  URL="http://localhost:3001/dev_frame_ranges?annotation_id=eq.$ANNOTATION_ID"
  # # Make the POST request using curl
  curl -s "$URL" | jq .

fi
