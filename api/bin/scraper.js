const noodle = require('noodlejs');
const parseDomain = require('parse-domain');
const CronJob = require('cron').CronJob;
const MESSAGES = require('../bin/messages');
const SupportedWebsite = require('../models/SupportedWebsite');
const some = require('lodash.some');
const find = require('lodash.find');

const CURRENT_SCRAPING_METHOD = "Noodle/CSS Selectors";
var SUPPORTED_WEBSITES;

new CronJob('* * * * * *', function(){
  SupportedWebsite.getAll()
    .then(function(sites){
      SUPPORTED_WEBSITES = sites;
    })
}, null, true);

var scrape = function(url){
  return new Promise(function(resolve, reject){
    const domain = parseDomain(url).domain;
    if (some(SUPPORTED_WEBSITES, ['domain', domain]) === false){
      reject(MESSAGES.UNSUPPORTED_WEBSITE);
      return;
    }
    var content = {};
    var fields_processed = 0;
    contentFields = find(SUPPORTED_WEBSITES, {domain:domain}).content_fields;
    contentFields.forEach(function(contentField){
      console.log(contentField)
      noodle.query({url: url, selector: contentField.tag, type: 'html', extract: 'text'})
      .then(function(data){
        if (contentField.combine_fields) {
          content[contentField.name] = data.results[0].results.join(" ").replace(/\s+/g, " ");
          if (contentField.required && content[contentField.name] == ""){
            return reject(MESSAGES.COULD_NOT_GET_ARTICLE_INFO);
          }
        } else {
          content[contentField.name] = data.results[0].results;
          if (contentField.required && content[contentField.name].length < 1) {
            return reject(MESSAGES.COULD_NOT_GET_ARTICLE_INFO);
          }
        }
        fields_processed++;
        if (fields_processed === contentFields.length){
          resolve(content);
        }
      }).catch(function(err){
        console.log(err)
        fields_processed++;
        if (fields_processed === contentFields.length){
          resolve(content);
        }
      });
    });
  });
}

module.exports = {
  CURRENT_SCRAPING_METHOD: CURRENT_SCRAPING_METHOD,
  SUPPORTED_WEBSITES: SUPPORTED_WEBSITES,
  scrape: scrape
};
