#!/bin/bash

# Get the directory where the script is located
SCRIPT_DIR=$(dirname "$(realpath "$0")")

# Get the path to the "entries" directory, which is one level up from the script's directory
ENTRIES_DIR=$(realpath "$SCRIPT_DIR/../entries")
