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
    // exit early if already wrapped, even if wrapped by a different `mdexam` constructor
    if (value && typeof value == 'object' && value.__wrapped__) {
      return value;
    }
    // allow invoking `mdexam` without the `new` operator
    if (!(this instanceof mdexam)) {
      return new mdexam(value);
    }
    this.__wrapped__ = value;
  }

  var _ = require('lodash');

  // Define regular expressions to parse markdown
  var regexQ = /##\s?\[(.*题)\]\s?(\S+)/;
  var regexQSection = /####/g;
  var regexTag = /\[标签\]/;
  var regexChoice = /\[选项\]/;
  var regexAnswer = /\[答案\]/;
  var regexOptions = /\*\s{0,}(\S+)/g;
  var regexChecker = /\[验证\]/;
  var regexAnswerRegex = /\*\s\[answer-regex\]\s{0,}(\S+)/g;
  var regexOutputRegex = /\*\s\[output-regex\]\s{0,}(\S+)/g;

  // md存储markdown的文本内容
  mdexam.md = null;
  // json存储json的内容
  mdexam.json = null;

  /**
   * 将markdown格式的选择题转为JSON
   * @param mdQ
   */
  mdexam.prototype.convertMultiplChoice2J = function(mdQ){
    var qj = {
      type: 'multiple-choice',
      question: mdQ.match(regexQ)[2],
      tags: [],
      options: [],
      answers: []
    };

    var sections = mdQ.split(regexQSection);

    _.each(sections, function(section, index){
      if(index === 0){
        return 0;
      }

      if(regexTag.test(section)){
        qj.tags = _.map(section.match(regexOptions), function(tag){
          return tag.replace(/^\*\s{0,}/, '');
        });
      }

      if(regexChoice.test(section)){
        qj.options = _.map(section.match(regexOptions), function(option){
          return option.replace(/^\*\s{0,}/, '');
        });
      }

      if(regexAnswer.test(section)){
        qj.answers = _.map(section.match(regexOptions), function(answer){
          return answer.replace(/^\*\s{0,}/, '');
        });
      }
    });

    return qj;
  };

  /**
   * 将markdown格式的填空题转为JSON
   * @param mdQ
   */
  mdexam.prototype.convertFillIn2J = function(mdQ){
    var qj = {
      type: 'fill-in',
      question: mdQ.match(regexQ)[2],
      tags: [],
      checker: []
    };

    var sections = mdQ.split(regexQSection);

    _.each(sections, function(section, index){
      if(index === 0){
        return 0;
      }

      if(regexTag.test(section)){
        qj.tags = _.map(section.match(regexOptions), function(tag){
          return tag.replace(/^\*\s{0,}/, '');
        });
      }

      if(regexChecker.test(section)){
        qj.checker = _.map(section.match(regexAnswerRegex), function(regex){
          return {
            'answer-regex': regex.replace(/\*\s{0,}\[answer-regex\]\s{0,}/, '')
          }
        });
      }
    });

    return qj;
  };

  /**
   * @TODO Convert command markdown question to JSON
   * @param mdQ
   */
  mdexam.prototype.convertCmd2J = function(mdQ){

  };

  /**
   * @TODO Convert code fragment markdown question to JSON
   * @param mdQ
   */
  mdexam.prototype.convertCodeFragment2J = function(mdQ){

  };

  /**
   * @TODO Convert on-line IDE fragment markdown question to JSON
   * @param mdQ
   */
  mdexam.prototype.convertProject2J = function(mdQ){

  };

  /**
   * 根据markdown的内容，判断用什么转换函数转换为题目的json格式。
   * @param mdQ
   * @returns {*}
   */
  mdexam.prototype.getConvertFunc = function(mdQ){
    var self = this;

    if(!regexQ.test(mdQ)){
      console.warn("Malformed markdown question: ", mdQ);
      return null;
    }

    switch(mdQ.match(regexQ)[1]){
      case '选择题':
        return self.convertMultiplChoice2J;
      case '填空题':
        return self.convertFillIn2J;
      case '命令题':
        return self.convertCmd2J;
      default:
        console.warn('Unknown question type: ', mdQ);
        return null;
    }
  };

  /**
   * Convert a single markdown question to json
   * @param mdQ - Single question markdown
   */
  mdexam.prototype.convertMdQ2J = function(mdQ){
    return this.getConvertFunc(mdQ)(mdQ);
  };

  /**
   * Distill a list of questions(in markdown) from origin markdown
   * @param mdString -
   * @return Array - a list of markdown which is a single question.
   */
  mdexam.prototype.distillQs = function(mdString){
    var regexQ = /##\s?\[(.*题)\]\s?(\S+)/g;
    var qs = mdString.match(regexQ);
    var contents = mdString.split(regexQ);
    return _.map(qs, function(q, index){
      return q + '\n' + contents[index + 1];
    });
  };

  /**
   * @TODO 将markdown转为json
   * @param mdString - markdown文档
   * @return json expression of
   */
  mdexam.prototype.m2j = function(mdString){
    var self = this;

    // 挨个题目提取json
    mdexam.json.questions = _.map(self.distillQs(mdString), function(mdq){
      return self.convertMdQ2J(mdq);
    });

    // 提取外围信息
    var extraRegexes = {
      title: /^#\s{0,}(\S+)/g,
      author: /####\s{0,}\[作者\]\s{0,}(\S+)/g,
      email: /####\s{0,}\[邮箱\]\s{0,}(\S+)/g,
      version: /####\s{0,}\[版本\]\s{0,}(\S+)/g,
      tags: /####\s{0,}\[标签\]\s{0,}([^#]+)/gm
    };
    _.each(extraRegexes, function(k, reg){
      if(k === 'tags'){
        var tagsSection = reg.test(mdString) ? mdString.match(reg)[0] : "";
        mdexam.json[k] = _.map(tagsSection.match(regexOptions), function(tag){
          return tag.replace(/^\*\s{0,}/, '');
        });
        return 0;
      }

      mdexam.json[k] = reg.test(mdString) ? mdString.match(reg)[0] : null;
    });

    return mdexam.json;
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