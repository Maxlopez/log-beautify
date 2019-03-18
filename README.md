<p align="center">
	<br>
	<img src="https://codexhelp.com/log-beautify/logo.png" alt="log-beautify">
	<br>
	<br>
</p>

# log-beautify

Show messages on your terminal with style :-)

# Installation
```bash
npm install log-beautify
```

# Usage
```js
const log = require('log-beautify');

log.trace('Trace');//change the level to use trace
log.success('Success');
log.ok('Ok');//success alias
log.debug('Debug');
log.info('Info');
log.warning('Warning');
log.warn('Warn');//warning alias
log.error('Error');

```


# API
### Log methods
- `log.success()` *(for text color)*
- `log.success_()` *(for background color)*
- `log.ok()` *(success alias)*
- `log.ok_()` *(success_ alias)*
- `log.debug()`
- `log.debug_()`
- `log.info()`
- `log.info_()`
- `log.warning()`
- `log.warning_()`
- `log.warn()` *(warning alias)*
- `log.warn_()` *(warning_ alias)*
- `log.error()`
- `log.error_()`

You can create your own log methods, for example:

```js
log.setColors({
    custom_: "green",
});
log.setSymbols({
    custom_: "✅ ",
});

//Now you can use it
log.custom_('Server listening on port 3000 ');

```
<p align="center">
	<br>
	<img src="https://codexhelp.com/log-beautify/log-beautify-custom.png" alt="log-beautify">
	<br>
	<br>
</p>


### Log levels
Current working level is: 1
Default level for new log methods: 1
Default levels:

```js
{
    silent: -1,//hide all logs
    trace: 0,
    success: 1,
    debug: 2,
    info: 3,
    warning: 4,
    error: 5,
}
```


### Config

- `log.useSymbols = true` *(Enable or disable symbols)*
- `log.setColors({})` *(Add or change colors)*
- `log.setSymbols({})` *(Add or change symbols)*
- `log.setTextColors({})` *(Change text colors for bg logs)*
- `log.setLevel(1)` *(Change current level)*
- `log.setLevels({})` *(Add or change levels)*



### Colors

You can use the following color formats. (Use strings)

- `keyword` Example: `"red"` *(black,white,red,green,yellow,magenta,cyan,gray)*
- `hex` Example: `"#FFF000"`
- `rgb` Example: `"rgb(255, 255, 255)"`
- `hsl` Example: `"hsl(0, 100%, 50%)"`
- `hsv` Example: `"hsv(330, 93%, 98%)"`
- `hwb` Example: `"hwb(0, 100%, 0%)"`



# Usage examples

```js

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
log.setLevel(2);


/**
|--------------------------------------------------
| Add or change levels
|--------------------------------------------------
*/
log.setLevels({
    fatal: 6,
    custom: "info"//use info level
});

```


# Collaborators

- [Max López](https://github.com/maxlopez)


# License

MIT