#!/bin/bash

# Check if a variable is passed as an argument
if [ -z "$1" ]; then
  echo "Usage: $0 <table_name>"
  echo "Options: [dev, prod]_[annotations, frame_ranges]"
  exit 1
fi

TABLE_NAME="$1"

# Define the URL and query parameters
URL="http://localhost:3000/$TABLE_NAME"

# Make the POST request using curl
curl -i -X DELETE "$URL"