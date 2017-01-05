var fs = require('fs');
var _ = require('lodash');
var Minimatch = require('minimatch').Minimatch;
var resolve = require('path').resolve;
var dirname = require('path').dirname;
var join = require('path').join;
var sep = require('path').sep;
var RcLoader = require('rcloader');
var PluginError = require('gulp-util').PluginError;

var ignoreLoader = new RcLoader('.jshintignore', {}, {
  loader: function (path) {
    // .jshintignore is a line-delimited list of patterns
    // convert to an array and filter empty lines
    var contents = fs.readFileSync(path, 'utf8');
    var dir = dirname(path);
    return {
      file: path,
      patterns:
        contents.toString('utf8')
        .split(/\r?\n/)
        .filter(function (line) { return !!line.trim(); })
        .map(function (line) {
          return resolve(dir, line.trim());
        })
    };
  }
});

// get the .jshintignore closest to the current working directory,
// but since RcLoader expect to start searching at a file we need to
// fake a file name
var ignore = ignoreLoader.for(join(process.cwd(), 'index.js'));

module.exports = (function () {
  if (!ignore.file || !ignore.patterns.length) {
    return function (file, cb) {
      cb(null, false);
    };
  }

  var minimatch = _.memoize(function (pattern) {
    return new Minimatch(pattern, { nocase: true });
  });

  return function check(file, cb) {
    if (file.isNull()) return cb(null, true);
    if (file.isStream()) return cb(new PluginError('gulp-jshint', 'Streaming not supported'));

    var path = file.path;
    cb(null, ignore.patterns.some(function (pattern) {
      if (minimatch(pattern).match(path)) {
        return true;
      }

      if (pattern === path) {
        return true;
      }

      var prefix = pattern;
      if (prefix.substr(-1) !== sep) {
        pattern += sep;
      }

      if (path.indexOf(prefix) === 0) {
        return true;
      }
    }));
  };
}());
