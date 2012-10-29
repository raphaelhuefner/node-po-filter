var fs = require('fs');
var util = require('util');
var Lexer = require('./lib/lexer.js');
var Parser = require('./lib/parser.js');
var PoFileEntry = require('./lib/po-file-entry.js');
var filename = process.argv[2];
var lexer = null;
var parser = null;
var inStream = null;

inStream = fs.createReadStream(filename, {encoding: 'utf-8'});
lexer = new Lexer();
parser = new Parser();

function isAdmin(entry) {
  for (var i = 0; i < entry.comments.length; i++) {
    if (null != entry.comments[i].match(/^: \/(de\/|en\/)?admin/)) {
      return true;
    }
  }
  return false;
}

parser.on('entry', function (entry) {
  if (! isAdmin(entry)) {
    console.log(PoFileEntry.formatNativeData(entry));
  }
});

parser.on('end', function () {
  process.exit(0);
});


parser.connectLexer(lexer);

lexer.connectInStream(inStream);


