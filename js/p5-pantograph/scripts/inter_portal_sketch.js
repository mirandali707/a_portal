import {p5} from 'p5js-wrapper';

let sketch1 = new p5( p => {
  // Array to store the path positions for src1
  let path1 = [];

  // Function to reset the path (exposed globally for simple_portal_logic.js to call)
  window.resetPath1 = function() {
    path1 = [];
  };

    p.setup = () => {
      // canvas size is specified in the CSS file (size of div #one)
      const one= document.getElementById('src1');
      p.createCanvas(300,200);
      // same as: p.createCanvas($("#one").width(), $("#one").height());
    };
  
    p.draw = () => {
      p.background(255);
      
      const posX = window.src1Position?.x || 0;
      const posY = window.src1Position?.y || 0;
      
      // Get y-offset from input field
      const yOffsetInput = document.getElementById("y-offset");
      const yOffset = parseFloat(yOffsetInput?.value) || 0;
      
      // Subtract y-offset from posY
      const adjustedPosY = posY - yOffset;
      
      // Map the position to canvas coordinates (adjust scaling as needed)
      // Assuming the encoder positions are in some physical units, 
      // we may need to scale them to fit the canvas
      const canvasX = p.map(posX, -100, 100, 0, p.width);
      const canvasY = p.map(adjustedPosY, -100, 100, 0, p.height);
      
      // Add current position to path
      path1.push({x: canvasX, y: canvasY});
      
      // Draw the path (stroke)
      if (path1.length > 1) {
        p.stroke(3, 25, 39);
        p.strokeWeight(5);
        p.noFill();
        p.beginShape();
        for (let i = 0; i < path1.length; i++) {
          p.vertex(path1[i].x, path1[i].y);
        }
        p.endShape();
      }
      
      // Draw the circle at current position
      p.fill(31, 122, 140);
      p.noStroke();
      p.circle(canvasX, canvasY, 24);
      // drawingContext.filter = 'blur(6px)';
    };
  }, 'src1');
  
  
let sketch2 = new p5( p => {
  // Array to store the path positions for src1
  let path2 = [];

  // Function to reset the path (exposed globally for simple_portal_logic.js to call)
  window.resetPath2 = function() {
    path2 = [];
  };

    p.setup = () => {
      // canvas size is specified in the CSS file (size of div #one)
      const two= document.getElementById('src2');
      p.createCanvas(300,200);
      // same as: p.createCanvas($("#one").width(), $("#one").height());
    };
  
    p.draw = () => {
      p.background(255);
      
      const posX = window.src2Position?.x || 0;
      const posY = window.src2Position?.y || 0;
      
      // Get y-offset from input field
      const yOffsetInput = document.getElementById("y-offset");
      const yOffset = parseFloat(yOffsetInput?.value) || 0;
      
      // Subtract y-offset from posY
      const adjustedPosY = posY - yOffset;
      
      // Map the position to canvas coordinates (adjust scaling as needed)
      // Assuming the encoder positions are in some physical units, 
      // we may need to scale them to fit the canvas
      const canvasX = p.map(posX, -100, 100, 0, p.width);
      const canvasY = p.map(adjustedPosY, -100, 100, 0, p.height);
      
      // Add current position to path
      path2.push({x: canvasX, y: canvasY});
      
      // Draw the path (stroke)
      if (path2.length > 1) {
        p.stroke(3, 25, 39);
        p.strokeWeight(5);
        p.noFill();
        p.beginShape();
        for (let i = 0; i < path2.length; i++) {
          p.vertex(path2[i].x, path2[i].y);
        }
        p.endShape();
      }
      
      // Draw the circle at current position
      p.fill(31, 122, 140);
      p.noStroke();
      p.circle(canvasX, canvasY, 24);
      // drawingContext.filter = 'blur(6px)';
    };
  }, 'src2');

  
let mainSketch = new p5( p => {

  p.setup = () => {
    // canvas size is specified in the CSS file (size of div #two)
    const canvasContainer = document.getElementById('canvas-container');
    p.createCanvas(600,400);
  };

  p.draw = () => {
    p.background(170);
    p.noStroke();
    p.fill(255);
    p.ellipse(50, 50, 50, 50);
  };
}, 'canvas-container');