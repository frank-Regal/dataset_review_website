FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive

# install basic dependencies
RUN apt-get update && apt-get install -y \
    curl \
    git \
    vim \
    build-essential \
    cmake \
    gcc \
    python3 \
    python3-pip \
    python3-dev \
    build-essential \
    libssl-dev \
    libffi-dev \
    sudo \
    bash-completion \
    curl \
    tmux \
    && rm -rf /var/lib/apt/lists/*

# # Install Node.js
# RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
#     apt-get update && \
#     apt-get install -y nodejs && \
#     rm -rf /var/lib/apt/lists/*
    
# RUN npm install -g npm@11.0.0

# install ngrok
RUN curl -sSL https://ngrok-agent.s3.amazonaws.com/ngrok.asc \
    | sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null \
    && echo "deb https://ngrok-agent.s3.amazonaws.com buster main" \
    | sudo tee /etc/apt/sources.list.d/ngrok.list \
    && sudo apt update \
    && sudo apt install ngrok

# install npm
RUN apt-get update && apt-get install -y \
    python-is-python3 \
    && rm -rf /var/lib/apt/lists/*

# install python packages
RUN pip3 install \
    django \
    tzdata \
    djangorestframework \
    django-cors-headers \
    channels

# Install required packages
RUN apt-get update && apt-get install -y \
    curl \
    gnupg \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js and npm
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash \
    && apt-get install -y nodejs \
    && npm install -g npm@9

# RUN npm install -g react@latest
# RUN npm install -g react-scripts@latest

# Install nvm and updatemake  node and npm
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash && \
    . ~/.nvm/nvm.sh && \
    nvm install --lts && \
    nvm use --lts && \
    nvm alias default node

# Add these lines to your existing Dockerfile
RUN pip3 install \
    opencv-python-headless \
    numpy

WORKDIR /root/web_browser_controller

# set terminal to xterm-256color
ENV TERM=xterm-256color

# Set bash prompt
RUN echo "source /etc/bash_completion" >> /root/.bashrc && \
    echo 'PS1="\e[1m\e[93m\u\e[97m@\e[93m\h:\e[35m\w\e[0m\e[97m#\e[0m "' >> /root/.bashrc

COPY scripts/run-backend.sh /usr/local/bin/run-backend
COPY scripts/run-frontend.sh /usr/local/bin/run-frontend
COPY scripts/run-ngrok-backend.sh /usr/local/bin/run-ngrok-backend
COPY scripts/run-ngrok-frontend.sh /usr/local/bin/run-ngrok-frontend
COPY scripts/kill-backend.sh /usr/local/bin/kill-backend
COPY scripts/kill-frontend.sh /usr/local/bin/kill-frontend
COPY scripts/kill-ngrok-backend.sh /usr/local/bin/kill-ngrok-backend
COPY scripts/kill-ngrok-frontend.sh /usr/local/bin/kill-ngrok-frontend

# Make the scripts executable
RUN chmod +x /usr/local/bin/run-backend
RUN chmod +x /usr/local/bin/run-frontend
RUN chmod +x /usr/local/bin/run-ngrok-backend
RUN chmod +x /usr/local/bin/run-ngrok-frontend
RUN chmod +x /usr/local/bin/kill-backend
RUN chmod +x /usr/local/bin/kill-frontend
RUN chmod +x /usr/local/bin/kill-ngrok-backend
RUN chmod +x /usr/local/bin/kill-ngrok-frontend

# Set default shell to be login shell
SHELL ["/bin/bash", "-l", "-c"] 

# copy the entrypoint into the image
COPY ./entrypoint.sh /entrypoint.sh

# run this script on startup
ENTRYPOINT /entrypoint.sh