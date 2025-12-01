import {sketch} from 'p5js-wrapper';

sketch.setup = function(){
  createCanvas (800, 600);
}

sketch.draw= function(){
  background(100);
  fill(255, 255, 0);
  noStroke();
  rectMode(CENTER);
  
  // Get position from simple_portal.js
  const posX = window.portalPosition?.x || 0;
  const posY = window.portalPosition?.y || 0;
  
  // Map the position to canvas coordinates (adjust scaling as needed)
  // Assuming the encoder positions are in some physical units, 
  // we may need to scale them to fit the canvas
  const canvasX = map(posX, -100, 100, 0, width);
  const canvasY = map(posY, -100, 100, 0, height);
  
  rect(canvasX, canvasY, 50, 50);
}
