module.exports = guessCharset;

/**
 * Detects the charset for a PO file.
 * Uses the first msgstr value as the header.
 */
function guessCharset(str) {
    var pos, headers = str, charset = "iso-8859-1", match;
    
    if((pos = str.search(/^\s*msgid/im))>=0){
        if((pos = pos+str.substr(pos+5).search(/^\s*(msgid|msgctxt)/im))){
            headers = str.substr(0, pos);
        }
    }
    
    if((match = headers.match(/[; ]charset\s*=\s*([\w\-]+)(?:[\s;]|\\n)*"\s*$/mi))){
        charset = (match[1] || "iso-8859-1").toString().
                    replace(/^utf(\d+)$/i, "utf-$1").
                    toLowerCase().trim();
    }
    
    return charset;
}

