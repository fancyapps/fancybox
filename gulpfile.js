/* jshint node: true */
/* global $: true */
"use strict";

var gulp = require("gulp"),
    $ = require("gulp-load-plugins")();
var config = {
        js: [
            "lib/jquery.mousewheel.pack.js",
            "source/jquery.fancybox.pack.js",
            "source/helpers/jquery.fancybox-buttons.js",
            "source/helpers/jquery.fancybox-thumbs.js",
            "source/helpers/jquery.fancybox-media.js"
        ],
        css: [
            "source/jquery.fancybox.css",
            "source/helpers/jquery.fancybox-buttons.css",
            "source/helpers/jquery.fancybox-thumbs.css"
        ],
        images: [
            "source/helpers/**/*.{jpg,png,svg,gif,webp,ico}",
            "source/*.{jpg,png,svg,gif,webp,ico}"
        ]
    },
    dist = {
        images: "dist/images/fancybox",
        css: "dist/css",
        js: "dist/js"
    };


/*
 - |--------------------------------------------------------------------------
 - | Gulp Front Tasks
 - |--------------------------------------------------------------------------
 - |
 + *
 + *
 */

gulp.task("clean", function () {
    return gulp.src("dist", {read: false})
        .pipe($.clean());
});

gulp.task("scripts", function () {
    return gulp.src(config.js)
        .pipe($.plumberNotifier())
        .pipe($.concat("jquery.fancybox.min.js"))
        .pipe($.uglify())
        .pipe(gulp.dest(dist.js));
});

gulp.task("styles", function () {
    return gulp.src(config.css)
        .pipe($.plumberNotifier())
        .pipe($.concat("jquery.fancybox.min.css"))
        .pipe($.autoprefixer("last 5 version"))
        .pipe($.replace(/url\('?(.*)'?\)/g, "url('../images/fancybox/$1')"))
        .pipe($.replace("''", "'"))
        .pipe($.cleanCss({compatibility: 'ie8'}))
        .pipe(gulp.dest(dist.css))
});

gulp.task("images", function () {
    return gulp.src(config.images)
        .pipe($.newer(dist.images))
        .pipe(gulp.dest(dist.images));
});


gulp.task('default', ["images", "styles", "scripts"]);



 