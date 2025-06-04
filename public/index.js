async function loadVideoProgress() {
    try {
        const response = await fetch('/video-status');
        if (!response.ok) {
            throw new Error('Failed to fetch video progress');
        }

        const videos = await response.json();
        const videoList = document.getElementById('video-list');
        videoList.innerHTML = ''; // Clear existing content

        // Calculate counts
        const totalVideos = videos.length;
        const completedVideos = videos.filter(v => v.status === 'todo').length;
        
        // Get the title from the videos endpoint
        const videosResponse = await fetch('/videos');
        const videosData = await videosResponse.json();
        
        // Update the h1 title with the title from _videos.json and the count
        const h1 = document.querySelector('h1');
        h1.textContent = `${videosData.title} (${totalVideos - completedVideos}/${totalVideos} Complete)`;

        // Add numbered entries
        videos.forEach((videoData, index) => {
            const { video, status } = videoData;

            const videoEntry = document.createElement('div');
            videoEntry.className = 'video-entry';

            // Add number
            const numberSpan = document.createElement('span');
            numberSpan.textContent = `${index + 1}. `;
            numberSpan.style.marginRight = '10px';
            numberSpan.style.minWidth = '30px';
            numberSpan.style.display = 'inline-block';

            const videoName = document.createElement('a');
            videoName.textContent = video;
            videoName.href = `/annotate.html?video=${video}`;

            const statusSpan = document.createElement('span');
            statusSpan.className = `${status}-text`;
            statusSpan.textContent = status.toUpperCase();
            statusSpan.style.marginLeft = '10px';
            statusSpan.style.display = 'inline-block';
            statusSpan.style.width = '100px';
            statusSpan.style.textAlign = 'left';

            videoEntry.appendChild(numberSpan);
            videoEntry.appendChild(statusSpan);
            videoEntry.appendChild(videoName);
            videoList.appendChild(videoEntry);
        });
    } catch (error) {
        console.error('Error loading video progress:', error);
    }
}

async function saveReviewerName() {
    const name = document.getElementById('reviewerName').value.trim();
    if (!name) {
        alert('Please enter your name');
        return;
    }

    try {
        const response = await fetch('/save-reviewer-name', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name })
        });

        if (!response.ok) {
            throw new Error('Failed to save name');
        }

        alert('Name saved successfully!');
    } catch (error) {
        console.error('Error saving name:', error);
        alert('Failed to save name. Please try again.');
    }
}

// Load saved name when page loads
async function loadSavedName() {
    try {
        const response = await fetch('/get-reviewer-name');
        if (response.ok) {
            const data = await response.json();
            if (data.name) {
                document.getElementById('reviewerName').value = data.name;
            }
        }
    } catch (error) {
        console.error('Error loading saved name:', error);
    }
}

window.onload = function() {
    loadVideoProgress();
    loadSavedName();
};