let videoIndex = 0;
let videos = [];
let annotations = [];
let startTime = 0; // Track time spent on each video
let isFastSpeed = true; // Track current speed state
let isPlaying = true; // Track play/pause state
let frameRate = 30; // Default frame rate (will be updated when video loads)
let normalSpeed = 0.33; // was 2.0 for 10 fps
let sloMoSpeed = 0.1; // was 0.2 for 10 fps
let loadDelay = 250; // 250ms delay before proceeding
let isRecordingRange = false;
let frameRangeStart = null;
let frameRanges = [];

// Function to get current frame number
function getCurrentFrame() {
    const videoPlayer = document.getElementById('videoPlayer');
    const currentTime = videoPlayer.currentTime;
    const playbackRate = videoPlayer.playbackRate;
    // Adjust the frame calculation based on playback rate
    // For normal speed (2.0x), we need to divide by 2 to get the actual frame
    // For slo-mo (0.2x), we need to multiply by 5 to get the actual frame
    const speedFactor = isFastSpeed ? normalSpeed : sloMoSpeed;
    return Math.floor(currentTime * frameRate * speedFactor);
}

// Function to update frame number display
function updateFrameNumber() {
    const frameNumber = getCurrentFrame();
    document.getElementById('frame-number').textContent = `Frame: ${frameNumber}`;
}

// Function to update button states based on status
function updateButtonStates() {
    const statusElement = document.getElementById('video-status');
    const status = statusElement.textContent.toLowerCase();
    const reviewButton = document.querySelector('button[onclick="markForReview()"]');
    const verifyButton = document.querySelector('button[onclick="nextVideo()"]');

    // Remove selected class from both buttons
    reviewButton.classList.remove('selected');
    verifyButton.classList.remove('selected');

    // Add selected class based on status
    if (status === 'revisit') {
        reviewButton.classList.add('selected');
    } else if (status === 'verified') {
        verifyButton.classList.add('selected');
    }
}

// Function to update video status display
async function updateVideoStatus() {
    const urlParams = new URLSearchParams(window.location.search);
    const videoName = urlParams.get('video');
    
    if (videoName) {
        try {
            const response = await fetch('/video-status');
            const videos = await response.json();
            
            const videoData = videos.find(v => v.video === videoName);
            const status = videoData ? videoData.status : 'todo';
            
            const statusElement = document.getElementById('video-status');
            statusElement.textContent = status.toUpperCase();
            statusElement.className = `${status}-text status-text`;
            
            // Update button states after status is updated
            updateButtonStates();
        } catch (error) {
            console.error('Error fetching video status:', error);
        }
    }
}

// Load the video based on the query parameter from the URL
function loadVideoFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const videoFilename = urlParams.get('video');

    if (videoFilename) {
        const videoPlayer = document.getElementById('videoPlayer');
        videoPlayer.src = `/videos/${videoFilename}`; // Local path
        // For local development, check if video exists in root directory first
        // videoPlayer.src = `https://storage.googleapis.com/robot_traj_videos/all/${videoFilename}`; // Google Cloud Storage path
        videoPlayer.load();
        videoPlayer.playbackRate = isFastSpeed ? normalSpeed : sloMoSpeed; // Set playback speed based on current state
        resetTimer(); // Reset the timer for tracking how long the user spends on this video
        
        // Set initial play/pause state
        isPlaying = true;
        updatePlayPauseButton();
        
        // Update speed button text
        const speedButton = document.querySelector('button[onclick="togglePlaybackSpeed()"]');
        speedButton.textContent = `${isFastSpeed ? 'Slo-Mo' : 'Normal'}`;

        // Add timeupdate event listener to update frame number during playback
        videoPlayer.ontimeupdate = updateFrameNumber;
    } else {
        document.getElementById('feedback').textContent = 'No video selected.';
    }
    updateVideoName();
    updateVideoStatus(); // Add this line to update the status
}

// function nextVideo() {
//     window.location.href = '/index.html';
// }

async function getVideoList() {
    try {
        const response = await fetch('/videos');
        const data = await response.json();
        videos = data.videos;
    } catch (error) {
        console.error('Error fetching video list:', error);
    }
}

