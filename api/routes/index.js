const express = require('express');
const CronJob = require('cron').CronJob;
const router = express.Router();
const supportedWebsite = require('../models/SupportedWebsite');
var SUPPORTED_WEBSITES;

new CronJob('* * * * * *', function(){
	supportedWebsite.getAll()
	  .then(function(sites){
	    SUPPORTED_WEBSITES = sites.filter(function(site){return site.hidden == false});
	  })
}, null, true);

router.get('/supported_websites', function(req, res, next) {
  res.send(SUPPORTED_WEBSITES);
});

module.exports = router;
