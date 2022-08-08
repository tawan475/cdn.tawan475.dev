require('dotenv').config();
const fs = require('fs');
const createError = require('http-errors');
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
app.dirname = __dirname;
(async() => {
	app.db = await require('./libs/db')(app);
})();
require('./libs/middlewares')(app);

let router = require('./router')(app);
app.use(router);

app.use(function (req, res, next) {
    next(createError(404));
});

function errorHandler(err, req, res, next) {
    if (!err) return; // no error
    // render the error page
	let errorID = uuidv4();
	let errorRequestLog = `o:${req.get('origin') || "direct"} code:${res.statusCode} ${req.trustedip} ${req.method}:${req.protocol}://${req.get('host')}${req.url}`;
	let errorMessage = `[${Date.now()}] errorID: ${errorID} | ${errorRequestLog}\r\n${err.stack}`
	
	console.log(errorMessage)
	
	fs.appendFile(path.join(req.app.dirname, "./error_logs.log"), errorMessage + "\r\n", (err) => {
		if (err) console.log(err)
	});

	if (!err.status || err.status == 500) err.message = 'Internal Server Error';

    res.status(err.status || 500).json({ status: err.status || 500, errorID: errorID, message: err.message || 'Internal Server Error' });
}

// error handler
app.use(errorHandler);

const options = process.env.NODE_ENV === "production" ? {
    key: fs.readFileSync('/etc/letsencrypt/live/tawan475.dev/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/tawan475.dev/fullchain.pem'),
} : {
    key: fs.readFileSync('../ssl/localhost.key'),
    cert: fs.readFileSync('../ssl/localhost.crt')
}

// disabled for http, port = 8003
// require('http').createServer(app).listen(process.env.PORT, () => {
//     console.log(`listening at HTTP`)
// });

require('https').createServer(options, app).listen(process.env.SECURE_PORT, () => {
    console.log(`listening at HTTPS`)
});
