// Get encoder distance from input field
function getEncoderDist() {
    const input = document.getElementById("encoder-dist");
    return parseFloat(input.value) || 148; // default to 148 if invalid
}

// Calculate x, y position from two encoder radii
function calc_xy(r1, r2) {
    const ENCODER_DIST = getEncoderDist();
    const x = (r1 * r1 - r2 * r2) / (2 * ENCODER_DIST);
    const y = Math.sqrt(r1 * r1 - x * x);
    return { x, y };
}

// Global object to share position data with the sketch
window.portalPosition = { x: 0, y: 0 };

// Recording state
let isRecording = false;
let recordedData = [];
let recordingStartTime = null;

// Initialize recording button
const recordBtn = document.getElementById("record-btn");
const recordStatus = document.getElementById("record-status");

recordBtn.addEventListener("click", () => {
    if (isRecording) {
        // Stop recording and save file
        isRecording = false;
        recordBtn.textContent = ":: record ::";
        recordBtn.style.backgroundColor = "#9A1D51";
        recordStatus.textContent = "";
        
        if (recordedData.length > 0) {
            saveRecordingToFile();
        }
        recordedData = [];
        // // Reset the path when stopping recording
        // if (window.resetPath) {
        //     window.resetPath();
        // }
    } else {
        // Start recording
        isRecording = true;
        recordingStartTime = Date.now();
        recordedData = [];
        recordBtn.textContent = "stop recording";
        recordBtn.style.backgroundColor = "#CE276D";
        recordStatus.textContent = "recording...";
        // Reset the path when starting recording
        if (window.resetPath) {
            window.resetPath();
        }
    }
});

// Function to save recorded data to CSV file
function saveRecordingToFile() {
    // Create CSV content
    let csvContent = "time,encoder_1,encoder_2,x,y\n";
    
    recordedData.forEach(row => {
        csvContent += `${row.time},${row.encoder_1},${row.encoder_2},${row.x},${row.y}\n`;
    });
    
    // Generate filename with timestamp
    const now = new Date();
    const timestamp = now.toISOString().replace(/[-:]/g, '').split('.')[0].replace('T', '_');
    const filename = `gesture_${timestamp}.csv`;
    
    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    recordStatus.textContent = `Saved ${recordedData.length} data points to ${filename}`;
}

const ws = new WebSocket("ws://localhost:8765");

ws.onmessage = (event) => {
    // Ignore WebSocket data if playback is active
    if (isPlaying) {
        return;
    }
    
    const data = JSON.parse(event.data);
    // console.log("Encoder 1:", data.encoder_1);
    // console.log("Encoder 2:", data.encoder_2);

    // Calculate x, y positions
    const r1 = parseFloat(data.encoder_1);
    const r2 = parseFloat(data.encoder_2);
    const { x, y } = calc_xy(r1, r2);
    
    // Update global position for the sketch
    window.portalPosition.x = x;
    window.portalPosition.y = y;
    
    // Record data if recording is active
    if (isRecording) {
        const timestamp = (Date.now() - recordingStartTime) / 1000; // Time in seconds since recording started
        recordedData.push({
            time: timestamp,
            encoder_1: data.encoder_1,
            encoder_2: data.encoder_2,
            x: x,
            y: y
        });
    }
    
    // update UI
    document.getElementById("enc1").innerText = data.encoder_1;
    document.getElementById("enc2").innerText = data.encoder_2;
    document.getElementById("x-pos").innerText = x.toFixed(3);
    document.getElementById("y-pos").innerText = y.toFixed(3);
};

// Playback state
let isPlaying = false;
let playbackData = [];
let playbackStartTime = null;
let playbackAnimationFrame = null;
let currentPlaybackFile = null;

// Initialize playback button and file input
const playbackBtn = document.getElementById("playback-btn");
const playbackStatus = document.getElementById("playback-status");
const fileInput = document.getElementById("gesture-file-input");

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

// Function to stop playback
function stopPlayback() {
    isPlaying = false;
    if (playbackAnimationFrame !== null) {
        cancelAnimationFrame(playbackAnimationFrame);
        playbackAnimationFrame = null;
    }
    playbackBtn.textContent = ":: playback ::";
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
    
    // Stop recording if active
    if (isRecording) {
        isRecording = false;
        recordBtn.textContent = ":: record ::";
        recordBtn.style.backgroundColor = "#9A1D51";
        recordStatus.textContent = "";
        if (recordedData.length > 0) {
            saveRecordingToFile();
        }
        recordedData = [];
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
        
        // Update global position for the sketch
        window.portalPosition.x = x;
        window.portalPosition.y = y;
        
        // Update UI
        document.getElementById("enc1").innerText = frame.encoder_1.toFixed(3);
        document.getElementById("enc2").innerText = frame.encoder_2.toFixed(3);
        document.getElementById("x-pos").innerText = x.toFixed(3);
        document.getElementById("y-pos").innerText = y.toFixed(3);
        
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

// Initialize clear button
const clearBtn = document.getElementById("clear-btn");

clearBtn.addEventListener("click", () => {
    // Reset the path immediately
    if (window.resetPath) {
        window.resetPath();
    }
});

