const mongoose = require('mongoose');
const shortid = require('shortid');
const jsdiff = require('diff');
const parseDomain = require('parse-domain');
const some = require('lodash.some');
const isEqual = require('lodash.isequal');
const isEqualWith = require('lodash.isequalwith');
const isEmpty = require('lodash.isempty');
const moment = require('moment');
const validator = require('validator');
const archive_is = require('archive.is');
const scraper = require('../bin/scraper');
const MESSAGES = require('../bin/messages');
const Schema = mongoose.Schema;
const SupportedWebsite = require('../models/SupportedWebsite');

SupportedWebsite.getAll()
  .then(function(sites){
    SUPPORTED_WEBSITES = sites;
  })

const METADATA_FIELDS = [
  "title"
];

const revision_comparisons = [
  {field: 'original_headline', comparison: 'headline', diff_field: 'headline_revisions'},
  {field: 'original_story_content', comparison: 'story', diff_field: 'story_content_revisions'},
  {field: 'original_authors', comparison: 'author', diff_field: 'authors_revisions'}, //change comparison to authors
  {field: 'original_date_posted', comparison: 'date', diff_field: 'date_posted_revisions'}
];

const articleSchema = new Schema({
	_id: { type: String, 'default': shortid.generate, required: true, unique: true},
  scraped_using: {type: String, required: true},
  news_site_url: {type: String, required: true},
  metadata: {},
  original_archive_time: {type: Date, default: Date.now, required: true},
  last_checked_for_revision: {type: Date, default: Date.now, required: true},

	original_headline: {type: String, required: true},
	original_story_content: {type: String, required: true},
	original_authors: [String],
  original_date_posted: [String],

  headline_revisions: [],
  story_content_revisions: [],
  authors_revisions: [],
  date_posted_revisions: [],

	archive_is_id: String,

  times_to_check: Number
});

articleSchema.virtual('news_site_domain').get(function () {
  return parseDomain(this.news_site_url).domain;
});

// articleSchema.statics.createNew = function createNew(url, options){
//   var Article = this;
//   return new Promise(function(resolve, reject){
//     if (typeof url !== 'string' && (url instanceof String) === false || validator.isURL(url) === false || parseDomain(url) == null) reject(MESSAGES.INVALID_URL);
//     if (some(SUPPORTED_WEBSITES, ['domain', parseDomain(url).domain]) === false) reject(MESSAGES.UNSUPPORTED_WEBSITE);

//     Article.findByUrl(url, options)
//     .then(function(foundArticle){
//       if (foundArticle) {
//         if (options.ignore_article_min_time_passed || moment.duration(moment().diff(foundArticle.last_checked_for_revision)).asHours() > 1){
//           foundArticle.checkForChanges()
//           .then(function(foundArticle){
//             resolve(foundArticle);
//           }).catch(function(err){
//             reject(err);
//           });
//         } else {
//           resolve(foundArticle);
//         }
//       } else {
//         url = validator.trim(url);
//         var newArticle = new Article();
//         newArticle.news_site_url = url;
//         scraper.scrapeMetadata(url, METADATA_FIELDS)
//         .then(function(metadata){
//           newArticle.metadata = metadata;
//           Article.findByUrlTitle(url, newArticle.metadata.title, options)
//           .then(function(err, savedArticle){
//             if (err) reject (err);
//             if (savedArticle) resolve(savedArticle);
//           }).catch(function(err){
//             reject(err);
//           });
//         })
//         .then(function(){
//           resolve (scraper.scrapeContent(url))
//         })
//         .then(function(content){
//           newArticle.scraped_using = scraper.CURRENT_SCRAPING_METHOD;
//           newArticle.original_headline = content.headline;
//           newArticle.original_story_content = content.story;
//           newArticle.original_authors = content.author; //change to authors
//           newArticle.original_date_posted = content.date; //change to date_posted
//         })
//         .then(function(){
//           newArticle.save(function(err, savedArticle){
//             if (err) reject(err);
//             resolve(savedArticle);
//           }).catch(function(err){
//             reject(err);
//           });
//         }).catch(function(err){
//           reject(err);
//         });
//       }
//     })
//     .catch(function(err){
//       reject(err); return;
//     });
//   });
// };

articleSchema.statics.createNew = function createNew(url, options){
  var Article = this;
  return new Promise(function(resolve, reject){
    if (typeof url !== 'string' && (url instanceof String) === false || validator.isURL(url) === false || parseDomain(url) == null) reject(MESSAGES.INVALID_URL);
    if (some(SUPPORTED_WEBSITES, ['domain', parseDomain(url).domain]) === false) reject(MESSAGES.UNSUPPORTED_WEBSITE);
    var newArticle = new Article();
    url = validator.trim(url);
    newArticle.news_site_url = url;
    
    Article.findByUrl(url, options)
    .then(function(foundArticle){
      return new Promise(function(resolve,reject){
        if (foundArticle) {
          if (options.ignore_article_min_time_passed || moment.duration(moment().diff(foundArticle.last_checked_for_revision)).asHours() > 1){
            foundArticle.checkForChanges()
            .then(function(foundArticle){
              resolve(foundArticle); return;
            }).catch(function(err){
              reject(err); return;
            });
          } else {
            resolve(foundArticle); return;
          }
        }
      });
    })
    .then(scraper.scrapeMetadata(url, METADATA_FIELDS))
    .then(function(metadata){
      return new Promise(function(resolve, reject){
        newArticle.metadata = metadata;
        Article.findByUrlTitle(url, newArticle.metadata.title, options)
      });
    })
    .then(function(foundArticle){
      return new Promise(function(resolve, reject){
        if (savedArticle) resolve(savedArticle); return;
      })
    })
    .then(scraper.scrapeContent(url))
    .then(function(content){
      return new Promise(function(resolve, reject){
        newArticle.scraped_using = scraper.CURRENT_SCRAPING_METHOD;
        newArticle.original_headline = content.headline;
        newArticle.original_story_content = content.story;
        newArticle.original_authors = content.author; //change to authors
        newArticle.original_date_posted = content.date; //change to date_posted
        newArticle.save(function(err, savedArticle){
          if (err) reject(err); return;
          if (savedArticle) resolve(savedArticle); return;
        });
      })
    })
    .catch(function(err){
      reject (err); return;
    })
  });
};