async function nextVideo() {
    // If we haven't loaded the video list yet, load it
    if (videos.length === 0) {
        await getVideoList();
    }
    
    // Get current video from URL
    const urlParams = new URLSearchParams(window.location.search);
    const currentVideo = urlParams.get('video');
    
    // Find the index of the current video
    const currentIndex = videos.indexOf(currentVideo);
    
    // If we found the current video and there's a next video
    if (currentIndex !== -1 && currentIndex < videos.length - 1) {
        const nextVideoFilename = videos[currentIndex + 1];

        // Post entry to database for current video
        const annotationData = {
            username: 'anonymous', // Since username input is commented out
            video: currentVideo,
            status: 'verified'
        };

        try {
            await fetch('/save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(annotationData),
            });

            // Update status text
            const statusElement = document.getElementById('video-status');
            statusElement.textContent = 'VERIFIED';
            statusElement.className = 'verified-text status-text';

            updateButtonStates();

            // Wait for 2 seconds before proceeding
            await new Promise(resolve => setTimeout(resolve, loadDelay));

        } catch (error) {
            console.error('Error saving annotation:', error);
        } 

        // Clear current annotations
        annotations = [];
        document.getElementById('annotations').innerHTML = '';
        document.getElementById('subtask-placeholder').style.display = 'block';
        
        // Clear frame ranges
        frameRanges = [];
        document.getElementById('frame-ranges-list').innerHTML = '';
        
        // Update URL and load next video
        const newUrl = `${window.location.pathname}?video=${nextVideoFilename}`;
        window.history.pushState({}, '', newUrl);
        loadVideoFromURL();
        
        // Reset timer for the new video
        resetTimer();
        
        // Clear feedback message
        document.getElementById('feedback').textContent = '';
    } else {
        document.getElementById('feedback').textContent = 'This is the last video in the sequence.';
    }
}


// Get video name from URL and display it
function updateVideoName() {
    const urlParams = new URLSearchParams(window.location.search);
    const videoName = urlParams.get('video');
    if (videoName) {
        document.getElementById('video-name').textContent = videoName;
    }
}

async function previousVideo() {
    // If we haven't loaded the video list yet, load it
    if (videos.length === 0) {
        await getVideoList();
    }
    
    // Get current video from URL
    const urlParams = new URLSearchParams(window.location.search);
    const currentVideo = urlParams.get('video');
    
    // Find the index of the current video
    const currentIndex = videos.indexOf(currentVideo);
    
    // If we found the current video and there's a previous video
    if (currentIndex !== -1 && currentIndex > 0) {
        const previousVideoFilename = videos[currentIndex - 1];
        
        // Clear current annotations
        annotations = [];
        document.getElementById('annotations').innerHTML = '';
        document.getElementById('subtask-placeholder').style.display = 'block';
        
        // Update URL and load previous video
        const newUrl = `${window.location.pathname}?video=${previousVideoFilename}`;
        window.history.pushState({}, '', newUrl);
        
        loadVideoFromURL();
        
        // Clear feedback message
        document.getElementById('feedback').textContent = '';
    } else {
        document.getElementById('feedback').textContent = 'This is the first video in the sequence.';
    }
}

async function markForReview() {
    // If we haven't loaded the video list yet, load it
    if (videos.length === 0) {
        await getVideoList();
    }
    
    // Get current video from URL
    const urlParams = new URLSearchParams(window.location.search);
    const currentVideo = urlParams.get('video');
    
    // Find the index of the current video
    const currentIndex = videos.indexOf(currentVideo);
    
    // If we found the current video and there's a next video
    if (currentIndex !== -1 && currentIndex < videos.length - 1) {
        const nextVideoFilename = videos[currentIndex + 1];

        // Post entry to database for current video
        const annotationData = {
            username: 'anonymous', // Since username input is commented out
            video: currentVideo,
            status: 'revisit'
        };

        try {
            await fetch('/save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(annotationData),
            });

            // Update status text
            const statusElement = document.getElementById('video-status');
            statusElement.textContent = 'REVISIT';
            statusElement.className = 'revisit-text status-text';

            updateButtonStates();

            // Wait for 2 seconds before proceeding
            await new Promise(resolve => setTimeout(resolve, loadDelay));
            
        } catch (error) {
            console.error('Error saving annotation:', error);
        }
        
        // Clear current annotations
        annotations = [];
        document.getElementById('annotations').innerHTML = '';
        document.getElementById('subtask-placeholder').style.display = 'block';
        
        // Clear frame ranges
        frameRanges = [];
        document.getElementById('frame-ranges-list').innerHTML = '';
        
        // Update URL and load next video
        const newUrl = `${window.location.pathname}?video=${nextVideoFilename}`;
        window.history.pushState({}, '', newUrl);
        
        loadVideoFromURL();
        
        // Clear feedback message
        document.getElementById('feedback').textContent = '';
    } else {
        document.getElementById('feedback').textContent = 'This is the last video in the sequence.';
    }
}

// Function to reset and start the timer
function resetTimer() {
    startTime = Date.now(); // Reset the start time to the current time
}

