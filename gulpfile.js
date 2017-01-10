var gulp = require('gulp'),
    livereload = require('gulp-livereload'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    cssnano = require('gulp-cssnano'),
    sass = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    header = require('gulp-header');

var banner = [
    '// ==================================================',
    '// fancyBox v3.0.0',
    '//',
    '// Licensed GPLv3 for open source use',
    '// or fancyBox Commercial License for commercial use',
    '//',
    '// http://fancyapps.com/fancybox/',
    '// Copyright 2017 fancyApps',
    '//',
    '// ==================================================',
  ''].join('\n');


// Concatenate & Minify JS

gulp.task('scripts', function() {
    return gulp.src(['src/js/core.js', 'src/js/media.js', 'src/js/guestures.js', 'src/js/slideshow.js', 'src/js/fullscreen.js', 'src/js/thumbs.js'])
        .pipe(concat('jquery.fancybox.js'))
        .pipe(header(banner))
        .pipe(gulp.dest('dist'))
        .pipe(rename({suffix: '.min'}))
        .pipe(uglify())
        .pipe(header(banner))
        .pipe(gulp.dest('dist'));
});

// Compile CSS

gulp.task('css', function() {
    return gulp.src('src/css/*.css') // Gets all files src/css
        .pipe(sass())
        .pipe(autoprefixer({
            browsers: ['last 5 versions'],
            cascade: false
        }))
        .pipe(concat('jquery.fancybox.css'))
        .pipe(gulp.dest('dist'))
        .pipe(rename({suffix: '.min'}))
        .pipe(cssnano({zindex: false}))
        .pipe(gulp.dest('dist'));
});

// Default Task
gulp.task('default', ['scripts', 'css']);
