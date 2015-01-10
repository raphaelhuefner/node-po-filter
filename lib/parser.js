var EventEmitter = require('events').EventEmitter;
var PoFileEntry = require("./po-file-entry");

module.exports = Parser;

/**
 * Creates a parser for parsing a PO file
 * 
 * @constructor
 */
function Parser(){
    EventEmitter.call(this);
    this.currentEntry = new PoFileEntry();
}

// inherit from EventEmitter
Parser.super_ = EventEmitter; // TODO find out if really necessary 
Parser.prototype = Object.create(EventEmitter.prototype, {
    constructor: {
        value: Parser,
        enumerable: false
    }
});

Parser.prototype.connectLexer = function (lexer) {
    var that = this;

    if ('function' == typeof lexer.on) {
        lexer.on('comment',   function (token) { that.handleToken(token); });
        lexer.on('key',       function (token) { that.handleToken(token); });
        lexer.on('string',    function (token) { that.handleToken(token); });
        lexer.on('blankline', function (token) { that.handleToken(token); });
        lexer.on('end',       function ()      { that.handleEnd();        });
    }
};

Parser.prototype.handleToken = function (token) {
    var accepted = this.currentEntry.acceptToken(token);
    if ((! accepted) && this.currentEntry.isValid()) {
        this.emit('entry', this.currentEntry);
        this.currentEntry = new PoFileEntry();
        this.currentEntry.acceptToken(token);
    }
};

Parser.prototype.handleEnd = function () {
    if (this.currentEntry.isValid()) {
        this.emit('entry', this.currentEntry);
        this.emit('end');
        this.currentEntry = null;
        // TODO disconnect from lexer ??
    }
};
