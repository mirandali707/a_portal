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

const ws = new WebSocket("ws://localhost:8765");

ws.onmessage = (event) => {
    console.log("WS MESSAGE:", event.data);
    const data = JSON.parse(event.data);
    console.log("Encoder 1:", data.encoder_1);
    console.log("Encoder 2:", data.encoder_2);

    // Calculate x, y positions
    const r1 = parseFloat(data.encoder_1);
    const r2 = parseFloat(data.encoder_2);
    const { x, y } = calc_xy(r1, r2);
    
    // Update global position for the sketch
    window.portalPosition.x = x;
    window.portalPosition.y = y;
    
    // update UI
    document.getElementById("enc1").innerText = data.encoder_1;
    document.getElementById("enc2").innerText = data.encoder_2;
    document.getElementById("x-pos").innerText = x.toFixed(3);
    document.getElementById("y-pos").innerText = y.toFixed(3);
};

