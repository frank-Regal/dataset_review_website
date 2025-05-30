#!/bin/bash

# Check if a variable is passed as an argument
if [ -z "$1" -o -z "$2" ]; then
  echo "Usage:"
  echo "  $0 get-entry_frame-range.sh <table_name> <annotation_id>"
  echo "Options:"
  echo "  <table_name>: [dev, prod]_frame_ranges"
  echo "  <annotation_id>: <annotation_id>"
fi

# Check if both arguments are provided
if [ ! -z "$1" ] && [ ! -z "$2" ]; then
  # Assign the first command-line argument to a variable
  TABLE_NAME="$1"
  ANNOTATION_ID="$2"

  # # Define the URL and query parameters
  URL="http://localhost:3001/$TABLE_NAME?annotation_id=eq.$ANNOTATION_ID"

  # # Make the POST request using curl
  curl -s "$URL" | jq .
fi
