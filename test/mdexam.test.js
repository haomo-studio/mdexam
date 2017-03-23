/**
 * Created by haomo on 17/2/11.
 */
"use strict";
const fs = require('fs');
const path = require('path');
const mdexam = require('../lib/mdexam');

let md = mdexam();

test('测试将选择题转换成JSON', () => {
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

  expect(qj.answer.indexOf('选项1')).toBeGreaterThanOrEqual(0);
  expect(qj.answer.indexOf('选项2')).toBeGreaterThanOrEqual(0);
});

test('测试将填空题转换成JSON', () => {
  var mdq = "## [填空题] 题目内容\n\
#### [标签]\n\
  * 标签11\n\
  * 标签12\n\
\n\
#### [答案]\n\
* 正确答案或者用户的回答\n\
\
#### [验证]\n\
  * [answer-regex] /\\*\\s\\[answer-regex\\]\\s{0,}(\\S+)/g";

  var qj = md.convertFillIn2J(mdq);

  expect(qj.type).toBe("fill-in");
  expect(qj.question).toBe('题目内容');
  expect(qj.answer).toBe('正确答案或者用户的回答');
  expect(qj.tags.indexOf('标签11')).toBeGreaterThanOrEqual(0);
  expect(qj.tags.indexOf('标签12')).toBeGreaterThanOrEqual(0);

  expect(qj.checker.length).toBe(1);
  expect(qj.checker[0]['answer-regex']).toBe('/\\*\\s\\[answer-regex\\]\\s{0,}(\\S+)/g');
});

test('测试将命令题转换成JSON', () => {
  var mdq = "## [命令题] 题目内容\n\
#### [标签]\n\
  * 标签11\n\
  * 标签12\n\
\n\
#### [答案]\n\
* 正确答案或者用户的回答\n\
\
#### [验证]\n\
  * [answer-regex] /\\*\\s\\[answer-regex\\]\\s{0,}(\\S+)/g\n\
  * [output-regex] /\\*\\s\\[output-regex\\]\\s{0,}(\\S+)/g";

  var qj = md.convertCmd2J(mdq);

  expect(qj.type).toBe("cmd-fill-in");
  expect(qj.question).toBe('题目内容');
  expect(qj.answer).toBe('正确答案或者用户的回答');
  expect(qj.tags.indexOf('标签11')).toBeGreaterThanOrEqual(0);
  expect(qj.tags.indexOf('标签12')).toBeGreaterThanOrEqual(0);

  expect(qj.checker.length).toBe(2);
  expect(qj.checker[0]['answer-regex']).toBe('/\\*\\s\\[answer-regex\\]\\s{0,}(\\S+)/g');
  expect(qj.checker[1]['output-regex']).toBe('/\\*\\s\\[output-regex\\]\\s{0,}(\\S+)/g');
});

test('测试解析整个markdown文件', () => {
  var markdown = fs.readFileSync(__dirname + '/exam.md', {flag: 'r+', encoding: 'utf8'});

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

test('测试自动评价选择题', () => {
  var originQj = {
    "type": "multiple-choice",
    "question": "题目内容",
    "tags": [
      "标签11",
      "标签12"
    ],
    "options": [
      "A",
      "B",
      "C"
    ],
    "answers": [
      "A",
      "B"
    ]
  };

  var testQj1 = {
    "type": "multiple-choice",
    "question": "题目内容",
    "tags": [
      "标签11",
      "标签12"
    ],
    "options": [
      "A",
      "B",
      "C"
    ],
    "answers": [
      "A",
      "B"
    ]
  };

  var testQj2 = {
    "type": "multiple-choice",
    "question": "题目内容",
    "tags": [
      "标签11",
      "标签12"
    ],
    "options": [
      "A",
      "B",
      "C"
    ],
    "answers": [
      "A"
    ]
  };

  var testQj3 = {
    "type": "multiple-choice",
    "question": "题目内容",
    "tags": [
      "标签11",
      "标签12"
    ],
    "options": [
      "A",
      "B",
      "C"
    ],
    "answers": [
      "A",
      "C"
    ]
  };

  expect(md.checkChoice(originQj, testQj1)).toBe(true);
  // expect(md.checkChoice(originQj, testQj2)).toBe(false);
  // expect(md.checkChoice(originQj, testQj3)).toBe(false);
});

test('测试自动评价填空题', () => {
  var originQj = {
    "type": "fill-in",
    "question": "1 + 1 = ?",
    "answer": "2",
    "tags": [
      "标签11",
      "标签12"
    ],
    "checker": [
      {
        "answer-regex": "/^2$/"
      }
    ]
  };

  var testQj1 = {
    "type": "fill-in",
    "question": "题目内容",
    "answer": "2",
    "tags": [
      "标签11",
      "标签12"
    ]
  };

  var testQj2 = {
    "type": "fill-in",
    "question": "题目内容",
    "answer": "3",
    "tags": [
      "标签11",
      "标签12"
    ]
  };

  expect(md.checkFillIn(originQj, testQj1)).toBe(true);
  expect(md.checkFillIn(originQj, testQj2)).toBe(false);
});

test('测试自动评价命令题', () => {
  var originQj = {
    "type": "cmd-fill-in",
    "question": "请用一行命令杀死所有包含进程中包含字符串node的命令",
    "answer": "kill -9 `ps -ef|grep node|awk '{print $2}'`",
    "tags": [
      "标签11",
      "标签12"
    ],
    "checker": [
      {
        "answer-regex": "/grep/"
      },
      {
        "output-regex": "/abc/g"
      }
    ]
  };

  var testQj1 = {
    "type": "cmd-fill-in",
    "question": "请用一行命令杀死所有包含进程中包含字符串node的命令",
    "answer": "kill -9 `ps -ef|grep node|awk '{print $2}'`",
    "tags": [
      "标签11",
      "标签12"
    ]
  };

  var testQj2 = {
    "type": "cmd-fill-in",
    "question": "请用一行命令杀死所有包含进程中包含字符串node的命令",
    "answer": "kill -9 `ps -ef|awk '{print $2}'`",
    "tags": [
      "标签11",
      "标签12"
    ]
  };

  var testQj3 = {
    "type": "cmd-fill-in",
    "question": "请用一行命令杀死所有包含进程中包含字符串node的命令",
    "answer": "我不知道",
    "tags": [
      "标签11",
      "标签12"
    ]
  };

  expect(md.checkCmdFillIn(originQj, testQj1)).toBe(true);
  expect(md.checkCmdFillIn(originQj, testQj2)).toBe(false);
  expect(md.checkCmdFillIn(originQj, testQj3)).toBe(false);
});