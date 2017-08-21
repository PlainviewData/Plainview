const express = require('express');
const router = express.Router();
const fs = require("fs");
const http = require('http');
const request = require('request-json');
const CronJob = require('cron').CronJob;
var config;

const api_server_config = JSON.parse(fs.readFileSync("./config/api_server.json"));
var supported_websites;
var client;

fs.readFile("./config/api_server.json", 'utf8', function(err, res){
	config = JSON.parse(res)
	client = request.createClient("http://"+config.ip);
});

new CronJob('* * * * * *', function(){
	client.get(config.supported_websites_path, function(err, response, body){
		supported_websites = body;
	});
}, null, true);

router.get('/', function(req, res, next) {
	res.json(supported_websites);
});

module.exports = router;
