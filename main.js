var five = require("johnny-five");
var pixel = require("node-pixel");
var raspi = require("raspi-io");

let config
let firstRun = false
function logger (msg) {
    if (ready.blynk) {
        term.print(msg)
    }
    console.log(msg);
}
try {
  config = require("./config.json")
} catch (e) {
  let error = "Unknown Error"
  config = require("./.config.default.json")
  firstRun = true
  if (typeof e.code !== 'undefined' && e.code === 'MODULE_NOT_FOUND') {
    error = "'config.js' not found. \nYou can configure your mirror at the remote address below..."
  } else if (typeof e.message !== 'undefined') {
    logger(e)
    error = "Syntax Error. \nLooks like there's an error in your config file: " + e.message + '\n' +
      'Protip: You might want to paste your config file into a JavaScript validator like http://jshint.com/'
  }
  logger(error)
}

var ready = {}
ready.board = false
ready.strip = false
ready.blynk = false
ready.blynkOn = false
var myColor = [0,0,0]

function setStrip (state, color) {
    try {
        ready.blynkOn = state;
        myColor = color;
        if (ready.strip) {
            if (ready.blynkOn) {
                strip.color(myColor);
                strip.show();
            } else {
                strip.off();
            }
        
        } else {
            logger("Cannot set strip. Strip Not Ready.");
        }
    } catch (e){
        logger(e)    
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
    ready.board = true
    logger("Board ready, lets add light");

    strip = new pixel.Strip({
        color_order: pixel.COLOR_ORDER.GRB,
        board: this,
        controller: "I2CBACKPACK",
        strips: config.strips.leds,
    });

    strip.on("ready", function() {
        ready.strip = true
        board.on("exit", function(){
            ready.board = false
            ready.strip = false
            strip.off();
        })
        logger("Strip ready, let's go! Use Blynk to control lights");
    });
});

var Blynk = require('blynk-library');

if (config.blynk.auth) {
var blynk = new Blynk.Blynk(config.blynk.auth);

var v0 = new blynk.VirtualPin(0);
var v1 = new blynk.VirtualPin(1);
var term = new blynk.WidgetTerminal(22);
var vLED = new blynk.WidgetLED(2)
var v2
v0.on('write', function(param) {
  logger('V0: ' + param);
  setStrip(param == 1, myColor);
});
v1.on('write', function(param) {
  logger('V1: ' + param);
  if (param.length == 3) {
    for (i in param) {
        if (param[i] > 255) {
            param[i]=255
            v1.write(param)
        }
    }
    setStrip(ready.blynkOn, param);
  } else {
    myColor = strip.color() || "[0, 0, 0]"
    myColor = myColor.rgb
    setStrip(false,myColor)
  }
});
term.on("write", function(param) {
    logger('term: ' + param)
})

blynk.on('connect', function() {
    blynk.syncAll(); 
    logger("Blynk ready."); 
});
blynk.on('disconnect', function() { 
    logger("DISCONNECT"); 
});
}