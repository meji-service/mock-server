module.exports = {
    print_req: true,
    proxyURL(url) {
        // 自定义代理的服务
        return ' https://rpapi.cppinfo.cn' + url;
    },
}