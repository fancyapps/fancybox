# gulp-load-plugins

[![npm](https://nodei.co/npm/gulp-load-plugins.png?downloads=true)](https://nodei.co/npm/gulp-load-plugins/)

> Loads in any gulp plugins and attaches them to the global scope, or an object of your choice.

[![Build Status](https://travis-ci.org/jackfranklin/gulp-load-plugins.svg)](https://travis-ci.org/jackfranklin/gulp-load-plugins)


## Install

```sh
$ npm install --save-dev gulp-load-plugins
```


## Usage

Given a `package.json` file that has some dependencies within:

```json
{
    "dependencies": {
        "gulp-jshint": "*",
        "gulp-concat": "*"
    }
}
```

Adding this into your `Gulpfile.js`:

```js
var gulp = require('gulp');
var gulpLoadPlugins = require('gulp-load-plugins');
var plugins = gulpLoadPlugins();
```

Or, even shorter:

```js
var plugins = require('gulp-load-plugins')();
```

Will result in the following happening (roughly, plugins are lazy loaded but in practice you won't notice any difference):

```js
plugins.jshint = require('gulp-jshint');
plugins.concat = require('gulp-concat');
```

You can then use the plugins just like you would if you'd manually required them, but referring to them as `plugins.name()`, rather than just `name()`.

This frees you up from having to manually require each gulp plugin.

## Options

You can pass in an argument, an object of options (the shown options are the defaults):

```js
gulpLoadPlugins({
    pattern: 'gulp-*', // the glob to search for
    config: 'package.json', // where to find the plugins
    scope: ['dependencies', 'devDependencies', 'peerDependencies'], // which keys in the config to look within
    replaceString: 'gulp-', // what to remove from the name of the module when adding it to the context
    camelize: true, // if true, transforms hyphenated plugins names to camel case
    lazy: true, // whether the plugins should be lazy loaded on demand
});
```


## Lazy Loading

In 0.4.0 and prior, lazy loading used to only work with plugins that return a function. In newer versions though, lazy loading should work for any plugin. If you have a problem related to this please try disabling lazy loading and see if that fixes it. Feel free to open an issue on this repo too.


## Credit

Credit largely goes to @sindresorhus for his [load-grunt-plugins](https://github.com/sindresorhus/load-grunt-tasks) plugin. This plugin is almost identical, just tweaked slightly to work with Gulp and to expose the required plugins.


## Changelog

##### 0.5.3
- Show a nicer error if the plugin is unable to load any configuration and hence can't find any dependencies to load

##### 0.5.2
- Swap out globule for multimatch, thanks @sindresorhus.

##### 0.5.1
- Updated some internal dependencies which should see some small improvements - thanks @shinnn for this contribution.

##### 0.5.0
- improved lazy loading so it should work with plugins that don't just return a function. Thanks to @nfroidure for help with this.

##### 0.4.0
- plugins are lazy loaded for performance benefit. Thanks @julien-f for this.

##### 0.3.0
- turn the `camelize` option on by default

##### 0.2.0
- added `camelize` option, thanks @kombucha.
- renamed to `gulp-load-plugins`.

##### 0.1.1
- add link to this repository into `package.json` (thanks @ben-eb).

##### 0.1.0
- move to `gulpLoadplugins` returning an object with the tasks define.

##### 0.0.5
- added `replaceString` option to configure exactly what gets replace when the plugin adds the module to the context

##### 0.0.4
- fixed keyword typo so plugin appears in search for gulp plugins

##### 0.0.3
- removed accidental console.log I'd left in

##### 0.0.2
- fixed accidentally missing a dependency out of package.json

##### 0.0.1
- initial release
