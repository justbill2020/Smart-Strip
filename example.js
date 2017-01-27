var five = require("johnny-five");
var pixel = require("node-pixel");
var raspi = require("raspi-io");

let config
let firstRun = false
try {
  config = require("./config.json")
} catch (e) {
  let error = "Unknown Error"
  config = require("./.config.default.json")
  firstRun = true
  if (typeof e.code !== 'undefined' && e.code === 'MODULE_NOT_FOUND') {
    error = "'config.js' not found. \nYou can configure your mirror at the remote address below..."
  } else if (typeof e.message !== 'undefined') {
    console.log(e)
    error = "Syntax Error. \nLooks like there's an error in your config file: " + e.message + '\n' +
      'Protip: You might want to paste your config file into a JavaScript validator like http://jshint.com/'
  }
  console.log(error)
}

var ready = {}
ready.board = false
ready.strip = false
ready.blynk = false
ready.blynkOn = false
var myColor = [0,0,0]

function setStrip (state, color = "black") {
    ready.blynkOn = state;
    myColor = color;
    if (ready.strip) {
        strip.color(myColor);
        if (ready.blynkOn) {
            strip.show();
        } else {
            strip.off();
        }
    } else {
        console.log("Cannot set strip. Strip Not Ready.");
    }

}
var opts = {};
opts.port = process.argv[2] || "";

var board = new five.Board({
    io: new raspi()
});
var strip = null;

var fps = config.strips.fps; // how many frames per second do you want to try?

board.on("ready", function() {

    console.log("Board ready, lets add light");

    strip = new pixel.Strip({
        color_order: pixel.COLOR_ORDER.GRB,
        board: this,
        controller: "I2CBACKPACK",
        strips: config.strips.leds,
    });

    strip.on("ready", function() {
        board.on("exit", function(){
            strip.off();
        })
        console.log("Strip ready, let's go! Use Blynk to control lights");
    });
});

var Blynk = require('blynk-library');

if (config.blynk.auth) {
var blynk = new Blynk.Blynk(config.blynk.auth);

var v0 = new blynk.VirtualPin(0);
var v0 = new blynk.VirtualPin(1);

v0.on('write', function(param) {
  console.log('V0:', param);
  setStrip(param === 0, myColor);
});
v1.on('write', function(param) {
  console.log('V1:', param);
  setStrip(ready.blynkOn, param);
});


blynk.on('connect', function() {
    blynk.syncAll(); 
    console.log("Blynk ready."); 
});
blynk.on('disconnect', function() { 
    console.log("DISCONNECT"); 
});
}