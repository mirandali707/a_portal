// Function to parse CSV file
function parseCSV(csvText) {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',');
    const data = [];
    
    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        if (values.length >= 3) {
            data.push({
                time: parseFloat(values[0]),
                encoder_1: parseFloat(values[1]),
                encoder_2: parseFloat(values[2]),
                x: values.length > 3 ? parseFloat(values[3]) : null,
                y: values.length > 4 ? parseFloat(values[4]) : null
            });
        }
    }
    
    return data;
}

// Factory function to create a playback controller instance
// elementIds: { buttonId, statusId, fileInputId }
// options: { updatePosition: function(x, y), updateUI: function(enc1, enc2, x, y) }
function createPlaybackController(elementIds, options = {}) {
    const { buttonId, statusId, fileInputId } = elementIds;
    const { updatePosition, updateUI } = options;
    
    // Get DOM elements
    const playbackBtn = document.getElementById(buttonId);
    const playbackStatus = document.getElementById(statusId);
    const fileInput = document.getElementById(fileInputId);
    
    // Store original button text to restore on stop
    const originalButtonText = playbackBtn ? playbackBtn.textContent : ":: playback ::";
    
    // Playback state
    let isPlaying = false;
    let playbackData = [];
    let playbackStartTime = null;
    let playbackAnimationFrame = null;
    let currentPlaybackFile = null;
    
    // Function to stop playback
    function stopPlayback() {
        isPlaying = false;
        if (playbackAnimationFrame !== null) {
            cancelAnimationFrame(playbackAnimationFrame);
            playbackAnimationFrame = null;
        }
        playbackBtn.textContent = originalButtonText;
        playbackBtn.style.backgroundColor = "#9A1D51";
        playbackStatus.textContent = "";
        currentPlaybackFile = null;
        playbackData = [];
        // Reset the path when stopping playback
        if (window.resetPath) {
            window.resetPath();
        }
    }
    
    // Function to start playback
    function startPlayback(data, filename) {
        if (data.length === 0) {
            playbackStatus.textContent = "Error: No data in file";
            return;
        }
        
        // Stop recording if active (if these globals exist)
        if (typeof isRecording !== 'undefined' && isRecording) {
            if (typeof recordBtn !== 'undefined') {
                isRecording = false;
                recordBtn.textContent = ":: record ::";
                recordBtn.style.backgroundColor = "#9A1D51";
                if (typeof recordStatus !== 'undefined') {
                    recordStatus.textContent = "";
                }
                if (typeof recordedData !== 'undefined' && recordedData.length > 0 && typeof saveRecordingToFile !== 'undefined') {
                    saveRecordingToFile();
                }
                if (typeof recordedData !== 'undefined') {
                    recordedData = [];
                }
            }
        }
        
        isPlaying = true;
        playbackData = data;
        playbackStartTime = Date.now();
        currentPlaybackFile = filename;
        playbackBtn.textContent = "stop playback";
        playbackBtn.style.backgroundColor = "#CE276D";
        playbackStatus.textContent = `playing... ${filename}`;
        
        // Reset the path when starting playback
        if (window.resetPath) {
            window.resetPath();
        }
        
        // Start playback loop
        function playbackLoop() {
            if (!isPlaying) return;
            
            const currentTime = (Date.now() - playbackStartTime) / 1000; // Time in seconds
            const totalDuration = playbackData[playbackData.length - 1].time;
            
            // Loop the playback
            const loopTime = currentTime % totalDuration;
            
            // Find the current frame to display (interpolate between frames)
            let frameIndex = 0;
            for (let i = 0; i < playbackData.length - 1; i++) {
                if (loopTime >= playbackData[i].time && loopTime <= playbackData[i + 1].time) {
                    frameIndex = i;
                    break;
                }
                if (loopTime < playbackData[i].time) {
                    frameIndex = Math.max(0, i - 1);
                    break;
                }
            }
            
            // If we're past the last frame, use the last frame
            if (loopTime >= playbackData[playbackData.length - 1].time) {
                frameIndex = playbackData.length - 1;
            }
            
            const frame = playbackData[frameIndex];
            
            // Calculate x, y from encoder values (or use stored values if available)
            let x, y;
            if (frame.x !== null && frame.y !== null) {
                x = frame.x;
                y = frame.y;
            } else {
                const { x: calcX, y: calcY } = calc_xy(frame.encoder_1, frame.encoder_2);
                x = calcX;
                y = calcY;
            }
            
            // Update position (either via callback or global)
            if (updatePosition) {
                updatePosition(x, y);
            } else {
                window.portalPosition.x = x;
                window.portalPosition.y = y;
            }
            
            // Update UI (either via callback or default)
            if (updateUI) {
                updateUI(frame.encoder_1, frame.encoder_2, x, y);
            } else {
                const enc1El = document.getElementById("enc1");
                const enc2El = document.getElementById("enc2");
                const xPosEl = document.getElementById("x-pos");
                const yPosEl = document.getElementById("y-pos");
                if (enc1El) enc1El.innerText = frame.encoder_1.toFixed(3);
                if (enc2El) enc2El.innerText = frame.encoder_2.toFixed(3);
                if (xPosEl) xPosEl.innerText = x.toFixed(3);
                if (yPosEl) yPosEl.innerText = y.toFixed(3);
            }
            
            playbackAnimationFrame = requestAnimationFrame(playbackLoop);
        }
        
        playbackLoop();
    }
    
    // Handle file input change
    fileInput.addEventListener("change", (event) => {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const csvText = e.target.result;
                const data = parseCSV(csvText);
                startPlayback(data, file.name);
            } catch (error) {
                playbackStatus.textContent = `Error parsing file: ${error.message}`;
            }
        };
        reader.onerror = () => {
            playbackStatus.textContent = "Error reading file";
        };
        reader.readAsText(file);
    });
    
    // Handle playback button click
    playbackBtn.addEventListener("click", () => {
        if (isPlaying) {
            stopPlayback();
        } else {
            // Open file picker
            fileInput.click();
        }
    });
    
    // Return controller object with public methods
    return {
        isPlaying: () => isPlaying,
        stopPlayback,
        startPlayback
    };
}
