# gulp-plumber-notifier

> Prevent pipe breaking, log and notify using [gulp-plumber] and [node-notifier]

[gulp-plumber]: https://github.com/floatdrop/gulp-plumber

[node-notifier]: https://github.com/mikaelbr/node-notifier

![](https://raw.githubusercontent.com/Pleasurazy/gulp-plumber-notifier/master/img2.jpg)

![](https://raw.githubusercontent.com/Pleasurazy/gulp-plumber-notifier/master/img1.jpg)

# Usage

```js
var plumberNotifier = require('gulp-plumber-notifier');

gulp.src('./src/**/*.js')
  .pipe(plumberNotifier())
  .pipe(sourcemaps.init())
  .pipe(babel({ modules: 'umd' }))
  .pipe(sourcemaps.write())
  .pipe(gulp.dest('./dist'))
  .pipe(connect.reload());
```
