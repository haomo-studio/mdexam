(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['lodash'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports,
    // like Node.
    module.exports = factory(require('lodash'));

  } else {
    // Browser globals (root is window)
    root.mdexam = factory(root.lodash);
  }
}(this, function (lodash) {

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

  var _ = lodash;

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

  //我的正则
  var oRegexQ1 = /\n####/;
  var oRegexQ2 = /##\s?\[(.*题)\]\s/;
  var oRegexOptions = /\n\*\s/;
  var arr = [];

  // md存储markdown的文本内容
  mdexam.md = {};
  // json存储json的内容
  mdexam.json = {};

  /**
   * 将markdown格式的选择题转为JSON
   * @param mdQ
   */
  mdexam.prototype.convertMultiplChoice2J = function (mdQ) {
    var qj = {
      type: 'multiple-choice',
      question: (mdQ.split(oRegexQ1)[0]).split(oRegexQ2)[2],
      tags: [],
      options: [],
      answer: []
    };

    var sections = mdQ.split(regexQSection);

    _.each(sections, function (section, index) {
      if (index === 0) {
        return 0;
      }

      if (regexTag.test(section)) {
        arr = section.split(oRegexOptions);
        arr.splice(0, 1)
        qj.tags = _.map(arr, function (tag) {
          return tag.replace(/\n/g, '');
        });
      }

      if (regexChoice.test(section)) {
        arr = section.split(oRegexOptions);
        arr.splice(0, 1)
        qj.options = _.map(arr, function (option) {
          return option.replace(/\n/g, '');
        });
      }

      if (regexAnswer.test(section)) {
        arr = section.split(oRegexOptions);
        arr.splice(0, 1)
        qj.answer = _.map(arr, function (answer) {
          return answer.replace(/\n/g, '');
        });
      }
    });

    return qj;
  };

  /**
   * 将markdown格式的填空题转为JSON
   * @param mdQ
   */
  mdexam.prototype.convertFillIn2J = function (mdQ) {
    var qj = {
      type: 'fill-in',
      question: (mdQ.split(oRegexQ1)[0]).split(oRegexQ2)[2],
      answer: null,
      tags: [],
      checker: []
    };

    var sections = mdQ.split(regexQSection);

    _.each(sections, function (section, index) {
      if (index === 0) {
        return 0;
      }

      if (regexAnswer.test(section)) {
        arr = section.split(oRegexOptions);
        arr.splice(0, 1)
        qj.answer = _.map(arr, function (tag) {
          return tag.replace(/\n/g, '');
        })[0];
      }

      if (regexTag.test(section)) {
        arr = section.split(oRegexOptions);
        arr.splice(0, 1)
        qj.tags = _.map(arr, function (tag) {
          return tag.replace(/\n/g, '');
        });
      }

      if (regexChecker.test(section)) {
        arr = section.split(oRegexOptions);
        arr.splice(0, 1)
        qj.checker = _.map(arr, function (regex) {
          return {
            'answer-regex': regex.replace(/\[answer-regex\]\s{0,}/g, '').replace(/\n/g, '')
          }
        });
      }
    });

    return qj;
  };

  /**
   * Convert command markdown question to JSON
   * @param mdQ
   */
  mdexam.prototype.convertCmd2J = function (mdQ) {
    var qj = {
      type: 'cmd-fill-in',
      question: (mdQ.split(oRegexQ1)[0]).split(oRegexQ2)[2],
      answer: null,
      tags: [],
      checker: []
    };

    var sections = mdQ.split(regexQSection);

    _.each(sections, function (section, index) {
      if (index === 0) {
        return 0;
      }

      if (regexAnswer.test(section)) {
        arr = section.split(oRegexOptions);
        arr.splice(0, 1)
        qj.answer = _.map(arr, function (option) {
          return option.replace(/\n/g, '');
        })[0];
      }

      if (regexTag.test(section)) {
        arr = section.split(oRegexOptions);
        arr.splice(0, 1)
        qj.tags = _.map(arr, function (tag) {
          return tag.replace(/\n/g, '');
        });
      }

      if (regexChecker.test(section)) {
        arr = section.split(oRegexOptions);
        arr.splice(0, 1);
        qj.checker = _.map(arr, function (regex) {
          if(regex.indexOf('answer-regex') == -1){
            return {
              'output-regex': regex.replace(/\[output-regex\]\s{0,}/g, '').replace(/\n/g, '')
            }
          }else{
            return {
              'answer-regex': regex.replace(/\[answer-regex\]\s{0,}/g, '').replace(/\n/g, '')
            }
          }
        });
        // qj.checker = qj.checker.concat(_.map(arr, function (regex) {
        //   return {
        //     'answer-regex': regex.replace(/\[answer-regex\]\s{0,}/g, '').replace(/\n/g, '')
        //   }
        // }), _.map(arr, function (regex) {
        //   return {
        //     'output-regex': regex.replace(/\[output-regex\]\s{0,}/g, '').replace(/\n/g, '')
        //   }
        // }));
      }
    });

    return qj;
  };

  /**
   * @TODO Convert code fragment markdown question to JSON
   * @param mdQ
   */
  mdexam.prototype.convertCodeFragment2J = function (mdQ) {
    return null;
  };

  /**
   * @TODO Convert on-line IDE fragment markdown question to JSON
   * @param mdQ
   */
  mdexam.prototype.convertProject2J = function (mdQ) {
    return null;
  };

  mdexam.prototype._convert = function (mdQ) {
    return null;
  };

  /**
   * 根据markdown的内容，判断用什么转换函数转换为题目的json格式。
   * @param mdQ
   * @returns {*}
   */
  mdexam.prototype.getConvertFunc = function (mdQ) {
    var self = this;

    if (!regexQ.test(mdQ)) {
      console.warn("Malformed markdown question: ", mdQ);
      return self._convert;
    }

    switch (mdQ.match(regexQ)[1]) {
      case '选择题':
        return self.convertMultiplChoice2J;
      case '填空题':
        return self.convertFillIn2J;
      case '命令题':
        return self.convertCmd2J;
      case '代码片段题':
        return self.convertCodeFragment2J;
      case '项目工程题':
        return self.convertProject2J;
      default:
        console.warn('Unknown question type: ', mdQ);
        return self._convert;
    }
  };

  /**
   * Convert a single markdown question to json
   * @param mdQ - Single question markdown
   */
  mdexam.prototype.convertMdQ2J = function (mdQ) {
    return this.getConvertFunc(mdQ)(mdQ);
  };

  /**
   * Distill a list of questions(in markdown) from origin markdown
   * @param mdString -
   * @return Array - a list of markdown which is a single question.
   */
  mdexam.prototype.distillQs = function (mdString) {
    var regexQ = /##\s?\[(.*题)\](.*)/g;
    var qs = mdString.match(regexQ);
    return _.map(qs, function (q, index) {
      var start = mdString.indexOf(qs[index]);
      var end = (index + 1) === qs.length ? (mdString.length - 1) : mdString.indexOf(qs[index + 1]);
      return mdString.slice(start, end);
    });
  };

  /**
   * 将markdown转为json
   * @param mdString - markdown文档
   * @return json expression of
   */
  mdexam.prototype.m2j = function (mdString) {
    var self = this;
    // 挨个题目提取json
    mdexam.json.questions = _.chain(self.distillQs(mdString))
      .filter(function (mdq) {
        return self.convertMdQ2J(mdq) !== null;
      })
      .map(function (mdq) {
        console.log('李静=========',mdq)
        return self.convertMdQ2J(mdq);
      }).value();

    // 提取外围信息

    var extraRegexes = {
      title: /^#\s{0,}(\S+)/g,
      author: /####\s{0,}\[作者\]\s{0,}(\S+)/g,
      email: /####\s{0,}\[邮箱\]\s{0,}(\S+)/g,
      version: /####\s{0,}\[版本\]\s{0,}(\S+)/g,
      tags: /####\s{0,}\[标签\]\s{0,}([^#]+)/gm
    };


    _.each(extraRegexes, function (reg, k) {
      if (k === 'tags') {
        var tagsSection = reg.test(mdString) ? mdString.match(reg)[0] : "";
        mdexam.json[k] = _.map(tagsSection.match(regexOptions), function (tag) {
          return tag.replace(/^\*\s{0,}/, '');
        });
        return 0;
      }

      mdexam.json[k] = reg.test(mdString) ?
        mdString.match(reg)[0].replace(/^####\s{0,}\[[^\]]+\]\s{0,}/g, '').replace(/^#\s{0,}/g, '') : null;
    });

    var mdJsonStr = JSON.stringify(mdexam.json);
    mdJsonStr = mdJsonStr.replace(/\\n/g, "")
    mdJsonStr = mdJsonStr.replace(/\\r/g, "")


    return JSON;
  };


  /**
   * @TODO 将json转为markdown
   */
  mdexam.prototype.j2m = function (jsonObj, markDownTpl) {
    var self = this;
    //挨个题目转换为md
    var paper = JSON.parse(jsonObj);

    mdexam.md.questions = _.template(markDownTpl)({
      paper: paper
    })

    return mdexam.md.questions
  };

  /**
   * @TODO 渲染JSON到模板
   */
  mdexam.prototype.render = function () {

  };

  /**
   * @TODO 自动评价选择题
   * @param originQj
   * @param testQj
   * @return boolean true/false
   */
  mdexam.prototype.checkChoice = function (originQj, testQj) {
    if (!testQj || !testQj.answer) {
      return false;
    }
    var flag = true,num = 0;

    if(testQj.answer.length !== originQj.answer.length){
      flag = false;
    }else{
      _.each(testQj.answer,function (tAnswer) {
        _.each(originQj.answer,function (oAnswer) {
          if(tAnswer == oAnswer){
            num++
          }
        })
      })
    }
    if(num != originQj.answer.length){
      flag = false;
    }

    return flag;
    // return _.isEqual(testQj.answer, originQj.answer);
  };

  /**
   * @TODO 自动评价填空题
   * @param originQj
   * @param testQj
   */
  mdexam.prototype.checkFillIn = function (originQj, testQj) {
    if (!testQj || !testQj.answer) {
      return false;
    }
    var result = false;
    _.each(originQj.checker, function (checker) {
      if (checker['answer-regex'] && eval(checker['answer-regex']).test(testQj.answer)) {
        result = true;
        return 0;
      }
    });
    return result;
  };

  /**
   * @TODO 自动评价命令题
   * @param originQj
   * @param testQj
   */
  mdexam.prototype.checkCmdFillIn = function (originQj, testQj) {
    if (!testQj || !testQj.answer) {
      return false;
    }

    var result = false;
    _.each(originQj.checker, function (checker) {
      if (checker['answer-regex'] && eval(checker['answer-regex']).test(testQj.answer)) {
        result = true;
        return 0;
      }
    });

    return result;
  };

  /**
   * 根据json判断用什么打分函数对题目进行打分
   * @param mdQ
   * @returns {*}
   */
  mdexam.prototype.judgeCheckFun = function (originQj, testQj) {
    var self = this;
    switch (originQj.type) {
      case 'multiple-choice':
        return self.checkChoice(originQj, testQj);
      case 'fill-in':
        return self.checkFillIn(originQj, testQj);
      case 'cmd-fill-in':
        return self.checkCmdFillIn(originQj, testQj);
      default:
        console.warn('Unknown question type: ', originQj);
        return false;
    }
  };

  /**
   * 自动评分
   * @param originMd 出题试卷
   * @param testMd 考生试卷
   */
  mdexam.prototype.mdCheck = function (originMd, testMd) {
    return this.jsonCheck(this.m2j(originMd), this.m2j(testMd));
  };

  /**
   * @TODO 自动评分
   * @param originJson
   * @param testJson
   */
  mdexam.prototype.jsonCheck = function (originJson, testJson) {
    // @TODO 转换成题目索引的字典
    var self = this;
    var questionIndex = {};
    _.each(originJson.questions, function (question) {
      questionIndex[question.question] = question;
    });

    // @TODO 逐个题验证
    _.each(testJson.questions, function (question) {
      question.result = self.judgeCheckFun(questionIndex[question.question], question)
    });

    // @TODO 返回验证的结果
    return testJson
  };

  return mdexam;
}));
