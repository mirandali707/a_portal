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
        // Stop playback if active
        if (window.playbackController && window.playbackController.isPlaying()) {
            window.playbackController.stopPlayback();
        }
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
    if (window.playbackController && window.playbackController.isPlaying()) {
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

// Initialize playback controller
window.playbackController = createPlaybackController({
    buttonId: "playback-btn",
    statusId: "playback-status",
    fileInputId: "gesture-file-input"
});

// Initialize clear button
createClearButton("clear-btn");
