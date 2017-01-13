# 2.3.1 (12/17/2016)

- merge fix for #24 (https://github.com/scniro/gulp-clean-css/pull/24)
- clean-css release update, 3.4.22 => 3.4.23

# 2.3.0 (12/12/2016)

- bug fix #21 => https://github.com/scniro/gulp-clean-css/issues/21
- adding back vinyl-sourcemaps-apply

# 2.2.2 (12/12/2016)

- clean-css release update, 3.4.21 => 3.4.22

# 2.2.1 (12/09/2016)

- bug fix #18 => https://github.com/scniro/gulp-clean-css/issues/18#issuecomment-266127536

# 2.2.0 (12/08/2016)

- remove vinyl-sourcemaps-apply in favor of clean-css sourcemap engine
- bug fix #1 => https://github.com/scniro/gulp-clean-css/issues/1
- bug fix #7 => https://github.com/scniro/gulp-clean-css/issues/7
- bug fix #9 => https://github.com/scniro/gulp-clean-css/issues/9

# 2.1.3 (12/07/2016)

-bug fix => https://github.com/scniro/gulp-clean-css/issues/19

# 2.1.2 (12/07/2016)

- bug fix => https://github.com/scniro/gulp-clean-css/issues/8
- test gulp-sass friendliness per #18

# 2.1.1 (12/07/2016)

- bug fix => https://github.com/scniro/gulp-clean-css/issues/17

# 2.1.0 (12/06/2016)

- clean-css release update => 3.4.21;
- remove vinyl-bufferstream && readable-stream/transform in favor of through2
- remove broken if(file.path) check
- dev: dep updates
- dev: simple mock server for checking out cleaned css sourcemaps

# 2.0.12 (07/26/2016)

- clean-css release update => 3.4.19; devdeps

# 2.0.11 (07/05/2016)

- clean-css release update => 3.4.18

# 2.0.9 (05/31/2016

- clean-css release update => 3.4.14

# 2.0.8 (05/23/2016

- clean-css release update => 3.4.13

# 2.0.7

- bug fix for node 6 support

# 2.0.6 (04/11/2016

- clean-css release update => 3.4.11
- minor syntax adjustments for testing/code coverage

# 2.0.5 (04/08/2016)

- clean-css release update => 3.4.11

## 2.0.4 (03/23/2016)

- dep and devDep updates
- minor test adjustments

## 2.0.3 (03/01/2016)

- Include `name` and `path` in the clean callback
- Improved testing and README docs

## 2.0.2 (02/23/2016)

- Include optional callback parameter which returns granular details from underlying clean-css process based on supplied options
- Addition of more unit tests
- README doc reflects new changes

## 2.0.1 (02/22/2016)

- Initial release post-fork from [gulp-minify-css](https://github.com/murphydanger/gulp-minify-css)
- README updates, including project badges
- Remove old tests - init new tests - new devdeps
- [npm registration](https://www.npmjs.com/package/gulp-clean-css)
- License update