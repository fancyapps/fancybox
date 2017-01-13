'use strict';
var assert = require('assert');
var sinon = require('sinon');

//====================================================================

var gulpLoadPlugins = (function() {
  var wrapInFunc = function(value) {
    return function() {
      return value;
    };
  };

  var proxyquire = require('proxyquire').noCallThru();

  return proxyquire('./', {
    'gulp-foo': wrapInFunc({ name: 'foo' }),
    'gulp-bar': wrapInFunc({ name: 'bar' }),
    'gulp-foo-bar': wrapInFunc({ name: 'foo-bar' }),
    'jack-foo': wrapInFunc({ name: 'jack-foo' }),
    'gulp-insert': {
      'append':  wrapInFunc({ name: 'insert.append' }),
      'wrap':   wrapInFunc({ name: 'insert.wrap' })
    },
    'findup-sync': function() { return null; }
  });
})();

//====================================================================

describe('configuration', function() {
  it('throws a nice error if no configuration is found', function() {
    assert.throws(function() {
      gulpLoadPlugins({
        config: null
      });
    }, /Could not find dependencies. Do you have a package.json file in your project?/);
  });
});


// Contains common tests with and without lazy mode.
var commonTests = function(lazy) {
  it('loads things in', function() {
    var x = gulpLoadPlugins({
      lazy: lazy,
      config: {
        dependencies: {
          'gulp-foo': '1.0.0',
          'gulp-bar': '*',
          'gulp-insert': '*'
        }
      }
    });

    assert.deepEqual(x.foo(), {
      name: 'foo'
    });
    assert.deepEqual(x.bar(), {
      name: 'bar'
    });
    assert.deepEqual(x.insert.wrap(), {
      name: 'insert.wrap'
    });
    assert.deepEqual(x.insert.append(), {
      name: 'insert.append'
    });
  });

  it('can take a pattern override', function() {
    var x = gulpLoadPlugins({
      lazy: lazy,
      pattern: 'jack-*',
      replaceString: 'jack-',
      config: {
        dependencies: {
          'jack-foo': '1.0.0',
          'gulp-bar': '*'
        }
      }
    });

    assert.deepEqual(x.foo(), {
      name: 'jack-foo'
    });
    assert(!x.bar);
  });

  it('allows camelizing to be turned off', function() {
    var x = gulpLoadPlugins({
      lazy: lazy,
      camelize: false,
      config: {
        dependencies: {
          'gulp-foo-bar': '*'
        }
      }
    });

    assert.deepEqual(x['foo-bar'](), {
      name: 'foo-bar'
    });
  });

  it('camelizes plugins name by default', function() {
    var x = gulpLoadPlugins({
      lazy: lazy,
      config: {
        dependencies: {
          'gulp-foo-bar': '*'
        }
      }
    });

    assert.deepEqual(x.fooBar(), {
      name: 'foo-bar'
    });
  });
};

describe('no lazy loading', function() {
  commonTests(false);

  var x, spy;
  before(function() {
    spy = sinon.spy();
    x = gulpLoadPlugins({
      lazy: false,
      config: {
        dependencies: {
          'gulp-insert': '*'
        }
      },
      requireFn: function() {
        spy();
        return function() {};
      }
    });
  });

  it('does require at first', function() {
    assert(spy.called);
  });
});

describe('with lazy loading', function() {
  commonTests(true);

  var x, spy;
  before(function() {
    spy = sinon.spy();
    x = gulpLoadPlugins({
      lazy: true,
      config: {
        dependencies: {
          'gulp-insert': '*'
        }
      },
      requireFn: function() {
        spy();
        return function() {};
      }
    });
  });

  it('does not require at first', function() {
    assert(!spy.called);
  });

  it('does when the property is accessed', function() {
    x.insert();
    assert(spy.called);
  });
});
