#!/bin/bash

# Check if a variable is passed as an argument
if [ -z "$1" ]; then
  echo "Usage: $0 <table_name>"
  echo "Options: [dev, prod]_[annotations, frame_ranges]"
fi

# Assign the first command-line argument to a variable
TABLE_NAME="$1"

# Define the URL and query parameters
URL="http://localhost:3001/$TABLE_NAME"

# Make the POST request using curl
curl -s "$URL" | jq .