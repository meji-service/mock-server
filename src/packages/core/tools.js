const path = require('path');

exports.replaceLastSlashAndValue = function (url, newValue) {
    // 正则表达式匹配URL末尾的'/'和后面的任何字符（直到URL结束或遇到查询参数）
    // 注意：这个正则表达式不会匹配URL中的查询参数或片段标识符
    var newUrl = path.resolve(url.replace(/((\/|\\)[^(\/|\\)?#]+)?$/, ''), newValue);
    return newUrl;
}