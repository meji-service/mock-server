
module.exports = {
    print_req: true,
    // proxyURL(url) {
    //     // 自定义代理的服务
    //     return 'https://rpapi.cppinfo.cn' + url;
    //     // return 'http://219.133.29.31/chache-java' + url;
    // },
    proxyURL: {
        origin: 'http://192.168.0.146/admin',
        async format(api, path) {
            return (path.join(this.origin, api));
        }
    },
    formatHeaders(headers) {
        return headers;
    },
}