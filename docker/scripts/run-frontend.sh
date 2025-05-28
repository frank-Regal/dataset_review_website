#!/bin/bash

# Function to create or attach to a tmux session
create_or_attach_tmux() {
    session_name=$1
    command=$2
    
    # Check if the session exists
    tmux has-session -t $session_name 2>/dev/null

    # If the session doesn't exist, create it
    if [ $? != 0 ]; then
        tmux new-session -d -s $session_name
    fi

    # Send the command to the session
    tmux send-keys -t $session_name "$command" C-m
}

# Create or attach to "frontend" tmux session and run frontend
create_or_attach_tmux frontend "cd /root/web_browser_controller/frontend/webapp && npm run dev"

# Print the IP address and start message
echo "Frontend webpage started. View at http://localhost:5173"
echo "To view the status of the server, run: 'tmux attach -t frontend'"
