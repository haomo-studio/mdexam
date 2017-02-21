/**
 * Created by haomo on 17/2/11.
 */
const mdexam = require('../lib/mdexam');

// 测试切分markdown文件
test('Test split exam markdown to question markdown', () => {
  expect(1 + 2).toBe(3);
});

// 测试将选择题转换成JSON
test('Convert multiple choice markdown question to json', () => {
  var mdq = "\
## [选择题] 题目2内容\
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
  * 选项2\
  ";

  var md = mdexam();
  var qj = md.convertMdQ2J(mdq);
  // console.log(qj);

  expect(qj.type).toBe('multiple-choice');
  expect(qj.question).toBe('题目2内容');
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

});