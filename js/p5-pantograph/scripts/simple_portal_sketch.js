import {sketch} from 'p5js-wrapper';

// Array to store the path positions
let path = [];

// Function to reset the path (exposed globally for simple_portal.js to call)
window.resetPath = function() {
  path = [];
};

sketch.setup = function(){
  const canvas = createCanvas(800, 600);
  canvas.parent('canvas-container');
}

sketch.draw= function(){
  background(255);
  
  // Get position from simple_portal.js
  const posX = window.portalPosition?.x || 0;
  const posY = window.portalPosition?.y || 0;
  
  // Get y-offset from input field
  const yOffsetInput = document.getElementById("y-offset");
  const yOffset = parseFloat(yOffsetInput?.value) || 0;
  
  // Subtract y-offset from posY
  const adjustedPosY = posY - yOffset;
  
  // Map the position to canvas coordinates (adjust scaling as needed)
  // Assuming the encoder positions are in some physical units, 
  // we may need to scale them to fit the canvas
  const canvasX = map(posX, -100, 100, 0, width);
  const canvasY = map(adjustedPosY, -100, 100, 0, height);
  
  // Add current position to path
  path.push({x: canvasX, y: canvasY});
  
  // Draw the path (stroke)
  if (path.length > 1) {
    stroke(3, 25, 39);
    strokeWeight(5);
    noFill();
    beginShape();
    for (let i = 0; i < path.length; i++) {
      vertex(path[i].x, path[i].y);
    }
    endShape();
  }
  
  // Draw the circle at current position
  fill(31, 122, 140);
  noStroke();
  circle(canvasX, canvasY, 24);
  // drawingContext.filter = 'blur(6px)';
}
