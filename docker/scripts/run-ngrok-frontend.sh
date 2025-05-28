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

# Create or attach to "ngrok" tmux session and run ngrok
create_or_attach_tmux ngrok-frontend "ngrok http --domain=$NGROK_REMOTE_ADDRESS_FRONTEND http://localhost:3000 --authtoken $NGROK_AUTH_KEY_FRONTEND"

# Print the IP address and start message
echo "Global Robofleet server started on IP: $NGROK_REMOTE_ADDRESS_FRONTEND"
echo "To view the status of the server, run: 'tmux attach-session -t ngrok-frontend'"
