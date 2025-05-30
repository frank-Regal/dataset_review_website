#!/bin/bash

# Check if a variable is passed as an argument
if [ -z "$1" ]; then
  echo "Usage: $0 <table_name> <id>"
  echo "Options:"
  echo "  <table_name>: [dev, prod]_annotations, frame_ranges"
  echo "  <id>: <id>"
  exit 1
fi

# Assign the first command-line argument to a variable
TABLE_NAME="$1"
ID="$2"

# Define the URL and query parameters
URL="http://localhost:3001/$TABLE_NAME?id=eq.$ID"

# Make the POST request using curl
curl -i -X DELETE "$URL"
