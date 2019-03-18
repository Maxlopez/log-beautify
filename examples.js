
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


/**
|--------------------------------------------------
| Change current level
|--------------------------------------------------
*/
log.setLevel(1);


/**
|--------------------------------------------------
| Add or change levels
|--------------------------------------------------
*/
log.setLevels({
    custom: "info",//use info level
    fatal: 6,
});