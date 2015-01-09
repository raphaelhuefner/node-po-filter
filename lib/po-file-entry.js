module.exports = PoFileEntry;

function PoFileEntry() {
    this.comments = [];
    this.fields = {};
    this.lastSeenKey = null;
}

PoFileEntry.prototype.hasNoFieldsYet = function () {
    return (null == this.lastSeenKey);
};

PoFileEntry.prototype.hasNoFieldWithKey = function (key) {
    return (undefined == this.fields[key]);
};

PoFileEntry.prototype.isAcceptingComment = function () {
    return this.hasNoFieldsYet();
};

PoFileEntry.prototype.isAcceptingKey = function (key) {
    return (
        this.hasNoFieldsYet()
        ||
        (
            this.hasFieldWithStrings(this.lastSeenKey)
            &&
            this.hasNoFieldWithKey(key)
        )
    );
};

PoFileEntry.prototype.isAcceptingString = function () {
    return (null != this.lastSeenKey) && (this.fields[this.lastSeenKey]);
};

PoFileEntry.prototype.acceptToken = function (token) {
    switch (token.type) {
        case 'comment':
            return this.acceptComment(token.value);
        case 'key':
            return this.acceptKey(token.value);
        case 'string':
            return this.acceptString({value: token.value, quote: token.quote});
    }
    return false;
};

PoFileEntry.prototype.acceptComment = function (comment) {
    if (this.isAcceptingComment()) {
        this.comments.push(comment);
        return true;
    }
    return false;
};

PoFileEntry.prototype.acceptKey = function (key) {
    if (this.isAcceptingKey(key)) {
        this.fields[key] = {key: key, strings: []};
        this.lastSeenKey = key;
        return true;
    }
    return false;
};

PoFileEntry.prototype.acceptString = function (string) {
    if (this.isAcceptingString()) {
        this.fields[this.lastSeenKey].strings.push(string);
        return true;
    }
    return false;
};

PoFileEntry.prototype.isValid = function (nplurals) {
    nplurals = nplurals ? nplurals : 1;
    return this.isValidSingular() || this.isValidPlural(nplurals);
};

PoFileEntry.prototype.isValidSingular = function () {
    if (! this.hasFieldWithStrings('msgid')) return false;
    if (! this.hasFieldWithStrings('msgstr')) return false;
    return true;
};

PoFileEntry.prototype.isValidPlural = function (nplurals) {
    nplurals = nplurals ? nplurals : 1;
    if (! this.hasFieldWithStrings('msgid')) return false;
    if (! this.hasFieldWithStrings('msgid_plural')) return false;
    for (var i = 0; i < nplurals; i++) {
        if (! this.hasFieldWithStrings('msgstr[' + i + ']')) return false;
    }
    return true;
};

PoFileEntry.prototype.hasFieldWithStrings = function (key) {
    return (this.fields[key]) && (0 < this.fields[key].strings.length);
};

PoFileEntry.prototype.getSimpleData = function () {
    return {}; // TODO implement
};

PoFileEntry.prototype.getDetailedData = function () {
    return []; // TODO implement
};

PoFileEntry.prototype.getNativeData = function () {
    return {comments: this.comments, fields: this.fields};
};

PoFileEntry.prototype.getFieldValue = function (fieldname) {
  return this.hasFieldWithStrings(fieldname) ? this.fields[fieldname].strings.join('') : null;
};

PoFileEntry.prototype.getComments = function (symbol) {
  var foundComments = [];
  for (var i = 0; i < this.comments.length; i++) {
    if (symbol != this.comments[i].substr(0, 1)) {
      foundComments.push(this.comments[i].substr(1).trim());
    }
  }
  return foundComments;
};

// static "class" functions

PoFileEntry.formatNativeData = function (data) {
    var output = '';
    var potentialFields = ['msgctxt', 'msgid', 'msgid_plural', 'msgstr'];
    for (var i = 0; i < data.comments.length; i++) {
        output += '#' + data.comments[i] + "\n";
    }
    for (var i = 0; i < potentialFields.length; i++) {
        var fieldname = potentialFields[i];
        if (data.fields[fieldname]) {
            output += fieldname + ' ';
            output += PoFileEntry.formatNativeStrings(data.fields[fieldname].strings);
        }
    }
    var pluralCounter = 0;
    var fieldname = 'msgstr[0]';
    while (data.fields[fieldname]) {
      output += fieldname + ' ';
      output += PoFileEntry.formatNativeStrings(data.fields[fieldname].strings);
      pluralCounter++;
      fieldname = 'msgstr[' + pluralCounter + ']';
    }
    return output;
};

PoFileEntry.formatNativeStrings = function (strings, quoteDefault) {
    quoteDefault = quoteDefault ? quoteDefault : '"';
    var output = '';
    for (var i = 0; i < strings.length; i++) {
        var quote = strings[i].quote ? strings[i].quote : quoteDefault;
        output += quote + PoFileEntry.escapeString(strings[i].value, quote) + quote + "\n";
    }
    return output;
};

PoFileEntry.escapeString = function (string, quote) {
    string = string.replace(/\\/g, '\\\\');
    string = string.replace(/\n/g, '\\n');
    string = string.replace(/\r/g, '\\r');
    string = string.replace(/\t/g, '\\t');
    string = string.replace(new RegExp(quote, 'g'), '\\' + quote);
    return string;
};

