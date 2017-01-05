(function() {
  var Result;

  Result = (function() {
    function Result(root, css, map) {
      this.root = root;
      this.css = css;
      if (this.css == null) {
        this.css = this.root.toString();
      }
      if (map) {
        this.map = map;
      }
    }

    Result.prototype.toString = function() {
      return this.css;
    };

    return Result;

  })();

  module.exports = Result;

}).call(this);
