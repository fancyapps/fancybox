'use strict';
var multimatch = require('multimatch');
var findup = require('findup-sync');

function arrayify(el) {
  return Array.isArray(el) ? el : [el];
}

function camelize(str) {
  return str.replace(/-(\w)/g, function(m, p1) {
    return p1.toUpperCase();
  });
}

module.exports = function(options) {
  var finalObject = {};
  options = options || {};

  var pattern = arrayify(options.pattern || ['gulp-*']);
  var config = options.config || findup('package.json');
  var scope = arrayify(options.scope || ['dependencies', 'devDependencies', 'peerDependencies']);
  var replaceString = options.replaceString || 'gulp-';
  var camelizePluginName = options.camelize === false ? false : true;
  var lazy = 'lazy' in options ? !!options.lazy : true;
  var requireFn = options.requireFn || require;

  if (typeof config === 'string') {
    config = require(config);
  }

  if(!config) {
    throw new Error('Could not find dependencies. Do you have a package.json file in your project?');
  }

  var names = scope.reduce(function(result, prop) {
    return result.concat(Object.keys(config[prop] || {}));
  }, []);

  pattern.push('!gulp-load-plugins');

  multimatch(names, pattern).forEach(function(name) {
    var requireName = name.replace(replaceString, '');
    requireName = camelizePluginName ? camelize(requireName) : requireName;

    if(lazy) {
      Object.defineProperty(finalObject, requireName, {
        get: function() {
          return requireFn(name);
        }
      });
    } else {
      finalObject[requireName] = requireFn(name);
    }
  });

  return finalObject;
};
