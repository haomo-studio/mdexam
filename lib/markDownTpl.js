(function (){
  var markDownTpl = "# 试题名称\n\
#### [作者] <%- paper.author%>\n\
#### [邮箱] <%- paper.email%>\n\
#### [版本] <%- paper.version%>\n\
#### [标签]\n\
<% _.forEach(paper.tags, function(tag) { %>\
* <%- tag %>\n\
<% }); %>\n\
\n\
<% _.forEach(paper.questions, function(question) { %>\
<% if(question.type=='multiple-choice') { %>\
## [选择题] <%- question.question %>\n\
#### [标签]\n\
<% _.forEach(question.tags, function(tag) { %>\
* <%- tag %>\n\
<% }); %>\n\
#### [选项]\n\
<% _.forEach(question.options, function(option) { %>\
* <%- option %>\n\
<% }); %>\n\
#### [答案]\n\
<% _.forEach(question.answers, function(answer) { %>\
* <%- answer %>\n\
<% }); %>\n\
<% } %>\
<% if(question.type=='fill-in') { %>\
## [填空题] <%- question.question %>\n\
#### [标签]\n\
<% _.forEach(question.tags, function(tag) { %>\
* <%- tag %>\n\
<% }); %>\n\
#### [答案]  <%- question.answer %>\n\
\n\
#### [验证]\n\
<% _.forEach(question.checker, function(checker) { %>\
* [answer-regex] <%- checker['answer-regex'] %>\n\
<% }); %>\n\
<% } %>\
<% if(question.type=='cmd-fill-in') { %>\
## [命令题] <%- question.question %>\n\
#### [标签]\n\
<% _.forEach(question.tags, function(tag) { %>\
* <%- tag %>\n\
<% }); %>\n\
#### [答案]  <%- question.answer %>\n\
\n\
#### [验证]\n\
<% _.forEach(question.checker, function(checker) { %>\
<% if(checker['answer-regex']){ %>\
* [answer-regex] <%- checker['answer-regex'] %>\n\
<% } %>\
<% if(checker['output-regex']){ %>\
* [output-regex] <%- checker['output-regex'] %>\n\
<% } %>\
<% }); %>\n\
<% } %>\
<% }); %>";
  return markDownTpl;
});

