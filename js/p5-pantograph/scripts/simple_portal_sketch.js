import {sketch} from 'p5js-wrapper';

sketch.setup = function(){
  const canvas = createCanvas(800, 600);
  canvas.parent('canvas-container');
}

sketch.draw= function(){
  background(255);
  fill(0,0,0);
  noStroke();
  
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
  
  circle(canvasX, canvasY, 50);
}
