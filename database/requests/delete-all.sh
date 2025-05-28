#!/bin/bash

# Define the URL and query parameters
URL="http://localhost:3000/augredbtable"

# Make the POST request using curl
curl -i -X DELETE "$URL"