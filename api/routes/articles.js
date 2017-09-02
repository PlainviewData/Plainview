const express = require('express');
const includes = require('lodash.includes');
const urlencode = require('urlencode');
const router = express.Router();
const Article = require('../models/Article');
const scraper = require('../bin/scraper');
const MESSAGES = require('../bin/messages');
const sanitizeGetRequestQuery = require('../bin/article_get_sanitizer').sanitizeGetRequestQuery;
const sanitizePostRequestBody = require('../bin/article_post_sanitizer').sanitizePostRequestBody;

router.get('/:id', function(req, res, next){
  req.query.options = sanitizeGetRequestQuery(req.query.options);
  next();
});

router.post('/', function(req, res, next){
  req.body = sanitizePostRequestBody(req.body);
  next();
});

router.get('/:id', function(req, res, next) {
  var getArticle;
  if (req.params.id.substring(0,4) !== "http"){
    getArticle = Article.findById(req.params.id, req.query.options);
  } else {
    getArticle = Article.findByUrl(urlencode.decode(req.params.id), req.query.options);
  }
  getArticle
  .then(function(article){
    if (article !== null) {
      res.status(200).json(article);
    } else {
      res.status(404).send(MESSAGES.COULD_NOT_FIND_ARTICLE.description);
    }
  }).catch(function(err){
    console.log(err)
    if (includes(MESSAGES, err)){
      res.status(err.status).send(err.description);
    } else {
      res.status(500).send(MESSAGES.GENERIC_SERVER_ERROR.description);
    }
  });
});

router.post('/', function(req, res, next){
  Article.createNew(req.body.url, req.body.options)
  .then(function(article){
    res.status(201).json(article);
  }).catch(function(err){
    console.log(err)
    if (includes(MESSAGES, err)){
      res.status(err.status).send(err.description);
    } else {
      res.status(500).send(MESSAGES.GENERIC_SERVER_ERROR.description);
    }
  });
  // var newArticle = new Article();
  // var options = req.body.options;
  // var url = req.body.url;
  // Article.findByUrl(url)
  // .then(function(article){
  //   console.log('1')
  //   if (article) { res.status(200).json(article);  } else resolve();
  // })
  // .then(scraper.scrapeMetadata(url, METADATA_FIELDS))
  // .then(function(metadata){
  //   console.log('2')
  //   newArticle.metadata = metadata;
  // })
  // .then(Article.findByUrlTitle(url, newArticle.metadata.title, options))
  // .then(function(savedArticle){
  //   if (savedArticle) { res.status(200).json(article); }
  // })
  // .then(scraper.scrapeContent(url))
  // .then(function(content){
  //   newArticle.scraped_using = scraper.CURRENT_SCRAPING_METHOD;
  //   newArticle.original_headline = content.headline;
  //   newArticle.original_story_content = content.story;
  //   newArticle.original_authors = content.author; //change to authors
  //   newArticle.original_date_posted = content.date; //change to date_posted
  // })
  // .then(newArticle.save)
  // .then(function(savedArticle){
  //   if (savedArticle) { res.status(201).json(article); }
  // })
  // .catch(function(err){
  //   if (includes(MESSAGES, err)){
  //    res.status(err.status).send(err.description);
  // } else {
  //    res.status(500).send(MESSAGES.GENERIC_SERVER_ERROR.description);
  //  }
  // });
});

module.exports = router;
