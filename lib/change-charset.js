var Iconv = require("iconv").Iconv;

module.exports = changeCharsetToUtf8;

/**
 * Re-code a string from given charset to utf8.
 */
function changeCharsetToUtf8(buffer, charset){
    if (charset != "utf-8") {
        var iconv = new Iconv(charset, "UTF-8//TRANSLIT//IGNORE");
        return iconv.convert((buffer || "")).toString("utf-8");
    } else {
        return (buffer || "").toString("utf-8");
    }
}

