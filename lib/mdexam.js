;(function(window, undefined) {

  /** Detect free variable `exports` */
  var freeExports = typeof exports == 'object' && exports;

  /** Detect free variable `module` */
  var freeModule = typeof module == 'object' && module && module.exports == freeExports && module;

  /** Detect free variable `global` and use it as `window` */
  var freeGlobal = typeof global == 'object' && global;
  if (freeGlobal.global === freeGlobal) {
    window = freeGlobal;
  }

  function mdexam(value) {
    // allow invoking `mdexam` without the `new` operator
    if (!(this instanceof mdexam)) {
      return new mdexam(value);
    }

    // md存储markdown的文本内容
    this.md = value;

    // json存储json的内容
    this.json = null;
  }

  /**
   * @TODO 将markdown转为json
   */
  mdexam.prototype.m2j = function(mdString){
    console.log("m2j");
  };

  /**
   * @TODO 将json转为markdown
   */
  mdexam.prototype.j2m = function (jsonObj) {

  };

  /**
   * @TODO 渲染JSON到模板
   */
  mdexam.prototype.render = function(){

  };

  // expose MdExam
  // some AMD build optimizers, like r.js, check for specific condition patterns like the following:
  if (typeof define == 'function' && typeof define.amd == 'object' && define.amd) {
    // Expose MdExam to the global object even when an AMD loader is present in
    // case MdExam was injected by a third-party script and not intended to be
    // loaded as a module. The global assignment can be reverted in the MdExam
    // module via its `noConflict()` method.
    window._ = mdexam;

    // define as an anonymous module so, through path mapping, it can be
    // referenced as the "underscore" module
    define(function() {
      return mdexam;
    });
  }
  // check for `exports` after `define` in case a build optimizer adds an `exports` object
  else if (freeExports) {
    // in Node.js or RingoJS v0.8.0+
    if (freeModule) {
      (freeModule.exports = mdexam)._ = mdexam;
    }
    // in Narwhal or RingoJS v0.7.0-
    else {
      freeExports._ = mdexam;
    }
  }
  else {
    // in a browser or Rhino
    window._ = mdexam;
  }
}(this));