
function usePathRewrite(pathRewrite, url) {
    for (let key in pathRewrite) {
        const matchRegExp = new RegExp(key);
        if (matchRegExp.test(url)) {
            return url.replace(matchRegExp, pathRewrite[key]);
        }
    }
    return url;
}

function defineProxy(proxyConfig, url) {
    for (let key in proxyConfig) {
        let { target, pathRewrite } = proxyConfig[key];
        if (new RegExp(key).test(url)) {
            let newUrl = usePathRewrite(pathRewrite, url);
            return `${target}${newUrl}`
        }
    }
    return url;
}

module.exports = {
    defineProxy,
}