var five = require("johnny-five");
var pixel = require("node-pixel");
var raspi = require("raspi-io");

var opts = {};
opts.port = process.argv[2] || "";

var board = new five.Board({
    io: new raspi()
});
var strip = null;

var fps = 20; // how many frames per second do you want to try?

board.on("ready", function() {

    console.log("Board ready, lets add light");

    strip = new pixel.Strip({
        color_order: pixel.COLOR_ORDER.GRB,
        board: this,
        controller: "I2CBACKPACK",
        strips: [300],
    });

    strip.on("ready", function() {
        console.log("Strip ready, let's go");
        strip.color("#000"); // blanks it out
        console.log("#000")
        strip.show()
        strip.color("white")

    });
});