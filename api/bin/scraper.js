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

var scrapeContent = function(url){
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
        fields_processed++;
        if (fields_processed === contentFields.length){
          resolve(content);
        }
      });
    });
  });
};

var scrapeMetadata = function(url, metadataFields){
  return new Promise(function(resolve, reject){
    console.log('3')
    const domain = parseDomain(url).domain;
    if (some(SUPPORTED_WEBSITES, ['domain', domain]) === false){
      reject(MESSAGES.UNSUPPORTED_WEBSITE);
      return;
    }
    var metadata = {};
    var fields_processed = 0;
    metadataFields.forEach(function(metadataField){
      noodle.query({url: url, selector: metadataField, type: 'html', extract: 'text'})
      .then(function(data){
        console.log('9')
        metadata[metadataField] = data.results[0].results.toString();
        fields_processed++;
        if (fields_processed === metadataFields.length){
          resolve(metadata);
        }
      }).catch(function(err){
        fields_processed++;
        if (fields_processed === metadataFields.length){
          resolve(metadata);
        }
      });
    });
  });
};

module.exports = {
  CURRENT_SCRAPING_METHOD: CURRENT_SCRAPING_METHOD,
  SUPPORTED_WEBSITES: SUPPORTED_WEBSITES,
  scrapeContent: scrapeContent,
  scrapeMetadata: scrapeMetadata
};
