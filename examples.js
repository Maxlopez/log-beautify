
const log = require('log-beautify');

/**
|--------------------------------------------------
| Disable symbols
|--------------------------------------------------
*/
log.useSymbols = false;


/**
|--------------------------------------------------
| Change colors
|--------------------------------------------------
*/
//Valid formats
//const keyword = "blue";//black,white,red,green,yellow,magenta,cyan,gray
//const hex = "#FFF000";
//const rgb = "rgb(255,255,255)";
//const hsl = "hsl(0,100%,50%)";
//const hsv = "hsv(330, 93%, 98%)";
//const hwb = "hwb(0, 100%, 0%)";
log.setColors({
    success: "#00FF00",
    error_: "rgb(191,0,96)",
    info_: "cyan",
});


/**
|--------------------------------------------------
| Add or change new log methods
|--------------------------------------------------
*/
//When you add a color, the method will automatically be created.
log.setColors({
    danger: "#FF8000",
    danger_: "hsl(310, 99%, 57%)",
    saved: 'green',
});
//Now you can use log.danger() and log.danger_() and log.saved()


/**
|--------------------------------------------------
| Add or change symbols
|--------------------------------------------------
*/
log.setSymbols({
    danger: "⛔ ",
    ok: "👍 ",
    saved: "✅ "
});


/**
|--------------------------------------------------
| Add or change text colors for bg logs
|--------------------------------------------------
*/
log.setTextColors({
    error_: 'black',
    info_: 'black',
});