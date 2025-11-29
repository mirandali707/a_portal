import '../css/style.css';
import {sketch} from 'p5js-wrapper';

// function preload() {
//   handPose = ml5.handPose();
// }

sketch.setup = function(){
  createCanvas (800, 600);
}

sketch.draw= function(){
  background(100);
  fill(255, 255, 0);
  noStroke();
  rectMode(CENTER);
  rect(mouseX, mouseY, 50, 50);
}

sketch.mousePressed = function(){
  console.log('here');
}


