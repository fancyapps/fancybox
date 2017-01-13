'use strict';

var colors = require('colors');
var plumber = require('gulp-plumber');
var notifier = require('node-notifier');
var dateformat = require('dateformat');

module.exports = index['default'] = index.index = index; // eslint-disable-line dot-notation

/////
function index() {
  return plumber({
    errorHandler: errorHandler
  });
}

function errorHandler(error) {

  var lineNumber = (error.lineNumber) ? 'LINE ' + error.lineNumber + ' -- ' : '';

  var time = '[' + colors.grey(dateformat(new Date(), 'HH:MM:ss')) + ']';
  process.stdout.write(time + ' ');

  var fullMessage =
    'Error in plugins **' + error.plugin + '**:' + error.message;

  notifier.notify({
    title: 'Task Failed [' + error.plugin + ']',
    line: lineNumber + 'See console.',
    message: error.message,
  });

  fullMessage = colors.bgRed.white(fullMessage);

  console.log(fullMessage);
  // Prevent the 'watch' task from stopping
  this.emit('end');
}