// Function to calculate the time spent on each video in seconds
function getElapsedTime() {
    const currentTime = Date.now();
    return Math.floor((currentTime - startTime) / 1000); // Calculate elapsed time in seconds
}

function addSubtask() {
    const startStep = parseInt(document.getElementById('startStep').value);
    const endStep = parseInt(document.getElementById('endStep').value);
    const subtask = document.getElementById('subtask').value;
    const elapsedTime = getElapsedTime(); // Calculate how long the user took

    // Validate inputs
    if (isNaN(startStep) || isNaN(endStep) || !subtask) {
        alert("Please provide valid inputs for all fields.");
        return;
    }

    // Hide the placeholder message when the first subtask is added
    const placeholder = document.getElementById('subtask-placeholder');
    if (placeholder) {
        placeholder.style.display = 'none';
    }

    // Add the subtask to the annotations array
    const subtaskTuple = { startStep, endStep, subtask, timeSpent: elapsedTime };
    annotations.push(subtaskTuple);

    // Display the subtask in an editable list (without time spent)
    const annotationList = document.getElementById('annotations');
    const li = document.createElement('li');
    li.innerHTML = `
        <input type="number" class="edit-start-step" value="${startStep}" min="0">
        <input type="number" class="edit-end-step" value="${endStep}" min="0">
        <input type="text" class="edit-subtask" value="${subtask}" style="width: 150px">
        <button onclick="updateSubtask(this)">Update and Save</button>
        <button onclick="removeSubtask(this)">Remove</button>
    `;
    annotationList.appendChild(li);

    // Clear the input fields after adding the subtask
    document.getElementById('startStep').value = '';
    document.getElementById('endStep').value = '';
    document.getElementById('subtask').value = '';

    resetTimer(); // Reset the timer for the next subtask
}

// Function to update a subtask in the list
function updateSubtask(button) {
    const li = button.parentNode;
    const startStepInput = li.querySelector('.edit-start-step');
    const endStepInput = li.querySelector('.edit-end-step');
    const subtaskInput = li.querySelector('.edit-subtask');

    const newStartStep = parseInt(startStepInput.value);
    const newEndStep = parseInt(endStepInput.value);
    const newSubtask = subtaskInput.value;

    const index = Array.from(li.parentNode.children).indexOf(li);

    // Update the corresponding subtask in the annotations array
    annotations[index] = { startStep: newStartStep, endStep: newEndStep, subtask: newSubtask };

    // Update feedback message
    document.getElementById('feedback').textContent = 'Subtask updated.';
}

// Function to remove a subtask from the list
function removeSubtask(button) {
    const li = button.parentNode;
    const index = Array.from(li.parentNode.children).indexOf(li);

    // Remove the subtask from the annotations array
    annotations.splice(index, 1);

    // Remove the list item from the DOM
    li.remove();

    // Show the placeholder message if no subtasks remain
    if (annotations.length === 0) {
        const placeholder = document.getElementById('subtask-placeholder');
        if (placeholder) {
            placeholder.style.display = 'block';
        }
    }
}


// Function to save the annotation and update user progress
function saveAnnotation() {
    const username = document.getElementById('username').value.trim();
    if (!username) {
        alert("Please enter your username.");
        return;
    }

    if (!annotations.length) {
        alert("You must label at least one subtask in this annotation.");
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const videoFilename = urlParams.get('video'); // Get the video filename from the URL

    const annotationData = {
        username: username,
        video: videoFilename,
        status: 'correct' // Set status to 'correct' for normal annotations
    };

    // Send the annotation data to the backend for saving
    fetch('/save', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(annotationData),
    })
        .then(response => response.json())
        .then(_ => {
            // Show success message
            document.getElementById('feedback').textContent = 'Annotation saved successfully! Redirecting to the homepage...';
            document.getElementById('annotations').innerHTML = ''; // Clear displayed annotations
            annotations = []; // Clear current annotation list

            // Delay redirection by 1 seconds to show the success message
            setTimeout(() => {
                window.location.href = '/index.html';
            }, 1000); // 1 seconds delay before redirection
        })
        .catch(error => {
            console.error('Error saving annotation:', error);
            document.getElementById('feedback').textContent = 'Error saving annotation. Please try again.';

            // Delay redirection by 1 seconds to show the error message
            setTimeout(() => {
                window.location.href = '/index.html';
            }, 1000); // 1 seconds delay before redirection
        });
}

function saveUsername() {
    const username = document.getElementById('username').value.trim();
    localStorage.setItem('annotationUsername', username);
}

// Function to load username from localStorage
function loadUsername() {
    const savedUsername = localStorage.getItem('annotationUsername');
    if (savedUsername) {
        document.getElementById('username').value = savedUsername;
    }
}

