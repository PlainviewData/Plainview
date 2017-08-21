const express = require('express');
const router = express.Router();
const fs = require("fs");
const urlencode = require("urlencode");
const request = require('request-json');
const session = require('express-session');
var client;
var config;

fs.readFile("./config/api_server.json", 'utf8', function(err, res){
	config = JSON.parse(res)
	client = request.createClient("http://"+config.ip);
});

router.post('/', function(req, res, next) {
	client.post(config.articles_path, req.body, function(err, response, body){
		if (response && body){
			res.send({statusCode: response.statusCode, body: body});
			// res.redirect("/"+body.news_site_url);			
		} else {
			res.send("Internal error")
		}
	});
});

router.get('/:article_id', function(req, res, next){
	client.get(config.articles_path+"/"+req.params.article_id, function(err, response, body){
		if (response.statusCode < 400){
			req.session.article = body;
			res.redirect("/"+body.news_site_url);
		}
	});
});

module.exports = router;
