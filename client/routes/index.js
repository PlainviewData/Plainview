const express = require('express');
const router = express.Router();
const fs = require("fs");
const http = require('http');

const api_server_config = JSON.parse(fs.readFileSync("./config/api_server.json"));
var supported_websites;

var supported_websites_options = {
	host: JSON.parse(fs.readFileSync("./config/api_server.json"))["ip"],
	path: JSON.parse(fs.readFileSync("./config/api_server.json"))["supported_websites_path"]
};

var callback = function(response) {
	var body = '';

	response.on('data', function (chunk) {
		body += chunk;
	});

	response.on('end', function () {
		supported_websites = body;
		console.log(supported_websites)
	});
}


http.request(supported_websites_options, callback).end();

router.get('/supported_websites', function(req, res, next) {

});

module.exports = router;