// Call loadUsername when the page loads
window.addEventListener('load', loadUsername);

// Load the video and setup the page when it loads
window.onload = async function() {
    await getVideoList();
    loadVideoFromURL();
    loadUsername();
}

// Function to toggle playback speed
function togglePlaybackSpeed() {
    const videoPlayer = document.getElementById('videoPlayer');
    isFastSpeed = !isFastSpeed;
    videoPlayer.playbackRate = isFastSpeed ? normalSpeed : sloMoSpeed;
    
    // Update button text
    const button = document.querySelector('button[onclick="togglePlaybackSpeed()"]');
    button.textContent = `${isFastSpeed ? 'Slo-Mo' : 'Normal'}`;
}

// Function to toggle play/pause
function togglePlayPause() {
    const videoPlayer = document.getElementById('videoPlayer');
    isPlaying = !isPlaying;
    
    if (isPlaying) {
        videoPlayer.play();
    } else {
        videoPlayer.pause();
    }
    
    updatePlayPauseButton();
}

// Function to update play/pause button text
function updatePlayPauseButton() {
    const button = document.getElementById('playPauseButton');
    button.textContent = isPlaying ? 'Pause' : 'Play';
}

// Add keyboard event listeners for hotkeys
document.addEventListener('keydown', function(event) {
    // Prevent default behavior for these keys
    if (['ArrowLeft', 'ArrowRight', 'Space', 'KeyS', 'KeyP'].includes(event.code)) {
        event.preventDefault();
    }

    switch(event.code) {
        case 'ArrowLeft':
            previousVideo();
            break;
        case 'ArrowRight':
            nextVideo();
            break;
        case 'Space':
            togglePlayPause();
            break;
        case 'ArrowUp':
            togglePlaybackSpeed();
            break;
        case 'ArrowDown':
            togglePlaybackSpeed();
            break;
        case 'Enter':
            markForReview();
            break;
        // case 'KeyR':
        //     event.preventDefault();
        //     toggleFrameRange();
        //     break;
    }
});

// Function to toggle frame range recording
function toggleFrameRange() {
    const button = document.getElementById('frameRangeButton');
    const currentFrame = getCurrentFrame();
    
    if (!isRecordingRange) {
        // Start recording a new range
        isRecordingRange = true;
        frameRangeStart = currentFrame;
        button.textContent = `End Range (${frameRangeStart})`;
        button.style.backgroundColor = '#ff6b6b'; // Red color to indicate recording
        
        // Add event listener to update frame number
        const videoPlayer = document.getElementById('videoPlayer');
        const updateFrameDisplay = () => {
            if (isRecordingRange) {
                const currentFrame = getCurrentFrame();
                button.textContent = `End Range (${frameRangeStart} - ${currentFrame})`;
            }
        };
        videoPlayer.addEventListener('timeupdate', updateFrameDisplay);
        button.updateFrameDisplay = updateFrameDisplay; // Store reference to remove later
    } else {
        // End recording the range
        isRecordingRange = false;
        const frameRangeEnd = currentFrame;
        
        // Remove the timeupdate event listener
        const videoPlayer = document.getElementById('videoPlayer');
        if (button.updateFrameDisplay) {
            videoPlayer.removeEventListener('timeupdate', button.updateFrameDisplay);
            button.updateFrameDisplay = null;
        }
        
        // Only save if end frame is after start frame
        if (frameRangeEnd > frameRangeStart) {
            frameRanges.push({
                start: frameRangeStart,
                end: frameRangeEnd
            });
            
            // Update the display of recorded ranges
            updateFrameRangesDisplay();
            
            // Show feedback
            document.getElementById('feedback').textContent = 
                `Recorded frame range: ${frameRangeStart} - ${frameRangeEnd}`;
        }
        
        button.textContent = 'Record Range';
        button.style.backgroundColor = ''; // Reset to default gray
    }
}

// Function to update the display of recorded ranges
function updateFrameRangesDisplay() {
    const rangesList = document.getElementById('frame-ranges-list');
    if (!rangesList) return;
    
    rangesList.innerHTML = frameRanges.map((range, index) => `
        <li style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
            <span>Range ${index + 1}: ${range.start} - ${range.end}</span>
            <button onclick="deleteFrameRange(${index})" class="gray-button" style="padding: 4px 8px; margin: 0;">×</button>
        </li>
    `).join('');
}

// Function to delete a frame range
function deleteFrameRange(index) {
    // Remove the range from the array
    frameRanges.splice(index, 1);
    // Update the display
    updateFrameRangesDisplay();
}
