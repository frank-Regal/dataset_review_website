#!/bin/bash

# Check if a variable is passed as an argument
if [ -z "$1" ]; then
  echo "Usage: $0 <RepresentationId>"
  exit 1
fi

# Assign the first command-line argument to a variable
REPRESENTATION_ID="$1"

# Define the URL and query parameters
URL="http://localhost:3000/augredbtable?RepresentationId=eq.$REPRESENTATION_ID"

# Make the POST request using curl
curl -i -X DELETE "$URL"
