/*
Remote Procedure Call Example

Based on the Step-A-Sketch example code for the Stepdance control system.

A part of the Mixing Metaphors Project

// (c) 2025 Ilan Moyer, Jennifer Jacobs, Devon Frost
*/

// #define module_driver   // tells compiler we're using the Stepdance Driver Module PCB
#define module_basic
                        // This configures pin assignments for the Teensy 4.1


#include "stepdance.hpp"  // Import the stepdance library

// -- Define Encoders --
// Encoders read quadrature input signals and can drive kinematics or other elements
// We use rotary optical encoders for the two etch-a-sketch knobs
Encoder encoder_1;  // left knob, controls horizontal
Encoder encoder_2;  // right knob, controls vertical


// -- RPC Interface --
RPC rpc;

void setup() {

  Serial.begin(115200);
  // -- Configure and start the encoders --
  // {"name":"encoder_1.read"}
  encoder_1.begin(ENCODER_1); // "ENCODER_1" specifies the physical port on the PCB
  encoder_1.set_ratio(24, 2400);  // 24mm per revolution, where 1 rev == 2400 encoder pulses
                                  //We're using a 600CPR encoder, which generates 4 edge transitions per cycle.
  encoder_1.invert(); //invert the encoder direction
  // encoder_1.output.map(&axidraw_kinematics.input_x);


  encoder_2.begin(ENCODER_2);
  encoder_2.set_ratio(24, 2400);
  encoder_2.invert();
  // encoder_2.output.map(&axidraw_kinematics.input_y); // map the right encoder to the y axis input of the kinematics

  // -- RPC Configuration
  // The code below serves to expose some variables and functions to be callable by sending json to stepdance through serial
  // One quick way to test this is to open the Serial Monitor in Arduino IDE, and write Messages in the text box
  // We document a few examples in comments below:
  rpc.begin(); // defaults to Serial

  // Call example:
  // read the current value: {"name": "encoder_1.read"}
  // set the ratio: {"name": "encoder_1.set_ratio", "args": [1, 10]}
  rpc.enroll("encoder_1", encoder_1);
  rpc.enroll("encoder_2", encoder_2);

  // -- Start the stepdance library --
  // This activates the system.
  dance_start();
}

LoopDelay overhead_delay;

void loop() {
  dance_loop(); // Stepdance loop provides convenience functions, and should be called at the end of the main loop
}