articleSchema.statics.findById = function findById(id, options) {
  return new Promise(function(resolve, reject){
    if (shortid.isValid(id) === false) reject(MESSAGES.INVALID_ID);
    Article.findOne({ _id: id }, function(err, foundArticle){
      if (err) reject(err);
      if (foundArticle == null) {
        resolve(null);
      } else {
        if (options.ignore_article_min_time_passed || moment.duration(moment().diff(foundArticle.last_checked_for_revision)).asHours() > 1){
          foundArticle.checkForChanges()
          .then(function(foundArticle){
            resolve(foundArticle);
          }).catch(function(err){
            reject(err);
          });
        } else {
          resolve(foundArticle);
        }
      }
    });
  });
};

articleSchema.statics.findByUrl = function findByUrl(url, options) {
  var article = this;
  return new Promise(function(resolve, reject){
    article.findOne({ news_site_url: url }, function(err, foundArticle){
      if (err) reject(err);
      if (foundArticle === null) {
        resolve(null);
      } else {
        if (options.ignore_article_min_time_passed || moment.duration(moment().diff(foundArticle.last_checked_for_revision)).asHours() > 1){
          foundArticle.checkForChanges()
          .then(function(foundArticle){
            resolve(foundArticle);
          }).catch(function(err){
            reject(err);
          });
        } else {
          resolve(foundArticle);
        }
      }
    });
  });
};

articleSchema.statics.findByUrlTitle = function findByContent(url, title , options) {
  var article = this;
  return new Promise(function(resolve, reject){
    article.findOne({ news_site_url: url, "metadata.title": title }, function(err, foundArticle){
      if (err) reject(err);
      if (foundArticle === null) {
        resolve(null);
      } else {
        if (options.ignore_article_min_time_passed || moment.duration(moment().diff(foundArticle.last_checked_for_revision)).asHours() > 1){
          foundArticle.checkForChanges()
          .then(function(foundArticle){
            resolve(foundArticle);
          }).catch(function(err){
            reject(err);
          });
        } else {
          resolve(foundArticle);
        }
      }
    });
  });
};

articleSchema.methods.checkForChanges = function checkForChanges() {
  const TIMEOUT_FOR_DIFF_CHECK = 5000;
  var article = this;
  return new Promise(function(resolve, reject){
    scraper.scrapeContent(article.news_site_url)
    .then(function(content){
      var changes = [];
      revision_comparisons.forEach(function(revision_comparison){
        var shouldTimeout = true;
        if (typeof article[revision_comparison.field] === 'string'){
          jsdiff.diffWords(article[revision_comparison.field], content[revision_comparison.comparison], function(err, diff){
            shouldTimeout = false;
            checkChanges(diff)
          });
          setTimeout(function() {
            if (shouldTimeout) return reject("Too long"); 
          }, TIMEOUT_FOR_DIFF_CHECK);
        } else if (typeof article[revision_comparison.field] === 'object'){
          jsdiff.diffArrays(article[revision_comparison.field], content[revision_comparison.comparison], function(err, diff){
            shouldTimeout = false;
            checkChanges(diff)
          });
          setTimeout(function() {
            if (shouldTimeout) return reject("Too long"); 
          }, TIMEOUT_FOR_DIFF_CHECK);
        }
        var checkChanges = function(diff){
          if (some(diff, ['removed', true]) || some(diff, ['added', true])){
            diff.forEach(function(d){
              for (k in d){
                if (d[k] == undefined) d[k] = null;
              }
            });
            var found = false;
            article[revision_comparison.diff_field].forEach(function(revision){
              if (isEqual(revision, diff)){
                found = true;
              }
            });
            if (found == false){
              changes.push({diff:diff, field: revision_comparison.diff_field});
            }
          }
        }
      });
      if (isEmpty(changes)){
        resolve(article);
      } else {
        article.addChanges(changes)
        .then(function(article){
          resolve(article);
        });
      }
    }).catch(function(err){
      console.log(err)
      reject(err);
    });
  });
};

articleSchema.methods.addChanges = function addChanges(changes) {
  var article = this;
  var pushedObject = {};
  changes.forEach(function(change){
    pushedObject[change.field] = {change: change.diff, time_observed: new Date()};
  });
  return new Promise(function(resolve, reject){
    Article.findOneAndUpdate({ _id: article._id }, { $push: pushedObject }, {new: true}, function(err, updatedArticle){
      if (err) reject(err);
      resolve(updatedArticle);
    });
  });
};

var Article = mongoose.model('Article', articleSchema);

module.exports = Article;
