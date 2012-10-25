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

