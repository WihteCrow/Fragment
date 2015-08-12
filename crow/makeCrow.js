var ImageToAscii = require("image-to-ascii");

var __dirname = 'img/';

ImageToAscii({
    'path' : __dirname + "/crow.png",
    'pixels' : ' /'
}, function (err, converted) {
    console.log(err || converted);
});