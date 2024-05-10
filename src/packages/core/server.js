const path = require('path');
const { requireMockFile, logger, printInColor } = require('@mock-server/utils');
const getOptions = require('@mock-server/core/options').getOptions;
const axios = require('axios');
const pick = require('lodash/pick');

const axiosInstance = axios.create({

});


function _split(startStr = '', endStr = '') {
    printInColor([
        {
            color: 'cyan',
            text: `\n${startStr}-----------------------------------------------------------------------------------------------------------${endStr}\n`
        }
    ])
}

/**
 * 代理发送
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
async function proxySend(req, res) {
    const options = await getOptions();
    const { originURL } = await useProxyFormats(options, req);
    printInColor([{ color: 'yellow', text: '如果使用本地mock配置文件数据, enabled需要为true' }]);
    printInColor([{ color: 'green', text: '开始代理转发请求：' }, { color: 'cyan', text: originURL }]);
    const interceptors = options?.interceptors;
    try {
        const newReq = await interceptors?.request?.(req);
        const response = await axiosInstance.request({
            method: newReq.method,
            url: originURL,
            params: newReq.query,
            data: newReq.body,
            headers: newReq.formatedHeader,
        });
        printInColor([{ color: 'green', text: 'finish' }]);
        logger(response);
        const newResp = await interceptors?.response?.(response.data);
        return res.status(response.status).send(newResp);
    } catch (reoase) {
        const _status = reoase?.response?.status ?? 500;
        printInColor([{ color: 'red', text: 'error 可观察日志排除错误' }]);
        logger(reoase);
        return res.status(_status).send(pick(reoase?.response ?? {}, ['data'])?.data ?? {});
    }
}

/**
 * 响应 mock 本地ts文件内容
 * @param {*} req 
 * @param {*} res 
 * @param {object} mockOption 
 */
async function readFileSend(req, res, mockOption) {
    const options = await getOptions();
    const response = mockOption.mock(pick(req, ['query', 'body']));
    logger(response);
    function sendResponse() {
        res.status(200).send(response);
        printInColor([{ color: 'magenta', text: 'finish' }]);
    }
    if (options.timeout) {
        setTimeout(sendResponse, options.timeout);
    } else {
        sendResponse();
    }
}

async function useProxyFormats(_options = {}, _req) {
    let originURL = '';
    if (typeof _options.proxyURL === 'function') {
        printInColor([{ color: 'yellow', text: "0.2.14开始proxyURL Function 已经弃用 建议使用 proxyURL Object 配置形式" }]);
        originURL = await _options.proxyURL(_req.url);
    } else {
        const _proxy = _options.proxyURL ?? {};
        originURL = await _proxy.format?.(_req.url, path);
    }
    const _url = new URL(originURL)
    const newURL = `${_url.origin}${_url.pathname}`
    return {
        originURL: newURL,
    }
}

function useHeaders(_options = {}, _req) {
    if (typeof _options.proxyURL === 'function') {
        return _req.headers;
    }
    const { host } = _options.proxyURL ?? {};
    _req.headers['host'] = host;
    return _req.headers;
}

/**
 * mock 服务
 * @param {*} app 
 */
exports.createMockServer = async function (app) {
    const options = await getOptions();
    const { fileWithEnd, mockSrc, cwd } = options;
    app.use(async function (req, res) {
        const pathname = req._parsedUrl.pathname.concat(fileWithEnd);
        const filePath = path.join(cwd, mockSrc, pathname);

        _split('', '>>>');
        try {
            const mockOption = requireMockFile(filePath)?.exports;
            const headers = useHeaders(options, req);
            const formatedHeader = options?.formatHeaders?.(headers) ?? headers;
            req.formatedHeader = formatedHeader;
            if (options.print_req || mockOption?.print_req) {
                logger(pick(req, ['query', 'body', 'headers', 'formatedHeader']));
                console.log('打印req日志完成');
            }
            if (!mockOption?.enabled) {
                printInColor([{ color: 'yellow', text: `本地文件 ${filePath} 查询失败` }]);
                return await proxySend(req, res);
            }
            printInColor([{ color: 'magenta', text: '读取文件: ' }, { color: 'cyan', text: filePath, }]);
            return readFileSend(req, res, mockOption);
        } catch (err) {
            console.log(err);
            logger(err, 'Error');
        }
        _split('', '>>>');
    });
}
