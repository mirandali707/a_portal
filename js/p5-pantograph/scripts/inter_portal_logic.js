// Get encoder distance from input field
function getEncoderDist() {
    const input = document.getElementById("encoder-dist");
    return parseFloat(input.value) || 148; // default to 148 if invalid
}

function getEnc1Slider() {
    const input = document.getElementById("enc_1");
    return parseFloat(input.value) || 0; // default to 0 if invalid
}

function getEnc2Slider() {
    const input = document.getElementById("enc_2");
    return parseFloat(input.value) || 0; // default to 0 if invalid
}

// Calculate x, y position from two encoder radii
function calc_xy(r1, r2) {
    const ENCODER_DIST = getEncoderDist();
    const x = (r1 * r1 - r2 * r2) / (2 * ENCODER_DIST);
    const y = Math.sqrt(r1 * r1 - x * x);
    return { x, y };
}

// Interpolate encoders between src1 and src2 according to the slider values
function interp_encoders(src1_r1, src1_r2, src2_r1, src2_r2) {
    const interp_r1 = src1_r1 + (getEnc1Slider() / 100) * (src2_r1 - src1_r1);
    const interp_r2 = src1_r2 + (getEnc2Slider() / 100) * (src2_r2 - src1_r2);
    return { interp_r1, interp_r2 };
}

// Global object to share position data with the sketch
window.portalPosition = { x: 0, y: 0 };
// Position objects for src1 and src2 playback
window.src1Position = { x: 0, y: 0 };
window.src2Position = { x: 0, y: 0 };
// Encoder values for src1 and src2
window.src1Encoders = { r1: null, r2: null };
window.src2Encoders = { r1: null, r2: null };
// Interpolated encoder values
window.interp_r1 = null;
window.interp_r2 = null;

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

// Function to record interpolated encoder values if recording is active
function recordIfActive() {
    if (isRecording && window.interp_r1 !== null && window.interp_r2 !== null) {
        const timestamp = (Date.now() - recordingStartTime) / 1000; // Time in seconds since recording started
        const { x: interp_x, y: interp_y } = calc_xy(window.interp_r1, window.interp_r2);
        recordedData.push({
            time: timestamp,
            encoder_1: window.interp_r1,
            encoder_2: window.interp_r2,
            x: interp_x,
            y: interp_y
        });
    }
}

// Function to update portalPosition based on interpolated encoder values
function updatePortalPosition() {
    // Get encoder values from src1
    const src1_r1 = window.src1Encoders.r1;
    const src1_r2 = window.src1Encoders.r2;
    
    // Get encoder values from src2
    const src2_r1 = window.src2Encoders.r1;
    const src2_r2 = window.src2Encoders.r2;
    
    // If src1 has no data, don't update
    if (src1_r1 === null || src1_r2 === null) {
        return;
    }
    
    let interp_r1, interp_r2;
    
    // If src2 has no data, pass through src1 data
    if (src2_r1 === null || src2_r2 === null) {
        interp_r1 = src1_r1;
        interp_r2 = src1_r2;
    } else {
        // Interpolate between src1 and src2
        const interp = interp_encoders(src1_r1, src1_r2, src2_r1, src2_r2);
        interp_r1 = interp.interp_r1;
        interp_r2 = interp.interp_r2;
    }
    
    // Store interpolated encoder values globally
    window.interp_r1 = interp_r1;
    window.interp_r2 = interp_r2;
    
    // Calculate xy from interpolated encoder values
    const { x, y } = calc_xy(interp_r1, interp_r2);
    
    // Update portalPosition
    window.portalPosition.x = x;
    window.portalPosition.y = y;
    
    // Record if recording is active
    recordIfActive();
}

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
    const filename = `inter_portal_gesture_${timestamp}.csv`;
    
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

// live sensor data is streamed into src1 ONLY!
ws.onmessage = (event) => {
    // Ignore WebSocket data if src1 playback is active
    if (window.playbackControllerSrc1 && window.playbackControllerSrc1.isPlaying()){
        return;
    }
    
    const data = JSON.parse(event.data);

    // Store encoder values for src1
    const r1 = parseFloat(data.encoder_1);
    const r2 = parseFloat(data.encoder_2);
    window.src1Encoders.r1 = r1;
    window.src1Encoders.r2 = r2;
    
    // Calculate x, y positions
    const { x, y } = calc_xy(r1, r2);
    
    // Update position for src1
    window.src1Position.x = x;
    window.src1Position.y = y;
    
    // Update portalPosition with interpolated values (this will also record if active)
    updatePortalPosition();
};

// Initialize playback controllers for src1 and src2
window.playbackControllerSrc1 = createPlaybackController({
    buttonId: "playback-btn-src1",
    statusId: "playback-status-src1",
    fileInputId: "gesture-file-input-src1"
}, {
    updatePosition: (x, y, enc1, enc2) => {
        window.src1Position.x = x;
        window.src1Position.y = y;
        // Store encoder values
        window.src1Encoders.r1 = enc1;
        window.src1Encoders.r2 = enc2;
        // Update portalPosition with interpolated values (this will also record if active)
        updatePortalPosition();
    },
    updateUI: (enc1, enc2, x, y) => {
        // Don't update main UI for src1 playback
    }
});

window.playbackControllerSrc2 = createPlaybackController({
    buttonId: "playback-btn-src2",
    statusId: "playback-status-src2",
    fileInputId: "gesture-file-input-src2"
}, {
    updatePosition: (x, y, enc1, enc2) => {
        window.src2Position.x = x;
        window.src2Position.y = y;
        // Store encoder values
        window.src2Encoders.r1 = enc1;
        window.src2Encoders.r2 = enc2;
        // Update portalPosition with interpolated values (this will also record if active)
        updatePortalPosition();
    },
    updateUI: (enc1, enc2, x, y) => {
        // Don't update main UI for src2 playback
    }
});

// Initialize clear buttons for src1 and src2
// Pass function names as strings so they're looked up at click time (when they're available)
createClearButton("clear-btn-src1", "resetPath1");
createClearButton("clear-btn-src2", "resetPath2");

// Initialize main clear button (if needed for main canvas)
createClearButton("clear-btn", "resetPath");

// Add event listeners to sliders to update portalPosition when they change
const enc1Slider = document.getElementById("enc_1");
const enc2Slider = document.getElementById("enc_2");

if (enc1Slider) {
    enc1Slider.addEventListener("input", () => {
        updatePortalPosition();
    });
}

if (enc2Slider) {
    enc2Slider.addEventListener("input", () => {
        updatePortalPosition();
    });
}

