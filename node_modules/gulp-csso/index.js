/* jshint node:true */

'use strict';

var csso            = require('csso'),
    gutil           = require('gulp-util'),
    transform       = require('stream').Transform,
    bufferstreams   = require('bufferstreams'),

    PLUGIN_NAME     = 'gulp-csso';

function cssoTransform(optimise) {
    // Returns a callback that handles the buffered content
    return function(err, buffer, cb) {
        if (err) {
            cb(new gutil.PluginError(PLUGIN_NAME, err));
        }
        var optimised = csso.justDoIt(String(buffer), optimise);
        cb(null, new Buffer(optimised));
    };
}

function gulpcsso(optimise) {
    var stream = new transform({ objectMode: true });

    stream._transform = function(file, unused, done) {
        // Pass through if null
        if (file.isNull()) {
            stream.push(file);
            done();
            return;
        }

        if (file.isStream()) {
            file.contents = file.contents.pipe(new bufferstreams(cssoTransform(optimise)));
            stream.push(file);
            done();
        } else {
            var optimised = csso.justDoIt(String(file.contents), optimise);
            file.contents = new Buffer(optimised);
            stream.push(file);
            done();
        }
    };

    return stream;
}

gulpcsso.cssoTransform = cssoTransform;
module.exports = gulpcsso;
