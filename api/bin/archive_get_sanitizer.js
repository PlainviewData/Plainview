const DEFAULT_OPTIONS = {
  'ignore_article_min_time_passed': function(b){ //ignores minimum time to check for article revision
    const DEFAULT = true;
    if (typeof b !== 'boolean') return DEFAULT;
    return b || DEFAULT;
  }
}

var sanitizeOptions = function(options){
  options = options || {};
  for (key in DEFAULT_OPTIONS) options[key] = DEFAULT_OPTIONS[key](options[key]);
  return options;
};

module.exports = {
  sanitizeGetRequestQuery : function(query){
    query = query || {};
    query.options = sanitizeOptions(query.options);
    return query;
  }
};
