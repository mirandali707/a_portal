import {p5} from 'p5js-wrapper';

let sketch1 = new p5( p => {

    p.setup = () => {
      // canvas size is specified in the CSS file (size of div #one)
      const one= document.getElementById('src1');
      p.createCanvas(one.clientWidth, one.clientHeight);
      // same as: p.createCanvas($("#one").width(), $("#one").height());
    };
  
    p.draw = () => {
      p.background(100);
      p.fill(255);
      p.noStroke();
      p.rectMode(p.CENTER);
      p.rect(50, 50, 50, 50);
  
    };
  }, 'src1');
  
  
// Sketch2
let sketch2 = new p5( p => {

  p.setup = () => {
    // canvas size is specified in the CSS file (size of div #two)
    const two= document.getElementById('src2');
    p.createCanvas(two.clientWidth, two.clientHeight);
    // same as: p.createCanvas($("#two").width(), $("#two").height());
  };

  p.draw = () => {
    p.background(170);
    p.noStroke();
    p.fill(255);
    p.ellipse(50, 50, 50, 50);
  };
}, 'src2');