#!/usr/bin/env node

'use strict';
/**
 * Module dependencies.
 */

var fs = require('fs');
var path = require('path');
var mdexam = require('../lib/mdexam');
var program = require('commander');

program.version('0.0.1').option('-m, --markdown <markdown>', '指定的Markdown文件').option('-j, --json <json>', '指定的JSON文件').option('-o, --output <output>', '指定的输出文件').parse(process.argv);

console.log(program.markdown);
console.log(program.output);

var md = mdexam();
if (program.markdown) {
  fs.readFile(program.markdown, { flag: 'r+', encoding: 'utf8' }, function (err, markdown) {
    if (err) {
      console.error(err);
      return;
    }

    var qj = md.m2j(markdown);
    console.log(qj);

    fs.writeFile(path.output, qj, { flag: 'w+', encoding: 'utf8' }, function (err) {
      if (err) {
        console.error(err);
      }
    });
  });
}

if (program.json) {}

//# sourceMappingURL=mdexam-compiled.js.map