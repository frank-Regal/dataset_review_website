#!/bin/bash

# Get the directory where the script is located
SCRIPT_DIR=$(dirname "$(realpath "$0")")

# Get the path to the "entries" directory, which is one level up from the script's directory
ENTRIES_DIR=$(realpath "$SCRIPT_DIR/../entries")

# Check if a variable is passed as an argument
if [ -z "$1" ]; then
  echo "Usage: $0 <RepresentationId>"
  exit 1
fi

# Assign the first command-line argument to a variable
REPRESENTATION_ID="$1"

# Define the path to the JSON payload file
JSON_PAYLOAD="$ENTRIES_DIR/anchor_patch.json"

# Define the URL and query parameters
URL="http://localhost:3000/augredbtable?RepresentationId=eq.$REPRESENTATION_ID"

# Make the POST request using curl
curl -i -X PATCH "$URL" \
    -H "Content-Type: application/json" \
    -d @"$JSON_PAYLOAD"