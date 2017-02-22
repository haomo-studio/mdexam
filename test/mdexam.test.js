/**
 * Created by haomo on 17/2/11.
 */
"use strict";
const fs = require('fs');
const path = require('path');
const mdexam = require('../lib/mdexam');

let md = mdexam();


// 测试切分markdown文件
test('Test split exam markdown to question markdown', () => {
  expect(1 + 2).toBe(3);
});

// 测试将选择题转换成JSON
test('Convert multiple choice markdown question to json', () => {
  var mdq = "\
## [选择题] 题目内容\
\n\
#### [标签]\
  * 标签1\
  * 标签2\
\n\
#### [选项] \
  * 选项1\
  * 选项2\
  * 选项3\
\n\
#### [答案]\
  * 选项1\
  * 选项2";

  var qj = md.convertMdQ2J(mdq);
  // console.log(qj);

  expect(qj.type).toBe('multiple-choice');
  expect(qj.question).toBe('题目内容');
  expect(qj.tags.indexOf('标签1')).toBeGreaterThanOrEqual(0);
  expect(qj.tags.indexOf('标签2')).toBeGreaterThanOrEqual(0);

  expect(qj.options.indexOf('选项1')).toBeGreaterThanOrEqual(0);
  expect(qj.options.indexOf('选项2')).toBeGreaterThanOrEqual(0);
  expect(qj.options.indexOf('选项3')).toBeGreaterThanOrEqual(0);

  expect(qj.answers.indexOf('选项1')).toBeGreaterThanOrEqual(0);
  expect(qj.answers.indexOf('选项2')).toBeGreaterThanOrEqual(0);
});

// 测试将多选题转换成JSON
test('Convert fill-in markdown question to json', () => {
  var mdq = "## [填空题] 题目内容\n\
#### [标签]\n\
  * 标签11\n\
  * 标签12\n\
\n\
#### [验证]\n\
  * [answer-regex] /\\*\\s\\[answer-regex\\]\\s{0,}(\\S+)/g";

  var qj = md.convertFillIn2J(mdq);

  expect(qj.type).toBe("fill-in");
  expect(qj.question).toBe('题目内容');
  expect(qj.tags.indexOf('标签11')).toBeGreaterThanOrEqual(0);
  expect(qj.tags.indexOf('标签12')).toBeGreaterThanOrEqual(0);

  expect(qj.checker.length).toBe(1);
  expect(qj.checker[0]['answer-regex']).toBe('/\\*\\s\\[answer-regex\\]\\s{0,}(\\S+)/g');
});

// 测试解析整个markdown文件
test('Convert markdown to json', () => {
  fs.readFile(__dirname + '/exam.md', {flag: 'r+', encoding: 'utf8'}, function (err, markdown) {
    if(err) {
      console.error(err);
      return;
    }

    var qj = md.m2j(markdown);
    console.log(qj);

    expect(qj.title).toBe('试题名称');
    expect(qj.author).toBe('胡小根');
    expect(qj.email).toBe('hxg@haomo-studio.com');
    expect(qj.version).toBe('v1.0.0');
    expect(qj.tags.indexOf('标签1')).toBeGreaterThanOrEqual(0);
    expect(qj.tags.indexOf('标签2')).toBeGreaterThanOrEqual(0);
    expect(qj.tags.indexOf('标签3')).toBeGreaterThanOrEqual(0);
  });
});