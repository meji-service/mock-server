
module.exports = {
    print_req: true,
    // proxyURL(url) {
    //     // 自定义代理的服务
    //     return 'https://rpapi.cppinfo.cn' + url;
    //     // return 'http://219.133.29.31/chache-java' + url;
    // },
    proxyURL: {
        // origin: 'https://rpapi.cppinfo.cn',
        origin: 'http://113.108.106.175:81',
        async format(api) {
            // URL 
            return this.origin + api;
        }
    },
    formatHeaders(headers) {
        return headers;
    }
}