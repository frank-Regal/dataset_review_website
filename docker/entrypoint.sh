#!/bin/bash

set -e

echo "in the entrypoint script"
while getopts :u:n: flag; do
    case "${flag}" in
        u)
          userid=${OPTARG}
          ;;
        n)
          uname=${OPTARG}
          ;;
    esac
done

export uid=${userid%"${userid#????}"}

# Create home directory first
mkdir -p /home/$uname

# check if the user already exists
if id "$uname" >/dev/null 2>&1; then
    echo "user $uname already exists"
else
    # Delete any existing user with the same UID if it exists
    if id -u $uid >/dev/null 2>&1; then
        existing_user=$(getent passwd $uid | cut -d: -f1)
        echo "Removing existing user $existing_user with UID $uid"
        userdel -f $existing_user
    fi
    
    # create the host user in the container
    echo "user $uname does not exist, creating..."
    useradd -u $uid -s /bin/bash -G dialout -d /home/$uname $uname
fi


# Give access to root directory
chmod -R 777 /root
chown -R $uname:$uname /root

# Create sudoers.d directory if it doesn't exist
mkdir -p /etc/sudoers.d

# give the host user sudo permissions
echo "$uname ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/$uname && \
    chmod 0440 /etc/sudoers.d/$uname

# Copy configuration files
mkdir -p /home/$uname/.npm
cp -f /root/.bashrc /home/$uname/.bashrc 
cp -f /root/.profile /home/$uname/.profile
# cp -rf /root/.npm /home/$uname/.npm

# Set proper ownership
chown $uname:$uname /home/$uname/.bashrc
chown $uname:$uname /home/$uname/.profile
# chown $uname:$uname /home/$uname/.npm

# Set proper ownership
chown -R $uname:$uname /home/$uname

# # Set default shell to be login shell
# source /home/$uname/.bashrc
source /root/.bashrc

# Run these to have the frontend and backend run automatically when docker container starts
run-frontend
run-backend

exec tail -f /dev/null
# exec "$@"