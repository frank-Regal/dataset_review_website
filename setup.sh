#! /bin/bash

sudo apt install x11-xserver-utils

echo "export UID_GID=$(id -u):$(id -g)" >> ~/.bashrc
echo "export UNAME=$(whoami)" >> ~/.bashrc
