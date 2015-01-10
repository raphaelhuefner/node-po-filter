var EventEmitter = require('events').EventEmitter;
module.exports = Lexer;

/**
 * Creates a lexer for tokenizing a PO file
 *
 * @constructor
 */
function Lexer() {
    EventEmitter.call(this);
}

// inherit from EventEmitter
Lexer.super_ = EventEmitter; // TODO find out if really necessary
Lexer.prototype = Object.create(EventEmitter.prototype, {
    constructor: {
        value: Lexer,
        enumerable: false
    }
});

/**
 * @param {Stream} PO file contents as a Stream
 */
Lexer.prototype.connectInStream = function (inStream) {
    var that = this;
    this.escaped = false,
    this.currentNode = null,
    this.state = this.states.none;

    if ('function' == typeof inStream.on) {
        inStream.on('data', function (data) { that.handleData(data); });
        inStream.on('end', function () { that.handleEnd(); });
        inStream.on('error', function (error) { that.handleEnd(error); });
        inStream.on('close', function () { that.handleEnd; });
    }
}

Lexer.prototype.handleData = function (chunk) {
    if (chunk instanceof Buffer) {
        chunk = chunk.toString("utf8");
    }
    this.lexChunk(chunk);
}

Lexer.prototype.handleEnd = function (error) {
    // TODO also, let our listeners know when this.state != this.states.none
    this.emit('end');
}

/**
 * State constants for parsing FSM
 */
Lexer.prototype.states = {
    none: 0x01,
    whitespace: 0x02,
    comment: 0x03,
    key: 0x04,
    string: 0x05
};

/**
 * Value types for lexer
 */
Lexer.prototype.types = {
    comment: 'comment',
    key: 'key',
    string: 'string',
    whitespace: 'whitespace',
    blankline: 'blankline'
};

/**
 * String matches for lexer
 */
Lexer.prototype.symbols = {
    quotes: /['"]/,
    comment: /\#/,
    whitespace: /\s/,
    key: /[\w\-\[\]]/
};

/**
 * Lexer for tokenizing the input PO file into a stream of typed tokens
 *
 * @param {String} PO file content chunks
 */
Lexer.prototype.lexChunk = function (chunk) {
    var chr;

    for (var i = 0, len = chunk.length; i<len; i++) {
        chr = chunk.charAt(i);
        switch (this.state) {
            case this.states.none:
                if (chr.match(this.symbols.quotes)) {
                    this.currentNode = {
                        type: this.types.string,
                        value: "",
                        quote: chr
                    };
                    this.state = this.states.string;
                } else if (chr.match(this.symbols.comment)) {
                    this.currentNode = {
                        type: this.types.comment,
                        value: ""
                    };
                    this.state = this.states.comment;
                } else if (chr.match(this.symbols.whitespace)) {
                    this.currentNode = {
                        type: this.types.whitespace,
                        value: chr
                    };
                    this.state = this.states.whitespace;
                } else {
                    this.currentNode = {
                        type: this.types.key,
                        value: chr
                    };
                    this.state = this.states.key;
                }
                break;
            case this.states.whitespace:
                if (chr.match(this.symbols.whitespace)) {
                    this.currentNode.value += chr;
                } else {
                    this.state = this.states.none;
                    this.emit(this.currentNode.type, this.currentNode);
                    if (this.currentNode.value.match(/\n\s*?\n/)) {
                        this.emit(this.types.blankline, {type: this.types.blankline, value: this.currentNode.value});
                    }
                    i--;
                }
                break;
            case this.states.comment:
                if (chr == "\n") {
                    this.state = this.states.none;
                    this.emit(this.currentNode.type, this.currentNode);
                } else if (chr != "\r") {
                    this.currentNode.value += chr;
                }
                break;
            case this.states.string:
                if (this.escaped) {
                    if (chr == "n") {
                        this.currentNode.value += "\n";
                    } else if (chr == "r") {
                        this.currentNode.value += "\r";
                    } else if (chr == "t") {
                        this.currentNode.value += "\t";
                    } else {
                        this.currentNode.value += chr;
                    }
                    this.escaped = false;
                } else {
                    if (chr == this.currentNode.quote) {
                        this.state = this.states.none;
                        this.emit(this.currentNode.type, this.currentNode);
                    } else if (chr == "\\") {
                        this.escaped = true;
                        break;
                    } else {
                        this.currentNode.value += chr;
                    }
                    this.escaped = false;
                }
                break;
            case this.states.key:
                if (!chr.match(this.symbols.key)) {
                    this.state = this.states.none;
                    this.emit(this.currentNode.type, this.currentNode);
                    i--;
                } else {
                    this.currentNode.value += chr;
                }
                break;
        }
    }
};
