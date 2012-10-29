var fs = require('fs');
var Lexer = require('./lib/lexer.js');
var filename = process.argv[2];
var lexer = null;
var inStream = null;

inStream = fs.createReadStream(filename, {encoding: 'utf-8'});
lexer = new Lexer();

lexer.on('end', function () {
  console.log('caught end event');
  process.exit(0);
});

lexer.on('comment', function (node) {
  console.log('caught comment event');
  console.log(node);
});

lexer.on('string', function (node) {
  console.log('caught string event');
  console.log(node);
});

lexer.on('key', function (node) {
  console.log('caught key event');
  console.log(node);
});

lexer.connectInStream(inStream);


